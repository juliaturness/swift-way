import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, iconSizes } from '../theme';
import { Document } from '../types';

interface DocumentStatusCardProps {
  documents: Document[];
}

export function DocumentStatusCard({ documents }: DocumentStatusCardProps) {
  const approved = documents.filter((d) => d.status === 'approved');
  const pending = documents.filter((d) => d.status === 'pending');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={iconSizes.sm} color={colors.success} />;
      case 'pending':
        return <Clock size={iconSizes.sm} color={colors.warning} />;
      default:
        return <AlertCircle size={iconSizes.sm} color={colors.error} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: colors.successBg, border: colors.success, text: colors.success };
      case 'pending':
        return { bg: colors.warningBg, border: colors.warning, text: colors.warning };
      default:
        return { bg: colors.errorBg, border: colors.error, text: colors.error };
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
      <Text style={styles.title}>Status dos Documentos</Text>
      <View style={styles.grid}>
        {documents.slice(0, 4).map((doc) => {
          const statusColor = getStatusColor(doc.status);
          return (
            <View
              key={doc.id}
              style={[
                styles.docItem,
                { backgroundColor: statusColor.bg, borderColor: statusColor.border },
              ]}
            >
              <View style={styles.docHeader}>
                {getStatusIcon(doc.status)}
                <Text style={[styles.docName, { color: statusColor.text }]} numberOfLines={1}>
                  {doc.type}
                </Text>
              </View>
              <Text style={[styles.docExpiry, { color: statusColor.text }]} numberOfLines={1}>
                {doc.status === 'approved' && doc.expiryDate
                  ? `Valido ate ${doc.expiryDate}`
                  : doc.status === 'pending'
                  ? 'Em analise'
                  : 'Rejeitado'}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  docItem: {
    width: '48%',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  docName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  docExpiry: {
    fontSize: typography.sizes.xs,
  },
});
