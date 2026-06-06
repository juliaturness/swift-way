import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CargoOffer, Trip, Document, Notification, Settings } from '../types';

// Chaves do AsyncStorage
const ACCEPTED_CARGOS_KEY = '@vapt_vupt:accepted_cargos';
const SETTINGS_KEY = '@vapt_vupt:settings';
const NOTIFICATIONS_KEY = '@vapt_vupt:notifications';

// Dados mock
const mockOffers: CargoOffer[] = [
  {
    id: 1,
    origin: 'Florianópolis, SC',
    originCity: 'Florianópolis',
    originState: 'SC',
    destination: 'Curitiba, PR',
    destinationCity: 'Curitiba',
    destinationState: 'PR',
    weight: '2.5 ton',
    vehicleType: 'Caminhão Baú',
    status: 'pending',
    pickupDate: '25/04/2026',
    priority: 'high',
    price: 'R$ 3.500,00',
    distance: '300 km',
    carrier: 'Transportadora Central',
    carrierId: '1',
    matchScore: 95,
  },
  {
    id: 2,
    origin: 'São José, SC',
    originCity: 'São José',
    originState: 'SC',
    destination: 'Joinville, SC',
    destinationCity: 'Joinville',
    destinationState: 'SC',
    weight: '1.8 ton',
    vehicleType: 'Van',
    status: 'pending',
    pickupDate: '26/04/2026',
    priority: 'medium',
    price: 'R$ 1.200,00',
    distance: '120 km',
    carrier: 'Log Express',
    carrierId: '2',
    matchScore: 88,
  },
  {
    id: 3,
    origin: 'Palhoça, SC',
    originCity: 'Palhoça',
    originState: 'SC',
    destination: 'Porto Alegre, RS',
    destinationCity: 'Porto Alegre',
    destinationState: 'RS',
    weight: '4.0 ton',
    vehicleType: 'Caminhão Baú',
    status: 'pending',
    pickupDate: '27/04/2026',
    priority: 'high',
    price: 'R$ 4.800,00',
    distance: '450 km',
    carrier: 'Rota Sul',
    carrierId: '3',
    matchScore: 92,
  },
  {
    id: 4,
    origin: 'Biguaçu, SC',
    originCity: 'Biguaçu',
    originState: 'SC',
    destination: 'Blumenau, SC',
    destinationCity: 'Blumenau',
    destinationState: 'SC',
    weight: '1.2 ton',
    vehicleType: 'Van',
    status: 'pending',
    pickupDate: '28/04/2026',
    priority: 'low',
    price: 'R$ 800,00',
    distance: '80 km',
    carrier: 'Vale Transporte',
    carrierId: '4',
    matchScore: 78,
  },
];

const mockTrips: Trip[] = [
  {
    id: 1234,
    origin: 'Palhoça, SC',
    destination: 'Joinville, SC',
    status: 'in_progress',
    cargo: 'Materiais de Construção',
    cargoId: 5,
    carrier: 'Transportadora Central',
    carrierId: '1',
    startDate: '24/04/2026',
    payment: 'R$ 2.400,00',
    progress: 65,
  },
  {
    id: 1233,
    origin: 'Florianópolis, SC',
    destination: 'Curitiba, PR',
    status: 'completed',
    cargo: 'Equipamentos Eletrônicos',
    cargoId: 6,
    carrier: 'Log Express',
    carrierId: '2',
    startDate: '20/04/2026',
    endDate: '21/04/2026',
    payment: 'R$ 3.500,00',
  },
  {
    id: 1235,
    origin: 'São José, SC',
    destination: 'Porto Alegre, RS',
    status: 'scheduled',
    cargo: 'Alimentos Perecíveis',
    cargoId: 7,
    carrier: 'Rota Sul',
    carrierId: '3',
    startDate: '30/04/2026',
    payment: 'R$ 4.200,00',
  },
  {
    id: 1232,
    origin: 'Biguaçu, SC',
    destination: 'Blumenau, SC',
    status: 'completed',
    cargo: 'Móveis',
    cargoId: 8,
    carrier: 'Vale Transporte',
    carrierId: '4',
    startDate: '18/04/2026',
    endDate: '18/04/2026',
    payment: 'R$ 800,00',
  },
];

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'CNH - Categoria E',
    type: 'CNH',
    status: 'approved',
    uploadDate: '10/01/2026',
    expiryDate: '15/08/2028',
    size: '2.4 MB',
  },
  {
    id: '2',
    name: 'CRLV - ABC-1234',
    type: 'CRLV',
    status: 'approved',
    uploadDate: '12/01/2026',
    expiryDate: '30/12/2026',
    size: '1.8 MB',
  },
  {
    id: '3',
    name: 'CRLV - XYZ-5678',
    type: 'CRLV',
    status: 'pending',
    uploadDate: '20/04/2026',
    expiryDate: '30/12/2026',
    size: '1.9 MB',
  },
  {
    id: '4',
    name: 'Curso MOPP',
    type: 'MOPP',
    status: 'approved',
    uploadDate: '05/02/2026',
    expiryDate: '05/02/2031',
    size: '3.2 MB',
  },
  {
    id: '5',
    name: 'Apólice de Seguro',
    type: 'INSURANCE',
    status: 'pending',
    uploadDate: '25/04/2026',
    expiryDate: '25/04/2027',
    size: '1.1 MB',
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'offer',
    title: 'Nova Oferta de Carga',
    message: 'Uma nova carga para Curitiba está disponível com 95% de match!',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'document',
    title: 'Documento Aprovado',
    message: 'Sua CNH foi aprovada com sucesso.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    type: 'status',
    title: 'Viagem Concluída',
    message: 'Parabéns! A viagem #1233 foi concluída com sucesso.',
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const defaultSettings: Settings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  newOffers: true,
  statusUpdates: true,
  documentAlerts: true,
  twoFactorAuth: false,
  sessionTimeout: '30',
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
};

