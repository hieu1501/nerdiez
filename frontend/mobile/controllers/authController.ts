import { getLearnHubApiBaseUrl } from '@/lib/learnHubApiBase';

export type UserProfile = {
  id: string;
  displayName: string;
  handle: string;
  bio: string;
  email: string;
  stats: {
    postsShared: number;
    lessonsShared: number;
    savedFromCommunity: number;
  };
};

export type AuthResult = {
  token: string;
  user: UserProfile;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

function normalizeUser(raw: Record<string, unknown>): UserProfile {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    displayName: String(raw.displayName ?? raw.display_name ?? raw.name ?? ''),
    handle: String(raw.handle ?? raw.username ?? ''),
    bio: String(raw.bio ?? ''),
    email: String(raw.email ?? ''),
    stats: {
      postsShared: Number((raw.stats as Record<string, unknown>)?.postsShared ?? 0),
      lessonsShared: Number((raw.stats as Record<string, unknown>)?.lessonsShared ?? 0),
      savedFromCommunity: Number((raw.stats as Record<string, unknown>)?.savedFromCommunity ?? 0),
    },
  };
}

export class AuthController {
  constructor(private readonly baseUrl: string) {}

  static fromEnv(): AuthController | null {
    const base = getLearnHubApiBaseUrl();
    return base ? new AuthController(base.replace(/\/+$/, '') + '/auth') : null;
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

  private tokenHeader(): Record<string, string> {
    const token = AuthController.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static getToken(): string | null {
    return null;
  }

  async login(email: string, password: string): Promise<ApiResult<AuthResult>> {
    const r = await this.request<Record<string, unknown>>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) return r;
    return {
      ok: true,
      data: {
        token: String(r.data.token ?? ''),
        user: normalizeUser((r.data.user ?? r.data) as Record<string, unknown>),
      },
    };
  }

  async register(payload: {
    displayName: string;
    handle: string;
    email: string;
    password: string;
  }): Promise<ApiResult<AuthResult>> {
    const r = await this.request<Record<string, unknown>>('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!r.ok) return r;
    return {
      ok: true,
      data: {
        token: String(r.data.token ?? ''),
        user: normalizeUser((r.data.user ?? r.data) as Record<string, unknown>),
      },
    };
  }

  async getProfile(): Promise<ApiResult<UserProfile>> {
    const r = await this.request<unknown>('/me', {
      method: 'GET',
      headers: this.tokenHeader(),
    });
    if (!r.ok) return r;
    return { ok: true, data: normalizeUser(r.data as Record<string, unknown>) };
  }
}
