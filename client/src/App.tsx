import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ClusterOverview from "@/pages/ClusterOverview";
import NetworkTopology from "@/pages/NetworkTopology";
import Nodes from "@/pages/Nodes";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clusters/:id" component={ClusterOverview} />
        <Route path="/topology/:id" component={NetworkTopology} />
        <Route path="/nodes/:id" component={Nodes} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