interface CargoContextType {
  offers: CargoOffer[];
  trips: Trip[];
  documents: Document[];
  notifications: Notification[];
  settings: Settings;
  activeTrip: Trip | null;
  isLoading: boolean;
  
  // Ofertas
  acceptOffer: (offerId: number) => Promise<boolean>;
  declineOffer: (offerId: number) => Promise<boolean>;
  refreshOffers: () => Promise<void>;
  
  // Viagens
  updateTripProgress: (tripId: number, progress: number) => void;
  completeTrip: (tripId: number) => Promise<boolean>;
  
  // Documentos
  uploadDocument: (doc: Partial<Document>) => Promise<boolean>;
  deleteDocument: (docId: string) => Promise<boolean>;
  
  // Notificações
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  
  // Configurações
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

interface CargoProviderProps {
  children: ReactNode;
}

export function CargoProvider({ children }: CargoProviderProps) {
  const [offers, setOffers] = useState<CargoOffer[]>(mockOffers);
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      const savedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Viagem ativa
  const activeTrip = trips.find((t) => t.status === 'in_progress') || null;

  // Aceitar oferta
  const acceptOffer = async (offerId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const offer = offers.find((o) => o.id === offerId);
      if (!offer) return false;
      
      // Remover da lista de ofertas
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      
      // Adicionar como viagem agendada
      const newTrip: Trip = {
        id: Date.now(),
        origin: offer.origin,
        destination: offer.destination,
        status: 'scheduled',
        cargo: `Carga #${offer.id}`,
        cargoId: offer.id,
        carrier: offer.carrier,
        carrierId: offer.carrierId,
        startDate: offer.pickupDate,
        payment: offer.price,
      };
      
      setTrips((prev) => [newTrip, ...prev]);
      
      // Adicionar notificação
      const notification: Notification = {
        id: String(Date.now()),
        type: 'status',
        title: 'Oferta Aceita',
        message: `Você aceitou a oferta para ${offer.destination}. A viagem foi agendada.`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notification, ...prev]);
      
      return true;
    } catch (error) {
      console.error('Erro ao aceitar oferta:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Recusar oferta
  const declineOffer = async (offerId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      return true;
    } catch (error) {
      console.error('Erro ao recusar oferta:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar ofertas
  const refreshOffers = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Em produção, buscar da API
      // const response = await api.getOffers();
      // setOffers(response.data);
      
      // Por enquanto, apenas simula refresh
      setOffers(mockOffers);
    } catch (error) {
      console.error('Erro ao atualizar ofertas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar progresso da viagem
  const updateTripProgress = (tripId: number, progress: number) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, progress: Math.min(100, progress) } : t))
    );
  };

  // Completar viagem
  const completeTrip = async (tripId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId
            ? { ...t, status: 'completed', progress: 100, endDate: new Date().toLocaleDateString('pt-BR') }
            : t
        )
      );
      
      // Adicionar notificação
      const notification: Notification = {
        id: String(Date.now()),
        type: 'status',
        title: 'Viagem Concluída',
        message: `Parabéns! A viagem #${tripId} foi concluída com sucesso.`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notification, ...prev]);
      
      return true;
    } catch (error) {
      console.error('Erro ao completar viagem:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload de documento
  const uploadDocument = async (doc: Partial<Document>): Promise<boolean> => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const newDoc: Document = {
        id: String(Date.now()),
        name: doc.name || 'Documento',
        type: doc.type || 'OTHER',
        status: 'pending',
        uploadDate: new Date().toLocaleDateString('pt-BR'),
        expiryDate: doc.expiryDate,
        size: '1.5 MB',
      };
      
      setDocuments((prev) => [newDoc, ...prev]);
      
      // Adicionar notificação
      const notification: Notification = {
        id: String(Date.now()),
        type: 'document',
        title: 'Documento Enviado',
        message: `O documento "${newDoc.name}" foi enviado e está em análise.`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notification, ...prev]);
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Deletar documento
  const deleteDocument = async (docId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      return true;
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar notificação como lida
  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  // Marcar todas como lidas
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Limpar notificações
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Atualizar configurações
  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  return (
    <CargoContext.Provider
      value={{
        offers,
        trips,
        documents,
        notifications,
        settings,
        activeTrip,
        isLoading,
        acceptOffer,
        declineOffer,
        refreshOffers,
        updateTripProgress,
        completeTrip,
        uploadDocument,
        deleteDocument,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        updateSettings,
      }}
    >
      {children}
    </CargoContext.Provider>
  );
}

export function useCargo() {
  const context = useContext(CargoContext);
  if (context === undefined) {
    throw new Error('useCargo must be used within a CargoProvider');
  }
  return context;
}
