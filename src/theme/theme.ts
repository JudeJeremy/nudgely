import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// Define our custom colors
const colors = {
  primary: {
    light: '#0a7ea4', // Blue
    dark: '#1a9cc9',
  },
  secondary: {
    light: '#6c757d',
    dark: '#8c97a0',
  },
  success: {
    light: '#28a745',
    dark: '#48c764',
  },
  danger: {
    light: '#dc3545',
    dark: '#e45c6a',
  },
  warning: {
    light: '#ffc107',
    dark: '#ffcd39',
  },
  info: {
    light: '#17a2b8',
    dark: '#3ab9cc',
  },
  background: {
    light: '#f8f9fa',
    dark: '#121212',
  },
  card: {
    light: '#ffffff',
    dark: '#1e1e1e',
  },
  text: {
    light: '#212529',
    dark: '#f8f9fa',
  },
  border: {
    light: '#dee2e6',
    dark: '#2d2d2d',
  },
  notification: {
    light: '#dc3545',
    dark: '#e45c6a',
  },
  // Category colors
  categories: {
    personal: {
      light: '#4e73df', // Blue
      dark: '#6e8fe0',
    },
    work: {
      light: '#1cc88a', // Green
      dark: '#3dd9a0',
    },
    health: {
      light: '#e74a3b', // Red
      dark: '#eb6d61',
    },
    learning: {
      light: '#f6c23e', // Yellow
      dark: '#f7cd5e',
    },
    shopping: {
      light: '#6f42c1', // Purple
      dark: '#8c63d4',
    },
    other: {
      light: '#858796', // Gray
      dark: '#9da0ac',
    },
  },
};

// Define typography
const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 42,
  },
};

// Define spacing
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Define border radius
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Define shadows
const shadows = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 1.5,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 3.0,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.5,
      shadowRadius: 6.0,
      elevation: 10,
    },
  },
};

// Create our custom theme extending the default themes
export const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary.light,
    background: colors.background.light,
    card: colors.card.light,
    text: colors.text.light,
    border: colors.border.light,
    notification: colors.notification.light,
  },
  typography,
  spacing,
  borderRadius,
  shadows: shadows.light,
  dark: false,
  colors_extended: {
    ...colors,
    mode: 'light',
  },
};

export const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary.dark,
    background: colors.background.dark,
    card: colors.card.dark,
    text: colors.text.dark,
    border: colors.border.dark,
    notification: colors.notification.dark,
  },
  typography,
  spacing,
  borderRadius,
  shadows: shadows.dark,
  dark: true,
  colors_extended: {
    ...colors,
    mode: 'dark',
  },
};

// Helper function to get the current theme based on mode
export const getTheme = (mode: 'light' | 'dark' | 'system', systemIsDark: boolean) => {
  if (mode === 'light') return CustomLightTheme;
  if (mode === 'dark') return CustomDarkTheme;
  return systemIsDark ? CustomDarkTheme : CustomLightTheme;
};

// Export theme types
export type Theme = typeof CustomLightTheme;
