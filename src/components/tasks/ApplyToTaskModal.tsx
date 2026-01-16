import { useState } from "react";
import { Loader2, Send, Coins, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useApplyToTask, Task } from "@/hooks/useTasks";
import { format } from "date-fns";

interface ApplyToTaskModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApplyToTaskModal = ({ task, open, onOpenChange }: ApplyToTaskModalProps) => {
  const { toast } = useToast();
  const applyToTask = useApplyToTask();
  const [coverMessage, setCoverMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await applyToTask.mutateAsync({
        taskId: task.id,
        coverMessage: coverMessage.trim() || undefined,
      });

      toast({
        title: "Application submitted!",
        description: "The task owner will review your application.",
      });

      setCoverMessage("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to apply to task",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-tau" />
            Apply to Task
          </DialogTitle>
          <DialogDescription>
            Submit your application to work on this task
          </DialogDescription>
        </DialogHeader>

        {/* Task Summary */}
        <div className="p-4 bg-secondary/50 rounded-lg border border-border">
          <h3 className="font-semibold text-foreground mb-2">{task.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-tau font-semibold">
              <Coins className="w-4 h-4" />
              {task.tau_reward} TAU
            </span>
            {task.deadline && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Due {format(new Date(task.deadline), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Message */}
          <div className="space-y-2">
            <Label htmlFor="coverMessage">
              Cover Message (optional)
            </Label>
            <Textarea
              id="coverMessage"
              placeholder="Tell the task owner why you're a good fit for this task, your relevant experience, and how you plan to approach it..."
              value={coverMessage}
              onChange={(e) => setCoverMessage(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              A good cover message increases your chances of being selected
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="tau" 
              className="flex-1"
              disabled={applyToTask.isPending}
            >
              {applyToTask.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};