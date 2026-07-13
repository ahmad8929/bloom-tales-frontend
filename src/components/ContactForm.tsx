'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BRAND } from '@/lib/constants';
import { validateFullName, validateOptionalPhone } from '@/lib/validation';

interface ContactFormValues {
  name: string;
  phone: string;
  email: string;
  subject: string;
  question: string;
}

const EMPTY_VALUES: ContactFormValues = { name: '', phone: '', email: '', subject: '', question: '' };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: ContactFormValues): Partial<Record<keyof ContactFormValues, string>> {
  const errors: Partial<Record<keyof ContactFormValues, string>> = {};

  const nameError = validateFullName(values.name);
  if (nameError) errors.name = nameError;

  const phoneError = validateOptionalPhone(values.phone);
  if (phoneError) errors.phone = phoneError;

  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Enter a valid email address';

  if (!values.subject.trim()) errors.subject = 'Subject is required';
  if (!values.question.trim()) errors.question = 'Please write your question';

  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [sent, setSent] = useState(false);

  const setField = (field: keyof ContactFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const lines = [
      `Hi BloomTales! I have a question.`,
      ``,
      `Name: ${values.name.trim()}`,
      values.phone.trim() ? `Phone: ${values.phone.trim()}` : '',
      `Email: ${values.email.trim()}`,
      `Subject: ${values.subject.trim()}`,
      ``,
      values.question.trim(),
    ].filter((line, i) => line !== '' || i === 1 || i === 6);

    window.open(`${BRAND.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Your Name *</Label>
          <Input id="contact-name" value={values.name} onChange={setField('name')} placeholder="Full name" />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-phone">Phone Number</Label>
          <Input id="contact-phone" type="tel" value={values.phone} onChange={setField('phone')} placeholder="10-digit mobile (optional)" />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-email">Your Email *</Label>
        <Input id="contact-email" type="email" value={values.email} onChange={setField('email')} placeholder="you@example.com" />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-subject">Subject *</Label>
        <Input id="contact-subject" value={values.subject} onChange={setField('subject')} placeholder="What is this about?" />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-question">Your Question *</Label>
        <Textarea id="contact-question" rows={5} value={values.question} onChange={setField('question')} placeholder="Tell us about your question or custom request…" />
        {errors.question && <p className="text-xs text-destructive">{errors.question}</p>}
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        <Send className="mr-2 h-4 w-4" strokeWidth={1.5} />
        Send Message
      </Button>

      {sent && (
        <p className="text-sm text-text-muted">
          Your message was opened in WhatsApp — just hit send there. Prefer email? Write to{' '}
          <a href={`mailto:${BRAND.email}`} className="text-gold underline-offset-4 hover:underline">
            {BRAND.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}
