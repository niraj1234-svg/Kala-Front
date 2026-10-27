/**
 * KALA Interactive Apparel Showroom — Development Fixtures
 * 
 * NOTICE:
 * The data below represents a dedicated development fixture created
 * specifically for showroom interaction staging, layout tuning, and prototype
 * validation. It does NOT represent real live inventory or transactional pricing.
 */

import type { ShowroomGarment } from '../types/showroom'
import type { Product } from '../../../data/products'

export const SHOWROOM_FIXTURE_DISCLAIMER =
  'Development showroom fixture: assets and specifications are curated for interaction testing.'

export const SHOWROOM_SAMPLE_GARMENTS: ShowroomGarment[] = [
  {
    id: 'kala-sig-heavyweight-tee',
    name: 'KALA Heavyweight Oversized Tee',
    tagline: 'Signature Boxy Cut • 240 GSM Combed Cotton',
    category: 'Streetwear',
    description:
      'Crafted with custom-milled 240 GSM combed cotton. Features a relaxed drop-shoulder silhouette, reinforced ribbed crew collar, and blind-stitched hems for an architectural streetwear drape.',
    price: 1199,
    currency: 'INR',
    available: true,
    primaryImage: '/mockups/tshirt-black-front.png',
    hangingOffset: { x: 0, y: 0, rotation: -0.5 },
    detailImages: [
      '/mockups/tshirt-black-front.png',
      '/mockups/tshirt-black-back.png',
      '/products/anti-social-club-tshirt.png',
    ],
    colorVariants: [
      {
        id: 'obsidian-black',
        name: 'Obsidian Black',
        hex: '#111111',
        garmentImage: '/mockups/tshirt-black-front.png',
        alternateImage: '/mockups/tshirt-black-back.png',
        inStock: true,
        ariaLabel: 'Select Obsidian Black colorway',
      },
      {
        id: 'chalk-white',
        name: 'Chalk White',
        hex: '#F5F5F0',
        garmentImage: '/mockups/tshirt-white-front.png',
        alternateImage: '/mockups/tshirt-white-back.png',
        inStock: true,
        ariaLabel: 'Select Chalk White colorway',
      },
      {
        id: 'kala-signal-orange',
        name: 'Signal Orange',
        hex: '#D94700',
        garmentImage: '/products/after-dark-tshirt.png',
        inStock: true,
        ariaLabel: 'Select KALA Signal Orange colorway',
      },
    ],
    sizes: [
      { size: 'S', label: 'Small', inStock: true, measurementsSummary: 'Chest 42", Length 28"' },
      { size: 'M', label: 'Medium', inStock: true, measurementsSummary: 'Chest 44", Length 29"' },
      { size: 'L', label: 'Large', inStock: true, measurementsSummary: 'Chest 46", Length 30"' },
      { size: 'XL', label: 'X-Large', inStock: true, measurementsSummary: 'Chest 48", Length 31"' },
      { size: 'XXL', label: '2X-Large', inStock: false, measurementsSummary: 'Chest 50", Length 32"' },
    ],
    customization: {
      allowed: true,
      maxTextLength: 16,
      allowedPositions: ['front', 'back', 'left-chest'],
      additionalPrice: 150,
      description: 'Custom HD screen print or micro-embroidery available across front chest or nape.',
    },
    specifications: {
      fabric: '100% Combed Ringspun Cotton',
      gsm: 240,
      fit: 'Oversized',
      composition: 'Pre-shrunk single jersey knit',
      washCare: [
        'Machine wash cold with like colors inside out',
        'Do not iron directly over screen prints',
        'Tumble dry low or line dry in shade',
      ],
      origin: 'KALA Studio Atelier, India',
    },
    badge: 'Signature Drop',
    turntableFrames: Array.from({ length: 24 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0')
      return `/products/tshirt-360/${num}.png`
    }),
  },
  {
    id: 'kala-terry-oversized-hoodie',
    name: 'KALA French Terry Drop Hoodie',
    tagline: '450 GSM Heavy French Terry • Double-Layer Hood',
    category: 'Streetwear',
    description:
      'Engineered for substantial weight and clean structure. Built with dense 450 GSM loopback French Terry, seamless kangaroo pocket integration, and a structured crossover hood.',
    price: 2499,
    currency: 'INR',
    available: true,
    primaryImage: '/mockups/hoodie-black-front.png',
    hangingOffset: { x: 2, y: 4, rotation: 0.8 },
    detailImages: [
      '/mockups/hoodie-black-front.png',
      '/mockups/hoodie-black-back.png',
      '/mockups/hoodie-white-front.png',
    ],
    colorVariants: [
      {
        id: 'carbon-black',
        name: 'Carbon Black',
        hex: '#181818',
        garmentImage: '/mockups/hoodie-black-front.png',
        alternateImage: '/mockups/hoodie-black-back.png',
        inStock: true,
        ariaLabel: 'Select Carbon Black colorway',
      },
      {
        id: 'stone-bone',
        name: 'Stone Bone',
        hex: '#EAE6DF',
        garmentImage: '/mockups/hoodie-white-front.png',
        alternateImage: '/mockups/hoodie-white-back.png',
        inStock: true,
        ariaLabel: 'Select Stone Bone colorway',
      },
    ],
    sizes: [
      { size: 'S', label: 'Small', inStock: true },
      { size: 'M', label: 'Medium', inStock: true },
      { size: 'L', label: 'Large', inStock: true },
      { size: 'XL', label: 'X-Large', inStock: true },
      { size: 'XXL', label: '2X-Large', inStock: true },
    ],
    customization: {
      allowed: true,
      maxTextLength: 12,
      allowedPositions: ['front', 'back', 'sleeve'],
      additionalPrice: 200,
      description: 'Custom high-density chest typography or sleeve coordinates.',
    },
    specifications: {
      fabric: '100% French Terry Cotton',
      gsm: 450,
      fit: 'Oversized',
      composition: 'Loopback unbrushed interior',
      washCare: ['Cold gentle cycle', 'Dry flat', 'Do not bleach'],
      origin: 'KALA Studio Atelier, India',
    },
    badge: 'Heavyweight Essential',
  },
  {
    id: 'kala-apex-compression-set',
    name: 'KALA Apex Performance Jersey',
    tagline: 'Technical 4-Way Stretch • Micro-Mesh Ventilation',
    category: 'Gymwear',
    description:
      'Zero-chafe athletic performance jersey engineered with moisture-wicking microfibres. Designed for intense mobility, breathable airflow, and active athletic drape.',
    price: 1899,
    currency: 'INR',
    available: true,
    primaryImage: '/mockups/jersey-black-front.png',
    hangingOffset: { x: -1, y: 1, rotation: -0.3 },
    detailImages: [
      '/mockups/jersey-black-front.png',
      '/mockups/jersey-black-back.png',
      '/mockups/jersey-white-front.png',
    ],
    colorVariants: [
      {
        id: 'onyx-stealth',
        name: 'Onyx Stealth',
        hex: '#111111',
        garmentImage: '/mockups/jersey-black-front.png',
        alternateImage: '/mockups/jersey-black-back.png',
        inStock: true,
        ariaLabel: 'Select Onyx Stealth colorway',
      },
      {
        id: 'optic-white',
        name: 'Optic White',
        hex: '#F5F5F0',
        garmentImage: '/mockups/jersey-white-front.png',
        alternateImage: '/mockups/jersey-white-back.png',
        inStock: true,
        ariaLabel: 'Select Optic White colorway',
      },
    ],
    sizes: [
      { size: 'S', label: 'Small', inStock: true },
      { size: 'M', label: 'Medium', inStock: true },
      { size: 'L', label: 'Large', inStock: true },
      { size: 'XL', label: 'X-Large', inStock: true },
    ],
    customization: {
      allowed: true,
      maxTextLength: 12,
      allowedPositions: ['front', 'back'],
      additionalPrice: 150,
      description: 'Custom team numbering or athletic typography across back shoulders.',
    },
    specifications: {
      fabric: '88% Technical Polyester, 12% Spandex',
      gsm: 200,
      fit: 'Athletic Compression',
      composition: 'Aerodynamic micro-mesh with dynamic flex',
      washCare: ['Cold machine wash', 'Air dry only', 'Do not iron prints'],
      origin: 'KALA Technical Works',
    },
    badge: 'Performance Tech',
  },
  {
    id: 'kala-cyber-polo-jersey',
    name: 'KALA Precision Tech Polo',
    tagline: 'Structured Pique Knit • Clean Concealed Placket',
    category: 'Streetwear',
    description:
      'A modernist take on the classic athletic polo. Features an aerodynamic collar, concealed snap placket, and breathable micro-pique cotton structure.',
    price: 1399,
    currency: 'INR',
    available: true,
    primaryImage: '/ai-data-science-polo-front.png',
    hangingOffset: { x: 1, y: -2, rotation: 0.4 },
    detailImages: [
      '/ai-data-science-polo-front.png',
      '/ai-data-science-polo-back.png',
    ],
    colorVariants: [
      {
        id: 'slate-grey',
        name: 'Slate Grey',
        hex: '#7A8086',
        garmentImage: '/ai-data-science-polo-front.png',
        alternateImage: '/ai-data-science-polo-back.png',
        inStock: true,
        ariaLabel: 'Select Slate Grey colorway',
      },
    ],
    sizes: [
      { size: 'S', label: 'Small', inStock: true },
      { size: 'M', label: 'Medium', inStock: true },
      { size: 'L', label: 'Large', inStock: true },
      { size: 'XL', label: 'X-Large', inStock: true },
      { size: 'XXL', label: '2X-Large', inStock: false },
    ],
    customization: {
      allowed: true,
      maxTextLength: 10,
      allowedPositions: ['left-chest', 'sleeve'],
      additionalPrice: 120,
    },
    specifications: {
      fabric: '70% Combed Cotton, 30% Sorona Eco-Fiber',
      gsm: 220,
      fit: 'Relaxed',
      composition: 'Micro-pique structure with shape-memory ribbing',
      washCare: ['Machine wash warm', 'Iron on low heat', 'Hang dry'],
      origin: 'KALA Studio Atelier, India',
    },
    badge: 'Atelier Edition',
  },
]

