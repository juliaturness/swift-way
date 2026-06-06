// pegando as ferramentas prontas q o botão precisa pra funcionar e animar.
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, borderRadius, typography, spacing } from '../../theme';

// listinha com tudo q dá pra mudar no botão, como tamanho, cor, ícone e texto.
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

// criando uma área apertável q consegue fazer animações de movimento.
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// rotina principal q desenha e controla o botão na tela.
export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  // caixinha q guarda o tamanho atual do botão pra fazer o efeito de apertar.
  const scale = useSharedValue(1);

  // liga o tamanho visual do botão com o valor guardado na caixinha.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // o q acontece quando o dedo encosta na tela: o botão encolhe um pouquinho.
  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
  };

  // o q acontece quando o dedo solta a tela: o botão volta ao normal dando um pulinho.
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  // pega as medidas certas de acordo com o tamanho escolhido pro botão.
  const sizeStyles = getSizeStyles(size);
  
  // confere se o botão tá travado, seja pq tá carregando ou pq foi desativado msm.
  const isDisabled = disabled || loading;

  // o recheio do botão. decide se mostra a rodinha de carregar ou o texto com o desenho.
  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.text}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              getTextStyle(variant),
              icon && iconPosition === 'left' && styles.textWithLeftIcon,
              icon && iconPosition === 'right' && styles.textWithRightIcon,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  // se for o botão principal e mais importante, ele é desenhado com cores misturadas no fundo.
  if (variant === 'primary') {
    return (
      <AnimatedTouchable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[animatedStyle, fullWidth && styles.fullWidth, style as ViewStyle]}
        activeOpacity={0.9}
        {...props}
      >
        <LinearGradient
          colors={isDisabled ? [colors.textMuted, colors.textMuted] : colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, sizeStyles.button, isDisabled && styles.disabled]}
        >
          {content}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  // se n for o principal, desenha os outros tipos de botão, como o transparente ou o vermelho de perigo.
  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.button,
        sizeStyles.button,
        getVariantStyle(variant),
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style as ViewStyle,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {content}
    </AnimatedTouchable>
  );
}

// rotina q ajusta o botão pra ficar pequeno, médio ou grande.
const getSizeStyles = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        button: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
        text: { fontSize: typography.sizes.sm },
      };
    case 'lg':
      return {
        button: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl },
        text: { fontSize: typography.sizes.lg },
      };
    default:
      return {
        button: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
        text: { fontSize: typography.sizes.md },
      };
  }
};

// rotina q pinta o fundo dependendo da utilidade do botão.
const getVariantStyle = (variant: string): ViewStyle => {
  switch (variant) {
    case 'secondary':
      return { backgroundColor: colors.card };
    case 'outline':
      return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    case 'danger':
      return { backgroundColor: colors.error };
    default:
      return {};
  }
};

// rotina q escolhe se a letra vai ser colorida ou branca dependendo do fundo.
const getTextStyle = (variant: string): TextStyle => {
  switch (variant) {
    case 'outline':
    case 'ghost':
      return { color: colors.primary };
    default:
      return { color: colors.text };
  }
};

// listinha de enfeites q diz como arredondar as bordas, centralizar as coisas e dar os espaços certos.
const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  text: {
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  textWithLeftIcon: {
    marginLeft: spacing.sm,
  },
  textWithRightIcon: {
    marginRight: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});