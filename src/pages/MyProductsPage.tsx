import { motion } from "framer-motion";
import { Package, ShoppingBag, Calendar, CreditCard, Coins, ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserOrders } from "@/hooks/useOrders";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const MyProductsPage = () => {
  const { data: orders, isLoading } = useUserOrders();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Products</h1>
          <p className="text-muted-foreground">
            Access your purchased tools, services, and training
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                <div className="h-12 w-12 bg-secondary rounded-xl mb-4" />
                <div className="h-5 bg-secondary rounded mb-2 w-3/4" />
                <div className="h-4 bg-secondary rounded mb-4 w-1/2" />
                <div className="h-20 bg-secondary rounded mb-4" />
                <div className="h-10 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all group"
              >
                {/* Product Image or Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      backgroundColor: order.product?.category?.color
                        ? `${order.product.category.color}20`
                        : "hsl(var(--secondary))",
                    }}
                  >
                    {order.product?.image_url ? (
                      <img
                        src={order.product.image_url}
                        alt={order.product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <Package
                        className="w-6 h-6"
                        style={{ color: order.product?.category?.color || "hsl(var(--primary))" }}
                      />
                    )}
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-0">
                    Active
                  </Badge>
                </div>

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {order.product?.name || "Unknown Product"}
                </h3>

                {/* Category */}
                {order.product?.category && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {order.product.category.name}
                  </p>
                )}

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {order.product?.description || "No description available"}
                </p>

                {/* Purchase Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Purchased {format(new Date(order.created_at), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {order.payment_method === "tau" ? (
                      <>
                        <Coins className="w-4 h-4 text-tau" />
                        <span>{order.tau_amount} TAU</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>${order.amount_paid}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full" variant="tau" asChild>
                  <Link to={`/dashboard/marketplace/${order.product?.slug}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Access Product
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-card rounded-xl border border-border"
          >
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No purchases yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You haven't purchased any products yet. Browse our marketplace to discover tools, 
              services, and training that can help you grow.
            </p>
            <Button variant="tau" asChild>
              <Link to="/dashboard/marketplace">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Marketplace
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyProductsPage;
