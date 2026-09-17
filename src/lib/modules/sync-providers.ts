export type SyncProviderId = "trading212";

const PROVIDER_ALIASES: Record<SyncProviderId, string[]> = {
  trading212: ["trading212", "trading 212", "t212"],
};

/** Case/whitespace-insensitive match of a free-text provider field against a known integration. */
export function matchSyncProvider(providerText: string): SyncProviderId | null {
  const normalized = providerText.trim().toLowerCase().replace(/\s+/g, "");
  for (const id of Object.keys(PROVIDER_ALIASES) as SyncProviderId[]) {
    if (PROVIDER_ALIASES[id].some((alias) => alias.replace(/\s+/g, "") === normalized)) return id;
  }
  return null;
}
