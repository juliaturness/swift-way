import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, RegisterRequest } from '../lib/api';

// ── storage keys ──────────────────────────────────────────────────────────────

const KEY_ACCESS  = '@access_token';
const KEY_REFRESH = '@refresh_token';
const KEY_USER    = '@user';

// ── tipos ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  email: string;
  role: 'DRIVER' | 'CARRIER';
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
  | { type: 'LOGOUT' }
  | { type: 'ERROR' };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        user: action.user,
        accessToken: action.accessToken,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return { user: null, accessToken: null, isLoading: false, isAuthenticated: false };
    case 'ERROR':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

// ── contexto ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    accessToken: null,
    isLoading: true,   // começa carregando até ler o storage
    isAuthenticated: false,
  });

  // Restaura sessão ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const [token, userJson] = await AsyncStorage.multiGet([KEY_ACCESS, KEY_USER]);
        const accessToken = token[1];
        const user: AuthUser | null = userJson[1] ? JSON.parse(userJson[1]) : null;

        if (accessToken && user) {
          dispatch({ type: 'LOGIN_SUCCESS', user, accessToken });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch {
        dispatch({ type: 'LOGOUT' });
      }
    })();
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOADING' });
    try {
      const tokens = await authApi.login({ email, password });

      // O JWT não traz role no body — guardamos só o email por ora.
      // Se precisar do role, decodifique o JWT (lib: jwt-decode) ou adicione
      // um endpoint /me no backend.
      const user: AuthUser = { email, role: 'DRIVER' }; // ajuste conforme seu /me

      await AsyncStorage.multiSet([
        [KEY_ACCESS,  tokens.accessToken],
        [KEY_REFRESH, tokens.refreshToken],
        [KEY_USER,    JSON.stringify(user)],
      ]);

      dispatch({ type: 'LOGIN_SUCCESS', user, accessToken: tokens.accessToken });
      return true;
    } catch (err) {
      console.error('[Auth] login error:', err);
      dispatch({ type: 'ERROR' });
      return false;
    }
  }, []);

  // ── register ───────────────────────────────────────────────────────────────

  const register = useCallback(async (data: RegisterRequest): Promise<boolean> => {
    dispatch({ type: 'LOADING' });
    try {
      const tokens = await authApi.register(data);

      const user: AuthUser = { email: data.email, role: data.role };

      await AsyncStorage.multiSet([
        [KEY_ACCESS,  tokens.accessToken],
        [KEY_REFRESH, tokens.refreshToken],
        [KEY_USER,    JSON.stringify(user)],
      ]);

      dispatch({ type: 'LOGIN_SUCCESS', user, accessToken: tokens.accessToken });
      return true;
    } catch (err) {
      console.error('[Auth] register error:', err);
      dispatch({ type: 'ERROR' });
      return false;
    }
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(KEY_REFRESH);
      if (refreshToken) await authApi.logout({ refreshToken });
    } catch {
      // ignora erro de rede no logout
    } finally {
      await AsyncStorage.multiRemove([KEY_ACCESS, KEY_REFRESH, KEY_USER]);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}