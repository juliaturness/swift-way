import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Truck, MapPin, Shield, Zap } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/ui/Button';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';
import { RootStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const features = [
    { icon: MapPin, text: 'Cargas em todo Brasil' },
    { icon: Shield, text: 'Pagamentos seguros' },
    { icon: Zap, text: 'Match inteligente' },
  ];

  return (
    <LinearGradient colors={colors.gradientDark} style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.patternCircle,
              {
                top: Math.random() * height * 0.6,
                left: Math.random() * width,
                opacity: 0.03 + Math.random() * 0.05,
                width: 100 + Math.random() * 200,
                height: 100 + Math.random() * 200,
              },
            ]}
          />
        ))}
      </View>

      {/* Logo Section */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={colors.gradientPrimary}
            style={styles.logoWrapper}
          >
            <Truck size={iconSizes.huge} color={colors.text} />
          </LinearGradient>
        </View>
        <Text style={styles.title}>VAPT VUPT</Text>
        <Text style={styles.subtitle}>Sistema Logistico Inteligente</Text>
      </Animated.View>

      {/* Features Section */}
      <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Conectando motoristas e transportadoras</Text>
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(600 + index * 100).duration(400)}
              style={styles.featureItem}
            >
              <View style={styles.featureIcon}>
                <feature.icon size={iconSizes.md} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Stats Section */}
      <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>2.5k+</Text>
          <Text style={styles.statLabel}>Motoristas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>500+</Text>
          <Text style={styles.statLabel}>Transportadoras</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>10k+</Text>
          <Text style={styles.statLabel}>Entregas</Text>
        </View>
      </Animated.View>

      {/* Actions Section */}
      <Animated.View entering={FadeInUp.delay(900).duration(600)} style={styles.actionsSection}>
        <Button
          title="Entrar"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => navigation.navigate('Login')}
        />
        <Button
          title="Criar Conta"
          variant="outline"
          size="lg"
          fullWidth
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        />
        <Text style={styles.termsText}>
          Ao continuar, voce concorda com nossos{' '}
          <Text style={styles.termsLink}>Termos de Servico</Text> e{' '}
          <Text style={styles.termsLink}>Politica de Privacidade</Text>
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
  featuresSection: {
    marginBottom: spacing.xxxl,
  },
  featuresTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  featuresList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.infoBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  actionsSection: {
    marginTop: 'auto',
  },
  registerButton: {
    marginTop: spacing.md,
  },
  termsText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
  },
});
