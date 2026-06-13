import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8082/api/v1';

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export interface TokenResponse  { accessToken: string; refreshToken: string; expiresIn: number; }
export interface LoginRequest   { email: string; password: string; }
export interface RefreshRequest { refreshToken: string; }
export interface LogoutRequest  { refreshToken: string; }

export type RegisterRequest =
  | { email: string; password: string; role: 'DRIVER'; fullName: string; cpf: string; phone: string; cnhNumber: string; cnhCategory: string; cnhValidity: string }
  | { email: string; password: string; role: 'CARRIER'; cnpj: string; razaoSocial: string; nomeFantasia?: string; telefone: string }
  | { email: string; password: string; role: 'ADMIN' };

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER  (espelha DriverDtos.java)
// ─────────────────────────────────────────────────────────────────────────────

export interface VehicleResponse {
  id: string;
  tipo: string;
  placa: string;
  ano: number;
  modelo: string;
  marca: string;
  hasTracker: boolean;
  active: boolean;
}

export interface DriverResponse {
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
  vehicles: VehicleResponse[];
}

export interface UpdateAvailabilityRequest { available: boolean; }
export interface UpdateLocationRequest     { latitude: number; longitude: number; }

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT  (espelha DocumentDtos.java)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tipos aceitos pelo backend (DocumentType enum Java).
 * Devem ser enviados como string no @RequestPart("type").
 */
export type DocumentType = 'CNH' | 'CRLV' | 'MOPP' | 'INSURANCE' | 'OTHER';

/**
 * Status retornado pelo backend após upload/validação.
 */
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Shape de DocumentResponse retornado pelo backend.
 * Campos inferidos do controller + convenção do projeto.
 * Ajuste se o DTO real diferir.
 */
export interface DocumentResponse {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  /** ISO date string "YYYY-MM-DD" — null se não informado no upload */
  validade?: string;
  /** UUID do veículo associado, se aplicável */
  vehicleId?: string;
  /** URL para download do arquivo armazenado */
  fileUrl?: string;
  /**
   * Data/hora do upload — ISO 8601 datetime string, ex: "2025-06-08T14:30:00Z".
   * Para exibir só a data, use createdAt.split('T')[0].
   */
  createdAt: string;
}

/**
 * IMPORTANTE: este DocumentStatus usa MAIÚSCULAS para corresponder ao enum Java
 * (PENDING / APPROVED / REJECTED). O tipo em types.ts usa minúsculas e está
 * desatualizado — sempre importe DocumentStatus daqui (lib/api.ts).
 */

/**
 * Parâmetros para o upload multipart.
 * O arquivo em si é passado separadamente como File/Blob.
 */
export interface UploadDocumentParams {
  type: DocumentType;
  vehicleId?: string;   // UUID string
  validade?: string;    // "YYYY-MM-DD"
}

// ─────────────────────────────────────────────────────────────────────────────
// CARGO
// ─────────────────────────────────────────────────────────────────────────────

export type CargoStatusBackend = 'AGUARDANDO' | 'MATCHING' | 'OFERTA_ENVIADA' | 'MOTORISTA_ALOCADO' | 'EM_TRANSITO' | 'ENTREGUE' | 'CANCELADO';
export type CargoTipo = 'CARGA_SECA' | 'REFRIGERADA' | 'PERIGOSA' | 'GRANEL' | 'OUTROS';

export interface CargoCarrierSummary { id: string; razaoSocial: string; nomeFantasia?: string; }

export interface CargoResponse {
  id: string; carrier: CargoCarrierSummary; vehicleTypeId: number;
  origemCidade: string; origemEstado: string; origemEndereco?: string;
  destinoCidade: string; destinoEstado: string; destinoEndereco?: string;
  tipo: CargoTipo; descricao?: string; pesoKg: number; valorCarga: number;
  dataColetaLimite: string; dataEntregaPrevista?: string;
  requerEscolta: boolean; requerRastreador: boolean;
  requerIscaEletronica: boolean; requerAprovacaoGr: boolean;
  observacoes?: string; status: CargoStatusBackend; createdAt: string;
}

export interface CargoSummaryResponse {
  id: string; origemCidade: string; origemEstado: string;
  destinoCidade: string; destinoEstado: string;
  pesoKg: number; valorCarga: number; dataColetaLimite: string;
  status: CargoStatusBackend; tipo: CargoTipo; carrier: CargoCarrierSummary;
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFER
// ─────────────────────────────────────────────────────────────────────────────

export type OfferStatus = 'ENVIADA' | 'ACEITA' | 'RECUSADA' | 'EXPIRADA' | 'CANCELADA';

export interface OfferCargo {
  id: string; origemCidade: string; origemEstado: string; origemEndereco?: string;
  destinoCidade: string; destinoEstado: string; destinoEndereco?: string;
  pesoKg: number; valorCarga: number; dataColetaLimite: string;
  dataEntregaPrevista?: string; tipo: string; descricao?: string;
  carrier: CargoCarrierSummary;
}

export interface OfferResponse {
  id: string; cargoId: string; driverId: string; status: OfferStatus;
  matchScore: number; distanciaKm: number; expiraEm: string; createdAt: string;
  cargo?: OfferCargo;
}

export interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; last: boolean; }
export interface DeclineOfferRequest { motivoRecusa?: string; }

