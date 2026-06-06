import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Truck } from 'lucide-react-native';
import { colors, typography, spacing, iconSizes } from '../../theme';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <LinearGradient
      colors={colors.gradientDark}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <View style={styles.iconWrapper}>
          <Truck size={iconSizes.huge} color={colors.text} />
        </View>
        <Text style={styles.title}>VAPT VUPT</Text>
      </View>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      <Text style={styles.message}>{message}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  loader: {
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
});
