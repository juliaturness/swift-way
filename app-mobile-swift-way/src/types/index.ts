// ─────────────────────────────────────────────────────────────────────────────
// ENUMS / UNIONS
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'DRIVER' | 'CARRIER' | 'ADMIN';

export type DriverStatus = 'available' | 'busy' | 'offline';

export type DocumentStatus = 'approved' | 'pending' | 'rejected';
export type DocumentType = 'CNH' | 'CRLV' | 'MOPP' | 'INSURANCE' | 'OTHER';

// Status do backend (Java enum CargoStatus)
export type CargoStatusBackend =
  | 'AGUARDANDO'
  | 'MATCHING'
  | 'OFERTA_ENVIADA'
  | 'MOTORISTA_ALOCADO'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'CANCELADO';

// Alias frontend — mantido para compatibilidade com componentes existentes
export type CargoStatus = CargoStatusBackend;

export type CargoTipo = 'CARGA_SECA' | 'REFRIGERADA' | 'PERIGOSA' | 'GRANEL' | 'OUTROS';
export type CargoPriority = 'high' | 'medium' | 'low';

// Status de oferta (backend OfferStatus)
export type OfferStatus = 'ENVIADA' | 'ACEITA' | 'RECUSADA' | 'EXPIRADA' | 'CANCELADA';

// Status de viagem (frontend — mapeado a partir do status de cargo/offer)
export type TripStatus =
  | 'pending'
  | 'accepted'
  | 'in_transit'
  | 'loading'
  | 'unloading'
  | 'delivered'
  | 'cancelled'
  | 'completed';

