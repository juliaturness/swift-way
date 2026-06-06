import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as ExpoGeoLocation from 'expo-location';
import { GeoLocation } from '../types';

// listinha com tudo q o sistema de mapa precisa guardar e as ações q ele sabe fazer.
interface GeoLocationContextType {
  Geolocation: GeoLocation | null;
  errorMsg: string | null;
  isLoading: boolean;
  permissionStatus: ExpoGeoLocation.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
  getCurrentGeoLocation: () => Promise<GeoLocation | null>;
  startWatching: () => Promise<void>;
  stopWatching: () => void;
}

// criando o espaço invisível q vai espalhar os dados do gps pelo aplicativo.
const GeoLocationContext = createContext<GeoLocationContextType | undefined>(undefined);

// diz q a rotina precisa receber o aplicativo pra poder abraçar ele.
interface GeoLocationProviderProps {
  children: ReactNode;
}

// rotina principal q toma conta de descobrir e monitorar onde o celular tá.
export function GeoLocationProvider({ children }: GeoLocationProviderProps) {
  // caixinhas pra lembrar a posição atual, se deu algum erro e se tá carregando.
  const [Geolocation, setGeoLocation] = useState<GeoLocation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // caixinha pra lembrar se o usuário deixou o aplicativo usar o gps.
  const [permissionStatus, setPermissionStatus] = useState<ExpoGeoLocation.PermissionStatus | null>(null);
  
  // caixinha pra guardar o vigia q fica olhando o gps toda hora.
  const [watchSubscription, setWatchSubscription] = useState<ExpoGeoLocation.LocationSubscription | null>(null);

  // rotina q roda sozinha quando o aplicativo abre pra checar as permissões do gps.
  useEffect(() => {
    checkPermission();
    
    // quando o aplicativo fecha, manda o vigia parar de olhar o gps.
    return () => {
      if (watchSubscription) {
        watchSubscription.remove();
      }
    };
  }, []);

  // rotina q só pergunta pro celular se a permissão já foi dada antes.
  const checkPermission = async () => {
    try {
      const { status } = await ExpoGeoLocation.getForegroundPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
    }
  };

  // rotina q faz aparecer a janelinha pedindo pro usuário liberar o uso do gps.
  const requestPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { status } = await ExpoGeoLocation.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      // se a pessoa apertar n, salva um aviso de erro.
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

  // rotina q pega a posição exata de agora msm e tenta descobrir o nome da rua.
  const getCurrentGeoLocation = async (): Promise<GeoLocation | null> => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      // se n tem permissão ainda, pede de novo.
      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return null;
      }
      
      // pega as coordenadas do gps com bastante precisão.
      const currentGeoLocation = await ExpoGeoLocation.getCurrentPositionAsync({
        accuracy: ExpoGeoLocation.Accuracy.High,
      });
      
      const GeolocationData: GeoLocation = {
        latitude: currentGeoLocation.coords.latitude,
        longitude: currentGeoLocation.coords.longitude,
        timestamp: currentGeoLocation.timestamp,
      };
      
      // tenta transformar as coordenadas em um endereço escrito.
      try {
        const [address] = await ExpoGeoLocation.reverseGeocodeAsync({
          latitude: GeolocationData.latitude,
          longitude: GeolocationData.longitude,
        });
        
        if (address) {
          GeolocationData.address = `${address.street || ''}, ${address.city || ''} - ${address.region || ''}`.trim();
        }
      } catch {
        // se n conseguir o endereço, ignora e segue a vida.
      }
      
      setGeoLocation(GeolocationData);
      return GeolocationData;
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      setErrorMsg('Não foi possível obter sua localização.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // rotina q liga um vigia pra ficar atualizando a posição sozinho a cada 10 segundos ou quando anda 50 metros.
  const startWatching = async () => {
    try {
      // pede permissão se precisar.
      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return;
      }
      
      // desliga o vigia velho antes de ligar um novo.
      if (watchSubscription) {
        watchSubscription.remove();
      }
      
      // liga o novo vigia com as regras de tempo e distância.
      const subscription = await ExpoGeoLocation.watchPositionAsync(
        {
          accuracy: ExpoGeoLocation.Accuracy.High,
          timeInterval: 10000, // 10 segundos
          distanceInterval: 50, // 50 metros
        },
        async (newGeoLocation) => {
          const GeolocationData: GeoLocation = {
            latitude: newGeoLocation.coords.latitude,
            longitude: newGeoLocation.coords.longitude,
            timestamp: newGeoLocation.timestamp,
          };
          
          setGeoLocation(GeolocationData);
          
          // espaço onde o aplicativo enviaria a posição pra central de verdade.
          // await api.updateDriverGeoLocation(GeolocationData);
        }
      );
      
      // salva esse novo vigia na caixinha de memória.
      setWatchSubscription(subscription);
    } catch (error) {
      console.error('Erro ao iniciar monitoramento:', error);
      setErrorMsg('Erro ao monitorar localização.');
    }
  };

  // rotina q manda o vigia parar de pegar a localização pra n gastar a bateria do celular.
  const stopWatching = () => {
    if (watchSubscription) {
      watchSubscription.remove();
      setWatchSubscription(null);
    }
  };

  // a parte q distribui essas informações de gps e comandos pro resto do aplicativo.
  return (
    <GeoLocationContext.Provider
      value={{
        Geolocation,
        errorMsg,
        isLoading,
        permissionStatus,
        requestPermission,
        getCurrentGeoLocation,
        startWatching,
        stopWatching,
      }}
    >
      {children}
    </GeoLocationContext.Provider>
  );
}

// atalho pronto pras outras telas conseguirem ver a localização e usar as rotinas do gps rapidinho.
export function useGeoLocation() {
  const context = useContext(GeoLocationContext);
  if (context === undefined) {
    throw new Error('useGeoLocation must be used within a GeoLocationProvider');
  }
  return context;
}