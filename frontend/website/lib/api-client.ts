// Shared browser API client: admin src/services/api.ts and website lib/api-client.ts must stay identical.
const API_BASE = "/api";
const ADMIN_API_BASE = "/admin/api";
const CACHE_TTL = 30000;
const MAX_CACHE_ENTRIES = 50;
const SERVER_ERROR_COOLDOWN = 5000;

export class ApiError extends Error {
  status: number;
  path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

export interface RequestOptions extends RequestInit {
  // Retry anonymously when the session is rejected, so public content stays readable.
  publicRead?: boolean;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();
const inFlight = new Map<string, Promise<unknown>>();
let cacheGeneration = 0;
const failedGets = new Map<string, { error: ApiError; timestamp: number }>();

function apiPath(endpoint: string, admin: boolean): string {
  return admin ? `${ADMIN_API_BASE}${endpoint}` : `${API_BASE}${endpoint}`;
}

function evictOldest(map: Map<string, unknown>) {
  while (map.size > MAX_CACHE_ENTRIES) {
    const oldest = map.keys().next().value;
    if (oldest === undefined) break;
    map.delete(oldest);
  }
}

function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    // touch: mark as most recently used (LRU)
    cache.delete(key);
    cache.set(key, entry);
    return Promise.resolve(entry.data as T);
  }

  const failed = failedGets.get(key);
  if (failed) {
    if (Date.now() - failed.timestamp < SERVER_ERROR_COOLDOWN) {
      return Promise.reject(failed.error);
    }
    failedGets.delete(key);
  }

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const generation = cacheGeneration;
  const promise = fetcher()
    .then((data) => {
      if (generation !== cacheGeneration) return data;
      cache.delete(key);
      cache.set(key, { data, timestamp: Date.now() });
      evictOldest(cache);
      failedGets.delete(key);
      inFlight.delete(key);
      return data;
    })
    .catch((err) => {
      if (generation !== cacheGeneration) throw err;
      if (err instanceof ApiError && err.status >= 500) {
        failedGets.delete(key);
        failedGets.set(key, { error: err, timestamp: Date.now() });
        evictOldest(failedGets);
      }
      inFlight.delete(key);
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}

export function invalidateCache(endpoint?: string) {
  cacheGeneration += 1;
  inFlight.clear();
  if (!endpoint) {
    cache.clear();
    failedGets.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(endpoint)) cache.delete(key);
  }
  for (const key of failedGets.keys()) {
    if (key.includes(endpoint)) failedGets.delete(key);
  }
}

let refreshPromise: Promise<boolean> | null = null;

function refreshAuth(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const body = await response.text();
  if (!body.trim()) return undefined as T;

  return JSON.parse(body) as T;
}

async function toApiError(res: Response, path: string): Promise<ApiError> {
  let message = res.status === 401 ? "Session expired" : `API request failed: ${res.statusText}`;
  try {
    const body = await res.json();
    message = body.message || body.error || message;
  } catch {
    // ignore parse error
  }
  return new ApiError(message, res.status, path);
}

async function request<T>(
  endpoint: string,
  admin: boolean,
  { publicRead = false, ...options }: RequestOptions = {},
): Promise<T> {
  const path = apiPath(endpoint, admin);
  const isJson = typeof options.body === "string";
  const init: RequestInit = {
    ...options,
    headers: {
      Accept: "application/json",
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
  };

  let res = await fetch(path, { ...init, credentials: "include" });
  if (res.status === 401) {
    if (await refreshAuth()) {
      res = await fetch(path, { ...init, credentials: "include" });
    }
    if (res.status === 401 && publicRead) {
      res = await fetch(path, { ...init, credentials: "omit" });
    }
  }

  if (!res.ok) throw await toApiError(res, path);
  return parseResponse<T>(res);
}

function collectionPath(endpoint: string): string | undefined {
  const parts = endpoint.split("/").filter(Boolean);
  // Clear related content caches as a group; references and usage counts cross resources.
  // Auth changes who the cached responses belong to, so they clear everything too.
  if (["tags", "topics", "talks", "articles", "categories", "auth", "profile"].includes(parts[0])) return undefined;
  return parts.length >= 1 ? `/${parts[0]}` : endpoint;
}

function mutate<T>(endpoint: string, admin: boolean, options: RequestOptions): Promise<T> {
  invalidateCache(collectionPath(endpoint));
  return request<T>(endpoint, admin, options).finally(() => invalidateCache(collectionPath(endpoint)));
}

export const api = {
  get: <T>(endpoint: string, admin: boolean, options?: RequestOptions) =>
    getCached<T>(apiPath(endpoint, admin), () =>
      request<T>(endpoint, admin, { ...options, method: "GET" }),
    ),
  post: <T>(endpoint: string, data: unknown, admin: boolean, options?: RequestOptions) =>
    mutate<T>(endpoint, admin, { ...options, method: "POST", body: JSON.stringify(data) }),
  postFormData: <T>(endpoint: string, formData: FormData, admin: boolean, options?: RequestOptions) =>
    mutate<T>(endpoint, admin, { ...options, method: "POST", body: formData }),
  put: <T>(endpoint: string, data: unknown, admin: boolean, options?: RequestOptions) =>
    mutate<T>(endpoint, admin, { ...options, method: "PUT", body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown, admin: boolean, options?: RequestOptions) =>
    mutate<T>(endpoint, admin, { ...options, method: "PATCH", body: JSON.stringify(data) }),
  patchFormData: <T>(endpoint: string, formData: FormData, admin: boolean, options?: RequestOptions) =>
    mutate<T>(endpoint, admin, { ...options, method: "PATCH", body: formData }),
  delete: <T>(endpoint: string, admin: boolean, options?: RequestOptions) =>
    mutate<T>(endpoint, admin, { ...options, method: "DELETE" }),
};
