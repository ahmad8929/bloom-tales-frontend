export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-heading">Terms and Conditions</h1>
      
      <div className="prose prose-lg max-w-none space-y-8">
        {/* Introduction */}
        <section>
          <p className="text-text-normal mb-4">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-text-normal">
            Welcome to Bloomtales Boutique ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your 
            access to and use of our website <strong>www.bloomtales.shop</strong> and our services. By accessing or 
            using our website, you agree to be bound by these Terms.
          </p>
          <p className="text-text-normal mt-4">
            Please read these Terms carefully before using our services. If you do not agree to these Terms, you must 
            not use our website or services.
          </p>
        </section>

        {/* Acceptance of Terms */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Acceptance of Terms</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              By accessing, browsing, or using our website, you acknowledge that you have read, understood, and agree 
              to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding agreement 
              between you and Bloomtales Boutique.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting 
              on this page. Your continued use of our services after such changes constitutes acceptance of the modified Terms.
            </p>
          </div>
        </section>

        {/* Eligibility */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Eligibility</h2>
          <div className="space-y-4 text-text-normal">
            <p>To use our services, you must:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Be at least 18 years of age or have parental/guardian consent</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Provide accurate, current, and complete information</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not be prohibited from using our services under applicable laws</li>
            </ul>
            <p>
              If you are using our services on behalf of a company or organization, you represent that you have the 
              authority to bind such entity to these Terms.
            </p>
          </div>
        </section>

        {/* Account Registration */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Account Registration</h2>
          <div className="space-y-4 text-text-normal">
            <p>To place orders, you may be required to create an account. You agree to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access or security breach</li>
              <li>Not share your account credentials with third parties</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent 
              activities.
            </p>
          </div>
        </section>

        {/* Products and Pricing */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Products and Pricing</h2>
          <div className="space-y-4 text-text-normal">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Product Information</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>We strive to provide accurate product descriptions, images, and pricing</li>
                <li>Product colors may vary slightly due to display settings and photography</li>
                <li>We reserve the right to correct any errors in pricing or product information</li>
                <li>Product availability is subject to change without notice</li>
                <li>We are not responsible for typographical errors in product descriptions or pricing</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Pricing</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>All prices are displayed in Indian Rupees (₹) and are inclusive of applicable taxes (GST)</li>
                <li>Prices are subject to change without prior notice</li>
                <li>We reserve the right to refuse or cancel orders at incorrect prices</li>
                <li>Promotional prices apply only during the specified promotion period</li>
                <li>Shipping charges (if applicable) are displayed separately during checkout</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Orders and Payment */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Orders and Payment</h2>
          <div className="space-y-4 text-text-normal">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Order Placement</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Placing an order constitutes an offer to purchase products at the specified price</li>
                <li>We reserve the right to accept or reject any order at our discretion</li>
                <li>Order confirmation will be sent via email and SMS</li>
                <li>We reserve the right to limit quantities or refuse orders that appear fraudulent</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Payment Terms</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Payment must be made at the time of order placement</li>
                <li>We accept payments through authorized payment gateways including PhonePe, Razorpay, UPI, 
                credit/debit cards, net banking, and wallets</li>
                <li>All payments are processed securely through PCI-DSS compliant payment processors</li>
                <li>Payment gateway KYC requirements may apply as per RBI guidelines</li>
                <li>We do not store your complete payment card details on our servers</li>
                <li>Payment failures may result in order cancellation</li>
                <li>Refunds will be processed to the original payment method within 7-10 business days</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Order Cancellation</h3>
              <p className="mb-2">
                <strong>Important:</strong> Once an order is placed and payment is confirmed, cancellations are not 
                allowed except in the following cases:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Non-delivery of package</li>
                <li>Damaged or defective products</li>
                <li>Wrong item received</li>
                <li>Quality issues not mentioned in product description</li>
              </ul>
              <p className="mt-2 text-sm text-text-muted">
                Change of mind, size/color preference changes, or order placed by mistake are not eligible for 
                cancellation. Please refer to our Shipping & Refund Policy for details.
              </p>
            </div>
          </div>
        </section>

        {/* Shipping and Delivery */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Shipping and Delivery</h2>
          <div className="space-y-4 text-text-normal">
            <ul className="list-disc ml-6 space-y-2">
              <li>Delivery timelines are estimates and may vary based on location and courier service</li>
              <li>We are not responsible for delays caused by courier services, weather, or other external factors</li>
              <li>Risk of loss and title pass to you upon delivery to the carrier</li>
              <li>You are responsible for providing accurate delivery address</li>
              <li>Failed delivery attempts may result in additional charges or order cancellation</li>
              <li>Please refer to our Shipping & Refund Policy for detailed shipping information</li>
            </ul>
          </div>
        </section>

        {/* Returns and Refunds */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Returns and Refunds</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              Our refund policy applies only to cases of non-delivery, damaged products, wrong items, or quality issues. 
              Detailed information is available in our Shipping & Refund Policy.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Refund requests must be made within 48 hours of delivery (or expected delivery date)</li>
              <li>Products must be returned in original condition with tags (for damaged/wrong items)</li>
              <li>Refunds will be processed to the original payment method within 7-10 business days</li>
              <li>We reserve the right to refuse refunds that do not meet our policy criteria</li>
            </ul>
          </div>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Intellectual Property</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              All content on our website, including text, graphics, logos, images, software, and designs, is the property 
              of Bloomtales Boutique or its licensors and is protected by Indian and international copyright, trademark, 
              and other intellectual property laws.
            </p>
            <p>You may not:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Reproduce, distribute, or create derivative works from our content without permission</li>
              <li>Use our trademarks, logos, or brand names without written consent</li>
              <li>Copy, modify, or reverse engineer our website or software</li>
              <li>Remove any copyright or proprietary notices</li>
            </ul>
          </div>
        </section>

        {/* User Conduct */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">User Conduct</h2>
          <div className="space-y-4 text-text-normal">
            <p>You agree not to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Use our services for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit viruses, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt our services</li>
              <li>Use automated systems to access our website without permission</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in fraudulent activities</li>
            </ul>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Limitation of Liability</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              To the maximum extent permitted by law, Bloomtales Boutique and its affiliates shall not be liable for:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Delays or failures in delivery beyond our control</li>
              <li>Product defects that are not manufacturing defects</li>
              <li>Any damages resulting from misuse of products</li>
            </ul>
            <p>
              Our total liability for any claim shall not exceed the amount paid by you for the specific product or 
              service in question.
            </p>
            <p className="text-sm text-text-muted">
              Nothing in these Terms excludes or limits our liability for death or personal injury caused by negligence, 
              fraud, or any other liability that cannot be excluded by law.
            </p>
          </div>
        </section>

        {/* Indemnification */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Indemnification</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              You agree to indemnify, defend, and hold harmless Bloomtales Boutique, its officers, directors, employees, 
              and agents from and against any claims, damages, losses, liabilities, and expenses (including legal fees) 
              arising from:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Your use of our services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Any content you submit or transmit through our services</li>
            </ul>
          </div>
        </section>

        {/* Dispute Resolution */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Dispute Resolution</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              In case of any disputes or disagreements, we encourage you to contact our customer support team first. 
              We will make reasonable efforts to resolve disputes amicably.
            </p>
            <p>
              If a dispute cannot be resolved through our customer support, it shall be subject to the exclusive 
              jurisdiction of the courts in Bareilly, Uttar Pradesh, India.
            </p>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to 
              conflict of law principles.
            </p>
          </div>
        </section>

        {/* Force Majeure */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Force Majeure</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable 
              control, including but not limited to natural disasters, war, terrorism, labor disputes, government actions, 
              pandemics, or failures of third-party service providers.
            </p>
          </div>
        </section>

        {/* Severability */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Severability</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions 
              shall continue in full force and effect. The invalid provision shall be replaced with a valid provision that 
              most closely reflects the intent of the original provision.
            </p>
          </div>
        </section>

        {/* Entire Agreement */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Entire Agreement</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              These Terms, together with our Privacy Policy and Shipping & Refund Policy, constitute the entire agreement 
              between you and Bloomtales Boutique regarding your use of our services and supersede all prior agreements and 
              understandings.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Contact Us</h2>
          <div className="space-y-4 text-text-normal">
            <p>If you have any questions about these Terms, please contact us:</p>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> bloomtalesclothing@gmail.com</li>
                <li><strong>Website:</strong> www.bloomtales.shop</li>
                <li><strong>Business Address:</strong> Available on our contact page</li>
                <li><strong>Business Hours:</strong> Monday to Saturday, 10:00 AM - 7:00 PM IST</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Acknowledgment */}
        <section>
          <div className="bg-card border border-border rounded-lg p-6 text-text-normal">
            <p className="font-semibold mb-2">By using our services, you acknowledge that:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>You have read and understood these Terms</li>
              <li>You agree to be bound by these Terms</li>
              <li>You are legally capable of entering into this agreement</li>
              <li>You will comply with all applicable laws and regulations</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
