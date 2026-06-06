import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, borderRadius, typography, spacing, iconSizes } from '../../theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  outline?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  outline = false,
  style,
  ...props
}: BadgeProps) {
  const variantStyles = getVariantStyles(variant, outline);
  const sizeStyles = getSizeStyles(size);

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[styles.badge, variantStyles.container, sizeStyles.container, style]}
      {...props}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>
        {children}
      </Text>
    </Animated.View>
  );
}

// Badge para status de documentos
interface StatusBadgeProps {
  status: 'approved' | 'pending' | 'rejected';
  size?: BadgeSize;
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    approved: { variant: 'success' as const, label: 'Aprovado' },
    pending: { variant: 'warning' as const, label: 'Em Análise' },
    rejected: { variant: 'error' as const, label: 'Rejeitado' },
  };

  return (
    <Badge variant={config[status].variant} size={size}>
      {config[status].label}
    </Badge>
  );
}

// Badge para match score
interface MatchBadgeProps {
  score: number;
  size?: BadgeSize;
}

export function MatchBadge({ score, size = 'md' }: MatchBadgeProps) {
  const getVariant = (): BadgeVariant => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  return (
    <Badge variant={getVariant()} size={size}>
      {score}% Match
    </Badge>
  );
}

// Badge para status de viagem
interface TripStatusBadgeProps {
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  size?: BadgeSize;
}

export function TripStatusBadge({ status, size = 'md' }: TripStatusBadgeProps) {
  const config = {
    scheduled: { variant: 'info' as const, label: 'Agendada' },
    in_progress: { variant: 'purple' as const, label: 'Em Trânsito' },
    completed: { variant: 'success' as const, label: 'Concluída' },
    cancelled: { variant: 'error' as const, label: 'Cancelada' },
  };

  return (
    <Badge variant={config[status].variant} size={size}>
      {config[status].label}
    </Badge>
  );
}

// Badge para prioridade
interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  size?: BadgeSize;
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = {
    high: { color: colors.error },
    medium: { color: colors.warning },
    low: { color: colors.info },
  };

  return (
    <View
      style={[
        styles.priorityDot,
        { backgroundColor: config[priority].color },
        size === 'sm' && { width: 8, height: 8 },
        size === 'lg' && { width: 12, height: 12 },
      ]}
    />
  );
}

const getVariantStyles = (variant: BadgeVariant, outline: boolean) => {
  const variants = {
    default: {
      bg: colors.card,
      border: colors.border,
      text: colors.textSecondary,
    },
    success: {
      bg: colors.successBg,
      border: colors.success,
      text: colors.success,
    },
    warning: {
      bg: colors.warningBg,
      border: colors.warning,
      text: colors.warning,
    },
    error: {
      bg: colors.errorBg,
      border: colors.error,
      text: colors.error,
    },
    info: {
      bg: colors.infoBg,
      border: colors.info,
      text: colors.info,
    },
    purple: {
      bg: colors.purpleBg,
      border: colors.purple,
      text: colors.purple,
    },
  };

  const v = variants[variant];
  return {
    container: {
      backgroundColor: outline ? 'transparent' : v.bg,
      borderWidth: 1,
      borderColor: v.border,
    },
    text: { color: v.text },
  };
};

const getSizeStyles = (size: BadgeSize) => {
  switch (size) {
    case 'sm':
      return {
        container: { paddingVertical: 2, paddingHorizontal: spacing.sm },
        text: { fontSize: typography.sizes.xs },
      };
    case 'lg':
      return {
        container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
        text: { fontSize: typography.sizes.md },
      };
    default:
      return {
        container: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
        text: { fontSize: typography.sizes.sm },
      };
  }
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: typography.weights.medium,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
  },
});
