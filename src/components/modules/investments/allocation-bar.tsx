import { formatCurrency } from "@/lib/utils";

const SERIES_VARS = [
  "var(--color-series-1)",
  "var(--color-series-2)",
  "var(--color-series-3)",
  "var(--color-series-4)",
  "var(--color-series-5)",
  "var(--color-series-6)",
];

export function AllocationBar({
  breakdown,
}: {
  breakdown: { label: string; value: number }[];
}) {
  const total = breakdown.reduce((sum, b) => sum + b.value, 0);
  if (total <= 0) return null;

  // Cap at 6 categorical slots — fold anything past that into "Other".
  const sorted = [...breakdown].sort((a, b) => b.value - a.value);
  const shown = sorted.slice(0, 6);
  const overflow = sorted.slice(6);
  const overflowTotal = overflow.reduce((sum, b) => sum + b.value, 0);
  const segments = overflowTotal > 0 ? [...shown, { label: "Other", value: overflowTotal }] : shown;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
        {segments.map((segment, i) => {
          const pct = (segment.value / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={segment.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${pct}%`,
                backgroundColor: SERIES_VARS[i % SERIES_VARS.length],
                marginRight: i < segments.length - 1 ? 2 : 0,
              }}
              title={`${segment.label}: ${formatCurrency(segment.value)} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        {segments.map((segment, i) => {
          const pct = (segment.value / total) * 100;
          return (
            <div key={segment.label} className="flex items-center gap-1.5 text-xs">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: SERIES_VARS[i % SERIES_VARS.length] }}
              />
              <span className="truncate text-foreground">{segment.label}</span>
              <span className="ml-auto shrink-0 text-muted-foreground">{pct.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
