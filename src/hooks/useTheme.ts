import { useColorScheme } from 'react-native';
import { useAppSelector } from '../store';
import { getTheme, Theme } from '../theme/theme';

/**
 * Custom hook to access the current theme based on user preferences and system settings
 * @returns The current theme object
 */
export const useTheme = (): Theme => {
  const systemColorScheme = useColorScheme();
  const themeMode = useAppSelector((state) => state.settings.theme.mode);
  
  const systemIsDark = systemColorScheme === 'dark';
  return getTheme(themeMode, systemIsDark);
};
