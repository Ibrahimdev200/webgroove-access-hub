import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Copy, Check, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SecurityQuestion {
  id: string;
  question: string;
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showPhraseModal, setShowPhraseModal] = useState(false);
  const [securityPhrase, setSecurityPhrase] = useState("");
  const [copied, setCopied] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSecurityQuestions = async () => {
      const { data, error } = await supabase
        .from("security_questions")
        .select("id, question")
        .eq("is_active", true)
        .order("display_order");
      
      if (!error && data) {
        setSecurityQuestions(data);
      }
    };

    fetchSecurityQuestions();
  }, []);

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(securityPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Security phrase copied to clipboard.",
    });
  };

  const handleContinueToDashboard = () => {
    setShowPhraseModal(false);
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/dashboard");
      } else {
        // Validate confirm password
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        // Validate security question
        if (!selectedQuestion || !securityAnswer.trim()) {
          throw new Error("Please select a security question and provide an answer");
        }

        const { error } = await signUp(email, password);
        if (error) throw error;

        // Get the current user to save security answer and fetch security phrase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Save security answer
          const { error: answerError } = await supabase
            .from("user_security_answers")
            .insert({
              user_id: user.id,
              question_id: selectedQuestion,
              answer_hash: securityAnswer.toLowerCase().trim(),
            });

          if (answerError) {
            console.error("Failed to save security answer:", answerError);
          }

          // Fetch the security phrase to display to user
          const { data: profile } = await supabase
            .from("profiles")
            .select("security_phrase")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile?.security_phrase) {
            setSecurityPhrase(profile.security_phrase);
            setShowPhraseModal(true);
          } else {
            // If no phrase, just navigate
            toast({
              title: "Account created!",
              description: "Welcome to Webgroove. You've received 100 TAU as a welcome bonus!",
            });
            navigate("/dashboard");
          }
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex">
        {/* Left Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg gradient-tau flex items-center justify-center shadow-tau">
                <Zap className="w-5 h-5 text-tau-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Webgroove</span>
            </a>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {isLogin
                ? "Sign in to access your TAU wallet and marketplace"
                : "Join Webgroove and get 100 TAU as a welcome bonus"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-10 pr-10 h-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="securityQuestion" className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-tau" />
                      Security Question
                    </Label>
                    <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a security question" />
                      </SelectTrigger>
                      <SelectContent>
                        {securityQuestions.map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            {q.question}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="securityAnswer">Your Answer</Label>
                    <Input
                      id="securityAnswer"
                      type="text"
                      placeholder="Your answer (case-insensitive)"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be used to recover your account if you forget your password.
                    </p>
                  </div>
                </>
              )}

              <Button type="submit" variant="tau" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-tau font-medium">
                  {isLogin ? "Sign up" : "Sign in"}
                </span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Visual */}
        <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md text-center"
          >
            <div className="w-20 h-20 rounded-2xl gradient-tau flex items-center justify-center mx-auto mb-8 shadow-tau animate-float">
              <Zap className="w-10 h-10 text-tau-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Your Tech Access Starts Here
            </h2>
            <p className="text-primary-foreground/70 leading-relaxed">
              Access premium tools, services, and training with TAU—your internal access units. 
              Transfer securely, earn by contributing, and activate digital resources seamlessly.
            </p>

            {!isLogin && (
              <div className="mt-8 p-6 glass-card rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">Welcome Bonus</p>
                <p className="text-4xl font-bold text-tau">100 TAU</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start exploring the marketplace instantly
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Security Phrase Modal */}
      <Dialog open={showPhraseModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-6 h-6 text-tau" />
              Your Recovery Security Phrase
            </DialogTitle>
            <DialogDescription>
              Your account has been created successfully! Please save your security phrase below. 
              You'll need it to recover your account if you forget your password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-amber-500">Important!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Write this phrase down and store it in a safe place. Never share it with anyone. 
                You can also view it later in Settings.
              </p>
            </div>

            <div className="p-4 bg-secondary rounded-lg border-2 border-dashed border-tau/30">
              <p className="text-xs text-muted-foreground mb-2">Your 12-word recovery phrase:</p>
              <p className="font-mono text-sm text-foreground break-all leading-relaxed">
                {securityPhrase}
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

            <Button
              variant="tau"
              onClick={handleContinueToDashboard}
              className="w-full"
              size="lg"
            >
              I've Saved My Phrase - Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Auth;
