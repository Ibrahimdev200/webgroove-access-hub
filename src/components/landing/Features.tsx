import { motion } from "framer-motion";
import { 
  Wallet, 
  ArrowLeftRight, 
  ShoppingBag, 
  Shield, 
  Users, 
  BarChart3 
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "TAU Wallet",
    description: "Your personal access unit wallet with secure balance management, transaction history, and unique transfer address.",
  },
  {
    icon: ArrowLeftRight,
    title: "Secure Transfers",
    description: "Transfer TAU between verified users with email OTP verification, ensuring every transaction is authenticated and logged.",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Browse and activate premium tools, services, and training from verified vendors—all with TAU or direct payment.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Daily limits, OTP verification, audit trails, and admin monitoring protect every transaction in the ecosystem.",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description: "Built for developers, creators, mentors, vendors, and learners—each with tailored access and capabilities.",
  },
  {
    icon: BarChart3,
    title: "Vendor Dashboard",
    description: "List tools, set pricing, accept TAU payments, and track earnings with comprehensive analytics.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const Features = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <span className="tau-badge mb-4 inline-block">Platform Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="text-gradient-tau">Build & Grow</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete ecosystem for tech professionals. Access tools, transfer value, 
            and collaborate—all within a secure, trusted environment.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative bg-card rounded-2xl p-6 lg:p-8 border border-border hover:border-tau/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-tau/10 flex items-center justify-center mb-5 group-hover:bg-tau/20 transition-colors">
                <feature.icon className="w-6 h-6 text-tau" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