// ─────────────────────────────────────────────────────────────────────────────
// HTTP CLIENT
// ─────────────────────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(method: HttpMethod, path: string, body?: unknown, authenticated = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authenticated) {
    const token = await AsyncStorage.getItem('@access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method, headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`);
  return data as T;
}

/**
 * Versão multipart do client — NÃO define Content-Type manualmente;
 * deixa o browser/RN definir o boundary automaticamente junto com o FormData.
 */
async function requestMultipart<T>(path: string, formData: FormData): Promise<T> {
  const token = await AsyncStorage.getItem('@access_token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 204) return undefined as T;

  // Tenta parsear JSON; se falhar (ex: HTML de erro 500), usa texto puro
  const contentType = res.headers.get('content-type') ?? '';
  let data: any;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { message: text || `HTTP ${res.status}` };
  }

  if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`);
  return data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// APIs
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: RegisterRequest)  => request<TokenResponse>('POST', '/auth/register', body),
  login:    (body: LoginRequest)     => request<TokenResponse>('POST', '/auth/login', body),
  refresh:  (body: RefreshRequest)   => request<TokenResponse>('POST', '/auth/refresh', body),
  logout:   (body: LogoutRequest)    => request<void>('POST', '/auth/logout', body),
};

export const driverApi = {
  /** GET /api/v1/drivers/me */
  getMyProfile: () => request<DriverResponse>('GET', '/drivers/me', undefined, true),

  /** PUT /api/v1/drivers/{id}/availability */
  updateAvailability: (id: string, body: UpdateAvailabilityRequest) =>
    request<{ id: string; available: boolean }>('PUT', `/drivers/${id}/availability`, body, true),

  /** PUT /api/v1/drivers/{id}/location */
  updateLocation: (id: string, body: UpdateLocationRequest) =>
    request<{ id: string; latitude: number; longitude: number }>('PUT', `/drivers/${id}/location`, body, true),

  /** GET /api/v1/drivers/me/vehicles */
  listMyVehicles: () => request<VehicleResponse[]>('GET', '/drivers/me/vehicles', undefined, true),
};

export const documentApi = {
  /**
   * POST /api/v1/drivers/me/documents  (multipart/form-data)
   *
   * O backend recebe três @RequestPart separados:
   *   - "file"      → o arquivo binário
   *   - "type"      → string do enum DocumentType  (ex: "CNH")
   *   - "vehicleId" → UUID string (opcional)
   *   - "validade"  → "YYYY-MM-DD" (opcional)
   *
   * Em React Native, FileObject vem do resultado de um DocumentPicker/ImagePicker.
   */
  upload: (
    file: { uri: string; name: string; type: string },
    params: UploadDocumentParams,
  ): Promise<DocumentResponse> => {
    const form = new FormData();

    // React Native aceita objetos { uri, name, type } diretamente no FormData
    form.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
    form.append('type', params.type);
    if (params.vehicleId) form.append('vehicleId', params.vehicleId);
    if (params.validade)  form.append('validade',  params.validade);

    return requestMultipart<DocumentResponse>('/drivers/me/documents', form);
  },

  /** GET /api/v1/drivers/me/documents */
  listMine: (): Promise<DocumentResponse[]> =>
    request<DocumentResponse[]>('GET', '/drivers/me/documents', undefined, true),

  // Não há endpoint de DELETE no backend — remoção não é suportada pela API.
};

export const cargoApi = {
  list: (params: { status?: CargoStatusBackend; tipo?: CargoTipo; origem?: string; page?: number; size?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.tipo)   q.set('tipo',   params.tipo);
    if (params.origem) q.set('origem', params.origem);
    q.set('page', String(params.page ?? 0));
    q.set('size', String(params.size ?? 20));
    return request<PageResponse<CargoSummaryResponse>>('GET', `/cargos?${q}`, undefined, true);
  },
  getById: (id: string) => request<CargoResponse>('GET', `/cargos/${id}`, undefined, true),
};

export const offerApi = {
  listMyOffers: (page = 0, size = 20) =>
    request<PageResponse<OfferResponse>>('GET', `/offers?page=${page}&size=${size}`, undefined, true),
  accept:  (offerId: string) =>
    request<OfferResponse>('POST', `/offers/${offerId}/accept`, undefined, true),
  decline: (offerId: string, body?: DeclineOfferRequest) =>
    request<OfferResponse>('POST', `/offers/${offerId}/decline`, body ?? null, true),
};