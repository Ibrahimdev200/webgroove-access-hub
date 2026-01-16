import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, Loader2, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useWallet, useInitiateTransfer } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
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
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [otpId, setOtpId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  
  const { toast } = useToast();
  const { data: wallet } = useWallet();
  const initiateTransfer = useInitiateTransfer();

  const resetForm = () => {
    setRecipientAddress("");
    setAmount("");
    setPurpose("");
    setOtpId("");
    setOtpCode("");
    setStep("form");
    setIsConfirming(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleInitiate = async () => {
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
      const result = await initiateTransfer.mutateAsync({
        recipientAddress,
        amount: amountNum,
        purpose: purpose || undefined,
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setOtpId(result.otpId);
      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: "Check your email for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Could not initiate transfer",
        variant: "destructive",
      });
    }
  };

  const handleConfirmOtp = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);
    try {
      // Call the confirm-transfer-pending function to verify OTP and create pending transfer
      const { data, error } = await supabase.functions.invoke("confirm-transfer-pending", {
        body: { otpId, code: otpCode },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setStep("success");
      toast({
        title: "Transfer Created!",
        description: "Waiting for recipient to accept",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP code",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
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
                  Transfer TAU to another wallet. You'll receive an OTP to verify.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    <strong>Secure Transfer:</strong> After OTP verification, your TAU will remain 
                    in your wallet until the recipient accepts. Pending transfers expire after 48 hours.
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
                  onClick={handleInitiate} 
                  className="w-full bg-tau hover:bg-tau/90"
                  disabled={initiateTransfer.isPending}
                >
                  {initiateTransfer.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Send OTP to Verify
                </Button>
              </div>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-tau" />
                  Verify Transfer
                </DialogTitle>
                <DialogDescription>
                  Enter the 6-digit code sent to your email to confirm this transfer.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-6">
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Sending</p>
                  <p className="text-2xl font-bold text-tau">{amount} TAU</p>
                  <p className="text-sm text-muted-foreground mt-1">to {recipientAddress}</p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={setOtpCode}
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

                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Check your inbox or spam folder for the OTP
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Code expires in 5 minutes
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("form")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleConfirmOtp} 
                    className="flex-1 bg-tau hover:bg-tau/90"
                    disabled={isConfirming || otpCode.length !== 6}
                  >
                    {isConfirming ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Confirm Transfer
                  </Button>
                </div>
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
