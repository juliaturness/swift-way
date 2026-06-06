import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { MapPin, TrendingUp } from 'lucide-react-native';
import { MatchBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { colors, borderRadius, typography, spacing } from '../theme';
import { CargoOffer } from '../types';

interface OfferCardProps {
  offer: CargoOffer;
  onAccept: () => void;
  onDecline: () => void;
  onDetails?: () => void;
  delay?: number;
  compact?: boolean;
}

export function OfferCard({
  offer,
  onAccept,
  onDecline,
  onDetails,
  delay = 0,
  compact = false,
}: OfferCardProps) {
  return (
    <Animated.View
      entering={FadeInRight.delay(delay).duration(400)}
      style={[styles.card, compact && styles.cardCompact]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Oferta #{offer.id}</Text>
            <MatchBadge score={offer.matchScore} size="sm" />
          </View>
          {!compact && (
            <Text style={styles.carrier}>Por {offer.carrier}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.price}>{offer.price}</Text>
          <Text style={styles.distance}>{offer.distance}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeItem}>
          <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
          <View style={styles.routeTextContainer}>
            {!compact && <Text style={styles.routeLabel}>Origem</Text>}
            <Text style={styles.routeText} numberOfLines={1}>{offer.origin}</Text>
          </View>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeItem}>
          <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
          <View style={styles.routeTextContainer}>
            {!compact && <Text style={styles.routeLabel}>Destino</Text>}
            <Text style={styles.routeText} numberOfLines={1}>{offer.destination}</Text>
          </View>
        </View>
      </View>

      {!compact && (
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Peso</Text>
            <Text style={styles.infoValue}>{offer.weight}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Veiculo</Text>
            <Text style={styles.infoValue}>{offer.vehicleType}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Coleta</Text>
            <Text style={styles.infoValue}>{offer.pickupDate}</Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        {onDetails && (
          <TouchableOpacity onPress={onDetails}>
            <Text style={styles.detailsLink}>Ver Detalhes</Text>
          </TouchableOpacity>
        )}
        <View style={styles.actions}>
          <Button
            title="Recusar"
            variant="outline"
            size="sm"
            onPress={onDecline}
            style={styles.declineButton}
          />
          <Button
            title="Aceitar"
            variant="primary"
            size="sm"
            onPress={onAccept}
          />
        </View>
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
    marginBottom: spacing.md,
  },
  cardCompact: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
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
  headerRight: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  distance: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  routeContainer: {
    marginBottom: spacing.md,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  routeText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailsLink: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  declineButton: {
    marginRight: spacing.sm,
  },
});
