import type { UserProfileResponseDTO } from "./api";

const RETURN_KEY = "nerdiez:sign-in-return";
const DRAFT_PREFIX = "nerdiez:editor:";
const USER_KEY = "auth_user";

export function loadStoredProfile(): UserProfileResponseDTO | null {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as UserProfileResponseDTO) : null;
  } catch { return null; }
}
export function storeProfile(profile: UserProfileResponseDTO | null): void {
  try {
    if (profile) localStorage.setItem(USER_KEY, JSON.stringify(profile));
    else localStorage.removeItem(USER_KEY);
  } catch {}
}

export function safeReturnPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return null;
  const url = new URL(value, "https://nerdiez.local");
  return url.origin === "https://nerdiez.local" ? `${url.pathname}${url.search}${url.hash}` : null;
}
export function rememberSignInReturn(path: string): void {
  const safe = safeReturnPath(path);
  if (safe) { try { sessionStorage.setItem(RETURN_KEY, safe); } catch {} }
}
export function consumeSignInReturn(): string | null {
  try {
    const path = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    return safeReturnPath(path);
  } catch { return null; }
}
export function editorStorageKey(username: string, resource: string, publicUri?: string): string {
  return `${DRAFT_PREFIX}${encodeURIComponent(username)}:${resource}:${encodeURIComponent(publicUri ?? "new")}`;
}
export function clearPersonalStorage(): void {
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(DRAFT_PREFIX) || key === RETURN_KEY) sessionStorage.removeItem(key);
    }
  } catch {}
}
