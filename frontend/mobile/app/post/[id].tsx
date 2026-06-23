import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COMMUNITY_POSTS } from '@/constants/communityFeed';
import { Colors, Mono, Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const SUBREDDIT_COLORS: Record<string, string> = {
  'r/teachable': '#58cc02',
  'r/coding': '#4fc3f7',
  'r/devtips': '#ffa726',
  'r/study': '#ab47bc',
  'r/a11y': '#ef5350',
};
const TAG_COLORS: Record<string, string> = {
  ml: '#7c4dff',
  teaching: '#58cc02',
  'react-native': '#61dafb',
  expo: '#8b5cf6',
  regex: '#ffa726',
  tools: '#78909c',
  learning: '#ab47bc',
  habits: '#ff7043',
  git: '#f4511e',
  teams: '#42a5f5',
  a11y: '#ef5350',
  mobile: '#26a69a',
};
const DEFAULT_SUB_COLOR = '#8e9aa8';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tint = useThemeColor({}, 'tint');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'tabBarBorder');
  const textMuted = useThemeColor({}, 'textMuted');

  const post = useMemo(() => COMMUNITY_POSTS.find((p) => p.id === id), [id]);

  if (!post) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: Colors.dark.background }]} edges={['top']}>
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={textMuted} />
          <ThemedText type="subtitle">Post not found</ThemedText>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: border }]}>
            <ThemedText type="defaultSemiBold">Go back</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const subColor = SUBREDDIT_COLORS[post.subreddit] ?? DEFAULT_SUB_COLOR;
  const score = post.upvotes - post.downvotes;
  const tagColor = TAG_COLORS[post.tags[0]?.toLowerCase()] ?? subColor;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: Colors.dark.background }]} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backArrow} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.dark.text} />
        </Pressable>
        <View style={[styles.subBadge, { backgroundColor: `${subColor}22`, borderColor: subColor }]}>
          <ThemedText type="caption" style={{ color: subColor, fontFamily: Mono.semibold, fontSize: 11 }}>
            {post.subreddit}
          </ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <ThemedText type="title" style={styles.title}>{post.title}</ThemedText>
          <View style={styles.metaRow}>
            <ThemedText type="caption" style={{ color: textMuted }}>
              Posted by u/{post.authorHandle} · {formatDate(post.publishedAt)}
            </ThemedText>
          </View>
          <View style={styles.tagRow}>
            {post.tags.map((t) => {
              const tc = TAG_COLORS[t.toLowerCase()] ?? DEFAULT_SUB_COLOR;
              return (
                <View key={t} style={[styles.tag, { backgroundColor: `${tc}18`, borderColor: `${tc}44` }]}>
                  <ThemedText type="caption" style={{ color: tc, fontSize: 10, fontFamily: Mono.semibold }}>{t}</ThemedText>
                </View>
              );
            })}
          </View>
        </View>

        <SurfaceCard style={styles.contentCard}>
          <ThemedText type="default" style={styles.contentText}>{post.excerpt}</ThemedText>
        </SurfaceCard>

        <View style={styles.voteSection}>
          <View style={[styles.scoreCard, { backgroundColor: surface, borderColor: border }]}>
            <MaterialCommunityIcons name="arrow-up-bold" size={20} color={tint} />
            <ThemedText type="subtitle" style={{ color: tint, fontFamily: Mono.bold }}>{score}</ThemedText>
            <MaterialCommunityIcons name="arrow-down-bold" size={20} color={textMuted} />
          </View>
          <View style={[styles.statCard, { backgroundColor: surface, borderColor: border }]}>
            <MaterialCommunityIcons name="comment-outline" size={20} color={textMuted} />
            <ThemedText type="defaultSemiBold" style={{ color: textMuted }}>{post.commentCount}</ThemedText>
            <ThemedText type="caption" style={{ color: textMuted }}>comments</ThemedText>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText type="kicker" style={{ color: textMuted, marginBottom: Spacing.md }}>About</ThemedText>
          <SurfaceCard compact style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={18} color={textMuted} />
              <ThemedText type="default">Author</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ marginLeft: 'auto' }}>{post.authorName}</ThemedText>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: border }]} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={textMuted} />
              <ThemedText type="default">Read time</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ marginLeft: 'auto' }}>{post.readTimeMin} min</ThemedText>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: border }]} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="tag-outline" size={18} color={textMuted} />
              <ThemedText type="default">Type</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ marginLeft: 'auto', color: tagColor }}>
                {post.kind === 'lesson' ? 'Lesson' : 'Article'}
              </ThemedText>
            </View>
          </SurfaceCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  backBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.full, borderWidth: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
  backArrow: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  subBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.xs, borderWidth: 1 },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  titleSection: { gap: Spacing.sm, marginBottom: Spacing.xl },
  title: { fontSize: 26, lineHeight: 32 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  tagRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  tag: { borderRadius: Radius.xs, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  contentCard: { marginBottom: Spacing.xl },
  contentText: { lineHeight: 26, fontSize: 16 },
  voteSection: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  scoreCard: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1 },
  infoSection: { marginBottom: Spacing.xl },
  infoCard: { gap: 0, padding: 0, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  infoDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: Spacing.lg },
});
