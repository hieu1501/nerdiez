import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { CURRENT_USER } from '@/constants/userProfile';
import { Mono, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AuthController, type UserProfile } from '@/controllers/authController';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'tabBarBorder');
  const textMuted = useThemeColor({}, 'textMuted');
  const iconMuted = useThemeColor({}, 'icon');

  const controller = useMemo(() => AuthController.fromEnv(), []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!controller) return;
    setLoading(true);
    controller.getProfile().then((r) => {
      if (r.ok) setProfile(r.data);
      setLoading(false);
    });
  }, [controller]);

  const displayName = profile?.displayName ?? CURRENT_USER.displayName;
  const handle = profile?.handle ?? CURRENT_USER.handle;
  const bio = profile?.bio ?? CURRENT_USER.bio;
  const stats = profile?.stats ?? CURRENT_USER.stats;

  const tap = useCallback((title: string, msg?: string) => {
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
    Alert.alert(title, msg ?? 'Connect this action to your account service when you are ready.');
  }, []);

  const rows = [
    { label: 'Edit profile', icon: 'account-edit-outline' as const, onPress: () => tap('Edit profile') },
    { label: 'Saved from Explore', icon: 'bookmark-outline' as const, onPress: () => tap('Saved posts') },
    { label: 'Notifications', icon: 'bell-outline' as const, onPress: () => tap('Notifications') },
    { label: 'Achievements', icon: 'trophy-outline' as const, onPress: () => tap('Achievements', 'Your badges and milestones.') },
    { label: 'Settings', icon: 'cog-outline' as const, onPress: () => tap('Settings') },
    { label: 'Sign out', icon: 'logout' as const, onPress: () => tap('Sign out') },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.xxxl + insets.bottom }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: `${tint}28`, borderColor: border }]}>
            <ThemedText type="title" style={styles.avatarLetters}>
              {initials(displayName)}
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.name}>{displayName}</ThemedText>
          <ThemedText type="caption" style={{ color: textMuted }}>u/{handle}</ThemedText>
          <ThemedText type="default" style={styles.bio}>{bio}</ThemedText>
        </View>

        <View style={styles.statsRow}>
          <SurfaceCard compact style={styles.statCard}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={tint} />
            <ThemedText type="subtitle" style={styles.statNum}>{stats.postsShared}</ThemedText>
            <ThemedText type="caption">Posts</ThemedText>
          </SurfaceCard>
          <SurfaceCard compact style={styles.statCard}>
            <MaterialCommunityIcons name="school-outline" size={20} color={tint} />
            <ThemedText type="subtitle" style={styles.statNum}>{stats.lessonsShared}</ThemedText>
            <ThemedText type="caption">Lessons</ThemedText>
          </SurfaceCard>
          <SurfaceCard compact style={styles.statCard}>
            <MaterialCommunityIcons name="bookmark-outline" size={20} color={tint} />
            <ThemedText type="subtitle" style={styles.statNum}>{stats.savedFromCommunity}</ThemedText>
            <ThemedText type="caption">Saved</ThemedText>
          </SurfaceCard>
        </View>

        <ThemedText type="kicker" style={styles.sectionKicker}>Account</ThemedText>
        <SurfaceCard compact style={styles.menuCard}>
          {rows.map((r, i) => (
            <Pressable
              key={r.label}
              accessibilityRole="button"
              onPress={r.onPress}
              style={({ pressed }) => [
                styles.menuRow,
                i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: border },
                pressed && { opacity: 0.88 },
              ]}>
              <MaterialCommunityIcons name={r.icon} size={22} color={iconMuted} />
              <ThemedText type="defaultSemiBold" style={styles.menuLabel}>{r.label}</ThemedText>
              <MaterialCommunityIcons name="chevron-right" size={22} color={iconMuted} />
            </Pressable>
          ))}
        </SurfaceCard>

        {controller && (
          <ThemedText type="caption" style={[styles.footer, { color: textMuted }]}>
            {loading ? 'Syncing...' : profile ? 'Connected to server' : 'Unable to sync profile'}
          </ThemedText>
        )}
        {!controller && (
          <ThemedText type="caption" style={[styles.footer, { color: textMuted }]}>
            Profile data is local. Set EXPO_PUBLIC_LEARN_HUB_API_URL to connect.
          </ThemedText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  hero: { alignItems: 'center', marginBottom: Spacing.xl, gap: Spacing.xs },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  avatarLetters: { fontFamily: Mono.bold, fontSize: 28, lineHeight: 32 },
  name: { textAlign: 'center', marginTop: Spacing.xs },
  bio: { textAlign: 'center', marginTop: Spacing.md, lineHeight: 22, paddingHorizontal: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: Spacing.md },
  statNum: { fontSize: 20, lineHeight: 26, fontFamily: Mono.bold },
  sectionKicker: { marginBottom: Spacing.sm },
  menuCard: { paddingVertical: Spacing.xs, paddingHorizontal: 0, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  menuLabel: { flex: 1, fontSize: 15 },
  footer: { marginTop: Spacing.xl, textAlign: 'center', lineHeight: 18, fontFamily: Mono.regular },
});
