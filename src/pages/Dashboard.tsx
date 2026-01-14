import { motion } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownLeft,
  Zap 
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useWallet, useTransactions } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: profile } = useProfile();
  const { data: wallet } = useWallet();
  const { data: transactions } = useTransactions();

  const recentTransactions = transactions?.slice(0, 5) || [];

  const stats = [
    {
      title: "TAU Balance",
      value: wallet?.balance ? Number(wallet.balance).toFixed(2) : "0.00",
      icon: Wallet,
      color: "text-tau",
      bgColor: "bg-tau/10",
    },
    {
      title: "This Month Earned",
      value: "0.00",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Products Accessed",
      value: "0",
      icon: ShoppingBag,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {profile?.display_name || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your Webgroove account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/dashboard/wallet"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-tau/10 flex items-center justify-center mb-3">
                <ArrowUpRight className="w-6 h-6 text-tau" />
              </div>
              <span className="text-sm font-medium text-foreground">Transfer TAU</span>
            </Link>
            <Link
              to="/dashboard/marketplace"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                <ShoppingBag className="w-6 h-6 text-accent" />
              </div>
              <span className="text-sm font-medium text-foreground">Browse Tools</span>
            </Link>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <Link to="/dashboard/wallet" className="text-sm text-tau hover:text-tau/80">
              View all
            </Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tx.type === 'transfer_in' || tx.type === 'earning' 
                        ? 'bg-success/10' 
                        : 'bg-destructive/10'
                    }`}>
                      {tx.type === 'transfer_in' || tx.type === 'earning' ? (
                        <ArrowDownLeft className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tx.description || tx.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    tx.type === 'transfer_in' || tx.type === 'earning'
                      ? 'text-success'
                      : 'text-foreground'
                  }`}>
                    {tx.type === 'transfer_in' || tx.type === 'earning' ? '+' : '-'}
                    {Number(tx.amount).toFixed(2)} TAU
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">
                Start by exploring the marketplace
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