/**
 * Adapter utility that converts an existing KALA Product model
 * into a ShowroomGarment structure.
 */
export function adaptProductToShowroomGarment(kalaProduct: Product): ShowroomGarment {
  const colorVariants = (kalaProduct.variants || []).map((v, index) => ({
    id: `variant-${index}-${v.colorName.toLowerCase().replace(/\s+/g, '-')}`,
    name: v.colorName,
    hex: v.color || '#111111',
    garmentImage: v.image || kalaProduct.image,
    inStock: true,
    ariaLabel: `Select ${v.colorName} colorway`,
  }))

  // If product had no explicit variants, synthesize one primary variant
  if (colorVariants.length === 0) {
    colorVariants.push({
      id: 'default-variant',
      name: 'Default',
      hex: '#111111',
      garmentImage: kalaProduct.image,
      inStock: kalaProduct.available,
      ariaLabel: 'Default colorway',
    })
  }

  return {
    id: kalaProduct.id,
    name: kalaProduct.name,
    category: kalaProduct.category as ShowroomGarment['category'],
    description: kalaProduct.description,
    price: kalaProduct.price,
    currency: 'INR',
    available: kalaProduct.available,
    primaryImage: kalaProduct.image,
    detailImages: kalaProduct.images || [kalaProduct.image],
    colorVariants,
    sizes: [
      { size: 'S', label: 'Small', inStock: true },
      { size: 'M', label: 'Medium', inStock: true },
      { size: 'L', label: 'Large', inStock: true },
      { size: 'XL', label: 'X-Large', inStock: true },
    ],
    customization: kalaProduct.customPrintTextEnabled
      ? {
          allowed: true,
          additionalPrice: kalaProduct.customPrintTextPrice || 25,
          allowedPositions: ['front', 'back'],
        }
      : undefined,
    badge: kalaProduct.badge,
  }
}

/**
 * Lookup helper to find a sample garment by ID
 */
export function getSampleGarmentById(id: string): ShowroomGarment | undefined {
  return SHOWROOM_SAMPLE_GARMENTS.find((item) => item.id === id)
}
