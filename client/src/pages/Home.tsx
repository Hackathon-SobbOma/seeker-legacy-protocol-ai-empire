import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, Zap, TrendingUp } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

/**
 * Home page for SEEKER LEGACY PROTOCOL
 */
export default function Home() {
  const [, navigate] = useLocation();
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-bold">SEEKER LEGACY PROTOCOL</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button variant="ghost" size="sm">
                {user?.name || "User"}
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6 container">
        <div className="text-center space-y-4 max-w-2xl">
          <h2 className="text-5xl font-bold">
            Autonomous Web3 Trading Agent Platform
          </h2>
          <p className="text-xl text-muted-foreground">
            Build, deploy, and manage intelligent trading agents with ClawAI automation
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
          <div className="p-4 rounded-lg border border-border/50 bg-surface/50 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-semibold">Autonomous Agents</h3>
            <p className="text-sm text-muted-foreground">AI-powered trading automation</p>
          </div>
          <div className="p-4 rounded-lg border border-border/50 bg-surface/50 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-semibold">Real-time Analytics</h3>
            <p className="text-sm text-muted-foreground">Monitor performance metrics</p>
          </div>
          <div className="p-4 rounded-lg border border-border/50 bg-surface/50 text-center">
            <Wallet className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold">Wallet Integration</h3>
            <p className="text-sm text-muted-foreground">Solana & multi-chain support</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap justify-center">
          {isAuthenticated ? (
            <>
              <Button
                onClick={() => navigate("/wallet")}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600"
                size="lg"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                size="lg"
              >
                Dashboard
              </Button>
              <Button
                onClick={() => navigate("/pricing")}
                variant="outline"
                size="lg"
              >
                Agent plans
              </Button>
              <Button
                onClick={() => navigate("/empire")}
                variant="outline"
                size="lg"
              >
                Empire Control Center
              </Button>
              <Button
                onClick={() => logout()}
                variant="ghost"
                size="lg"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
            <Button
              onClick={() => navigate("/pricing")}
              variant="outline"
              size="lg"
            >
              View agent plans
            </Button>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600"
              size="lg"
            >
              <Zap className="w-5 h-5" />
              Login to Get Started
            </Button>
            </>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 max-w-md">
            {String(error)}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 py-4">
        <div className="container text-center text-sm text-muted-foreground">
          <p>SEEKER LEGACY PROTOCOL © 2026 - Powered by Manus</p>
        </div>
      </footer>
    </div>
  );
}
