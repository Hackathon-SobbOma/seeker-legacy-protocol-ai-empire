import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Bot, CirclePlus, Pause, Play, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

const agentBlueprints = [
  { name: "Solana Sentinel", strategy: "Momentum execution", network: "Solana", state: "Ready", color: "text-emerald-300" },
  { name: "Seeker Allocator", strategy: "Grant distribution", network: "Solana", state: "Guarded", color: "text-amber-300" },
  { name: "Cross-chain Scout", strategy: "Liquidity discovery", network: "Multi-chain", state: "Paused", color: "text-white/55" },
];

export default function AgentManagement() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">SEEKER LEGACY PROTOCOL</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Agent operations</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create, configure, and supervise autonomous trading agents.</p>
          </div>
          <Button className="gap-2" onClick={() => setLocation("/pricing")}><CirclePlus className="h-4 w-4" /> Activate capacity</Button>
        </div>
      </header>
      <main className="container space-y-6 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Active agents</p><p className="mt-2 text-3xl font-semibold">02</p><p className="mt-2 text-xs text-emerald-300">Within current plan allowance</p></Card>
          <Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Execution posture</p><p className="mt-2 text-3xl font-semibold">Guarded</p><p className="mt-2 text-xs text-white/55">Wallet confirmation required for transfers</p></Card>
          <Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Control plane</p><p className="mt-2 text-3xl font-semibold">ClawAI</p><p className="mt-2 text-xs text-white/55">Priority queue connected</p></Card>
        </div>
        <Card className="card-elevated overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/30 p-6"><div><h2 className="text-xl font-semibold">Agent registry</h2><p className="mt-1 text-sm text-muted-foreground">Your protocol operators and their current execution posture.</p></div><Button variant="outline" size="sm" className="gap-2"><SlidersHorizontal className="h-4 w-4" /> Configure policy</Button></div>
          <div className="divide-y divide-border/20">
            {agentBlueprints.map((agent) => <div key={agent.name} className="flex flex-wrap items-center justify-between gap-4 p-6"><div className="flex items-center gap-4"><div className="rounded-xl border border-primary/20 bg-primary/10 p-3"><Bot className="h-5 w-5 text-primary" /></div><div><h3 className="font-medium">{agent.name}</h3><p className="text-sm text-muted-foreground">{agent.strategy} · {agent.network}</p></div></div><div className="flex items-center gap-3"><span className={`flex items-center gap-2 text-sm ${agent.color}`}><Activity className="h-4 w-4" />{agent.state}</span><Button variant="ghost" size="sm" aria-label={`Toggle ${agent.name}`}>{agent.state === "Paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button></div></div>)}
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-2"><Card className="card-elevated p-6"><ShieldCheck className="h-5 w-5 text-emerald-300" /><h2 className="mt-4 text-lg font-semibold">Execution guardrails</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Daily limits, subscription allowances, and wallet signing are checked before an agent can execute an operation.</p></Card><Card className="card-elevated p-6"><Activity className="h-5 w-5 text-cyan-300" /><h2 className="mt-4 text-lg font-semibold">Live control loop</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">ClawAI skills report queue position, status, and completion outcomes back to the protocol dashboard.</p></Card></div>
      </main>
    </div>
  );
}
