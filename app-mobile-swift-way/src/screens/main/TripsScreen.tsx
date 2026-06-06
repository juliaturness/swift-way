import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useCargo } from '../../context/CargoContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Trip, TripStatus } from '../../types';

type TabType = 'active' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<TripStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  accepted: { label: 'Aceita', variant: 'info' },
  in_transit: { label: 'Em Trânsito', variant: 'info' },
  loading: { label: 'Carregando', variant: 'warning' },
  unloading: { label: 'Descarregando', variant: 'warning' },
  delivered: { label: 'Entregue', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'error' },
  completed: { label: 'Concluída', variant: 'success' },
};

export function TripsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { trips, refreshTrips, isLoading, updateTripStatus } = useCargo();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshTrips();
    setRefreshing(false);
  }, [refreshTrips]);

  const filterTrips = (tab: TabType): Trip[] => {
    switch (tab) {
      case 'active':
        return trips.filter(t =>
          ['pending', 'accepted', 'in_transit', 'loading', 'unloading'].includes(t.status)
        );
      case 'completed':
        return trips.filter(t => ['delivered', 'completed'].includes(t.status));
      case 'cancelled':
        return trips.filter(t => t.status === 'cancelled');
      default:
        return trips;
    }
  };

  const filteredTrips = filterTrips(activeTab);

  const handleTripAction = async (trip: Trip, action: 'start' | 'arrive' | 'complete') => {
    let newStatus: TripStatus;
    switch (action) {
      case 'start':
        newStatus = 'in_transit';
        break;
      case 'arrive':
        newStatus = 'unloading';
        break;
      case 'complete':
        newStatus = 'delivered';
        break;
      default:
        return;
    }
    await updateTripStatus(trip.id, newStatus);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const renderTripCard = (trip: Trip) => {
    const statusConfig = STATUS_CONFIG[trip.status];
    const isActive = ['pending', 'accepted', 'in_transit', 'loading', 'unloading'].includes(trip.status);

    return (
      <Card key={trip.id} style={styles.tripCard}>
        <View style={styles.tripHeader}>
          <View style={styles.tripIdContainer}>
            <Text style={[styles.tripId, { color: theme.colors.textSecondary }]}>
              #{String(trip.id).slice(0, 8).toUpperCase()}
            </Text>
            <Badge variant={statusConfig.variant} size="small">
              {statusConfig.label}
            </Badge>
          </View>
          <Text style={[styles.tripPrice, { color: theme.colors.primary }]}>
            {formatCurrency(trip.cargo.price)}
          </Text>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: theme.colors.success }]} />
            <View style={styles.routeTextContainer}>
              <Text style={[styles.routeCity, { color: theme.colors.text }]}>
                {trip.cargo.origin.city}
              </Text>
              <Text style={[styles.routeState, { color: theme.colors.textSecondary }]}>
                {trip.cargo.origin.state}
              </Text>
            </View>
          </View>

          <View style={[styles.routeLine, { borderColor: theme.colors.border }]} />

          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: theme.colors.error }]} />
            <View style={styles.routeTextContainer}>
              <Text style={[styles.routeCity, { color: theme.colors.text }]}>
                {trip.cargo.destination.city}
              </Text>
              <Text style={[styles.routeState, { color: theme.colors.textSecondary }]}>
                {trip.cargo.destination.state}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.tripInfo, { borderTopColor: theme.colors.border }]}>
          <View style={styles.infoItem}>
            <Ionicons name="cube-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {trip.cargo.weight.toLocaleString()} kg
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="navigate-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {trip.cargo.distance} km
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {formatDate(trip.startDate || trip.cargo.pickupDate)}
            </Text>
          </View>
        </View>

        {isActive && (
          <View style={styles.actionsContainer}>
            {trip.status === 'accepted' && (
              <Button
                variant="primary"
                size="small"
                onPress={() => handleTripAction(trip, 'start')}
                style={styles.actionButton}
              >
                Iniciar Viagem
              </Button>
            )}
            {trip.status === 'in_transit' && (
              <Button
                variant="primary"
                size="small"
                onPress={() => handleTripAction(trip, 'arrive')}
                style={styles.actionButton}
              >
                Cheguei no Destino
              </Button>
            )}
            {trip.status === 'unloading' && (
              <Button
                variant="success"
                size="small"
                onPress={() => handleTripAction(trip, 'complete')}
                style={styles.actionButton}
              >
                Finalizar Entrega
              </Button>
            )}
            <Button
              variant="ghost"
              size="small"
              onPress={() => navigation.navigate('TripDetails', { tripId: trip.id })}
            >
              Ver Detalhes
            </Button>
          </View>
        )}

        {!isActive && (
          <TouchableOpacity
            style={[styles.viewDetailsButton, { borderTopColor: theme.colors.border }]}
            onPress={() => navigation.navigate('TripDetails', { tripId: trip.id })}
          >
            <Text style={[styles.viewDetailsText, { color: theme.colors.primary }]}>
              Ver Detalhes
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surface }]}>
        <Ionicons
          name={activeTab === 'active' ? 'car-outline' : activeTab === 'completed' ? 'checkmark-circle-outline' : 'close-circle-outline'}
          size={48}
          color={theme.colors.textSecondary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {activeTab === 'active'
          ? 'Nenhuma viagem ativa'
          : activeTab === 'completed'
            ? 'Nenhuma viagem concluída'
            : 'Nenhuma viagem cancelada'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {activeTab === 'active'
          ? 'Aceite uma oferta para iniciar sua próxima viagem'
          : 'Suas viagens aparecerão aqui'}
      </Text>
      {activeTab === 'active' && (
        <Button
          variant="primary"
          onPress={() => navigation.navigate('Offers')}
          style={styles.emptyButton}
        >
          Ver Ofertas Disponíveis
        </Button>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Minhas Viagens</Text>
        <TouchableOpacity
          style={[styles.historyButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('TripHistory')}
        >
          <Ionicons name="time-outline" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}>
        {(['active', 'completed', 'cancelled'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? '#FFFFFF' : theme.colors.textSecondary },
              ]}
            >
              {tab === 'active' ? 'Ativas' : tab === 'completed' ? 'Concluídas' : 'Canceladas'}
            </Text>
            {tab === 'active' && filterTrips('active').length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: activeTab === tab ? '#FFFFFF' : theme.colors.primary }]}>
                <Text style={[styles.tabBadgeText, { color: activeTab === tab ? theme.colors.primary : '#FFFFFF' }]}>
                  {filterTrips('active').length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {filteredTrips.length > 0 ? (
          filteredTrips.map(renderTripCard)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tripCard: {
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tripIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripId: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeCity: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeState: {
    fontSize: 13,
  },
  routeLine: {
    width: 1,
    height: 24,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    marginLeft: 5.5,
    marginVertical: 4,
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    minWidth: 200,
  },
});
