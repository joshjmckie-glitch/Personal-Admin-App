import { createClient } from "@/lib/supabase/server";
import { NewPersonDialog } from "@/components/modules/gifts/new-person-dialog";
import { PersonCard } from "@/components/modules/gifts/person-card";
import type { GiftIdeaRow } from "@/lib/types/database";

export default async function GiftsPage() {
  const supabase = await createClient();

  const { data: people } = await supabase
    .from("gift_people")
    .select("*")
    .order("name", { ascending: true });

  const personIds = (people ?? []).map((p) => p.id);
  let ideasByPerson = new Map<string, GiftIdeaRow[]>();

  if (personIds.length > 0) {
    const { data: ideas } = await supabase
      .from("gift_ideas")
      .select("*")
      .in("person_id", personIds)
      .order("created_at", { ascending: false });

    ideasByPerson = (ideas ?? []).reduce((map, idea) => {
      const list = map.get(idea.person_id) ?? [];
      list.push(idea);
      map.set(idea.person_id, list);
      return map;
    }, new Map<string, GiftIdeaRow[]>());
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gifts</h2>
          <p className="text-sm text-muted-foreground">Gift ideas by person</p>
        </div>
        <NewPersonDialog />
      </div>

      {!people || people.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No one added yet. Add a person to start tracking gift ideas.
        </p>
      ) : (
        people.map((person) => (
          <PersonCard key={person.id} person={person} ideas={ideasByPerson.get(person.id) ?? []} />
        ))
      )}
    </div>
  );
}
