"use client";

import { useTransition } from "react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CollapsibleGroup } from "@/components/modules/collapsible-group";
import { DeleteButton } from "@/components/modules/delete-button";
import { NewIdeaDialog } from "@/components/modules/gifts/new-idea-dialog";
import { NewPersonDialog } from "@/components/modules/gifts/new-person-dialog";
import { MarkBoughtDialog } from "@/components/modules/gifts/mark-bought-dialog";
import { TickButton } from "@/components/modules/gifts/tick-button";
import { deleteGiftIdea, deletePerson, markGiftAsIdea } from "@/lib/actions/gifts";
import { cn, formatCurrency } from "@/lib/utils";
import type { GiftIdeaRow, GiftPersonRow } from "@/lib/types/database";

export function PersonCard({ person, ideas }: { person: GiftPersonRow; ideas: GiftIdeaRow[] }) {
  const priced = ideas.filter((i) => i.expected_price != null);
  const avg =
    priced.length > 0 ? priced.reduce((sum, i) => sum + (i.expected_price ?? 0), 0) / priced.length : null;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-foreground">{person.name}</CardTitle>
          <CardDescription>
            {ideas.length} idea{ideas.length === 1 ? "" : "s"}
            {avg != null ? ` · avg ${formatCurrency(avg)}` : ""}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <NewPersonDialog person={person} />
          <DeleteButton onDelete={() => deletePerson(person.id)} label="Delete person" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {ideas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No ideas yet.</p>
        ) : (
          <CollapsibleGroup
            label="Ideas"
            count={ideas.length}
            totalLabel={avg != null ? `avg ${formatCurrency(avg)}` : undefined}
          >
            {ideas.map((idea) => (
              <IdeaRow key={idea.id} idea={idea} />
            ))}
          </CollapsibleGroup>
        )}
        <NewIdeaDialog personId={person.id} />
      </CardContent>
    </Card>
  );
}

function IdeaRow({ idea }: { idea: GiftIdeaRow }) {
  const [pending, startTransition] = useTransition();
  const purchased = idea.status === "purchased";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-border/50 py-2 last:border-b-0",
        purchased && "opacity-50"
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {purchased ? (
          <TickButton
            checked
            disabled={pending}
            aria-label="Mark as not bought"
            onClick={() => startTransition(() => markGiftAsIdea(idea.id))}
          />
        ) : (
          <MarkBoughtDialog idea={idea} />
        )}
        <div className="min-w-0">
          <p className={cn("truncate text-sm", purchased && "line-through")}>{idea.idea}</p>
          {purchased ? (
            idea.actual_price != null ? (
              <p className="text-xs text-muted-foreground">Bought for {formatCurrency(idea.actual_price)}</p>
            ) : null
          ) : idea.expected_price != null ? (
            <p className="text-xs text-muted-foreground">{formatCurrency(idea.expected_price)}</p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <NewIdeaDialog personId={idea.person_id} idea={idea} />
        <DeleteButton onDelete={() => deleteGiftIdea(idea.id)} label="Delete idea" />
      </div>
    </div>
  );
}
