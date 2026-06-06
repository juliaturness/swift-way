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

// definindo q a tela precisa saber como navegar pra outras partes do app.
type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

// rotina principal q desenha a tela de login.
export function LoginScreen({ navigation }: LoginScreenProps) {
  // pegando a ação de entrar e o estado atual do sistema de contas.
  const { login, state } = useAuth();
  
  // criando caixinhas de memória pra guardar as informações q o usuário digitar.
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  // caixinha pra guardar os avisos de erro na digitação.
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  // caixinha pra saber se o usuário quer q o sistema lembre da conta depois.
  const [rememberMe, setRememberMe] = useState(false);

  // validação q confere se o q foi digitado faz sentido antes de tentar entrar.
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // se n tem email, prepara o aviso de q é obrigatório.
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    // se o email n tem um formato normal, avisa q tá inválido.
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    // se n tem senha, pede pra digitar.
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    // a senha precisa ter pelo menos 6 letras ou números.
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // guarda os erros encontrados na caixinha de erros.
    setErrors(newErrors);
    
    // informa se tudo deu certo e n tem nenhum erro.
    return Object.keys(newErrors).length === 0;
  };

  // o q acontece quando o botão de entrar é apertado.
  const handleLogin = async () => {
    // se as informações n passaram na checagem, a ação é interrompida.
    if (!validateForm()) return;

    // tenta fazer o acesso com o email e senha digitados.
    const success = await login(formData.email, formData.password);
    
    // se n deu certo, mostra um aviso na tela.
    if (!success) {
      setErrors({ password: 'E-mail ou senha incorretos' });
    }
  };

  // a parte visual q aparece pro usuário no celular.
  return (
    <LinearGradient colors={colors.gradientDark} style={styles.container}>
      {
        // faz com q o teclado do celular n esconda as coisas q o usuário tá lendo ou digitando.
      }
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {
          // permite rolar a tela pra cima e pra baixo.
        }
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {
            // topo da tela com o botão de voltar. tem uma animação suave ao aparecer.
          }
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
            {
              // botão q dá pra apertar pra voltar pra tela anterior.
            }
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={iconSizes.lg} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>

          {
            // espaço onde fica o desenho do caminhão e o nome do aplicativo.
          }
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.logoSection}>
            <View style={styles.logoWrapper}>
              <Truck size={iconSizes.xxl} color={colors.text} />
            </View>
            <Text style={styles.logoTitle}>SWIFT WAY</Text>
            <Text style={styles.logoSubtitle}>Sistema Logístico</Text>
          </Animated.View>

          {
            // quadro principal onde ficam os espaços pra preencher os dados.
          }
          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.formCard}>
            <Text style={styles.formTitle}>Bem-vindo de volta!</Text>
            <Text style={styles.formSubtitle}>
              Entre com suas credenciais para acessar o sistema
            </Text>

            <View style={styles.form}>
              {
                // espaço pra preencher o e-mail.
              }
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

              {
                // espaço pra preencher a senha, escondendo as letras.
              }
              <Input
                label="Senha"
                placeholder="Digite sua senha"
                isPassword
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                error={errors.password}
                icon={<Lock size={iconSizes.md} color={colors.textMuted} />}
              />

              {
                // linha com as opções de lembrar conta e recuperar senha.
              }
              <View style={styles.optionsRow}>
                {
                  // botão de marcar pra salvar a conta.
                }
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <View style={styles.checkboxInner} />}
                  </View>
                  <Text style={styles.rememberMeText}>Lembrar-me</Text>
                </TouchableOpacity>

                {
                  // texto apertável pra quem esqueceu a senha.
                }
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              </View>

              {
                // botão grande pra confirmar e entrar.
              }
              <Button
                title="Entrar"
                variant="primary"
                size="lg"
                fullWidth
                loading={state.isLoading}
                onPress={handleLogin}
                style={styles.loginButton}
              />

              {
                // uma linha desenhada só pra separar a tela visualmente.
              }
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {
                // botão pra quem ainda n tem conta e quer criar uma nova.
              }
              <View style={styles.registerSection}>
                <Text style={styles.registerText}>Não tem uma conta?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Cadastre-se gratuitamente</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {
            // o rodapé da tela com as regras de uso do aplicativo.
          }
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

// um dicionário de enfeites q decide a altura, cor, largura e posições de tudo q aparece na tela.
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  rememberMe: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
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
  rememberMeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
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