import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, CheckCircle2, Clock3, ExternalLink, Filter, RefreshCw, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

const transactionRows = [
  { hash: "7xK...pQ2", action: "Agent rebalance", network: "Solana", amount: "0.48 SOL", status: "Confirmed", time: "2 min ago" },
  { hash: "4mN...a91", action: "Seeker grant release", network: "Solana", amount: "12,500 SEEKER", status: "Processing", time: "11 min ago" },
  { hash: "9tR...k18", action: "Liquidity route check", network: "Ethereum", amount: "Read-only", status: "Failed", time: "28 min ago" },
];

export default function TransactionHistory() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm"><div className="container flex items-center justify-between py-6"><div><p className="text-xs uppercase tracking-[0.3em] text-primary">SEEKER LEGACY PROTOCOL</p><h1 className="mt-2 text-3xl font-semibold">Blockchain operations</h1><p className="mt-2 text-sm text-muted-foreground">A real-time ledger for agent actions, wallet transfers, and network confirmations.</p></div><Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh ledger</Button></div></header>
      <main className="container space-y-6 py-8"><div className="grid gap-4 md:grid-cols-3"><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Confirmed today</p><p className="mt-2 text-3xl font-semibold">128</p><p className="mt-2 text-xs text-emerald-300">99.1% success rate</p></Card><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Processing</p><p className="mt-2 text-3xl font-semibold">03</p><p className="mt-2 text-xs text-amber-300">Awaiting network finality</p></Card><Card className="card-elevated p-5"><p className="text-sm text-muted-foreground">Networks observed</p><p className="mt-2 text-3xl font-semibold">04</p><p className="mt-2 text-xs text-cyan-300">Solana · Ethereum · more</p></Card></div><Card className="card-elevated overflow-hidden"><div className="flex items-center justify-between border-b border-border/30 p-6"><div><h2 className="text-xl font-semibold">Transaction ledger</h2><p className="mt-1 text-sm text-muted-foreground">Filterable activity from the autonomous execution queue.</p></div><Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button></div><div className="divide-y divide-border/20">{transactionRows.map((row) => <div key={row.hash} className="grid gap-4 p-6 md:grid-cols-[1.2fr_1fr_1fr_auto_auto] md:items-center"><div><p className="font-medium">{row.action}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{row.hash}</p></div><p className="text-sm text-white/70">{row.network}</p><p className="text-sm text-white/70">{row.amount}</p><div className="flex items-center gap-2 text-sm">{row.status === "Confirmed" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : row.status === "Failed" ? <XCircle className="h-4 w-4 text-rose-300" /> : <Clock3 className="h-4 w-4 text-amber-300" />}<span>{row.status}</span></div><div className="flex items-center gap-3 text-xs text-muted-foreground"><span>{row.time}</span><ArrowUpRight className="h-4 w-4" /></div></div>)}</div><div className="border-t border-border/30 p-6"><Button variant="ghost" className="gap-2"><ExternalLink className="h-4 w-4" /> Open explorer view</Button></div></Card></main>
    </div>
  );
}
