import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Mono, Radius, Colors, Spacing } from '@/constants/theme';
import { LearnHubController, type LessonCompletionRow, type UserNoteRow } from '@/controllers/learnHubController';
import { ALL_LESSONS, REVIEW_CARDS, TOPICS, type TopicIconName } from '@/constants/learnHubData';
import { useThemeColor } from '@/hooks/use-theme-color';

type ReviewPhase = 'pick' | 'quiz' | 'summary';
type QuizCard = { q: string; a: string; w: string[]; lessonId: string };

function iconForTopic(name: TopicIconName): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (name) {
    case 'cpu': return 'cpu-64-bit';
    case 'trending-up': return 'trending-up';
    case 'sigma': return 'sigma';
    default: return 'book-open-variant';
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function circleProgress(pct: number, size: number, stroke: number, color: string) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: `${color}33`,
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: 'transparent',
          borderTopColor: color,
          borderRightColor: color,
          transform: [{ rotate: `${-90 + 360 * pct}deg` }],
          position: 'absolute',
        }}
      />
    </View>
  );
}

export function LearnHubScreen() {
  const insets = useSafeAreaInsets();
  const tint = useThemeColor({}, 'tint');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'tabBarBorder');
  const textMuted = useThemeColor({}, 'textMuted');

  const controller = useMemo(() => LearnHubController.fromEnv(), []);

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [reviewPhase, setReviewPhase] = useState<ReviewPhase>('pick');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizDeck, setQuizDeck] = useState<QuizCard[]>([]);
  const [quizLocked, setQuizLocked] = useState(false);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizSessionCorrect, setQuizSessionCorrect] = useState(0);
  const [quizChosen, setQuizChosen] = useState<string | null>(null);
  const [reviewLessonId, setReviewLessonId] = useState<string | null>(null);
  const [hearts, setHearts] = useState(5);

  const [completions, setCompletions] = useState<Map<string, LessonCompletionRow>>(new Map());
  const [notes, setNotes] = useState<UserNoteRow[]>([]);
  const [noteText, setNoteText] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!controller) { setLoading(false); return; }
      const r = await controller.fetchSync();
      if (r.ok) {
        const cm = new Map<string, LessonCompletionRow>();
        for (const c of r.data.completions) if (c.lesson_id) cm.set(c.lesson_id, c);
        setCompletions(cm);
        setNotes(r.data.notes);
      }
      setLoading(false);
    }
    void load();
  }, [controller]);

  const onCompleteLesson = useCallback(async (lessonId: string, topicId: string) => {
    const newRow: LessonCompletionRow = { lesson_id: lessonId, topic_id: topicId, completed: true, completed_at: new Date().toISOString() };
    setCompletions((prev) => { const n = new Map(prev); n.set(lessonId, newRow); return n; });
    if (controller) {
      const r = await controller.createCompletion(newRow);
      if (!r.ok) setCompletions((prev) => { const n = new Map(prev); n.delete(lessonId); return n; });
    }
  }, [controller]);

  const onAddNote = useCallback(async () => {
    if (!noteText.trim()) return;
    const note: Omit<UserNoteRow, '__backendId'> = {
      note_id: `note-${Date.now()}`,
      note_text: noteText.trim(),
      note_created: new Date().toISOString(),
      topic_id: selectedTopic ?? '',
      lesson_id: selectedLesson ?? '',
    };
    if (controller) {
      const r = await controller.createNote(note);
      if (r.ok) setNotes((prev) => [r.data, ...prev]);
    } else {
      setNotes((prev) => [{ ...note, __backendId: note.note_id }, ...prev]);
    }
    setNoteText('');
    setShowNoteModal(false);
  }, [noteText, selectedTopic, selectedLesson, controller]);

  const onDeleteNote = useCallback(async (backendId: string) => {
    setNotes((prev) => prev.filter((n) => n.__backendId !== backendId));
    if (controller) await controller.deleteNote(backendId);
  }, [controller]);

  const onStartReview = useCallback((lessonId: string) => {
    const cards = REVIEW_CARDS[lessonId];
    if (!cards || cards.length === 0) {
      Alert.alert('No cards', 'No review cards available for this lesson yet.');
      return;
    }
    const deck: QuizCard[] = cards.map((c) => ({ ...c, lessonId }));
    setQuizDeck(shuffleArray(deck));
    setQuizIndex(0);
    setQuizStreak(0);
    setQuizSessionCorrect(0);
    setQuizChosen(null);
    setQuizLocked(false);
    setHearts(5);
    setReviewLessonId(lessonId);
    setReviewPhase('quiz');
  }, []);

  const onAnswer = useCallback((selected: string, correct: string, card: QuizCard) => {
    if (quizLocked) return;
    setQuizChosen(selected);
    setQuizLocked(true);
    const isCorrect = selected === correct;
    if (isCorrect) {
      setQuizStreak((s) => s + 1);
      setQuizSessionCorrect((c) => c + 1);
    } else {
      setQuizStreak(0);
      setHearts((h) => Math.max(0, h - 1));
    }
    const cardId = `review-${card.lessonId}-q${quizIndex}`;
    if (controller) {
      void controller.recordQuizAttempt({ card_id: cardId, correct: isCorrect, lesson_id: card.lessonId });
    }
    setTimeout(() => {
      const next = quizIndex + 1;
      if (next >= quizDeck.length || hearts <= 1) {
        setReviewPhase('summary');
        setQuizLocked(false);
        setQuizChosen(null);
        return;
      }
      setQuizIndex(next);
      setQuizLocked(false);
      setQuizChosen(null);
    }, 800);
  }, [quizIndex, quizDeck.length, quizLocked, hearts, controller]);

  const completedCount = (topicId: string) =>
    TOPICS.find((t) => t.id === topicId)?.lessons.filter((l) => completions.has(l.id)).length ?? 0;
  const totalLessons = (topicId: string) =>
    TOPICS.find((t) => t.id === topicId)?.lessons.length ?? 0;

  const totalDone = Array.from(completions.values()).filter((c) => c.completed).length;
  const totalAll = ALL_LESSONS.length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: Colors.dark.background }]} edges={['top']}>
        <View style={styles.center}><ActivityIndicator size="large" color={tint} /></View>
      </SafeAreaView>
    );
  }

  if (reviewPhase === 'quiz' && quizDeck.length > 0) {
    const card = quizDeck[quizIndex]!;
    const options = shuffleArray([card.a, ...card.w]);
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: Colors.dark.background }]} edges={['top']}>
        <View style={styles.quizHeader}>
          <Pressable onPress={() => setReviewPhase('pick')}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.dark.text} />
          </Pressable>
          <View style={styles.quizProgress}>
            <View style={[styles.quizProgressFill, { width: `${((quizIndex + 1) / quizDeck.length) * 100}%`, backgroundColor: tint }]} />
          </View>
          <View style={styles.heartsRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <MaterialCommunityIcons
                key={i}
                name={i < hearts ? 'heart' : 'heart-outline'}
                size={20}
                color={i < hearts ? '#ff4444' : textMuted}
              />
            ))}
          </View>
        </View>
        <View style={styles.quizBody}>
          <View style={[styles.streakBadge, { backgroundColor: `${tint}22` }]}>
            <MaterialCommunityIcons name="flash" size={20} color={tint} />
            <ThemedText type="defaultSemiBold" style={{ color: tint }}>{quizStreak}</ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.quizQuestion}>{card.q}</ThemedText>
        </View>
        <View style={styles.quizOptions}>
          {options.map((opt) => {
            const isCorrect = opt === card.a;
            const isSelected = opt === quizChosen;
            let bg = surface;
            if (quizLocked) {
              if (isCorrect) bg = `${tint}33`;
              else if (isSelected) bg = '#ff444433';
            }
            return (
              <Pressable
                key={opt}
                disabled={quizLocked}
                onPress={() => onAnswer(opt, card.a, card)}
                style={({ pressed }) => [
                  styles.quizOption,
                  { backgroundColor: bg, borderColor: quizLocked && isCorrect ? tint : border },
                  pressed && !quizLocked && { opacity: 0.8 },
                ]}>
                <ThemedText type="defaultSemiBold" style={styles.quizOptionText}>{opt}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    );
  }

  if (reviewPhase === 'summary') {
    const total = quizDeck.length;
    const correct = quizSessionCorrect;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: Colors.dark.background }]} edges={['top']}>
        <View style={styles.center}>
          <MaterialCommunityIcons name={pct >= 80 ? 'trophy' : pct >= 50 ? 'star' : 'refresh'} size={64} color={pct >= 80 ? '#ffcc00' : tint} />
          <ThemedText type="title" style={{ marginTop: Spacing.md }}>Review Complete</ThemedText>
          <ThemedText type="subtitle" style={{ color: textMuted }}>{correct}/{total} correct ({pct}%)</ThemedText>
          <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl }}>
            <Pressable onPress={() => reviewLessonId && onStartReview(reviewLessonId)} style={[styles.summaryBtn, { backgroundColor: tint }]}>
              <ThemedText type="defaultSemiBold" style={{ color: '#131a12' }}>Retry</ThemedText>
            </Pressable>
            <Pressable onPress={() => setReviewPhase('pick')} style={[styles.summaryBtn, { borderColor: border, borderWidth: 1 }]}>
              <ThemedText type="defaultSemiBold">Done</ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentTopic = selectedTopic ? TOPICS.find((t) => t.id === selectedTopic) : null;
  const currentLesson = selectedLesson && currentTopic
    ? currentTopic.lessons.find((l) => l.id === selectedLesson)
    : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: Colors.dark.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxxl + insets.bottom }}
        showsVerticalScrollIndicator={false}>

        <View style={styles.headerSection}>
          <View style={styles.topBar}>
            <View>
              <ThemedText type="kicker" style={{ color: textMuted }}>Learn</ThemedText>
              <ThemedText type="title">Courses</ThemedText>
            </View>
            <View style={styles.gemRow}>
              <MaterialCommunityIcons name="star" size={22} color="#ffcc00" />
              <ThemedText type="defaultSemiBold" style={{ color: '#ffcc00' }}>850</ThemedText>
            </View>
          </View>
          <View style={styles.streakCard}>
            <View style={styles.streakItem}>
              <MaterialCommunityIcons name="flash" size={24} color="#ff9500" />
              <View>
                <ThemedText type="subtitle" style={{ fontSize: 20, lineHeight: 24 }}>12</ThemedText>
                <ThemedText type="caption" style={{ color: textMuted }}>Day Streak</ThemedText>
              </View>
            </View>
            <View style={[styles.streakDivider, { backgroundColor: border }]} />
            <View style={styles.streakItem}>
              <MaterialCommunityIcons name="check-circle" size={24} color={tint} />
              <View>
                <ThemedText type="subtitle" style={{ fontSize: 20, lineHeight: 24 }}>{totalDone}/{totalAll}</ThemedText>
                <ThemedText type="caption" style={{ color: textMuted }}>Lessons</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {currentLesson && selectedTopic ? (
          <View style={styles.detailSection}>
            <Pressable onPress={() => setSelectedLesson(null)} style={styles.backRow}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={tint} />
              <ThemedText type="defaultSemiBold" style={{ color: tint }}>{currentTopic?.name}</ThemedText>
            </Pressable>
            <SurfaceCard style={styles.lessonDetail}>
              <ThemedText type="subtitle">{currentLesson.title}</ThemedText>
              <ThemedText type="default" style={styles.lessonContent}>{currentLesson.content}</ThemedText>
              <View style={styles.lessonActions}>
                {!completions.has(currentLesson.id) && (
                  <Pressable onPress={() => onCompleteLesson(currentLesson.id, selectedTopic)} style={[styles.actionBtn, { backgroundColor: tint }]}>
                    <MaterialCommunityIcons name="check" size={18} color="#131a12" />
                    <ThemedText type="defaultSemiBold" style={{ color: '#131a12', fontSize: 13 }}>Mark Complete</ThemedText>
                  </Pressable>
                )}
                <Pressable onPress={() => setShowNoteModal(true)} style={[styles.actionBtn, { borderColor: border, borderWidth: 1 }]}>
                  <MaterialCommunityIcons name="note-plus-outline" size={18} color={tint} />
                  <ThemedText type="caption">Add Note</ThemedText>
                </Pressable>
                <Pressable onPress={() => onStartReview(currentLesson.id)} style={[styles.actionBtn, { borderColor: border, borderWidth: 1 }]}>
                  <MaterialCommunityIcons name="card-bulleted-outline" size={18} color={tint} />
                  <ThemedText type="caption">Review</ThemedText>
                </Pressable>
              </View>
            </SurfaceCard>
          </View>
        ) : selectedTopic && currentTopic ? (
          <View style={styles.detailSection}>
            <Pressable onPress={() => setSelectedTopic(null)} style={styles.backRow}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={tint} />
              <ThemedText type="defaultSemiBold" style={{ color: tint }}>All Courses</ThemedText>
            </Pressable>
            <View style={styles.unitHeader}>
              <View style={[styles.unitIcon, { backgroundColor: `${currentTopic.color}22` }]}>
                <MaterialCommunityIcons name={iconForTopic(currentTopic.icon)} size={32} color={currentTopic.color} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="title" style={{ fontSize: 24, lineHeight: 30 }}>{currentTopic.name}</ThemedText>
                <ThemedText type="caption" style={{ color: textMuted }}>
                  {completedCount(selectedTopic)}/{totalLessons(selectedTopic)} lessons completed
                </ThemedText>
              </View>
              {circleProgress(
                totalLessons(selectedTopic) > 0 ? completedCount(selectedTopic) / totalLessons(selectedTopic) : 0,
                56, 4, currentTopic.color,
              )}
            </View>
            <View style={styles.unitLine}>
              {currentTopic.lessons.map((lesson, idx) => {
                const isCompleted = completions.has(lesson.id);
                const isCurrent = lesson.id === selectedLesson;
                return (
                  <View key={lesson.id}>
                    {idx > 0 && <View style={[styles.nodeConnector, { backgroundColor: isCompleted ? currentTopic.color : border }]} />}
                    <Pressable
                      onPress={() => setSelectedLesson(lesson.id)}
                      style={({ pressed }) => [
                        styles.node,
                        {
                          backgroundColor: isCompleted ? currentTopic.color : isCurrent ? surface : surface,
                          borderColor: isCurrent ? tint : isCompleted ? currentTopic.color : border,
                        },
                        pressed && { opacity: 0.85 },
                      ]}>
                      <MaterialCommunityIcons
                        name={isCompleted ? 'check-circle' : isCurrent ? 'play-circle' : 'circle-outline'}
                        size={24}
                        color={isCompleted ? '#131a12' : isCurrent ? tint : textMuted}
                      />
                      <View style={{ flex: 1, marginLeft: Spacing.md }}>
                        <ThemedText
                          type="defaultSemiBold"
                          style={{ color: isCompleted ? '#131a12' : isCurrent ? Colors.dark.text : textMuted }}>
                          {lesson.title}
                        </ThemedText>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color={isCompleted ? '#131a12' : textMuted}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.coursesSection}>
            {TOPICS.map((topic) => {
              const done = completedCount(topic.id);
              const total = totalLessons(topic.id);
              const pct = total > 0 ? done / total : 0;
              return (
                <Pressable
                  key={topic.id}
                  onPress={() => setSelectedTopic(topic.id)}
                  style={({ pressed }) => [
                    styles.courseCard,
                    { backgroundColor: surface, borderColor: border, borderLeftColor: topic.color },
                    pressed && { opacity: 0.85 },
                  ]}>
                  <View style={styles.courseCardTop}>
                    <View style={[styles.courseIcon, { backgroundColor: `${topic.color}22` }]}>
                      <MaterialCommunityIcons name={iconForTopic(topic.icon)} size={24} color={topic.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <ThemedText type="subtitle" style={{ fontSize: 17, lineHeight: 22 }}>{topic.name}</ThemedText>
                      <ThemedText type="caption" style={{ color: textMuted }}>{done}/{total} lessons</ThemedText>
                    </View>
                    {circleProgress(pct, 44, 3, topic.color)}
                  </View>
                  <View style={[styles.courseBar, { backgroundColor: border }]}>
                    <View style={[styles.courseBarFill, { width: `${pct * 100}%`, backgroundColor: topic.color }]} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <ThemedText type="kicker" style={{ color: textMuted }}>Recent Notes</ThemedText>
            <Pressable onPress={() => setShowNoteModal(true)} style={[styles.addNoteBtn, { backgroundColor: tint }]}>
              <MaterialCommunityIcons name="plus" size={18} color="#131a12" />
            </Pressable>
          </View>
          {notes.length === 0 ? (
            <ThemedText type="caption" style={{ color: textMuted, textAlign: 'center', marginTop: Spacing.lg }}>
              No notes yet. Tap + to add one.
            </ThemedText>
          ) : (
            notes.slice(0, 3).map((note) => (
              <SurfaceCard key={note.__backendId ?? note.note_id} compact style={styles.noteCard}>
                <View style={styles.noteCardTop}>
                  <ThemedText type="caption" style={{ color: textMuted, flex: 1 }}>
                    {new Date(note.note_created).toLocaleDateString()}
                  </ThemedText>
                  <Pressable onPress={() => note.__backendId && onDeleteNote(note.__backendId)}>
                    <MaterialCommunityIcons name="delete-outline" size={18} color={textMuted} />
                  </Pressable>
                </View>
                <ThemedText type="default" numberOfLines={2}>{note.note_text}</ThemedText>
              </SurfaceCard>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={showNoteModal} animationType="slide" transparent onRequestClose={() => setShowNoteModal(false)}>
        <View style={styles.modalOverlay}>
          <SurfaceCard style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Add Note</ThemedText>
            <TextInput
              placeholder="Write your note..."
              placeholderTextColor={textMuted}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              style={[styles.noteInput, { color: Colors.dark.text, backgroundColor: Colors.dark.surface, borderColor: border }]}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => { setShowNoteModal(false); setNoteText(''); }} style={[styles.modalBtn, { borderColor: border }]}>
                <ThemedText type="defaultSemiBold">Cancel</ThemedText>
              </Pressable>
              <Pressable onPress={onAddNote} style={[styles.modalBtn, { backgroundColor: tint }]}>
                <ThemedText type="defaultSemiBold" style={{ color: '#131a12' }}>Save</ThemedText>
              </Pressable>
            </View>
          </SurfaceCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
  headerSection: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, marginBottom: Spacing.lg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  gemRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,204,0,0.15)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  streakCard: { flexDirection: 'row', backgroundColor: Colors.dark.surface, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' },
  streakItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  streakDivider: { width: 1, height: 40, marginHorizontal: Spacing.md },
  coursesSection: { paddingHorizontal: Spacing.xl, gap: Spacing.md, marginBottom: Spacing.xl },
  courseCard: { borderRadius: Radius.lg, borderWidth: 1, borderLeftWidth: 4, padding: Spacing.lg, gap: Spacing.md },
  courseCardTop: { flexDirection: 'row', alignItems: 'center' },
  courseIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  courseBar: { height: 4, borderRadius: Radius.full, overflow: 'hidden' },
  courseBarFill: { height: '100%', borderRadius: Radius.full },
  detailSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  unitHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  unitIcon: { width: 56, height: 56, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  unitLine: { paddingLeft: Spacing.sm },
  node: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1.5, marginBottom: 0 },
  nodeConnector: { width: 2, height: 24, marginLeft: 19 },
  lessonDetail: { gap: Spacing.md },
  lessonContent: { lineHeight: 24 },
  lessonActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  notesSection: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  notesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addNoteBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  noteCard: { gap: Spacing.xs },
  noteCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quizHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
  quizProgress: { flex: 1, height: 6, backgroundColor: Colors.dark.surface, borderRadius: Radius.full, overflow: 'hidden' },
  quizProgressFill: { height: '100%', borderRadius: Radius.full },
  heartsRow: { flexDirection: 'row', gap: 2 },
  quizBody: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  quizQuestion: { textAlign: 'center', lineHeight: 32, paddingHorizontal: Spacing.md },
  quizOptions: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl, gap: Spacing.md },
  quizOption: { padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1.5, alignItems: 'center' },
  quizOptionText: { fontSize: 15 },
  summaryBtn: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: Radius.full, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  modalTitle: { textAlign: 'center' },
  noteInput: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, fontSize: 16, fontFamily: Mono.regular, minHeight: 120, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  modalBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.full, borderWidth: 1, borderColor: 'transparent' },
});
