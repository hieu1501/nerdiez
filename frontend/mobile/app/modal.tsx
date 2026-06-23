import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ModalScreen() {
  const tint = useThemeColor({}, 'tint');
  const bg = useThemeColor({}, 'background');

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <SurfaceCard style={styles.card}>
        <ThemedText type="kicker">Overlay</ThemedText>
        <ThemedText type="title" style={styles.title}>
          Sample modal
        </ThemedText>
        <ThemedText type="caption" style={styles.body}>
          Modals are ideal for short tasks, confirmations, or focused content without leaving the
          current flow.
        </ThemedText>
        <Link href="/" dismissTo asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Return to home"
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: tint },
              pressed && { opacity: 0.9 },
            ]}>
            <ThemedText type="defaultSemiBold" style={styles.primaryBtnText}>
              Back to home
            </ThemedText>
            <IconSymbol name="chevron.right" size={18} color="#131a12" style={styles.btnIcon} />
          </Pressable>
        </Link>
      </SurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.sm,
  },
  title: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  body: {
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
  },
  primaryBtnText: {
    color: '#131a12',
  },
  btnIcon: {
    marginLeft: 2,
  },
});
