import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Predictions from "@/pages/Predictions";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import HealthNavigation from "@/components/HealthNavigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/predictions" component={Predictions} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-lg relative overflow-hidden">
          <Toaster />
          <Router />
          <HealthNavigation />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
