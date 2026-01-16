import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SecurityQuestion {
  id: string;
  question: string;
}

export const ResetSecurityQuestion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data } = await supabase
        .from("security_questions")
        .select("id, question")
        .eq("is_active", true)
        .order("display_order");

      if (data) {
        setQuestions(data);
      }
    };

    fetchQuestions();
  }, []);

  const handleReset = async () => {
    if (!password || !selectedQuestionId || !newAnswer) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-security-question", {
        body: {
          password,
          newQuestionId: selectedQuestionId,
          newAnswer,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "Your security question has been updated.",
      });

      // Reset form after success
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setPassword("");
        setSelectedQuestionId("");
        setNewAnswer("");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message || "Could not update security question",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-tau" />
            Security Question
          </CardTitle>
          <CardDescription>
            Update your security question for account recovery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setIsOpen(true)}>
            Change Security Question
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-tau" />
          Reset Security Question
        </CardTitle>
        <CardDescription>
          Verify your password to update your security question
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-12 h-12 rounded-full bg-tau/10 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-tau" />
            </div>
            <p className="font-medium">Security question updated!</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password to verify"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="new-question">New Security Question</Label>
              <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a security question" />
                </SelectTrigger>
                <SelectContent>
                  {questions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.question}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="new-answer">New Answer</Label>
              <Input
                id="new-answer"
                type="text"
                placeholder="Your answer (case-insensitive)"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setPassword("");
                  setSelectedQuestionId("");
                  setNewAnswer("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReset}
                disabled={isLoading}
                className="bg-tau hover:bg-tau/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Update Security Question"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
