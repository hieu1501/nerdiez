import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import {
  COMMUNITY_POSTS,
  type CommunityPost,
  type CommunityPostKind,
} from '@/constants/communityFeed';
import { Colors, Mono, Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CommunityController, type CreatePostPayload } from '@/controllers/communityController';

type FeedFilter = 'all' | CommunityPostKind;
type VoteState = 'up' | 'down' | 'none';

const SUBREDDIT_COLORS: Record<string, string> = {
  'r/teachable': '#58cc02',
  'r/coding': '#4fc3f7',
  'r/devtips': '#ffa726',
  'r/study': '#ab47bc',
  'r/a11y': '#ef5350',
};
const DEFAULT_SUB_COLOR = '#8e9aa8';
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

const SUBREDDITS = ['all', 'r/teachable', 'r/coding', 'r/devtips', 'r/study', 'r/a11y'];

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'tabBarBorder');
  const textMuted = useThemeColor({}, 'textMuted');

  const controller = useMemo(() => CommunityController.fromEnv(), []);
  const [posts, setPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [subreddit, setSubreddit] = useState('all');
  const [votes, setVotes] = useState<Record<string, VoteState>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    excerpt: '',
    kind: 'article' as CommunityPostKind,
    subreddit: 'r/learn',
  });

  const filteredPosts = useMemo(() => {
    let f = posts;
    if (filter !== 'all') f = f.filter((p) => p.kind === filter);
    if (subreddit !== 'all') f = f.filter((p) => p.subreddit === subreddit);
    return f;
  }, [filter, subreddit, posts]);

  const refreshPosts = useCallback(async () => {
    if (!controller) return;
    const r = await controller.fetchPosts();
    if (r.ok) setPosts(r.data);
  }, [controller]);

  useEffect(() => {
    void refreshPosts();
  }, [refreshPosts]);

  const onVote = useCallback(async (postId: string, direction: VoteState) => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = votes[postId] ?? 'none';
    const newDir = current === direction ? 'none' : direction;

    setVotes((prev) => ({ ...prev, [postId]: newDir }));
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        let u = p.upvotes;
        let d = p.downvotes;
        if (current === 'up') u--;
        if (current === 'down') d--;
        if (newDir === 'up') u++;
        if (newDir === 'down') d++;
        return { ...p, upvotes: u, downvotes: d };
      }),
    );

    if (controller) {
      const r = await controller.votePost(postId, newDir);
      if (!r.ok) {
        setVotes((prev) => ({ ...prev, [postId]: current }));
      }
    }
  }, [controller, votes]);

  const onFilter = useCallback((key: FeedFilter) => setFilter(key), []);

  const onOpenPost = useCallback((post: CommunityPost) => {
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
    router.push(`/post/${post.id}` as unknown as Parameters<typeof router.push>[0]);
  }, [router]);

  const onShare = useCallback((post: CommunityPost) => {
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
    Alert.alert('Share', `Share "${post.title}" via your preferred app.`);
  }, []);

  const onCreatePost = useCallback(async () => {
    if (!newPost.title.trim() || !newPost.excerpt.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }
    const payload: CreatePostPayload = {
      ...newPost,
      authorName: 'You',
      authorHandle: 'u/current_user',
      tags: ['new'],
      readTimeMin: 5,
    };
    if (controller) {
      const r = await controller.createPost(payload);
      if (r.ok) {
        setPosts((prev) => [r.data, ...prev]);
        setIsModalOpen(false);
        setNewPost({ title: '', excerpt: '', kind: 'article', subreddit: 'r/learn' });
      } else {
        Alert.alert('Error', r.error);
      }
    } else {
      const localPost: CommunityPost = {
        ...payload,
        id: `local-${Date.now()}`,
        publishedAt: new Date().toISOString(),
        upvotes: 1,
        downvotes: 0,
        commentCount: 0,
        tags: payload.tags ?? ['new'],
        subreddit: payload.subreddit ?? 'r/learn',
      };
      setPosts((prev) => [localPost, ...prev]);
      setIsModalOpen(false);
      setNewPost({ title: '', excerpt: '', kind: 'article', subreddit: 'r/learn' });
    }
  }, [controller, newPost]);

  const headerImage = (
    <View style={styles.headerIconWrap} accessibilityElementsHidden>
      <MaterialCommunityIcons name="reddit" size={100} color="rgba(255,255,255,0.35)" />
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#2c3d4d', dark: '#151b22' }}
      headerImage={headerImage}>
      <View style={styles.intro}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <ThemedText type="kicker" style={{ color: Colors.dark.tint }}>Community</ThemedText>
            <ThemedText type="title">Explore</ThemedText>
          </View>
          <Pressable
            onPress={() => setIsModalOpen(true)}
            style={({ pressed }) => [styles.createBtn, { backgroundColor: Colors.dark.tint }, pressed && { opacity: 0.8 }]}>
            <MaterialCommunityIcons name="plus" size={24} color="#131a12" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}>
        {SUBREDDITS.map((sub) => {
          const active = subreddit === sub;
          const subColor = SUBREDDIT_COLORS[sub] ?? DEFAULT_SUB_COLOR;
          return (
            <Pressable
              key={sub}
              onPress={() => setSubreddit(sub)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? subColor : surface,
                  borderColor: active ? subColor : border,
                },
              ]}>
              {active && <MaterialCommunityIcons name="check-circle" size={14} color="#131a12" style={{ marginRight: 4 }} />}
              <ThemedText
                type="defaultSemiBold"
                style={{ color: active ? '#131a12' : textMuted, fontSize: 12 }}>
                {sub === 'all' ? 'All' : sub}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        {(['all', 'article', 'lesson'] as const).map((key) => {
          const active = filter === key;
          const icon = key === 'all' ? 'view-grid-outline' : key === 'article' ? 'file-document-outline' : 'school-outline';
          return (
            <Pressable
              key={key}
              onPress={() => onFilter(key)}
              style={[styles.filterChip, { backgroundColor: active ? `${Colors.dark.tint}22` : surface, borderColor: active ? Colors.dark.tint : border }]}>
              <MaterialCommunityIcons name={icon} size={14} color={active ? Colors.dark.tint : textMuted} />
              <ThemedText type="defaultSemiBold" style={{ color: active ? Colors.dark.tint : textMuted, fontSize: 12, marginLeft: 4 }}>
                {key === 'all' ? 'All Posts' : key === 'article' ? 'Articles' : 'Lessons'}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.list, { paddingBottom: Spacing.xl + insets.bottom }]}>
        {filteredPosts.map((post) => {
          const voteState = votes[post.id] ?? 'none';
          const score = post.upvotes - post.downvotes;
          const subColor = SUBREDDIT_COLORS[post.subreddit] ?? DEFAULT_SUB_COLOR;
          return (
            <SurfaceCard key={post.id} style={styles.postCard}>
              <Pressable onPress={() => onOpenPost(post)} style={({ pressed }) => [pressed && { opacity: 0.97 }]}>
                <View style={styles.postRow}>
                  <View style={styles.voteCol}>
                    <Pressable onPress={() => onVote(post.id, 'up')} hitSlop={8}>
                      <MaterialCommunityIcons
                        name={voteState === 'up' ? 'arrow-up-bold' : 'arrow-up-bold-outline'}
                        size={22}
                        color={voteState === 'up' ? Colors.dark.tint : textMuted}
                      />
                    </Pressable>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[styles.voteCount, { color: voteState === 'up' ? Colors.dark.tint : voteState === 'down' ? '#ff6b6b' : textMuted }]}>
                      {score}
                    </ThemedText>
                    <Pressable onPress={() => onVote(post.id, 'down')} hitSlop={8}>
                      <MaterialCommunityIcons
                        name={voteState === 'down' ? 'arrow-down-bold' : 'arrow-down-bold-outline'}
                        size={22}
                        color={voteState === 'down' ? '#ff6b6b' : textMuted}
                      />
                    </Pressable>
                  </View>
                  <View style={styles.postContent}>
                    <View style={styles.postMeta}>
                      <View style={[styles.subBadge, { backgroundColor: `${subColor}22`, borderColor: subColor }]}>
                        <MaterialCommunityIcons
                          name={post.kind === 'lesson' ? 'school-outline' : 'file-document-outline'}
                          size={12}
                          color={subColor}
                        />
                        <ThemedText type="caption" style={{ color: subColor, fontSize: 10, fontFamily: Mono.semibold }}>
                          {post.subreddit}
                        </ThemedText>
                      </View>
                      <ThemedText type="caption" style={{ color: textMuted, fontSize: 11 }}>
                        u/{post.authorHandle} · {formatRelative(post.publishedAt)}
                      </ThemedText>
                    </View>
                    <ThemedText type="subtitle" style={styles.postTitle}>{post.title}</ThemedText>
                    <ThemedText type="caption" style={styles.excerpt} numberOfLines={2}>
                      {post.excerpt}
                    </ThemedText>
                    <View style={styles.postFooter}>
                      <View style={styles.tagRow}>
                        {post.tags.slice(0, 3).map((t) => {
                          const tc = TAG_COLORS[t.toLowerCase()] ?? DEFAULT_SUB_COLOR;
                          return (
                            <View key={t} style={[styles.tag, { backgroundColor: `${tc}18`, borderColor: `${tc}44` }]}>
                              <ThemedText type="caption" style={{ color: tc, fontSize: 10, fontFamily: Mono.semibold }}>
                                {t}
                              </ThemedText>
                            </View>
                          );
                        })}
                      </View>
                      <View style={styles.actionRow}>
                        <Pressable style={styles.actionBtn}>
                          <MaterialCommunityIcons name="comment-outline" size={16} color={textMuted} />
                          <ThemedText type="caption" style={{ color: textMuted, marginLeft: 3 }}>{post.commentCount}</ThemedText>
                        </Pressable>
                        <Pressable onPress={() => onShare(post)} style={styles.actionBtn}>
                          <MaterialCommunityIcons name="share-outline" size={16} color={textMuted} />
                        </Pressable>
                        <Pressable style={styles.actionBtn}>
                          <MaterialCommunityIcons name="bookmark-outline" size={16} color={textMuted} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            </SurfaceCard>
          );
        })}
      </View>

      <Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <SurfaceCard style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Create a post</ThemedText>
            <View style={styles.kindToggle}>
              {(['article', 'lesson'] as const).map((k) => (
                <Pressable
                  key={k}
                  onPress={() => setNewPost((p) => ({ ...p, kind: k }))}
                  style={[styles.kindToggleBtn, { backgroundColor: newPost.kind === k ? Colors.dark.tint : surface, borderColor: newPost.kind === k ? Colors.dark.tint : border }]}>
                  <ThemedText type="defaultSemiBold" style={{ color: newPost.kind === k ? '#131a12' : textMuted, fontSize: 13 }}>
                    {k === 'article' ? 'Article' : 'Lesson'}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            <TextInput
              placeholder="Title"
              placeholderTextColor={textMuted}
              value={newPost.title}
              onChangeText={(t) => setNewPost((p) => ({ ...p, title: t }))}
              style={[styles.input, { color: Colors.dark.text, backgroundColor: Colors.dark.surface, borderColor: border }]}
            />
            <TextInput
              placeholder="Content"
              placeholderTextColor={textMuted}
              value={newPost.excerpt}
              onChangeText={(t) => setNewPost((p) => ({ ...p, excerpt: t }))}
              multiline
              style={[styles.input, styles.inputMultiline, { color: Colors.dark.text, backgroundColor: Colors.dark.surface, borderColor: border }]}
            />
            <TextInput
              placeholder="Subreddit (e.g. r/learn)"
              placeholderTextColor={textMuted}
              value={newPost.subreddit}
              onChangeText={(t) => setNewPost((p) => ({ ...p, subreddit: t }))}
              style={[styles.input, { color: Colors.dark.text, backgroundColor: Colors.dark.surface, borderColor: border }]}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setIsModalOpen(false)} style={[styles.modalBtn, { borderColor: border }]}>
                <ThemedText type="defaultSemiBold">Cancel</ThemedText>
              </Pressable>
              <Pressable onPress={onCreatePost} style={[styles.modalBtn, { backgroundColor: Colors.dark.tint }]}>
                <ThemedText type="defaultSemiBold" style={{ color: '#131a12' }}>Post</ThemedText>
              </Pressable>
            </View>
          </SurfaceCard>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerIconWrap: { alignItems: 'center', justifyContent: 'center', height: '100%' },
  intro: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, marginBottom: Spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  createBtn: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  chipsRow: { paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.sm, paddingVertical: Spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1 },
  filterRow: { paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.md },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1 },
  list: { paddingHorizontal: Spacing.md, gap: Spacing.md },
  postCard: { padding: Spacing.md, marginBottom: 0 },
  postRow: { flexDirection: 'row', gap: Spacing.md },
  voteCol: { alignItems: 'center', gap: 2, width: 40, paddingTop: 2 },
  voteCount: { fontSize: 13, fontFamily: Mono.bold },
  postContent: { flex: 1, gap: 6 },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  subBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.xs, borderWidth: 1 },
  postTitle: { fontSize: 17, lineHeight: 22, marginTop: 2 },
  excerpt: { lineHeight: 18, marginTop: 2 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  tagRow: { flexDirection: 'row', gap: Spacing.xs, flex: 1, flexWrap: 'wrap' },
  tag: { borderRadius: Radius.xs, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 6, borderRadius: Radius.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, gap: Spacing.lg, padding: Spacing.xl, paddingBottom: Spacing.xxxl + 20 },
  modalTitle: { textAlign: 'center', marginBottom: Spacing.xs },
  kindToggle: { flexDirection: 'row', gap: Spacing.sm },
  kindToggleBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.full, borderWidth: 1 },
  input: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.lg, fontSize: 16, fontFamily: Mono.regular },
  inputMultiline: { minHeight: 140, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  modalBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md + 2, borderRadius: Radius.full, borderWidth: 1, borderColor: 'transparent' },
});
