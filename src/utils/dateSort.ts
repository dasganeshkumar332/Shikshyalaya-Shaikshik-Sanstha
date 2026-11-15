export type DateSortOrder = 'desc' | 'asc';

export const extractIdTimestamp = (id?: string | null): number => {
  if (!id) return 0;
  const match = String(id).match(/(\d{12,14})/);
  if (!match) return 0;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : 0;
};

export const parseDateMs = (value?: string | null): number => {
  if (!value) return 0;
  const trimmed = String(value).trim();
  if (!trimmed) return 0;

  // Handle date-only YYYY-MM-DD consistently in UTC midnight so ordering is stable across timezones
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const ms = Date.parse(`${trimmed}T00:00:00Z`);
    return Number.isNaN(ms) ? 0 : ms;
  }

  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const sortByDate = <T>(
  items: T[],
  getPrimaryDate: (item: T) => string | undefined | null,
  order: DateSortOrder = 'desc',
  options?: {
    getFallbackDate?: (item: T) => string | undefined | null;
    getId?: (item: T) => string | undefined | null;
  }
): T[] => {
  const dir = order === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    const aPrimary = parseDateMs(getPrimaryDate(a));
    const bPrimary = parseDateMs(getPrimaryDate(b));

    const aTime = aPrimary || parseDateMs(options?.getFallbackDate?.(a));
    const bTime = bPrimary || parseDateMs(options?.getFallbackDate?.(b));

    if (aTime !== bTime) {
      return (aTime - bTime) * dir;
    }

    // Tie-breaker using embedded timestamp in ID (useful when uploadDate/publishDate is YYYY-MM-DD)
    const aIdTs = extractIdTimestamp(options?.getId?.(a));
    const bIdTs = extractIdTimestamp(options?.getId?.(b));
    if (aIdTs !== bIdTs) {
      return (aIdTs - bIdTs) * dir;
    }

    return 0;
  });
};
