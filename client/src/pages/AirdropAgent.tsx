import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, Zap, Coins, Play, CheckCircle2, XCircle, AlertTriangle, Wallet } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AirdropAgent() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [walletAddressInput, setWalletAddressInput] = useState("");
  const [maxSpendInput, setMaxSpendInput] = useState("0.5");

  const walletQuery = trpc.airdrop.getWallet.useQuery();
  const opportunitiesQuery = trpc.airdrop.listOpportunities.useQuery();
  const tasksQuery = trpc.airdrop.listTasks.useQuery();

  const configureWalletMutation = trpc.airdrop.configureWallet.useMutation({
    onSuccess: () => {
      toast.success("Agent hot wallet configured successfully");
      walletQuery.refetch();
    },
  });

  const ralphLoopMutation = trpc.airdrop.runRalphLoop.useMutation({
    onSuccess: (data) => {
      toast.success(`Ralph loop completed: ${data.tasksCreatedCount} new opportunity task(s) queued for approval.`);
      tasksQuery.refetch();
      opportunitiesQuery.refetch();
    },
  });

  const executeApprovalMutation = trpc.airdrop.executeTaskApproval.useMutation({
    onSuccess: (data) => {
      if (data.status === "completed") {
        toast.success(`Transaction executed successfully! Hash: ${data.txHash}`);
      } else {
        toast.info("Transaction proposal rejected.");
      }
      tasksQuery.refetch();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <Zap className="w-12 h-12 mx-auto text-purple-500" />
          <h2 className="text-2xl font-bold">Sign in required</h2>
          <p className="text-sm text-muted-foreground">Please sign in to access the Airdrop Qualification Agent and hot wallet controls.</p>
          <Button onClick={() => setLocation("/")} className="w-full">Return Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-purple-400">SEEKER LEGACY PROTOCOL</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Airdrop Ralph Loop Agent</h1>
            <p className="mt-2 text-sm text-muted-foreground">Autonomous discovery, eligibility scanning, simulation, and approval-gated claims.</p>
          </div>
          <Button
            onClick={() => ralphLoopMutation.mutate()}
            disabled={ralphLoopMutation.isPending || walletQuery.data?.status !== "active"}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Play className="h-4 w-4" /> Run Ralph Loop
          </Button>
        </div>
      </header>

      <main className="container space-y-8 py-8">
        {/* Wallet & Security Policy */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="card-elevated p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold">Agent Hot Wallet</h2>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${walletQuery.data?.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                {walletQuery.data?.status ?? "unconfigured"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Dedicated hot wallet for claiming verified airdrops. Protected by per-transaction spend limits, allowlisted program checks, and mandatory user approval gates.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <Label htmlFor="walletAddr" className="text-xs">Solana Wallet Address</Label>
                <Input
                  id="walletAddr"
                  placeholder="Enter Solana address..."
                  value={walletAddressInput || walletQuery.data?.walletAddress || ""}
                  onChange={(e) => setWalletAddressInput(e.target.value)}
                  className="mt-1 font-mono text-xs"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="maxSpend" className="text-xs">Max Per-Tx SOL</Label>
                  <Input
                    id="maxSpend"
                    value={maxSpendInput || walletQuery.data?.maxPerTxSol || "0.5"}
                    onChange={(e) => setMaxSpendInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() =>
                      configureWalletMutation.mutate({
                        walletAddress: walletAddressInput || walletQuery.data?.walletAddress || "SeekerAgent1111111111111111111111111111111",
                        maxPerTxSol: maxSpendInput,
                        requireApproval: true,
                        status: "active",
                      })
                    }
                    className="w-full bg-slate-800 hover:bg-slate-700"
                  >
                    Activate Wallet
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="card-elevated p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-semibold">Safety & Compliance Guardrails</h2>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Simulation First:</strong> Every opportunity is simulated on-chain before generating a proposal.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Program Allowlist:</strong> Only verified Solana program IDs and claim endpoints are permitted.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Mandatory Approval:</strong> Automatic signing is gated by user authorization for each transaction.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Airdrop Opportunities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Discovered Opportunities</h2>
            <Button variant="outline" size="sm" onClick={() => opportunitiesQuery.refetch()}>Refresh</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {opportunitiesQuery.data?.map((opp) => (
              <Card key={opp.id} className="card-elevated p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{opp.chain}</span>
                  <span className="text-emerald-400 font-bold">${opp.estimatedValueUsd}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{opp.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{opp.protocol}</p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">{opp.eligibilityStatus}</span>
                  <a href={opp.claimUrl ?? "#"} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                    View Protocol ↗
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Ralph Loop Execution Tasks & Approval Gates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Ralph Loop Task & Approval Queue</h2>
            <Button variant="outline" size="sm" onClick={() => tasksQuery.refetch()}>Refresh Queue</Button>
          </div>

          <Card className="card-elevated overflow-hidden">
            <div className="divide-y divide-border/20">
              {tasksQuery.data?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No tasks in queue. Click "Run Ralph Loop" above to discover and simulate eligible claims.
                </div>
              ) : (
                tasksQuery.data?.map((task) => (
                  <div key={task.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize">{task.actionType} task #{task.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-mono ${task.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : task.status === "pending_approval" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">Opportunity ID: {task.opportunityId} · TxHash: {task.txHash || "Pending"}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {task.status === "pending_approval" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                            onClick={() => executeApprovalMutation.mutate({ taskId: task.id, approved: true })}
                            disabled={executeApprovalMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve & Sign
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1.5"
                            onClick={() => executeApprovalMutation.mutate({ taskId: task.id, approved: false })}
                            disabled={executeApprovalMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                        </>
                      )}
                      {task.status === "completed" && (
                        <span className="text-sm text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Claimed successfully
                        </span>
                      )}
                      {task.status === "failed" && (
                        <span className="text-sm text-red-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> {task.errorReason || "Failed"}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
