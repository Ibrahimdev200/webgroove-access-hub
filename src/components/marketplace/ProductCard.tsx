import { motion } from "framer-motion";
import { Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    tau_price: number;
    cash_price: number;
    base_price_usd: number;
    rating: number | null;
    review_count: number | null;
    vendor_id: string;
    category?: { name: string; slug: string; icon: string; color: string } | null;
  };
  index: number;
}

export const ProductCard = ({ product, index }: ProductCardProps) => {
  const { toast } = useToast();

  const handleActivate = (paymentMethod: "tau" | "card") => {
    toast({
      title: "Coming Soon",
      description: `${paymentMethod === "tau" ? "TAU" : "Card"} payment will be available soon!`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-tau transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">Vendor</p>
        </div>
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
        {product.description || "No description available"}
      </p>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-tau/5 border border-tau/20">
          <p className="text-xs text-muted-foreground mb-1">TAU Price</p>
          <p className="text-lg font-bold text-tau">{Number(product.tau_price).toFixed(0)} TAU</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary">
          <p className="text-xs text-muted-foreground mb-1">Card Price</p>
          <p className="text-lg font-bold text-foreground">
            ${Number(product.cash_price).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">+6% fee</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="tau"
          className="flex-1"
          onClick={() => handleActivate("tau")}
        >
          <Zap className="w-4 h-4 mr-1" />
          Pay TAU
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handleActivate("card")}
        >
          Pay Card
        </Button>
      </div>
    </motion.div>
  );
};
