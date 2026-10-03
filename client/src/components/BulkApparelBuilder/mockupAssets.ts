import { type ApparelProductConfig, type ApparelId } from './types'

export const DEFAULT_EMBLEM_URL = '/mockups/kala-brand-emblem.svg'

export const APPAREL_CONFIGS: Record<ApparelId, ApparelProductConfig> = {
  tshirt: {
    id: 'tshirt',
    name: 'T-SHIRTS',
    startingPrice: 170,
    startingPriceLabel: 'From ₹170',
    features: [
      'Lightweight and comfortable 220 GSM cotton',
      'High-definition screen & DTF print available',
      'Suitable for events, campaigns and teams',
    ],
    icon: '/mockups/tshirt-black-front.png',
    mockups: {
      black: {
        front: '/mockups/tshirt-black-front.png',
        back: '/mockups/tshirt-black-back.png',
      },
      white: {
        front: '/mockups/tshirt-white-front.png',
        back: '/mockups/tshirt-white-back.png',
      },
    },
    printableBounds: {
      front: { minX: 30, maxX: 70, minY: 28, maxY: 66 },
      back: { minX: 30, maxX: 70, minY: 24, maxY: 66 },
    },
  },
  hoodie: {
    id: 'hoodie',
    name: 'HOODIES',
    startingPrice: 680,
    startingPriceLabel: 'From ₹680',
    features: [
      'Premium 380 GSM heavyweight fleece fabric',
      'Double-layered hood with kangaroo pocket',
      'Suitable for teams, college groups and winter merch',
    ],
    icon: '/mockups/hoodie-black-front.png',
    mockups: {
      black: {
        front: '/mockups/hoodie-black-front.png',
        back: '/mockups/hoodie-black-back.png',
      },
      white: {
        front: '/mockups/hoodie-white-front.png',
        back: '/mockups/hoodie-white-back.png',
      },
    },
    printableBounds: {
      front: { minX: 33, maxX: 67, minY: 32, maxY: 58 },
      back: { minX: 30, maxX: 70, minY: 26, maxY: 66 },
    },
  },
  jersey: {
    id: 'jersey',
    name: 'JERSEYS',
    startingPrice: 350,
    startingPriceLabel: 'From ₹350',
    features: [
      'Moisture-wicking dry-fit athletic polyester',
      'Custom name, number and sponsor branding',
      'Full sublimation printing for sports teams and gaming clans',
    ],
    icon: '/mockups/jersey-black-front.png',
    mockups: {
      black: {
        front: '/mockups/jersey-black-front.png',
        back: '/mockups/jersey-black-back.png',
      },
      white: {
        front: '/mockups/jersey-white-front.png',
        back: '/mockups/jersey-white-back.png',
      },
    },
    printableBounds: {
      front: { minX: 30, maxX: 70, minY: 28, maxY: 68 },
      back: { minX: 30, maxX: 70, minY: 22, maxY: 68 },
    },
  },
  polo: {
    id: 'polo',
    name: 'POLOS',
    startingPrice: 370,
    startingPriceLabel: 'From ₹370',
    features: [
      'Refined collar with 2-button placket in 180–240 GSM cotton & matty',
      'Durable screen print & high-density chest embroidery',
      'Ideal for corporate uniforms, clubs and college merchandise',
    ],
    icon: '/mockups/polo-black-front.png',
    mockups: {
      black: {
        front: '/mockups/polo-black-front.png',
        back: '/mockups/polo-black-back.png',
      },
      white: {
        front: '/mockups/polo-white-front.png',
        back: '/mockups/polo-white-back.png',
      },
    },
    printableBounds: {
      front: { minX: 30, maxX: 70, minY: 35, maxY: 68 },
      back: { minX: 30, maxX: 70, minY: 26, maxY: 66 },
    },
  },
}

export const POLO_PRODUCTS: import('./types').PoloProductOption[] = [
  {
    id: 'regular-jmp',
    name: 'Regular JMP Polo',
    startingPrice: 370,
    startingPriceLabel: 'Starting From: ₹370 (Incl. Print)',
    description: 'Refined, substantial feel for premium uniforms and branded apparel.',
    specifications: ['Branded', 'Comfortable'],
    gsm: '180 GSM',
    mockups: {
      black: {
        front: '/custom-apparel/polos/regular-jmp-black-front.png',
        back: '/custom-apparel/polos/regular-jmp-black-back.png',
      },
      white: {
        front: '/custom-apparel/polos/regular-jmp-white-front.png',
        back: '/custom-apparel/polos/regular-jmp-white-back.png',
      },
    },
  },
  {
    id: 'sap-matty',
    name: 'Sap Matty Polo',
    startingPrice: 400,
    startingPriceLabel: 'Starting From: ₹400 (Incl. Print)',
    description: 'Premium comfort for corporate events, team uniforms, clubs and branded merchandise.',
    specifications: ['Premium Comfort', 'Long Life'],
    gsm: '220 GSM',
    mockups: {
      black: {
        front: '/custom-apparel/polos/sap-matty-black-front.png',
        back: '/custom-apparel/polos/sap-matty-black-back.png',
      },
      white: {
        front: '/custom-apparel/polos/sap-matty-white-front.png',
        back: '/custom-apparel/polos/sap-matty-white-back.png',
      },
    },
  },
  {
    id: 'cotton-matty',
    name: 'Cotton Matty Polo',
    startingPrice: 450,
    startingPriceLabel: 'Starting From: ₹450 (Incl. Print)',
    description: 'Premium cotton polo with a soft feel and structured finish for everyday premium wear, uniforms and events.',
    specifications: ['Soft Finish', 'Very Comfortable'],
    gsm: '240 GSM',
    mockups: {
      black: {
        front: '/custom-apparel/polos/cotton-matty-black-front.png',
        back: '/custom-apparel/polos/cotton-matty-black-back.png',
      },
      white: {
        front: '/custom-apparel/polos/cotton-matty-white-front.png',
        back: '/custom-apparel/polos/cotton-matty-white-back.png',
      },
    },
  },
  {
    id: 'mfl-cotton',
    name: 'MFL Cotton Polo',
    startingPrice: 480,
    startingPriceLabel: 'Starting From: ₹480 (Incl. Print)',
    description: 'Premium MFL cotton for all-day comfort, durability and a luxuriously soft feel.',
    specifications: ['Premium', 'Comfortable', 'Durable'],
    gsm: '230 GSM',
    mockups: {
      black: {
        front: '/custom-apparel/polos/mfl-cotton-black-front.png',
        back: '/custom-apparel/polos/mfl-cotton-black-back.png',
      },
      white: {
        front: '/custom-apparel/polos/mfl-cotton-white-front.png',
        back: '/custom-apparel/polos/mfl-cotton-white-back.png',
      },
    },
  },
]

