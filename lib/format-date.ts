/** Fixed-locale formatters — avoids SSR/client hydration mismatches from default locale. */

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
};

const DATETIME_OPTS: Intl.DateTimeFormatOptions = {
  ...DATE_OPTS,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'UTC',
};

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-US', DATE_OPTS).format(new Date(iso));
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-US', DATETIME_OPTS).format(new Date(iso));
}
