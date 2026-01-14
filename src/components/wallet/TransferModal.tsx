import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertCircle, Loader2, CheckCircle, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useWallet, useInitiateTransfer, useConfirmTransfer } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "form" | "otp" | "success";

export const TransferModal = ({ open, onOpenChange }: TransferModalProps) => {
  const [step, setStep] = useState<Step>("form");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [otpId, setOtpId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const { data: wallet } = useWallet();
  const initiateTransfer = useInitiateTransfer();
  const confirmTransfer = useConfirmTransfer();
  const { toast } = useToast();

  const resetForm = () => {
    setStep("form");
    setRecipientAddress("");
    setAmount("");
    setPurpose("");
    setOtpId("");
    setOtpCode("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
      });
      return;
    }

    if (wallet && amountNum > Number(wallet.balance)) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: "You don't have enough TAU for this transfer",
      });
      return;
    }

    try {
      const result = await initiateTransfer.mutateAsync({
        recipientAddress,
        amount: amountNum,
        purpose: purpose || undefined,
      });
      setOtpId(result.otpId);
      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: "Check your email for the 6-digit verification code",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transfer failed",
        description: error.message || "Could not initiate transfer",
      });
    }
  };

  const handleConfirm = async () => {
    if (otpCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code",
      });
      return;
    }

    try {
      await confirmTransfer.mutateAsync({
        otpId,
        code: otpCode,
      });
      setStep("success");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "Invalid or expired OTP",
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
                  Transfer TAU
                </DialogTitle>
                <DialogDescription>
                  Send TAU to another Webgroove user. A verification code will be sent to your email.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleInitiate} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Wallet Address</Label>
                  <Input
                    id="recipient"
                    placeholder="wg_..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (TAU)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: {wallet?.balance ? Number(wallet.balance).toFixed(2) : "0.00"} TAU
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose (Optional)</Label>
                  <Textarea
                    id="purpose"
                    placeholder="What's this transfer for?"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary text-sm">
                  <Shield className="w-4 h-4 text-tau mt-0.5" />
                  <p className="text-muted-foreground">
                    For security, you'll receive a 6-digit OTP via email to confirm this transfer.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="tau" className="flex-1" disabled={initiateTransfer.isPending}>
                    {initiateTransfer.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-tau" />
                  Verify Transfer
                </DialogTitle>
                <DialogDescription>
                  Enter the 6-digit code sent to your email to confirm this transfer.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">To:</span>
                    <span className="font-mono text-foreground">{recipientAddress}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-foreground">{amount} TAU</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => setOtpCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <p className="text-sm text-center text-muted-foreground">
                  Code expires in 5 minutes
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>
                    Back
                  </Button>
                  <Button
                    variant="tau"
                    className="flex-1"
                    onClick={handleConfirm}
                    disabled={confirmTransfer.isPending || otpCode.length !== 6}
                  >
                    {confirmTransfer.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirm Transfer"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Transfer Complete!</h3>
              <p className="text-muted-foreground mb-6">
                {amount} TAU has been sent to {recipientAddress}
              </p>
              <Button variant="tau" onClick={handleClose}>
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
