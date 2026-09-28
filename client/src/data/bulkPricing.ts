import { getProductImage } from './products'

export type BulkCategory = 't-shirts' | 'hoodies' | 'jerseys'

export interface BulkCategoryConfig {
  id: BulkCategory
  name: string
  emoji: string
  subtitle: string
  startingPrice: number
  defaultImage: string
  backImage?: string
  whiteImage?: string
  blackImage?: string
  tierPrices: {
    '10-24': number
    '25-49': number
    '50-99': number
    '100-249': number
    '250+': number
  }
}

export const BULK_CATEGORIES: BulkCategoryConfig[] = [
  {
    id: 't-shirts',
    name: 'T-Shirts',
    emoji: '👕',
    subtitle: '100% Combed Cotton • 220–280 GSM',
    startingPrice: 249,
    defaultImage: getProductImage('kala-bihari-story-front.png'),
    backImage: getProductImage('kala-bihari-story-back.png'),
    whiteImage: '/custom-apparel/kala-floating-tee.png',
    blackImage: getProductImage('Streetwear 01.png'),
    tierPrices: {
      '10-24': 449,
      '25-49': 399,
      '50-99': 349,
      '100-249': 299,
      '250+': 249,
    },
  },
  {
    id: 'hoodies',
    name: 'Hoodies',
    emoji: '🧥',
    subtitle: 'Heavyweight French Terry • 450 GSM',
    startingPrice: 499,
    defaultImage: getProductImage('Streetwear -02.png'),
    backImage: getProductImage('Streetwear 05.png'),
    whiteImage: getProductImage('Streetwear 05.png'),
    blackImage: getProductImage('Streetwear -02.png'),
    tierPrices: {
      '10-24': 849,
      '25-49': 749,
      '50-99': 649,
      '100-249': 549,
      '250+': 499,
    },
  },
  {
    id: 'jerseys',
    name: 'Jerseys',
    emoji: '🏆',
    subtitle: 'Moisture-Wicking Athletic Poly • 180 GSM',
    startingPrice: 349,
    defaultImage: getProductImage('gaming 01.png'),
    backImage: getProductImage('gaming 02.png'),
    whiteImage: getProductImage('gaming 03.png'),
    blackImage: getProductImage('gaming 01.png'),
    tierPrices: {
      '10-24': 599,
      '25-49': 529,
      '50-99': 469,
      '100-249': 399,
      '250+': 349,
    },
  },
]

export type StandardColor = 'White' | 'Black' | 'Other'

export interface ColorOption {
  id: string
  name: string
  hex: string
}

export const POPULAR_OTHER_COLORS: ColorOption[] = [
  { id: 'navy', name: 'Navy Blue', hex: '#14213D' },
  { id: 'grey', name: 'Heather Grey', hex: '#94A3B8' },
  { id: 'forest', name: 'Forest Green', hex: '#1B4332' },
  { id: 'maroon', name: 'Maroon', hex: '#6B1D2F' },
  { id: 'charcoal', name: 'Charcoal', hex: '#334155' },
  { id: 'sand', name: 'Sand Beige', hex: '#D4A373' },
  { id: 'royal', name: 'Royal Blue', hex: '#1D4ED8' },
  { id: 'olive', name: 'Olive Green', hex: '#4A5568' },
]

export type CustomizationType = 'Front Print' | 'Front + Back' | 'Custom Design'
export type PrintPosition = 'Front' | 'Back' | 'Front + Back'

export interface SizeBreakdown {
  XS: number
  S: number
  M: number
  L: number
  XL: number
  XXL: number
  XXXL: number
}

export const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const
export type SizeKey = (typeof AVAILABLE_SIZES)[number]

export const DEFAULT_SIZE_BREAKDOWN: SizeBreakdown = {
  XS: 0,
  S: 10,
  M: 20,
  L: 15,
  XL: 5,
  XXL: 0,
  XXXL: 0,
}

export interface BulkOrderCalculationParams {
  category: BulkCategory
  quantity: number
  customization: CustomizationType
  printPosition: PrintPosition
  colorType: StandardColor
  customColorHex?: string
  hasUploadedDesign: boolean
}

export interface BulkOrderCalculationResult {
  tierKey: '10-24' | '25-49' | '50-99' | '100-249' | '250+'
  basePricePerPiece: number
  customizationAddon: number
  colorAddon: number
  totalPricePerPiece: number
  subtotal: number
  estimatedTotal: number
}

/**
 * Pure calculation function for bulk order price estimation.
 * Isolated from UI components for testability and maintainability.
 */
export function calculateBulkOrderPrice(
  params: BulkOrderCalculationParams
): BulkOrderCalculationResult {
  const { category, quantity, customization, printPosition, colorType } = params

  const catConfig =
    BULK_CATEGORIES.find((c) => c.id === category) || BULK_CATEGORIES[0]

  // 1. Resolve Tier
  let tierKey: '10-24' | '25-49' | '50-99' | '100-249' | '250+'
  if (quantity < 25) {
    tierKey = '10-24'
  } else if (quantity < 50) {
    tierKey = '25-49'
  } else if (quantity < 100) {
    tierKey = '50-99'
  } else if (quantity < 250) {
    tierKey = '100-249'
  } else {
    tierKey = '250+'
  }

  const basePricePerPiece = catConfig.tierPrices[tierKey]

  // 2. Customization Add-on
  let customizationAddon = 0
  if (customization === 'Custom Design') {
    // Custom uploaded artwork processing and film setup
    customizationAddon = printPosition === 'Front + Back' ? 70 : 45
  } else if (customization === 'Front + Back' || printPosition === 'Front + Back') {
    customizationAddon = 40
  } else {
    customizationAddon = 0
  }

  // 3. Color Add-on
  // White and Black are standard production runs; custom pantone/reactive dye carries a small batch fee
  const colorAddon = colorType === 'Other' ? 15 : 0

  const totalPricePerPiece = basePricePerPiece + customizationAddon + colorAddon
  const subtotal = totalPricePerPiece * quantity
  const estimatedTotal = subtotal

  return {
    tierKey,
    basePricePerPiece,
    customizationAddon,
    colorAddon,
    totalPricePerPiece,
    subtotal,
    estimatedTotal,
  }
}
