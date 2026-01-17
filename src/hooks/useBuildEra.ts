import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types based on database schema
export type BuildTaskType = 'daily' | 'weekly' | 'seasonal' | 'special';
export type BuildTaskStatus = 'draft' | 'scheduled' | 'active' | 'inactive' | 'expired';
export type UserRank = 'explorer' | 'builder' | 'architect' | 'pioneer' | 'founder_circle';
export type BadgeType = 'auto' | 'admin_approved';

export interface BuildPhase {
  id: string;
  name: string;
  description: string | null;
  phase_number: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface BuildTask {
  id: string;
  title: string;
  description: string;
  task_type: BuildTaskType;
  tau_reward: number;
  phase_id: string | null;
  start_date: string;
  end_date: string;
  status: BuildTaskStatus;
  max_completions_per_user: number | null;
  max_total_completions: number | null;
  requires_approval: boolean;
  is_system_task: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  phase?: BuildPhase;
}

export interface UserBuildStats {
  id: string;
  user_id: string;
  current_rank: UserRank;
  total_tau_earned: number;
  tasks_completed: number;
  contribution_score: number;
  login_streak: number;
  longest_streak: number;
  last_login_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  badge_type: BadgeType;
  tau_threshold: number | null;
  tasks_threshold: number | null;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  awarded_by: string | null;
  badge?: Badge;
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  completion_date: string;
  completed_at: string;
  tau_awarded: number;
  status: 'pending' | 'completed' | 'rejected';
  admin_notes: string | null;
  task?: BuildTask;
}

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses_count: number;
  max_uses: number | null;
  tau_per_referral: number;
  is_active: boolean;
  created_at: string;
}

// Fetch all phases
export const useBuildPhases = () => {
  return useQuery({
    queryKey: ["build-phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("build_phases")
        .select("*")
        .order("phase_number", { ascending: true });
      
      if (error) throw error;
      return data as BuildPhase[];
    },
  });
};

// Fetch active tasks for users
export const useActiveBuildTasks = () => {
  return useQuery({
    queryKey: ["active-build-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("build_tasks")
        .select("*, phase:build_phases(*)")
        .eq("status", "active")
        .order("task_type", { ascending: true });
      
      if (error) throw error;
      return data as BuildTask[];
    },
  });
};

// Fetch all tasks for admin
export const useAllBuildTasks = () => {
  return useQuery({
    queryKey: ["all-build-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("build_tasks")
        .select("*, phase:build_phases(*)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as BuildTask[];
    },
  });
};

// Fetch user's build stats
export const useUserBuildStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-build-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_build_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserBuildStats | null;
    },
    enabled: !!user,
  });
};

// Fetch user's task completions
export const useUserTaskCompletions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-task-completions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_task_completions")
        .select("*, task:build_tasks(*)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      
      if (error) throw error;
      return data as TaskCompletion[];
    },
    enabled: !!user,
  });
};

// Fetch all badges
export const useBadges = () => {
  return useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as Badge[];
    },
  });
};

// Fetch user's badges
export const useUserBadges = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, badge:badges(*)")
        .eq("user_id", user.id)
        .order("awarded_at", { ascending: false });
      
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!user,
  });
};

// Fetch user's referral code
export const useUserReferralCode = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-referral-code", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ReferralCode | null;
    },
    enabled: !!user,
  });
};

// Fetch daily login status
export const useDailyLoginStatus = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["daily-login-status", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("daily_logins")
        .select("*")
        .eq("user_id", user.id)
        .eq("login_date", today)
        .maybeSingle();
      
      if (error) throw error;
      return { claimed: !!data, data };
    },
    enabled: !!user,
  });
};

// Claim daily login reward
export const useClaimDailyLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("claim_daily_login");
      
      if (error) throw error;
      return data as { success: boolean; tau_awarded?: number; streak?: number; error?: string };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`+${data.tau_awarded} TAU earned! 🎉`, {
          description: `Login streak: ${data.streak} day${data.streak !== 1 ? 's' : ''}`,
        });
        queryClient.invalidateQueries({ queryKey: ["daily-login-status"] });
        queryClient.invalidateQueries({ queryKey: ["user-build-stats"] });
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        toast.info(data.error || "Already claimed today");
      }
    },
    onError: (error) => {
      toast.error("Failed to claim daily reward");
      console.error(error);
    },
  });
};

