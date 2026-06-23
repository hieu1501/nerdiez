/**
 * App colors and typography.
 * “Light” follows a Duolingo-style soft dark: warm charcoal surfaces, high-contrast text, vivid green accent.
 * System dark mode pushes backgrounds a step deeper for night use.
 */

import { Platform, type ViewStyle } from 'react-native';

/** JetBrains Mono — load via `useFonts` in `app/_layout.tsx`; names match @expo-google-fonts/jetbrains-mono */
export const Mono = {
  thin: 'JetBrainsMono_100Thin',
  regular: 'JetBrainsMono_400Regular',
  medium: 'JetBrainsMono_500Medium',
  semibold: 'JetBrainsMono_600SemiBold',
  bold: 'JetBrainsMono_700Bold',
} as const;

/** Duolingo-style primary green */
const tintLight = '#58cc02';
/** Slightly brighter on deeper dark surfaces */
const tintDark = '#6ee34a';

export const Colors = {
  light: {
    text: '#f7f7f7',
    textMuted: '#a7b4c0',
    background: '#282e33',
    surface: '#353c44',
    tint: tintLight,
    icon: '#8e9aa8',
    tabIconDefault: '#6b7785',
    tabIconSelected: tintLight,
    tabBar: '#22272c',
    tabBarBorder: '#3a424b',
    /** Status bar icon/text color: always light on this palette */
    statusBarStyle: 'light' as const,
  },
  dark: {
    text: '#f2f5f8',
    textMuted: '#97a6b5',
    background: '#14191e',
    surface: '#1f262e',
    tint: tintDark,
    icon: '#8b99a8',
    tabIconDefault: '#5c6975',
    tabIconSelected: tintDark,
    tabBar: '#101418',
    tabBarBorder: '#2a323c',
    statusBarStyle: 'light' as const,
  },
};

/** Shared corner radii for cards, sheets, and controls */
export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
  full: 9999,
} as const;

/** Rhythm for padding and gaps */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Soft elevation for floating cards (works on iOS + Android) */
export function cardShadowStyle(): ViewStyle {
  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }) ?? {}
  );
}

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
