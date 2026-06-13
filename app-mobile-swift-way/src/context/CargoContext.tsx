import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cargoApi, offerApi, CargoResponse, OfferResponse } from '../lib/api';
import {
  CargoOffer, CargoResponse as CargoResponseType, Trip, TripCargo,
  TripStatus, Document, Notification, Settings,
} from '../types';

const SETTINGS_KEY      = '@swiftway:settings';
const NOTIFICATIONS_KEY = '@swiftway:notifications';

// ─────────────────────────────────────────────────────────────────────────────
// Converters — traduz DTOs do backend para os tipos do frontend
// ─────────────────────────────────────────────────────────────────────────────

/**
 * OfferResponse (GET /offers) → CargoOffer
 * O id da oferta fica em CargoOffer.id (usado em accept/decline).
 */
function offerToCargoOffer(o: OfferResponse): CargoOffer {
  const c = o.cargo;
  return {
    id:               o.id,
    cargoId:          o.cargoId,
    origin:           c ? `${c.origemCidade}, ${c.origemEstado}` : '—',
    originCity:       c?.origemCidade   ?? '—',
    originState:      c?.origemEstado   ?? '—',
    destination:      c ? `${c.destinoCidade}, ${c.destinoEstado}` : '—',
    destinationCity:  c?.destinoCidade  ?? '—',
    destinationState: c?.destinoEstado  ?? '—',
    weight:           c?.pesoKg         ?? 0,
    vehicleType:      c?.tipo           ?? '—',
    tipo:             (c?.tipo          ?? 'OUTROS') as CargoOffer['tipo'],
    pickupDate:       c?.dataColetaLimite
      ? new Date(c.dataColetaLimite).toLocaleDateString('pt-BR')
      : '—',
    deliveryDate:     c?.dataEntregaPrevista
      ? new Date(c.dataEntregaPrevista).toLocaleDateString('pt-BR')
      : undefined,
    price:            c?.valorCarga
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.valorCarga)
      : 'R$ 0,00',
    distance:         String(o.distanciaKm ?? 0),
    matchScore:       Math.round(o.matchScore),
    status:           o.status,
    expiresAt:        o.expiraEm,
    carrier:          c?.carrier?.nomeFantasia ?? c?.carrier?.razaoSocial ?? '—',
    carrierId:        c?.carrier?.id           ?? '—',
    description:      c?.descricao,
  };
}

/**
 * OfferResponse aceita → Trip
 * O backend não tem endpoint de trips separado ainda,
 * então construímos a trip a partir da oferta aceita.
 */
