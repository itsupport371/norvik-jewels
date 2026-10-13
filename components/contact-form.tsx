'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

// Contact page form (10 Oct 2026) — writes straight to the new
// `contact_messages` table (see supabase/migrations/0007_contact_messages.sql)
// via the same browser Supabase client every other customer-facing write in
// this project already uses (addresses, wishlist) — no email service
// configured anywhere here, so this IS where a submission actually goes,
// not a decorative form that quietly does nothing.
export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      message: message.trim(),
    });
    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong — please try again, or email us directly at info@norvikgold.com.");
      return;
    }

    setSent(true);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  }

  if (sent) {
    return (
      <div className="border border-line bg-softwhite px-6 py-10 text-center">
        <p className="font-display text-xl text-ink">Message sent</p>
        <p className="mt-2 text-[14px] leading-[1.6] text-charcoal">
          Thank you for reaching out — our team will get back to you within 1–2 business days.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-antiquegold underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
          Phone (optional)
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="How can we help?"
          className="w-full resize-none border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
        />
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-antiquegold px-8 py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto sm:text-[12px]"
      >
        {submitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
