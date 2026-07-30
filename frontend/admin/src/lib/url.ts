export function isAllowedImageUrl(url: string): boolean {
  if (!url) return true;
  if (url.startsWith("/")) return true;
  try {
    // const parsed = new URL(url, window.location.origin);
    // return parsed.origin === window.location.origin;
    return true;
  } catch {
    return false;
  }
}
