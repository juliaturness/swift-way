import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Package,
  MapPin,
  CheckCircle,
  TrendingUp,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useCargo } from '../../context/CargoContext';
import { StatCard } from '../../components/StatCard';
import { OfferCard } from '../../components/OfferCard';
import { ActiveTripCard } from '../../components/ActiveTripCard';
import { DocumentStatusCard } from '../../components/DocumentStatusCard';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';

export function HomeScreen() {
  const { state: authState } = useAuth();
  const {
    offers,
    activeTrip,
    documents,
    notifications,
    isLoading,
    acceptOffer,
    declineOffer,
    refreshOffers,
  } = useCargo();
  const [refreshing, setRefreshing] = useState(false);

  const user = authState.user;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshOffers();
    setRefreshing(false);
  }, [refreshOffers]);

  const handleAcceptOffer = async (offerId: number) => {
    Alert.alert(
      'Aceitar Oferta',
      'Deseja aceitar esta oferta de carga?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            const success = await acceptOffer(offerId);
            if (success) {
              Alert.alert('Sucesso', 'Oferta aceita com sucesso!');
            }
          },
        },
      ]
    );
  };

  const handleDeclineOffer = async (offerId: number) => {
    Alert.alert(
      'Recusar Oferta',
      'Deseja recusar esta oferta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            await declineOffer(offerId);
          },
        },
      ]
    );
  };

  const topOffers = offers.slice(0, 2);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Dashboard do Motorista</Text>
            <Text style={styles.welcomeText}>Bem-vindo de volta, {user?.name?.split(' ')[0]}!</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={iconSizes.lg} color={colors.text} />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            <StatCard
              title="Ofertas Disponiveis"
              value={offers.length}
              icon={Package}
              color="blue"
              delay={300}
            />
            <StatCard
              title="Viagens Ativas"
              value={activeTrip ? 1 : 0}
              icon={MapPin}
              color="orange"
              delay={400}
            />
            <StatCard
              title="Viagens Concluidas"
              value={user?.totalTrips || 0}
              icon={CheckCircle}
              color="green"
              delay={500}
            />
            <StatCard
              title="Ganhos Este Mes"
              value={`R$ ${((user?.monthlyEarnings || 0) / 1000).toFixed(1)}k`}
              icon={TrendingUp}
              color="purple"
              delay={600}
            />
          </ScrollView>
        </Animated.View>

        {/* Active Trip */}
        {activeTrip && (
          <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Viagem em Andamento</Text>
            </View>
            <ActiveTripCard
              trip={activeTrip}
              onViewDetails={() => {}}
              onUpdateStatus={() => {
                Alert.alert('Atualizar Status', 'Funcionalidade em desenvolvimento');
              }}
            />
          </Animated.View>
        )}

        {/* Offers */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ofertas para Voce</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Ver todas</Text>
              <ChevronRight size={iconSizes.sm} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {topOffers.length > 0 ? (
            topOffers.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onAccept={() => handleAcceptOffer(offer.id)}
                onDecline={() => handleDeclineOffer(offer.id)}
                delay={600 + index * 100}
                compact
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Package size={48} color={colors.textMuted} />
              <Text style={styles.emptyStateText}>Nenhuma oferta disponivel no momento</Text>
            </View>
          )}
        </Animated.View>

        {/* Documents Status */}
        <Animated.View entering={FadeInUp.delay(700).duration(400)} style={styles.section}>
          <DocumentStatusCard documents={documents} />
        </Animated.View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  welcomeText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statsContainer: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: spacing.xxxl,
  },
});
