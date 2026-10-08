export interface BulkPricingTier {
  range: string
  tshirt: number
  polo: number
  jersey: number
  hoodie: number
}

export interface ApparelPriceItem {
  id: 'tshirt' | 'hoodie' | 'jersey' | 'polo'
  name: string
  bulkStartingPrice: number
  personalPrice: number
  fabric: string
  moqBulk: number
  moqPersonal: number
}

export const APPAREL_PRICING_CATALOG: ApparelPriceItem[] = [
  {
    id: 'tshirt',
    name: 'T-Shirts',
    bulkStartingPrice: 170,
    personalPrice: 399,
    fabric: '100% Combed Ringspun Cotton (220 GSM)',
    moqBulk: 25,
    moqPersonal: 1,
  },
  {
    id: 'polo',
    name: 'Polo Shirts',
    bulkStartingPrice: 370,
    personalPrice: 499,
    fabric: 'Matty & Pique Cotton Blend (240 GSM)',
    moqBulk: 25,
    moqPersonal: 1,
  },
  {
    id: 'jersey',
    name: 'Jerseys',
    bulkStartingPrice: 350,
    personalPrice: 549,
    fabric: 'Moisture-Wicking Athletic Mesh (180 GSM)',
    moqBulk: 25,
    moqPersonal: 1,
  },
  {
    id: 'hoodie',
    name: 'Hoodies',
    bulkStartingPrice: 680,
    personalPrice: 899,
    fabric: 'Heavyweight Boxy Fleece (450 GSM)',
    moqBulk: 25,
    moqPersonal: 1,
  },
]

export const BULK_CUSTOM_CONFIG = {
  title: 'Bulk Custom Apparel',
  badge: 'BEST FOR TEAMS & ORGS',
  subtitle: 'Custom apparel made for teams, events, businesses and organizations.',
  priceLabel: 'From ₹170 / piece',
  priceNote: 'Better per-piece pricing with volume discounts',
  moqText: 'Minimum Order: 25 Pieces',
  primaryCtaText: 'Build Bulk Order',
  targetAudience: [
    'College Teams',
    'College Fests',
    'Startups & Companies',
    'Sports Teams',
    'Clubs & Societies',
    'Event Merchandise',
  ],
  benefits: [
    'Custom design & front/back branding',
    'Better per-piece pricing for large orders',
    'Multiple sizes (S–XXL) & styles in one order',
    'Team & organization logo application',
    'Production support & physical sample proofing',
    'Dedicated order assistance from KALA specialists',
  ],
}

export const PERSONAL_CUSTOM_CONFIG = {
  title: 'Personal Custom Apparel',
  badge: 'BEST FOR INDIVIDUALS',
  subtitle: 'Have your own design? Get custom apparel without a bulk order.',
  priceLabel: 'From ₹399 / piece',
  priceNote: 'Flexible small-quantity ordering',
  moqText: 'No Minimum Order (1+ Pcs)',
  designFeeText: '₹0 Design Fee — You provide the artwork',
  primaryCtaText: 'Buy Now',
  targetAudience: [
    'Individual Customers',
    'Friends & Duos',
    'Couples',
    'Small Creator Drops',
    'Personal Artwork',
    'Custom Gifts',
  ],
  benefits: [
    'Customer provides their own design',
    'Zero design fee — KALA does not charge for your design',
    'Order 1 to 24 pieces without minimum quantity hurdles',
    'High-definition DTF & vibrant print transfer',
    'Standard e-commerce checkout with tracking',
    'Direct doorstep delivery across India',
  ],
}

export const COMPARISON_FEATURES = [
  {
    feature: 'Best For',
    bulk: 'Teams, Events, Colleges & Organizations',
    personal: 'Individuals, Friends, Couples & Small Groups',
  },
  {
    feature: 'Order Quantity',
    bulk: 'Minimum 25 pieces (scales to 500+)',
    personal: '1+ pieces (No minimum order required)',
  },
  {
    feature: 'Pricing Model',
    bulk: 'Better per-piece pricing (from ₹170/pc)',
    personal: 'Flexible small-quantity ordering (from ₹399/pc)',
  },
  {
    feature: 'Design Fee',
    bulk: 'Free consultation & artwork preparation',
    personal: '₹0 Design Fee (Customer brings own design)',
  },
  {
    feature: 'Available Apparel',
    bulk: 'T-Shirts, Polos, Jerseys, Hoodies & Custom blanks',
    personal: 'T-Shirts, Hoodies, Jerseys & Polos',
  },
  {
    feature: 'How to Order',
    bulk: 'Configure in live builder & request official quote',
    personal: 'Upload artwork, choose size & Buy Now directly',
  },
]