function acceptedOfferToTrip(o: OfferResponse): Trip {
  const c = o.cargo;
  const cargo: TripCargo = {
    id:          o.cargoId,
    origin:      { city: c?.origemCidade ?? '—', state: c?.origemEstado ?? '—' },
    destination: { city: c?.destinoCidade ?? '—', state: c?.destinoEstado ?? '—' },
    weight:      c?.pesoKg     ?? 0,
    price:       c?.valorCarga ?? 0,
    distance:    o.distanciaKm ?? 0,
    pickupDate:  c?.dataColetaLimite ? new Date(c.dataColetaLimite) : new Date(),
    tipo:        (c?.tipo ?? 'OUTROS') as TripCargo['tipo'],
  };

  return {
    id:        o.id,        // offerId — serve como tripId
    status:    'accepted',
    cargo,
    startDate: new Date(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapeamento de status backend → frontend (para trips vindas do PATCH /status)
// ─────────────────────────────────────────────────────────────────────────────

const CARGO_STATUS_MAP: Record<string, TripStatus> = {
  AGUARDANDO:        'pending',
  MATCHING:          'pending',
  OFERTA_ENVIADA:    'pending',
  MOTORISTA_ALOCADO: 'accepted',
  EM_TRANSITO:       'in_transit',
  ENTREGUE:          'delivered',
  CANCELADO:         'cancelled',
};

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

  // Ofertas
  acceptOffer:    (offerId: string) => Promise<boolean>;
  declineOffer:   (offerId: string, motivo?: string) => Promise<boolean>;
  refreshOffers:  () => Promise<void>;
  loadMoreOffers: () => Promise<void>;

  // Viagens
  refreshTrips:     () => Promise<void>;
  updateTripStatus: (tripId: string, status: TripStatus) => Promise<void>;

  // Cargo por ID (para tela de detalhes)
  getCargoById: (id: string) => Promise<CargoResponseType | null>;

  // Documentos
  uploadDocument: (doc: Partial<Document>) => Promise<boolean>;
  deleteDocument: (docId: string) => Promise<boolean>;

  // Notificações
  markNotificationRead:     (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications:       () => void;

  // Configurações
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

  useEffect(() => {
    loadSavedData();
    fetchOffers(0, true);
  }, []);

  // ── Dados locais ──────────────────────────────────────────────────────────

  const loadSavedData = async () => {
    try {
      const [rawSettings, rawNotifications] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEY),
        AsyncStorage.getItem(NOTIFICATIONS_KEY),
      ]);
      if (rawSettings)      setSettings(JSON.parse(rawSettings));
      if (rawNotifications) setNotifications(JSON.parse(rawNotifications));
    } catch (e) {
      console.error('[CargoContext] loadSavedData error:', e);
    }
  };

  // ── Notificações internas ─────────────────────────────────────────────────

  const pushNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
  ) => {
    const newNotif: Notification = {
      id:        String(Date.now()),
      type, title, message,
      read:      false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      // persiste assincronamente sem bloquear o render
      AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated)).catch(console.warn);
      return updated;
    });
  }, []);

  // ── Ofertas ───────────────────────────────────────────────────────────────

  const fetchOffers = useCallback(async (page: number, reset = false) => {
    try {
      setIsLoading(true);
      const res  = await offerApi.listMyOffers(page, 20);
      const next = res.content.map(offerToCargoOffer);
      setOffers(prev => reset ? next : [...prev, ...next]);
      setCurrentPage(page);
      setHasMoreOffers(!res.last);
    } catch (e) {
      console.error('[CargoContext] fetchOffers error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshOffers = useCallback(() => fetchOffers(0, true), [fetchOffers]);

  const loadMoreOffers = useCallback((): Promise<void> => {
    if (!isLoading && hasMoreOffers) return fetchOffers(currentPage + 1);
    return Promise.resolve();
  }, [isLoading, hasMoreOffers, currentPage, fetchOffers]);

  // ── Accept ────────────────────────────────────────────────────────────────

  const acceptOffer = async (offerId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const accepted = await offerApi.accept(offerId);

      // Remove da lista de ofertas
      setOffers(prev => prev.filter(o => o.id !== offerId));

      // Cria a trip a partir da oferta aceita
      const newTrip = acceptedOfferToTrip(accepted);
      setTrips(prev => [newTrip, ...prev]);

      pushNotification(
        'status',
        'Oferta Aceita!',
        `Viagem de ${newTrip.cargo.origin.city} → ${newTrip.cargo.destination.city} agendada.`,
      );
      return true;
    } catch (e: any) {
      console.error('[CargoContext] acceptOffer error:', e);
      pushNotification('system', 'Erro ao aceitar', e?.message ?? 'Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Decline ───────────────────────────────────────────────────────────────

  const declineOffer = async (offerId: string, motivo?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await offerApi.decline(offerId, motivo ? { motivoRecusa: motivo } : undefined);
      setOffers(prev => prev.filter(o => o.id !== offerId));
      return true;
    } catch (e) {
      console.error('[CargoContext] declineOffer error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Trips ─────────────────────────────────────────────────────────────────

  /**
   * Por enquanto o backend não expõe GET /trips para o motorista.
   * As trips são geradas localmente a partir das ofertas aceitas.
   * Quando o endpoint existir, substituir aqui.
   */
  const refreshTrips = useCallback(async () => {
    // TODO: implementar GET /trips quando o endpoint existir
    // Por ora apenas re-busca as ofertas aceitas pendentes
    await fetchOffers(0, true);
  }, [fetchOffers]);

  /**
   * Atualiza o status de uma trip localmente.
   * Quando o backend tiver PATCH /trips/{id}/status, chamar aqui.
   */
  const updateTripStatus = async (tripId: string, status: TripStatus): Promise<void> => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      const updates: Partial<Trip> = { status };
      if (status === 'in_transit') updates.startDate = new Date();
      if (status === 'delivered' || status === 'completed') updates.endDate = new Date();
      return { ...t, ...updates };
    }));

    // Notifica o motorista sobre a mudança de status
    const statusLabels: Partial<Record<TripStatus, string>> = {
      in_transit: 'Viagem iniciada — boa viagem!',
      unloading:  'Aguardando descarregamento.',
      delivered:  'Entrega concluída com sucesso!',
      completed:  'Viagem encerrada.',
    };
    const msg = statusLabels[status];
    if (msg) pushNotification('status', 'Status atualizado', msg);
  };

  // ── Cargo por ID ──────────────────────────────────────────────────────────

  const getCargoById = async (id: string): Promise<CargoResponseType | null> => {
    try {
      return await cargoApi.getById(id);
    } catch (e) {
      console.error('[CargoContext] getCargoById error:', e);
      return null;
    }
  };

  // ── Documentos ────────────────────────────────────────────────────────────

  const uploadDocument = async (doc: Partial<Document>): Promise<boolean> => {
    try {
      setIsLoading(true);
      // TODO: chamar endpoint de documentos quando disponível no backend
      await new Promise(r => setTimeout(r, 1500));
      const newDoc: Document = {
        id:         String(Date.now()),
        name:       doc.name       ?? 'Documento',
        type:       doc.type       ?? 'OTHER',
        status:     'pending',
        uploadDate: new Date().toLocaleDateString('pt-BR'),
        expiryDate: doc.expiryDate,
        size:       '—',
      };
      setDocuments(prev => [newDoc, ...prev]);
      pushNotification('document', 'Documento enviado', `"${newDoc.name}" está em análise.`);
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
      // TODO: chamar DELETE /documents/{id} quando disponível
      await new Promise(r => setTimeout(r, 500));
      setDocuments(prev => prev.filter(d => d.id !== docId));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Notificações ──────────────────────────────────────────────────────────

  const markNotificationRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllNotificationsRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const clearNotifications = () => setNotifications([]);

  // ── Configurações ─────────────────────────────────────────────────────────

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeTrip = trips.find(t =>
    ['accepted', 'in_transit', 'loading', 'unloading'].includes(t.status)
  ) ?? null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <CargoContext.Provider value={{
      offers, trips, documents, notifications, settings,
      activeTrip, isLoading, hasMoreOffers,
      acceptOffer, declineOffer, refreshOffers, loadMoreOffers,
      refreshTrips, updateTripStatus,
      getCargoById,
      uploadDocument, deleteDocument,
      markNotificationRead, markAllNotificationsRead, clearNotifications,
      updateSettings,
    }}>
      {children}
    </CargoContext.Provider>
  );
}

export function useCargo() {
  const ctx = useContext(CargoContext);
  if (!ctx) throw new Error('useCargo must be used within a CargoProvider');
  return ctx;
}