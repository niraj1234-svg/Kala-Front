import type {
  Category as AppralCategory,
  ProductDetail as AppralProductDetail,
  Cart as AppralCart,
  WishlistItem as AppralWishlistItem,
  RecentlyViewedItem as AppralRecentlyViewedItem,
} from './appral';

import type { UserProfile, AuthTokens } from './auth';

import type {
  AdminUser,
} from './admin';

const STORAGE_KEYS = {
  PRODUCTS: 'appral_mock_products',
  CATEGORIES: 'appral_mock_categories',
  CART: 'appral_mock_cart',
  WISHLIST: 'appral_mock_wishlist',
  RECENTLY_VIEWED: 'appral_mock_recent',
  USERS: 'appral_mock_users',
  CURRENT_USER: 'appral_mock_current_user',
};

export const INITIAL_CATEGORIES: AppralCategory[] = [
  {
    id: 1,
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Heavyweight jackets, utility parkas, and architectural coats crafted for cold climates.',
    is_active: true,
    children: [],
  },
  {
    id: 2,
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Ultra-heavyweight 300+ GSM combed cotton tees with signature drop shoulders.',
    is_active: true,
    children: [],
  },
  {
    id: 3,
    name: 'Hoodies & Sweaters',
    slug: 'hoodies-sweaters',
    description: 'French terry and textured fleece silhouettes engineered for structured layering.',
    is_active: true,
    children: [],
  },
  {
    id: 4,
    name: 'Trousers & Pants',
    slug: 'trousers-pants',
    description: 'Tactical cargo systems, tailored relaxed trousers, and pleated wide-leg pants.',
    is_active: true,
    children: [],
  },
  {
    id: 5,
    name: 'Accessories',
    slug: 'accessories',
    description: 'Structured canvas totes, tactical webbing belts, and archive headwear.',
    is_active: true,
    children: [],
  },
  {
    id: 6,
    name: 'Archive Editions',
    slug: 'archive-editions',
    description: 'Limited run experimental prototypes and numbered collector releases.',
    is_active: true,
    children: [],
  },
];

