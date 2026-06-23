export type CommunityPostKind = 'article' | 'lesson';

export type CommunityPost = {
  id: string;
  kind: CommunityPostKind;
  title: string;
  excerpt: string;
  authorName: string;
  authorHandle: string;
  publishedAt: string;
  readTimeMin: number;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  subreddit: string;
};

/**
 * Sample posts from "other users" — replace with API data when a backend exists.
 */
export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    kind: 'lesson',
    title: 'Intuition for gradient descent (no heavy math)',
    excerpt:
      'I finally understood why we step opposite the gradient by walking through a tiny 2D loss surface. Sharing my sketches and a 5‑minute mental model.',
    authorName: 'Mina K.',
    authorHandle: 'mina_learns',
    publishedAt: '2026-05-10T14:00:00.000Z',
    readTimeMin: 6,
    tags: ['ml', 'teaching'],
    upvotes: 128,
    downvotes: 12,
    commentCount: 34,
    subreddit: 'r/teachable',
  },
  {
    id: 'p2',
    kind: 'article',
    title: 'Notes from shipping my first React Native app',
    excerpt:
      'What I\'d tell my past self about Expo Router, safe areas, and why I stopped fighting the tab bar height on Android.',
    authorName: 'Jordan Lee',
    authorHandle: 'jordan_codes',
    publishedAt: '2026-05-09T09:30:00.000Z',
    readTimeMin: 9,
    tags: ['react-native', 'expo'],
    upvotes: 84,
    downvotes: 3,
    commentCount: 19,
    subreddit: 'r/coding',
  },
  {
    id: 'p3',
    kind: 'lesson',
    title: 'Regex for busy people: patterns I actually use',
    excerpt:
      'Anchors, lazy vs greedy, and three copy‑paste recipes for logs and CSVs. Lesson-style breakdown with exercises at the end.',
    authorName: 'Sam Rivera',
    authorHandle: 'sam_regex',
    publishedAt: '2026-05-08T16:45:00.000Z',
    readTimeMin: 12,
    tags: ['regex', 'tools'],
    upvotes: 256,
    downvotes: 8,
    commentCount: 67,
    subreddit: 'r/devtips',
  },
  {
    id: 'p4',
    kind: 'article',
    title: 'Designing spaced repetition that doesn\'t feel like a chore',
    excerpt:
      'How I mix micro‑quizzes with "why does this matter?" blurbs so friends stick with it. Includes a printable weekly template.',
    authorName: 'Avery Chen',
    authorHandle: 'avery_studies',
    publishedAt: '2026-05-07T11:20:00.000Z',
    readTimeMin: 7,
    tags: ['learning', 'habits'],
    upvotes: 191,
    downvotes: 15,
    commentCount: 42,
    subreddit: 'r/study',
  },
  {
    id: 'p5',
    kind: 'lesson',
    title: 'Git rebase vs merge: a conflict map I wish I had earlier',
    excerpt:
      'One diagram for linear history, one for feature branches, and when to reach for merge‑queue at work.',
    authorName: 'Chris O.',
    authorHandle: 'chris_git',
    publishedAt: '2026-05-06T08:00:00.000Z',
    readTimeMin: 5,
    tags: ['git', 'teams'],
    upvotes: 72,
    downvotes: 5,
    commentCount: 28,
    subreddit: 'r/devtips',
  },
  {
    id: 'p6',
    kind: 'article',
    title: 'Accessibility wins that took under an hour each',
    excerpt:
      'Hit targets, contrast checks, and VoiceOver labels that made our beta testers noticeably happier. Short list with before/after screenshots.',
    authorName: 'Riley Patel',
    authorHandle: 'riley_a11y',
    publishedAt: '2026-05-05T19:10:00.000Z',
    readTimeMin: 8,
    tags: ['a11y', 'mobile'],
    upvotes: 143,
    downvotes: 6,
    commentCount: 51,
    subreddit: 'r/a11y',
  },
];
