export function currentCutoff(now: Date = new Date()): Date {
  const c = new Date(now);
  c.setHours(8, 0, 0, 0);
  if (now < c) c.setDate(c.getDate() - 1);
  return c;
}
