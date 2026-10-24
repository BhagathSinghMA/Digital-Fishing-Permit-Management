import { Platform } from 'react-native';

/**
 * Material Design 3 Color Palette for Government Fishing Permit System
 * Primary: Ocean Deep Blue (#0056B3, #0B3C5D)
 * Secondary: Vibrant Marine Teal (#008080, #00A896)
 * Surface & Backgrounds: Soft Blue-Gray, Clean White
 */
export const Colors = {
  light: {
    primary: '#0056B3',
    primaryDark: '#0B3C5D',
    primaryContainer: '#D0E4FF',
    onPrimaryContainer: '#001D36',
    
    secondary: '#008080',
    secondaryTeal: '#00A896',
    secondaryContainer: '#CCEBEB',
    onSecondaryContainer: '#002020',
    
    background: '#F4F7FA',
    backgroundGradientStart: '#EBF3FA',
    backgroundGradientEnd: '#F4F7FA',
    surface: '#FFFFFF',
    surfaceVariant: '#F0F4F8',
    
    text: '#1A2530',
    textSecondary: '#5A6A78',
    textMuted: '#8A99A8',
    textOnPrimary: '#FFFFFF',
    
    border: '#E1E8ED',
    borderFocused: '#0056B3',
    
    success: '#00875A',
    successContainer: '#E3FCEF',
    warning: '#FF8B00',
    warningContainer: '#FFF0B3',
    error: '#DE350B',
    errorContainer: '#FFEBE6',
    info: '#0052CC',
    infoContainer: '#DEEBFF',
    
    icon: '#4A5568',
    shadow: 'rgba(11, 60, 93, 0.08)',

    // Backward compatibility props
    backgroundElement: '#F0F4F8',
    backgroundSelected: '#D0E4FF',
  },
  dark: {
    primary: '#4D9FFF',
    primaryDark: '#0056B3',
    primaryContainer: '#003B7A',
    onPrimaryContainer: '#D0E4FF',
    
    secondary: '#4DD0E1',
    secondaryTeal: '#00A896',
    secondaryContainer: '#004D4D',
    onSecondaryContainer: '#CCEBEB',
    
    background: '#0F172A',
    backgroundGradientStart: '#0F172A',
    backgroundGradientEnd: '#1E293B',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textOnPrimary: '#FFFFFF',
    
    border: '#334155',
    borderFocused: '#4D9FFF',
    
    success: '#36B37E',
    successContainer: '#003822',
    warning: '#FFAB00',
    warningContainer: '#422400',
    error: '#FF5630',
    errorContainer: '#470400',
    info: '#4C9AFF',
    infoContainer: '#002966',
    
    icon: '#94A3B8',
    shadow: 'rgba(0, 0, 0, 0.3)',

    // Backward compatibility props
    backgroundElement: '#334155',
    backgroundSelected: '#003B7A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
});

export const Typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  title1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  title2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  title3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  labelLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  labelMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
};

/** 8pt Grid System */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  
  // Backward compatibility
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Elevation = {
  level1: {
    shadowColor: '#0B3C5D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  level2: {
    shadowColor: '#0B3C5D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  level3: {
    shadowColor: '#0B3C5D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const TouchTarget = {
  minHeight: 48,
  minWidth: 48,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
