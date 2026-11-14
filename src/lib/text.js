export function dash(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '-';
  if (value == null) return '-';
  const text = String(value).trim();
  return text || '-';
}
