'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type SavedAddress = {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  pincode: string;
};

type Tab = 'orders' | 'addresses' | 'gift-cards' | 'faq' | 'privacy';

const NAV_ITEMS: { key: Tab; label: string; icon: ReactNode }[] = [
  {
    key: 'orders',
    label: 'My Orders',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h12l-1 12H7L6 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    ),
  },
  {
    key: 'addresses',
    label: 'Saved Addresses',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    key: 'gift-cards',
    label: 'E-Gift Cards',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="12" rx="1" />
        <path d="M3 12h18" />
        <path d="M12 8v12" />
        <path d="M12 8c-1.5-3-5-4-5-1.5S9 8 12 8z" />
        <path d="M12 8c1.5-3 5-4 5-1.5S15 8 12 8z" />
      </svg>
    ),
  },
  {
    key: 'faq',
    label: "FAQ's",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 1.9-2.4 3.4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  {
    key: 'privacy',
    label: 'Account Privacy',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="9" rx="1.5" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
];

// Decorative QR-code look-alike — there's no real Norvik app to link to yet,
// so this is a stand-in grid rather than a scannable code that would falsely
// promise a working download. Swap for a real generated QR once the app
// (and a URL for it) exists.
function QRPlaceholder() {
  const cells = [
    '1110101110111',
    '1010101010101',
    '1110100010111',
    '0000101110000',
    '1011111010110',
    '0100000010101',
    '1110110110111',
    '0000101000000',
    '1101111011101',
    '0100000010010',
    '1110101110101',
    '0010101010111',
    '1101110101001',
  ];
  const size = 13;
  const cell = 7;
  return (
    <svg width={size * cell} height={size * cell} viewBox={`0 0 ${size * cell} ${size * cell}`} className="shrink-0" aria-hidden="true">
      <rect width="100%" height="100%" fill="#ffffff" />
      {cells.map((row, y) =>
        row.split('').map((c, x) =>
          c === '1' ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#161D2D" /> : null
        )
      )}
      {/* Finder patterns (the three corner squares real QR codes use) */}
      {[[0, 0], [size - 7, 0], [0, size - 7]].map(([fx, fy]) => (
        <g key={`${fx}-${fy}`}>
          <rect x={fx * cell} y={fy * cell} width={7 * cell} height={7 * cell} fill="#ffffff" />
          <rect x={fx * cell} y={fy * cell} width={7 * cell} height={7 * cell} fill="none" stroke="#161D2D" strokeWidth={cell} />
          <rect x={(fx + 2) * cell} y={(fy + 2) * cell} width={3 * cell} height={3 * cell} fill="#161D2D" />
        </g>
      ))}
    </svg>
  );
}

export default function AccountDashboard({ email }: { email: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('orders');
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (tab !== 'addresses' || addresses !== null) return;
    setLoadingAddresses(true);
    const supabase = createClient();
    supabase
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAddresses((data as SavedAddress[]) ?? []);
        setLoadingAddresses(false);
      });
  }, [tab, addresses]);

  async function handleRemoveAddress(id: string) {
    setAddresses((prev) => prev?.filter((a) => a.id !== id) ?? prev);
    const supabase = createClient();
    await supabase.from('addresses').delete().eq('id', id);
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
      {/* Sidebar */}
      <div>
        <div className="border border-line bg-paper">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex w-full items-center gap-3 border-b border-line px-5 py-3.5 text-left text-[13px] font-medium leading-[1.35] transition-colors last:border-b-0 sm:text-[14px] ${
                tab === item.key ? 'bg-softwhite text-antiquegold' : 'text-ink hover:bg-softwhite/60'
              }`}
            >
              <span className={tab === item.key ? 'text-antiquegold' : 'text-muted'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-[13px] font-medium leading-[1.35] text-ink transition-colors hover:bg-softwhite/60 disabled:opacity-50 sm:text-[14px]"
          >
            <span className="text-muted">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </span>
            {signingOut ? 'Logging out…' : 'Log Out'}
          </button>
        </div>

        {/* App download promo — Blinkit-style QR block. No Norvik app exists
            yet, so this is a placeholder (client: "abhi ke liye download
            norvik app daal dena") — swap in the real store links + QR once
            the app ships. */}
        <div className="mt-5 flex items-center gap-4 border border-line bg-paper p-5">
          <QRPlaceholder />
          <p className="text-[13px] font-semibold leading-[1.4] text-ink sm:text-[14px]">
            Simple way to shop
            <br />
            fine jewellery
            <br />
            <span className="text-antiquegold">Download the Norvik App</span>
            <br />
            <span className="mt-1 block text-[11.5px] font-normal leading-[1.4] text-muted">
              Scan the QR code to download the app
            </span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[360px] border border-line bg-paper p-6 sm:p-8">
        {tab === 'orders' && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-line" aria-hidden="true">
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <h2 className="font-display mt-5 text-[20px] font-medium leading-[1.1] text-ink sm:text-[24px]">
              You haven&apos;t placed an order yet
            </h2>
            <p className="mt-2 max-w-xs text-[13px] leading-[1.6] text-muted">
              Once you place an order, you&apos;ll be able to track it here.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block bg-ink px-6 py-3 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-white transition-opacity hover:opacity-90 sm:text-[12px]"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {tab === 'addresses' && (
          <div>
            <h2 className="font-display text-[20px] font-medium leading-[1.1] text-ink sm:text-[24px]">Saved Addresses</h2>
            {loadingAddresses && <p className="mt-4 text-[13px] text-muted">Loading…</p>}
            {!loadingAddresses && addresses && addresses.length === 0 && (
              <p className="mt-4 text-[13px] leading-[1.6] text-muted">
                You have no saved addresses yet. Addresses you save at checkout will show up here.
              </p>
            )}
            {!loadingAddresses && addresses && addresses.length > 0 && (
              <div className="mt-5 space-y-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="flex items-start justify-between gap-4 border border-line p-4">
                    <div>
                      <p className="text-[13px] font-medium leading-[1.35] text-ink sm:text-[14px]">{addr.full_name}</p>
                      <p className="mt-1 text-[13px] leading-[1.5] text-muted">
                        {addr.address_line1}
                        {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                        {addr.landmark ? `, ${addr.landmark}` : ''}
                        <br />
                        {addr.city} — {addr.pincode}
                        <br />
                        {addr.phone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(addr.id)}
                      className="shrink-0 text-[11px] font-medium uppercase leading-[1.2] tracking-[0.08em] text-muted underline underline-offset-2 hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'gift-cards' && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-line" aria-hidden="true">
              <rect x="3" y="8" width="18" height="12" rx="1" />
              <path d="M3 12h18" />
              <path d="M12 8v12" />
            </svg>
            <h2 className="font-display mt-5 text-[20px] font-medium leading-[1.1] text-ink sm:text-[24px]">E-Gift Cards are coming soon</h2>
            <p className="mt-2 max-w-xs text-[13px] leading-[1.6] text-muted">
              You&apos;ll soon be able to buy and redeem Norvik Jewels gift cards right here.
            </p>
          </div>
        )}

        {tab === 'faq' && (
          <div>
            <h2 className="font-display text-[20px] font-medium leading-[1.1] text-ink sm:text-[24px]">Frequently Asked Questions</h2>
            <div className="mt-5 divide-y divide-line border-y border-line">
              {[
                {
                  q: 'Do you offer free shipping?',
                  a: 'Yes — every order ships free and fully insured, anywhere in India.',
                },
                {
                  q: 'How do I find my ring size?',
                  a: 'Each ring’s product page has a size guide, and our support team can help you convert an existing ring or a printed size chart to the right fit.',
                },
                {
                  q: 'Are your diamonds certified?',
                  a: 'Yes, our diamonds are lab-grown and come with certification. Full grading details for each stone are listed on its product page.',
                },
                {
                  q: 'Can I return or exchange a piece?',
                  a: 'Reach out to our support team after delivery and we’ll help you with a return or exchange — full policy details are being finalised and will be posted here shortly.',
                },
              ].map((item) => (
                <FaqItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        )}

        {tab === 'privacy' && (
          <div>
            <h2 className="font-display text-[20px] font-medium leading-[1.1] text-ink sm:text-[24px]">Account Privacy</h2>
            <p className="mt-4 text-[13px] leading-[1.6] text-muted">Signed in as {email}</p>
            <p className="mt-4 max-w-md text-[13px] leading-[1.6] text-muted">
              We only use your information to process orders, deliveries, and account
              access. Read the full details in our{' '}
              <Link href="/policies/privacy" className="font-medium text-ink underline underline-offset-4 hover:text-antiquegold">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-[13.5px] font-medium leading-[1.4] text-ink sm:text-[14.5px]">{question}</span>
        <span className="shrink-0 text-lg leading-none text-charcoal">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="mt-2.5 text-[13px] leading-[1.6] text-muted">{answer}</p>}
    </div>
  );
}
