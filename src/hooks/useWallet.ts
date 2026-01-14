import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useWallet = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("tau_wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useTransactions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get the wallet
      const { data: wallet } = await supabase
        .from("tau_wallets")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!wallet) return [];

      const { data, error } = await supabase
        .from("tau_transactions")
        .select("*")
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};

export const useInitiateTransfer = () => {
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
      // Call edge function to initiate transfer and send OTP
      const { data, error } = await supabase.functions.invoke("initiate-transfer", {
        body: { recipientAddress, amount, purpose },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", user?.id] });
    },
  });
};

export const useConfirmTransfer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      otpId, 
      code 
    }: { 
      otpId: string; 
      code: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("confirm-transfer", {
        body: { otpId, code },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
    },
  });
};
