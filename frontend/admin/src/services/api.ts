const API_BASE = "/api";
const ADMIN_API_BASE = "/admin/api";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
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

export const api = {
  get: <T>(endpoint: string, admin: boolean, options?: RequestInit) =>
    request<T>(endpoint, admin, { method: "GET", ...options }),
  post: <T>(endpoint: string, data: unknown, admin: boolean, options?: RequestInit) =>
    request<T>(endpoint, admin, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    }),
  put: <T>(endpoint: string, data: unknown, admin: boolean, options?: RequestInit) =>
    request<T>(endpoint, admin, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    }),
  patch: <T>(endpoint: string, data: unknown, admin: boolean, options?: RequestInit) =>
    request<T>(endpoint, admin, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    }),
  delete: <T>(endpoint: string, admin: boolean, options?: RequestInit) =>
    request<T>(endpoint, admin, { method: "DELETE", ...options }),
};

export { ApiError };
