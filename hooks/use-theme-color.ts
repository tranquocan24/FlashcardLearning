/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, ColorTheme } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

// Legacy support for old color props pattern
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { theme } = useTheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// New hook for semantic color names from comprehensive palette
export function useThemedColor(colorName: keyof ColorTheme): string {
  const { colors } = useTheme();
  return colors[colorName];
}
