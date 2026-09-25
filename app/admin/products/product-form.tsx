'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { calculatePrice, TEST_GOLD_RATE_24K_PER_10G } from '@/lib/pricing';

export const CATEGORIES = [
  'Rings',
  'Earrings',
  'Pendants',
  'Pendant Set',
  'Nose Pin',
  'Baby Earrings',
  'Tanmaniya',
  'Bracelet',
] as const;

const KARATS = [18, 14, 9] as const;
const COLORS: { key: 'yellow' | 'white' | 'rose'; label: string }[] = [
  { key: 'yellow', label: 'Yellow Gold' },
  { key: 'white', label: 'White Gold' },
  { key: 'rose', label: 'Rose Gold' },
];

// Same run used by the existing "Halo Diamond Ring" — kept as one source of
// truth would be nicer, but lib/mock-products.ts doesn't export it, and
// duplicating this static reference table here is simpler than reaching
// into that file's internals.
const STANDARD_RING_SIZES = [
  ['5', '44.8 mm'], ['6', '45.9 mm'], ['7', '47.1 mm'], ['8', '48.1 mm'],
  ['9', '49.0 mm'], ['10', '50.0 mm'], ['11', '50.9 mm'], ['12', '51.8 mm'],
  ['13', '52.8 mm'], ['14', '54.0 mm'], ['15', '55.0 mm'], ['16', '55.9 mm'],
  ['17', '56.9 mm'], ['18', '57.8 mm'], ['19', '59.1 mm'], ['20', '60.0 mm'],
  ['21', '60.9 mm'], ['22', '61.9 mm'], ['23', '62.8 mm'], ['24', '63.8 mm'],
  ['25', '64.7 mm'],
] as const;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export type ProductFormValue = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  sku: string;
  norvik_sku: string;
  description: string;
  images: string[];
  metal_images: Record<string, string> | null;
  gold_weight_grams: number;
  diamond_piece_count: number | null;
  diamond_carat_total: number | null;
  metal_option_keys: string[]; // e.g. "18-yellow"
  size_mode: 'one' | 'ring-run';
  is_signature: boolean;
  status: 'draft' | 'published';
};

export const emptyProductForm: ProductFormValue = {
  name: '',
  slug: '',
  category: 'Rings',
  sku: '',
  norvik_sku: '',
  description: '',
  images: [],
  metal_images: null,
  gold_weight_grams: 0,
  diamond_piece_count: null,
  diamond_carat_total: null,
  metal_option_keys: ['18-yellow', '18-white', '18-rose'],
  size_mode: 'ring-run',
  is_signature: false,
  status: 'draft',
};

export function buildMetalOptions(keys: string[]) {
  return KARATS.flatMap((karat) =>
    COLORS.filter((c) => keys.includes(`${karat}-${c.key}`)).map((c) => ({
      label: `${karat} KT ${c.label}`,
      priceModifier: 0,
      stock: 'Made to Order' as const,
      metalColor: c.key,
    }))
  );
}

export function buildSizeOptions(mode: 'one' | 'ring-run') {
  if (mode === 'one') {
    return [{ label: 'One Size', priceModifier: 0, stock: 'In Stock' as const }];
  }
  return STANDARD_RING_SIZES.map(([label, sublabel]) => ({
    label,
    sublabel,
    priceModifier: 0,
    stock: 'Made to Order' as const,
  }));
}

