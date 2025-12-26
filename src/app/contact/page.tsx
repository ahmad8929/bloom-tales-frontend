export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-4 text-primary">Contact Us</h1>
      <p className="mb-6">
        Have a question or need assistance? We’re here to help. Reach out to us using the form below or contact us directly.
      </p>
      <div className="space-y-2 mb-6">
        <p><strong>Address:</strong> Bloomtales Boutique, Shaheen Bagh, New Delhi</p>
        <p><strong>Phone:</strong> +91 98765 43210</p>
        <p><strong>Email:</strong> bloomtalesclothing@gmail.com</p>
      </div>
      {/* <form className="max-w-lg space-y-4">
        <input type="text" placeholder="Your Name" className="w-full border rounded-lg px-3 py-2" />
        <input type="email" placeholder="Your Email" className="w-full border rounded-lg px-3 py-2" />
        <textarea placeholder="Your Message" className="w-full border rounded-lg px-3 py-2 h-32" />
        <button className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90">Send Message</button>
      </form> */}
    </div>
  );
}
