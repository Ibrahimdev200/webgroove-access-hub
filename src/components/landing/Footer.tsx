import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  Platform: ["Features", "Marketplace", "Pricing", "Security"],
  Resources: ["Documentation", "API Reference", "Tutorials", "Blog"],
  Company: [{ label: "About Us", href: "/about" }, "Careers", "Contact", "Press Kit"],
  Legal: [{ label: "Terms of Service", href: "/terms" }, "Privacy Policy", "Cookie Policy", "Compliance"],
};

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-tau flex items-center justify-center">
                <Zap className="w-5 h-5 text-tau-foreground" />
              </div>
              <span className="text-xl font-bold">Webgroove</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              The tech ecosystem built for builders. Access tools, transfer value, 
              and grow with TAU.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => {
                  const isLinkObject = typeof link === "object";
                  const label = isLinkObject ? link.label : link;
                  const href = isLinkObject ? link.href : "#";
                  
                  return (
                    <li key={label}>
                      {isLinkObject ? (
                        <Link
                          to={href}
                          className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                        >
                          {label}
                        </Link>
                      ) : (
                        <a
                          href="#"
                          className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                        >
                          {label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Webgroove. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Status
            </a>
            <a href="#" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
