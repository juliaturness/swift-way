import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LucideIcon } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, shadows } from '../theme';

// listinha q diz tudo q o cartão de números precisa receber de fora pra dar certo.
interface StatCardProps extends ViewProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  delay?: number;
}

// rotina principal q desenha o pequeno cartão de números na tela.
export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  delay = 0,
  style,
  ...props
}: StatCardProps) {
  // pega as cores exatas escolhidas pro desenho.
  const colorStyles = getColorStyles(color);

  // a parte visual q realmente aparece pro usuário no celular.
  return (
    // a caixa principal do cartão, q surge flutuando pra cima.
    <Animated.View
      entering={FadeInUp.delay(delay).duration(400)}
      style={[styles.card, style]}
      {...props}
    >
      {
        // espacinho colorido onde fica o desenho.
      }
      <View style={[styles.iconContainer, { backgroundColor: colorStyles.bg }]}>
        <Icon size={24} color={colorStyles.icon} />
      </View>
      {
        // o número grandão q chama atenção.
      }
      <Text style={styles.value}>{value}</Text>
      {
        // o texto menor q explica o q é esse número.
      }
      <Text style={styles.title}>{title}</Text>
    </Animated.View>
  );
}

// rotina interna q troca a cor do desenho e do fundo dependendo do q foi pedido.
const getColorStyles = (color: string) => {
  switch (color) {
    case 'green':
      return { bg: colors.successBg, icon: colors.success };
    case 'orange':
      return { bg: colors.warningBg, icon: colors.warning };
    case 'purple':
      return { bg: colors.purpleBg, icon: colors.purple };
    default:
      return { bg: colors.infoBg, icon: colors.info };
  }
};

// dicionário de enfeites q organiza o tamanho, cor e posição de cada parte do cartão.
const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minWidth: 140,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});