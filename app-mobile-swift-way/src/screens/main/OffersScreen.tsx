import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Search, Filter, Package, SortDesc } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCargo } from '../../context/CargoContext';
import { OfferCard } from '../../components/OfferCard';
import { Input } from '../../components/ui/Input';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';
import { CargoOffer, MainTabParamList } from '../../types';

type OffersScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Offers'>;
};

type SortOption = 'match' | 'price' | 'distance' | 'date';

export function OffersScreen({ navigation }: OffersScreenProps) {
  const { offers, isLoading, acceptOffer, declineOffer, refreshOffers } = useCargo();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [refreshing, setRefreshing] = useState(false);

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
              Alert.alert('Sucesso', 'Oferta aceita com sucesso! A viagem foi agendada.');
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

  // Filter and sort offers
  const filteredOffers = offers
    .filter((offer) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        offer.origin.toLowerCase().includes(query) ||
        offer.destination.toLowerCase().includes(query) ||
        offer.carrier.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.matchScore - a.matchScore;
        case 'price':
          const priceA = parseFloat(a.price.replace(/[^\d,]/g, '').replace(',', '.'));
          const priceB = parseFloat(b.price.replace(/[^\d,]/g, '').replace(',', '.'));
          return priceB - priceA;
        case 'distance':
          const distA = parseFloat(a.distance);
          const distB = parseFloat(b.distance);
          return distA - distB;
        default:
          return 0;
      }
    });

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'match', label: 'Match' },
    { key: 'price', label: 'Preco' },
    { key: 'distance', label: 'Distancia' },
    { key: 'date', label: 'Data' },
  ];

  const renderItem = ({ item, index }: { item: CargoOffer; index: number }) => (
    <OfferCard
      offer={item}
      onAccept={() => handleAcceptOffer(item.id)}
      onDecline={() => handleDeclineOffer(item.id)}
      onDetails={() => {}}
      delay={index * 100}
    />
  );

  const ListHeader = () => (
    <>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
        <Text style={styles.title}>Ofertas de Cargas</Text>
        <Text style={styles.subtitle}>
          {filteredOffers.length} ofertas disponiveis para voce
        </Text>
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.searchContainer}>
        <Input
          placeholder="Buscar por origem, destino ou transportadora"
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Search size={iconSizes.md} color={colors.textMuted} />}
        />
      </Animated.View>

      {/* Sort Options */}
      <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.sortContainer}>
        <View style={styles.sortLabel}>
          <SortDesc size={iconSizes.sm} color={colors.textSecondary} />
          <Text style={styles.sortLabelText}>Ordenar por:</Text>
        </View>
        <View style={styles.sortOptions}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                sortBy === option.key && styles.sortOptionActive,
              ]}
              onPress={() => setSortBy(option.key)}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.key && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <Package size={64} color={colors.textMuted} />
      <Text style={styles.emptyStateTitle}>Nenhuma oferta encontrada</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'Tente ajustar sua busca para encontrar mais ofertas'
          : 'Novas ofertas aparecerao aqui em breve'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredOffers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  sortContainer: {
    marginBottom: spacing.xl,
  },
  sortLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sortLabelText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sortOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  sortOptionTextActive: {
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  emptyStateTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
});
