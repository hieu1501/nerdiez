/**
 * Local “signed-in” user profile — swap for auth/session data later.
 */
export const CURRENT_USER = {
  displayName: 'Alex Morgan',
  handle: 'alex_m',
  bio: 'Building habits around math, code, and teaching. Sharing drafts and lessons here.',
  stats: {
    postsShared: 7,
    lessonsShared: 4,
    savedFromCommunity: 23,
  },
} as const;
