import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { useCreatePendingTransfer } from "@/hooks/usePendingTransfers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NewTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewTransferModal = ({ open, onOpenChange }: NewTransferModalProps) => {
  const [step, setStep] = useState<"form" | "success">("form");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  
  const { toast } = useToast();
  const { data: wallet } = useWallet();
  const createTransfer = useCreatePendingTransfer();

  const resetForm = () => {
    setRecipientAddress("");
    setAmount("");
    setPurpose("");
    setStep("form");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!recipientAddress || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 3) {
      toast({
        title: "Invalid Amount",
        description: "Minimum transfer amount is 3 TAU",
        variant: "destructive",
      });
      return;
    }

    if (wallet && amountNum > Number(wallet.balance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough TAU for this transfer",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTransfer.mutateAsync({
        recipientAddress,
        amount: amountNum,
        purpose: purpose || undefined,
      });
      setStep("success");
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Could not create transfer",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-tau" />
                  Send TAU
                </DialogTitle>
                <DialogDescription>
                  Transfer TAU to another wallet. The recipient must accept before TAU leaves your account.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    <strong>New Transfer System:</strong> Your TAU will remain in your wallet until 
                    the recipient accepts the transfer. Pending transfers expire after 48 hours.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="recipient">Recipient Wallet Address</Label>
                  <Input
                    id="recipient"
                    placeholder="wg_xxxxxxxxxxxx"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount (TAU)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="3"
                    step="0.01"
                    placeholder="Minimum 3 TAU"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Balance: {wallet?.balance ?? 0} TAU | Min transfer: 3 TAU
                  </p>
                </div>

                <div>
                  <Label htmlFor="purpose">Purpose (Optional)</Label>
                  <Textarea
                    id="purpose"
                    placeholder="What's this transfer for?"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full bg-tau hover:bg-tau/90"
                  disabled={createTransfer.isPending}
                >
                  {createTransfer.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Transfer Request
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-tau/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-tau" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transfer Pending!</h3>
              <p className="text-muted-foreground mb-4">
                Your transfer request has been sent to the recipient. They have 48 hours to accept.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                <strong>{amount} TAU</strong> will be deducted from your wallet once accepted.
              </p>
              <Button onClick={handleClose} className="bg-tau hover:bg-tau/90">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
