import { calculatePrice, TEST_GOLD_RATE_24K_PER_10G } from './pricing';

export type StockStatus =
  | 'In Stock'
  | 'Made to Order'
  | 'Only 1 left'
  | 'Only 2 left'
  | 'Only 3 left';

export type OptionChoice = {
  label: string;
  sublabel?: string;
  priceModifier: number;
  stock: StockStatus;
  metalColor?: 'yellow' | 'white' | 'rose'; // used to switch product image
};

export type DiamondConfig = {
  shapeOptions: OptionChoice[];
  cutOptions: OptionChoice[];
  caratOptions: OptionChoice[];
  certificationOptions: OptionChoice[];
};

export type Product = {
  slug: string;
  name: string;
  category: 'Rings' | 'Earrings' | 'Necklaces' | 'Nose Pin';
  images: string[];
  metalImages?: Record<string, string>; // maps metal color key -> image path
  basePrice: number;
  compareAtPrice?: number;
  currency: string;
  metalOptions: OptionChoice[];
  sizeOptions: OptionChoice[];
  diamond?: DiamondConfig;
  description: string;
  goldWeightGrams: number; // used in the Specifications price breakdown
  diamondPieceCount?: number;
  diamondCaratTotal?: number;
};

// ---------- Shared IGI-standard diamond grading ----------
// Client-confirmed rules (Aug 2026):
//  - IF (Internally Flawless) is excluded from the catalogue.
//  - Color availability depends on the selected Clarity grade (see
//    CLARITY_ALLOWED_COLORS below) — this mirrors real sourcing constraints.
//  - Cut is fully independent of Clarity/Color.

export const CLARITY_GRADES: { value: string; sublabel: string; priceModifier: number }[] = [
  { value: 'I1', sublabel: 'Included', priceModifier: -500 },
  { value: 'I2', sublabel: 'Included', priceModifier: -350 },
  { value: 'I3', sublabel: 'Included', priceModifier: -200 },
  { value: 'SI1', sublabel: 'Slightly Included', priceModifier: 0 },
  { value: 'SI2', sublabel: 'Slightly Included', priceModifier: 150 },
  { value: 'VS1', sublabel: 'Very Slightly Included', priceModifier: 350 },
  { value: 'VS2', sublabel: 'Very Slightly Included', priceModifier: 500 },
  { value: 'VVS1', sublabel: 'Very Very Slightly Included', priceModifier: 700 },
  { value: 'VVS2', sublabel: 'Very Very Slightly Included', priceModifier: 900 },
];

export const COLOR_GRADES: Record<string, { sublabel: string; priceModifier: number }> = {
  'D-F': { sublabel: 'Colorless', priceModifier: 900 },
  'G-J': { sublabel: 'Near Colorless', priceModifier: 400 },
  'K-M': { sublabel: 'Slightly Tinted', priceModifier: 100 },
  'N-R': { sublabel: 'Very Light', priceModifier: 0 },
  'S-Z': { sublabel: 'Light', priceModifier: -150 },
};

// Which colors are offered for each clarity grade — client-confirmed.
export const CLARITY_ALLOWED_COLORS: Record<string, string[]> = {
  I1: ['S-Z'],
  I2: ['S-Z'],
  I3: ['S-Z'],
  SI1: ['D-F', 'G-J', 'K-M', 'N-R', 'S-Z'],
  SI2: ['D-F', 'G-J', 'K-M', 'N-R', 'S-Z'],
  VS1: ['D-F', 'G-J', 'K-M', 'N-R', 'S-Z'],
  VS2: ['D-F', 'G-J', 'K-M', 'N-R', 'S-Z'],
  VVS1: ['D-F', 'G-J'],
  VVS2: ['D-F', 'G-J'],
};

function stockForClarityColor(clarity: string, color: string): StockStatus {
  if (clarity.startsWith('I')) return 'In Stock';
  if (clarity.startsWith('SI')) return 'In Stock';
  if (clarity.startsWith('VS')) return color === 'D-F' ? 'Only 2 left' : 'Made to Order';
  return color === 'D-F' ? 'Only 1 left' : 'Made to Order'; // VVS tiers
}

