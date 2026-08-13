import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

const tierAccent: Record<string, string> = {
  free: "border-white/10",
  starter: "border-violet-400/50 shadow-violet-500/10",
  professional: "border-cyan-400/60 shadow-cyan-500/10",
  enterprise: "border-amber-300/60 shadow-amber-500/10",
};

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [checkingOutPlan, setCheckingOutPlan] = useState<number | null>(null);
  const plansQuery = trpc.subscriptions.getPlans.useQuery(undefined, {
    staleTime: 60_000,
  });
  const currentQuery = trpc.subscriptions.getSubscriptionDetails.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createCheckout = trpc.subscriptions.createCheckoutSession.useMutation();

  const orderedPlans = useMemo(
    () => [...(plansQuery.data ?? [])].sort((a, b) => a.monthlyPrice.localeCompare(b.monthlyPrice)),
    [plansQuery.data]
  );

  const startCheckout = async (planId: number, tier: string) => {
    if (tier === "free") {
      setLocation(isAuthenticated ? "/dashboard" : "/");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Sign in before choosing an agent plan.");
      setLocation("/");
      return;
    }

    setCheckingOutPlan(planId);
    try {
      const result = await createCheckout.mutateAsync({ planId, billingCycle });
      if (result.url) {
        toast.success("Opening secure Stripe checkout.");
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Checkout is not available yet. Please try again shortly.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start checkout.");
    } finally {
      setCheckingOutPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#06070b] text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-5">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/20 text-violet-300">
              <Zap className="h-5 w-5" />
            </span>
            SEEKER LEGACY PROTOCOL
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
            <Link href="/wallet"><Button variant="outline">Wallet</Button></Link>
          </div>
        </div>
      </header>

      <section className="container py-16 text-center">
        <Badge variant="outline" className="mb-5 border-violet-400/40 bg-violet-500/10 px-4 py-1 text-violet-200">
          Agent access plans
        </Badge>
        <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
          Subscribe once. Let your agents run with discipline.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60 md:text-lg">
          Every automated trade, transfer, and ClawAI workflow is metered against a clear daily allowance. Choose the operating tier that fits your strategy and scale without hidden execution fees.
        </p>

        <div className="mx-auto mt-8 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-5 py-2 text-sm transition ${billingCycle === "monthly" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`rounded-full px-5 py-2 text-sm transition ${billingCycle === "yearly" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
          >
            Yearly <span className="ml-1 text-emerald-400">save 2 months</span>
          </button>
        </div>
      </section>

      <section className="container grid gap-5 pb-16 md:grid-cols-2 xl:grid-cols-4">
        {plansQuery.isLoading && (
          <div className="col-span-full flex items-center justify-center gap-3 py-20 text-white/60">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading protocol tiers...
          </div>
        )}
        {plansQuery.isError && (
          <Card className="col-span-full border-red-400/30 bg-red-500/10 p-8 text-center text-red-100">
            We could not load the current tiers. Refresh the page to try again.
          </Card>
        )}
        {orderedPlans.map((plan) => {
          const isCurrent = currentQuery.data?.plan?.id === plan.id;
          const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
          const popular = plan.tier === "professional";
          return (
            <Card key={plan.id} className={`relative flex flex-col border bg-white/[0.03] p-6 shadow-2xl ${tierAccent[plan.tier] ?? "border-white/10"}`}>
              {popular && <Badge className="absolute -top-3 right-5 bg-cyan-400 text-black">Most adopted</Badge>}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  {plan.tier === "enterprise" ? <Sparkles className="h-5 w-5 text-amber-300" /> : <ShieldCheck className="h-5 w-5 text-white/40" />}
                </div>
                <p className="min-h-12 text-sm leading-6 text-white/55">{plan.description}</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-semibold">${Number(price).toFixed(0)}</span>
                  <span className="pb-1 text-sm text-white/45">/{billingCycle === "yearly" ? "year" : "month"}</span>
                </div>
              </div>
              <Separator className="mb-5 bg-white/10" />
              <div className="mb-7 space-y-3 text-sm text-white/75">
                {(plan.features ?? []).map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <Button
                  className="w-full"
                  variant={popular ? "default" : "outline"}
                  disabled={checkingOutPlan !== null || isCurrent}
                  onClick={() => startCheckout(plan.id, plan.tier)}
                >
                  {checkingOutPlan === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCurrent ? "Current plan" : plan.tier === "free" ? "Continue free" : "Start secure checkout"}
                </Button>
                {plan.tier !== "free" && <p className="mt-3 text-center text-xs text-white/40">Cancel any time. Stripe handles billing securely.</p>}
              </div>
            </Card>
          );
        })}
      </section>

      {isAuthenticated && currentQuery.data?.subscription && (
        <section className="container pb-20">
          <Card className="border-emerald-400/20 bg-emerald-400/[0.04] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">Active subscription</p>
                <h2 className="mt-2 text-2xl font-semibold">{currentQuery.data.plan?.name}</h2>
                <p className="mt-1 text-sm text-white/55">Renews {new Date(currentQuery.data.subscription.currentPeriodEnd).toLocaleDateString()}</p>
              </div>
              <Link href="/billing"><Button variant="outline">Open billing center</Button></Link>
            </div>
          </Card>
        </section>
      )}
    </main>
  );
}

export function SubscriptionPage() {
  return <Pricing />;
}
