import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as ExpoLocation from 'expo-location';
import { Location } from '../types';

interface LocationContextType {
  location: Location | null;
  errorMsg: string | null;
  isLoading: boolean;
  permissionStatus: ExpoLocation.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Location | null>;
  startWatching: () => Promise<void>;
  stopWatching: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<ExpoLocation.PermissionStatus | null>(null);
  const [watchSubscription, setWatchSubscription] = useState<ExpoLocation.LocationSubscription | null>(null);

  // Verificar permissões ao iniciar
  useEffect(() => {
    checkPermission();
    
    return () => {
      if (watchSubscription) {
        watchSubscription.remove();
      }
    };
  }, []);

  const checkPermission = async () => {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada. Ative nas configurações do dispositivo.');
        return false;
      }
      
      setErrorMsg(null);
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setErrorMsg('Erro ao solicitar permissão de localização.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async (): Promise<Location | null> => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      // Verificar permissão
      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return null;
      }
      
      const currentLocation = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });
      
      const locationData: Location = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: currentLocation.timestamp,
      };
      
      // Tentar obter endereço
      try {
        const [address] = await ExpoLocation.reverseGeocodeAsync({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });
        
        if (address) {
          locationData.address = `${address.street || ''}, ${address.city || ''} - ${address.region || ''}`.trim();
        }
      } catch {
        // Ignorar erro de geocoding
      }
      
      setLocation(locationData);
      return locationData;
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      setErrorMsg('Não foi possível obter sua localização.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const startWatching = async () => {
    try {
      // Verificar permissão
      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return;
      }
      
      // Parar watch anterior se existir
      if (watchSubscription) {
        watchSubscription.remove();
      }
      
      const subscription = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.High,
          timeInterval: 10000, // 10 segundos
          distanceInterval: 50, // 50 metros
        },
        async (newLocation) => {
          const locationData: Location = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            timestamp: newLocation.timestamp,
          };
          
          setLocation(locationData);
          
          // Em produção, enviar localização para API
          // await api.updateDriverLocation(locationData);
        }
      );
      
      setWatchSubscription(subscription);
    } catch (error) {
      console.error('Erro ao iniciar monitoramento:', error);
      setErrorMsg('Erro ao monitorar localização.');
    }
  };

  const stopWatching = () => {
    if (watchSubscription) {
      watchSubscription.remove();
      setWatchSubscription(null);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        errorMsg,
        isLoading,
        permissionStatus,
        requestPermission,
        getCurrentLocation,
        startWatching,
        stopWatching,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
