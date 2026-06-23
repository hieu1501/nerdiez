import { getLearnHubApiBaseUrl } from '@/lib/learnHubApiBase';

export type ReviewCard = {
  id: string;
  question: string;
  answer: string;
  wrongAnswers: string[];
  lessonId: string;
  hint?: string;
};

export type ReviewSession = {
  sessionId: string;
  lessonId: string;
  cards: ReviewCard[];
  totalCards: number;
};

export type ReviewResult = {
  cardId: string;
  correct: boolean;
  answeredAt: string;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

function normalizeCard(raw: Record<string, unknown>): ReviewCard {
  return {
    id: String(raw.id ?? raw.card_id ?? raw._id ?? ''),
    question: String(raw.question ?? raw.q ?? ''),
    answer: String(raw.answer ?? raw.a ?? ''),
    wrongAnswers: (() => {
      const wa = raw.wrongAnswers ?? raw.w ?? raw.wrong_answers;
      return Array.isArray(wa) ? wa.map(String) : [];
    })(),
    lessonId: String(raw.lessonId ?? raw.lesson_id ?? ''),
    hint: raw.hint != null ? String(raw.hint) : undefined,
  };
}

export class ReviewController {
  constructor(private readonly baseUrl: string) {}

  static fromEnv(): ReviewController | null {
    const base = getLearnHubApiBaseUrl();
    return base ? new ReviewController(base.replace(/\/+$/, '') + '/reviews') : null;
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

  async fetchReviewSession(lessonId: string): Promise<ApiResult<ReviewSession>> {
    const r = await this.request<Record<string, unknown>>(`/session/${encodeURIComponent(lessonId)}`, {
      method: 'GET',
    });
    if (!r.ok) return r;
    const rawCards = r.data.cards ?? r.data;
    return {
      ok: true,
      data: {
        sessionId: String(r.data.sessionId ?? r.data.session_id ?? ''),
        lessonId: String(r.data.lessonId ?? lessonId),
        cards: Array.isArray(rawCards)
          ? (rawCards as Record<string, unknown>[]).map(normalizeCard)
          : [],
        totalCards: Number(r.data.totalCards ?? r.data.total_cards ?? 0),
      },
    };
  }

  async submitResult(result: ReviewResult): Promise<ApiResult<unknown>> {
    return this.request('/results', {
      method: 'POST',
      body: JSON.stringify({
        card_id: result.cardId,
        correct: result.correct,
        answered_at: result.answeredAt,
      }),
    });
  }

  async submitBatchResults(lessonId: string, results: ReviewResult[]): Promise<ApiResult<unknown>> {
    return this.request(`/session/${encodeURIComponent(lessonId)}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        lesson_id: lessonId,
        results: results.map((r) => ({
          card_id: r.cardId,
          correct: r.correct,
          answered_at: r.answeredAt,
        })),
      }),
    });
  }
}
