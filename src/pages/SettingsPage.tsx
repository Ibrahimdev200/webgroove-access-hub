import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Lock, Loader2, Copy, Check, AlertTriangle, Moon, Sun } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransferLimitSetting } from "@/components/settings/TransferLimitSetting";
import { ResetSecurityQuestion } from "@/components/settings/ResetSecurityQuestion";
import { useTheme } from "@/hooks/useTheme";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [showPhrase, setShowPhrase] = useState(false);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile_with_phrase", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*, security_phrase")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: securityAnswer } = useQuery({
    queryKey: ["security_answer", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_security_answers")
        .select("*, security_questions(question)")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleVerifyPassword = async () => {
    if (!user?.email) return;
    
    setVerifying(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (error) {
        throw new Error("Incorrect password");
      }

      setVerified(true);
      setShowPhrase(true);
      toast({
        title: "Password verified",
        description: "You can now view your security phrase.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyPhrase = () => {
    if (profile?.security_phrase) {
      navigator.clipboard.writeText(profile.security_phrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Security phrase copied to clipboard.",
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setPassword("");
    setVerified(false);
    setShowPhrase(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">
            Manage your account security and preferences
          </p>

          <div className="space-y-6">
            {/* Appearance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-tau" />
                  ) : (
                    <Sun className="w-5 h-5 text-tau" />
                  )}
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how Webgrow looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transfer Limit Setting */}
            <TransferLimitSetting />

            {/* Reset Security Question */}
            <ResetSecurityQuestion />

            {/* Security Phrase Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-tau" />
                  Recovery Security Phrase
                </CardTitle>
                <CardDescription>
                  Your 12-word recovery phrase can be used to recover your account if you forget your password.
                  Keep it safe and never share it with anyone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) handleCloseDialog();
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Eye className="w-4 h-4 mr-2" />
                      View Security Phrase
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-tau" />
                        Verify Your Identity
                      </DialogTitle>
                      <DialogDescription>
                        Enter your password to view your security phrase.
                      </DialogDescription>
                    </DialogHeader>

                    {!verified ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="verify-password">Password</Label>
                          <Input
                            id="verify-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={handleVerifyPassword}
                          className="w-full"
                          disabled={!password || verifying}
                        >
                          {verifying ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          Verify Password
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-secondary rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-500">Keep this safe!</span>
                          </div>
                          <p className="font-mono text-sm text-foreground break-all">
                            {profile?.security_phrase}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleCopyPhrase}
                          className="w-full"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 mr-2" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          {copied ? "Copied!" : "Copy to Clipboard"}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Security Question Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-tau" />
                  Current Security Question
                </CardTitle>
                <CardDescription>
                  Your security question is used for account recovery.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {securityAnswer ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Your security question:</p>
                    <p className="font-medium text-foreground">
                      {(securityAnswer as any).security_questions?.question || "Question not available"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No security question set. This may have been set during account creation.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium text-foreground">{user?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Display Name</Label>
                  <p className="font-medium text-foreground">{profile?.display_name || "Not set"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
