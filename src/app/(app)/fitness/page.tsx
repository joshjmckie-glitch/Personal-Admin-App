import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { NewSessionDialog } from "@/components/modules/fitness/new-session-dialog";
import { NewGoalDialog } from "@/components/modules/fitness/new-goal-dialog";
import { NewPbDialog } from "@/components/modules/fitness/new-pb-dialog";
import { SessionRow } from "@/components/modules/fitness/session-row";
import { GoalRow } from "@/components/modules/fitness/goal-row";
import { PbRow } from "@/components/modules/fitness/pb-row";

export default async function FitnessPage() {
  const supabase = await createClient();

  const [{ data: sessions }, { data: goals }, { data: pbs }] = await Promise.all([
    supabase
      .from("fitness_sessions")
      .select("*")
      .order("scheduled_date", { ascending: false })
      .limit(50),
    supabase.from("fitness_goals").select("*").order("created_at", { ascending: false }),
    supabase
      .from("fitness_personal_bests")
      .select("*")
      .order("achieved_on", { ascending: false }),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Fitness</h2>
        <p className="text-sm text-muted-foreground">Goals, schedule & personal bests</p>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="pbs">PBs</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="flex flex-col gap-3">
          <div className="flex justify-end">
            <NewSessionDialog />
          </div>
          <Card>
            <CardContent>
              {!sessions || sessions.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No sessions scheduled yet.
                </p>
              ) : (
                sessions.map((session) => <SessionRow key={session.id} session={session} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="flex flex-col gap-3">
          <div className="flex justify-end">
            <NewGoalDialog />
          </div>
          <Card>
            <CardContent>
              {!goals || goals.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No goals yet.</p>
              ) : (
                goals.map((goal) => <GoalRow key={goal.id} goal={goal} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pbs" className="flex flex-col gap-3">
          <div className="flex justify-end">
            <NewPbDialog />
          </div>
          <Card>
            <CardContent>
              {!pbs || pbs.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No personal bests logged yet.
                </p>
              ) : (
                pbs.map((pb) => <PbRow key={pb.id} pb={pb} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
