import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TeamManagement from "./pages/TeamManagement";
import PropertyListing from "./pages/PropertyListing";
import PropertyDetails from "./pages/PropertyDetails";
import CommissionStructure from "./pages/CommissionStructure";
import LeadManagement from "./pages/LeadManagement";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import LevelUpGuide from "./pages/LevelUpGuide";
import GlobalAgents from "./pages/GlobalAgents";
import { AuthProvider } from "@/contexts/AuthContext";
import { LeadsProvider } from "@/contexts/LeadsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LeadsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            
            {/* Protected routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/team" 
              element={
                <ProtectedRoute>
                  <TeamManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/properties" 
              element={
                <ProtectedRoute>
                  <PropertyListing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/property/:id" 
              element={
                <ProtectedRoute>
                  <PropertyDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/commissions" 
              element={
                <ProtectedRoute>
                  <CommissionStructure />
                </ProtectedRoute>
              } 
            />
              <Route 
              path="/global-agents" 
              element={
                <ProtectedRoute>
                  <GlobalAgents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leads" 
              element={
                <ProtectedRoute>
                  <LeadManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/level-up-guide" 
              element={
                <ProtectedRoute>
                  <LevelUpGuide />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </LeadsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
