import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-tau/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-tau/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-tau/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 lg:pt-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tau/10 border border-tau/20 mb-8"
          >
            <Zap className="w-4 h-4 text-tau" />
            <span className="text-sm font-medium text-tau">Introducing TAU Access Units</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-tight mb-6"
          >
            The Tech Ecosystem{" "}
            <span className="text-gradient-tau">Built for Builders</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10"
          >
            Access premium tools, services, and training with TAU—your internal access units. 
            Earn, transfer, and activate digital resources seamlessly within Webgrow.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button variant="hero" size="xl" className="w-full sm:w-auto" asChild>
              <Link to="/auth">
                Start Building <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" className="w-full sm:w-auto" asChild>
              <Link to="/auth">Explore Marketplace</Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 text-primary-foreground/60"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure Transfers</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Instant Activation</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">Seamless Access</span>
            </div>
          </motion.div>
        </div>

        {/* Floating TAU Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 lg:mt-24 max-w-lg mx-auto"
        >
          <div className="glass-card rounded-2xl p-6 animate-float">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-tau flex items-center justify-center">
                  <Zap className="w-5 h-5 text-tau-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">TAU Balance</p>
                  <p className="text-2xl font-bold text-foreground">2,450.00</p>
                </div>
              </div>
              <div className="tau-badge">Active</div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Wallet Address</p>
                <p className="text-sm font-mono text-foreground">wg_usr_...7x4k</p>
              </div>
              <Button variant="tau" size="sm">
                Transfer
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
