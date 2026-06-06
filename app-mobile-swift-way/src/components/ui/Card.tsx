// importando as peças prontas q o sistema precisa pra desenhar pequenos quadros de informação na tela.
import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, borderRadius, typography, spacing, shadows } from '../../theme';

// listinha q diz tudo q o quadro principal pode receber, como a aparência e o espaço interno.
interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// rotina principal q desenha o quadro inteiro na tela com uma animação de surgimento suave.
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
  ...props
}: CardProps) {
  // pega as aparências exatas escolhidas pro quadro, como se tem sombra ou qual é a grossura da margem.
  const variantStyle = getVariantStyle(variant);
  const paddingStyle = getPaddingStyle(padding);

  // a parte visual do quadro msm, q agrupa as outras partes.
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.card, variantStyle, paddingStyle, style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

// listinha q define o q vai no topo do quadro, como título principal, subtítulo e algum botão.
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

// rotina q desenha a parte de cima do quadro.
export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {
          // se tiver um desenho ou ícone, ele é colocado do lado esquerdo.
        }
        {icon && <View style={styles.headerIcon}>{icon}</View>}
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          {
            // se tiver um textinho menor explicativo, ele entra logo embaixo do título.
          }
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {
        // espaço do lado direito pra colocar botões ou ações extras, se precisar.
      }
      {action && <View>{action}</View>}
    </View>
  );
}

// listinha q define o q vai no recheio do quadro.
interface CardContentProps {
  children: React.ReactNode;
}

// rotina q guarda o miolo do quadro, dando um espacinho pra n colar nas outras coisas.
export function CardContent({ children }: CardContentProps) {
  return <View style={styles.content}>{children}</View>;
}

// listinha pra parte de baixo do quadro.
interface CardFooterProps {
  children: React.ReactNode;
}

// rotina q desenha o rodapé, q geralmente tem botões de finalizar e uma linhazinha separando do resto.
export function CardFooter({ children }: CardFooterProps) {
  return <View style={styles.footer}>{children}</View>;
}

// rotina interna q escolhe se o quadro vai ter uma sombra projetada atrás ou apenas uma linha em volta.
const getVariantStyle = (variant: string) => {
  switch (variant) {
    case 'elevated':
      return { ...shadows.lg };
    case 'outlined':
      return { borderWidth: 1, borderColor: colors.border };
    default:
      return {};
  }
};

// rotina interna q decide a quantidade de espaço vazio de respiro dentro do quadro.
const getPaddingStyle = (padding: string) => {
  switch (padding) {
    case 'none':
      return { padding: 0 };
    case 'sm':
      return { padding: spacing.sm };
    case 'lg':
      return { padding: spacing.xxl };
    default:
      return { padding: spacing.lg };
  }
};

// dicionário de enfeites q organiza o tamanho das letras, cores, posições e as linhas de cada pedaço do quadro.
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  content: {
    marginVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});