export function computeBasePrice(v: ProductFormValue): number {
  const metalOptions = buildMetalOptions(v.metal_option_keys);
  const firstKarat = metalOptions[0]?.label.match(/^(\d+)/)?.[1];
  const karat = firstKarat === '9' || firstKarat === '14' ? Number(firstKarat) : 18;

  const pricing = calculatePrice({
    goldRate24kPer10g: TEST_GOLD_RATE_24K_PER_10G,
    desiredKarat: karat as 9 | 14 | 18,
    goldWeightGrams: v.gold_weight_grams,
    makingChargePercent: 12, // placeholder — same one used sitewide, see lib/pricing.ts
    diamondCaratRequired: v.diamond_carat_total ?? 0,
    diamondBaseRatePerCarat: 100000, // placeholder — same one used sitewide
    colorChargePercent: 0,
    clarityChargePercent: 0,
    cutChargePercent: 0,
    gstPercent: 3,
  });

  const goldValue = Math.round(pricing.goldValue);
  const diamondCharge = Math.round(pricing.diamondCharge);
  const makingCharge = Math.round(pricing.makingCharge);
  const subtotal = goldValue + diamondCharge + makingCharge;
  const gstAmount = Math.round(subtotal * 0.03);
  return subtotal + gstAmount;
}

