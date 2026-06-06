import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api/v1';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS AUTH  (espelha AuthDtos.java)
// ─────────────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'DRIVER' | 'CARRIER';
  fullName?: string;
  cpf?: string;
  phone?: string;
  cnhNumber?: string;
  cnhCategory?: string;
  cnhValidity?: string;
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
}

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

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS OFFER  (espelha OfferDtos.java)
// ─────────────────────────────────────────────────────────────────────────────

export type OfferStatus = 'ENVIADA' | 'ACEITA' | 'RECUSADA' | 'EXPIRADA' | 'CANCELADA';

export interface OfferCarrierSummary {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
}

export interface OfferCargo {
  id: string;
  origemCidade: string;
  origemEstado: string;
  origemEndereco?: string;
  destinoCidade: string;
  destinoEstado: string;
  destinoEndereco?: string;
  pesoKg: number;
  valorCarga: number;        // em reais
  dataColetaLimite: string;  // ISO datetime
  dataEntregaPrevista?: string;
  tipo: string;
  descricao?: string;
  carrier: OfferCarrierSummary;
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

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DeclineOfferRequest {
  motivoRecusa?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP CLIENT
// ─────────────────────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  authenticated = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authenticated) {
    const token = await AsyncStorage.getItem('@access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json();

  if (!res.ok) {
    // Spring Boot retorna { message, status } em erros
    throw new Error(data?.message ?? `HTTP ${res.status}`);
  }

  return data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: RegisterRequest) =>
    request<TokenResponse>('POST', '/auth/register', body),

  login: (body: LoginRequest) =>
    request<TokenResponse>('POST', '/auth/login', body),

  refresh: (body: RefreshRequest) =>
    request<TokenResponse>('POST', '/auth/refresh', body),

  logout: (body: LogoutRequest) =>
    request<void>('POST', '/auth/logout', body),
};

// ─────────────────────────────────────────────────────────────────────────────
// OFFER API  (espelha OfferController.java)
// ─────────────────────────────────────────────────────────────────────────────

export const offerApi = {
  /**
   * GET /api/v1/offers
   * Feed do motorista autenticado — ofertas com status ENVIADA, mais recentes primeiro.
   * Requer role DRIVER.
   */
  listMyOffers: (page = 0, size = 20) =>
    request<PageResponse<OfferResponse>>(
      'GET',
      `/offers?page=${page}&size=${size}`,
      undefined,
      true,
    ),

  /**
   * POST /api/v1/offers/{id}/accept
   * Efeitos colaterais no backend: carga → MOTORISTA_ALOCADO; demais ofertas → CANCELADA.
   * Requer role DRIVER.
   */
  accept: (offerId: string) =>
    request<OfferResponse>('POST', `/offers/${offerId}/accept`, undefined, true),

  /**
   * POST /api/v1/offers/{id}/decline
   * motivoRecusa é opcional.
   * Requer role DRIVER.
   */
  decline: (offerId: string, body?: DeclineOfferRequest) =>
    request<OfferResponse>('POST', `/offers/${offerId}/decline`, body ?? null, true),
};