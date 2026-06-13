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
import { Mail, Lock, User, Phone, ArrowLeft, FileText, Briefcase } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';
import { RootStackParamList, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  // DRIVER
  fullName: string;
  phone: string;
  cpf: string;
  cnhNumber: string;
  cnhCategory: string;
  cnhValidity: string; // "DD/MM/YYYY" → converte para ISO antes de enviar
  // CARRIER
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  phone?: string;
  cpf?: string;
  cnhNumber?: string;
  cnhCategory?: string;
  cnhValidity?: string;
  cnpj?: string;
  razaoSocial?: string;
}

// Converte "DD/MM/YYYY" → "YYYY-MM-DD"; retorna undefined se a entrada for inválida
function toIsoDate(value: string): string | undefined {
  const parts = value.split('/');
  if (parts.length !== 3) return undefined;
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return undefined;
  return `${y}-${m}-${d}`;
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register, state } = useAuth();
  const [step, setStep] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DRIVER',
    fullName: '',
    phone: '',
    cpf: '',
    cnhNumber: '',
    cnhCategory: '',
    cnhValidity: '',
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (field: keyof FormData) => (value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // ── validações ─────────────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const e: FormErrors = {};
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      e.email = 'E-mail inválido';
    if (!formData.password || formData.password.length < 6)
      e.password = 'Senha deve ter pelo menos 6 caracteres';
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Senhas não conferem';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: FormErrors = {};
    if (formData.role === 'DRIVER') {
      if (!formData.fullName || formData.fullName.length < 3)
        e.fullName = 'Nome deve ter pelo menos 3 caracteres';
      if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10)
        e.phone = 'Telefone inválido';
      if (!formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11)
        e.cpf = 'CPF inválido';
      if (!formData.cnhNumber)
        e.cnhNumber = 'Número da CNH obrigatório';
      if (!formData.cnhCategory)
        e.cnhCategory = 'Categoria CNH obrigatória';
      if (!formData.cnhValidity || !toIsoDate(formData.cnhValidity))
        e.cnhValidity = 'Validade CNH inválida';
    } else {
      if (!formData.cnpj || formData.cnpj.replace(/\D/g, '').length !== 14)
        e.cnpj = 'CNPJ inválido';
      if (!formData.razaoSocial)
        e.razaoSocial = 'Razão social obrigatória';
    }
    if (!acceptTerms) e.confirmPassword = 'Você deve aceitar os termos';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── submit ─────────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    if (!validateStep2()) return;

    // Monta o payload como discriminated union — o TypeScript valida os campos obrigatórios por role
    const success = await register(
      formData.role === 'DRIVER'
        ? {
            email: formData.email,
            password: formData.password,
            role: 'DRIVER',
            fullName: formData.fullName,
            cpf: formData.cpf,
            phone: formData.phone,
            cnhNumber: formData.cnhNumber,
            cnhCategory: formData.cnhCategory,
            cnhValidity: toIsoDate(formData.cnhValidity)!,
          }
        : {
            email: formData.email,
            password: formData.password,
            role: 'CARRIER',
            cnpj: formData.cnpj,
            razaoSocial: formData.razaoSocial,
            nomeFantasia: formData.nomeFantasia || undefined,
            telefone: formData.phone,
          },
    );

    if (!success) {
      setErrors({ confirmPassword: 'Erro ao criar conta. Verifique os dados e tente novamente.' });
    }
  };

  // ── formatters ─────────────────────────────────────────────────────────────

  const formatPhone = (text: string) => {
    const c = text.replace(/\D/g, '');
    if (c.length <= 2) return `(${c}`;
    if (c.length <= 7) return `(${c.slice(0, 2)}) ${c.slice(2)}`;
    return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7, 11)}`;
  };

  const formatCPF = (text: string) => {
    const c = text.replace(/\D/g, '');
    if (c.length <= 3) return c;
    if (c.length <= 6) return `${c.slice(0, 3)}.${c.slice(3)}`;
    if (c.length <= 9) return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6)}`;
    return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9, 11)}`;
  };

  const formatCNPJ = (text: string) => {
    const c = text.replace(/\D/g, '');
    if (c.length <= 2) return c;
    if (c.length <= 5) return `${c.slice(0, 2)}.${c.slice(2)}`;
    if (c.length <= 8) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5)}`;
    if (c.length <= 12) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8)}`;
    return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12, 14)}`;
  };

  const formatDate = (text: string) => {
    const c = text.replace(/\D/g, '');
    if (c.length <= 2) return c;
    if (c.length <= 4) return `${c.slice(0, 2)}/${c.slice(2)}`;
    return `${c.slice(0, 2)}/${c.slice(2, 4)}/${c.slice(4, 8)}`;
  };

  // ── render ─────────────────────────────────────────────────────────────────

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
              onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={iconSizes.lg} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
              </View>
              <Text style={styles.progressText}>Passo {step} de 2</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.formCard}>
            <Text style={styles.formTitle}>
              {step === 1 ? 'Criar sua conta' : 'Dados do perfil'}
            </Text>
            <Text style={styles.formSubtitle}>
              {step === 1 ? 'Escolha seu perfil e defina o acesso' : 'Preencha suas informações'}
            </Text>

            {step === 1 ? (
              <View style={styles.form}>
                <Text style={styles.roleLabel}>Tipo de conta</Text>
                <View style={styles.roleRow}>
                  {(['DRIVER', 'CARRIER'] as UserRole[]).map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[styles.roleButton, formData.role === role && styles.roleButtonActive]}
                      onPress={() => setFormData(prev => ({ ...prev, role }))}
                    >
                      {role === 'DRIVER'
                        ? <User size={iconSizes.md} color={formData.role === role ? colors.text : colors.textMuted} />
                        : <Briefcase size={iconSizes.md} color={formData.role === role ? colors.text : colors.textMuted} />
                      }
                      <Text style={[styles.roleButtonText, formData.role === role && styles.roleButtonTextActive]}>
                        {role === 'DRIVER' ? 'Motorista' : 'Transportadora'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Input
                  label="E-mail"
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.email}
                  onChangeText={set('email')}
                  error={errors.email}
                  icon={<Mail size={iconSizes.md} color={colors.textMuted} />}
                />
                <Input
                  label="Senha"
                  placeholder="Mínimo 6 caracteres"
                  isPassword
                  value={formData.password}
                  onChangeText={set('password')}
                  error={errors.password}
                  icon={<Lock size={iconSizes.md} color={colors.textMuted} />}
                />
                <Input
                  label="Confirmar senha"
                  placeholder="Repita a senha"
                  isPassword
                  value={formData.confirmPassword}
                  onChangeText={set('confirmPassword')}
                  error={errors.confirmPassword}
                  icon={<Lock size={iconSizes.md} color={colors.textMuted} />}
                />

                <Button
                  title="Continuar"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={() => validateStep1() && setStep(2)}
                  style={styles.submitButton}
                />
              </View>
            ) : (
              <View style={styles.form}>
                {formData.role === 'DRIVER' ? (
                  <>
                    <Input
                      label="Nome completo"
                      placeholder="Seu nome completo"
                      value={formData.fullName}
                      onChangeText={set('fullName')}
                      error={errors.fullName}
                      icon={<User size={iconSizes.md} color={colors.textMuted} />}
                    />
                    <Input
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={t => set('phone')(formatPhone(t))}
                      error={errors.phone}
                      icon={<Phone size={iconSizes.md} color={colors.textMuted} />}
                    />
                    <Input
                      label="CPF"
                      placeholder="000.000.000-00"
                      keyboardType="number-pad"
                      value={formData.cpf}
                      onChangeText={t => set('cpf')(formatCPF(t))}
                      error={errors.cpf}
                      icon={<FileText size={iconSizes.md} color={colors.textMuted} />}
                    />
                    <Input
                      label="Número da CNH"
                      placeholder="00000000000"
                      keyboardType="number-pad"
                      value={formData.cnhNumber}
                      onChangeText={set('cnhNumber')}
                      error={errors.cnhNumber}
                      icon={<FileText size={iconSizes.md} color={colors.textMuted} />}
                    />
                    <Input
                      label="Categoria CNH"
                      placeholder="Ex: B, C, D, E"
                      autoCapitalize="characters"
                      value={formData.cnhCategory}
                      onChangeText={set('cnhCategory')}
                      error={errors.cnhCategory}
                      icon={<FileText size={iconSizes.md} color={colors.textMuted} />}
                    />
                    <Input
                      label="Validade CNH"
                      placeholder="DD/MM/AAAA"
                      keyboardType="number-pad"
                      value={formData.cnhValidity}
                      onChangeText={t => set('cnhValidity')(formatDate(t))}
                      error={errors.cnhValidity}
                      icon={<FileText size={iconSizes.md} color={colors.textMuted} />}
                    />
                  </>
                ) : (
                  <>
                    <Input
                      label="CNPJ"
                      placeholder="00.000.000/0000-00"
                      keyboardType="number-pad"
                      value={formData.cnpj}
                      onChangeText={t => set('cnpj')(formatCNPJ(t))}
                      error={errors.cnpj}
                      icon={<Briefcase size={iconSizes.md} color={colors.textMuted} />}
                    />
                    <Input
                      label="Razão Social"
                      placeholder="Nome da empresa"
                      value={formData.razaoSocial}
                      onChangeText={set('razaoSocial')}
                      error={errors.razaoSocial}
                      icon={<Briefcase size={iconSizes.md} color={colors.textMuted} />}
                    />
                    <Input
                      label="Nome Fantasia (opcional)"
                      placeholder="Nome comercial"
                      value={formData.nomeFantasia}
                      onChangeText={set('nomeFantasia')}
                      icon={<Briefcase size={iconSizes.md} color={colors.textMuted} />}
                    />
                    <Input
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={t => set('phone')(formatPhone(t))}
                      error={errors.phone}
                      icon={<Phone size={iconSizes.md} color={colors.textMuted} />}
                    />
                  </>
                )}

                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                >
                  <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                    {acceptTerms && <View style={styles.checkboxInner} />}
                  </View>
                  <Text style={styles.termsText}>
                    Li e aceito os{' '}
                    <Text style={styles.termsLink}>Termos de Serviço</Text> e{' '}
                    <Text style={styles.termsLink}>Política de Privacidade</Text>
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
              <Text style={styles.loginText}>Já tem uma conta?</Text>
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
  container: { flex: 1 },
  keyboardView: { flex: 1 },
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
  progressContainer: { flex: 1 },
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
  progressText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
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
  roleLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: typography.weights.medium,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  roleButtonTextActive: { color: colors.text },
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
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxInner: { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.text },
  termsText: { flex: 1, fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 20 },
  termsLink: { color: colors.primary, fontWeight: typography.weights.medium },
  submitButton: { marginBottom: spacing.xl },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: typography.sizes.sm, color: colors.textMuted, paddingHorizontal: spacing.lg },
  loginSection: { alignItems: 'center' },
  loginText: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  loginLink: { fontSize: typography.sizes.md, color: colors.primary, fontWeight: typography.weights.semibold },
});