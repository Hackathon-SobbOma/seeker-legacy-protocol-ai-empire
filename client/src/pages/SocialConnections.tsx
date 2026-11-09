import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowLeft,
  AtSign,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Link2,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Provider = "x" | "linkedin";

type SocialConnection = {
  id: number;
  provider: Provider;
  providerAccountId: string;
  displayName: string | null;
  tokenExpiresAt: string | null;
  scopes: string | null;
  status: "active" | "revoked";
  createdAt: string;
  updatedAt: string;
};

const providerMeta: Record<Provider, {
  name: string;
  eyebrow: string;
  description: string;
  icon: typeof AtSign;
  iconClass: string;
  accentClass: string;
  scopes: string[];
}> = {
  x: {
    name: "X",
    eyebrow: "Signal channel",
    description: "Connect an X account for approved drafts, publishing, and performance signals.",
    icon: AtSign,
    iconClass: "bg-white/10 text-white",
    accentClass: "border-white/15 hover:border-white/30",
    scopes: ["Profile access", "Read posts", "Approved publishing"],
  },
  linkedin: {
    name: "LinkedIn",
    eyebrow: "Professional channel",
    description: "Connect a LinkedIn member account for approved professional content workflows.",
    icon: BriefcaseBusiness,
    iconClass: "bg-sky-500/15 text-sky-300",
    accentClass: "border-sky-400/20 hover:border-sky-400/40",
    scopes: ["OpenID profile", "Email identity", "Approved sharing"],
  },
};