export default function ProductForm({ initial }: { initial: ProductFormValue }) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValue>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [imagesText, setImagesText] = useState(initial.images.join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimatedPrice = useMemo(() => computeBasePrice(v), [v]);

  function update<K extends keyof ProductFormValue>(key: K, value: ProductFormValue[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMetalKey(key: string) {
    setV((prev) => ({
      ...prev,
      metal_option_keys: prev.metal_option_keys.includes(key)
        ? prev.metal_option_keys.filter((k) => k !== key)
        : [...prev.metal_option_keys, key],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!v.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (v.metal_option_keys.length === 0) {
      setError('Select at least one metal option.');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const images = imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const metalOptions = buildMetalOptions(v.metal_option_keys);
    const metalImages: Record<string, string> = {};
    const existingMetalImages = v.metal_images ?? {};
    for (const opt of metalOptions) {
      if (!opt.metalColor) continue;
      const existingUrl = existingMetalImages[opt.metalColor];
      if (existingUrl && images.includes(existingUrl)) {
        // Preserve a real per-color photo (set by the bulk photo importer,
        // or a previous manual edit) as long as that exact URL is still in
        // the Images field below — saving the form (e.g. just to fix a typo
        // in the name) must not silently wipe out per-color photos back to
        // "same image for every color".
        metalImages[opt.metalColor] = existingUrl;
      } else if (images.length > 0 && !metalImages[opt.metalColor]) {
        // Best-effort default — first image goes to any color that doesn't
        // already have its own photo, until real per-color photos are added.
        metalImages[opt.metalColor] = images[0];
      }
    }

    const payload = {
      name: v.name.trim(),
      slug: v.slug.trim() || slugify(v.name),
      category: v.category,
      sku: v.sku.trim() || null,
      norvik_sku: v.norvik_sku.trim() || null,
      description: v.description.trim(),
      images,
      metal_images: Object.keys(metalImages).length > 0 ? metalImages : null,
      metal_options: metalOptions,
      size_options: buildSizeOptions(v.size_mode),
      diamond: null, // fixed/pavé designs — see product-specifications.tsx comment
      gold_weight_grams: v.gold_weight_grams,
      diamond_piece_count: v.diamond_piece_count,
      diamond_carat_total: v.diamond_carat_total,
      base_price: computeBasePrice(v),
      currency: '₹',
      is_signature: v.is_signature,
      status: v.status,
    };

    const result = v.id
      ? await supabase.from('products').update(payload).eq('id', v.id)
      : await supabase.from('products').insert(payload);

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    router.push('/admin/products');
    router.refresh();
  }

  async function handleDelete() {
    if (!v.id) return;
    if (!confirm(`Delete "${v.name}"? This can't be undone.`)) return;
    const supabase = createClient();
    const { error: delError } = await supabase.from('products').delete().eq('id', v.id);
    if (delError) {
      setError(delError.message);
      return;
    }
    router.push('/admin/products');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <div>
        <h1 className="font-display text-2xl text-ink">{v.id ? 'Edit product' : 'New product'}</h1>
      </div>

      {error && (
        <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="space-y-4">
        <Field label="Name">
          <input
            className="input"
            value={v.name}
            onChange={(e) => {
              update('name', e.target.value);
              if (!slugTouched) update('slug', slugify(e.target.value));
            }}
          />
        </Field>

        <Field label="URL slug">
          <input
            className="input"
            value={v.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update('slug', e.target.value);
            }}
          />
        </Field>

        <Field label="Category">
          <select className="input" value={v.category} onChange={(e) => update('category', e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Manufacturer SKU">
            <input className="input" value={v.sku} onChange={(e) => update('sku', e.target.value)} placeholder="e.g. M-165" />
          </Field>
          <Field label="Norvik SKU">
            <input
              className="input"
              value={v.norvik_sku}
              onChange={(e) => update('norvik_sku', e.target.value)}
              placeholder="e.g. ILR-0165"
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            className="input min-h-[90px]"
            value={v.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </Field>

        <Field label="Image URLs (one per line)">
          <textarea
            className="input min-h-[90px] font-mono text-[12px]"
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            placeholder={'/images/products/ilr-0165-yellow-1.jpg\n/images/products/ilr-0165-white-1.jpg'}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Gold weight (g)">
            <input
              type="number"
              step="0.01"
              className="input"
              value={v.gold_weight_grams}
              onChange={(e) => update('gold_weight_grams', Number(e.target.value))}
            />
          </Field>
          <Field label="Diamond pieces">
            <input
              type="number"
              className="input"
              value={v.diamond_piece_count ?? ''}
              onChange={(e) => update('diamond_piece_count', e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
          <Field label="Diamond carat total">
            <input
              type="number"
              step="0.01"
              className="input"
              value={v.diamond_carat_total ?? ''}
              onChange={(e) => update('diamond_carat_total', e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
        </div>

        <Field label="Metal options">
          <div className="overflow-hidden border border-line">
            <table className="w-full text-center text-[13px]">
              <thead className="bg-softwhite">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted">Karat</th>
                  {COLORS.map((c) => (
                    <th key={c.key} className="px-3 py-2 font-medium text-muted">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {KARATS.map((k) => (
                  <tr key={k}>
                    <td className="px-3 py-2 text-left font-medium text-ink">{k} KT</td>
                    {COLORS.map((c) => {
                      const key = `${k}-${c.key}`;
                      return (
                        <td key={key} className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={v.metal_option_keys.includes(key)}
                            onChange={() => toggleMetalKey(key)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Field>

        <Field label="Sizes">
          <div className="flex gap-6 text-[13px] text-ink">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={v.size_mode === 'one'}
                onChange={() => update('size_mode', 'one')}
              />
              One Size
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={v.size_mode === 'ring-run'}
                onChange={() => update('size_mode', 'ring-run')}
              />
              Ring sizes (5–25)
            </label>
          </div>
        </Field>

        <label className="flex items-center gap-2 text-[13px] text-ink">
          <input type="checkbox" checked={v.is_signature} onChange={(e) => update('is_signature', e.target.checked)} />
          Feature in homepage Signature Collection
        </label>

        <Field label="Status">
          <select className="input" value={v.status} onChange={(e) => update('status', e.target.value as 'draft' | 'published')}>
            <option value="draft">Draft (not visible on the site)</option>
            <option value="published">Published (live on the site)</option>
          </select>
        </Field>

        <p className="text-[13px] text-charcoal">
          Estimated display price at default configuration: <strong>₹{estimatedPrice.toLocaleString('en-IN')}</strong>
          {' '}(uses the site&apos;s shared placeholder gold/diamond rates — see lib/pricing.ts)
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-antiquegold px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-softwhite disabled:opacity-50"
        >
          {saving ? 'Saving…' : v.id ? 'Save changes' : 'Create product'}
        </button>
        {v.id && (
          <button type="button" onClick={handleDelete} className="text-[13px] text-red-700 underline underline-offset-4">
            Delete product
          </button>
        )}
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e2ddd3;
          padding: 0.5rem 0.75rem;
          font-size: 13px;
          background: white;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-antiquegold">{label}</span>
      {children}
    </label>
  );
}
