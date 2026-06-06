import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowLeft,
  MapPin,
  Package,
  Calendar,
  Truck,
  Scale,
  Building2,
  Clock,
  Phone,
  MessageSquare,
} from 'lucide-react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCargo } from '../../context/CargoContext';
import { Button } from '../../components/ui/Button';
import { MatchBadge, PriorityBadge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';
import { RootStackParamList } from '../../types';

type CargoDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'CargoDetails'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'CargoDetails'>;
};

export function CargoDetailsScreen({ route, navigation }: CargoDetailsScreenProps) {
  const { offers, acceptOffer, declineOffer, isLoading } = useCargo();
  const { cargoId } = route.params;

  const cargo = offers.find((o) => o.id === cargoId);

  if (!cargo) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Oferta nao encontrada</Text>
          <Button title="Voltar" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleAccept = async () => {
    Alert.alert(
      'Aceitar Oferta',
      'Deseja aceitar esta oferta de carga?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            const success = await acceptOffer(cargo.id);
            if (success) {
              Alert.alert('Sucesso', 'Oferta aceita com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            }
          },
        },
      ]
    );
  };

  const handleDecline = async () => {
    Alert.alert(
      'Recusar Oferta',
      'Deseja recusar esta oferta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            await declineOffer(cargo.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const details = [
    { icon: Scale, label: 'Peso', value: cargo.weight },
    { icon: Truck, label: 'Veiculo', value: cargo.vehicleType },
    { icon: Calendar, label: 'Data de Coleta', value: cargo.pickupDate },
    { icon: MapPin, label: 'Distancia', value: cargo.distance },
    { icon: Clock, label: 'Prioridade', value: cargo.priority === 'high' ? 'Alta' : cargo.priority === 'medium' ? 'Media' : 'Baixa' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={iconSizes.lg} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Oferta</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* Title Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.titleCard}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.cargoId}>Oferta #{cargo.id}</Text>
              <Text style={styles.carrier}>{cargo.carrier}</Text>
            </View>
            <View style={styles.badges}>
              <MatchBadge score={cargo.matchScore} />
              <PriorityBadge priority={cargo.priority} size="lg" />
            </View>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{cargo.price}</Text>
            <Text style={styles.priceLabel}>Valor do frete</Text>
          </View>
        </Animated.View>

        {/* Route */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Rota</Text>
            <CardContent>
              <View style={styles.routeContainer}>
                <View style={styles.routeItem}>
                  <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
                  <View style={styles.routeContent}>
                    <Text style={styles.routeLabel}>Origem</Text>
                    <Text style={styles.routeText}>{cargo.origin}</Text>
                  </View>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeItem}>
                  <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
                  <View style={styles.routeContent}>
                    <Text style={styles.routeLabel}>Destino</Text>
                    <Text style={styles.routeText}>{cargo.destination}</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Details */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Detalhes da Carga</Text>
            <CardContent>
              <View style={styles.detailsGrid}>
                {details.map((detail, index) => (
                  <View key={index} style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <detail.icon size={iconSizes.md} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>{detail.label}</Text>
                      <Text style={styles.detailValue}>{detail.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Carrier Contact */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Transportadora</Text>
            <CardContent>
              <View style={styles.carrierInfo}>
                <View style={styles.carrierIcon}>
                  <Building2 size={iconSizes.xl} color={colors.primary} />
                </View>
                <View style={styles.carrierContent}>
                  <Text style={styles.carrierName}>{cargo.carrier}</Text>
                  <Text style={styles.carrierDetail}>ID: {cargo.carrierId}</Text>
                </View>
              </View>
              <View style={styles.carrierActions}>
                <TouchableOpacity style={styles.carrierAction}>
                  <Phone size={iconSizes.md} color={colors.primary} />
                  <Text style={styles.carrierActionText}>Ligar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.carrierAction}>
                  <MessageSquare size={iconSizes.md} color={colors.primary} />
                  <Text style={styles.carrierActionText}>Mensagem</Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)} style={styles.actions}>
          <Button
            title="Recusar"
            variant="outline"
            size="lg"
            onPress={handleDecline}
            style={styles.actionButton}
          />
          <Button
            title="Aceitar Oferta"
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleAccept}
            style={styles.actionButton}
          />
        </Animated.View>
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
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  titleCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  cargoId: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  carrier: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  price: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  priceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  routeContainer: {},
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
    marginTop: 4,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  routeText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: spacing.sm,
  },
  detailsGrid: {
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.infoBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  carrierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  carrierIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.infoBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  carrierContent: {
    flex: 1,
  },
  carrierName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  carrierDetail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  carrierActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  carrierAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.infoBg,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  carrierActionText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  notFoundText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
