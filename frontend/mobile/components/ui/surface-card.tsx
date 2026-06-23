import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing, cardShadowStyle } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type SurfaceCardProps = ViewProps & {
  /** Tighter padding for dense rows */
  compact?: boolean;
};

export function SurfaceCard({ style, children, compact, ...rest }: SurfaceCardProps) {
  const backgroundColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'tabBarBorder');

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          padding: compact ? Spacing.lg : Spacing.xl,
          ...cardShadowStyle(),
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
