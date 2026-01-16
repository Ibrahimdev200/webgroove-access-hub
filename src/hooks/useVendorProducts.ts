import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VendorProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  features: string[] | null;
  image_url: string | null;
  tau_price: number;
  base_price_usd: number;
  cash_price: number | null;
  category_id: string;
  vendor_id: string;
  status: "pending" | "active" | "rejected";
  rating: number | null;
  review_count: number | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  features: string[];
  image_url?: string;
  tau_price: number;
  base_price_usd: number;
  cash_price?: number;
  category_id: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export const useVendorProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vendor-products", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("marketplace_products")
        .select(`
          *,
          category:marketplace_categories(id, name, slug, color, icon)
        `)
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VendorProduct[];
    },
    enabled: !!user,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["marketplace-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_categories")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateProduct = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: CreateProductData) => {
      if (!user) throw new Error("Not authenticated");

      // Generate slug from name
      const slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        + "-" + Date.now().toString(36);

      const { data, error } = await supabase
        .from("marketplace_products")
        .insert({
          ...productData,
          slug,
          vendor_id: user.id,
          status: "pending", // All new products start as pending for review
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...productData }: UpdateProductData) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("marketplace_products")
        .update({
          ...productData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("vendor_id", user.id) // Ensure user owns this product
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
};

export const useDeleteProduct = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("marketplace_products")
        .delete()
        .eq("id", productId)
        .eq("vendor_id", user.id); // Ensure user owns this product

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
};