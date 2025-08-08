export default function FAQPage() {
  const faqs = [
    { q: "Do you offer delivery outside Delhi?", a: "Currently, we offer delivery within Delhi NCR. Stay tuned for updates." },
    { q: "What payment methods do you accept?", a: "We accept UPI, debit/credit cards, and COD for selected areas." },
    { q: "Can I exchange an item?", a: "Yes, exchanges are allowed within 7 days for unworn and unused products." },
  ];

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-primary">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border-b pb-4">
            <h3 className="font-semibold">{faq.q}</h3>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
