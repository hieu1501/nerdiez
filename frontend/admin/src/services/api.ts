const API_BASE = "/api";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  console.log(`[API] ${options?.method || "GET"} ${url}`);
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...((options?.headers as Record<string, string>) || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `API request failed: ${res.statusText}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
      console.error(`[API Error] ${res.status} ${url}:`, body);
    } catch {
      console.error(`[API Error] ${res.status} ${url}: ${res.statusText}`);
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: "GET", ...options }),
  post: <T>(endpoint: string, data: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    }),
  put: <T>(endpoint: string, data: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    }),
  patch: <T>(endpoint: string, data: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: "DELETE", ...options }),
};

export { ApiError };
