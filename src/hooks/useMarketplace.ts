import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategories = () => {
  return useQuery({
    queryKey: ["marketplace_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useProducts = (categorySlug?: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ["marketplace_products", categorySlug, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("marketplace_products")
        .select(`
          *,
          category:marketplace_categories(name, slug, icon, color)
        `)
        .eq("status", "active");

      if (categorySlug) {
        const { data: category } = await supabase
          .from("marketplace_categories")
          .select("id")
          .eq("slug", categorySlug)
          .maybeSingle();
        
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_products")
        .select(`
          *,
          category:marketplace_categories(name, slug, icon, color)
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};
