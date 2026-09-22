import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { Nav } from '@/components/nav';
import { SmoothScroll } from '@/components/smooth-scroll';
import { ScrollProgress } from '@/components/scroll-progress';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import GraphRAG from '@/pages/work/graphrag';
import PlacementPredictor from '@/pages/work/placement-predictor';
import RepoBrain from '@/pages/work/repobrain';

import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/work/repobrain" component={RepoBrain} />
        <Route path="/work/graphrag" component={GraphRAG} />
        <Route path="/work/placement-predictor" component={PlacementPredictor} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <SmoothScroll>
              <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
                <ScrollProgress />
                <Nav />
                <Router />
              </div>
            </SmoothScroll>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