export type NotificationType = 'offer' | 'status' | 'document' | 'system';

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export type RegisterRequest =
  | {
      email: string;
      password: string;
      role: 'DRIVER';
      fullName: string;
      cpf: string;
      phone: string;
      cnhNumber: string;
      cnhCategory: string;
      cnhValidity: string; // ISO: "YYYY-MM-DD"
    }
  | {
      email: string;
      password: string;
      role: 'CARRIER';
      cnpj: string;
      razaoSocial: string;
      nomeFantasia?: string;
      telefone: string;
    }
  | {
      email: string;
      password: string;
      role: 'ADMIN';
    };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// USUÁRIO BASE
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// VEÍCULO  (espelha VehicleResponse do backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  tipo: string;   // backend usa "tipo", não "type"
  placa: string;  // backend usa "placa", não "plate"
  ano: number;
  modelo: string;
  marca: string;
  hasTracker: boolean;
  active: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFIL DE MOTORISTA  (espelha DriverResponse do backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface DriverProfile {
  id: string;
  email: string;
  fullName: string;
  cpf: string;
  phone: string;
  cnhNumber: string;
  cnhCategory: string;
  cnhValidity: string;
  available: boolean;
  grApproved: boolean;
  averageRating: number;
  latitude?: number;
  longitude?: number;
  avatarUrl?: string;
  vehicles: Vehicle[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFIL DE TRANSPORTADORA
// ─────────────────────────────────────────────────────────────────────────────

export interface CarrierProfile {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  telefone: string;
  avatarUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTO
// ─────────────────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  uploadDate: string;
  expiryDate?: string;
  size: string;
  fileUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARRIER SUMMARY  (embutido nas respostas de cargo/offer)
// ─────────────────────────────────────────────────────────────────────────────

export interface CargoCarrierSummary {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARGO  (espelha CargoResponse e CargoSummaryResponse do backend)
// ─────────────────────────────────────────────────────────────────────────────

/** Versão completa — retornada por GET /cargos/{id} */
export interface CargoResponse {
  id: string;
  carrier: CargoCarrierSummary;
  vehicleTypeId: number;
  origemCidade: string;
  origemEstado: string;
  origemEndereco?: string;
  destinoCidade: string;
  destinoEstado: string;
  destinoEndereco?: string;
  tipo: CargoTipo;
  descricao?: string;
  pesoKg: number;
  valorCarga: number;
  dataColetaLimite: string;
  dataEntregaPrevista?: string;
  requerEscolta: boolean;
  requerRastreador: boolean;
  requerIscaEletronica: boolean;
  requerAprovacaoGr: boolean;
  observacoes?: string;
  status: CargoStatusBackend;
  createdAt: string;
}

/** Versão resumida — retornada na listagem paginada */
export interface CargoSummaryResponse {
  id: string;
  origemCidade: string;
  origemEstado: string;
  destinoCidade: string;
  destinoEstado: string;
  pesoKg: number;
  valorCarga: number;
  dataColetaLimite: string;
  status: CargoStatusBackend;
  tipo: CargoTipo;
  carrier: CargoCarrierSummary;
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFER  (espelha OfferResponse do backend)
// ─────────────────────────────────────────────────────────────────────────────

/** Cargo embutido dentro de OfferResponse */
export interface OfferCargo {
  id: string;
  origemCidade: string;
  origemEstado: string;
  origemEndereco?: string;
  destinoCidade: string;
  destinoEstado: string;
  destinoEndereco?: string;
  pesoKg: number;
  valorCarga: number;
  dataColetaLimite: string;
  dataEntregaPrevista?: string;
  tipo: string;
  descricao?: string;
  carrier: CargoCarrierSummary;
}

export interface OfferResponse {
  id: string;
  cargoId: string;
  driverId: string;
  status: OfferStatus;
  matchScore: number;
  distanciaKm: number;
  expiraEm: string;
  createdAt: string;
  cargo?: OfferCargo;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARGO OFFER  (tipo usado internamente pelo CargoContext / OfferCard)
// Normaliza OfferResponse para o formato que os componentes esperam
// ─────────────────────────────────────────────────────────────────────────────

export interface CargoOffer {
  // identificador da oferta (usado em accept/decline)
  id: string;

  // campos mapeados de OfferCargo para exibição
  origin: string;        // origemCidade + origemEstado
  destination: string;   // destinoCidade + destinoEstado
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;

  carrier: string;       // razaoSocial ou nomeFantasia
  carrierId: string;

  weight: number;        // pesoKg
  price: string;         // valorCarga formatado (R$)
  distance: string;      // distanciaKm formatado (km)
  matchScore: number;

  vehicleType: string;
  tipo: CargoTipo;
  pickupDate: string;    // dataColetaLimite
  deliveryDate?: string; // dataEntregaPrevista

  status: OfferStatus;
  expiresAt: string;     // expiraEm

  // raw para telas de detalhe
  cargoId: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIP  (viagem — mapeada a partir de cargo alocado)
// ─────────────────────────────────────────────────────────────────────────────

export interface TripCargo {
  id: string;
  origin: { city: string; state: string };
  destination: { city: string; state: string };
  weight: number;
  price: number;
  distance: number;
  pickupDate: Date;
  tipo: CargoTipo;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  address?: string;
}

export interface Trip {
  id: string;             // offerId que foi aceita
  status: TripStatus;
  cargo: TripCargo;
  startDate?: Date;
  endDate?: Date;
  currentLocation?: GeoLocation;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÕES
// ─────────────────────────────────────────────────────────────────────────────

export interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  newOffers: boolean;
  statusUpdates: boolean;
  documentAlerts: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: string;
  language: string;
  timezone: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  CargoDetails: { cargoId: string };
  OfferDetails: { offerId: string };
  TripDetails: { tripId: string };
  TripHistory: undefined;
  DocumentUpload: undefined;
  EditProfile: undefined;
  AddVehicle: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Offers: undefined;
  Trips: undefined;
  Profile: undefined;
  Settings: undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTADOS GLOBAIS
// ─────────────────────────────────────────────────────────────────────────────

export interface AppState {
  isLoading: boolean;
  isOnline: boolean;
  theme: 'light' | 'dark';
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profile: DriverProfile | CarrierProfile | null;
  accessToken: string | null;
}