import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Cores do tema - inspirado no design web VAPT VUPT
export const colors = {
  // Cores primárias
  primary: '#3B82F6', // Azul principal
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  
  // Cores de fundo (tema escuro)
  background: '#0A1929',
  backgroundSecondary: '#0F2744',
  card: '#132F4C',
  cardHover: '#1A3A5C',
  
  // Cores de texto
  text: '#FFFFFF',
  textSecondary: '#B2BAC2',
  textMuted: '#6B7A90',
  
  // Cores de borda
  border: '#1E4976',
  borderLight: '#2D5A8A',
  
  // Cores de status
  success: '#22C55E',
  successLight: '#4ADE80',
  successBg: 'rgba(34, 197, 94, 0.1)',
  
  warning: '#F97316',
  warningLight: '#FB923C',
  warningBg: 'rgba(249, 115, 22, 0.1)',
  
  error: '#EF4444',
  errorLight: '#F87171',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  
  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoBg: 'rgba(59, 130, 246, 0.1)',
  
  // Cores especiais
  purple: '#A855F7',
  purpleBg: 'rgba(168, 85, 247, 0.1)',
  
  // Cores para match score
  matchHigh: '#22C55E',
  matchMedium: '#F97316',
  matchLow: '#EF4444',
  
  // Input
  inputBackground: '#132F4C',
  inputBorder: '#1E4976',
  inputFocus: '#3B82F6',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Gradientes (como arrays para LinearGradient)
  gradientPrimary: ['#3B82F6', '#2563EB'],
  gradientDark: ['#0A1929', '#132F4C'],
  gradientCard: ['#132F4C', '#0F2744'],
};

// Espaçamentos
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// Tipografia
export const typography = {
  // Tamanhos de fonte
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    title: 28,
    hero: 32,
  },
  // Pesos de fonte
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

// Sombras
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Dimensões da tela
export const screen = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 414,
  isLarge: width >= 414,
};

// Dimensões de ícones
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  huge: 48,
};

// Animações
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
  },
};

// Constantes de plataforma
export const platform = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  statusBarHeight: Platform.OS === 'ios' ? 44 : 0,
  bottomInset: Platform.OS === 'ios' ? 34 : 0,
};

// Hit slop padrão para botões
export const hitSlop = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
};

// Tema completo exportado
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  screen,
  iconSizes,
  animations,
  platform,
  hitSlop,
};

export type Theme = typeof theme;

export const useTheme = () => {
  return { theme };
}