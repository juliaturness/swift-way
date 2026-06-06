import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { colors, borderRadius, typography, spacing, iconSizes } from '../theme';
import { Document } from '../types';

// listinha dizendo q a rotina precisa receber uma coleção de documentos pra funcionar.
interface DocumentStatusCardProps {
  documents: Document[];
}

// rotina principal q desenha o quadro mostrando a situação dos documentos.
export function DocumentStatusCard({ documents }: DocumentStatusCardProps) {
  // separando os documentos q já tão certos e os q tão esperando resposta.
  const approved = documents.filter((d) => d.status === 'approved');
  const pending = documents.filter((d) => d.status === 'pending');

  // rotina interna q escolhe qual desenho mostrar dependendo se o documento tá aprovado, esperando ou com problema.
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={iconSizes.sm} color={colors.success} />;
      case 'pending':
        return <Clock size={iconSizes.sm} color={colors.warning} />;
      default:
        return <AlertCircle size={iconSizes.sm} color={colors.error} />;
    }
  };

  // rotina interna q escolhe a cor do fundo e das letras baseada na situação do documento.
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: colors.successBg, border: colors.success, text: colors.success };
      case 'pending':
        return { bg: colors.warningBg, border: colors.warning, text: colors.warning };
      default:
        return { bg: colors.errorBg, border: colors.error, text: colors.error };
    }
  };

  // a parte visual q realmente aparece pro usuário no celular.
  return (
    // o quadro principal q surge na tela com uma animação rápida.
    <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
      <Text style={styles.title}>Status dos Documentos</Text>
      
      {/* espaço pra organizar os cartõezinhos dos documentos lado a lado. */}
      <View style={styles.grid}>
        {/* pega só os primeiros quatro documentos da lista pra desenhar na tela. */}
        {documents.slice(0, 4).map((doc) => {
          // pega as cores certas pra esse documento específico.
          const statusColor = getStatusColor(doc.status);
          return (
            // a caixinha de cada documento, pintada com as cores escolhidas antes.
            <View
              key={doc.id}
              style={[
                styles.docItem,
                { backgroundColor: statusColor.bg, borderColor: statusColor.border },
              ]}
            >
              {/* topo da caixinha onde fica o desenho e o nome do documento. */}
              <View style={styles.docHeader}>
                {getStatusIcon(doc.status)}
                <Text style={[styles.docName, { color: statusColor.text }]} numberOfLines={1}>
                  {doc.type}
                </Text>
              </View>
              
              {/* escreve até quando o documento vale ou se ele ainda tá sendo analisado. */}
              <Text style={[styles.docExpiry, { color: statusColor.text }]} numberOfLines={1}>
                {doc.status === 'approved' && doc.expiryDate
                  ? `Valido ate ${doc.expiryDate}`
                  : doc.status === 'pending'
                  ? 'Em analise'
                  : 'Rejeitado'}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

// dicionário de enfeites q organiza a posição, tamanho e cor de cada pedacinho do quadro.
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  docItem: {
    width: '48%',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  docName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  docExpiry: {
    fontSize: typography.sizes.xs,
  },
});