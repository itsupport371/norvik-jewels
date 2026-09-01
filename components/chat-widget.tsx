'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

const QUICK_QUESTIONS = [
  'Do you offer bespoke jewellery?',
  'What materials do you use?',
  'Do you ship to India?',
  'How can I contact you?',
  'What diamond certifications do you offer?',
];

// Business WhatsApp number for "seamless handoff" — override via
// NEXT_PUBLIC_WHATSAPP_NUMBER in country-code + digits format, no spaces or
// '+' (e.g. "971585622369"). Falls back to the number already used across
// the site's contact/policy pages.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971585622369';

// A reply that couldn't fully help the customer — the bot falls back to
// pointing them to email/phone. That's exactly the moment a WhatsApp handoff
// is most useful, so those specific messages get an inline WhatsApp CTA.
function needsHandoff(content: string) {
  return /email info@norvikgold\.com|call \+?971/i.test(content);
}

// Builds a wa.me deep link, pre-filled with enough of the conversation so
// the human on the other end doesn't have to ask the customer to repeat
// themselves — this is what makes the handoff feel seamless.
function buildWhatsAppLink(messages: Message[]) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const intro = "Hi, I was chatting with the Norvik Jewels website assistant";
  const text = lastUser
    ? `${intro} and had a question: "${lastUser.content}". Could you help me with more details?`
    : `${intro} and would like some more details, please.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.86.507 3.68 1.469 5.27L2 22l4.868-1.44A9.96 9.96 0 0 0 12.001 22C17.522 22 22 17.523 22 12S17.522 2 12.001 2zm0 18.045a8.02 8.02 0 0 1-4.087-1.117l-.293-.174-3.036.898.912-2.96-.19-.303A8.014 8.014 0 0 1 3.996 12c0-4.418 3.586-8.005 8.005-8.005 4.418 0 8.004 3.587 8.004 8.005 0 4.418-3.586 8.045-8.004 8.045z" />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm here to help with questions about Norvik Jewels — products, materials, shipping, and more. How can I help?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  async function sendText(text: string) {
    if (!text.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.reply ?? data.error ?? 'Something went wrong.' },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again or email info@norvikgold.com.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    sendText(input.trim());
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with us"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[calc(100vw-3rem)] max-w-[380px] flex-col overflow-hidden border border-line bg-ivory shadow-2xl">
          <div className="flex items-center justify-between gap-3 bg-ink px-4 py-3.5">
            <div>
              <p className="font-display text-sm font-medium leading-[1.05] tracking-[-0.01em] text-white">Norvik Jewels Support</p>
              <p className="text-[11px] leading-[1.35] text-white/50">Usually replies in a few minutes</p>
            </div>
            <a
              href={buildWhatsAppLink(messages)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Continue on WhatsApp"
              title="Continue on WhatsApp"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 text-[14px] leading-[1.6] ${
                    m.role === 'user' ? 'bg-ink text-white' : 'bg-[#F1EEE8] text-charcoal'
                  }`}
                >
                  {m.content}
                </div>
                {m.role === 'assistant' && needsHandoff(m.content) && (
                  <a
                    href={buildWhatsAppLink(messages.slice(0, i + 1))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1.5 border border-[#25D366] px-3 py-1.5 text-[12px] font-medium leading-[1.2] text-[#128C7E] transition-colors hover:bg-[#25D366]/10"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    Continue on WhatsApp
                  </a>
                )}
              </div>
            ))}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendText(q)}
                    className="border border-line bg-ivory px-3 py-1.5 text-[13px] leading-[1.35] text-charcoal transition-colors hover:border-ink hover:text-ink"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F1EEE8] px-3.5 py-2.5 text-[14px] leading-[1.6] text-muted">Typing…</div>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 border border-line bg-ivory px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-ink px-4 py-2.5 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white disabled:opacity-30 sm:text-[12px]"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
