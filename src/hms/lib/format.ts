export function formatDateDDMMYYYY(d: string | Date | null | undefined) {
  if (!d) return '';
  const x = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return '';
  const dd = String(x.getDate()).padStart(2, '0');
  const mm = String(x.getMonth() + 1).padStart(2, '0');
  const yyyy = x.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatOrdinalDay(day: number | null | undefined) {
  if (!day) return '';
  const suffix = day % 10 === 1 && day % 100 !== 11 ? 'st' : day % 10 === 2 && day % 100 !== 12 ? 'nd' : day % 10 === 3 && day % 100 !== 13 ? 'rd' : 'th';
  return `${day}${suffix}`;
}

export function daysUntil(d: string | Date | null | undefined) {
  if (!d) return null;
  const target = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDay = new Date(target);
  targetDay.setHours(0, 0, 0, 0);
  return Math.ceil((targetDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}
