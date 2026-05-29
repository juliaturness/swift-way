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

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const sizeStyles = getSizeStyles(size);
  const isDisabled = disabled || loading;

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

const getTextStyle = (variant: string): TextStyle => {
  switch (variant) {
    case 'outline':
    case 'ghost':
      return { color: colors.primary };
    default:
      return { color: colors.text };
  }
};

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
