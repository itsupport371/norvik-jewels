'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

// Bespoke enquiry form (30 Oct 2026) — same pattern as components/
// contact-form.tsx: writes straight to the bespoke_enquiries table (see
// supabase/migrations/0009_bespoke_enquiries.sql) via the browser Supabase
// client, no email service configured — this is where a submission
// actually lands, read by the admin straight from Supabase.
const CONTACT_METHODS = ['Email', 'Phone call', 'WhatsApp'] as const;

export default function BespokeForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneOrWhatsapp, setPhoneOrWhatsapp] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('');
  const [idea, setIdea] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !idea.trim()) {
      setError('Please fill in your name, email, and what you would like to create.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from('bespoke_enquiries').insert({
      name: name.trim(),
      email: email.trim(),
      phone_or_whatsapp: phoneOrWhatsapp.trim() || null,
      preferred_contact_method: preferredContactMethod || null,
      idea: idea.trim(),
      occasion: occasion.trim() || null,
      budget: budget.trim() || null,
      message: message.trim() || null,
    });
    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong — please try again, or email us directly at info@norvikgold.com.");
      return;
    }

    setSent(true);
    setName('');
    setEmail('');
    setPhoneOrWhatsapp('');
    setPreferredContactMethod('');
    setIdea('');
    setOccasion('');
    setBudget('');
    setMessage('');
  }

  // Confirmation copy is the brief's exact wording — no response-time
  // commitment added, since the brief explicitly says to add one "only if
  // it is operationally confirmed" and none is.
  if (sent) {
    return (
      <div className="border border-line bg-softwhite px-6 py-10 text-center">
        <p className="font-display text-xl text-ink">Thank you for sharing a little of your story.</p>
        <p className="mt-2 text-[14px] leading-[1.6] text-charcoal">
          The Norvik team will be in touch to discuss your enquiry.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-antiquegold underline underline-offset-4"
        >
          Share another idea
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Phone or WhatsApp (optional)
          </label>
          <input
            type="tel"
            value={phoneOrWhatsapp}
            onChange={(e) => setPhoneOrWhatsapp(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Preferred contact method
          </label>
          <select
            value={preferredContactMethod}
            onChange={(e) => setPreferredContactMethod(e.target.value)}
            className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
          >
            <option value="">No preference</option>
            {CONTACT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
          What would you like to create?
        </label>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          required
          rows={3}
          placeholder="A ring, a pendant, a redesign of something you already own…"
          className="w-full resize-none border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Occasion, if any (optional)
          </label>
          <input
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
            Approximate budget (optional)
          </label>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase leading-[1.2] tracking-[0.14em] text-antiquegold sm:text-[11px]">
          Your message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Anything else you'd like us to know?"
          className="w-full resize-none border border-line bg-ivory px-4 py-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
        />
      </div>

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-antiquegold px-8 py-3.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto sm:text-[12px]"
      >
        {submitting ? 'Sending…' : 'Request a Conversation'}
      </button>
    </form>
  );
}
