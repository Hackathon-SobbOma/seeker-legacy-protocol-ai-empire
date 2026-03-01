import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AgentManagement from "./pages/AgentManagement";
import TokenTracking from "./pages/TokenTracking";
import TransactionHistory from "./pages/TransactionHistory";
import RevenueAnalytics from "./pages/RevenueAnalytics";
import SkillsMonitoring from "./pages/SkillsMonitoring";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/agents"} component={AgentManagement} />
      <Route path={"/tokens"} component={TokenTracking} />
      <Route path={"/transactions"} component={TransactionHistory} />
      <Route path={"/revenue"} component={RevenueAnalytics} />
      <Route path={"/skills"} component={SkillsMonitoring} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