export function stockFor(clarity: string, color: string): StockStatus {
  return stockForClarityColor(clarity, color);
}

// Approximate % price impact per diamond quality tier — placeholder values,
// pending exact percentages from client (see Color/Clarity/Cut variable
// charge confirmation in the pricing formula PDF).
export const COLOR_CHARGE_PERCENT: Record<string, number> = {
  'D-F': 8,
  'G-J': 4,
  'K-M': 1,
  'N-R': 0,
  'S-Z': -3,
};

function extractKaratFromLabel(metalLabel: string): 9 | 14 | 18 {
  const match = metalLabel.match(/^(\d+)/);
  const num = match ? parseInt(match[1], 10) : 18;
  if (num === 9 || num === 14 || num === 18) return num;
  return 18;
}

// ---------- Single source of truth for every price shown on the site ----------
// Runs the same pricing engine (lib/pricing.ts) that the product detail page
// uses, evaluated at each product's default configuration (first metal
// option, base gold weight, default D-F diamond quality where applicable).
// Home, Shop, Search, and Wishlist all call this instead of a hardcoded
// number, so a price never has to be updated by hand in more than one place
// and can never drift from what the customer sees on the product page.
export function getDisplayPrice(product: Product): number {
  const karat = extractKaratFromLabel(product.metalOptions[0]?.label ?? '18K');
  const hasDiamond = Boolean(product.diamond) && (product.diamondCaratTotal ?? 0) > 0;
  const colorChargePercent = hasDiamond ? COLOR_CHARGE_PERCENT['D-F'] ?? 0 : 0;

  const pricing = calculatePrice({
    goldRate24kPer10g: TEST_GOLD_RATE_24K_PER_10G,
    desiredKarat: karat,
    goldWeightGrams: product.goldWeightGrams,
    makingChargePercent: 12, // placeholder — pending client confirmation (matches product-configurator.tsx)
    diamondCaratRequired: product.diamondCaratTotal ?? 0,
    diamondBaseRatePerCarat: 100000, // placeholder — pending client confirmation
    colorChargePercent,
    clarityChargePercent: 0,
    cutChargePercent: 0,
    gstPercent: 3,
  });

  // Same rounding order as product-configurator.tsx, so a listing price and
  // the detail-page price for the same default config always match exactly.
  const goldValue = Math.round(pricing.goldValue);
  const diamondCharge = Math.round(pricing.diamondCharge);
  const makingCharge = Math.round(pricing.makingCharge);
  const subtotal = goldValue + diamondCharge + makingCharge;
  const gstAmount = Math.round(subtotal * 0.03);
  return subtotal + gstAmount;
}

const DIAMOND_SHAPES: OptionChoice[] = [
  { label: 'Round', priceModifier: 0, stock: 'In Stock' },
  { label: 'Emerald', priceModifier: 0, stock: 'Made to Order' },
  { label: 'Marquise', priceModifier: 0, stock: 'Made to Order' },
  { label: 'Heart', priceModifier: 0, stock: 'Made to Order' },
  { label: 'Pear', priceModifier: 0, stock: 'Made to Order' },
  { label: 'Cushion', priceModifier: 0, stock: 'Made to Order' },
  { label: 'Radiant', priceModifier: 0, stock: 'Made to Order' },
  { label: 'Oval', priceModifier: 0, stock: 'Made to Order' },
  { label: 'Princess', priceModifier: 0, stock: 'Made to Order' },
];

const DIAMOND_CUTS: OptionChoice[] = [
  { label: 'Excellent', priceModifier: 200, stock: 'Made to Order' },
  { label: 'Very Good', priceModifier: 100, stock: 'In Stock' },
  { label: 'Good', priceModifier: 0, stock: 'In Stock' },
];

