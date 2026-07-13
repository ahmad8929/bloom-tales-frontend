import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy — Bloomtales',
  description: 'How BloomTales Clothing & Co. collects, uses and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2 text-heading">Privacy Policy</h1>
      <p className="mb-8 text-text-muted">{BRAND.legalName}</p>

      <div className="prose prose-lg max-w-none space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">1. Welcome to BloomTales Clothing &amp; Co.</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We respect your privacy and are committed to protecting your personal information. This Privacy Policy
              explains how we collect, use, and safeguard your data when you visit or make a purchase from our website.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">2. Information We Collect</h2>
          <div className="space-y-4 text-text-normal">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Personal Information</h3>
              <p className="mb-2">When you place an order or contact us, we may collect:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Full Name</li>
                <li>Phone Number</li>
                <li>Email Address</li>
                <li>Shipping Address</li>
                <li>Payment Details (processed securely via payment gateways)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Usage Data</h3>
              <p className="mb-2">We may automatically collect:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>IP address</li>
                <li>Device type</li>
                <li>Browser type</li>
                <li>Pages visited</li>
                <li>Time spent on website</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">3. How We Use Your Information</h2>
          <div className="space-y-4 text-text-normal">
            <p>We use your data to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Process and deliver orders</li>
              <li>Share order updates via WhatsApp/SMS/email</li>
              <li>Provide customer support</li>
              <li>Improve our website and services</li>
              <li>Send offers (only if you allow)</li>
            </ul>
          </div>
        </section>

        {/* Sharing of Information */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">4. Sharing of Information</h2>
          <div className="space-y-4 text-text-normal">
            <p><strong>We do not sell or rent your personal data.</strong></p>
            <p>Your data may be shared only with:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Delivery partners (for shipping)</li>
              <li>Payment gateways (for secure transactions)</li>
              <li>Service providers (for website operations)</li>
            </ul>
          </div>
        </section>

        {/* Cookies & Tracking */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">5. Cookies &amp; Tracking</h2>
          <div className="space-y-4 text-text-normal">
            <p>We use cookies to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Improve your browsing experience</li>
              <li>Remember your preferences</li>
              <li>Analyze website performance</li>
            </ul>
            <p>You can disable cookies in your browser settings anytime.</p>
          </div>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">6. Data Security</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We use reasonable and industry-standard security measures to protect your data. However, no online system
              is completely secure.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">7. Children&apos;s Privacy</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              Our services are not intended for children under 13 years of age. We do not knowingly collect data from
              minors.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">8. Your Rights</h2>
          <div className="space-y-4 text-text-normal">
            <p>You can:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Request access to your data</li>
              <li>Ask for corrections or deletion</li>
              <li>Opt-out of promotional messages</li>
            </ul>
          </div>
        </section>

        {/* Changes to This Policy */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">9. Changes to This Policy</h2>
          <div className="space-y-4 text-text-normal">
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page.</p>
          </div>
        </section>

        {/* Contact Us */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">10. Contact Us</h2>
          <div className="space-y-4 text-text-normal">
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> {BRAND.email}</li>
                <li><strong>Phone/WhatsApp:</strong> {BRAND.phone}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
