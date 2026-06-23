import { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <SurfaceCard compact style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((value) => !value)}
        style={({ pressed }) => [styles.heading, pressed && styles.headingPressed]}>
        <View
          style={[
            styles.chevronWrap,
            { transform: [{ rotate: isOpen ? '90deg' : '0deg' }] },
          ]}>
          <IconSymbol
            name="chevron.right"
            size={18}
            weight="medium"
            color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          />
        </View>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {title}
        </ThemedText>
      </Pressable>
      {isOpen ? <View style={styles.content}>{children}</View> : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  headingPressed: {
    opacity: 0.88,
  },
  chevronWrap: {
    width: 28,
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  content: {
    marginTop: Spacing.md,
    marginLeft: 28,
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
});