const DIAMOND_CERTIFICATIONS: OptionChoice[] = [
  { label: 'IGI', priceModifier: 0, stock: 'In Stock' },
  { label: 'GIA', priceModifier: 300, stock: 'Made to Order' },
  { label: 'Uncertified', priceModifier: -400, stock: 'In Stock' },
];

const CARAT_TABLE: { ct: string; mm: string; modifier: number }[] = [
  { ct: '0.05', mm: '2.5 mm', modifier: -1500 },
  { ct: '0.10', mm: '3.0 mm', modifier: -1200 },
  { ct: '0.20', mm: '3.8 mm', modifier: -900 },
  { ct: '0.25', mm: '4.1 mm', modifier: -700 },
  { ct: '0.30', mm: '4.5 mm', modifier: -500 },
  { ct: '0.40', mm: '4.8 mm', modifier: -300 },
  { ct: '0.50', mm: '5.2 mm', modifier: 0 },
  { ct: '0.70', mm: '5.8 mm', modifier: 600 },
  { ct: '0.90', mm: '6.3 mm', modifier: 1400 },
  { ct: '1.00', mm: '6.5 mm', modifier: 1800 },
  { ct: '1.25', mm: '6.9 mm', modifier: 2800 },
  { ct: '1.50', mm: '7.4 mm', modifier: 4000 },
  { ct: '1.75', mm: '7.8 mm', modifier: 5500 },
  { ct: '2.00', mm: '8.2 mm', modifier: 7200 },
  { ct: '2.50', mm: '8.8 mm', modifier: 11000 },
  { ct: '3.00', mm: '9.4 mm', modifier: 15500 },
];

function caratOptionsInRange(minCt: string, maxCt: string): OptionChoice[] {
  const all = CARAT_TABLE.map((c) => c.ct);
  const start = all.indexOf(minCt);
  const end = all.indexOf(maxCt);
  return CARAT_TABLE.slice(start, end + 1).map((c) => ({
    label: `${c.ct} ct`,
    sublabel: c.mm,
    priceModifier: c.modifier,
    stock: 'Made to Order' as const,
  }));
}

function buildDiamondConfig(minCt: string, maxCt: string): DiamondConfig {
  return {
    shapeOptions: DIAMOND_SHAPES,
    cutOptions: DIAMOND_CUTS,
    caratOptions: caratOptionsInRange(minCt, maxCt),
    certificationOptions: DIAMOND_CERTIFICATIONS,
  };
}

