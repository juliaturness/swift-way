import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from '../types';

const initialState: AppState = {
  isLoading: false,
  isOnline:  true,
  theme:     'dark',
};

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ONLINE';  payload: boolean }
  | { type: 'SET_THEME';   payload: 'light' | 'dark' }
  | { type: 'TOGGLE_THEME' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    case 'SET_ONLINE':  return { ...state, isOnline:  action.payload };
    case 'SET_THEME':   return { ...state, theme:     action.payload };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    default:
      return state;
  }
}

interface AppContextType {
  state:       AppState;
  setLoading:  (v: boolean) => void;
  setOnline:   (v: boolean) => void;
  setTheme:    (v: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Monitora conectividade real do dispositivo
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(netState => {
      dispatch({ type: 'SET_ONLINE', payload: netState.isConnected ?? true });
    });
    return unsubscribe;
  }, []);

  const setLoading  = (v: boolean)             => dispatch({ type: 'SET_LOADING', payload: v });
  const setOnline   = (v: boolean)             => dispatch({ type: 'SET_ONLINE',  payload: v });
  const setTheme    = (v: 'light' | 'dark')    => dispatch({ type: 'SET_THEME',   payload: v });
  const toggleTheme = ()                        => dispatch({ type: 'TOGGLE_THEME' });

  return (
    <AppContext.Provider value={{ state, setLoading, setOnline, setTheme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}