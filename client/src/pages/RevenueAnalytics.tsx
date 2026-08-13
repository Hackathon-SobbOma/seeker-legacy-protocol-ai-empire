import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Download, LineChart, PieChart, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

const performance = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 58 },
  { label: "Wed", value: 51 },
  { label: "Thu", value: 76 },
  { label: "Fri", value: 68 },
  { label: "Sat", value: 84 },
  { label: "Sun", value: 92 },
];

export default function RevenueAnalytics() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm"><div className="container flex items-center justify-between py-6"><div><p className="text-xs uppercase tracking-[0.3em] text-primary">SEEKER LEGACY PROTOCOL</p><h1 className="mt-2 text-3xl font-semibold">Revenue intelligence</h1><p className="mt-2 text-sm text-muted-foreground">Measure agent contribution, execution economics, and protocol-level performance.</p></div><Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export report</Button></div></header>
      <main className="container space-y-6 py-8"><div className="grid gap-4 md:grid-cols-4"><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Gross revenue</p><p className="mt-2 text-3xl font-semibold">$48.2K</p><p className="mt-2 text-xs text-emerald-300">+18.4% this period</p></Card><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Net performance</p><p className="mt-2 text-3xl font-semibold">+$12.8K</p><p className="mt-2 text-xs text-emerald-300">After execution costs</p></Card><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Agent ROI</p><p className="mt-2 text-3xl font-semibold">24.6%</p><p className="mt-2 text-xs text-cyan-300">Weighted across active agents</p></Card><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Execution cost</p><p className="mt-2 text-3xl font-semibold">$3.1K</p><p className="mt-2 text-xs text-white/55">Network and routing fees</p></Card></div><Card className="card-elevated p-6"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Seven-day performance pulse</h2><p className="mt-1 text-sm text-muted-foreground">Relative net contribution by day.</p></div><LineChart className="h-5 w-5 text-cyan-300" /></div><div className="mt-8 flex h-56 items-end gap-3">{performance.map((item) => <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-3"><div className="w-full rounded-t-lg bg-gradient-to-t from-violet-500 to-cyan-300" style={{ height: `${item.value}%` }} title={`${item.value} performance units`} /><span className="text-xs text-muted-foreground">{item.label}</span></div>)}</div></Card><div className="grid gap-4 md:grid-cols-3"><Card className="card-elevated p-6"><TrendingUp className="h-5 w-5 text-emerald-300" /><h2 className="mt-4 text-lg font-semibold">Strategy attribution</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Compare contribution across momentum, liquidity, and grant distribution workflows.</p></Card><Card className="card-elevated p-6"><BarChart3 className="h-5 w-5 text-violet-300" /><h2 className="mt-4 text-lg font-semibold">Execution volume</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Monitor how plan allowances and agent queues translate into productive activity.</p></Card><Card className="card-elevated p-6"><PieChart className="h-5 w-5 text-amber-300" /><h2 className="mt-4 text-lg font-semibold">Portfolio mix</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Review network and asset concentration before enabling additional agents.</p></Card></div></main>
    </div>
  );
}
