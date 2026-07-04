export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfMonth(d: Date) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + 1, 0);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function addMonthsClamped(d: Date, months: number, anchorDay = d.getDate()) {
  const base = startOfDay(d);
  const target = new Date(base);
  target.setDate(1);
  target.setMonth(target.getMonth() + months);
  target.setDate(Math.min(anchorDay, daysInMonth(target.getFullYear(), target.getMonth())));
  return startOfDay(target);
}

export function dayBefore(d: Date) {
  const x = startOfDay(d);
  x.setDate(x.getDate() - 1);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function daysInPeriodInclusive(start: Date, end: Date) {
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  return Math.floor((e - s) / (24 * 60 * 60 * 1000)) + 1;
}

export function clampPeriodOverlapInclusive(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  const start = new Date(Math.max(startOfDay(aStart).getTime(), startOfDay(bStart).getTime()));
  const end = new Date(Math.min(startOfDay(aEnd).getTime(), startOfDay(bEnd).getTime()));
  if (start.getTime() > end.getTime()) return null;
  return { start, end };
}

export function sameDayWindow(d: Date) {
  const start = startOfDay(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}
