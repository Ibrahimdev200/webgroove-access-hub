import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/dashboard/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/WalletPage";
import MarketplacePage from "./pages/MarketplacePage";
import ProductPage from "./pages/ProductPage";
import MyProductsPage from "./pages/MyProductsPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import TasksPage from "./pages/TasksPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import BuildPassPage from "./pages/BuildPassPage";
import BuildEraAdminPage from "./pages/BuildEraAdminPage";
import AboutPage from "./pages/AboutPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/dashboard/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
            <Route path="/dashboard/marketplace/:slug" element={<ProtectedRoute><ProductPage /></ProtectedRoute>} />
            <Route path="/dashboard/products" element={<ProtectedRoute><MyProductsPage /></ProtectedRoute>} />
            <Route path="/dashboard/vendor" element={<ProtectedRoute><VendorDashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/dashboard/build-pass" element={<ProtectedRoute><BuildPassPage /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/dashboard/admin/build-era" element={<ProtectedRoute><BuildEraAdminPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
