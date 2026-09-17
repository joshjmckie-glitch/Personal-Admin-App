type BankHolidaysResponse = {
  "england-and-wales": { events: { date: string }[] };
};

/** UK (England & Wales) bank holiday dates as "YYYY-MM-DD" strings, fetched live. Falls back to an empty set (weekend-only adjustment) if the request fails. */
export async function fetchUkBankHolidays(): Promise<Set<string>> {
  try {
    const res = await fetch("https://www.gov.uk/bank-holidays.json", {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return new Set();
    const data = (await res.json()) as BankHolidaysResponse;
    return new Set(data["england-and-wales"].events.map((event) => event.date));
  } catch {
    return new Set();
  }
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isWorkingDay(date: Date, holidays: Set<string>) {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  return !holidays.has(toIsoDate(date));
}

function rollBackToWorkingDay(date: Date, holidays: Set<string>) {
  const adjusted = new Date(date);
  while (!isWorkingDay(adjusted, holidays)) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  return adjusted;
}

function rawPayDate(payDay: number, year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(payDay, daysInMonth));
}

/** Next actual pay date for a given day-of-month, rolled back to the preceding working day when it falls on a weekend or UK bank holiday. */
export function nextPayDate(payDay: number, holidays: Set<string>, from: Date = new Date()): Date {
  const startOfToday = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  const thisMonth = rollBackToWorkingDay(rawPayDate(payDay, from.getFullYear(), from.getMonth()), holidays);
  if (thisMonth >= startOfToday) return thisMonth;

  const nextMonth = from.getMonth() === 11 ? 0 : from.getMonth() + 1;
  const nextYear = from.getMonth() === 11 ? from.getFullYear() + 1 : from.getFullYear();
  return rollBackToWorkingDay(rawPayDate(payDay, nextYear, nextMonth), holidays);
}
