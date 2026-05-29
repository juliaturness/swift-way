import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TripStatusBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { colors, borderRadius, typography, spacing } from '../theme';
import { Trip } from '../types';

interface ActiveTripCardProps {
  trip: Trip;
  onViewDetails: () => void;
  onUpdateStatus: () => void;
}

export function ActiveTripCard({ trip, onViewDetails, onUpdateStatus }: ActiveTripCardProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Viagem #{trip.id}</Text>
              <TripStatusBadge status={trip.status} size="sm" />
            </View>
            <Text style={styles.carrier}>{trip.carrier}</Text>
          </View>
          <Text style={styles.payment}>{trip.payment}</Text>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
            <View>
              <Text style={styles.routeLabel}>Origem</Text>
              <Text style={styles.routeText}>{trip.origin}</Text>
            </View>
          </View>
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
            <View>
              <Text style={styles.routeLabel}>Destino</Text>
              <Text style={styles.routeText}>{trip.destination}</Text>
            </View>
          </View>
        </View>

        {trip.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progresso</Text>
              <Text style={styles.progressValue}>{trip.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: `${trip.progress}%` }]}
              />
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Ver Detalhes"
            variant="outline"
            size="md"
            onPress={onViewDetails}
            style={styles.actionButton}
          />
          <Button
            title="Atualizar Status"
            variant="primary"
            size="md"
            onPress={onUpdateStatus}
            style={styles.actionButton}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  carrier: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  payment: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  routeContainer: {
    marginBottom: spacing.lg,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  routeLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  routeText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
