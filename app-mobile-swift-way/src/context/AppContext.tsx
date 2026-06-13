import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos extras que o SettingsScreen consome
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationSettings {
  offers:   boolean;
  status:   boolean;
  documents: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Estado
// ─────────────────────────────────────────────────────────────────────────────

interface FullAppState extends AppState {
  notifications: NotificationSettings;
  language: string;
}

const initialState: FullAppState = {
  isLoading:     false,
  isOnline:      true,
  theme:         'dark',
  notifications: { offers: true, status: true, documents: true },
  language:      'pt-BR',
};

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────

type AppAction =
  | { type: 'SET_LOADING';        payload: boolean }
  | { type: 'SET_ONLINE';         payload: boolean }
  | { type: 'SET_THEME';          payload: 'light' | 'dark' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_NOTIFICATIONS';  payload: NotificationSettings }
  | { type: 'SET_LANGUAGE';       payload: string };

function appReducer(state: FullAppState, action: AppAction): FullAppState {
  switch (action.type) {
    case 'SET_LOADING':       return { ...state, isLoading:     action.payload };
    case 'SET_ONLINE':        return { ...state, isOnline:      action.payload };
    case 'SET_THEME':         return { ...state, theme:         action.payload };
    case 'TOGGLE_THEME':      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SET_NOTIFICATIONS': return { ...state, notifications: action.payload };
    case 'SET_LANGUAGE':      return { ...state, language:      action.payload };
    default:                  return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Contexto
// ─────────────────────────────────────────────────────────────────────────────

interface AppContextType {
  state:            FullAppState;
  setLoading:       (v: boolean) => void;
  setOnline:        (v: boolean) => void;
  setTheme:         (v: 'light' | 'dark') => void;
  toggleTheme:      () => void;
  // campos consumidos pelo SettingsScreen
  notifications:    NotificationSettings;
  setNotifications: (v: NotificationSettings) => void;
  language:         string;
  setLanguage:      (v: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Monitora conectividade real do dispositivo
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(netState => {
      dispatch({ type: 'SET_ONLINE', payload: netState.isConnected ?? true });
    });
    return unsubscribe;
  }, []);

  const setLoading       = (v: boolean)              => dispatch({ type: 'SET_LOADING',       payload: v });
  const setOnline        = (v: boolean)              => dispatch({ type: 'SET_ONLINE',         payload: v });
  const setTheme         = (v: 'light' | 'dark')     => dispatch({ type: 'SET_THEME',          payload: v });
  const toggleTheme      = ()                         => dispatch({ type: 'TOGGLE_THEME' });
  const setNotifications = (v: NotificationSettings) => dispatch({ type: 'SET_NOTIFICATIONS', payload: v });
  const setLanguage      = (v: string)               => dispatch({ type: 'SET_LANGUAGE',      payload: v });

  return (
    <AppContext.Provider value={{
      state,
      setLoading,
      setOnline,
      setTheme,
      toggleTheme,
      notifications:    state.notifications,
      setNotifications,
      language:         state.language,
      setLanguage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}