import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: number;
  created_at: string;
  expires_at: string | null;
}

interface NotificationRead {
  announcement_id: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const announcementsQuery = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_announcements")
        .select("id, title, message, priority, created_at, expires_at")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
    enabled: !!user,
  });

  const readsQuery = useQuery({
    queryKey: ["notification_reads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_notification_reads")
        .select("announcement_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as NotificationRead[];
    },
    enabled: !!user,
  });

  const markAsRead = useMutation({
    mutationFn: async (announcementId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_notification_reads")
        .insert({
          user_id: user.id,
          announcement_id: announcementId,
        });

      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_reads"] });
    },
  });

  const unreadAnnouncements = announcementsQuery.data?.filter(
    (announcement) =>
      !readsQuery.data?.some((read) => read.announcement_id === announcement.id)
  ) || [];

  return {
    announcements: announcementsQuery.data || [],
    unreadCount: unreadAnnouncements.length,
    unreadAnnouncements,
    isLoading: announcementsQuery.isLoading || readsQuery.isLoading,
    markAsRead: markAsRead.mutate,
  };
};

export const useAdminAnnouncements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createAnnouncement = useMutation({
    mutationFn: async (data: { title: string; message: string; priority?: number; expires_at?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("admin_announcements")
        .insert({
          ...data,
          created_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["admin_announcements"] });
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("admin_announcements")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["admin_announcements"] });
    },
  });

  const allAnnouncementsQuery = useQuery({
    queryKey: ["admin_announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return {
    announcements: allAnnouncementsQuery.data || [],
    isLoading: allAnnouncementsQuery.isLoading,
    createAnnouncement: createAnnouncement.mutate,
    deleteAnnouncement: deleteAnnouncement.mutate,
    isCreating: createAnnouncement.isPending,
    isDeleting: deleteAnnouncement.isPending,
  };
};
