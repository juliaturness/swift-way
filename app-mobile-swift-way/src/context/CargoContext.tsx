import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offerApi, OfferResponse } from '../lib/api';
import { CargoOffer, Trip, Document, Notification, Settings } from '../types';

const SETTINGS_KEY      = '@vapt_vupt:settings';
const NOTIFICATIONS_KEY = '@vapt_vupt:notifications';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: converte OfferResponse (backend) → CargoOffer (frontend)
// ─────────────────────────────────────────────────────────────────────────────

function offerToCargoOffer(o: OfferResponse): CargoOffer {
  const c = o.cargo;
  return {
    id: o.id as unknown as number, // CargoOffer.id é number; aqui guardamos o UUID como cast
    origin:           c ? `${c.origemCidade}, ${c.origemEstado}` : '—',
    originCity:       c?.origemCidade  ?? '—',
    originState:      c?.origemEstado  ?? '—',
    destination:      c ? `${c.destinoCidade}, ${c.destinoEstado}` : '—',
    destinationCity:  c?.destinoCidade ?? '—',
    destinationState: c?.destinoEstado ?? '—',
    weight:           c ? `${c.pesoKg} kg` : '—',
    vehicleType:      c?.tipo ?? '—',
    status:           'pending',
    pickupDate:       c?.dataColetaLimite
      ? new Date(c.dataColetaLimite).toLocaleDateString('pt-BR')
      : '—',
    deliveryDate: c?.dataEntregaPrevista
      ? new Date(c.dataEntregaPrevista).toLocaleDateString('pt-BR')
      : undefined,
    priority:    'medium',
    price:       c ? `R$ ${c.valorCarga.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—',
    distance:    `${o.distanciaKm.toFixed(0)} km`,
    description: c?.descricao,
    carrier:     c?.carrier?.razaoSocial ?? c?.carrier?.nomeFantasia ?? '—',
    carrierId:   c?.carrier?.id ?? '—',
    matchScore:  Math.round(o.matchScore),
    // guarda o UUID original para usar nas chamadas accept/decline
    _offerId:    o.id,
  } as CargoOffer & { _offerId: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────

const defaultSettings: Settings = {
  emailNotifications: true,
  pushNotifications:  true,
  smsNotifications:   false,
  newOffers:          true,
  statusUpdates:      true,
  documentAlerts:     true,
  twoFactorAuth:      false,
  sessionTimeout:     '30',
  language:           'pt-BR',
  timezone:           'America/Sao_Paulo',
};

// ─────────────────────────────────────────────────────────────────────────────
// Tipos do contexto
// ─────────────────────────────────────────────────────────────────────────────

interface CargoContextType {
  offers:        CargoOffer[];
  trips:         Trip[];
  documents:     Document[];
  notifications: Notification[];
  settings:      Settings;
  activeTrip:    Trip | null;
  isLoading:     boolean;
  hasMoreOffers: boolean;

  acceptOffer:  (offerId: number | string) => Promise<boolean>;
  declineOffer: (offerId: number | string, motivo?: string) => Promise<boolean>;
  refreshOffers: () => Promise<void>;
  loadMoreOffers: () => Promise<void>;

  updateTripProgress: (tripId: number, progress: number) => void;
  completeTrip:       (tripId: number) => Promise<boolean>;

  uploadDocument: (doc: Partial<Document>) => Promise<boolean>;
  deleteDocument: (docId: string)          => Promise<boolean>;

  markNotificationRead:    (id: string) => void;
  markAllNotificationsRead: ()          => void;
  clearNotifications:       ()          => void;

  updateSettings: (s: Partial<Settings>) => Promise<void>;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function CargoProvider({ children }: { children: ReactNode }) {
  const [offers,        setOffers]        = useState<CargoOffer[]>([]);
  const [trips,         setTrips]         = useState<Trip[]>([]);
  const [documents,     setDocuments]     = useState<Document[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings,      setSettings]      = useState<Settings>(defaultSettings);
  const [isLoading,     setIsLoading]     = useState(false);
  const [currentPage,   setCurrentPage]   = useState(0);
  const [hasMoreOffers, setHasMoreOffers] = useState(true);

  // mapa de offerId (UUID) para cada CargoOffer — necessário para accept/decline
  const [offerIdMap, setOfferIdMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadSavedData();
    fetchOffers(0, true);
  }, []);

  const loadSavedData = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    } catch (e) {
      console.error('Erro ao carregar dados locais:', e);
    }
  };

  // ── Busca de ofertas ─────────────────────────────────────────────────────

  const fetchOffers = useCallback(async (page: number, reset = false) => {
    try {
      setIsLoading(true);
      const res = await offerApi.listMyOffers(page, 20);

      const newOffers = res.content.map(offerToCargoOffer);

      // atualiza o mapa uuid → id numérico (usamos o índice como fallback)
      setOfferIdMap(prev => {
        const next = new Map(prev);
        res.content.forEach(o => {
          next.set(String((offerToCargoOffer(o) as any)._offerId ?? o.id), o.id);
        });
        return next;
      });

      setOffers(prev => reset ? newOffers : [...prev, ...newOffers]);
      setCurrentPage(page);
      setHasMoreOffers(!res.last);
    } catch (e) {
      console.error('Erro ao buscar ofertas:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshOffers  = useCallback(() => fetchOffers(0, true), [fetchOffers]);
  const loadMoreOffers = useCallback(() => {
    if (!isLoading && hasMoreOffers) return fetchOffers(currentPage + 1);
    return Promise.resolve();
  }, [isLoading, hasMoreOffers, currentPage, fetchOffers]);

  // Resolve o UUID real da oferta a partir do id numérico ou UUID direto
  const resolveOfferId = (offerId: number | string): string => {
    const key = String(offerId);
    return offerIdMap.get(key) ?? key;
  };

  // ── Accept ───────────────────────────────────────────────────────────────

  const acceptOffer = async (offerId: number | string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const uuid = resolveOfferId(offerId);
      const accepted = await offerApi.accept(uuid);

      // remove da lista de ofertas
      setOffers(prev => prev.filter(o => String((o as any)._offerId ?? o.id) !== uuid));

      // cria viagem local a partir dos dados retornados
      if (accepted.cargo) {
        const c = accepted.cargo;
        const newTrip: Trip = {
          id:        Date.now(),
          origin:    `${c.origemCidade}, ${c.origemEstado}`,
          destination: `${c.destinoCidade}, ${c.destinoEstado}`,
          status:    'scheduled',
          cargo:     `Carga #${c.id}`,
          cargoId:   0,
          carrier:   c.carrier?.razaoSocial ?? '—',
          carrierId: c.carrier?.id ?? '—',
          startDate: new Date(c.dataColetaLimite).toLocaleDateString('pt-BR'),
          payment:   `R$ ${c.valorCarga.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        };
        setTrips(prev => [newTrip, ...prev]);
      }

      pushNotification('status', 'Oferta Aceita',
        `Você aceitou a oferta. A viagem foi agendada.`);

      return true;
    } catch (e: any) {
      console.error('Erro ao aceitar oferta:', e);
      pushNotification('system', 'Erro', e?.message ?? 'Não foi possível aceitar a oferta.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Decline ──────────────────────────────────────────────────────────────

  const declineOffer = async (offerId: number | string, motivo?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const uuid = resolveOfferId(offerId);
      await offerApi.decline(uuid, motivo ? { motivoRecusa: motivo } : undefined);

      setOffers(prev => prev.filter(o => String((o as any)._offerId ?? o.id) !== uuid));
      return true;
    } catch (e: any) {
      console.error('Erro ao recusar oferta:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Trips ────────────────────────────────────────────────────────────────

  const activeTrip = trips.find(t => t.status === 'in_progress') ?? null;

  const updateTripProgress = (tripId: number, progress: number) => {
    setTrips(prev =>
      prev.map(t => t.id === tripId ? { ...t, progress: Math.min(100, progress) } : t)
    );
  };

  const completeTrip = async (tripId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setTrips(prev =>
        prev.map(t =>
          t.id === tripId
            ? { ...t, status: 'completed', progress: 100, endDate: new Date().toLocaleDateString('pt-BR') }
            : t
        )
      );
      pushNotification('status', 'Viagem Concluída',
        `Parabéns! A viagem #${tripId} foi concluída com sucesso.`);
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Documents ────────────────────────────────────────────────────────────

  const uploadDocument = async (doc: Partial<Document>): Promise<boolean> => {
    try {
      setIsLoading(true);
      // TODO: substituir por chamada real quando o endpoint de documentos existir
      await new Promise(r => setTimeout(r, 1500));
      const newDoc: Document = {
        id:         String(Date.now()),
        name:       doc.name ?? 'Documento',
        type:       doc.type ?? 'OTHER',
        status:     'pending',
        uploadDate: new Date().toLocaleDateString('pt-BR'),
        expiryDate: doc.expiryDate,
        size:       '1.5 MB',
      };
      setDocuments(prev => [newDoc, ...prev]);
      pushNotification('document', 'Documento Enviado',
        `"${newDoc.name}" foi enviado e está em análise.`);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (docId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // TODO: substituir por chamada real quando o endpoint existir
      await new Promise(r => setTimeout(r, 500));
      setDocuments(prev => prev.filter(d => d.id !== docId));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Notifications ────────────────────────────────────────────────────────

  const pushNotification = (
    type: Notification['type'],
    title: string,
    message: string,
  ) => {
    const n: Notification = {
      id:        String(Date.now()),
      type,
      title,
      message,
      read:      false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [n, ...prev]);
  };

  const markNotificationRead    = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllNotificationsRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const clearNotifications = () => setNotifications([]);

  // ── Settings ─────────────────────────────────────────────────────────────

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <CargoContext.Provider value={{
      offers, trips, documents, notifications, settings,
      activeTrip, isLoading, hasMoreOffers,
      acceptOffer, declineOffer, refreshOffers, loadMoreOffers,
      updateTripProgress, completeTrip,
      uploadDocument, deleteDocument,
      markNotificationRead, markAllNotificationsRead, clearNotifications,
      updateSettings,
    }}>
      {children}
    </CargoContext.Provider>
  );
}

export function useCargo() {
  const context = useContext(CargoContext);
  if (!context) throw new Error('useCargo must be used within a CargoProvider');
  return context;
}