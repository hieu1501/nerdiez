import { StyleSheet, Text, type TextProps } from 'react-native';

import { Mono } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'kicker';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const muted = useThemeColor({}, 'textMuted');
  const tint = useThemeColor({}, 'tint');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: tint }] : undefined,
        type === 'caption' ? [styles.caption, { color: muted }] : undefined,
        type === 'kicker' ? [styles.kicker, { color: muted }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Mono.medium,
  },
  title: {
    fontSize: 32,
    fontFamily: Mono.bold,
    lineHeight: 38,
    letterSpacing: -0.75,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: Mono.semibold,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  link: {
    lineHeight: 24,
    fontSize: 16,
    fontFamily: Mono.medium,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Mono.regular,
  },
  kicker: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Mono.semibold,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
});
