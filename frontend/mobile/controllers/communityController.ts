import { getLearnHubApiBaseUrl } from '@/lib/learnHubApiBase';

export type CommunityPostKind = 'article' | 'lesson';

export type CommunityPost = {
  id: string;
  kind: CommunityPostKind;
  title: string;
  excerpt: string;
  content?: string;
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

export type CreatePostPayload = {
  kind: CommunityPostKind;
  title: string;
  excerpt: string;
  content?: string;
  authorName: string;
  authorHandle: string;
  tags: string[];
  readTimeMin: number;
  subreddit?: string;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

function normalizePost(raw: Record<string, unknown>): CommunityPost {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    kind: (raw.kind as CommunityPostKind) ?? 'article',
    title: String(raw.title ?? ''),
    excerpt: String(raw.excerpt ?? ''),
    content: raw.content != null ? String(raw.content) : undefined,
    authorName: String(raw.authorName ?? raw.author_name ?? ''),
    authorHandle: String(raw.authorHandle ?? raw.author_handle ?? ''),
    publishedAt: String(raw.publishedAt ?? raw.published_at ?? new Date().toISOString()),
    readTimeMin: Number(raw.readTimeMin ?? raw.read_time_min ?? 5),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    upvotes: Number(raw.upvotes ?? 0),
    downvotes: Number(raw.downvotes ?? 0),
    commentCount: Number(raw.commentCount ?? raw.comment_count ?? 0),
    subreddit: String(raw.subreddit ?? 'r/learn'),
  };
}

export class CommunityController {
  constructor(private readonly baseUrl: string) {}

  static fromEnv(): CommunityController | null {
    const base = getLearnHubApiBaseUrl();
    return base ? new CommunityController(base.replace(/\/+$/, '') + '/community') : null;
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

  async fetchPosts(): Promise<ApiResult<CommunityPost[]>> {
    const r = await this.request<unknown>('/posts', { method: 'GET' });
    if (!r.ok) return r;
    const raw = r.data;
    if (Array.isArray(raw)) {
      return {
        ok: true,
        data: (raw as Record<string, unknown>[]).map(normalizePost),
      };
    }
    if (raw && typeof raw === 'object' && 'posts' in raw) {
      const posts = (raw as Record<string, unknown>).posts;
      if (Array.isArray(posts)) {
        return {
          ok: true,
          data: (posts as Record<string, unknown>[]).map(normalizePost),
        };
      }
    }
    return { ok: true, data: [] };
  }

  async fetchPost(id: string): Promise<ApiResult<CommunityPost>> {
    const r = await this.request<unknown>(`/posts/${encodeURIComponent(id)}`, { method: 'GET' });
    if (!r.ok) return r;
    return { ok: true, data: normalizePost(r.data as Record<string, unknown>) };
  }

  async createPost(payload: CreatePostPayload): Promise<ApiResult<CommunityPost>> {
    const r = await this.request<unknown>('/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!r.ok) return r;
    return { ok: true, data: normalizePost(r.data as Record<string, unknown>) };
  }

  async votePost(postId: string, direction: 'up' | 'down' | 'none'): Promise<ApiResult<{ upvotes: number; downvotes: number }>> {
    return this.request(`/posts/${encodeURIComponent(postId)}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction }),
    });
  }

  async likePost(postId: string): Promise<ApiResult<{ upvotes: number }>> {
    return this.request(`/posts/${encodeURIComponent(postId)}/like`, {
      method: 'POST',
    });
  }
}
