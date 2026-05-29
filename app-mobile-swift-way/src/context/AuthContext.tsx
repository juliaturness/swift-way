import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, Driver, DriverStatus } from '../types';

// Chaves do AsyncStorage
const AUTH_TOKEN_KEY = '@vapt_vupt:auth_token';
const USER_DATA_KEY = '@vapt_vupt:user_data';

// Motorista mock para demonstração
const mockDriver: Driver = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '(48) 99999-8888',
  cpf: '123.456.789-00',
  birthDate: '15/03/1985',
  address: 'Rua das Palmeiras, 567',
  city: 'Florianópolis',
  state: 'SC',
  zipCode: '88010-000',
  userType: 'driver',
  createdAt: '2024-01-10',
  cnhNumber: '12345678900',
  cnhCategory: 'E',
  cnhExpiry: '15/08/2028',
  status: 'available',
  rating: 4.8,
  totalTrips: 87,
  approvalRate: 98,
  monthlyEarnings: 12400,
  vehicles: [
    {
      id: '1',
      type: 'Caminhão Baú',
      plate: 'ABC-1234',
      year: '2020',
      model: 'VW Delivery',
      brand: 'Volkswagen',
      status: 'active',
    },
    {
      id: '2',
      type: 'Van',
      plate: 'XYZ-5678',
      year: '2019',
      model: 'Sprinter',
      brand: 'Mercedes-Benz',
      status: 'maintenance',
    },
  ],
};

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
};

// Tipos de ação
type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: Driver; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<Driver> }
  | { type: 'UPDATE_STATUS'; payload: DriverStatus };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'UPDATE_STATUS':
      return {
        ...state,
        user: state.user ? { ...state.user, status: action.payload } : null,
      };
    default:
      return state;
  }
}

// Tipo do contexto
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Partial<Driver>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<Driver>) => void;
  updateStatus: (status: DriverStatus) => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticação ao iniciar
  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar se existe sessão salva
  const checkAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      if (token && userData) {
        const user = JSON.parse(userData) as Driver;
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      dispatch({ type: 'AUTH_FAILURE' });
    }
  };

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // Simular chamada API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Em produção, aqui seria feita a chamada real à API
      // Por enquanto, aceita qualquer email/senha e retorna o mock
      if (email && password) {
        const token = 'mock_jwt_token_' + Date.now();
        const user = { ...mockDriver, email };
        
        // Salvar no AsyncStorage
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        return true;
      }
      
      dispatch({ type: 'AUTH_FAILURE' });
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      return false;
    }
  };

  // Registro
  const register = async (data: Partial<Driver>): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // Simular chamada API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const token = 'mock_jwt_token_' + Date.now();
      const user: Driver = {
        ...mockDriver,
        ...data,
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
      };
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  // Atualizar dados do usuário
  const updateUser = (data: Partial<Driver>) => {
    dispatch({ type: 'UPDATE_USER', payload: data });
    
    // Atualizar no AsyncStorage
    if (state.user) {
      const updatedUser = { ...state.user, ...data };
      AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
    }
  };

  // Atualizar status de disponibilidade
  const updateStatus = async (status: DriverStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: status });
    
    // Atualizar no AsyncStorage
    if (state.user) {
      const updatedUser = { ...state.user, status };
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
    }
    
    // Em produção, enviar para API
    // await api.updateDriverStatus(status);
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        updateUser,
        updateStatus,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
