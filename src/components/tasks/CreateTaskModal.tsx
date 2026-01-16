import { useState } from "react";
import { Loader2, Briefcase, Coins, Calendar, FileText, List } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateTask } from "@/hooks/useTasks";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTaskModal = ({ open, onOpenChange }: CreateTaskModalProps) => {
  const { toast } = useToast();
  const createTask = useCreateTask();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    tau_reward: "",
    deadline: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 30) {
      newErrors.description = "Description must be at least 30 characters";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    const tauReward = parseFloat(formData.tau_reward);
    if (!formData.tau_reward || isNaN(tauReward)) {
      newErrors.tau_reward = "TAU reward is required";
    } else if (tauReward < 1) {
      newErrors.tau_reward = "Reward must be at least 1 TAU";
    } else if (tauReward > 100000) {
      newErrors.tau_reward = "Reward must be less than 100,000 TAU";
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        newErrors.deadline = "Deadline must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createTask.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || undefined,
        tau_reward: parseFloat(formData.tau_reward),
        deadline: formData.deadline || undefined,
      });

      toast({
        title: "Task posted!",
        description: "Your task is now visible to contributors.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        requirements: "",
        tau_reward: "",
        deadline: "",
      });
      setErrors({});
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create task",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-tau" />
            Post a New Task
          </DialogTitle>
          <DialogDescription>
            Describe the work you need done and set a TAU reward for contributors.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Build a landing page for my product"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what you need in detail. Include goals, deliverables, and any specific requirements..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`min-h-[120px] ${errors.description ? "border-destructive" : ""}`}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/2000 characters
            </p>
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Requirements (optional)
            </Label>
            <Textarea
              id="requirements"
              placeholder="List any skills, experience, or tools the contributor should have..."
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          {/* TAU Reward */}
          <div className="space-y-2">
            <Label htmlFor="tau_reward" className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-tau" />
              TAU Reward *
            </Label>
            <Input
              id="tau_reward"
              type="number"
              min="1"
              step="0.01"
              placeholder="100"
              value={formData.tau_reward}
              onChange={(e) => setFormData(prev => ({ ...prev, tau_reward: e.target.value }))}
              className={errors.tau_reward ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              This is the amount you'll pay upon task completion
            </p>
            {errors.tau_reward && <p className="text-xs text-destructive">{errors.tau_reward}</p>}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Deadline (optional)
            </Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className={errors.deadline ? "border-destructive" : ""}
            />
            {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
            <p className="text-blue-600 dark:text-blue-400">
              <strong>How it works:</strong> Contributors will apply to your task. 
              Review their applications and accept one to start the work.
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
              disabled={createTask.isPending}
            >
              {createTask.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};