import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Zap,
  History,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useWallet, useTransactions } from "@/hooks/useWallet";
import { TransferModal } from "@/components/wallet/TransferModal";
import { useToast } from "@/hooks/use-toast";

const WalletPage = () => {
  const { data: wallet } = useWallet();
  const { data: transactions } = useTransactions();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyAddress = () => {
    if (wallet?.wallet_address) {
      navigator.clipboard.writeText(wallet.wallet_address);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="gradient-hero rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-tau flex items-center justify-center shadow-tau">
                  <Wallet className="w-6 h-6 text-tau-foreground" />
                </div>
                <div>
                  <p className="text-sm text-primary-foreground/70">TAU Balance</p>
                  <p className="text-4xl font-bold text-primary-foreground">
                    {wallet?.balance ? Number(wallet.balance).toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2">
                <span className="text-sm text-primary-foreground/70">Wallet:</span>
                <code className="text-sm text-primary-foreground font-mono">
                  {wallet?.wallet_address || "---"}
                </code>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-primary-foreground/10 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-primary-foreground/70" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="hero"
                size="lg"
                onClick={() => setTransferModalOpen(true)}
              >
                <Send className="w-5 h-5 mr-2" />
                Transfer TAU
              </Button>
              <p className="text-xs text-primary-foreground/50 text-center">
                Daily limit: {wallet?.daily_transfer_limit ? Number(wallet.daily_transfer_limit).toFixed(0) : "1000"} TAU
              </p>
            </div>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card rounded-xl border border-border"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Transaction History</h2>
            </div>
          </div>

          <div className="divide-y divide-border">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === "transfer_in" || tx.type === "earning"
                          ? "bg-success/10"
                          : "bg-destructive/10"
                      }`}
                    >
                      {tx.type === "transfer_in" || tx.type === "earning" ? (
                        <ArrowDownLeft className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {tx.description || tx.type.replace("_", " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        tx.type === "transfer_in" || tx.type === "earning"
                          ? "text-success"
                          : "text-foreground"
                      }`}
                    >
                      {tx.type === "transfer_in" || tx.type === "earning" ? "+" : "-"}
                      {Number(tx.amount).toFixed(2)} TAU
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {Number(tx.balance_after).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Zap className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium mb-1">No transactions yet</p>
                <p className="text-sm text-muted-foreground">
                  Your transaction history will appear here
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <TransferModal open={transferModalOpen} onOpenChange={setTransferModalOpen} />
    </DashboardLayout>
  );
};

export default WalletPage;
