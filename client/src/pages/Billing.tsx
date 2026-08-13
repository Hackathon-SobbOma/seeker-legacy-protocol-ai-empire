import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CreditCard, Receipt, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Billing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const detailsQuery = trpc.subscriptions.getSubscriptionDetails.useQuery(undefined, { enabled: isAuthenticated });
  const usageQuery = trpc.subscriptions.getTodayUsage.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 15_000 });
  const invoicesQuery = trpc.subscriptions.getBillingRecords.useQuery(undefined, { enabled: isAuthenticated });
  const cancelMutation = trpc.subscriptions.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Your subscription has been cancelled.");
      void detailsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  if (!isAuthenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#06070b] p-6 text-white">
        <Card className="max-w-md border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-2xl font-semibold">Sign in to view billing</h1>
          <p className="mt-3 text-white/55">Subscription controls and invoices are available to authenticated protocol operators.</p>
          <Button className="mt-6" onClick={() => setLocation("/")}>Return home</Button>
        </Card>
      </main>
    );
  }

  const plan = detailsQuery.data?.plan;
  const subscription = detailsQuery.data?.subscription;
  const executions = Number(usageQuery.data?.usage.agentExecutions ?? 0);
  const executionLimit = usageQuery.data?.limits?.maxExecutions ?? 0;
  const executionPercent = executionLimit ? Math.min(100, (executions / executionLimit) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#06070b] text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-5">
          <Link href="/" className="font-semibold tracking-tight">SEEKER LEGACY PROTOCOL</Link>
          <Link href="/pricing"><Button variant="outline">Change plan</Button></Link>
        </div>
      </header>

      <div className="container space-y-6 py-12">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to plans</Link>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-violet-300/70">Billing center</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Keep your agent operations accountable.</h1>
          <p className="mt-3 max-w-2xl text-white/55">Review the active plan, monitor daily execution consumption, and keep a clear record of subscription invoices.</p>
        </div>

        {detailsQuery.isLoading ? (
          <div className="flex items-center gap-2 py-10 text-white/60"><Loader2 className="h-5 w-5 animate-spin" /> Loading billing profile...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="border-white/10 bg-white/[0.04] p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/45">Current plan</p>
                  <h2 className="mt-2 text-3xl font-semibold">{plan?.name ?? "Explorer"}</h2>
                  <p className="mt-2 text-sm text-white/55">{plan?.description ?? "Read-only access. Activate a plan to run autonomous agents."}</p>
                </div>
                <Badge variant="outline" className="border-emerald-400/40 text-emerald-300">{subscription?.status ?? "free"}</Badge>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-widest text-white/40">Daily executions</p>
                  <p className="mt-2 text-2xl font-semibold">{executions.toLocaleString()} <span className="text-sm font-normal text-white/40">/ {executionLimit.toLocaleString()}</span></p>
                  <Progress value={executionPercent} className="mt-4 h-2 bg-white/10" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-widest text-white/40">Agent capacity</p>
                  <p className="mt-2 text-2xl font-semibold">{usageQuery.data?.limits?.maxAgents ?? 0}</p>
                  <p className="mt-1 text-sm text-white/45">Maximum autonomous agents</p>
                </div>
              </div>
              {subscription && (
                <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
                  <span>Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                  <Button variant="ghost" className="text-red-300 hover:bg-red-400/10 hover:text-red-200" disabled={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
                    {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Cancel renewal
                  </Button>
                </div>
              )}
            </Card>

            <Card className="border-violet-400/20 bg-violet-400/[0.05] p-7">
              <ShieldCheck className="h-6 w-6 text-violet-200" />
              <h2 className="mt-5 text-xl font-semibold">Secure by design</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">Payments are handled by Stripe. SEEKER LEGACY PROTOCOL stores only the identifiers required to manage your subscription and never stores card numbers or security codes.</p>
              <div className="mt-6 flex items-center gap-3 text-sm text-white/70"><CreditCard className="h-4 w-4 text-violet-200" /> Stripe-managed payment method</div>
            </Card>
          </div>
        )}

        <Card className="border-white/10 bg-white/[0.04] p-7">
          <div className="flex items-center gap-3"><Receipt className="h-5 w-5 text-cyan-200" /><h2 className="text-xl font-semibold">Invoice history</h2></div>
          <div className="mt-6 overflow-x-auto">
            {invoicesQuery.isLoading ? <div className="flex items-center gap-2 py-6 text-white/55"><Loader2 className="h-4 w-4 animate-spin" /> Loading invoices...</div> : invoicesQuery.data?.length ? (
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40"><tr><th className="pb-3">Invoice</th><th className="pb-3">Period</th><th className="pb-3">Amount</th><th className="pb-3">Status</th></tr></thead>
                <tbody>{invoicesQuery.data.map((invoice) => <tr key={invoice.id} className="border-b border-white/5 text-white/70"><td className="py-4 font-mono text-xs">{invoice.invoiceNumber}</td><td className="py-4">{new Date(invoice.billingPeriodStart).toLocaleDateString()} – {new Date(invoice.billingPeriodEnd).toLocaleDateString()}</td><td className="py-4">${Number(invoice.amount).toFixed(2)} {invoice.currency}</td><td className="py-4"><Badge variant="outline">{invoice.status}</Badge></td></tr>)}</tbody>
              </table>
            ) : <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">Invoices will appear here after your first paid billing cycle.</div>}
          </div>
        </Card>
      </div>
    </main>
  );
}
