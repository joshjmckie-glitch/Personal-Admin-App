"use client";

import { useTransition } from "react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/modules/delete-button";
import { NewIdeaDialog } from "@/components/modules/gifts/new-idea-dialog";
import { deleteGiftIdea, deletePerson, setGiftStatus } from "@/lib/actions/gifts";
import { formatCurrency } from "@/lib/utils";
import type { GiftIdeaRow, GiftPersonRow, GiftStatus } from "@/lib/types/database";

const STATUS_VARIANT: Record<GiftStatus, "outline" | "secondary" | "success"> = {
  idea: "outline",
  purchased: "secondary",
  given: "success",
};

const NEXT_STATUS: Record<GiftStatus, GiftStatus> = {
  idea: "purchased",
  purchased: "given",
  given: "idea",
};

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
        <DeleteButton onDelete={() => deletePerson(person.id)} label="Delete person" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {ideas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No ideas yet.</p>
        ) : (
          ideas.map((idea) => <IdeaRow key={idea.id} idea={idea} />)
        )}
        <NewIdeaDialog personId={person.id} />
      </CardContent>
    </Card>
  );
}

function IdeaRow({ idea }: { idea: GiftIdeaRow }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/50 py-2 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm">{idea.idea}</p>
        {idea.expected_price != null ? (
          <p className="text-xs text-muted-foreground">{formatCurrency(idea.expected_price)}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => setGiftStatus(idea.id, NEXT_STATUS[idea.status]))}
        >
          <Badge variant={STATUS_VARIANT[idea.status]} className="cursor-pointer capitalize">
            {idea.status}
          </Badge>
        </button>
        <DeleteButton onDelete={() => deleteGiftIdea(idea.id)} label="Delete idea" />
      </div>
    </div>
  );
}