// Complete a task
export const useCompleteTask = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, tauReward }: { taskId: string; tauReward: number }) => {
      if (!user) throw new Error("Not authenticated");
      
      // Check if already completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from("user_task_completions")
        .select("id")
        .eq("user_id", user.id)
        .eq("task_id", taskId)
        .eq("completion_date", today)
        .maybeSingle();
      
      if (existing) throw new Error("Already completed this task today");
      
      // Insert completion
      const { error } = await supabase
        .from("user_task_completions")
        .insert({
          user_id: user.id,
          task_id: taskId,
          tau_awarded: tauReward,
          status: 'completed',
        });
      
      if (error) throw error;
      
      // Update wallet balance
      const { data: wallet } = await supabase
        .from("tau_wallets")
        .select("id, balance")
        .eq("user_id", user.id)
        .single();
      
      if (wallet) {
        await supabase
          .from("tau_wallets")
          .update({ balance: wallet.balance + tauReward })
          .eq("id", wallet.id);
        
        // Create transaction record
        await supabase
          .from("tau_transactions")
          .insert({
            wallet_id: wallet.id,
            type: 'earning',
            amount: tauReward,
            balance_after: wallet.balance + tauReward,
            description: 'Task Completion Reward',
            status: 'completed',
          });
      }
      
      // Update build stats
      const { data: stats } = await supabase
        .from("user_build_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (stats) {
        await supabase
          .from("user_build_stats")
          .update({
            total_tau_earned: stats.total_tau_earned + tauReward,
            tasks_completed: stats.tasks_completed + 1,
            contribution_score: stats.contribution_score + 10,
          })
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("user_build_stats")
          .insert({
            user_id: user.id,
            total_tau_earned: tauReward,
            tasks_completed: 1,
            contribution_score: 10,
          });
      }
      
      return { success: true, tauReward };
    },
    onSuccess: (data) => {
      toast.success(`+${data.tauReward} TAU earned! 🎉`);
      queryClient.invalidateQueries({ queryKey: ["user-task-completions"] });
      queryClient.invalidateQueries({ queryKey: ["user-build-stats"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete task");
    },
  });
};

// Create referral code
export const useCreateReferralCode = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      // Generate code using database function
      const { data: code } = await supabase.rpc("generate_referral_code");
      
      const { error } = await supabase
        .from("referral_codes")
        .insert({
          user_id: user.id,
          code: code,
        });
      
      if (error) throw error;
      return { code };
    },
    onSuccess: () => {
      toast.success("Referral code created!");
      queryClient.invalidateQueries({ queryKey: ["user-referral-code"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create referral code");
    },
  });
};

// Admin: Create task
export const useCreateBuildTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (task: Omit<BuildTask, 'id' | 'created_at' | 'updated_at' | 'phase'>) => {
      const { error } = await supabase
        .from("build_tasks")
        .insert({
          ...task,
          created_by: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task created!");
      queryClient.invalidateQueries({ queryKey: ["all-build-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["active-build-tasks"] });
    },
    onError: (error) => {
      toast.error("Failed to create task");
      console.error(error);
    },
  });
};

// Admin: Update task
export const useUpdateBuildTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BuildTask> & { id: string }) => {
      const { error } = await supabase
        .from("build_tasks")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task updated!");
      queryClient.invalidateQueries({ queryKey: ["all-build-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["active-build-tasks"] });
    },
    onError: (error) => {
      toast.error("Failed to update task");
      console.error(error);
    },
  });
};

// Admin: Delete task
export const useDeleteBuildTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      // Check if system task
      const { data: task } = await supabase
        .from("build_tasks")
        .select("is_system_task")
        .eq("id", taskId)
        .single();
      
      if (task?.is_system_task) {
        throw new Error("Cannot delete system task");
      }
      
      const { error } = await supabase
        .from("build_tasks")
        .delete()
        .eq("id", taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task deleted!");
      queryClient.invalidateQueries({ queryKey: ["all-build-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["active-build-tasks"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });
};

// Admin: Update phase
export const useUpdateBuildPhase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BuildPhase> & { id: string }) => {
      const { error } = await supabase
        .from("build_phases")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Phase updated!");
      queryClient.invalidateQueries({ queryKey: ["build-phases"] });
    },
    onError: (error) => {
      toast.error("Failed to update phase");
      console.error(error);
    },
  });
};

// Admin: Award badge
export const useAwardBadge = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ userId, badgeId }: { userId: string; badgeId: string }) => {
      const { error } = await supabase
        .from("user_badges")
        .insert({
          user_id: userId,
          badge_id: badgeId,
          awarded_by: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Badge awarded!");
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
    },
    onError: (error) => {
      toast.error("Failed to award badge");
      console.error(error);
    },
  });
};

// Get rank display info
export const getRankInfo = (rank: UserRank) => {
  const ranks: Record<UserRank, { label: string; color: string; icon: string; minTau: number }> = {
    explorer: { label: 'Explorer', color: 'text-gray-500', icon: '🔍', minTau: 0 },
    builder: { label: 'Builder', color: 'text-blue-500', icon: '🔨', minTau: 100 },
    architect: { label: 'Architect', color: 'text-purple-500', icon: '🏗️', minTau: 500 },
    pioneer: { label: 'Pioneer', color: 'text-orange-500', icon: '🚀', minTau: 1000 },
    founder_circle: { label: 'Founder Circle', color: 'text-yellow-500', icon: '👑', minTau: 5000 },
  };
  return ranks[rank];
};
