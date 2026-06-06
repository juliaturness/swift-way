// importando as peças prontas q o sistema precisa pra criar a tela de espera.
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Truck } from 'lucide-react-native';
import { colors, typography, spacing, iconSizes } from '../../theme';

// listinha q diz o q essa tela pode receber de fora, como um textinho de aviso.
interface LoadingScreenProps {
  message?: string;
}

// rotina principal q desenha a tela de carregamento pro usuário n ficar olhando pro nada enquanto espera.
export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  // a parte visual q junta tudo q vai aparecer na tela do celular.
  return (
    // o fundo colorido q ocupa a tela toda.
    <LinearGradient
      colors={colors.gradientDark}
      style={styles.container}
    >
      {
        // o grupo q junta o desenho do caminhão e o nome do aplicativo bem no meio.
      }
      <View style={styles.logoContainer}>
        <View style={styles.iconWrapper}>
          <Truck size={iconSizes.huge} color={colors.text} />
        </View>
        <Text style={styles.title}>SWIFT WAY</Text>
      </View>
      
      {
        // a rodinha q fica girando pra mostrar q o sistema tá pensando e trabalhando.
      }
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      
      {
        // o texto logo embaixo da rodinha q avisa o q tá acontecendo.
      }
      <Text style={styles.message}>{message}</Text>
    </LinearGradient>
  );
}

// dicionário de enfeites q organiza a cor, os espaços, os arredondamentos e a posição de todas as peças.
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