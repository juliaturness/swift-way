import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, driverApi, DriverResponse, VehicleResponse, RegisterRequest } from '../lib/api';

const KEY_ACCESS  = '@access_token';
const KEY_REFRESH = '@refresh_token';
const KEY_USER    = '@user';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: 'DRIVER' | 'CARRIER' | 'ADMIN';
  // campos do perfil de motorista (preenchidos após /drivers/me)
  fullName?: string;
  phone?: string;
  cnhNumber?: string;
  cnhCategory?: string;
  cnhValidity?: string;
  available?: boolean;
  grApproved?: boolean;
  averageRating?: number;
  avatarUrl?: string;
  vehicles?: VehicleResponse[];
  latitude?: number;
  longitude?: number;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type Action =
  | { type: 'LOADING' }
  | { type: 'LOGIN_SUCCESS'; user: AuthUser; accessToken: string }
  | { type: 'UPDATE_PROFILE'; profile: Partial<AuthUser> }
  | { type: 'LOGOUT' }
  | { type: 'ERROR' };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOADING':        return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':  return { user: action.user, accessToken: action.accessToken, isLoading: false, isAuthenticated: true };
    case 'UPDATE_PROFILE': return { ...state, user: state.user ? { ...state.user, ...action.profile } : state.user };
    case 'LOGOUT':         return { user: null, accessToken: null, isLoading: false, isAuthenticated: false };
    case 'ERROR':          return { ...state, isLoading: false };
    default:               return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Contexto
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  login:         (email: string, password: string) => Promise<boolean>;
  register:      (data: RegisterRequest) => Promise<boolean>;
  logout:        () => Promise<void>;
  /**
   * Alterna disponibilidade do motorista.
   * Aceita boolean (API) ou os aliases de UI 'available'/'busy'/'offline'.
   * 'busy' e 'offline' são mapeados para available=false.
   */
  updateStatus:  (available: boolean | 'available' | 'busy' | 'offline') => Promise<void>;
  fetchProfile:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null, accessToken: null, isLoading: true, isAuthenticated: false,
  });

  // Restaura sessão
  useEffect(() => {
    (async () => {
      try {
        const [tokenEntry, userEntry] = await AsyncStorage.multiGet([KEY_ACCESS, KEY_USER]);
        const accessToken = tokenEntry[1];
        const user: AuthUser | null = userEntry[1] ? JSON.parse(userEntry[1]) : null;
        if (accessToken && user) {
          dispatch({ type: 'LOGIN_SUCCESS', user, accessToken });
          if (user.role === 'DRIVER') fetchDriverProfile();
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch {
        dispatch({ type: 'LOGOUT' });
      }
    })();
  }, []);

  const fetchDriverProfile = async () => {
    try {
      const profile: DriverResponse = await driverApi.getMyProfile();
      const update: Partial<AuthUser> = {
        id:            profile.id,
        fullName:      profile.fullName,
        phone:         profile.phone,
        cnhNumber:     profile.cnhNumber,
        cnhCategory:   profile.cnhCategory,
        cnhValidity:   profile.cnhValidity,
        available:     profile.available,
        grApproved:    profile.grApproved,
        averageRating: profile.averageRating,
        vehicles:      profile.vehicles,
        latitude:      profile.latitude,
        longitude:     profile.longitude,
      };
      dispatch({ type: 'UPDATE_PROFILE', profile: update });
      const stored = await AsyncStorage.getItem(KEY_USER);
      if (stored) {
        const merged = { ...JSON.parse(stored), ...update };
        await AsyncStorage.setItem(KEY_USER, JSON.stringify(merged));
      }
    } catch (e) {
      console.warn('[Auth] fetchDriverProfile error:', e);
    }
  };

  const fetchProfile = useCallback(async () => {
    if (state.user?.role === 'DRIVER') await fetchDriverProfile();
  }, [state.user?.role]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOADING' });
    try {
      const tokens = await authApi.login({ email, password });
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
      const role: AuthUser['role'] = payload.role ?? payload.roles?.[0]?.replace('ROLE_', '') ?? 'DRIVER';
      const user: AuthUser = { id: '', email, role };

      await AsyncStorage.multiSet([
        [KEY_ACCESS,  tokens.accessToken],
        [KEY_REFRESH, tokens.refreshToken],
        [KEY_USER,    JSON.stringify(user)],
      ]);

      dispatch({ type: 'LOGIN_SUCCESS', user, accessToken: tokens.accessToken });
      if (role === 'DRIVER') fetchDriverProfile();
      return true;
    } catch (e) {
      console.error('[Auth] login error:', e);
      dispatch({ type: 'ERROR' });
      return false;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<boolean> => {
    dispatch({ type: 'LOADING' });
    try {
      const tokens = await authApi.register(data);
      const user: AuthUser = { id: '', email: data.email, role: data.role };

      await AsyncStorage.multiSet([
        [KEY_ACCESS,  tokens.accessToken],
        [KEY_REFRESH, tokens.refreshToken],
        [KEY_USER,    JSON.stringify(user)],
      ]);

      dispatch({ type: 'LOGIN_SUCCESS', user, accessToken: tokens.accessToken });
      if (data.role === 'DRIVER') fetchDriverProfile();
      return true;
    } catch (e) {
      console.error('[Auth] register error:', e);
      dispatch({ type: 'ERROR' });
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(KEY_REFRESH);
      if (refreshToken) await authApi.logout({ refreshToken });
    } catch { /* ignora erro de rede */ }
    finally {
      await AsyncStorage.multiRemove([KEY_ACCESS, KEY_REFRESH, KEY_USER]);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  /**
   * Chama PUT /drivers/{id}/availability.
   * Aceita boolean ou os aliases 'available'/'busy'/'offline' usados pela UI.
   * Só 'available' === true no backend — busy e offline mapeiam para false.
   */
  const updateStatus = useCallback(async (
    value: boolean | 'available' | 'busy' | 'offline',
  ) => {
    if (!state.user?.id) return;
    const available = value === true || value === 'available';
    try {
      await driverApi.updateAvailability(state.user.id, { available });
      dispatch({ type: 'UPDATE_PROFILE', profile: { available } });
    } catch (e) {
      console.error('[Auth] updateStatus error:', e);
    }
  }, [state.user?.id]);

  return (
    <AuthContext.Provider value={{ state, login, register, logout, updateStatus, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}