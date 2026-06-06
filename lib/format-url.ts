/** Ensures that a URL is fully qualified with a protocol (http/https). */
export function ensureExternalUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
