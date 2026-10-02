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
    startingPrice: 730,
    startingPriceLabel: 'From ₹730',
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
}

export const APPAREL_LIST: ApparelProductConfig[] = [
  APPAREL_CONFIGS.tshirt,
  APPAREL_CONFIGS.hoodie,
  APPAREL_CONFIGS.jersey,
]
