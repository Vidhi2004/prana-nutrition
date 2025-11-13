import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DietitianDashboard from "./pages/DietitianDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import Patients from "./pages/Patients";
import NewPatient from "./pages/NewPatient";
import Foods from "./pages/Foods";
import DietChartNew from "./pages/DietChartNew";
import NotFound from "./pages/NotFound";

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
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />
          
          {/* Dietitian Routes */}
          <Route
            path="/dashboard"
            element={
              <RoleBasedRoute allowedRoles={["dietitian"]}>
                <DietitianDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <RoleBasedRoute allowedRoles={["dietitian", "admin"]}>
                <Patients />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/patients/new"
            element={
              <RoleBasedRoute allowedRoles={["dietitian", "admin"]}>
                <NewPatient />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/diet-charts/new"
            element={
              <RoleBasedRoute allowedRoles={["dietitian", "admin"]}>
                <DietChartNew />
              </RoleBasedRoute>
            }
          />
          
          {/* Patient Routes */}
          <Route
            path="/patient"
            element={
              <RoleBasedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </RoleBasedRoute>
            }
          />
          
          {/* Public Routes */}
          <Route
            path="/foods"
            element={
              <RoleBasedRoute allowedRoles={["admin", "dietitian", "patient"]}>
                <Foods />
              </RoleBasedRoute>
            }
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
