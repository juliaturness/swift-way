// Tipos de Usuário
export type UserType = 'driver' | 'carrier' | 'admin';

export type DriverStatus = 'available' | 'busy' | 'offline';

// Usuário/Motorista
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  avatarUrl?: string;
  userType: UserType;
  createdAt: string;
}

export interface Driver extends User {
  cnhNumber: string;
  cnhCategory: string;
  cnhExpiry: string;
  status: DriverStatus;
  rating: number;
  totalTrips: number;
  approvalRate: number;
  monthlyEarnings: number;
  vehicles: Vehicle[];
}

// Veículo
export interface Vehicle {
  id: string;
  type: string;
  plate: string;
  year: string;
  model: string;
  brand: string;
  status: 'active' | 'maintenance' | 'inactive';
}

// Documento
export type DocumentStatus = 'approved' | 'pending' | 'rejected';

export interface Document {
  id: string;
  name: string;
  type: 'CNH' | 'CRLV' | 'MOPP' | 'INSURANCE' | 'OTHER';
  status: DocumentStatus;
  uploadDate: string;
  expiryDate?: string;
  size: string;
  fileUrl?: string;
}

// Carga
export type CargoStatus = 'pending' | 'matched' | 'in_transit' | 'delivered' | 'cancelled';
export type CargoPriority = 'high' | 'medium' | 'low';

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

// Oferta de Carga
export interface CargoOffer extends Cargo {
  matchScore: number;
}

// Viagem
export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

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
  currentLocation?: Location;
}

// Localização
export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  address?: string;
}

// Notificação
export type NotificationType = 'offer' | 'status' | 'document' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// Configurações
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

// Tipos de Navegação
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  CargoDetails: { cargoId: number };
  OfferDetails: { offerId: number };
  TripDetails: { tripId: number };
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

// Respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Estado do App
export interface AppState {
  isLoading: boolean;
  isOnline: boolean;
  theme: 'light' | 'dark';
}

// Estado de Auth
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Driver | null;
  token: string | null;
}
