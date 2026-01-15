import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user_orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          product:marketplace_products(
            id, name, slug, description, image_url, 
            category:marketplace_categories(name, slug, icon, color)
          )
        `)
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};
