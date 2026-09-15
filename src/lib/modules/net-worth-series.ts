export interface NetWorthPoint {
  accountId: string;
  value: number;
  recordedAt: string;
}

/**
 * Builds a combined net-worth-over-time series from independent per-account
 * value logs. Accounts aren't snapshotted on the same schedule, so at each
 * date any account without a log that day carries forward its most recent
 * known value (and contributes 0 before its first log).
 */
export function buildNetWorthSeries(
  accountIds: string[],
  history: NetWorthPoint[]
): { date: string; total: number }[] {
  if (history.length === 0) return [];

  const byAccount = new Map<string, NetWorthPoint[]>();
  for (const point of history) {
    const list = byAccount.get(point.accountId) ?? [];
    list.push(point);
    byAccount.set(point.accountId, list);
  }
  for (const list of byAccount.values()) {
    list.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  }

  const dates = [...new Set(history.map((p) => p.recordedAt))].sort();

  return dates.map((date) => {
    let total = 0;
    for (const accountId of accountIds) {
      const points = byAccount.get(accountId) ?? [];
      let latest: number | undefined;
      for (const point of points) {
        if (point.recordedAt <= date) latest = point.value;
        else break;
      }
      if (latest !== undefined) total += latest;
    }
    return { date, total };
  });
}
