import { useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Loader2, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/hooks/useWallet";
import { useQueryClient } from "@tanstack/react-query";

export const TransferLimitSetting = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: wallet } = useWallet();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [newLimit, setNewLimit] = useState<number>(1000);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"limit" | "password" | "success">("limit");

  const currentLimit = wallet?.daily_transfer_limit ? Number(wallet.daily_transfer_limit) : 1000;

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setNewLimit(currentLimit);
    setStep("limit");
    setPassword("");
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setPassword("");
    setStep("limit");
  };

  const handleSetLimit = () => {
    if (newLimit === currentLimit) {
      toast({
        variant: "destructive",
        title: "No change",
        description: "Please select a different limit.",
      });
      return;
    }
    setStep("password");
  };

  const handleConfirmWithPassword = async () => {
    if (!user?.email || !wallet) return;

    setVerifying(true);
    try {
      // Verify password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (authError) {
        throw new Error("Incorrect password");
      }

      setSaving(true);
      
      // Update the wallet limit
      const { error: updateError } = await supabase
        .from("tau_wallets")
        .update({ daily_transfer_limit: newLimit })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Refresh wallet data
      queryClient.invalidateQueries({ queryKey: ["wallet", user.id] });

      setStep("success");
      toast({
        title: "Limit updated",
        description: `Your daily transfer limit is now ${newLimit} TAU.`,
      });

      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update limit",
        description: error.message,
      });
    } finally {
      setVerifying(false);
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-tau" />
          Daily Transfer Limit
        </CardTitle>
        <CardDescription>
          Set your maximum daily TAU transfer amount for security. Changes require password confirmation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Current limit:</p>
            <p className="text-2xl font-bold text-foreground">{currentLimit} TAU</p>
          </div>
          <Button variant="outline" onClick={handleOpenDialog}>
            Change Limit
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          setDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {step === "success" ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <Lock className="w-5 h-5 text-tau" />
                )}
                {step === "limit" && "Set Transfer Limit"}
                {step === "password" && "Confirm with Password"}
                {step === "success" && "Limit Updated!"}
              </DialogTitle>
              <DialogDescription>
                {step === "limit" && "Choose your new daily transfer limit."}
                {step === "password" && "Enter your password to confirm this change."}
                {step === "success" && "Your new transfer limit has been saved."}
              </DialogDescription>
            </DialogHeader>

            {step === "limit" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>New daily limit</Label>
                    <span className="text-2xl font-bold text-tau">{newLimit} TAU</span>
                  </div>
                  <Slider
                    value={[newLimit]}
                    onValueChange={(value) => setNewLimit(value[0])}
                    min={100}
                    max={10000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>100 TAU</span>
                    <span>10,000 TAU</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSetLimit} className="flex-1">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === "password" && (
              <div className="space-y-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Changing limit from</p>
                  <p className="font-semibold">
                    {currentLimit} TAU → {newLimit} TAU
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && password && handleConfirmWithPassword()}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("limit")} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmWithPassword}
                    className="flex-1"
                    disabled={!password || verifying || saving}
                  >
                    {(verifying || saving) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Confirm
                  </Button>
                </div>
              </div>
            )}

            {step === "success" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {newLimit} TAU / day
                </p>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
