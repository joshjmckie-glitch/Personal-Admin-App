import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function WidgetCard({
  href,
  label,
  icon: Icon,
  children,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="size-4" />
            </div>
            <CardTitle className="text-sm font-semibold text-foreground">
              {label}
            </CardTitle>
          </div>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </Link>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-6 w-24 animate-pulse rounded bg-secondary" />
      <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
    </div>
  );
}

export function WidgetEmpty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
