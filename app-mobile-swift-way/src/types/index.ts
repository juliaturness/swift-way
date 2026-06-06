// ─────────────────────────────────────────────────────────────────────────────
// ENUMS / UNIONS
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'DRIVER' | 'CARRIER' | 'ADMIN';

export type DriverStatus = 'available' | 'busy' | 'offline';

export type DocumentStatus = 'approved' | 'pending' | 'rejected';
export type DocumentType = 'CNH' | 'CRLV' | 'MOPP' | 'INSURANCE' | 'OTHER';

export type CargoStatus = 'pending' | 'matched' | 'in_transit' | 'delivered' | 'cancelled';
export type CargoPriority = 'high' | 'medium' | 'low';

export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type NotificationType = 'offer' | 'status' | 'document' | 'system';

// ─────────────────────────────────────────────────────────────────────────────
// AUTH  (espelha AuthDtos.java do backend)
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/v1/auth/register */
export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;

  // campos obrigatórios para DRIVER
  fullName?: string;
  cpf?: string;
  phone?: string;
  cnhNumber?: string;
  cnhCategory?: string;
  cnhValidity?: string; // ISO: "YYYY-MM-DD"

  // campos obrigatórios para CARRIER
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
}

/** POST /api/v1/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /api/v1/auth/refresh */
export interface RefreshRequest {
  refreshToken: string;
}

/** POST /api/v1/auth/logout */
export interface LogoutRequest {
  refreshToken: string;
}

/** Resposta de qualquer endpoint de auth */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // segundos
}

// ─────────────────────────────────────────────────────────────────────────────
// USUÁRIO BASE  (campos que existem na entidade User do backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: UserRole;
  enabled: boolean;
  createdAt: string; // ISO datetime
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFIL DE MOTORISTA  (entidade Driver do backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface DriverProfile {
  id: string;
  user: User;
  fullName: string;
  cpf: string;        // armazenado sem máscara no backend
  phone: string;
  cnhNumber: string;
  cnhCategory: string;
  cnhValidity: string; // ISO date
  available: boolean;  // campo `available` do backend
  grApproved: boolean; // campo `grApproved` do backend

  // campos extras do lado mobile (vindos de endpoints futuros / calculados)
  avatarUrl?: string;
  status?: DriverStatus;
  rating?: number;
  totalTrips?: number;
  approvalRate?: number;
  monthlyEarnings?: number;
  vehicles?: Vehicle[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFIL DE TRANSPORTADORA  (entidade Carrier do backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface CarrierProfile {
  id: string;
  user: User;
  cnpj: string;       // armazenado sem máscara no backend
  razaoSocial: string;
  nomeFantasia?: string;
  telefone: string;
  avatarUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// VEÍCULO
// ─────────────────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  type: string;
  plate: string;
  year: string;
  model: string;
  brand: string;
  status: 'active' | 'maintenance' | 'inactive';
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
// CARGA
// ─────────────────────────────────────────────────────────────────────────────

export interface Cargo {
  id: number;
  origin: string;
  originCity: string;
  originState: string;
  destination: string;
  destinationCity: string;
  destinationState: string;
  weight: string;
  vehicleType: string;
  status: CargoStatus;
  pickupDate: string;
  deliveryDate?: string;
  priority: CargoPriority;
  price: string;
  distance: string;
  description?: string;
  carrier: string;
  carrierId: string;
}

export interface CargoOffer extends Cargo {
  matchScore: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIAGEM
// ─────────────────────────────────────────────────────────────────────────────

export interface GeoLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  address?: string;
}

export interface Trip {
  id: number;
  origin: string;
  destination: string;
  status: TripStatus;
  cargo: string;
  cargoId: number;
  carrier: string;
  carrierId: string;
  startDate: string;
  endDate?: string;
  payment: string;
  progress?: number;
  currentLocation?: GeoLocation;
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
// RESPOSTAS GENÉRICAS DE API
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTADOS GLOBAIS
// ─────────────────────────────────────────────────────────────────────────────

export interface AppState {
  isLoading: boolean;
  isOnline: boolean;
  theme: 'light' | 'dark';
}

/**
 * Estado de autenticação usado no AuthContext.
 * `profile` pode ser DriverProfile ou CarrierProfile dependendo do role.
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profile: DriverProfile | CarrierProfile | null;
  accessToken: string | null;
}