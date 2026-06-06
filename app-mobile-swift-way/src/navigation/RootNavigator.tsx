import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { CargoProvider } from '../context/CargoContext';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { state } = useAuth();

  if (state.isLoading) {
    return <LoadingScreen message="Verificando sessao..." />;
  }

  return (
    <NavigationContainer>
      {state.isAuthenticated ? (
        <CargoProvider>
          <MainNavigator />
        </CargoProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
