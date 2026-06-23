import { getLearnHubApiBaseUrl } from '@/lib/learnHubApiBase';

export type LessonCompletionRow = {
  lesson_id: string;
  topic_id: string;
  completed?: boolean;
  completed_at?: string;
};

export type UserNoteRow = {
  note_id: string;
  note_text: string;
  note_created: string;
  topic_id?: string;
  lesson_id?: string;
  /** Server primary key for deletes */
  __backendId?: string;
};

export type QuizAttemptRow = {
  card_id: string;
  correct: boolean;
  lesson_id?: string;
  answered_at?: string;
};

export type LearnHubSyncPayload = {
  completions: LessonCompletionRow[];
  notes: UserNoteRow[];
  quizAttempts: QuizAttemptRow[];
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

function normalizeNote(raw: Record<string, unknown>): UserNoteRow {
  const id =
    (raw.__backendId as string) ||
    (raw.id as string) ||
    (raw.note_id as string) ||
    '';
  return {
    __backendId: id,
    note_id: (raw.note_id as string) || id,
    note_text: String(raw.note_text ?? ''),
    note_created: String(raw.note_created ?? new Date().toISOString()),
    topic_id: raw.topic_id != null ? String(raw.topic_id) : '',
    lesson_id: raw.lesson_id != null ? String(raw.lesson_id) : '',
  };
}

function normalizeCompletion(raw: Record<string, unknown>): LessonCompletionRow {
  return {
    lesson_id: String(raw.lesson_id ?? ''),
    topic_id: String(raw.topic_id ?? ''),
    completed: Boolean(raw.completed ?? true),
    completed_at: raw.completed_at != null ? String(raw.completed_at) : undefined,
  };
}

function normalizeQuizAttempt(raw: Record<string, unknown>): QuizAttemptRow {
  return {
    card_id: String(raw.card_id ?? ''),
    correct: Boolean(raw.correct),
    lesson_id: raw.lesson_id != null ? String(raw.lesson_id) : undefined,
    answered_at: raw.answered_at != null ? String(raw.answered_at) : undefined,
  };
}

/**
 * HTTP client for your Learn Hub backend. Adjust paths in one place if your server differs.
 * Default paths (relative to `learnHubApiUrl` base):
 * - GET  `` (empty) or `/sync` — full state
 * - POST `/completions` — mark lesson complete
 * - DELETE `/completions/:lessonId`
 * - POST `/notes` — create note
 * - DELETE `/notes/:id`
 * - POST `/quiz-attempts` — log an answer
 */
export class LearnHubController {
  constructor(private readonly baseUrl: string) {}

  static fromEnv(): LearnHubController | null {
    const base = getLearnHubApiBaseUrl();
    return base ? new LearnHubController(base) : null;
  }

  private async request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<ApiResult<T>> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(init?.headers as Record<string, string>),
        },
      });
      const text = await res.text();
      let body: unknown = null;
      if (text) {
        try {
          body = JSON.parse(text) as unknown;
        } catch {
          body = text;
        }
      }
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: typeof body === 'object' && body && 'message' in body
            ? String((body as { message: unknown }).message)
            : `HTTP ${res.status}`,
        };
      }
      return { ok: true, data: body as T };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Network error';
      return { ok: false, error: message };
    }
  }

  /**
   * Pull all user-specific rows. Server may return either a wrapped object or a raw array legacy shape.
   */
  async fetchSync(): Promise<ApiResult<LearnHubSyncPayload>> {
    const r = await this.request<unknown>('/sync', { method: 'GET' });
    if (!r.ok) return r;

    const raw = r.data;
    if (
      raw &&
      typeof raw === 'object' &&
      'completions' in raw &&
      'notes' in raw &&
      'quizAttempts' in raw
    ) {
      const o = raw as Record<string, unknown>;
      return {
        ok: true,
        data: {
          completions: Array.isArray(o.completions)
            ? (o.completions as Record<string, unknown>[]).map(normalizeCompletion)
            : [],
          notes: Array.isArray(o.notes) ? (o.notes as Record<string, unknown>[]).map(normalizeNote) : [],
          quizAttempts: Array.isArray(o.quizAttempts)
            ? (o.quizAttempts as Record<string, unknown>[]).map(normalizeQuizAttempt)
            : [],
        },
      };
    }

    return {
      ok: true,
      data: { completions: [], notes: [], quizAttempts: [] },
    };
  }

  async createCompletion(row: LessonCompletionRow): Promise<ApiResult<{ id?: string }>> {
    return this.request('/completions', {
      method: 'POST',
      body: JSON.stringify({
        topic_id: row.topic_id,
        lesson_id: row.lesson_id,
        completed: row.completed ?? true,
        completed_at: row.completed_at ?? new Date().toISOString(),
      }),
    });
  }

  async deleteCompletion(lessonId: string): Promise<ApiResult<unknown>> {
    return this.request(`/completions/${encodeURIComponent(lessonId)}`, {
      method: 'DELETE',
    });
  }

  async createNote(note: Omit<UserNoteRow, '__backendId'>): Promise<ApiResult<UserNoteRow>> {
    const r = await this.request<UserNoteRow | Record<string, unknown>>('/notes', {
      method: 'POST',
      body: JSON.stringify({
        note_id: note.note_id,
        note_text: note.note_text,
        note_created: note.note_created,
        topic_id: note.topic_id ?? '',
        lesson_id: note.lesson_id ?? '',
      }),
    });
    if (!r.ok) return r;
    const normalized = normalizeNote(r.data as Record<string, unknown>);
    return { ok: true, data: normalized };
  }

  async deleteNote(backendId: string): Promise<ApiResult<unknown>> {
    return this.request(`/notes/${encodeURIComponent(backendId)}`, {
      method: 'DELETE',
    });
  }

  async recordQuizAttempt(payload: {
    card_id: string;
    correct: boolean;
    lesson_id?: string;
    answered_at?: string;
  }): Promise<ApiResult<unknown>> {
    return this.request('/quiz-attempts', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        answered_at: payload.answered_at ?? new Date().toISOString(),
      }),
    });
  }
}
