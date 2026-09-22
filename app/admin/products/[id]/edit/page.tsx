import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm, { type ProductFormValue } from '../../product-form';

type MetalOption = { label: string; metalColor?: string };

function deriveMetalKeys(metalOptions: MetalOption[] | null): string[] {
  if (!metalOptions) return [];
  const keys: string[] = [];
  for (const opt of metalOptions) {
    const karatMatch = opt.label.match(/^(\d+)/);
    if (karatMatch && opt.metalColor) {
      keys.push(`${karatMatch[1]}-${opt.metalColor}`);
    }
  }
  return keys;
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', params.id).maybeSingle();

  if (!product) notFound();

  const sizeOptions = (product.size_options ?? []) as { label: string }[];
  const isOneSize = sizeOptions.length === 1 && sizeOptions[0]?.label === 'One Size';

  const initial: ProductFormValue = {
    id: product.id,
    name: product.name ?? '',
    slug: product.slug ?? '',
    category: product.category ?? 'Rings',
    sku: product.sku ?? '',
    norvik_sku: product.norvik_sku ?? '',
    description: product.description ?? '',
    images: (product.images ?? []) as string[],
    metal_images: (product.metal_images ?? null) as Record<string, string> | null,
    gold_weight_grams: Number(product.gold_weight_grams ?? 0),
    diamond_piece_count: product.diamond_piece_count ?? null,
    diamond_carat_total: product.diamond_carat_total ?? null,
    metal_option_keys: deriveMetalKeys(product.metal_options),
    size_mode: isOneSize ? 'one' : 'ring-run',
    is_signature: Boolean(product.is_signature),
    status: product.status ?? 'draft',
  };

  return <ProductForm initial={initial} />;
}
