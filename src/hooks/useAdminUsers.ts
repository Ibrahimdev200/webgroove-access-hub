import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserWithWallet {
  user_id: string;
  email: string;
  display_name: string | null;
  is_blocked: boolean;
  blocked_at: string | null;
  blocked_reason: string | null;
  created_at: string;
  wallet?: {
    id: string;
    balance: number;
    is_active: boolean;
    frozen_at: string | null;
    frozen_reason: string | null;
    wallet_address: string;
  };
}

interface RecoveryRequest {
  id: string;
  user_id: string;
  email: string;
  reason: string | null;
  status: string;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export const useAdminUsers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all users with their wallets
  const usersQuery = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, display_name, is_blocked, blocked_at, blocked_reason, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: wallets, error: walletsError } = await supabase
        .from("tau_wallets")
        .select("id, user_id, balance, is_active, frozen_at, frozen_reason, wallet_address");

      if (walletsError) throw walletsError;

      const usersWithWallets: UserWithWallet[] = profiles.map((profile) => ({
        ...profile,
        wallet: wallets.find((w) => w.user_id === profile.user_id),
      }));

      return usersWithWallets;
    },
    enabled: !!user,
  });

  // Block/unblock user
  const blockUser = useMutation({
    mutationFn: async ({ userId, block, reason }: { userId: string; block: boolean; reason?: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_blocked: block,
          blocked_at: block ? new Date().toISOString() : null,
          blocked_reason: block ? reason : null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      // Log the action
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id,
        action: block ? "block_user" : "unblock_user",
        target_user_id: userId,
        details: { reason },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });

  // Freeze/unfreeze wallet
  const freezeWallet = useMutation({
    mutationFn: async ({ walletId, freeze, reason }: { walletId: string; freeze: boolean; reason?: string }) => {
      const { error } = await supabase
        .from("tau_wallets")
        .update({
          is_active: !freeze,
          frozen_at: freeze ? new Date().toISOString() : null,
          frozen_reason: freeze ? reason : null,
        })
        .eq("id", walletId);

      if (error) throw error;

      // Log the action
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id,
        action: freeze ? "freeze_wallet" : "unfreeze_wallet",
        target_wallet_id: walletId,
        details: { reason },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });

  // Credit/debit user account
  const adjustBalance = useMutation({
    mutationFn: async ({ 
      walletId, 
      amount, 
      type, 
      description 
    }: { 
      walletId: string; 
      amount: number; 
      type: "credit" | "debit"; 
      description: string;
    }) => {
      // Get current wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("tau_wallets")
        .select("balance, user_id")
        .eq("id", walletId)
        .single();

      if (walletError) throw walletError;

      const currentBalance = Number(wallet.balance);
      const adjustmentAmount = type === "credit" ? amount : -amount;
      const newBalance = currentBalance + adjustmentAmount;

      if (newBalance < 0) {
        throw new Error("Insufficient balance for debit");
      }

      // Update wallet balance
      const { error: updateError } = await supabase
        .from("tau_wallets")
        .update({ balance: newBalance })
        .eq("id", walletId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: txError } = await supabase
        .from("tau_transactions")
        .insert([{
          wallet_id: walletId,
          amount: Math.abs(amount),
          type: type === "credit" ? "transfer_in" as const : "transfer_out" as const,
          description: `[ADMIN] ${description}`,
          balance_after: newBalance,
          status: "completed" as const,
        }]);

      if (txError) throw txError;

      // Log the action
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id,
        action: type === "credit" ? "credit_account" : "debit_account",
        target_wallet_id: walletId,
        target_user_id: wallet.user_id,
        details: { amount, description, new_balance: newBalance },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });

  // Recovery requests
  const recoveryRequestsQuery = useQuery({
    queryKey: ["recovery_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_recovery_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RecoveryRequest[];
    },
    enabled: !!user,
  });

  const resolveRecoveryRequest = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      notes 
    }: { 
      requestId: string; 
      status: "approved" | "rejected"; 
      notes: string;
    }) => {
      const { error } = await supabase
        .from("account_recovery_requests")
        .update({
          status,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq("id", requestId);

      if (error) throw error;

      // Log the action
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id,
        action: `recovery_${status}`,
        details: { request_id: requestId, notes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recovery_requests"] });
    },
  });

  // Audit logs
  const auditLogsQuery = useQuery({
    queryKey: ["admin_audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return {
    users: usersQuery.data || [],
    isLoadingUsers: usersQuery.isLoading,
    blockUser: blockUser.mutate,
    isBlocking: blockUser.isPending,
    freezeWallet: freezeWallet.mutate,
    isFreezing: freezeWallet.isPending,
    adjustBalance: adjustBalance.mutate,
    isAdjusting: adjustBalance.isPending,
    recoveryRequests: recoveryRequestsQuery.data || [],
    isLoadingRecovery: recoveryRequestsQuery.isLoading,
    resolveRecoveryRequest: resolveRecoveryRequest.mutate,
    isResolving: resolveRecoveryRequest.isPending,
    auditLogs: auditLogsQuery.data || [],
    isLoadingLogs: auditLogsQuery.isLoading,
  };
};
