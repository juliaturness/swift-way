import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowLeft, MapPin, Calendar, Truck,
  Scale, Building2, Clock, Phone, MessageSquare,
  ShieldAlert, Radio, Zap,
} from 'lucide-react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCargo } from '../../context/CargoContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';
import { CargoResponse, CargoOffer, RootStackParamList } from '../../types';

type Props = {
  route: RouteProp<RootStackParamList, 'CargoDetails'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'CargoDetails'>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  CARGA_SECA:  'Carga Seca',
  REFRIGERADA: 'Refrigerada',
  PERIGOSA:    'Perigosa',
  GRANEL:      'Granel',
  OUTROS:      'Outros',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export function CargoDetailsScreen({ route, navigation }: Props) {
  const { cargoId } = route.params;
  const { offers, acceptOffer, declineOffer, isLoading, getCargoById } = useCargo();

  // CargoResponse vem do backend (dados completos); CargoOffer vem da memória (dados parciais)
  const [cargo,    setCargo]    = useState<CargoResponse | null>(null);
  const [fetching, setFetching] = useState(true);

  // Oferta correspondente na lista em memória (para accept/decline)
  // cargoId passado pela navegação é sempre o offerId (ver OffersScreen.handleDetails)
  const matchingOffer: CargoOffer | undefined = offers.find(o => o.id === cargoId);
  const offerId = matchingOffer?.id ?? cargoId;

  useEffect(() => {
    (async () => {
      try {
        setFetching(true);

        // Se a oferta está em memória e tem o cargoId embutido, busca os dados completos
        const targetCargoId = matchingOffer?.cargoId ?? cargoId;
        const result = await getCargoById(targetCargoId);
        setCargo(result);
      } catch (e) {
        console.error('[CargoDetails] fetch error:', e);
      } finally {
        setFetching(false);
      }
    })();
  }, [cargoId]);

  // ── Ações ──────────────────────────────────────────────────────────────────

  const handleAccept = () => {
    Alert.alert('Aceitar Oferta', 'Deseja aceitar esta oferta de carga?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceitar',
        onPress: async () => {
          const success = await acceptOffer(offerId);
          if (success) {
            Alert.alert('Sucesso', 'Oferta aceita! A viagem foi agendada.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          }
        },
      },
    ]);
  };

  const handleDecline = () => {
    Alert.alert('Recusar Oferta', 'Deseja recusar esta oferta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Recusar',
        style: 'destructive',
        onPress: async () => {
          await declineOffer(offerId);
          navigation.goBack();
        },
      },
    ]);
  };

  // ── Loading / Not found ────────────────────────────────────────────────────

  if (fetching) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!cargo) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Oferta não encontrada</Text>
          <Button variant="outline" onPress={() => navigation.goBack()}>Voltar</Button>
        </View>
      </SafeAreaView>
    );
  }

  // ── Dados derivados ────────────────────────────────────────────────────────

  const carrierName = cargo.carrier.nomeFantasia ?? cargo.carrier.razaoSocial;

  const detailRows = [
    {
      icon: Scale,
      label: 'Peso',
      value: `${cargo.pesoKg.toLocaleString('pt-BR')} kg`,
    },
    {
      icon: Truck,
      label: 'Tipo de Carga',
      value: TIPO_LABEL[cargo.tipo] ?? cargo.tipo,
    },
    {
      icon: Calendar,
      label: 'Coleta até',
      value: formatDate(cargo.dataColetaLimite),
    },
    ...(cargo.dataEntregaPrevista ? [{
      icon: Clock,
      label: 'Entrega prevista',
      value: formatDate(cargo.dataEntregaPrevista),
    }] : []),
    ...(matchingOffer ? [{
      icon: MapPin,
      label: 'Distância',
      value: `${matchingOffer.distance} km`,
    }] : []),
  ];

  // Requisitos especiais da carga (só mostra os que forem true)
  const requirements: { icon: typeof ShieldAlert; label: string }[] = [
    ...(cargo.requerEscolta         ? [{ icon: ShieldAlert, label: 'Escolta obrigatória' }]   : []),
    ...(cargo.requerRastreador      ? [{ icon: Radio,       label: 'Rastreador obrigatório' }] : []),
    ...(cargo.requerIscaEletronica  ? [{ icon: Zap,         label: 'Isca eletrônica' }]        : []),
    ...(cargo.requerAprovacaoGr     ? [{ icon: ShieldAlert, label: 'Aprovação GR necessária' }]: []),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={iconSizes.lg} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Oferta</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* Título + Preço */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.titleCard}>
          <Text style={styles.cargoId}>Carga #{cargo.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.carrierSubtitle}>{carrierName}</Text>

          {matchingOffer && (
            <View style={styles.matchRow}>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{matchingOffer.matchScore}% match</Text>
              </View>
              <Text style={styles.expiresAt}>
                Expira em: {formatDate(matchingOffer.expiresAt)}
              </Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(cargo.valorCarga)}</Text>
            <Text style={styles.priceLabel}>Valor do frete</Text>
          </View>
        </Animated.View>

        {/* Rota */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Rota</Text>
            <CardContent>
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
                <View style={styles.routeContent}>
                  <Text style={styles.routeLabel}>Origem</Text>
                  <Text style={styles.routeText}>
                    {cargo.origemCidade}, {cargo.origemEstado}
                  </Text>
                  {cargo.origemEndereco ? (
                    <Text style={styles.routeAddress}>{cargo.origemEndereco}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
                <View style={styles.routeContent}>
                  <Text style={styles.routeLabel}>Destino</Text>
                  <Text style={styles.routeText}>
                    {cargo.destinoCidade}, {cargo.destinoEstado}
                  </Text>
                  {cargo.destinoEndereco ? (
                    <Text style={styles.routeAddress}>{cargo.destinoEndereco}</Text>
                  ) : null}
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Detalhes da carga */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Detalhes da Carga</Text>
            <CardContent>
              <View style={styles.detailsGrid}>
                {detailRows.map((d, i) => (
                  <View key={i} style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <d.icon size={iconSizes.md} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>{d.label}</Text>
                      <Text style={styles.detailValue}>{d.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Requisitos especiais */}
        {requirements.length > 0 && (
          <Animated.View entering={FadeInUp.delay(450).duration(400)}>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Requisitos Especiais</Text>
              <CardContent>
                <View style={styles.detailsGrid}>
                  {requirements.map((r, i) => (
                    <View key={i} style={styles.detailItem}>
                      <View style={[styles.detailIcon, { backgroundColor: colors.warningBg ?? colors.infoBg }]}>
                        <r.icon size={iconSizes.md} color={colors.warning ?? colors.primary} />
                      </View>
                      <Text style={styles.detailValue}>{r.label}</Text>
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {/* Descrição / observações */}
        {(cargo.descricao || cargo.observacoes) && (
          <Animated.View entering={FadeInUp.delay(470).duration(400)}>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Observações</Text>
              <CardContent>
                {cargo.descricao && (
                  <Text style={styles.observationText}>{cargo.descricao}</Text>
                )}
                {cargo.observacoes && cargo.observacoes !== cargo.descricao && (
                  <Text style={[styles.observationText, { marginTop: spacing.sm }]}>
                    {cargo.observacoes}
                  </Text>
                )}
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {/* Transportadora */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Transportadora</Text>
            <CardContent>
              <View style={styles.carrierInfo}>
                <View style={styles.carrierIcon}>
                  <Building2 size={iconSizes.xl} color={colors.primary} />
                </View>
                <View style={styles.carrierContent}>
                  <Text style={styles.carrierName}>{carrierName}</Text>
                  {cargo.carrier.nomeFantasia && (
                    <Text style={styles.carrierDetail}>{cargo.carrier.razaoSocial}</Text>
                  )}
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

        {/* Ações — só exibe se a oferta ainda está pendente */}
        {(!matchingOffer || matchingOffer.status === 'ENVIADA') && (
          <Animated.View entering={FadeInUp.delay(600).duration(400)} style={styles.actions}>
            <Button
              variant="outline"
              size="lg"
              onPress={handleDecline}
              style={styles.actionButton}
            >
              Recusar
            </Button>
            <Button
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={handleAccept}
              style={styles.actionButton}
            >
              Aceitar Oferta
            </Button>
          </Animated.View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: colors.background },
  scroll:             { flex: 1 },
  scrollContent:      { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  center:             { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },

  // Header
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.lg },
  backButton:         { width: 44, height: 44, borderRadius: borderRadius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  headerTitle:        { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text },
  headerSpacer:       { width: 44 },

  // Title card
  titleCard:          { backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
  cargoId:            { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text, marginBottom: spacing.xs },
  carrierSubtitle:    { fontSize: typography.sizes.md, color: colors.textSecondary, marginBottom: spacing.md },
  matchRow:           { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  matchBadge:         { backgroundColor: colors.primary, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  matchText:          { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.text },
  expiresAt:          { fontSize: typography.sizes.sm, color: colors.textMuted },
  priceRow:           { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
  price:              { fontSize: typography.sizes.hero, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: spacing.xs },
  priceLabel:         { fontSize: typography.sizes.sm, color: colors.textSecondary },

  // Card genérico
  card:               { marginBottom: spacing.lg },
  cardTitle:          { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text, marginBottom: spacing.md },

  // Rota
  routeItem:          { flexDirection: 'row', alignItems: 'flex-start' },
  routeDot:           { width: 12, height: 12, borderRadius: 6, marginRight: spacing.md, marginTop: 4 },
  routeContent:       { flex: 1 },
  routeLabel:         { fontSize: typography.sizes.xs, color: colors.textMuted, marginBottom: spacing.xs },
  routeText:          { fontSize: typography.sizes.lg, fontWeight: typography.weights.medium, color: colors.text },
  routeAddress:       { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: spacing.xs },
  routeLine:          { width: 2, height: 24, backgroundColor: colors.border, marginLeft: 5, marginVertical: spacing.sm },

  // Detalhes / grid
  detailsGrid:        { gap: spacing.md },
  detailItem:         { flexDirection: 'row', alignItems: 'center' },
  detailIcon:         { width: 44, height: 44, borderRadius: borderRadius.lg, backgroundColor: colors.infoBg, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  detailLabel:        { fontSize: typography.sizes.xs, color: colors.textMuted },
  detailValue:        { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, color: colors.text },

  // Observações
  observationText:    { fontSize: typography.sizes.md, color: colors.textSecondary, lineHeight: 22 },

  // Transportadora
  carrierInfo:        { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  carrierIcon:        { width: 56, height: 56, borderRadius: borderRadius.lg, backgroundColor: colors.infoBg, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  carrierContent:     { flex: 1 },
  carrierName:        { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text, marginBottom: spacing.xs },
  carrierDetail:      { fontSize: typography.sizes.sm, color: colors.textSecondary },
  carrierActions:     { flexDirection: 'row', gap: spacing.md },
  carrierAction:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.infoBg, borderRadius: borderRadius.lg, paddingVertical: spacing.md, gap: spacing.sm },
  carrierActionText:  { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, color: colors.primary },

  // Ações
  actions:            { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  actionButton:       { flex: 1 },
  notFoundText:       { fontSize: typography.sizes.lg, color: colors.textSecondary, marginBottom: spacing.xl },
});