import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { documentApi, DocumentResponse, DocumentStatus, DocumentType, UploadDocumentParams } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';
import { RootStackParamList } from '../../types';

type DocumentsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DocumentUpload'>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O backend retorna status em maiúsculas (PENDING / APPROVED / REJECTED).
 * Mapeia para labels PT-BR e cores.
 */
function statusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'APPROVED': return 'Aprovado';
    case 'PENDING':  return 'Em Análise';
    case 'REJECTED': return 'Rejeitado';
  }
}

function statusColor(status: DocumentStatus): string {
  switch (status) {
    case 'APPROVED': return colors.success;
    case 'PENDING':  return colors.warning;
    case 'REJECTED': return colors.error;
  }
}

function typeLabel(type: DocumentType): string {
  switch (type) {
    case 'CNH':       return 'CNH';
    case 'CRLV':      return 'CRLV';
    case 'MOPP':      return 'MOPP';
    case 'INSURANCE': return 'Seguro';
    case 'OTHER':     return 'Outro';
  }
}

/** Formata "YYYY-MM-DD" → "DD/MM/YYYY" */
function formatDate(iso?: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES: DocumentType[] = ['CNH', 'CRLV', 'MOPP', 'INSURANCE', 'OTHER'];
const CATEGORY_FILTERS: { key: DocumentType | null; label: string }[] = [
  { key: null,        label: 'Todos'  },
  { key: 'CNH',      label: 'CNH'    },
  { key: 'CRLV',     label: 'CRLV'   },
  { key: 'MOPP',     label: 'MOPP'   },
  { key: 'INSURANCE',label: 'Seguro' },
  { key: 'OTHER',    label: 'Outros' },
];

export function DocumentsScreen({ navigation }: DocumentsScreenProps) {
  const [documents, setDocuments]           = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading]           = useState(false);
  const [isUploading, setIsUploading]       = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentType | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await documentApi.listMine();
      setDocuments(data);
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível carregar os documentos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleUpload = () => {
    Alert.alert(
      'Enviar Documento',
      'Escolha o tipo de documento',
      [
        ...DOCUMENT_TYPES.map((t) => ({
          text: typeLabel(t),
          onPress: () => pickAndUpload(t),
        })),
        { text: 'Cancelar', style: 'cancel' as const },
      ],
    );
  };

  const pickAndUpload = async (type: DocumentType) => {
    // Abre o file picker nativo
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });

    // Usuário cancelou
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];

    // Opcionalmente, pedir a validade para CNH / CRLV
    // Por simplicidade usamos null aqui — adicione um DatePicker se necessário
    const params: UploadDocumentParams = { type };

    setIsUploading(true);
    try {
      const uploaded = await documentApi.upload(
        {
          uri:  asset.uri,
          name: asset.name ?? `documento.${asset.mimeType?.split('/')[1] ?? 'pdf'}`,
          type: asset.mimeType ?? 'application/octet-stream',
        },
        params,
      );
      // Adiciona otimisticamente ao topo da lista
      setDocuments((prev) => [uploaded, ...prev]);
      Alert.alert('Sucesso', 'Documento enviado! Aguarde a análise.');
    } catch (e: any) {
      Alert.alert('Erro no upload', e?.message ?? 'Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = selectedCategory
    ? documents.filter((d) => d.type === selectedCategory)
    : documents;

  const stats = {
    total:    documents.length,
    approved: documents.filter((d) => d.status === 'APPROVED').length,
    pending:  documents.filter((d) => d.status === 'PENDING').length,
    rejected: documents.filter((d) => d.status === 'REJECTED').length,
  };

  // ── Status icon ────────────────────────────────────────────────────────────

  const StatusIcon = ({ status }: { status: DocumentStatus }) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle size={iconSizes.lg} color={colors.success} />;
      case 'PENDING':  return <Clock       size={iconSizes.lg} color={colors.warning} />;
      case 'REJECTED': return <AlertCircle size={iconSizes.lg} color={colors.error}   />;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={iconSizes.lg} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meus Documentos</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.successBg }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Aprovados</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.warningBg }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Em Análise</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.errorBg }]}>
            <Text style={[styles.statValue, { color: colors.error }]}>{stats.rejected}</Text>
            <Text style={styles.statLabel}>Rejeitados</Text>
          </View>
        </Animated.View>

        {/* Upload Button */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.uploadSection}>
          <Button
            title="Enviar Novo Documento"
            variant="primary"
            size="lg"
            fullWidth
            icon={<Upload size={iconSizes.md} color={colors.text} />}
            loading={isUploading}
            onPress={handleUpload}
          />
        </Animated.View>

        {/* Category filter */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORY_FILTERS.map((cat) => (
              <TouchableOpacity
                key={cat.key ?? 'all'}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.key && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.key && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Documents list */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `Documentos — ${typeLabel(selectedCategory)}` : 'Todos os Documentos'}
          </Text>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: spacing.xl }}
            />
          ) : filtered.length > 0 ? (
            filtered.map((doc) => (
              <Card key={doc.id} style={styles.documentCard}>
                <View style={styles.documentHeader}>
                  {/* Type icon */}
                  <View style={styles.documentIcon}>
                    <FileText size={iconSizes.xl} color={colors.primary} />
                  </View>

                  {/* Info */}
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{typeLabel(doc.type)}</Text>
                    {/* createdAt vem do backend — formata para exibição */}
                    <Text style={styles.documentMeta}>
                      Enviado em {formatDate(doc.createdAt?.split('T')[0])}
                    </Text>
                    {doc.vehicleId && (
                      <Text style={styles.documentMeta}>Veículo: {doc.vehicleId}</Text>
                    )}
                  </View>

                  {/* Status badge */}
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(doc.status) + '22' }]}>
                    <StatusIcon status={doc.status} />
                    <Text style={[styles.statusBadgeText, { color: statusColor(doc.status) }]}>
                      {statusLabel(doc.status)}
                    </Text>
                  </View>
                </View>

                {/* Validade — só mostra se aprovado e preenchido */}
                {doc.validade && doc.status === 'APPROVED' && (
                  <View style={styles.expiryRow}>
                    <Text style={styles.expiryLabel}>Validade:</Text>
                    <Text style={styles.expiryValue}>{formatDate(doc.validade)}</Text>
                  </View>
                )}

                {/* Rejected reason hint */}
                {doc.status === 'REJECTED' && (
                  <View style={styles.rejectedRow}>
                    <AlertCircle size={iconSizes.sm} color={colors.error} />
                    <Text style={styles.rejectedText}>
                      Documento rejeitado. Envie uma nova versão.
                    </Text>
                  </View>
                )}
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <FileText size={48} color={colors.textMuted} />
              <Text style={styles.emptyStateTitle}>Nenhum documento encontrado</Text>
              <Text style={styles.emptyStateText}>
                {selectedCategory
                  ? `Nenhum documento do tipo ${typeLabel(selectedCategory)} foi encontrado`
                  : 'Envie seus documentos para começar'}
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  scrollView:     { flex: 1 },
  scrollContent:  { paddingHorizontal: spacing.lg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 44, height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  headerSpacer: { width: 44 },

  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },

  uploadSection: { marginBottom: spacing.xl },

  categoriesContainer: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryChipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryChipText:       { fontSize: typography.sizes.sm, color: colors.textSecondary, fontWeight: typography.weights.medium },
  categoryChipTextActive: { color: colors.text },

  documentsSection: {},
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },

  documentCard:   { marginBottom: spacing.md },
  documentHeader: { flexDirection: 'row', alignItems: 'center' },
  documentIcon: {
    width: 48, height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.infoBg,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  documentInfo:  { flex: 1 },
  documentName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  documentMeta: { fontSize: typography.sizes.xs, color: colors.textMuted },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },

  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  expiryLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginRight: spacing.sm },
  expiryValue: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.text },

  rejectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rejectedText: { fontSize: typography.sizes.sm, color: colors.error, flex: 1 },

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  emptyStateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },

  bottomSpacing: { height: spacing.xxxl },
});