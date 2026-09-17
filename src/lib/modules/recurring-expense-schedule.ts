/** Next charge date for a monthly billing day, rolling into next month once this month's has passed. */
export function nextOccurrence(billingDay: number, from: Date = new Date()): Date {
  const year = from.getFullYear();
  const month = from.getMonth();
  const startOfToday = new Date(year, month, from.getDate());

  const daysInThisMonth = new Date(year, month + 1, 0).getDate();
  const thisMonth = new Date(year, month, Math.min(billingDay, daysInThisMonth));
  if (thisMonth >= startOfToday) return thisMonth;

  const daysInNextMonth = new Date(year, month + 2, 0).getDate();
  return new Date(year, month + 1, Math.min(billingDay, daysInNextMonth));
}
