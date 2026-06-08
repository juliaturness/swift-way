import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Mail, Lock, Truck, ArrowLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { login, state } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    // Role vem do backend via JWT — por ora é resolvido no AuthContext
    // A tela passa 'DRIVER' como padrão; ajustar quando houver seleção de perfil ou endpoint /me
    const success = await login(formData.email, formData.password, 'DRIVER');

    if (!success) {
      setErrors({ password: 'E-mail ou senha incorretos' });
    }
  };

  return (
    <LinearGradient colors={colors.gradientDark} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={iconSizes.lg} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.logoSection}>
            <View style={styles.logoWrapper}>
              <Truck size={iconSizes.xxl} color={colors.text} />
            </View>
            <Text style={styles.logoTitle}>SWIFT WAY</Text>
            <Text style={styles.logoSubtitle}>Sistema Logístico</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.formCard}>
            <Text style={styles.formTitle}>Bem-vindo de volta!</Text>
            <Text style={styles.formSubtitle}>
              Entre com suas credenciais para acessar o sistema
            </Text>

            <View style={styles.form}>
              <Input
                label="E-mail"
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                error={errors.email}
                icon={<Mail size={iconSizes.md} color={colors.textMuted} />}
              />

              <Input
                label="Senha"
                placeholder="Digite sua senha"
                isPassword
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                error={errors.password}
                icon={<Lock size={iconSizes.md} color={colors.textMuted} />}
              />

              <View style={styles.optionsRow}>
                {/* Recuperação de senha fora do escopo do MVP */}
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Entrar"
                variant="primary"
                size="lg"
                fullWidth
                loading={state.isLoading}
                onPress={handleLogin}
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.registerSection}>
                <Text style={styles.registerText}>Não tem uma conta?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Cadastre-se gratuitamente</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.footer}>
            <Text style={styles.footerText}>
              Ao entrar, você concorda com nossos{' '}
              <Text style={styles.footerLink}>Termos de Serviço</Text> e{' '}
              <Text style={styles.footerLink}>Política de Privacidade</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
  },
  header: { marginBottom: spacing.xl },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  logoSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  form: {},
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  loginButton: { marginBottom: spacing.xl },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
  },
  registerSection: { alignItems: 'center' },
  registerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  registerLink: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  footer: { marginTop: 'auto', paddingTop: spacing.xl },
  footerText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: { color: colors.primary },
});