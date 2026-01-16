import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Task {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  tau_reward: number;
  deadline: string | null;
  status: "open" | "in_progress" | "completed" | "cancelled" | "disputed";
  owner_id: string;
  assigned_to: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  owner?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  assignee?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  applications_count?: number;
}

export interface TaskApplication {
  id: string;
  task_id: string;
  applicant_id: string;
  cover_message: string | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  updated_at: string;
  applicant?: {
    display_name: string | null;
    avatar_url: string | null;
    email: string;
  };
  task?: Task;
}

export interface CreateTaskData {
  title: string;
  description: string;
  requirements?: string;
  tau_reward: number;
  deadline?: string;
}

// Fetch all open tasks (for browsing)
export const useOpenTasks = () => {
  return useQuery({
    queryKey: ["open-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
  });
};

// Fetch tasks created by the current user
export const useMyPostedTasks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-posted-tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });
};

// Fetch tasks assigned to current user
export const useMyAssignedTasks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-assigned-tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", user.id)
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });
};

// Fetch applications for a specific task (for task owners)
export const useTaskApplications = (taskId: string) => {
  return useQuery({
    queryKey: ["task-applications", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_applications")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TaskApplication[];
    },
    enabled: !!taskId,
  });
};

// Fetch my applications (tasks I've applied to)
export const useMyApplications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("task_applications")
        .select(`
          *,
          task:tasks(*)
        `)
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (TaskApplication & { task: Task })[];
    },
    enabled: !!user,
  });
};

// Create a new task
export const useCreateTask = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...taskData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posted-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks"] });
    },
  });
};

// Update a task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posted-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["my-assigned-tasks"] });
    },
  });
};

// Delete a task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posted-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks"] });
    },
  });
};

// Apply to a task
export const useApplyToTask = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, coverMessage }: { taskId: string; coverMessage?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("task_applications")
        .insert({
          task_id: taskId,
          applicant_id: user.id,
          cover_message: coverMessage,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks"] });
    },
  });
};

// Withdraw application
export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("task_applications")
        .update({ status: "withdrawn" })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });
};

// Accept an application (task owner)
export const useAcceptApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, taskId, applicantId }: { 
      applicationId: string; 
      taskId: string; 
      applicantId: string;
    }) => {
      // Update application status
      const { error: appError } = await supabase
        .from("task_applications")
        .update({ status: "accepted" })
        .eq("id", applicationId);

      if (appError) throw appError;

      // Reject other applications
      await supabase
        .from("task_applications")
        .update({ status: "rejected" })
        .eq("task_id", taskId)
        .neq("id", applicationId);

      // Update task to in_progress and assign
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ 
          status: "in_progress",
          assigned_to: applicantId,
          assigned_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (taskError) throw taskError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posted-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-assigned-tasks"] });
    },
  });
};

// Reject an application
export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("task_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-applications"] });
    },
  });
};