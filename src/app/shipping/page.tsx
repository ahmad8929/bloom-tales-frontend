export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-heading">Shipping & Refund Policy</h1>
      
      <div className="prose prose-lg max-w-none space-y-8">
        {/* Shipping Information */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Shipping Information</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              At Bloomtales Boutique, we are committed to delivering your orders quickly and safely. We provide 
              shipping services across all of India, covering every state, union territory, and city.
            </p>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Delivery Timeline</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Metro Cities:</strong> 3-5 business days</li>
                <li><strong>Tier 1 & Tier 2 Cities:</strong> 5-7 business days</li>
                <li><strong>Other Cities & Towns:</strong> 7-10 business days</li>
                <li><strong>Remote Areas:</strong> 10-14 business days</li>
              </ul>
              <p className="mt-2 text-sm text-text-muted">
                *Delivery timelines are estimates and may vary based on location, weather conditions, and courier 
                service availability. Business days exclude weekends and public holidays.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Shipping Charges</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Standard Shipping:</strong> ₹149 for all orders across India</li>
                <li>Shipping charges are uniform regardless of order value or destination</li>
                <li>All orders are shipped via our trusted courier partners</li>
              </ul>
              <p className="mt-2 text-sm text-text-muted">
                *Shipping charges are non-refundable except in cases of non-delivery or order cancellation by us.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Order Processing</h3>
              <p>
                Orders are typically processed within 1-2 business days after payment confirmation. You will receive 
                an email confirmation with your order details and tracking information once your order is dispatched.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Tracking Your Order</h3>
              <p>
                Once your order is shipped, you will receive a tracking number via email and SMS. You can track your 
                order status in real-time using the tracking link provided.
              </p>
            </div>
          </div>
        </section>

        {/* Refund Policy */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Refund Policy</h2>
          <div className="space-y-4 text-text-normal">
            <p>
              We understand that sometimes things don't go as planned. Our refund policy is designed to protect both 
              our customers and our business operations.
            </p>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-subheading">Eligible for Full Refund</h3>
              <p className="mb-3">We provide full refunds in the following circumstances:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Non-Delivery:</strong> If your package is not delivered within the promised timeframe and 
                tracking shows no delivery attempt, you are eligible for a full refund.</li>
                <li><strong>Damaged Package:</strong> If your order arrives damaged, defective, or with missing items, 
                you are eligible for a full refund or replacement (your choice).</li>
                <li><strong>Wrong Item:</strong> If you receive a different item than what you ordered, you are eligible 
                for a full refund or correct replacement.</li>
                <li><strong>Quality Issues:</strong> If the product has manufacturing defects or quality issues not 
                mentioned in the product description, you are eligible for a full refund.</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-subheading">No Cancellation Policy</h3>
              <p className="mb-3">
                <strong>Important:</strong> Once an order is placed and payment is confirmed, cancellations are not 
                allowed except in the cases mentioned above. This policy applies to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Change of mind after order placement</li>
                <li>Size or color preference changes</li>
                <li>Order placed by mistake</li>
                <li>Any other reason not covered under eligible refund conditions</li>
              </ul>
              <p className="mt-3 text-sm text-text-muted">
                This policy is in place to ensure efficient inventory management and timely order processing for all 
                our customers.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Refund Process</h3>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Contact our customer support team at <strong>bloomtalesclothing@gmail.com</strong> or call our 
                helpline within 48 hours of delivery (or expected delivery date for non-delivery cases).</li>
                <li>Provide your order number, photos/videos of the issue (for damaged/wrong items), and a detailed 
                description of the problem.</li>
                <li>Our team will review your request within 24-48 hours.</li>
                <li>Once approved, the refund will be processed to your original payment method within 7-10 business 
                days.</li>
                <li>For damaged/wrong items, you may be asked to return the product (we will arrange pickup at no cost).</li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-subheading">Refund Timeline</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Refund Processing:</strong> 24-48 hours after approval</li>
                <li><strong>Bank/Card Refund:</strong> 7-10 business days (depending on your bank)</li>
                <li><strong>UPI/Wallet Refund:</strong> 3-5 business days</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-4 text-subheading">Need Help?</h2>
          <div className="space-y-2 text-text-normal">
            <p>For any shipping or refund related queries, please contact us:</p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> bloomtalesclothing@gmail.com</li>
              <li><strong>Phone:</strong> Available on our contact page</li>
              <li><strong>Business Hours:</strong> Monday to Saturday, 10:00 AM - 7:00 PM IST</li>
            </ul>
          </div>
        </section>

        <div className="text-sm text-text-muted pt-4 border-t border-border">
          <p>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="mt-2">
            Bloomtales Boutique reserves the right to modify this shipping and refund policy at any time. 
            Changes will be effective immediately upon posting on this page.
          </p>
        </div>
      </div>
    </div>
  );
}
