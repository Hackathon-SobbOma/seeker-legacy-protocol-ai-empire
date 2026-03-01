import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, Shield, Cpu, BarChart3 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-xl font-bold text-gradient">SEEKER LEGACY PROTOCOL</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-foreground hover:text-accent">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => logout()}
                  className="border-border hover:border-accent"
                >
                  Logout
                </Button>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="btn-primary">
                  Sign In
                </Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Multi-Chain Trading Agent Platform</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Intelligent Trading Agents for <span className="text-gradient">Web3 Excellence</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            SEEKER LEGACY PROTOCOL combines advanced AI-powered trading agents with Solana token management, real-time blockchain monitoring, and automated task completion through ClawAI skills.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="btn-primary px-8 py-3 text-base">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="btn-primary px-8 py-3 text-base">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            )}
            <Button variant="outline" className="px-8 py-3 text-base border-border hover:border-accent">
              Learn More
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            {/* Trading Agents */}
            <div className="card-elevated group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 group-hover:from-accent/30 group-hover:to-accent/10 transition-all">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Trading Agents</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage intelligent trading agents across Solana, Ethereum, and other blockchains with real-time monitoring.
              </p>
            </div>

            {/* Token Management */}
            <div className="card-elevated group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 group-hover:from-accent/30 group-hover:to-accent/10 transition-all">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Seeker Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Manage Solana Seeker token allocations, distributions, and vesting schedules with complete transparency.
              </p>
            </div>

            {/* Revenue Analytics */}
            <div className="card-elevated group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 group-hover:from-accent/30 group-hover:to-accent/10 transition-all">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Revenue Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track trading performance, profit/loss metrics, and ROI with comprehensive analytics dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-border/30">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12">Platform Capabilities</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10">
                  <Cpu className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">ClawAI Automation</h4>
                <p className="text-sm text-muted-foreground">
                  Automated task completion and continuous development through intelligent AI skills.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Multi-Chain Support</h4>
                <p className="text-sm text-muted-foreground">
                  Trade and manage assets across Solana, Ethereum, and other blockchain networks.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Secure Wallet Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Secure Web3 wallet integration for Solana transactions and token management.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Real-Time Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Live blockchain operations monitoring with transaction history and status updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-accent/10 to-accent/5 border-t border-border/30">
        <div className="container max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Build Your Trading Future?</h3>
          <p className="text-muted-foreground mb-8">
            Join the SEEKER LEGACY PROTOCOL community and start managing intelligent trading agents today.
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="btn-primary px-8 py-3 text-base">
                Access Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="btn-primary px-8 py-3 text-base">
                Sign In Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30 bg-background/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 SEEKER LEGACY PROTOCOL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