export const TSHIRT_PRODUCTS: import('./types').TshirtProductOption[] = [
  {
    id: 'promotion-campaign',
    name: 'Promotion Campaign T-Shirt',
    startingPrice: 170,
    startingPriceLabel: 'Starting From: ₹170 (Incl. Print)',
    description: 'Lightweight and budget friendly T-shirt designed for promotional campaigns, events and bulk distribution.',
    specifications: ['Lightweight Fabric'],
    gsm: '90 GSM',
    mockups: {
      black: {
        front: '/custom-apparel/tshirts/promotion-campaign/promotion-campaign-black-front.png',
        back: '/custom-apparel/tshirts/promotion-campaign/promotion-campaign-black-back.png',
      },
      white: {
        front: '/custom-apparel/tshirts/promotion-campaign/promotion-campaign-white-front.png',
        back: '/custom-apparel/tshirts/promotion-campaign/promotion-campaign-white-back.png',
      },
    },
  },
  {
    id: 'regular-fit',
    name: 'Regular Fit T-Shirt',
    startingPrice: 215,
    startingPriceLabel: 'Starting From: ₹215 (Incl. Print)',
    description: 'Comfortable everyday T-shirt suitable for simple custom prints, college groups and casual wear.',
    specifications: ['Lightweight Fabric', 'Regular Fit'],
    gsm: '120 GSM',
    mockups: {
      black: {
        front: '/custom-apparel/tshirts/regular-fit/regular-fit-black-front.png',
        back: '/custom-apparel/tshirts/regular-fit/regular-fit-black-back.png',
      },
      white: {
        front: '/custom-apparel/tshirts/regular-fit/regular-fit-white-front.png',
        back: '/custom-apparel/tshirts/regular-fit/regular-fit-white-back.png',
      },
    },
  },
  {
    id: 'basic-collar',
    name: 'Basic Collar T-Shirt',
    startingPrice: 290,
    startingPriceLabel: 'Starting From: ₹290 (Incl. Print)',
    description: 'A practical collar T-shirt for small business branding, events and affordable merchandise.',
    specifications: ['Lightweight Fabric', 'Collared'],
    gsm: '140 GSM',
    mockups: {
      black: {
        front: '/custom-apparel/tshirts/basic-collar/basic-collar-black-front.png',
        back: '/custom-apparel/tshirts/basic-collar/basic-collar-black-back.png',
      },
      white: {
        front: '/custom-apparel/tshirts/basic-collar/basic-collar-white-front.png',
        back: '/custom-apparel/tshirts/basic-collar/basic-collar-white-back.png',
      },
    },
  },
  {
    id: 'dot-net',
    name: 'Dot Net T-Shirt',
    startingPrice: 260,
    startingPriceLabel: 'Starting From: ₹260 (Incl. Print)',
    description: 'Lightweight, breathable and durable fabric with a smooth finish ideal for college clubs, events and custom designs.',
    specifications: ['Breathable', 'Durable'],
    gsm: '160 GSM',
    mockups: {
      black: {
        front: '/custom-apparel/tshirts/dot-net/dot-net-black-front.png',
        back: '/custom-apparel/tshirts/dot-net/dot-net-black-back.png',
      },
      white: {
        front: '/custom-apparel/tshirts/dot-net/dot-net-white-front.png',
        back: '/custom-apparel/tshirts/dot-net/dot-net-white-back.png',
      },
    },
  },
  {
    id: 'dot-net-polo',
    name: 'Dot Net Polo T-Shirt',
    startingPrice: 270,
    startingPriceLabel: 'Starting From: ₹270 (Incl. Print)',
    description: 'Comfortable and performance-oriented apparel suitable for sports teams, events and active wear.',
    specifications: ['Soft Feel', 'Durable', 'Flexible'],
    gsm: '130–140 GSM',
    mockups: {
      black: {
        front: '/custom-apparel/tshirts/dot-net-polo/dot-net-polo-black-front.png',
        back: '/custom-apparel/tshirts/dot-net-polo/dot-net-polo-black-back.png',
      },
      white: {
        front: '/custom-apparel/tshirts/dot-net-polo/dot-net-polo-white-front.png',
        back: '/custom-apparel/tshirts/dot-net-polo/dot-net-polo-white-back.png',
      },
    },
  },
]

export const APPAREL_LIST: ApparelProductConfig[] = [
  APPAREL_CONFIGS.tshirt,
  APPAREL_CONFIGS.hoodie,
  APPAREL_CONFIGS.jersey,
  APPAREL_CONFIGS.polo,
]
