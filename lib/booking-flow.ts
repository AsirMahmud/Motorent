const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getTodayDate() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().split('T')[0];
}

export function getValidDateRange(start: string | null, end: string | null) {
  const today = getTodayDate();
  if (!start || !end || !DATE_PATTERN.test(start) || !DATE_PATTERN.test(end)) {
    return { start: '', end: '' };
  }
  if (start < today || end <= start) {
    return { start: '', end: '' };
  }
  return { start, end };
}

export function withBookingDates(path: string, start: string, end: string) {
  const url = new URL(path, 'https://motorent.local');
  const valid = getValidDateRange(start, end);
  if (valid.start && valid.end) {
    url.searchParams.set('start', valid.start);
    url.searchParams.set('end', valid.end);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function getSafeReturnPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  try {
    const url = new URL(value, 'https://motorent.local');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
