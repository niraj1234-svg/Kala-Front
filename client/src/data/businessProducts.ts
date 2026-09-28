import { getProductImage } from './products'

export type ApparelCategoryId = 't-shirts' | 'hoodies' | 'jerseys'

export interface ApparelCategoryData {
  id: ApparelCategoryId
  name: string
  startingPrice: number
  startingPriceLabel: string
  features: string[]
  images: {
    default: string
    front: string
    back?: string
    white?: string
    black?: string
  }
}

export const APPAREL_CATEGORIES: ApparelCategoryData[] = [
  {
    id: 't-shirts',
    name: 'T-Shirts',
    startingPrice: 175,
    startingPriceLabel: 'Starting from ₹175/pc',
    features: [
      'Lightweight and comfortable',
      'Custom print available',
      'Suitable for events, campaigns and teams',
    ],
    images: {
      default: getProductImage('kala-bihari-story-front.png') || '/images/kala-bihari-story-front.png',
      front: getProductImage('kala-bihari-story-front.png') || '/images/kala-bihari-story-front.png',
      back: getProductImage('kala-bihari-story-back.png') || '/images/kala-bihari-story-back.png',
      white: '/custom-apparel/kala-floating-tee.png',
      black: getProductImage('Streetwear 01.png') || '/images/Streetwear 01.png',
    },
  },
  {
    id: 'hoodies',
    name: 'Hoodies',
    startingPrice: 680,
    startingPriceLabel: 'Starting from ₹680/pc',
    features: [
      'Premium feel',
      'Custom printing available',
      'Suitable for teams, college groups and brands',
    ],
    images: {
      default: getProductImage('Streetwear -02.png') || '/images/Streetwear -02.png',
      front: getProductImage('Streetwear -02.png') || '/images/Streetwear -02.png',
      back: getProductImage('Streetwear 05.png') || '/images/Streetwear 05.png',
      white: getProductImage('Streetwear 05.png') || '/images/Streetwear 05.png',
      black: getProductImage('Streetwear -02.png') || '/images/Streetwear -02.png',
    },
  },
  {
    id: 'jerseys',
    name: 'Jerseys',
    startingPrice: 350,
    startingPriceLabel: 'Starting from ₹350/pc',
    features: [
      'Sports-ready fabric',
      'Custom name and number',
      'Front/back customization available',
    ],
    images: {
      default: getProductImage('gaming 01.png') || '/images/gaming 01.png',
      front: getProductImage('gaming 01.png') || '/images/gaming 01.png',
      back: getProductImage('gaming 02.png') || '/images/gaming 02.png',
      white: getProductImage('gaming 03.png') || '/images/gaming 03.png',
      black: getProductImage('gaming 01.png') || '/images/gaming 01.png',
    },
  },
]

export type StandardColorType = 'White' | 'Black' | 'Other'

export interface PaletteColor {
  id: string
  name: string
  hex: string
}

export const POPULAR_COLORS: PaletteColor[] = [
  { id: 'navy', name: 'Navy Blue', hex: '#14213D' },
  { id: 'grey', name: 'Heather Grey', hex: '#94A3B8' },
  { id: 'forest', name: 'Forest Green', hex: '#1B4332' },
  { id: 'maroon', name: 'Maroon', hex: '#6B1D2F' },
  { id: 'royal', name: 'Royal Blue', hex: '#1D4ED8' },
  { id: 'charcoal', name: 'Charcoal', hex: '#334155' },
  { id: 'sand', name: 'Sand Beige', hex: '#D4A373' },
  { id: 'red', name: 'Crimson Red', hex: '#DC2626' },
]

export type CustomizationOptionId = 'Front Print' | 'Front + Back' | 'Custom Design'

export interface CustomizationOption {
  id: CustomizationOptionId
  label: string
  description: string
}

export const CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  {
    id: 'Front Print',
    label: 'Front Print',
    description: 'Single chest or front artwork',
  },
  {
    id: 'Front + Back',
    label: 'Front + Back',
    description: 'Both sides branding',
  },
  {
    id: 'Custom Design',
    label: 'Custom Design',
    description: 'Upload your vector / design file',
  },
]
