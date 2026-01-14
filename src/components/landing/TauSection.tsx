import { motion } from "framer-motion";
import { Check, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const tauBenefits = [
  "Not money, not crypto—pure access utility",
  "Fixed internal reference value",
  "Transfer between verified users securely",
  "6% savings vs. direct card payment",
  "Earn by contributing to the ecosystem",
  "Full transaction history and audit trail",
];

export const TauSection = () => {
  return (
    <section id="tau" className="py-24 lg:py-32 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="tau-badge mb-6 inline-block">Access Units</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Meet <span className="text-gradient-tau">TAU</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              TAU (Tech Access Units) is your key to unlocking premium tools and services 
              within Webgroove. It's not currency—it's access. Earn TAU through 
              contributions, purchase directly, or receive from other verified users.
            </p>

            <ul className="space-y-4 mb-10">
              {tauBenefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-tau/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-tau" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            <Button variant="tau" size="lg">
              Learn More About TAU <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-tau/10 rounded-3xl blur-3xl" />
            
            {/* Price Comparison Card */}
            <div className="relative bg-card rounded-2xl border border-border p-8 shadow-xl">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                Pricing Comparison
              </h3>
              
              <div className="space-y-6">
                {/* Tool Example */}
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                    <Zap className="w-7 h-7 text-tau" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Premium Dev Tool</p>
                    <p className="text-sm text-muted-foreground">Base price: $100</p>
                  </div>
                </div>

                {/* TAU Price */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-tau/5 border border-tau/20">
                  <div>
                    <p className="text-sm text-muted-foreground">Pay with TAU</p>
                    <p className="text-2xl font-bold text-tau">50 TAU</p>
                  </div>
                  <div className="tau-badge">Best Value</div>
                </div>

                {/* Cash Price */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                  <div>
                    <p className="text-sm text-muted-foreground">Pay with Card</p>
                    <p className="text-2xl font-bold text-foreground">$106</p>
                  </div>
                  <span className="text-sm text-muted-foreground">+6% fee</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Save by using TAU for all your tool activations
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
