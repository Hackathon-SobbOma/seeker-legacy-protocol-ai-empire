import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="container py-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
      </div>
      <div className="container py-8">
        <Card className="card-elevated p-8">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-4">Coming soon...</p>
        </Card>
      </div>
    </div>
  );
}
