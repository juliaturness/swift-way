import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, borderRadius, typography, spacing, iconSizes } from '../../theme';

// listinha com as cores e situações q a etiqueta pode ter, como sucesso, erro ou aviso.
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';

// listinha com os tamanhos permitidos pra etiqueta.
type BadgeSize = 'sm' | 'md' | 'lg';

// lista de todas as opções q podem ser passadas pra montar a etiqueta principal.
interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  outline?: boolean;
}

// rotina principal q desenha a etiqueta básica.
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  outline = false,
  style,
  ...props
}: BadgeProps) {
  // pega as cores e os tamanhos exatos baseados no q foi escolhido pra essa etiqueta.
  const variantStyles = getVariantStyles(variant, outline);
  const sizeStyles = getSizeStyles(size);

  // a parte visual da etiqueta, q surge na tela com uma animação rápida.
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[styles.badge, variantStyles.container, sizeStyles.container, style]}
      {...props}
    >
      {
        // se tiver um desenho ou ícone, coloca ele do lado do texto.
      }
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>
        {children}
      </Text>
    </Animated.View>
  );
}

// definindo as opções pra etiqueta q mostra a situação de um documento.
interface StatusBadgeProps {
  status: 'approved' | 'pending' | 'rejected';
  size?: BadgeSize;
}

// rotina q cria uma etiqueta pronta pra dizer se algo foi aprovado, rejeitado ou tá em análise.
export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  // dicionário q liga a situação do documento com a cor e o texto q vai aparecer.
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

// definindo as opções pra etiqueta de pontuação.
interface MatchBadgeProps {
  score: number;
  size?: BadgeSize;
}

// rotina q desenha uma etiqueta pra mostrar uma nota. a cor muda sozinha dependendo do valor.
export function MatchBadge({ score, size = 'md' }: MatchBadgeProps) {
  // rotina interna q escolhe a cor da etiqueta baseada na nota recebida.
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

// definindo as opções pra etiqueta q acompanha o andamento das viagens.
interface TripStatusBadgeProps {
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  size?: BadgeSize;
}

// rotina q cria uma etiqueta pra mostrar em qual etapa uma viagem tá.
export function TripStatusBadge({ status, size = 'md' }: TripStatusBadgeProps) {
  // dicionário q liga o andamento da viagem com a cor e a palavra certa.
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

// definindo as opções pra etiqueta q mostra a urgência de algo.
interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  size?: BadgeSize;
}

// rotina q desenha apenas uma pequena bolinha colorida pra indicar o nível de urgência.
export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  // dicionário q escolhe a cor da bolinha baseada na urgência.
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

// rotina interna q guarda as cores de fundo, borda e texto pra cada situação da etiqueta.
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

// rotina interna q ajusta os espaços e o tamanho das letras dependendo do tamanho escolhido.
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

// dicionário de enfeites q decide as bordas arredondadas e como os itens se alinham dentro da etiqueta.
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