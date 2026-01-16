import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { FileText, AlertTriangle, Shield, Scale } from "lucide-react";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-tau" />
                <span className="text-sm font-semibold text-tau uppercase tracking-wide">Legal</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms and Conditions</h1>
              <p className="text-muted-foreground mb-8">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="prose prose-gray dark:prose-invert max-w-none"
            >
              {/* Important Notice Banner */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      Important Notice Regarding Product Usage
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      All tools, software, and digital products available on the Webgrow platform are 
                      intended for legitimate, lawful purposes only. Users are solely responsible for 
                      ensuring that their use of any product complies with the laws and regulations 
                      of their country or jurisdiction. <strong>Webgrow does not endorse, encourage, or 
                      support the use of any product for illegal, harmful, or unethical purposes.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">1.</span> Acceptance of Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using the Webgrow platform ("Platform"), you agree to be bound by 
                  these Terms and Conditions ("Terms"). If you do not agree to all the terms and 
                  conditions, you must not access or use the Platform. These Terms apply to all 
                  visitors, users, and others who access or use the Platform.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">2.</span> User Accounts
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Safeguarding your password and any activities under your account</li>
                    <li>Maintaining the security of your security phrase - this is critical for account recovery</li>
                    <li>Notifying us immediately of any unauthorized use of your account</li>
                    <li>Ensuring your account information remains accurate and up-to-date</li>
                  </ul>
                  <p>
                    You may not use another person's account without permission. You are solely 
                    responsible for any consequences arising from the misuse of your account credentials.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">3.</span> TAU Token System
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>The TAU token is the internal currency used within the Webgrow ecosystem. By using TAU, you agree that:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>TAU tokens have no monetary value outside the Webgrow platform</li>
                    <li>TAU cannot be exchanged for real currency or cryptocurrency</li>
                    <li>The minimum transfer amount is 3 TAU</li>
                    <li>Transfers are subject to daily limits as configured in your account settings</li>
                    <li>Pending transfers expire after 48 hours if not accepted by the recipient</li>
                    <li>New users receive a welcome bonus of 10 TAU upon registration</li>
                  </ul>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-tau" />
                  <span className="text-tau">4.</span> Marketplace and Product Usage
                </h2>
                <div className="bg-card border rounded-xl p-6 mb-4">
                  <h3 className="font-bold mb-3 text-foreground">User Responsibility for Legal Compliance</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    You acknowledge and agree that any tools, software, scripts, or digital products 
                    purchased or accessed through the Webgrow platform must be used in compliance 
                    with all applicable local, state, national, and international laws and regulations. 
                    <strong> The legality of certain tools may vary by jurisdiction.</strong> It is your 
                    sole responsibility to:
                  </p>
                  <ul className="list-disc pl-6 mt-3 text-sm text-muted-foreground space-y-1">
                    <li>Research and understand the laws applicable to your use case and location</li>
                    <li>Obtain any necessary licenses, permits, or authorizations</li>
                    <li>Use products only for lawful and ethical purposes</li>
                    <li>Refrain from using products to harm, defraud, or violate the rights of others</li>
                  </ul>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong>Prohibited Uses Include (but are not limited to):</strong></p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Using security tools to gain unauthorized access to systems or data</li>
                    <li>Using automation tools to violate platform terms of service or spam</li>
                    <li>Using any product for harassment, stalking, or invasion of privacy</li>
                    <li>Using products to commit fraud, theft, or any criminal activity</li>
                    <li>Reselling or redistributing products without proper authorization</li>
                    <li>Bypassing security measures or digital rights management</li>
                  </ul>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-tau" />
                  <span className="text-tau">5.</span> Vendor Responsibilities
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>Vendors listing products on Webgrow agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate descriptions of their products and capabilities</li>
                    <li>Not list products designed primarily for illegal activities</li>
                    <li>Include appropriate warnings about potential misuse of their products</li>
                    <li>Provide reasonable support for their products</li>
                    <li>Comply with all applicable laws regarding software distribution</li>
                    <li>Not infringe on intellectual property rights of others</li>
                  </ul>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">6.</span> Disclaimer of Warranties
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    THE PLATFORM AND ALL PRODUCTS ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT 
                    WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. Webgrow does not warrant that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The platform will be uninterrupted, secure, or error-free</li>
                    <li>Products will meet your specific requirements or expectations</li>
                    <li>Products are legal to use in your jurisdiction for your intended purpose</li>
                    <li>Results from using products will be accurate or reliable</li>
                  </ul>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">7.</span> Limitation of Liability
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, WEBGROW SHALL NOT BE LIABLE FOR ANY 
                    INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING 
                    BUT NOT LIMITED TO:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Legal consequences arising from your use of products</li>
                    <li>Damages resulting from misuse of platform features</li>
                    <li>Third-party claims against you</li>
                  </ul>
                  <p className="font-semibold">
                    You expressly understand and agree that Webgrow is not responsible for any 
                    legal issues, penalties, or consequences that may arise from your use of 
                    products obtained through the platform. You use all products at your own risk.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">8.</span> Indemnification
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Webgrow, its officers, directors, 
                  employees, agents, and affiliates from and against any and all claims, damages, 
                  obligations, losses, liabilities, costs, or debt arising from your use of the 
                  platform or products, your violation of these Terms, or your violation of any 
                  third-party rights.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">9.</span> Account Termination
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We reserve the right to terminate or suspend your account immediately, without prior notice, for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violation of these Terms and Conditions</li>
                    <li>Fraudulent or illegal activity</li>
                    <li>Abuse of the TAU system or platform features</li>
                    <li>Any conduct we determine to be harmful to other users or the platform</li>
                  </ul>
                  <p>Upon termination, your right to use the platform ceases immediately, and any remaining TAU balance may be forfeited.</p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">10.</span> Privacy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your privacy is important to us. Our collection and use of personal information 
                  is governed by our Privacy Policy. By using the platform, you consent to the 
                  collection and use of information as described in our Privacy Policy.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">11.</span> Governing Law
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of 
                  the Federal Republic of Nigeria, without regard to its conflict of law provisions. 
                  Any disputes arising from these Terms shall be resolved in the courts of Nigeria.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">12.</span> Changes to Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. We will provide 
                  notice of any significant changes through the platform or via email. Your continued 
                  use of the platform after any changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-tau">13.</span> Contact Information
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms and Conditions, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-card border rounded-lg">
                  <p className="font-semibold">Webgrow</p>
                  <p className="text-muted-foreground">Email: legal@webgrow.com.ng</p>
                  <p className="text-muted-foreground">Website: webgrow.com.ng</p>
                </div>
              </section>

              {/* Final Acknowledgement */}
              <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-6 mt-8">
                <p className="text-foreground font-medium">
                  By creating an account and using the Webgrow platform, you acknowledge that you 
                  have read, understood, and agree to be bound by these Terms and Conditions. You 
                  also acknowledge your responsibility to use all products in compliance with 
                  applicable laws in your jurisdiction.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
