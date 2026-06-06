import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
  danger?: boolean;
};

export function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
const { 
  notifications = { offers: false }, // Provide a fallback if undefined
  setNotifications, 
  language, 
  setLanguage 
} = useApp() || {}; // Protect against the entire context being undefined  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir conta',
      'Esta ação é irreversível. Todos os seus dados serão perdidos permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Solicitação enviada', 'Sua solicitação de exclusão será processada em até 30 dias.');
          },
        },
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o link.');
    });
  };

  const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    iconColor,
    title,
    subtitle,
    onPress,
    rightElement,
    showArrow = true,
    danger = false,
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: danger ? theme.colors.error + '15' : theme.colors.surface }]}>
        <Ionicons
          name={icon}
          size={20}
          color={iconColor || (danger ? theme.colors.error : theme.colors.primary)}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: danger ? theme.colors.error : theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
      {title}
    </Text>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Configurações</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={[styles.profileAvatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.profileAvatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.text }]}>
              {user?.name || 'Motorista'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
              {user?.email || 'email@exemplo.com'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Account Section */}
        <SectionHeader title="CONTA" />
        <Card style={styles.section}>
          <SettingItem
            icon="person-outline"
            title="Dados pessoais"
            subtitle="Editar informações do perfil"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon="car-outline"
            title="Meu veículo"
            subtitle="Gerenciar dados do veículo"
            onPress={() => navigation.navigate('VehicleInfo')}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon="document-text-outline"
            title="Documentos"
            subtitle="Gerenciar documentos"
            onPress={() => navigation.navigate('Documents')}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon="wallet-outline"
            title="Pagamentos"
            subtitle="Dados bancários e histórico"
            onPress={() => navigation.navigate('Payments')}
          />
        </Card>

        {/* Preferences Section */}
        <SectionHeader title="PREFERÊNCIAS" />
        <Card style={styles.section}>
          <SettingItem
            icon="notifications-outline"
            title="Notificações"
            subtitle={notifications.offers ? 'Ativadas' : 'Desativadas'}
            showArrow={false}
            rightElement={
              <Switch
                value={notifications.offers}
                onValueChange={(value) => setNotifications({ ...notifications, offers: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={notifications.offers ? theme.colors.primary : theme.colors.textSecondary}
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon={isDark ? 'moon' : 'sunny-outline'}
            title="Tema escuro"
            subtitle={isDark ? 'Ativado' : 'Desativado'}
            showArrow={false}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={isDark ? theme.colors.primary : theme.colors.textSecondary}
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon="location-outline"
            title="Rastreamento GPS"
            subtitle="Compartilhar localização em viagens"
            showArrow={false}
            rightElement={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                thumbColor={theme.colors.primary}
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon="language-outline"
            title="Idioma"
            subtitle="Português (Brasil)"
            onPress={() => {
              Alert.alert('Idioma', 'Selecione o idioma', [
                { text: 'Português (Brasil)', onPress: () => setLanguage('pt-BR') },
                { text: 'English', onPress: () => setLanguage('en-US') },
                { text: 'Cancelar', style: 'cancel' },
              ]);
            }}
          />
        </Card>

        {/* Support Section */}
        <SectionHeader title="SUPORTE" />
        <Card style={styles.section}>
          <SettingItem
            icon="help-circle-outline"
            title="Central de ajuda"
            subtitle="Perguntas frequentes"
            onPress={() => openLink('https://vaptvupt.com.br/ajuda')}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon="chatbubble-outline"
            title="Fale conosco"
            subtitle="Chat com suporte"
            onPress={() => navigation.navigate('Support')}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon="bug-outline"
            title="Reportar problema"
            subtitle="Enviar feedback"
            onPress={() => navigation.navigate('ReportIssue')}
          />
        </Card>

        {/* Legal Section */}
        <SectionHeader title="LEGAL" />
        <Card style={styles.section}>
          <SettingItem
            icon="document-outline"
            title="Termos de uso"
            onPress={() => openLink('https://vaptvupt.com.br/termos')}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon="shield-outline"
            title="Política de privacidade"
            onPress={() => openLink('https://vaptvupt.com.br/privacidade')}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon="information-circle-outline"
            title="Sobre o app"
            subtitle="Versão 1.0.0"
            onPress={() => {
              Alert.alert(
                'VAPT VUPT',
                'Versão 1.0.0\n\nConectando transportadoras a motoristas autônomos de forma rápida e eficiente.',
                [{ text: 'OK' }]
              );
            }}
          />
        </Card>

        {/* Danger Zone */}
        <SectionHeader title="ZONA DE RISCO" />
        <Card style={styles.section}>
          <SettingItem
            icon="log-out-outline"
            title="Sair da conta"
            onPress={handleLogout}
            danger
            showArrow={false}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            icon="trash-outline"
            title="Excluir conta"
            subtitle="Remover permanentemente"
            onPress={handleDeleteAccount}
            danger
            showArrow={false}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            VAPT VUPT - Logística Inteligente
          </Text>
          <Text style={[styles.footerVersion, { color: theme.colors.textSecondary }]}>
            Versão 1.0.0 (Build 1)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
  },
});
