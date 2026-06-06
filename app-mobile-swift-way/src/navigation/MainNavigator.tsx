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

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

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

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={Home} />,
        }}
      />
      <Tab.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          tabBarLabel: 'Ofertas',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={Package} />,
        }}
      />
      <Tab.Screen
        name="Trips"
        component={TripsScreen}
        options={{
          tabBarLabel: 'Viagens',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={Navigation} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={User} />,
        }}
      />
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

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="CargoDetails" component={CargoDetailsScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentsScreen} />
    </Stack.Navigator>
  );
}

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
