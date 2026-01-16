import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  Target, 
  Heart,
  Building,
  Lightbulb,
  TrendingUp
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Security First",
    description: "We prioritize the security of your digital assets and personal information above all else."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Our platform is built by and for the community of developers, creators, and innovators."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We constantly push boundaries to bring you cutting-edge tools and technologies."
  },
  {
    icon: Heart,
    title: "Transparency",
    description: "We believe in open communication and honest dealings with our users and partners."
  }
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500+", label: "Tools & Products" },
  { value: "50+", label: "Countries Served" },
  { value: "99.9%", label: "Uptime" }
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                About <span className="text-tau">Webgrow</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Empowering developers, creators, and businesses with innovative tools 
                and a seamless digital marketplace powered by TAU.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-tau" />
                  <span className="text-sm font-semibold text-tau uppercase tracking-wide">Our Mission</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Building the Future of Digital Commerce
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  At Webgrow, we're on a mission to democratize access to premium digital tools 
                  and services. We believe that every developer, designer, and entrepreneur 
                  deserves access to the best resources to bring their ideas to life.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Through our innovative TAU token system, we've created a fair and transparent 
                  marketplace where value is exchanged seamlessly, and quality is rewarded.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-card rounded-2xl p-8 border shadow-lg"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-6 h-6 text-tau" />
                  <span className="text-sm font-semibold text-tau uppercase tracking-wide">Our Vision</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  A Global Ecosystem of Innovation
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We envision a world where geographical boundaries don't limit access to 
                  digital resources. Our platform connects creators and consumers from 
                  around the globe, fostering a thriving ecosystem of innovation and 
                  collaboration.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-primary-foreground/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do at Webgrow.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-tau/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-tau" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Company Info Section */}
        <section className="py-16 lg:py-24 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-6 h-6 text-tau" />
                  <span className="text-sm font-semibold text-tau uppercase tracking-wide">Company Information</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-8">Who We Are</h2>
                
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    Webgrow is a technology company headquartered in Nigeria, with a global 
                    vision to revolutionize how digital products and services are bought, 
                    sold, and accessed. Founded by a team of passionate developers and 
                    entrepreneurs, we understand the challenges faced by creators and 
                    consumers in the digital marketplace.
                  </p>
                  <p>
                    Our platform serves as a bridge between talented developers who create 
                    amazing tools and the businesses and individuals who need them. Through 
                    our proprietary TAU token system, we've eliminated many of the friction 
                    points in digital commerce, making transactions faster, more secure, and 
                    more accessible.
                  </p>
                  <p>
                    We're committed to supporting local and international developers by 
                    providing them with a platform to showcase and monetize their work. 
                    At the same time, we ensure that our users have access to quality-verified 
                    tools that meet their needs.
                  </p>
                </div>

                <div className="mt-8 p-6 bg-card rounded-xl border">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-tau" />
                    <span className="font-semibold">Our Commitment</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    We are committed to continuous improvement, regularly updating our platform 
                    with new features, enhanced security measures, and better user experiences. 
                    Your feedback drives our development, and we're always listening.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Have Questions?</h2>
              <p className="text-muted-foreground mb-6">
                We'd love to hear from you. Reach out to our team for any inquiries.
              </p>
              <a 
                href="mailto:support@webgrow.com.ng" 
                className="inline-flex items-center gap-2 bg-tau text-tau-foreground px-6 py-3 rounded-lg font-semibold hover:bg-tau/90 transition-colors"
              >
                Contact Us
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
