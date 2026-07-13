import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Service — Bloomtales',
  description: 'Terms of Service for BloomTales Clothing & Co. — orders, payments, shipping, and policies.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-heading">Terms of Service</h1>

      <div className="prose prose-lg max-w-none space-y-8">
        {/* Introduction */}
        <section>
          <p className="text-text-normal">
            Welcome to {BRAND.legalName} These Terms of Service govern your use of our website, products, and services.
            By accessing or using our website, you agree to be bound by these Terms. Please read them carefully.
          </p>
        </section>

        {/* Business Information */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Business Information</h2>
          <div className="space-y-4 text-text-normal">
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="list-none space-y-2">
                <li><strong>Business Name:</strong> {BRAND.legalName}</li>
                <li><strong>Registered Location:</strong> Bareilly, India</li>
                <li><strong>Email:</strong> {BRAND.email}</li>
                <li><strong>Phone:</strong> {BRAND.phone}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Eligibility & User Accounts */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Eligibility &amp; User Accounts</h2>
          <div className="space-y-4 text-text-normal">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Account Registration</h3>
              <p>
                You may create an account to place orders, track purchases, and enjoy a faster checkout experience. You
                are responsible for maintaining the confidentiality of your account details and for all activities under
                your account.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Age Requirement</h3>
              <p>
                Our services are intended for users who are at least 18 years old. Users under 18 may use the website
                only with the involvement of a parent or guardian. We do not knowingly collect personal data from
                children under 13.
              </p>
            </div>
          </div>
        </section>

        {/* Orders & Payments */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Orders &amp; Payments</h2>
          <div className="space-y-4 text-text-normal">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Accepted Payment Methods</h3>
              <p className="mb-2">We accept:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Debit Card</li>
                <li>Credit Card</li>
                <li>UPI</li>
                <li>Paytm</li>
                <li>Google Pay (GPay)</li>
                <li>PhonePe</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Payment Structure</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>A minimum of <strong>50% advance payment</strong> is required to confirm any order.</li>
                <li>The remaining 50% can be paid via Cash on Delivery (COD).</li>
                <li>100% COD orders are not allowed.</li>
              </ul>
              <p className="mt-2">
                {BRAND.legalName} reserves the right to cancel any order if payment authorization fails or fraudulent
                activity is suspected.
              </p>
            </div>
          </div>
        </section>

        {/* Shipping & Delivery */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Shipping &amp; Delivery</h2>
          <div className="space-y-4 text-text-normal">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Service Area</h3>
              <p>We offer shipping across India (Pan India).</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Shipping Charges</h3>
              <p>Shipping is generally free, unless stated otherwise.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Processing &amp; Delivery Timeline</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Orders are processed and dispatched within 2–3 weeks.</li>
                <li>Delivery timelines may vary depending on location and courier availability.</li>
              </ul>
              <p className="mt-2">
                {BRAND.legalName} is not responsible for delays caused by courier partners, natural events, or
                unforeseen circumstances.
              </p>
            </div>
          </div>
        </section>

        {/* Product Information & Pricing */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Product Information &amp; Pricing</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We strive to ensure that all product descriptions, pricing, and availability are accurate. However, errors
              may occur. If an error is found after an order is placed, we will:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Offer you the option to reconfirm the order, or</li>
              <li>Cancel the order with a full refund.</li>
            </ul>
            <p>We reserve the right to modify product prices at any time without prior notice.</p>
          </div>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Intellectual Property</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              All content on this website—including images, designs, text, and branding—is the property of{' '}
              {BRAND.legalName} and is protected by applicable intellectual property laws. You may not copy, reproduce,
              or use any content without prior written permission.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Limitation of Liability</h2>
          <div className="space-y-4 text-text-normal">
            <p>To the maximum extent permitted by law, {BRAND.legalName} shall not be liable for:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Any indirect or incidental damages</li>
              <li>Delays in delivery</li>
              <li>Errors in product information</li>
              <li>Technical issues or website interruptions</li>
            </ul>
            <p>Our total liability shall not exceed the amount paid for the specific order in question.</p>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Privacy Policy</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We collect personal information such as your name, contact details, shipping address, and payment
              information for:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Processing orders</li>
              <li>Delivering products</li>
              <li>Improving our services</li>
            </ul>
            <p>
              We do not sell or rent your personal data. Information may only be shared with trusted third-party
              partners for order fulfillment. Read the full{' '}
              <a href="/privacy" className="text-gold underline-offset-4 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </section>

        {/* Governing Law & Jurisdiction */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Governing Law &amp; Jurisdiction</h2>
          <div className="space-y-4 text-text-normal">
            <p>These Terms shall be governed by the laws of India.</p>
            <p>Any disputes shall be subject to the jurisdiction of the courts in Bareilly, India.</p>
          </div>
        </section>

        {/* Modifications to Terms */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Modifications to Terms</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              {BRAND.legalName} reserves the right to update or modify these Terms at any time without prior notice.
              Continued use of the website means you accept the updated Terms.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
