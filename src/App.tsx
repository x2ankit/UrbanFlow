import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import PassengerDashboard from "./pages/passenger/Dashboard";
import CaptainDashboard from "./pages/captain/Dashboard";
import DriverDashboard from "./pages/DriverDashboard";
import RideBooking from "./pages/RideBooking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/ride-booking" element={<RideBooking />} />
          {/* Temporarily bypass auth for development */}
          <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
          <Route path="/captain/dashboard" element={<CaptainDashboard />} />
          {/* legacy/alternate driver path: provide /driver/dashboard so old links don't 404 */}
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          {/* keep old auth paths working by redirecting to unified auth */}
          <Route path="/passenger/auth" element={<Navigate to="/auth" replace />} />
          <Route path="/captain/auth" element={<Navigate to="/auth" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
