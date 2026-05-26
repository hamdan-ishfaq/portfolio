/** Extract a Loom video ID from a share URL, embed URL, or raw ID. */
export function parseLoomVideoId(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;

  const trimmed = input.trim();
  const urlMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];

  if (/^[a-zA-Z0-9]+$/.test(trimmed)) return trimmed;

  return null;
}

export function getLoomEmbedUrl(videoId: string): string {
  return `https://www.loom.com/embed/${videoId}`;
}
