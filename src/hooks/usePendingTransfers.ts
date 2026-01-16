import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface PendingTransfer {
  id: string;
  sender_wallet_id: string;
  sender_user_id: string;
  recipient_wallet_id: string;
  recipient_user_id: string;
  amount: number;
  purpose: string | null;
  status: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  cancelled_at: string | null;
  sender_profile?: {
    display_name: string | null;
    email: string;
  };
  sender_wallet?: {
    wallet_address: string;
  };
  recipient_profile?: {
    display_name: string | null;
    email: string;
  };
}

export const useIncomingTransfers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["incoming-transfers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("pending_transfers")
        .select("*")
        .eq("recipient_user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch sender profiles
      const transfersWithProfiles = await Promise.all(
        (data ?? []).map(async (transfer) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, email")
            .eq("user_id", transfer.sender_user_id)
            .single();

          const { data: wallet } = await supabase
            .from("tau_wallets")
            .select("wallet_address")
            .eq("id", transfer.sender_wallet_id)
            .single();

          return {
            ...transfer,
            sender_profile: profile,
            sender_wallet: wallet,
          };
        })
      );

      return transfersWithProfiles as PendingTransfer[];
    },
    enabled: !!user,
  });

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("incoming-transfers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pending_transfers",
          filter: `recipient_user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["incoming-transfers", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
};

export const useOutgoingTransfers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["outgoing-transfers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("pending_transfers")
        .select("*")
        .eq("sender_user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch recipient profiles
      const transfersWithProfiles = await Promise.all(
        (data ?? []).map(async (transfer) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, email")
            .eq("user_id", transfer.recipient_user_id)
            .single();

          return {
            ...transfer,
            recipient_profile: profile,
          };
        })
      );

      return transfersWithProfiles as PendingTransfer[];
    },
    enabled: !!user,
  });

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("outgoing-transfers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pending_transfers",
          filter: `sender_user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["outgoing-transfers", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
};

export const useCreatePendingTransfer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      recipientAddress, 
      amount, 
      purpose 
    }: { 
      recipientAddress: string; 
      amount: number; 
      purpose?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("create-pending-transfer", {
        body: { recipientAddress, amount, purpose },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoing-transfers", user?.id] });
    },
  });
};

export const useAcceptTransfer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transferId: string) => {
      const { data, error } = await supabase.functions.invoke("accept-transfer", {
        body: { transferId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-transfers", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallet", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
    },
  });
};

export const useCancelTransfer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transferId: string) => {
      const { data, error } = await supabase.functions.invoke("cancel-transfer", {
        body: { transferId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoing-transfers", user?.id] });
    },
  });
};
