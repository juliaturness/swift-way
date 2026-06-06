// importando as peças prontas q o aplicativo precisa pra criar o espaço de digitação.
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, iconSizes } from '../../theme';

// listinha de coisas q o espaço de texto pode receber, como um título, erro ou desenho.
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

// criando uma moldura especial q consegue mudar de cor fazendo uma animação suave.
const AnimatedView = Animated.createAnimatedComponent(View);

// rotina principal q desenha a área de texto na tela.
export function Input({
  label,
  error,
  icon,
  rightIcon,
  isPassword = false,
  style,
  ...props
}: InputProps) {
  // caixinha pra lembrar se o campo tá sendo clicado agora.
  const [isFocused, setIsFocused] = useState(false);
  
  // caixinha pra lembrar se é pra mostrar ou esconder as letras da senha.
  const [showPassword, setShowPassword] = useState(false);
  
  // número q controla o andamento da animação da borda.
  const focusProgress = useSharedValue(0);

  // regra q troca a cor da linha em volta do texto, mudando pra vermelho se der erro ou colorindo quando tá em uso.
  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      [error ? colors.error : colors.inputBorder, error ? colors.error : colors.inputFocus]
    );
    return { borderColor };
  });

  // o q acontece quando o campo é selecionado pra digitar.
  const handleFocus = () => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 200 });
  };

  // o q acontece quando o clique vai pra fora do campo.
  const handleBlur = () => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: 200 });
  };

  // a parte visual q forma o espaço de texto.
  return (
    <View style={styles.container}>
      {
        // se tiver um título pra identificar o campo, ele é colocado na parte de cima.
      }
      {label && <Text style={styles.label}>{label}</Text>}
      
      {
        // a caixa em volta do texto q pisca ou muda de cor.
      }
      <AnimatedView style={[styles.inputContainer, animatedBorderStyle]}>
        {
          // se tiver um desenho decorativo, ele fica na ponta esquerda.
        }
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        {
          // o lugar exato onde as letras digitadas vão aparecer.
        }
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        
        {
          // se for um campo de senha, cria um botão com formato de olho pra revelar as letras.
        }
        {isPassword && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={iconSizes.md} color={colors.textMuted} />
            ) : (
              <Eye size={iconSizes.md} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        )}
        
        {
          // se tiver um desenho pro final e n for senha, ele fica na ponta direita.
        }
        {rightIcon && !isPassword && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </AnimatedView>
      
      {
        // se existir algum problema na digitação, mostra o texto de erro logo abaixo.
      }
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// dicionário de enfeites q arruma os espaços, tamanhos e cores de cada pedaço do campo de texto.
const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.lg,
  },
  iconContainer: {
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  inputWithIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  passwordToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rightIconContainer: {
    paddingRight: spacing.md,
  },
  error: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});