export const INITIAL_PRODUCTS: AppralProductDetail[] = [
  {
    id: 1,
    name: 'VINTAGE WASH BOMBER JACKET',
    slug: 'vintage-wash-bomber-jacket',
    sku: 'JKT-BMB-001',
    category: 'Outerwear',
    short_description: 'Double-layered insulated bomber featuring garment-dyed wash and heavy-gauge zippers.',
    description: 'Engineered with a weather-resistant high-density nylon shell and insulated quilted lining. Features dropped shoulders, oversized ribbed trims, custom metal hardware, and utility cargo sleeves.',
    price: '7499.00',
    compare_at_price: '8999.00',
    badge: 'BESTSELLER',
    in_stock: true,
    total_stock: 45,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-02-15T12:00:00Z',
    attributes: {
      Fabric: '100% Japanese Technical Nylon',
      Fit: 'Oversized Boxy',
      Origin: 'Crafted in Vancouver',
      Care: 'Dry clean only',
    },
    additional_categories: [],
    primary_image: {
      id: 101,
      image_url: '/1.jpeg',
      alt_text: 'Vintage Wash Bomber Jacket',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 101, image_url: '/1.jpeg', alt_text: 'Front view', is_primary: true, display_order: 1 },
      { id: 102, image_url: '/2.jpeg', alt_text: 'Side profile', is_primary: false, display_order: 2 },
      { id: 103, image_url: '/3.jpeg', alt_text: 'Detail shot', is_primary: false, display_order: 3 },
    ],
    variants: [
      { id: 11, sku: 'JKT-BMB-001-S-BLK', size: 'S', color_name: 'Washed Black', color_hex: '#1a1a1a', price_override: null, stock: 12, is_active: true, additional_attributes: null },
      { id: 12, sku: 'JKT-BMB-001-M-BLK', size: 'M', color_name: 'Washed Black', color_hex: '#1a1a1a', price_override: null, stock: 18, is_active: true, additional_attributes: null },
      { id: 13, sku: 'JKT-BMB-001-L-BLK', size: 'L', color_name: 'Washed Black', color_hex: '#1a1a1a', price_override: null, stock: 15, is_active: true, additional_attributes: null },
      { id: 14, sku: 'JKT-BMB-001-M-OLV', size: 'M', color_name: 'Olivine', color_hex: '#5d6b54', price_override: null, stock: 8, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 2,
    name: 'HEAVYWEIGHT OVERSIZED TEE',
    slug: 'heavyweight-oversized-tee',
    sku: 'TEE-HVY-002',
    category: 'T-Shirts',
    short_description: '320 GSM single-jersey organic cotton tee with wide ribbed collar and dropped shoulders.',
    description: 'An architectural everyday foundation. Knitted with high-twist long-staple cotton for a firm drape that maintains its structured boxy silhouette wear after wear.',
    price: '2499.00',
    compare_at_price: null,
    badge: 'ESSENTIAL',
    in_stock: true,
    total_stock: 120,
    created_at: '2025-01-12T10:00:00Z',
    updated_at: '2025-02-18T12:00:00Z',
    attributes: {
      Fabric: '100% Organic Ring-Spun Cotton (320 GSM)',
      Fit: 'Relaxed Drop-Shoulder Boxy',
      Care: 'Cold wash, hang dry inside out',
    },
    additional_categories: [],
    primary_image: {
      id: 201,
      image_url: '/2.jpeg',
      alt_text: 'Heavyweight Oversized Tee',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 201, image_url: '/2.jpeg', alt_text: 'Front view', is_primary: true, display_order: 1 },
      { id: 202, image_url: '/3.jpeg', alt_text: 'Fabric detail', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 21, sku: 'TEE-HVY-002-S-WHT', size: 'S', color_name: 'Egret White', color_hex: '#efe8de', price_override: null, stock: 30, is_active: true, additional_attributes: null },
      { id: 22, sku: 'TEE-HVY-002-M-WHT', size: 'M', color_name: 'Egret White', color_hex: '#efe8de', price_override: null, stock: 45, is_active: true, additional_attributes: null },
      { id: 23, sku: 'TEE-HVY-002-L-WHT', size: 'L', color_name: 'Egret White', color_hex: '#efe8de', price_override: null, stock: 25, is_active: true, additional_attributes: null },
      { id: 24, sku: 'TEE-HVY-002-M-BLK', size: 'M', color_name: 'Pitch Black', color_hex: '#000000', price_override: null, stock: 20, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 3,
    name: 'STRUCTURAL FRENCH TERRY HOODIE',
    slug: 'structural-french-terry-hoodie',
    sku: 'HD-FT-003',
    category: 'Hoodies & Sweaters',
    short_description: '500 GSM loopback French terry hoodie with double-walled crossover hood and kangaroo pocket.',
    description: 'Sculpted with heavyweight custom milled cotton fleece. Features clean raglan construction, deep crossover hood without drawstrings, and heavyweight ribbed hem.',
    price: '4999.00',
    compare_at_price: '5999.00',
    badge: 'SIGNATURE',
    in_stock: true,
    total_stock: 60,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-02-20T12:00:00Z',
    attributes: {
      Fabric: '500 GSM Cotton French Terry',
      Fit: 'Structured Oversized',
      Origin: 'Milled in Portugal',
    },
    additional_categories: [],
    primary_image: {
      id: 301,
      image_url: '/3.jpeg',
      alt_text: 'Structural French Terry Hoodie',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 301, image_url: '/3.jpeg', alt_text: 'Hoodie look', is_primary: true, display_order: 1 },
      { id: 302, image_url: '/4.jpeg', alt_text: 'Back profile', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 31, sku: 'HD-FT-003-S-RST', size: 'S', color_name: 'Gingerbread Rust', color_hex: '#8a4f35', price_override: null, stock: 15, is_active: true, additional_attributes: null },
      { id: 32, sku: 'HD-FT-003-M-RST', size: 'M', color_name: 'Gingerbread Rust', color_hex: '#8a4f35', price_override: null, stock: 25, is_active: true, additional_attributes: null },
      { id: 33, sku: 'HD-FT-003-L-RST', size: 'L', color_name: 'Gingerbread Rust', color_hex: '#8a4f35', price_override: null, stock: 20, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 4,
    name: 'TACTICAL WIDE-LEG CARGO TROUSERS',
    slug: 'tactical-wide-leg-cargo-trousers',
    sku: 'TR-CG-004',
    category: 'Trousers & Pants',
    short_description: 'Water-repellent ripstop trousers with asymmetric modular pockets and adjustable bungee hems.',
    description: 'Designed for fluid movement and utility. Built with high-tenacity ripstop fabric, articulated knee darts, dual gusseted bellow pockets, and an elasticated waistband with integrated webbing belt.',
    price: '5499.00',
    compare_at_price: null,
    badge: 'NEW ARRIVAL',
    in_stock: true,
    total_stock: 40,
    created_at: '2025-01-18T10:00:00Z',
    updated_at: '2025-02-22T12:00:00Z',
    attributes: {
      Fabric: 'Cordura Ripstop Cotton Blend',
      Fit: 'Relaxed Wide Straight Leg',
      Hardware: 'Fidlock Magnetic Buckles & YKK Zippers',
    },
    additional_categories: [],
    primary_image: {
      id: 401,
      image_url: '/4.jpeg',
      alt_text: 'Tactical Wide-Leg Cargo Trousers',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 401, image_url: '/4.jpeg', alt_text: 'Cargo pants front', is_primary: true, display_order: 1 },
      { id: 402, image_url: '/5.jpeg', alt_text: 'Cargo pockets', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 41, sku: 'TR-CG-004-30-NVY', size: '30', color_name: 'Blue Depths', color_hex: '#1f2d4d', price_override: null, stock: 10, is_active: true, additional_attributes: null },
      { id: 42, sku: 'TR-CG-004-32-NVY', size: '32', color_name: 'Blue Depths', color_hex: '#1f2d4d', price_override: null, stock: 18, is_active: true, additional_attributes: null },
      { id: 43, sku: 'TR-CG-004-34-NVY', size: '34', color_name: 'Blue Depths', color_hex: '#1f2d4d', price_override: null, stock: 12, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 5,
    name: 'ARCHIVE NYLON ZIP TRACK JACKET',
    slug: 'archive-nylon-zip-track-jacket',
    sku: 'JKT-TRK-005',
    category: 'Outerwear',
    short_description: 'Contrast piped technical track jacket with breathable mesh lining and stand collar.',
    description: 'A nostalgic silhouette modernized with lightweight crinkle nylon, contrast piping lines, two-way zipper closure, and concealed interior media pockets.',
    price: '6299.00',
    compare_at_price: '7199.00',
    badge: 'ARCHIVE',
    in_stock: true,
    total_stock: 35,
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-02-23T12:00:00Z',
    attributes: {
      Fabric: '100% Crinkle Taslan Nylon',
      Lining: 'Polyester Active Mesh',
    },
    additional_categories: [],
    primary_image: {
      id: 501,
      image_url: '/5.jpeg',
      alt_text: 'Archive Nylon Zip Track Jacket',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 501, image_url: '/5.jpeg', alt_text: 'Track jacket front', is_primary: true, display_order: 1 },
      { id: 502, image_url: '/6.jpeg', alt_text: 'Back logo detail', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 51, sku: 'JKT-TRK-005-S-OLV', size: 'S', color_name: 'Olivine Green', color_hex: '#5d6b54', price_override: null, stock: 8, is_active: true, additional_attributes: null },
      { id: 52, sku: 'JKT-TRK-005-M-OLV', size: 'M', color_name: 'Olivine Green', color_hex: '#5d6b54', price_override: null, stock: 15, is_active: true, additional_attributes: null },
      { id: 53, sku: 'JKT-TRK-005-L-OLV', size: 'L', color_name: 'Olivine Green', color_hex: '#5d6b54', price_override: null, stock: 12, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 6,
    name: 'GRAPHIC CHRONICLE BOX TEE',
    slug: 'graphic-chronicle-box-tee',
    sku: 'TEE-CHR-006',
    category: 'T-Shirts',
    short_description: 'High-density screenprint graphic tee commemorating the Hustle Hour collection.',
    description: 'Finished with a specialty pigment dye process giving subtle variation to each individual piece. Features archival typographic print across chest and back shoulder.',
    price: '2799.00',
    compare_at_price: null,
    badge: 'LIMITED',
    in_stock: true,
    total_stock: 85,
    created_at: '2025-01-22T10:00:00Z',
    updated_at: '2025-02-24T12:00:00Z',
    attributes: {
      Fabric: '100% Combed Cotton 300 GSM',
      Print: 'High-Density Plastisol Screenprint',
    },
    additional_categories: [],
    primary_image: {
      id: 601,
      image_url: '/6.jpeg',
      alt_text: 'Graphic Chronicle Box Tee',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 601, image_url: '/6.jpeg', alt_text: 'Tee front', is_primary: true, display_order: 1 },
      { id: 602, image_url: '/7.jpeg', alt_text: 'Graphic detail', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 61, sku: 'TEE-CHR-006-S-BLK', size: 'S', color_name: 'Pitch Black', color_hex: '#111111', price_override: null, stock: 25, is_active: true, additional_attributes: null },
      { id: 62, sku: 'TEE-CHR-006-M-BLK', size: 'M', color_name: 'Pitch Black', color_hex: '#111111', price_override: null, stock: 35, is_active: true, additional_attributes: null },
      { id: 63, sku: 'TEE-CHR-006-L-BLK', size: 'L', color_name: 'Pitch Black', color_hex: '#111111', price_override: null, stock: 25, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 7,
    name: 'TEXTURED RELAXED KNIT CREWNECK',
    slug: 'textured-relaxed-knit-crewneck',
    sku: 'SW-KN-007',
    category: 'Hoodies & Sweaters',
    short_description: 'Chunky waffle gauge merino blend knit sweater with raglan drape.',
    description: 'Crafted from premium Italian spun extra-fine merino wool and organic cotton. Ultra-soft touch, substantial thermal retention, and refined ribbed collar structure.',
    price: '5999.00',
    compare_at_price: '6899.00',
    badge: 'COLD SEASON',
    in_stock: true,
    total_stock: 50,
    created_at: '2025-01-25T10:00:00Z',
    updated_at: '2025-02-25T12:00:00Z',
    attributes: {
      Fabric: '60% Merino Wool, 40% Organic Cotton',
      Gauge: '5-Gauge Chunky Rib',
    },
    additional_categories: [],
    primary_image: {
      id: 701,
      image_url: '/7.jpeg',
      alt_text: 'Textured Relaxed Knit Crewneck',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 701, image_url: '/7.jpeg', alt_text: 'Knit crewneck', is_primary: true, display_order: 1 },
      { id: 702, image_url: '/8.jpeg', alt_text: 'Waffle texture detail', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 71, sku: 'SW-KN-007-S-CRM', size: 'S', color_name: 'Egret Cream', color_hex: '#efe8de', price_override: null, stock: 15, is_active: true, additional_attributes: null },
      { id: 72, sku: 'SW-KN-007-M-CRM', size: 'M', color_name: 'Egret Cream', color_hex: '#efe8de', price_override: null, stock: 20, is_active: true, additional_attributes: null },
      { id: 73, sku: 'SW-KN-007-L-CRM', size: 'L', color_name: 'Egret Cream', color_hex: '#efe8de', price_override: null, stock: 15, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 8,
    name: 'MODULAR HEAVY CANVAS TOTE',
    slug: 'modular-heavy-canvas-tote',
    sku: 'ACC-TOT-008',
    category: 'Accessories',
    short_description: '24oz duck canvas utilitarian carryall with reinforced leather base and military webbing straps.',
    description: 'Built to endure everyday demands. Features an internal padded 16-inch laptop compartment, key clip lanyard, external quick-access pockets, and dual hand/shoulder handles.',
    price: '3499.00',
    compare_at_price: null,
    badge: 'ESSENTIAL',
    in_stock: true,
    total_stock: 70,
    created_at: '2025-01-28T10:00:00Z',
    updated_at: '2025-02-26T12:00:00Z',
    attributes: {
      Material: '24oz Heavy Duck Cotton Canvas',
      Capacity: '28 Liters',
      Hardware: 'Matte Black Anodized Aluminium',
    },
    additional_categories: [],
    primary_image: {
      id: 801,
      image_url: '/8.jpeg',
      alt_text: 'Modular Heavy Canvas Tote',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 801, image_url: '/8.jpeg', alt_text: 'Canvas tote front', is_primary: true, display_order: 1 },
      { id: 802, image_url: '/9.jpeg', alt_text: 'Inside compartments', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 81, sku: 'ACC-TOT-008-OS-BLK', size: 'One Size', color_name: 'Carbon Black', color_hex: '#1a1a1a', price_override: null, stock: 40, is_active: true, additional_attributes: null },
      { id: 82, sku: 'ACC-TOT-008-OS-OLV', size: 'One Size', color_name: 'Olivine', color_hex: '#5d6b54', price_override: null, stock: 30, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 9,
    name: 'TAILORED RELAXED PLEATED TROUSER',
    slug: 'tailored-relaxed-pleated-trouser',
    sku: 'TR-PLT-009',
    category: 'Trousers & Pants',
    short_description: 'Double front pleat trousers cut in a fluid tropical wool blend with slight taper.',
    description: 'Blurring the boundary between sartorial precision and street ease. Complete with concealed hook closure, deep slash pockets, and interior curtain waistband.',
    price: '4799.00',
    compare_at_price: '5499.00',
    badge: null,
    in_stock: true,
    total_stock: 45,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-27T12:00:00Z',
    attributes: {
      Fabric: '70% Wool, 30% Recycled Poly',
      Fit: 'Relaxed Tapered Pleat',
    },
    additional_categories: [],
    primary_image: {
      id: 901,
      image_url: '/9.jpeg',
      alt_text: 'Tailored Relaxed Pleated Trouser',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 901, image_url: '/9.jpeg', alt_text: 'Pleated trousers', is_primary: true, display_order: 1 },
      { id: 902, image_url: '/10.jpeg', alt_text: 'Pleat details', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 91, sku: 'TR-PLT-009-30-GRY', size: '30', color_name: 'Charcoal', color_hex: '#2b2b2b', price_override: null, stock: 12, is_active: true, additional_attributes: null },
      { id: 92, sku: 'TR-PLT-009-32-GRY', size: '32', color_name: 'Charcoal', color_hex: '#2b2b2b', price_override: null, stock: 20, is_active: true, additional_attributes: null },
      { id: 93, sku: 'TR-PLT-009-34-GRY', size: '34', color_name: 'Charcoal', color_hex: '#2b2b2b', price_override: null, stock: 13, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 10,
    name: 'HUSTLE HOUR ARCHIVE HOODED COAT',
    slug: 'hustle-hour-archive-hooded-coat',
    sku: 'CT-ARC-010',
    category: 'Archive Editions',
    short_description: 'Numbered limited run storm coat with modular detachable hood and fleece lining.',
    description: 'Part of the pinnacle Vancouver series. 3-layer laminated membrane provides total water repellency while retaining lightweight drape and breathability.',
    price: '11999.00',
    compare_at_price: '14999.00',
    badge: 'COLLECTOR',
    in_stock: true,
    total_stock: 20,
    created_at: '2025-02-05T10:00:00Z',
    updated_at: '2025-02-28T12:00:00Z',
    attributes: {
      Edition: 'Numbered Run (1 of 200)',
      Shell: '3-Layer eVent Waterproof Fabric',
    },
    additional_categories: [],
    primary_image: {
      id: 1001,
      image_url: '/10.jpeg',
      alt_text: 'Hustle Hour Archive Hooded Coat',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 1001, image_url: '/10.jpeg', alt_text: 'Coat front', is_primary: true, display_order: 1 },
      { id: 1002, image_url: '/11.jpeg', alt_text: 'Lining detail', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 101, sku: 'CT-ARC-010-S-BLK', size: 'S', color_name: 'Deep Onyx', color_hex: '#0d0d0d', price_override: null, stock: 5, is_active: true, additional_attributes: null },
      { id: 102, sku: 'CT-ARC-010-M-BLK', size: 'M', color_name: 'Deep Onyx', color_hex: '#0d0d0d', price_override: null, stock: 10, is_active: true, additional_attributes: null },
      { id: 103, sku: 'CT-ARC-010-L-BLK', size: 'L', color_name: 'Deep Onyx', color_hex: '#0d0d0d', price_override: null, stock: 5, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 11,
    name: 'MINIMALIST RELAXED OVERSHIRT',
    slug: 'minimalist-relaxed-overshirt',
    sku: 'SH-OVR-011',
    category: 'Outerwear',
    short_description: 'Midweight structured twill overshirt with horn buttons and hidden chest pocket.',
    description: 'An effortless layering piece designed for year-round styling. Cut from rigid organic cotton twill with straight hem and camp collar.',
    price: '3999.00',
    compare_at_price: null,
    badge: 'NEW',
    in_stock: true,
    total_stock: 55,
    created_at: '2025-02-08T10:00:00Z',
    updated_at: '2025-03-01T12:00:00Z',
    attributes: {
      Fabric: '100% Cotton Moleskin Twill',
      Fit: 'Square Relaxed',
    },
    additional_categories: [],
    primary_image: {
      id: 1101,
      image_url: '/11.jpeg',
      alt_text: 'Minimalist Relaxed Overshirt',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 1101, image_url: '/11.jpeg', alt_text: 'Overshirt look', is_primary: true, display_order: 1 },
      { id: 1102, image_url: '/12.jpeg', alt_text: 'Fabric twill weave', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 111, sku: 'SH-OVR-011-S-RST', size: 'S', color_name: 'Gingerbread', color_hex: '#8a4f35', price_override: null, stock: 15, is_active: true, additional_attributes: null },
      { id: 112, sku: 'SH-OVR-011-M-RST', size: 'M', color_name: 'Gingerbread', color_hex: '#8a4f35', price_override: null, stock: 22, is_active: true, additional_attributes: null },
      { id: 113, sku: 'SH-OVR-011-L-RST', size: 'L', color_name: 'Gingerbread', color_hex: '#8a4f35', price_override: null, stock: 18, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
  {
    id: 12,
    name: 'TECHNICAL EMBROIDERED CAP',
    slug: 'technical-embroidered-cap',
    sku: 'ACC-CAP-012',
    category: 'Accessories',
    short_description: 'Low-profile 6-panel nylon cap with tonal APPRAL embroidery and metal slider strap.',
    description: 'Constructed from lightweight breathable technical microfiber with an unstructured crown, curved visor, and moisture-wicking internal sweatband.',
    price: '1899.00',
    compare_at_price: null,
    badge: 'ESSENTIAL',
    in_stock: true,
    total_stock: 90,
    created_at: '2025-02-10T10:00:00Z',
    updated_at: '2025-03-02T12:00:00Z',
    attributes: {
      Material: '100% Breathable Tech Taslan',
      Fit: 'Adjustable Unstructured 6-Panel',
    },
    additional_categories: [],
    primary_image: {
      id: 1201,
      image_url: '/12.jpeg',
      alt_text: 'Technical Embroidered Cap',
      is_primary: true,
      display_order: 1,
    },
    images: [
      { id: 1201, image_url: '/12.jpeg', alt_text: 'Cap front', is_primary: true, display_order: 1 },
      { id: 1202, image_url: '/1.jpeg', alt_text: 'Strapback closure', is_primary: false, display_order: 2 },
    ],
    variants: [
      { id: 121, sku: 'ACC-CAP-012-OS-BLK', size: 'One Size', color_name: 'Pitch Black', color_hex: '#000000', price_override: null, stock: 50, is_active: true, additional_attributes: null },
      { id: 122, sku: 'ACC-CAP-012-OS-NVY', size: 'One Size', color_name: 'Blue Depths', color_hex: '#1f2d4d', price_override: null, stock: 40, is_active: true, additional_attributes: null },
    ],
    related_products: [],
  },
];

// Populate related products for each
INITIAL_PRODUCTS.forEach((prod, index) => {
  const others = INITIAL_PRODUCTS.filter((_, i) => i !== index);
  prod.related_products = others.slice(0, 4).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    short_description: p.short_description,
    price: p.price,
    compare_at_price: p.compare_at_price,
    badge: p.badge,
    in_stock: p.in_stock,
    primary_image: p.primary_image,
    variants: p.variants,
  }));
});

export const DEMO_USER: UserProfile = {
  id: 1,
  email: 'client@kala.com',
  first_name: 'KALA',
  last_name: 'Member',
  role: 'admin',
  is_active: true,
  date_joined: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const DEMO_TOKENS: AuthTokens = {
  access: 'mock_local_jwt_access_token_kala',
  refresh: 'mock_local_jwt_refresh_token_kala',
};

export const DEMO_ADMIN_USERS: AdminUser[] = [
  {
    id: 1,
    email: 'client@kala.com',
    first_name: 'KALA',
    last_name: 'Member',
    role: 'admin',
    is_active: true,
    is_staff: true,
    date_joined: '2025-01-01T00:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'marcus.v@atelier.com',
    first_name: 'Marcus',
    last_name: 'Vance',
    role: 'customer',
    is_active: true,
    is_staff: false,
    date_joined: '2025-01-14T15:30:00Z',
    last_login: '2025-02-28T09:12:00Z',
  },
  {
    id: 3,
    email: 'elena.rostova@design.co',
    first_name: 'Elena',
    last_name: 'Rostova',
    role: 'customer',
    is_active: true,
    is_staff: false,
    date_joined: '2025-01-20T11:20:00Z',
    last_login: '2025-03-01T18:40:00Z',
  },
];

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getStoredItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

class MockDatabase {
  public getProducts(): AppralProductDetail[] {
    return getStoredItem<AppralProductDetail[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  public saveProducts(products: AppralProductDetail[]): void {
    setStoredItem(STORAGE_KEYS.PRODUCTS, products);
  }

  public getCategories(): AppralCategory[] {
    return getStoredItem<AppralCategory[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public saveCategories(categories: AppralCategory[]): void {
    setStoredItem(STORAGE_KEYS.CATEGORIES, categories);
  }

  public getCart(): AppralCart {
    const defaultCart: AppralCart = {
      id: 1,
      status: 'active',
      item_count: 0,
      subtotal: '0.00',
      items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return getStoredItem<AppralCart>(STORAGE_KEYS.CART, defaultCart);
  }

  public saveCart(cart: AppralCart): void {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => {
      const price = Number.parseFloat(item.unit_price || '0');
      return sum + price * item.quantity;
    }, 0);

    const updatedCart: AppralCart = {
      ...cart,
      item_count: count,
      subtotal: subtotal.toFixed(2),
      updated_at: new Date().toISOString(),
    };
    setStoredItem(STORAGE_KEYS.CART, updatedCart);
  }

  public getWishlist(): AppralWishlistItem[] {
    return getStoredItem<AppralWishlistItem[]>(STORAGE_KEYS.WISHLIST, []);
  }

  public saveWishlist(wishlist: AppralWishlistItem[]): void {
    setStoredItem(STORAGE_KEYS.WISHLIST, wishlist);
  }

  public getRecentlyViewed(): AppralRecentlyViewedItem[] {
    return getStoredItem<AppralRecentlyViewedItem[]>(STORAGE_KEYS.RECENTLY_VIEWED, []);
  }

  public saveRecentlyViewed(items: AppralRecentlyViewedItem[]): void {
    setStoredItem(STORAGE_KEYS.RECENTLY_VIEWED, items);
  }

  public getUsers(): AdminUser[] {
    return getStoredItem<AdminUser[]>(STORAGE_KEYS.USERS, DEMO_ADMIN_USERS);
  }

  public saveUsers(users: AdminUser[]): void {
    setStoredItem(STORAGE_KEYS.USERS, users);
  }

  public getCurrentUser(): UserProfile | null {
    return getStoredItem<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, DEMO_USER);
  }

  public saveCurrentUser(user: UserProfile | null): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
  }
}

export const mockDb = new MockDatabase();
