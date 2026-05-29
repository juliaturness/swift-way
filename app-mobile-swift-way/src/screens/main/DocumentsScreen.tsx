import React, { useState } from 'react';
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
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Download,
  Plus,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCargo } from '../../context/CargoContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';
import { RootStackParamList, Document } from '../../types';

type DocumentsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DocumentUpload'>;
};

export function DocumentsScreen({ navigation }: DocumentsScreenProps) {
  const { documents, uploadDocument, deleteDocument, isLoading } = useCargo();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { key: null, label: 'Todos' },
    { key: 'CNH', label: 'CNH' },
    { key: 'CRLV', label: 'CRLV' },
    { key: 'MOPP', label: 'MOPP' },
    { key: 'INSURANCE', label: 'Seguro' },
    { key: 'OTHER', label: 'Outros' },
  ];

  const filteredDocuments = selectedCategory
    ? documents.filter((d) => d.type === selectedCategory)
    : documents;

  const handleUpload = () => {
    Alert.alert(
      'Enviar Documento',
      'Escolha o tipo de documento que deseja enviar',
      [
        {
          text: 'CNH',
          onPress: () => simulateUpload('CNH'),
        },
        {
          text: 'CRLV',
          onPress: () => simulateUpload('CRLV'),
        },
        {
          text: 'Outro',
          onPress: () => simulateUpload('OTHER'),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const simulateUpload = async (type: string) => {
    const success = await uploadDocument({
      name: `Documento ${type}`,
      type: type as any,
      expiryDate: '31/12/2027',
    });

    if (success) {
      Alert.alert('Sucesso', 'Documento enviado com sucesso! Aguarde a analise.');
    }
  };

  const handleDelete = (doc: Document) => {
    Alert.alert(
      'Excluir Documento',
      `Deseja excluir o documento "${doc.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteDocument(doc.id);
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={iconSizes.lg} color={colors.success} />;
      case 'pending':
        return <Clock size={iconSizes.lg} color={colors.warning} />;
      default:
        return <AlertCircle size={iconSizes.lg} color={colors.error} />;
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText size={iconSizes.xl} color={colors.primary} />;
  };

  const stats = {
    total: documents.length,
    approved: documents.filter((d) => d.status === 'approved').length,
    pending: documents.filter((d) => d.status === 'pending').length,
    rejected: documents.filter((d) => d.status === 'rejected').length,
  };

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
            <Text style={styles.statLabel}>Em Analise</Text>
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
            loading={isLoading}
            onPress={handleUpload}
          />
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key || 'all'}
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

        {/* Documents List */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `Documentos - ${selectedCategory}` : 'Todos os Documentos'}
          </Text>

          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc, index) => (
              <Card key={doc.id} style={styles.documentCard}>
                <View style={styles.documentHeader}>
                  <View style={styles.documentIcon}>
                    {getTypeIcon(doc.type)}
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{doc.name}</Text>
                    <Text style={styles.documentMeta}>
                      Enviado em {doc.uploadDate} | {doc.size}
                    </Text>
                  </View>
                  <StatusBadge status={doc.status} size="sm" />
                </View>

                {doc.expiryDate && doc.status === 'approved' && (
                  <View style={styles.expiryRow}>
                    <Text style={styles.expiryLabel}>Validade:</Text>
                    <Text style={styles.expiryValue}>{doc.expiryDate}</Text>
                  </View>
                )}

                <View style={styles.documentActions}>
                  <TouchableOpacity style={styles.documentAction}>
                    <Download size={iconSizes.sm} color={colors.primary} />
                    <Text style={styles.documentActionText}>Baixar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.documentAction}
                    onPress={() => handleDelete(doc)}
                  >
                    <Trash2 size={iconSizes.sm} color={colors.error} />
                    <Text style={[styles.documentActionText, { color: colors.error }]}>
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <FileText size={48} color={colors.textMuted} />
              <Text style={styles.emptyStateTitle}>Nenhum documento encontrado</Text>
              <Text style={styles.emptyStateText}>
                {selectedCategory
                  ? `Nenhum documento do tipo ${selectedCategory} foi encontrado`
                  : 'Envie seus documentos para comecar'}
              </Text>
            </View>
          )}
        </Animated.View>

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
  uploadSection: {
    marginBottom: spacing.xl,
  },
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
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  categoryChipTextActive: {
    color: colors.text,
  },
  documentsSection: {},
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  documentCard: {
    marginBottom: spacing.md,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.infoBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  documentMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  expiryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  expiryValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  documentActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  documentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  documentActionText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
  bottomSpacing: {
    height: spacing.xxxl,
  },
});
