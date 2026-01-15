import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  LayoutDashboard,
  Wallet,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "TAU Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
  { name: "My Products", href: "/dashboard/products", icon: Package },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNavItems = [
  { name: "Admin Panel", href: "/dashboard/admin", icon: Shield },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: wallet } = useWallet();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  
  const allNavItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-tau flex items-center justify-center">
              <Zap className="w-4 h-4 text-tau-foreground" />
            </div>
            <span className="font-bold text-foreground">Webgroove</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border hidden lg:flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-tau flex items-center justify-center shadow-tau">
                <Zap className="w-5 h-5 text-tau-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Webgroove</span>
            </Link>
            <NotificationBell />
          </div>

          {/* TAU Balance Card */}
          <div className="p-4 mt-4 lg:mt-0">
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">TAU Balance</p>
              <p className="text-2xl font-bold text-foreground">
                {wallet?.balance ? Number(wallet.balance).toFixed(2) : "0.00"}
              </p>
              <Link
                to="/dashboard/wallet"
                className="inline-flex items-center text-sm text-tau hover:text-tau/80 mt-2"
              >
                View Wallet <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {allNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-tau/10 text-tau"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-tau/10 flex items-center justify-center">
                <span className="text-tau font-semibold">
                  {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {profile?.display_name || "User"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
