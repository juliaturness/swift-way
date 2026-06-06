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
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

// definindo como o aplicativo vai navegar entre as telas.
type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

// dizendo pro sistema os tipos de conta q existem.
type Role = 'DRIVER' | 'CARRIER';

// lista de todas as informações q o cadastro vai pedir.
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
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

// lista dos possíveis erros q podem aparecer se faltar preencher algo.
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

// rotina principal q desenha a tela de criar uma conta nova.
export function RegisterScreen({ navigation }: RegisterScreenProps) {
  // pegando as ferramentas de acesso do sistema.
  const { register, state } = useAuth();
  
  // caixinha pra guardar em qual etapa do cadastro a tela tá.
  const [step, setStep] = useState(1); // 1: role + email/senha | 2: dados do perfil
  
  // caixinha pra saber se as regras de uso foram aceitas.
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // caixinha q guarda todas as informações preenchidas.
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
  
  // caixinha pra guardar os avisos de erro na digitação.
  const [errors, setErrors] = useState<FormErrors>({});

  // atalho pra atualizar uma informação específica q acabou de ser digitada.
  const set = (field: keyof FormData) => (value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // ── validações ─────────────────────────────────────────────────────────────

  // checa se a primeira parte do cadastro foi preenchida direito.
  const validateStep1 = (): boolean => {
    const e: FormErrors = {};
    
    // avisa se o e-mail tá vazio ou n tem um formato normal.
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      e.email = 'E-mail inválido';
      
    // pede uma senha mais longa se a digitada for muito curta.
    if (!formData.password || formData.password.length < 6)
      e.password = 'Senha deve ter pelo menos 6 caracteres';
      
    // confere se as duas senhas digitadas são iguais.
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Senhas não conferem';
      
    // salva os problemas encontrados.
    setErrors(e);
    
    // diz se tá tudo certo pra continuar pra próxima etapa.
    return Object.keys(e).length === 0;
  };

  // checa se a segunda parte do cadastro tem algum erro.
  const validateStep2 = (): boolean => {
    const e: FormErrors = {};
    
    // regras de validação se for uma conta de motorista.
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
      if (!formData.cnhValidity)
        e.cnhValidity = 'Validade CNH obrigatória';
        
    // regras de validação se for uma conta de transportadora.
    } else {
      if (!formData.cnpj || formData.cnpj.replace(/\D/g, '').length !== 14)
        e.cnpj = 'CNPJ inválido';
      if (!formData.razaoSocial)
        e.razaoSocial = 'Razão social obrigatória';
    }
    
    // avisa q precisa aceitar as regras pra finalizar.
    if (!acceptTerms) e.confirmPassword = 'Você deve aceitar os termos';
    
    // salva os problemas encontrados.
    setErrors(e);
    
    // diz se tá tudo certo pra finalmente criar a conta.
    return Object.keys(e).length === 0;
  };

  // ── submit ─────────────────────────────────────────────────────────────────

  // o q acontece quando o botão final pra criar a conta é apertado.
  const handleRegister = async () => {
    // se tiver algum erro na digitação, a ação é interrompida.
    if (!validateStep2()) return;

    // arruma a data de validade pro formato q o servidor entende.
    // Converte "DD/MM/YYYY" → "YYYY-MM-DD" para o backend
    const [d, m, y] = formData.cnhValidity.split('/');
    const cnhValidityIso = formData.cnhValidity ? `${y}-${m}-${d}` : undefined;

    // manda as informações pra salvar a conta de verdade no sistema.
    const success = await register({
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
      // campos driver
      fullName: formData.role === 'DRIVER' ? formData.fullName : undefined,
      cpf: formData.role === 'DRIVER' ? formData.cpf : undefined,
      cnhNumber: formData.role === 'DRIVER' ? formData.cnhNumber : undefined,
      cnhCategory: formData.role === 'DRIVER' ? formData.cnhCategory : undefined,
      cnhValidity: formData.role === 'DRIVER' ? cnhValidityIso : undefined,
      // campos carrier
      cnpj: formData.role === 'CARRIER' ? formData.cnpj : undefined,
      razaoSocial: formData.role === 'CARRIER' ? formData.razaoSocial : undefined,
      nomeFantasia: formData.role === 'CARRIER' ? formData.nomeFantasia : undefined,
    });

    // se o servidor avisar q deu algum problema, mostra na tela.
    if (!success) {
      setErrors({ confirmPassword: 'Erro ao criar conta. Verifique os dados e tente novamente.' });
    }
  };

  // ── formatters ─────────────────────────────────────────────────────────────

  // rotinas pra deixar os números bonitinhos automaticamente enquanto a pessoa digita.

  // coloca parênteses e traço no telefone.
  const formatPhone = (text: string) => {
    const c = text.replace(/\D/g, '');
    if (c.length <= 2) return `(${c}`;
    if (c.length <= 7) return `(${c.slice(0, 2)}) ${c.slice(2)}`;
    return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7, 11)}`;
  };

  // coloca os pontos e o traço no cpf.
  const formatCPF = (text: string) => {
    const c = text.replace(/\D/g, '');
    if (c.length <= 3) return c;
    if (c.length <= 6) return `${c.slice(0, 3)}.${c.slice(3)}`;
    if (c.length <= 9) return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6)}`;
    return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9, 11)}`;
  };

  // coloca os pontos, a barra e o traço no cnpj.
  const formatCNPJ = (text: string) => {
    const c = text.replace(/\D/g, '');
    if (c.length <= 2) return c;
    if (c.length <= 5) return `${c.slice(0, 2)}.${c.slice(2)}`;
    if (c.length <= 8) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5)}`;
    if (c.length <= 12) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8)}`;
    return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12, 14)}`;
  };

  // coloca as barras pra separar dia, mês e ano na data.
  const formatDate = (text: string) => {
    const c = text.replace(/\D/g, '');
    if (c.length <= 2) return c;
    if (c.length <= 4) return `${c.slice(0, 2)}/${c.slice(2)}`;
    return `${c.slice(0, 2)}/${c.slice(2, 4)}/${c.slice(4, 8)}`;
  };

  // ── render ─────────────────────────────────────────────────────────────────

  // a parte visual q realmente aparece na tela do celular.
  return (
    <LinearGradient colors={colors.gradientDark} style={styles.container}>
      {
        // previne q o teclado esconda os campos q tão sendo digitados.
      }
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {
            // topo da tela com o botão de voltar e a barrinha q mostra o progresso do cadastro.
          }
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

          {
            // quadro principal onde ficam os espaços pra preencher as informações.
          }
          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.formCard}>
            <Text style={styles.formTitle}>
              {step === 1 ? 'Criar sua conta' : 'Dados do perfil'}
            </Text>
            <Text style={styles.formSubtitle}>
              {step === 1 ? 'Escolha seu perfil e defina o acesso' : 'Preencha suas informações'}
            </Text>

            {
              // mostra campos diferentes dependendo da etapa do cadastro.
            }
            {step === 1 ? (
              <View style={styles.form}>
                {
                  // botões pra escolher se é motorista ou transportadora.
                }
                <Text style={styles.roleLabel}>Tipo de conta</Text>
                <View style={styles.roleRow}>
                  {(['DRIVER', 'CARRIER'] as Role[]).map(role => (
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

                {
                  // espaços de preencher os dados de acesso da conta.
                }
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

                {
                  // botão pra ir pra segunda etapa do cadastro.
                }
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
                {
                  // decide o q mostrar baseado no tipo de perfil escolhido.
                }
                {formData.role === 'DRIVER' ? (
                  <>
                    {
                      // formulário q aparece só pra motoristas.
                    }
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
                    {
                      // formulário q aparece só pra empresas transportadoras.
                    }
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

                {
                  // área apertável pra concordar com as regras do sistema.
                }
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

                {
                  // o botão grandão de finalizar pra criar a conta de vez.
                }
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

            {
              // uma linha só pra separar e organizar a tela.
            }
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {
              // atalho pra ir pra tela de entrar se a pessoa lembrou q já tem conta.
            }
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

// um dicionário de enfeites q arruma a altura, largura, cor e posição de tudo na tela.
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