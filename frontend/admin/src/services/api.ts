const API_BASE = "/api";
const ADMIN_API_BASE = "/admin/api";
const CACHE_TTL = 30000;

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const cache = new Map<string, { data: unknown; timestamp: number }>();
const inFlight = new Map<string, Promise<unknown>>();

function cacheKey(endpoint: string, admin: boolean): string {
  return admin ? `${ADMIN_API_BASE}${endpoint}` : `${API_BASE}${endpoint}`;
}

function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return Promise.resolve(entry.data as T);
  }

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, timestamp: Date.now() });
      inFlight.delete(key);
      return data;
    })
    .catch((err) => {
      inFlight.delete(key);
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}

function invalidateCache(endpoint?: string) {
  if (!endpoint) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(endpoint)) cache.delete(key);
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAuth(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    }
  })();

  const result = await refreshPromise;

  if (result) {
    refreshPromise = null;
  }

  return result;
}

async function request<T>(
  endpoint: string,
  admin: boolean = false,
  options?: RequestInit,
): Promise<T> {
  const url = admin ? `${ADMIN_API_BASE}${endpoint}` : `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...((options?.headers as Record<string, string>) || {}),
    },
    ...options,
  });

  if (res.status === 401) {
    const refreshed = await refreshAuth();

    if (refreshed) {
      const retryRes = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...((options?.headers as Record<string, string>) || {}),
        },
        ...options,
      });

      if (!retryRes.ok) {
        let message = `API request failed: ${retryRes.statusText}`;
        try {
          const body = await retryRes.json();
          message = body.message || body.error || message;
        } catch {
          // ignore parse error
        }
        throw new ApiError(message, retryRes.status);
      }

      if (retryRes.status === 204) return undefined as T;
      return retryRes.json();
    }

    throw new ApiError("Session expired", 401);
  }

  if (!res.ok) {
    let message = `API request failed: ${res.statusText}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

async function requestFormData<T>(
  endpoint: string,
  admin: boolean,
  method: string,
  formData: FormData,
  options?: RequestInit,
): Promise<T> {
  const url = admin ? `${ADMIN_API_BASE}${endpoint}` : `${API_BASE}${endpoint}`;
  const doFetch = (u: string) =>
    fetch(u, {
      method,
      credentials: "include",
      body: formData,
      ...options,
    });

  let res = await doFetch(url);

  if (res.status === 401) {
    const refreshed = await refreshAuth();
    if (refreshed) {
      res = await doFetch(url);
    }
    if (!refreshed || !res.ok) {
      let message = `API request failed: ${res.statusText}`;
      try {
        const body = await res.json();
        message = body.message || body.error || message;
      } catch {
        // ignore
      }
      throw new ApiError(message, res.status);
    }
  }

  if (!res.ok) {
    let message = `API request failed: ${res.statusText}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function collectionPath(endpoint: string): string {
  const parts = endpoint.split("/").filter(Boolean);
  return parts.length >= 1 ? `/${parts[0]}` : endpoint;
}

export const api = {
  get: <T>(endpoint: string, admin: boolean, options?: RequestInit) => {
    const key = cacheKey(endpoint, admin);
    return getCached<T>(key, () =>
      request<T>(endpoint, admin, { method: "GET", ...options }),
    );
  },
  post: <T>(endpoint: string, data: unknown, admin: boolean, options?: RequestInit) => {
    invalidateCache(collectionPath(endpoint));
    return request<T>(endpoint, admin, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  },
  postFormData: <T>(endpoint: string, formData: FormData, admin: boolean, options?: RequestInit) => {
    invalidateCache(collectionPath(endpoint));
    return requestFormData<T>(endpoint, admin, "POST", formData, options);
  },
  put: <T>(endpoint: string, data: unknown, admin: boolean, options?: RequestInit) => {
    invalidateCache(collectionPath(endpoint));
    return request<T>(endpoint, admin, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  },
  patch: <T>(endpoint: string, data: unknown, admin: boolean, options?: RequestInit) => {
    invalidateCache(collectionPath(endpoint));
    return request<T>(endpoint, admin, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    });
  },
  patchFormData: <T>(endpoint: string, formData: FormData, admin: boolean, options?: RequestInit) => {
    invalidateCache(collectionPath(endpoint));
    return requestFormData<T>(endpoint, admin, "PATCH", formData, options);
  },
  delete: <T>(endpoint: string, admin: boolean, options?: RequestInit) => {
    invalidateCache(collectionPath(endpoint));
    return request<T>(endpoint, admin, { method: "DELETE", ...options });
  },
};

export { ApiError };
