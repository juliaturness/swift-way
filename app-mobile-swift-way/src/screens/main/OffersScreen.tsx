import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Search, Package, SortDesc } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCargo } from '../../context/CargoContext';
import { OfferCard } from '../../components/OfferCard';
import { Input } from '../../components/ui/Input';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';
import { CargoOffer, MainTabParamList, RootStackParamList } from '../../types';

type OffersScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Offers'>;
};

type SortOption = 'match' | 'price' | 'distance';

// Retorna o UUID real da oferta (guardado em _offerId pelo CargoContext)
function getOfferId(offer: CargoOffer): string {
  return (offer as any)._offerId ?? String(offer.id);
}

export function OffersScreen({ navigation }: OffersScreenProps) {
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    offers, isLoading,
    acceptOffer, declineOffer,
    refreshOffers, loadMoreOffers, hasMoreOffers,
  } = useCargo();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy]           = useState<SortOption>('match');
  const [refreshing, setRefreshing]   = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshOffers();
    setRefreshing(false);
  }, [refreshOffers]);

  const onEndReached = useCallback(() => {
    if (hasMoreOffers && !isLoading) loadMoreOffers();
  }, [hasMoreOffers, isLoading, loadMoreOffers]);

  // ── ações ─────────────────────────────────────────────────────────────────

  const handleAccept = (offer: CargoOffer) => {
    Alert.alert('Aceitar Oferta', 'Deseja aceitar esta oferta de carga?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceitar',
        onPress: async () => {
          const success = await acceptOffer(getOfferId(offer));
          if (success) Alert.alert('Sucesso', 'Oferta aceita! A viagem foi agendada.');
        },
      },
    ]);
  };

  const handleDecline = (offer: CargoOffer) => {
    Alert.alert('Recusar Oferta', 'Deseja recusar esta oferta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Recusar',
        style: 'destructive',
        onPress: () => declineOffer(getOfferId(offer)),
      },
    ]);
  };

  const handleDetails = (offer: CargoOffer) => {
    rootNav.navigate('CargoDetails', { cargoId: getOfferId(offer) });
  };

  // ── filtro e ordenação ────────────────────────────────────────────────────

  const filteredOffers = offers
    .filter(o => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.origin.toLowerCase().includes(q) ||
        o.destination.toLowerCase().includes(q) ||
        o.carrier.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'match')    return b.matchScore - a.matchScore;
      if (sortBy === 'price') {
        const pa = parseFloat(a.price.replace(/[^\d,]/g, '').replace(',', '.'));
        const pb = parseFloat(b.price.replace(/[^\d,]/g, '').replace(',', '.'));
        return pb - pa;
      }
      if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance);
      return 0;
    });

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'match',    label: 'Match'     },
    { key: 'price',    label: 'Preço'     },
    { key: 'distance', label: 'Distância' },
  ];

  // ── sub-componentes ───────────────────────────────────────────────────────

  const ListHeader = () => (
    <>
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
        <Text style={styles.title}>Ofertas de Cargas</Text>
        <Text style={styles.subtitle}>
          {filteredOffers.length} oferta{filteredOffers.length !== 1 ? 's' : ''} disponível{filteredOffers.length !== 1 ? 'is' : ''}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.searchContainer}>
        <Input
          placeholder="Buscar por origem, destino ou transportadora"
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Search size={iconSizes.md} color={colors.textMuted} />}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.sortContainer}>
        <View style={styles.sortLabel}>
          <SortDesc size={iconSizes.sm} color={colors.textSecondary} />
          <Text style={styles.sortLabelText}>Ordenar por:</Text>
        </View>
        <View style={styles.sortOptions}>
          {sortOptions.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortOption, sortBy === opt.key && styles.sortOptionActive]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text style={[styles.sortOptionText, sortBy === opt.key && styles.sortOptionTextActive]}>
                {opt.label}
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
          : 'Novas ofertas aparecerão aqui em breve'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredOffers}
        renderItem={({ item, index }) => (
          <OfferCard
            offer={item}
            onAccept={() => handleAccept(item)}
            onDecline={() => handleDecline(item)}
            onDetails={() => handleDetails(item)}
            delay={index * 100}
          />
        )}
        keyExtractor={item => getOfferId(item)}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
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
  container:            { flex: 1, backgroundColor: colors.background },
  listContent:          { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  header:               { paddingVertical: spacing.lg },
  title:                { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: colors.text, marginBottom: spacing.xs },
  subtitle:             { fontSize: typography.sizes.md, color: colors.textSecondary },
  searchContainer:      { marginBottom: spacing.md },
  sortContainer:        { marginBottom: spacing.xl },
  sortLabel:            { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  sortLabelText:        { fontSize: typography.sizes.sm, color: colors.textSecondary, marginLeft: spacing.xs },
  sortOptions:          { flexDirection: 'row', gap: spacing.sm },
  sortOption:           { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  sortOptionActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  sortOptionText:       { fontSize: typography.sizes.sm, color: colors.textSecondary, fontWeight: typography.weights.medium },
  sortOptionTextActive: { color: colors.text },
  emptyState:           { alignItems: 'center', paddingVertical: spacing.huge },
  emptyStateTitle:      { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  emptyStateText:       { fontSize: typography.sizes.md, color: colors.textMuted, textAlign: 'center', maxWidth: 280 },
});