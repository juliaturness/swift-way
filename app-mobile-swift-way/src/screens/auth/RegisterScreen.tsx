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
import { Mail, Lock, User, Phone, ArrowLeft, FileText } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

interface FormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register, state } = useAuth();
  const [step, setStep] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'E-mail e obrigatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail invalido';
    }

    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = 'Telefone invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.cpf || formData.cpf.length < 11) {
      newErrors.cpf = 'CPF invalido';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas nao conferem';
    }

    if (!acceptTerms) {
      newErrors.confirmPassword = 'Voce deve aceitar os termos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    const success = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      cpf: formData.cpf,
    });

    if (!success) {
      setErrors({ confirmPassword: 'Erro ao criar conta. Tente novamente.' });
    }
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
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
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={iconSizes.lg} color={colors.text} />
            </TouchableOpacity>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
              </View>
              <Text style={styles.progressText}>Passo {step} de 2</Text>
            </View>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.formCard}>
            <Text style={styles.formTitle}>
              {step === 1 ? 'Criar sua conta' : 'Finalizar cadastro'}
            </Text>
            <Text style={styles.formSubtitle}>
              {step === 1
                ? 'Preencha seus dados pessoais'
                : 'Configure sua seguranca'}
            </Text>

            {step === 1 ? (
              <View style={styles.form}>
                <Input
                  label="Nome completo"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  error={errors.name}
                  icon={<User size={iconSizes.md} color={colors.textMuted} />}
                />

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
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: formatPhone(text) })}
                  error={errors.phone}
                  icon={<Phone size={iconSizes.md} color={colors.textMuted} />}
                />

                <Button
                  title="Continuar"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleNext}
                  style={styles.submitButton}
                />
              </View>
            ) : (
              <View style={styles.form}>
                <Input
                  label="CPF"
                  placeholder="000.000.000-00"
                  keyboardType="number-pad"
                  value={formData.cpf}
                  onChangeText={(text) => setFormData({ ...formData, cpf: formatCPF(text) })}
                  error={errors.cpf}
                  icon={<FileText size={iconSizes.md} color={colors.textMuted} />}
                />

                <Input
                  label="Senha"
                  placeholder="Minimo 6 caracteres"
                  isPassword
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  error={errors.password}
                  icon={<Lock size={iconSizes.md} color={colors.textMuted} />}
                />

                <Input
                  label="Confirmar senha"
                  placeholder="Repita a senha"
                  isPassword
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  error={errors.confirmPassword}
                  icon={<Lock size={iconSizes.md} color={colors.textMuted} />}
                />

                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                >
                  <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                    {acceptTerms && <View style={styles.checkboxInner} />}
                  </View>
                  <Text style={styles.termsText}>
                    Li e aceito os{' '}
                    <Text style={styles.termsLink}>Termos de Servico</Text> e{' '}
                    <Text style={styles.termsLink}>Politica de Privacidade</Text>
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Criar conta"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={state.isLoading}
                  onPress={handleRegister}
                  style={styles.submitButton}
                />
              </View>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Ja tem uma conta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Fazer login</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.lg,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.text,
  },
  termsText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  submitButton: {
    marginBottom: spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
  },
  loginSection: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  loginLink: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});
