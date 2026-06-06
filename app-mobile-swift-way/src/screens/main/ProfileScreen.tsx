import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Truck,
  Star,
  CheckCircle,
  Camera,
  ChevronRight,
  LogOut,
  TrendingUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useCargo } from '../../context/CargoContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius, iconSizes } from '../../theme';

export function ProfileScreen() {
  const { state: authState, logout, updateStatus } = useAuth();
  const { documents, trips } = useCargo();
  const user = authState.user;

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleStatusChange = (newStatus: 'available' | 'busy' | 'offline') => {
    Alert.alert(
      'Alterar Status',
      `Deseja alterar seu status para "${newStatus === 'available' ? 'Disponivel' : newStatus === 'busy' ? 'Ocupado' : 'Offline'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            await updateStatus(newStatus);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return colors.success;
      case 'busy':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponivel';
      case 'busy':
        return 'Ocupado';
      default:
        return 'Offline';
    }
  };

  const stats = [
    { label: 'Viagens', value: user?.totalTrips || 0, icon: Truck },
    { label: 'Avaliacao', value: `${user?.rating || 0}`, icon: Star },
    { label: 'Aprovacao', value: `${user?.approvalRate || 0}%`, icon: CheckCircle },
    { label: 'Ganhos/Mes', value: `R$ ${((user?.monthlyEarnings || 0) / 1000).toFixed(1)}k`, icon: TrendingUp },
  ];

  const menuItems = [
    { icon: User, label: 'Dados Pessoais', onPress: () => {} },
    { icon: FileText, label: 'Meus Documentos', count: documents.filter(d => d.status === 'pending').length, onPress: () => {} },
    { icon: Truck, label: 'Meus Veiculos', count: user?.vehicles?.length || 0, onPress: () => {} },
    { icon: MapPin, label: 'Enderecos', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.2)', 'transparent']}
            style={styles.headerGradient}
          >
            <Text style={styles.headerTitle}>Meu Perfil</Text>
          </LinearGradient>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <User size={48} color={colors.primary} />
              )}
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={iconSizes.sm} color={colors.text} />
            </TouchableOpacity>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(user?.status || 'offline') }]} />
          </View>

          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {/* Status Selector */}
          <View style={styles.statusSelector}>
            {['available', 'busy', 'offline'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  user?.status === status && styles.statusOptionActive,
                  user?.status === status && { borderColor: getStatusColor(status) },
                ]}
                onPress={() => handleStatusChange(status as any)}
              >
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
                <Text
                  style={[
                    styles.statusOptionText,
                    user?.status === status && { color: getStatusColor(status) },
                  ]}
                >
                  {getStatusLabel(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statIcon}>
                <stat.icon size={iconSizes.md} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Driver Info */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Informacoes do Motorista</Text>
            <CardContent>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <FileText size={iconSizes.md} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>CNH</Text>
                  <Text style={styles.infoValue}>{user?.cnhNumber} - Categoria {user?.cnhCategory}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Phone size={iconSizes.md} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoValue}>{user?.phone}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MapPin size={iconSizes.md} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Localizacao</Text>
                  <Text style={styles.infoValue}>{user?.city}, {user?.state}</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Menu */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <Card style={styles.card}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuItemIcon}>
                    <item.icon size={iconSizes.md} color={colors.primary} />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.count !== undefined && item.count > 0 && (
                    <Badge variant="info" size="sm">{item.count}</Badge>
                  )}
                  <ChevronRight size={iconSizes.md} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)} style={styles.logoutContainer}>
          <Button
            title="Sair da Conta"
            variant="danger"
            size="lg"
            fullWidth
            icon={<LogOut size={iconSizes.md} color={colors.text} />}
            onPress={handleLogout}
          />
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
  headerGradient: {
    paddingVertical: spacing.xl,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.infoBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  statusDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.card,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statusSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  statusOptionActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.infoBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.infoBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.infoBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoutContainer: {
    marginTop: spacing.lg,
  },
  bottomSpacing: {
    height: spacing.xxxl,
  },
});
