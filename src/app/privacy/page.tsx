export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-heading">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none space-y-8">
        {/* Introduction */}
        <section>
          <p className="text-text-normal mb-4">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-text-normal">
            At Bloomtales Boutique ("we," "our," or "us"), we are committed to protecting your privacy and ensuring 
            the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and 
            safeguard your information when you visit our website <strong>www.bloomtales.shop</strong> and use our services.
          </p>
          <p className="text-text-normal mt-4">
            By using our website and services, you consent to the collection and use of information in accordance with 
            this policy. If you do not agree with our policies and practices, please do not use our services.
          </p>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Information We Collect</h2>
          <div className="space-y-4 text-text-normal">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Personal Information</h3>
              <p className="mb-2">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, date of birth, gender</li>
                <li><strong>Shipping Information:</strong> Delivery address, landmark, city, state, PIN code</li>
                <li><strong>Payment Information:</strong> Payment method details, billing address (processed securely through 
                payment gateways like PhonePe, Razorpay, etc.)</li>
                <li><strong>Order Information:</strong> Order history, product preferences, wishlist items</li>
                <li><strong>Communication Data:</strong> Customer service inquiries, feedback, reviews</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Automatically Collected Information</h3>
              <p className="mb-2">When you visit our website, we automatically collect certain information:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns, search queries</li>
                <li><strong>Location Data:</strong> General location based on IP address (for delivery purposes)</li>
                <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your experience</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Third-Party Information</h3>
              <p>We may receive information from third-party services such as:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Payment processors (PhonePe, Razorpay, etc.) for transaction verification</li>
                <li>Social media platforms if you connect your account</li>
                <li>Analytics services for website performance</li>
                <li>Courier services for delivery tracking</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">How We Use Your Information</h2>
          <div className="space-y-4 text-text-normal">
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Order Processing:</strong> To process, fulfill, and deliver your orders</li>
              <li><strong>Payment Processing:</strong> To process payments and prevent fraud (in compliance with PhonePe 
              KYC and other payment gateway requirements)</li>
              <li><strong>Customer Service:</strong> To respond to your inquiries, provide support, and handle returns/refunds</li>
              <li><strong>Account Management:</strong> To create and manage your account, verify your identity</li>
              <li><strong>Communication:</strong> To send order confirmations, shipping updates, promotional offers (with your 
              consent), and important service notifications</li>
              <li><strong>Personalization:</strong> To personalize your shopping experience and recommend products</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations, including KYC requirements for payment 
              processing, tax regulations, and consumer protection laws</li>
              <li><strong>Security:</strong> To detect, prevent, and address fraud, security issues, and technical problems</li>
              <li><strong>Analytics:</strong> To analyze website usage, improve our services, and develop new features</li>
            </ul>
          </div>
        </section>

        {/* Information Sharing and Disclosure */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Information Sharing and Disclosure</h2>
          <div className="space-y-4 text-text-normal">
            <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>

            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-subheading">Service Providers</h3>
                <p>We share information with trusted third-party service providers who assist us in:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Payment processing (PhonePe, Razorpay, and other authorized payment gateways)</li>
                  <li>Order fulfillment and shipping</li>
                  <li>Email and SMS services</li>
                  <li>Website hosting and analytics</li>
                  <li>Customer support services</li>
                </ul>
                <p className="mt-2 text-sm">These providers are contractually obligated to protect your information and use it 
                only for specified purposes.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-subheading">Legal Requirements</h3>
                <p>We may disclose information when required by law, including:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>To comply with court orders, legal processes, or government requests</li>
                  <li>To enforce our Terms and Conditions</li>
                  <li>To protect our rights, privacy, safety, or property</li>
                  <li>To comply with KYC/AML regulations for payment processing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-subheading">Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the 
                acquiring entity.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-subheading">With Your Consent</h3>
                <p>We may share information with third parties when you explicitly consent to such sharing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Gateway and KYC Compliance */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Payment Gateway and KYC Compliance</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We use secure payment gateways including PhonePe, Razorpay, and other authorized payment processors. 
              In compliance with RBI guidelines and payment gateway KYC requirements:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>All payment information is encrypted and processed securely through PCI-DSS compliant payment gateways</li>
              <li>We do not store your complete card details or payment credentials on our servers</li>
              <li>Payment gateways may collect additional information for fraud prevention and KYC verification as per 
              regulatory requirements</li>
              <li>We may be required to share certain transaction and customer information with payment processors for 
              compliance and fraud prevention purposes</li>
              <li>All financial transactions are subject to applicable laws and regulations including the Payment and 
              Settlement Systems Act, 2007</li>
            </ul>
          </div>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Data Security</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>SSL encryption for data transmission</li>
              <li>Secure servers and databases</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-sm text-text-muted">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive 
              to protect your information, we cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Your Rights and Choices</h2>
          <div className="space-y-4 text-text-normal">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Access:</strong> Request access to your personal information we hold</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal and 
              contractual obligations)</li>
              <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
              <li><strong>Data Portability:</strong> Request transfer of your data to another service provider</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications at any time</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from promotional emails by clicking the unsubscribe link</li>
            </ul>
            <p>
              To exercise these rights, please contact us at <strong>bloomtalesclothing@gmail.com</strong>. We will respond 
              to your request within 30 days.
            </p>
          </div>
        </section>

        {/* Cookies and Tracking */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Cookies and Tracking Technologies</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, 
              and personalize content. Types of cookies we use:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for website functionality and security</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
            </ul>
            <p>
              You can control cookies through your browser settings. However, disabling certain cookies may affect website 
              functionality.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Children's Privacy</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us 
              immediately, and we will take steps to delete such information.
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Data Retention</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this 
              policy, unless a longer retention period is required by law. Retention periods include:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Account information: Until account deletion or 7 years after last activity (for tax/legal compliance)</li>
              <li>Order information: 7 years (for tax and legal compliance)</li>
              <li>Payment information: As required by payment gateway and regulatory requirements</li>
              <li>Marketing data: Until you unsubscribe or request deletion</li>
            </ul>
          </div>
        </section>

        {/* International Data Transfers */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">International Data Transfers</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              Your information may be transferred to and processed in countries other than India, where our service 
              providers operate. We ensure that appropriate safeguards are in place to protect your information in 
              accordance with this Privacy Policy and applicable data protection laws.
            </p>
          </div>
        </section>

        {/* Changes to Privacy Policy */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Changes to This Privacy Policy</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify you of any material changes by:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Posting the updated policy on this page with a new "Last Updated" date</li>
              <li>Sending an email notification (for significant changes)</li>
              <li>Displaying a notice on our website</li>
            </ul>
            <p>
              Your continued use of our services after such changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Contact Us</h2>
          <div className="space-y-4 text-text-normal">
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> bloomtalesclothing@gmail.com</li>
                <li><strong>Support Email:</strong> bloomtalesclothing@gmail.com</li>
                <li><strong>Website:</strong> www.bloomtales.shop</li>
                <li><strong>Business Address:</strong> Available on our contact page</li>
              </ul>
            </div>
            <p className="text-sm text-text-muted">
              We are committed to addressing your privacy concerns promptly and transparently.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Governing Law</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              This Privacy Policy is governed by and construed in accordance with the laws of India. Any disputes arising 
              from this policy shall be subject to the exclusive jurisdiction of the courts in Bareilly, Uttar Pradesh, India.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
