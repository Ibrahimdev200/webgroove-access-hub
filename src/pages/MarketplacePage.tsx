import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Code, Palette, GraduationCap, Server, Brain, Shield, Star, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories, useProducts } from "@/hooks/useMarketplace";
import { ProductCard } from "@/components/marketplace/ProductCard";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Palette,
  GraduationCap,
  Server,
  Brain,
  Shield,
};

const MarketplacePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts(selectedCategory, searchQuery);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Browse and activate premium tools, services, and training
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search tools and services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={!selectedCategory ? "tau" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(undefined)}
          >
            All
          </Button>
          {categories?.map((category) => {
            const IconComponent = iconMap[category.icon || "Code"] || Code;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "tau" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.slug)}
              >
                <IconComponent className="w-4 h-4 mr-1" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                <div className="h-12 w-12 bg-secondary rounded-xl mb-4" />
                <div className="h-5 bg-secondary rounded mb-2 w-3/4" />
                <div className="h-4 bg-secondary rounded mb-4 w-1/2" />
                <div className="h-20 bg-secondary rounded mb-4" />
                <div className="h-10 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <Zap className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try a different search term"
                : "Check back soon for new tools and services"}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketplacePage;