function formatDate(value: string | null) {
  if (!value) return "No expiry supplied";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Expiry unavailable";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function maskAccountId(value: string) {
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function scopesFor(connection: SocialConnection) {
  return connection.scopes
    ? connection.scopes.split(" ").filter(Boolean)
    : providerMeta[connection.provider].scopes;
}

export default function SocialConnections() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<Provider | null>(null);

  const loadConnections = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/social/connections", { credentials: "include" });
      if (!response.ok) throw new Error(response.status === 401 ? "Your session has expired." : "Could not load connections.");
      const payload = await response.json() as { connections?: SocialConnection[] };
      setConnections(payload.connections ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load connections.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading && !isAuthenticated) setLocation("/");
  }, [isAuthenticated, loading, setLocation]);

  useEffect(() => {
    void loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("social") === "connected") {
      toast.success(`${params.get("provider") === "linkedin" ? "LinkedIn" : "X"} connected securely`);
      window.history.replaceState({}, "", "/social-connections");
      void loadConnections();
    }
  }, [loadConnections]);

  const connectionByProvider = useMemo(() => {
    return new Map(connections.map((connection) => [connection.provider, connection]));
  }, [connections]);

  const connect = (provider: Provider) => {
    window.location.href = `/api/social/${provider}/connect`;
  };

  const disconnect = async (provider: Provider) => {
    setDisconnecting(provider);
    try {
      const response = await fetch(`/api/social/${provider}/disconnect`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
      });
      if (!response.ok) throw new Error("Disconnect failed. Please try again.");
      toast.success(`${providerMeta[provider].name} disconnected`);
      await loadConnections();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Disconnect failed.");
    } finally {
      setDisconnecting(null);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5 text-foreground">
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
              <Link2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">SEEKER LEGACY PROTOCOL</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Social connections</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage the channels available to your approval-gated content engine.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setLocation("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Button>
        </div>
      </header>

      <main className="container space-y-6 py-8">
        <Card className="card-elevated overflow-hidden border-emerald-400/15 bg-emerald-400/[0.03]">
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-400/10 p-2 text-emerald-300"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <h2 className="font-semibold">Approval gate is active</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Connecting an account does not publish anything. Every post must pass the content checks and receive your explicit approval before a provider adapter can act.</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs text-emerald-300"><LockKeyhole className="h-4 w-4" /> Tokens stay server-side</div>
          </div>
        </Card>

        {loadError && (
          <Card className="border-rose-400/20 bg-rose-400/[0.04] p-5">
            <div className="flex items-start gap-3 text-rose-200">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1"><p className="font-medium">Connection status unavailable</p><p className="mt-1 text-sm text-rose-200/70">{loadError}</p></div>
              <Button size="sm" variant="outline" onClick={() => void loadConnections()} className="gap-2"><RefreshCw className="h-4 w-4" /> Retry</Button>
            </div>
          </Card>
        )}

        <section className="grid gap-5 lg:grid-cols-2" aria-label="Social provider connections">
          {(["x", "linkedin"] as Provider[]).map((provider) => {
            const meta = providerMeta[provider];
            const Icon = meta.icon;
            const connection = connectionByProvider.get(provider);
            const isDisconnecting = disconnecting === provider;
            return (
              <Card key={provider} className={`card-elevated overflow-hidden border transition-colors ${meta.accentClass}`}>
                <div className="flex items-start justify-between gap-4 border-b border-border/20 p-6">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-2xl p-3 ${meta.iconClass}`}><Icon className="h-6 w-6" /></div>
                    <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{meta.eyebrow}</p><h2 className="mt-1 text-2xl font-semibold">{meta.name}</h2></div>
                  </div>
                  {isLoading ? <span className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking</span> : connection?.status === "active" ? <span className="flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Connected</span> : <span className="text-xs text-muted-foreground">Not connected</span>}
                </div>

                <div className="space-y-5 p-6">
                  <p className="min-h-12 text-sm leading-6 text-muted-foreground">{meta.description}</p>
                  {connection?.status === "active" ? (
                    <>
                      <div className="rounded-xl border border-border/30 bg-background/40 p-4">
                        <div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Connected account</p><p className="mt-1 font-medium">{connection.displayName || "Account linked"}</p></div><span className="font-mono text-xs text-muted-foreground">{maskAccountId(connection.providerAccountId)}</span></div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> Token expiry: {formatDate(connection.tokenExpiresAt)}</div>
                      </div>
                      <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Granted capabilities</p><div className="mt-3 flex flex-wrap gap-2">{scopesFor(connection).map((scope) => <span key={scope} className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs text-primary-foreground/80">{scope}</span>)}</div></div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/20 pt-4"><p className="text-xs text-muted-foreground">Publishing remains approval-only.</p><Button variant="outline" size="sm" onClick={() => void disconnect(provider)} disabled={isDisconnecting} className="gap-2 text-rose-200 hover:text-rose-100">{isDisconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}{isDisconnecting ? "Disconnecting…" : "Disconnect"}</Button></div>
                    </>
                  ) : (
                    <>
                      <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Requested capabilities</p><div className="mt-3 flex flex-wrap gap-2">{meta.scopes.map((scope) => <span key={scope} className="rounded-full border border-border/30 bg-background/40 px-3 py-1 text-xs text-muted-foreground">{scope}</span>)}</div></div>
                      <Button onClick={() => connect(provider)} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"><ExternalLink className="h-4 w-4" /> Connect {meta.name}</Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </section>

        <div className="grid gap-5 md:grid-cols-3">
          <Card className="card-elevated p-5"><ShieldCheck className="h-5 w-5 text-emerald-300" /><h3 className="mt-4 font-semibold">Least privilege</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Only the provider scopes required for approved content workflows are requested.</p></Card>
          <Card className="card-elevated p-5"><LockKeyhole className="h-5 w-5 text-cyan-300" /><h3 className="mt-4 font-semibold">Server-side tokens</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">The browser sees account metadata, never client secrets, access tokens, or refresh tokens.</p></Card>
          <Card className="card-elevated p-5"><AtSign className="h-5 w-5 text-purple-300" /><h3 className="mt-4 font-semibold">Easy revocation</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Disconnect removes the encrypted local token material and disables future provider actions.</p></Card>
        </div>
      </main>
    </div>
  );
}
