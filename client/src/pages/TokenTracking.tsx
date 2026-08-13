import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Download, Layers3, Send, ShieldCheck, Wallet } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function TokenTracking() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm"><div className="container flex items-center justify-between py-6"><div><p className="text-xs uppercase tracking-[0.3em] text-primary">SEEKER LEGACY PROTOCOL</p><h1 className="mt-2 text-3xl font-semibold">Seeker token grants</h1><p className="mt-2 text-sm text-muted-foreground">Track allocation, vesting, and distribution readiness across Solana wallets.</p></div><Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export ledger</Button></div></header>
      <main className="container space-y-6 py-8">
        <div className="grid gap-4 md:grid-cols-4"><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Grant pool</p><p className="mt-2 text-2xl font-semibold">10.0M</p><p className="mt-2 text-xs text-white/55">SEEKER tokens</p></Card><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Allocated</p><p className="mt-2 text-2xl font-semibold">6.8M</p><p className="mt-2 text-xs text-cyan-300">68.0% of pool</p></Card><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Distributed</p><p className="mt-2 text-2xl font-semibold">4.2M</p><p className="mt-2 text-xs text-emerald-300">Verified on Solana</p></Card><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Pending review</p><p className="mt-2 text-2xl font-semibold">12</p><p className="mt-2 text-xs text-amber-300">Wallets require checks</p></Card></div>
        <Card className="card-elevated p-6"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Allocation controls</h2><p className="mt-1 text-sm text-muted-foreground">Distribution operations remain gated by wallet ownership and policy checks.</p></div><Button className="gap-2" onClick={() => setLocation("/wallet")}><Wallet className="h-4 w-4" /> Open wallet control</Button></div><div className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-border/30 bg-white/[0.02] p-5"><Coins className="h-5 w-5 text-amber-300" /><h3 className="mt-4 font-medium">Allocation ledger</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Monitor grant commitments by wallet, cohort, and vesting schedule.</p></div><div className="rounded-xl border border-border/30 bg-white/[0.02] p-5"><Layers3 className="h-5 w-5 text-cyan-300" /><h3 className="mt-4 font-medium">Distribution queue</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Review queued transfers before an agent submits any token transaction.</p></div><div className="rounded-xl border border-border/30 bg-white/[0.02] p-5"><ShieldCheck className="h-5 w-5 text-emerald-300" /><h3 className="mt-4 font-medium">Policy verification</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Confirm network, token mint, and wallet eligibility before release.</p></div></div></Card>
        <Card className="card-elevated p-6"><div className="flex items-center gap-3"><Send className="h-5 w-5 text-primary" /><div><h2 className="text-lg font-semibold">Next distribution window</h2><p className="text-sm text-muted-foreground">No distribution is currently queued for submission.</p></div></div></Card>
      </main>
    </div>
  );
}
