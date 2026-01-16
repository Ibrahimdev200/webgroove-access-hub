import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Shield, Headphones, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const vendorBenefits = [
  {
    icon: DollarSign,
    title: "Flexible Pricing",
    description: "Set your base USD price and let users choose TAU or direct payment.",
  },
  {
    icon: TrendingUp,
    title: "Earnings Dashboard",
    description: "Track sales, monitor TAU earnings, and view comprehensive analytics.",
  },
  {
    icon: Shield,
    title: "Verified Badge",
    description: "Build trust with users through our vendor verification program.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Access priority support and resources to grow your business.",
  },
];

export const VendorSection = () => {
  return (
    <section id="vendors" className="py-24 lg:py-32 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid sm:grid-cols-2 gap-6 order-2 lg:order-1"
          >
            {vendorBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card rounded-xl p-5 border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-tau/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-5 h-5 text-tau" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <span className="tau-badge mb-6 inline-block">For Vendors</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Grow Your{" "}
              <span className="text-gradient-tau">Digital Business</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Join Webgrow as a verified vendor and reach thousands of tech professionals. 
              List your tools, services, or training courses and accept TAU payments with 
              seamless settlement.
            </p>

            <div className="bg-card rounded-xl p-6 border border-border mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Example Earnings</span>
                <span className="tau-badge">This Month</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-foreground">1,250</p>
                  <p className="text-sm text-muted-foreground">TAU Earned</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-tau">$2,500</p>
                  <p className="text-sm text-muted-foreground">Settlement Value</p>
                </div>
              </div>
            </div>

            <Button variant="tau" size="lg">
              Become a Vendor <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
