/**
 * Normalizes a mobile phone number to its core digits (stripping +977 / leading 0).
 */
export function normalizeMobileNumber(value?: string | null): string {
  const digits = (value || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('977') && digits.length >= 12) {
    return digits.slice(3);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Compares two phone inputs cleanly by normalized mobile digits (supporting +977, dashes, spaces).
 */
export function mobileMatches(a?: string | null, b?: string | null): boolean {
  const na = normalizeMobileNumber(a);
  const nb = normalizeMobileNumber(b);
  if (na.length < 7 || nb.length < 7) return false;
  if (na === nb) return true;
  if (na.length >= 10 && nb.length >= 10) {
    return na.slice(-10) === nb.slice(-10);
  }
  return false;
}
