import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Zap, Check, ShoppingCart } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/useMarketplace";
import { useToast } from "@/hooks/use-toast";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const { toast } = useToast();

  const handlePurchase = (paymentMethod: "tau" | "card") => {
    toast({
      title: "Coming Soon",
      description: `${paymentMethod === "tau" ? "TAU" : "Card"} payment will be available soon!`,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-video rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/dashboard/marketplace">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/dashboard/marketplace"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="aspect-video bg-gradient-to-br from-tau/20 to-primary/10 rounded-xl flex items-center justify-center border border-border"
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <ShoppingCart className="w-16 h-16 text-muted-foreground/50" />
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              {product.category && (
                <Badge variant="secondary" className="mb-3">
                  {product.category.name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-semibold">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({product.review_count || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description || "No description available for this product."}
            </p>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-tau/5 border border-tau/20">
                <p className="text-sm text-muted-foreground mb-1">TAU Price</p>
                <p className="text-2xl font-bold text-tau">
                  {Number(product.tau_price).toFixed(0)} TAU
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary">
                <p className="text-sm text-muted-foreground mb-1">Card Price</p>
                <p className="text-2xl font-bold text-foreground">
                  ${Number(product.cash_price || 0).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">+6% processing fee</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="tau"
                size="lg"
                className="flex-1"
                onClick={() => handlePurchase("tau")}
              >
                <Zap className="w-5 h-5 mr-2" />
                Pay with TAU
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => handlePurchase("card")}
              >
                Pay with Card
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductPage;
