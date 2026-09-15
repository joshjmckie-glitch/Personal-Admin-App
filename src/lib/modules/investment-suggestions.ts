export const DEFAULT_PROVIDER_SUGGESTIONS = [
  "Chase",
  "Moneybox",
  "Trading 212",
  "Coinbase",
  "Plum",
  "Monzo",
  "Vanguard",
  "Nutmeg",
];

export const DEFAULT_ACCOUNT_TYPE_SUGGESTIONS = [
  "Cash savings",
  "ISA",
  "Help to Buy ISA",
  "Stocks & shares",
  "Crypto",
  "Pension",
];

/** Merges saved suggestions with the defaults, de-duplicated case-insensitively, alphabetical. */
export function mergeSuggestions(existing: string[], defaults: string[]): string[] {
  const seen = new Map<string, string>();
  for (const value of [...existing, ...defaults]) {
    const key = value.trim().toLowerCase();
    if (key && !seen.has(key)) seen.set(key, value.trim());
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}
