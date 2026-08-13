import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, CheckCircle2, CircleDashed, Cpu, Gauge, Play, RotateCw, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

const skills = [
  { name: "Agent management", detail: "Lifecycle and policy checks", status: "Healthy", runs: "38 runs" },
  { name: "Token distribution", detail: "Seeker grant allocation", status: "Healthy", runs: "14 runs" },
  { name: "Transaction monitoring", detail: "Confirmation and risk events", status: "Watching", runs: "76 runs" },
  { name: "Task completion", detail: "Suggested work discovery", status: "Healthy", runs: "29 runs" },
];

export default function SkillsMonitoring() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm"><div className="container flex items-center justify-between py-6"><div><p className="text-xs uppercase tracking-[0.3em] text-primary">SEEKER LEGACY PROTOCOL</p><h1 className="mt-2 text-3xl font-semibold">ClawAI skill control</h1><p className="mt-2 text-sm text-muted-foreground">Monitor the skills that power the autonomous agent loop.</p></div><Button className="gap-2"><Play className="h-4 w-4" /> Run health check</Button></div></header>
      <main className="container space-y-6 py-8"><div className="grid gap-4 md:grid-cols-4"><Card className="card-elevated p-5"><Cpu className="h-5 w-5 text-violet-300" /><p className="mt-4 text-sm text-muted-foreground">Skills online</p><p className="mt-1 text-3xl font-semibold">05/05</p></Card><Card className="card-elevated p-5"><Gauge className="h-5 w-5 text-cyan-300" /><p className="mt-4 text-sm text-muted-foreground">Queue latency</p><p className="mt-1 text-3xl font-semibold">1.8s</p></Card><Card className="card-elevated p-5"><ShieldCheck className="h-5 w-5 text-emerald-300" /><p className="mt-4 text-sm text-muted-foreground">Policy checks</p><p className="mt-1 text-3xl font-semibold">100%</p></Card><Card className="card-elevated p-5"><Activity className="h-5 w-5 text-amber-300" /><p className="mt-4 text-sm text-muted-foreground">Executions today</p><p className="mt-1 text-3xl font-semibold">157</p></Card></div><Card className="card-elevated overflow-hidden"><div className="flex items-center justify-between border-b border-border/30 p-6"><div><h2 className="text-xl font-semibold">Skill registry</h2><p className="mt-1 text-sm text-muted-foreground">Live status and execution activity for every automation skill.</p></div><Button variant="outline" size="sm" className="gap-2"><RotateCw className="h-4 w-4" /> Refresh</Button></div><div className="divide-y divide-border/20">{skills.map((skill) => <div key={skill.name} className="flex flex-wrap items-center justify-between gap-4 p-6"><div className="flex items-center gap-4"><div className="rounded-xl border border-border/30 bg-white/[0.03] p-3">{skill.status === "Watching" ? <CircleDashed className="h-5 w-5 text-cyan-300" /> : <CheckCircle2 className="h-5 w-5 text-emerald-300" />}</div><div><h3 className="font-medium">{skill.name}</h3><p className="mt-1 text-sm text-muted-foreground">{skill.detail}</p></div></div><div className="flex items-center gap-4 text-sm"><span className="text-white/55">{skill.runs}</span><span className="text-emerald-300">{skill.status}</span></div></div>)}</div></Card></main>
    </div>
  );
}
