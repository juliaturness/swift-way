import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Home,
  Package,
  Navigation,
  User,
  Settings,
} from 'lucide-react-native';
import { HomeScreen } from '../screens/main/HomeScreen';
import { OffersScreen } from '../screens/main/OffersScreen';
import { TripsScreen } from '../screens/main/TripsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { CargoDetailsScreen } from '../screens/main/CargoDetailsScreen';
import { DocumentsScreen } from '../screens/main/DocumentsScreen';
import { colors, typography, iconSizes, borderRadius, spacing } from '../theme';
import { MainTabParamList, RootStackParamList } from '../types';

// criando os organizadores q vão trocar as telas quando alguém apertar os botões.
const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// rotina q desenha os ícones na barra de baixo. 
// muda a cor e coloca um fundo especial se o botão tiver selecionado.
function TabBarIcon({ focused, icon: Icon }: { focused: boolean; icon: typeof Home }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Icon
        size={iconSizes.lg}
        color={focused ? colors.primary : colors.textMuted}
        strokeWidth={focused ? 2.5 : 2}
      />
    </View>
  );
}

// rotina q junta todas as telas principais q ficam na barra da parte de baixo do celular.
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        // esconde o título padrão q fica no topo da tela.
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        // esconde a barra de botões quando o teclado aparece pra n atrapalhar a digitação.
        tabBarHideOnKeyboard: true,
      }}
    >
      {
        // botão q leva pra tela inicial do aplicativo.
      }
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={Home} />,
        }}
      />
      {
        // botão q leva pra tela q mostra as cargas disponíveis.
      }
      <Tab.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          tabBarLabel: 'Ofertas',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={Package} />,
        }}
      />
      {
        // botão q leva pra tela de acompanhar o andamento das viagens.
      }
      <Tab.Screen
        name="Trips"
        component={TripsScreen}
        options={{
          tabBarLabel: 'Viagens',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={Navigation} />,
        }}
      />
      {
        // botão q leva pra tela com as informações da conta do motorista.
      }
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={User} />,
        }}
      />
      {
        // botão q leva pra tela de ajustes e preferências do aplicativo.
      }
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Config',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={Settings} />,
        }}
      />
    </Tab.Navigator>
  );
}

// rotina principal q organiza o fluxo geral de todas as telas.
// junta a barra de botões com as telas soltas q abrem por cima cobrindo tudo.
export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // faz a nova tela entrar deslizando do lado direito quando abre.
        animation: 'slide_from_right',
      }}
    >
      {
        // o grupo principal com a barra de botões q desenhou antes.
      }
      <Stack.Screen name="MainTabs" component={MainTabs} />
      {
        // tela solta pra mostrar os detalhes de uma carga específica.
      }
      <Stack.Screen name="CargoDetails" component={CargoDetailsScreen} />
      {
        // tela solta pra mandar foto de algum documento pro sistema.
      }
      <Stack.Screen name="DocumentUpload" component={DocumentsScreen} />
    </Stack.Navigator>
  );
}

// dicionário de enfeites q arruma as cores, a altura e os espaços da barra de botões e dos ícones.
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 70,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  tabBarLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerFocused: {
    backgroundColor: colors.infoBg,
  },
});