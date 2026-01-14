import { motion } from "framer-motion";
import { Code, Palette, GraduationCap, Server, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    icon: Code,
    name: "Developer Tools",
    count: "120+ tools",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Palette,
    name: "Design Resources",
    count: "85+ resources",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: GraduationCap,
    name: "Training Courses",
    count: "200+ courses",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Server,
    name: "Infrastructure",
    count: "45+ services",
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

const featuredTools = [
  {
    name: "CodeSync Pro",
    vendor: "DevTools Inc.",
    tauPrice: 25,
    cashPrice: 53,
    rating: 4.9,
    description: "Real-time collaborative coding environment",
  },
  {
    name: "DesignKit Ultra",
    vendor: "Creative Labs",
    tauPrice: 40,
    cashPrice: 85,
    rating: 4.8,
    description: "Complete UI component library for modern apps",
  },
  {
    name: "API Gateway Suite",
    vendor: "Cloud Architects",
    tauPrice: 75,
    cashPrice: 159,
    rating: 4.7,
    description: "Enterprise-grade API management solution",
  },
];

export const Marketplace = () => {
  return (
    <section id="marketplace" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="tau-badge mb-4 inline-block">Marketplace</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Activate Premium{" "}
            <span className="text-gradient-tau">Tools & Services</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Browse curated tools, services, and training from verified vendors. 
            Pay with TAU for the best pricing.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {categories.map((category) => (
            <div
              key={category.name}
              className="group bg-card rounded-xl p-5 border border-border hover:border-tau/30 transition-all cursor-pointer hover:shadow-md"
            >
              <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                <category.icon className="w-5 h-5" />
              </div>
              <p className="font-medium text-foreground mb-1">{category.name}</p>
              <p className="text-sm text-muted-foreground">{category.count}</p>
            </div>
          ))}
        </motion.div>

        {/* Featured Tools */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-foreground mb-6">Featured Tools</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{tool.name}</h4>
                    <p className="text-sm text-muted-foreground">{tool.vendor}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{tool.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{tool.description}</p>
                
                <div className="flex items-end justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">TAU Price</p>
                    <p className="text-xl font-bold text-tau">{tool.tauPrice} TAU</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Card Price</p>
                    <p className="text-lg text-muted-foreground line-through">${tool.cashPrice}</p>
                  </div>
                </div>
                
                <Button variant="tau" className="w-full mt-4">
                  Activate Access
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button variant="tau-outline" size="lg">
            Browse All Tools <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
