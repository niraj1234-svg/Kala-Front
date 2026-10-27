/**
 * KALA Interactive Apparel Showroom — Domain Type Definitions
 * 
 * Provides strict TypeScript models for garments, color variants,
 * sizing, customization metadata, showroom interaction state,
 * and accessibility contracts.
 */

export type ShowroomCategory =
  | 'Streetwear'
  | 'Gaming'
  | 'Gymwear'
  | 'Custom'
  | 'Essential'

export type ShowroomGarmentFit =
  | 'Oversized'
  | 'Relaxed'
  | 'Regular'
  | 'Slim'
  | 'Athletic Compression'

export type ShowroomPrintPosition =
  | 'front'
  | 'back'
  | 'left-chest'
  | 'sleeve'

export interface ShowroomColorVariant {
  /** Unique variant ID, e.g. "obsidian-black" */
  id: string
  /** Human-readable color name, e.g. "Obsidian Black" */
  name: string
  /** Hex color code for swatch display, e.g. "#111111" */
  hex: string
  /** Transparent cutout garment image for rail and display */
  garmentImage: string
  /** Back view or alternate angle image if available */
  alternateImage?: string
  /** Real-time stock status */
  inStock: boolean
  /** Accessible label for screen readers */
  ariaLabel?: string
}

export interface ShowroomSizeOption {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | string
  label: string
  inStock: boolean
  measurementsSummary?: string
}

export interface ShowroomCustomizationOptions {
  allowed: boolean
  maxTextLength?: number
  allowedPositions?: ShowroomPrintPosition[]
  additionalPrice?: number
  description?: string
}

export interface ShowroomSpecifications {
  fabric: string
  gsm?: number
  fit: ShowroomGarmentFit
  composition?: string
  washCare?: string[]
  origin?: string
}

export interface ShowroomGarment {
  /** Unique product identifier matching KALA catalogue or showroom fixture */
  id: string
  /** Garment display title, e.g. "KALA Heavyweight Oversized Tee" */
  name: string
  /** Optional subtitle or collection indicator */
  tagline?: string
  /** Primary apparel category */
  category: ShowroomCategory
  /** Editorial description of the garment cut, drape, and aesthetic */
  description: string
  /** Base price in the specified currency */
  price: number
  /** Currency code (defaults to 'INR') */
  currency: 'INR' | string
  /** Overall availability flag */
  available: boolean
  /** Primary transparent cutout image used for clothing rail hanging */
  primaryImage: string
  /** Optional subtle hanger positioning offset for realistic horizontal rail variation */
  hangingOffset?: {
    x?: number // horizontal offset in px
    y?: number // vertical drop in px
    rotation?: number // slight tilt angle in deg (-2 to 2)
  }
  /** Gallery images for detailed exploration */
  detailImages?: string[]
  /** Available color variants with variant-specific assets */
  colorVariants: ShowroomColorVariant[]
  /** Available size options with stock flags */
  sizes: ShowroomSizeOption[]
  /** Customization possibilities (text print, placement) */
  customization?: ShowroomCustomizationOptions
  /** Fabric and craftsmanship specifications */
  specifications?: ShowroomSpecifications
  /** Badge text, e.g. "Signature Drop", "Best Seller" */
  badge?: string
  /** Frames for 360 viewer if garment supports turntable inspection */
  turntableFrames?: string[]
}

/**
 * State contract for the interactive showroom experience
 */
export interface ShowroomState {
  /** Currently focused or selected garment ID on the rail */
  selectedGarmentId: string
  /** Currently selected color variant ID per garment */
  selectedVariantByGarment: Record<string, string>
  /** Currently chosen size option */
  selectedSize: string | null
  /** Whether the detailed inspection drawer / panel is open */
  isDetailPanelOpen: boolean
  /** Zero-based active index along the horizontal clothing rail */
  railIndex: number
  /** Whether asset preloading is underway */
  isLoading: boolean
  /** Any asset loading or interaction error message */
  error: string | null
  /** User motion preference derived from system settings */
  prefersReducedMotion: boolean
}

/**
 * Public actions exposed by the showroom state controller
 */
export interface ShowroomActions {
  selectGarment: (garmentId: string) => void
  selectVariant: (garmentId: string, variantId: string) => void
  selectSize: (size: string) => void
  openDetailPanel: () => void
  closeDetailPanel: () => void
  toggleDetailPanel: () => void
  nextGarment: () => void
  previousGarment: () => void
  setRailIndex: (index: number) => void
  retryAssetLoading: () => void
}

/**
 * Accessibility helper attributes for keyboard-navigable showroom components
 */
export interface ShowroomAriaControls {
  role: 'region' | 'listbox' | 'tablist'
  ariaLabel: string
  ariaLive?: 'polite' | 'assertive' | 'off'
}

/**
 * Validated, unified product configuration model representing a configured
 * showroom garment ready for inspection, local storage, and cart/checkout handoff.
 */
export interface ConfiguredShowroomProduct {
  /** Product ID matching KALA catalogue or showroom fixture */
  productId: string
  /** Product display name */
  productName: string
  /** Selected color variant ID */
  variantId: string
  /** Selected color variant display name */
  variantName: string
  /** Selected size code (e.g. 'M', 'L') */
  size: string
  /** Configured order quantity (minimum 1) */
  quantity: number
  /** Selected customization placement */
  customizationPlacement?: ShowroomPrintPosition | string
  /** Validated personalization text (name, monogram, coordinates) */
  personalizationText?: string
  /** Base unit price in INR */
  unitBasePrice: number
  /** Personalization surcharge, if applicable */
  customizationSurcharge: number
  /** Final calculated unit price (base + surcharge) */
  finalUnitPrice: number
  /** Final line total (unitPrice * quantity) */
  finalLineTotal: number
  /** Currency code (e.g. 'INR') */
  currency: 'INR' | string
  /** Active image reference for cart thumbnail and preview */
  image: string
}