// ---------- Placeholder product catalogue ----------
export const products: Product[] = [
  {
    slug: 'halo-diamond-ring',
    name: 'Halo Diamond Ring',
    category: 'Rings',
    images: ['/images/ring-yellow-gold.jpg', '/images/ring-white-gold.jpg', '/images/ring-rose-gold.jpg'],
    metalImages: {
      yellow: '/images/ring-yellow-gold.jpg',
      white: '/images/ring-white-gold.jpg',
      rose: '/images/ring-rose-gold.jpg',
    },
    basePrice: 111550,
    compareAtPrice: 122000,
    currency: '₹',
    description:
      'A round brilliant centre stone encircled by a halo of pavé diamonds, set on a delicate band — designed to catch light from every angle.',
    metalOptions: [
      { label: '18 KT Rose Gold', priceModifier: 0, stock: 'In Stock', metalColor: 'rose' },
      { label: '18 KT Yellow Gold', priceModifier: 0, stock: 'Only 1 left', metalColor: 'yellow' },
      { label: '18 KT White Gold', priceModifier: 0, stock: 'Made to Order', metalColor: 'white' },
      { label: '14 KT Yellow Gold', priceModifier: 0, stock: 'Made to Order', metalColor: 'yellow' },
    ],
    sizeOptions: [
      { label: '5', sublabel: '44.8 mm', priceModifier: 0, stock: 'Only 1 left' },
      { label: '6', sublabel: '45.9 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '7', sublabel: '47.1 mm', priceModifier: 0, stock: 'Only 3 left' },
      { label: '8', sublabel: '48.1 mm', priceModifier: 0, stock: 'Only 1 left' },
      { label: '9', sublabel: '49.0 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '10', sublabel: '50.0 mm', priceModifier: 0, stock: 'Only 1 left' },
      { label: '11', sublabel: '50.9 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '12', sublabel: '51.8 mm', priceModifier: 0, stock: 'In Stock' },
      { label: '13', sublabel: '52.8 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '14', sublabel: '54.0 mm', priceModifier: 0, stock: 'In Stock' },
      { label: '15', sublabel: '55.0 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '16', sublabel: '55.9 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '17', sublabel: '56.9 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '18', sublabel: '57.8 mm', priceModifier: 0, stock: 'Only 1 left' },
      { label: '19', sublabel: '59.1 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '20', sublabel: '60.0 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '21', sublabel: '60.9 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '22', sublabel: '61.9 mm', priceModifier: 0, stock: 'Only 1 left' },
      { label: '23', sublabel: '62.8 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '24', sublabel: '63.8 mm', priceModifier: 0, stock: 'Made to Order' },
      { label: '25', sublabel: '64.7 mm', priceModifier: 0, stock: 'Made to Order' },
    ],
    diamond: buildDiamondConfig('0.30', '1.50'),
    goldWeightGrams: 2.8,
    diamondPieceCount: 12,
    diamondCaratTotal: 0.35,
  },
  {
    slug: 'solitaire-band',
    name: 'Solitaire Band',
    category: 'Rings',
    images: ['/images/product-ring-1.jpg', '/images/product-ring-2.jpg'],
    basePrice: 73500,
    currency: '₹',
    description:
      'A single brilliant-cut diamond on a clean, tapered band — a quiet, everyday classic.',
    metalOptions: [
      { label: '14 KT Yellow Gold', priceModifier: 0, stock: 'In Stock' },
      { label: '18 KT White Gold', priceModifier: 300, stock: 'Made to Order' },
      { label: '9 KT Rose Gold', priceModifier: -150, stock: 'In Stock' },
    ],
    sizeOptions: [
      { label: '5', sublabel: '44.8 mm', priceModifier: 0, stock: 'In Stock' },
      { label: '6', sublabel: '45.9 mm', priceModifier: 0, stock: 'In Stock' },
      { label: '7', sublabel: '47.1 mm', priceModifier: 0, stock: 'Made to Order' },
    ],
    diamond: buildDiamondConfig('0.20', '1.00'),
    goldWeightGrams: 2.2,
    diamondPieceCount: 1,
    diamondCaratTotal: 0.3,
  },
  {
    slug: 'floral-diamond-stud',
    name: 'Floral Diamond Stud',
    category: 'Earrings',
    images: ['/images/product-earring-1.jpg', '/images/product-earring-2.jpg'],
    basePrice: 48200,
    currency: '₹',
    description:
      'A cluster of round diamonds arranged in a floral silhouette, secured with a screw-back for everyday, secure wear.',
    metalOptions: [
      { label: '18 KT Yellow Gold', priceModifier: 0, stock: 'In Stock' },
      { label: '18 KT White Gold', priceModifier: 150, stock: 'Made to Order' },
    ],
    sizeOptions: [{ label: 'One Size', priceModifier: 0, stock: 'In Stock' }],
    diamond: buildDiamondConfig('0.05', '0.40'),
    goldWeightGrams: 1.5,
    diamondPieceCount: 10,
    diamondCaratTotal: 0.18,
  },
  {
    slug: 'classic-gold-hoop',
    name: 'Classic Gold Hoop',
    category: 'Earrings',
    images: ['/images/product-earring-2.jpg', '/images/product-earring-3.jpg'],
    basePrice: 37900,
    currency: '₹',
    description:
      'A polished, everyday hoop in solid gold — lightweight enough for daily wear. No stones, so it\u2019s a metal-only configuration.',
    metalOptions: [
      { label: '14 KT Yellow Gold', priceModifier: 0, stock: 'In Stock' },
      { label: '18 KT Yellow Gold', priceModifier: 220, stock: 'In Stock' },
      { label: '9 KT Rose Gold', priceModifier: -100, stock: 'Made to Order' },
    ],
    sizeOptions: [
      { label: 'Small', sublabel: '12 mm', priceModifier: 0, stock: 'In Stock' },
      { label: 'Medium', sublabel: '18 mm', priceModifier: 0, stock: 'In Stock' },
      { label: 'Large', sublabel: '24 mm', priceModifier: 0, stock: 'Made to Order' },
    ],
    goldWeightGrams: 3.0,
  },
  {
    slug: 'signature-stud-back',
    name: 'Signature Stud Back',
    category: 'Earrings',
    images: ['/images/product-earring-3.jpg', '/images/product-earring-1.jpg'],
    basePrice: 44800,
    currency: '₹',
    description:
      'Norvik Jewels\u2019 signature stud, finished with a secure screw-back closure.',
    metalOptions: [
      { label: '18 KT Yellow Gold', priceModifier: 0, stock: 'In Stock' },
      { label: '18 KT White Gold', priceModifier: 180, stock: 'Only 1 left' },
    ],
    sizeOptions: [{ label: 'One Size', priceModifier: 0, stock: 'In Stock' }],
    diamond: buildDiamondConfig('0.05', '0.50'),
    goldWeightGrams: 1.8,
    diamondPieceCount: 8,
    diamondCaratTotal: 0.15,
  },
  {
    slug: 'flower-stud-earring',
    name: 'Flower Stud Earring',
    category: 'Earrings',
    images: [
      '/images/flower-earring-yellow.jpg',
      '/images/flower-earring-yellow-side.jpg',
      '/images/flower-earring-white.jpg',
      '/images/flower-earring-white-side.jpg',
      '/images/flower-earring-rose.jpg',
      '/images/flower-earring-rose-side.jpg',
    ],
    metalImages: {
      yellow: '/images/flower-earring-yellow.jpg',
      white: '/images/flower-earring-white.jpg',
      rose: '/images/flower-earring-rose.jpg',
    },
    basePrice: 52000,
    currency: '₹',
    description:
      'A lotus-inspired stud with a diamond halo center, finished with a secure screw-back closure.',
    metalOptions: [
      { label: '18 KT Yellow Gold', priceModifier: 0, stock: 'In Stock', metalColor: 'yellow' },
      { label: '18 KT White Gold', priceModifier: 400, stock: 'Made to Order', metalColor: 'white' },
      { label: '18 KT Rose Gold', priceModifier: 200, stock: 'In Stock', metalColor: 'rose' },
    ],
    sizeOptions: [{ label: 'One Size', priceModifier: 0, stock: 'In Stock' }],
    diamond: buildDiamondConfig('0.05', '0.40'),
    goldWeightGrams: 2.0,
    diamondPieceCount: 22,
    diamondCaratTotal: 0.2,
  },
  {
    slug: 'trillion-diamond-stud',
    name: 'Trillion Diamond Stud',
    category: 'Earrings',
    images: [
      '/images/trillion-stud-yellow.jpg',
      '/images/trillion-stud-white.jpg',
      '/images/trillion-stud-rose.jpg',
    ],
    metalImages: {
      yellow: '/images/trillion-stud-yellow.jpg',
      white: '/images/trillion-stud-white.jpg',
      rose: '/images/trillion-stud-rose.jpg',
    },
    basePrice: 46000,
    currency: '₹',
    description:
      'A trillion-cut silhouette framed in a diamond border, with a single brilliant stone suspended at the center.',
    metalOptions: [
      { label: '18 KT Yellow Gold', priceModifier: 0, stock: 'In Stock', metalColor: 'yellow' },
      { label: '18 KT White Gold', priceModifier: 350, stock: 'Made to Order', metalColor: 'white' },
      { label: '18 KT Rose Gold', priceModifier: 150, stock: 'Only 2 left', metalColor: 'rose' },
    ],
    sizeOptions: [{ label: 'One Size', priceModifier: 0, stock: 'In Stock' }],
    diamond: buildDiamondConfig('0.05', '0.40'),
    goldWeightGrams: 1.6,
    diamondPieceCount: 33,
    diamondCaratTotal: 0.22,
  },
  {
    slug: 'swan-pendant-classic',
    name: 'Swan Pendant Necklace — Classic',
    category: 'Necklaces',
    images: [
      '/images/swan-pendant-a-white.jpg',
      '/images/swan-pendant-a-yellow.jpg',
      '/images/swan-pendant-a-rose.jpg',
    ],
    metalImages: {
      yellow: '/images/swan-pendant-a-yellow.jpg',
      white: '/images/swan-pendant-a-white.jpg',
      rose: '/images/swan-pendant-a-rose.jpg',
    },
    basePrice: 68000,
    currency: '₹',
    description:
      'A graceful swan silhouette in gold, wrapped in a fan of marquise-cut red stones and diamond accents.',
    metalOptions: [
      { label: '18 KT White Gold', priceModifier: 0, stock: 'In Stock', metalColor: 'white' },
      { label: '18 KT Yellow Gold', priceModifier: 300, stock: 'In Stock', metalColor: 'yellow' },
      { label: '18 KT Rose Gold', priceModifier: 300, stock: 'Made to Order', metalColor: 'rose' },
    ],
    sizeOptions: [{ label: 'One Size', priceModifier: 0, stock: 'In Stock' }],
    goldWeightGrams: 3.2,
  },
  {
    slug: 'swan-pendant-signature',
    name: 'Swan Pendant Necklace — Signature',
    category: 'Necklaces',
    images: [
      '/images/swan-pendant-b-rose.jpg',
      '/images/swan-pendant-b-yellow.jpg',
      '/images/swan-pendant-b-white.jpg',
    ],
    metalImages: {
      yellow: '/images/swan-pendant-b-yellow.jpg',
      white: '/images/swan-pendant-b-white.jpg',
      rose: '/images/swan-pendant-b-rose.jpg',
    },
    basePrice: 72000,
    currency: '₹',
    description:
      'An asymmetric double-swan design, richly set with marquise red stones and diamond leaf accents.',
    metalOptions: [
      { label: '18 KT Rose Gold', priceModifier: 0, stock: 'In Stock', metalColor: 'rose' },
      { label: '18 KT Yellow Gold', priceModifier: 300, stock: 'In Stock', metalColor: 'yellow' },
      { label: '18 KT White Gold', priceModifier: 300, stock: 'Made to Order', metalColor: 'white' },
    ],
    sizeOptions: [{ label: 'One Size', priceModifier: 0, stock: 'In Stock' }],
    goldWeightGrams: 3.5,
  },
  {
    slug: 'flower-cluster-nose-pin',
    name: 'Flower Cluster Nose Pin',
    category: 'Nose Pin',
    images: [
      '/images/nose-pin-yellow.jpg',
      '/images/nose-pin-yellow-side.jpg',
      '/images/nose-pin-white.jpg',
      '/images/nose-pin-white-side.jpg',
      '/images/nose-pin-rose.jpg',
      '/images/nose-pin-rose-side.jpg',
    ],
    metalImages: {
      yellow: '/images/nose-pin-yellow.jpg',
      white: '/images/nose-pin-white.jpg',
      rose: '/images/nose-pin-rose.jpg',
    },
    basePrice: 18500,
    currency: '₹',
    description:
      'A delicate clover-leaf nose pin with a 4-diamond cluster, finished with an adjustable wire post.',
    metalOptions: [
      { label: '18 KT Yellow Gold', priceModifier: 0, stock: 'In Stock', metalColor: 'yellow' },
      { label: '18 KT White Gold', priceModifier: 250, stock: 'Made to Order', metalColor: 'white' },
      { label: '18 KT Rose Gold', priceModifier: 150, stock: 'In Stock', metalColor: 'rose' },
    ],
    sizeOptions: [{ label: 'One Size', priceModifier: 0, stock: 'In Stock' }],
    goldWeightGrams: 0.8,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}