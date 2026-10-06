import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { BrainCircuit, CheckCircle2, LockKeyhole, Play, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function EmpireControl() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [goal, setGoal] = useState("Build a secure multi-chain airdrop qualification dashboard");
  const [runId, setRunId] = useState<string | null>(null);
  const planQuery = trpc.empire.plan.useQuery({ goal }, { enabled: isAuthenticated && goal.length >= 8 });
  const runMutation = trpc.empire.run.useMutation({
    onSuccess: (run) => {
      setRunId(run.runId);
      toast.success("Bounded Empire run completed in simulation mode");
    },
    onError: (error) => toast.error(error.message),
  });
  const runQuery = trpc.empire.getRun.useQuery({ runId: runId ?? "pending_run" }, { enabled: Boolean(runId) });
  const run = runQuery.data;

  if (!isAuthenticated) {
    return <div className="min-h-screen grid place-items-center p-6"><Card className="p-8 max-w-md text-center space-y-4"><LockKeyhole className="mx-auto h-10 w-10 text-purple-400" /><h1 className="text-2xl font-bold">Sign in required</h1><p className="text-sm text-muted-foreground">The Empire Control Center is private to your workspace.</p><Button onClick={() => setLocation("/")} className="w-full">Return Home</Button></Card></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-6">
          <div><p className="text-xs uppercase tracking-[0.3em] text-purple-400">SEEKER LEGACY PROTOCOL</p><h1 className="mt-2 text-3xl font-semibold">Empire Control Center</h1><p className="mt-2 text-sm text-muted-foreground">Controlled recursive orchestration for Web3 workflows — simulation first.</p></div>
          <Button onClick={() => setLocation("/dashboard")} variant="outline">Dashboard</Button>
        </div>
      </header>
      <main className="container space-y-8 py-8">
        <Card className="card-elevated p-6 space-y-4">
          <div className="flex items-center gap-3"><BrainCircuit className="h-6 w-6 text-purple-400" /><h2 className="text-xl font-semibold">Build a bounded team</h2></div>
          <p className="text-sm text-muted-foreground">The master agent identifies capabilities and creates a finite team. This activation never runs shell commands, calls unknown services, holds keys, or signs transactions.</p>
          <div className="flex flex-col md:flex-row gap-3"><Input value={goal} onChange={(event) => setGoal(event.target.value)} className="flex-1" maxLength={500} /><Button onClick={() => runMutation.mutate({ goal })} disabled={runMutation.isPending || goal.length < 8} className="gap-2 bg-purple-600 hover:bg-purple-700"><Play className="h-4 w-4" />{runMutation.isPending ? "Running…" : "Run Empire"}</Button></div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {["Depth ≤ 2", "Agents ≤ 8", "Concurrency ≤ 3"].map((label) => <Card key={label} className="p-5"><div className="flex items-center gap-2 text-emerald-400"><ShieldCheck className="h-4 w-4" /><span className="font-semibold">{label}</span></div><p className="mt-2 text-xs text-muted-foreground">Hard limit enforced server-side.</p></Card>)}
        </div>

        {planQuery.data && <Card className="p-6 space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Planned capabilities</h2><span className="text-xs uppercase tracking-wider text-amber-400">Simulation</span></div><div className="flex flex-wrap gap-2">{planQuery.data.roles.map((role) => <span key={role} className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-sm text-purple-200">{role}</span>)}</div></Card>}

        {run && <div className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Observable run graph</h2><span className="text-sm text-emerald-400">{run.agents.length} agents · {run.status}</span></div><div className="grid gap-4 md:grid-cols-2">{run.agents.map((agent) => <Card key={agent.agentId} className="p-5"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Generation {agent.generation}</p><h3 className="mt-1 font-semibold capitalize">{agent.role} agent</h3></div><CheckCircle2 className="h-5 w-5 text-emerald-400" /></div><p className="mt-3 text-sm text-muted-foreground">{agent.objective}</p><p className="mt-3 text-xs text-amber-400">Simulation result · confidence {Math.round((agent.result?.confidence ?? 0) * 100)}%</p></Card>)}</div><Card className="p-6"><h3 className="font-semibold">Shared memory</h3><div className="mt-3 space-y-2">{run.memory.map((entry, index) => <p key={`${entry.type}-${index}`} className="text-sm text-muted-foreground"><span className="mr-2 rounded bg-muted px-2 py-0.5 text-xs uppercase">{entry.type}</span>{entry.content}</p>)}</div></Card></div>}
      </main>
    </div>
  );
}
