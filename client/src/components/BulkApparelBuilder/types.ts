export type ApparelId = 'tshirt' | 'hoodie' | 'jersey'
export type ApparelColor = 'black' | 'white'
export type ApparelSide = 'front' | 'back'

export interface UploadedApparelImage {
  dataUrl: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedSide?: ApparelSide
}

export interface SideCustomization {
  artworkUrl: string // URL or data URL
  artworkName: string
  artworkType: string
  x: number // percentage 0-100 (center of printable area)
  y: number // percentage 0-100 (center of printable area)
  size: number // px width (e.g. 80)
  rotation?: number
}

export interface ApparelCustomizationState {
  tshirt: {
    front: SideCustomization
    back: SideCustomization
  }
  hoodie: {
    front: SideCustomization
    back: SideCustomization
  }
  jersey: {
    front: SideCustomization
    back: SideCustomization
  }
}

export interface ApparelProductConfig {
  id: ApparelId
  name: string
  startingPrice: number
  startingPriceLabel: string
  features: string[]
  icon: string
  mockups: {
    black: {
      front: string
      back: string
    }
    white: {
      front: string
      back: string
    }
  }
  printableBounds: {
    front: { minX: number; maxX: number; minY: number; maxY: number }
    back: { minX: number; maxX: number; minY: number; maxY: number }
  }
}

export type SizeKey = 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type SizeQuantities = Record<SizeKey, number>

export interface BulkApparelSubmission {
  productType: ApparelId
  productName: string
  color: ApparelColor
  quantity: number
  sizeBreakdown?: string
  estimatedUnitPrice: number
  estimatedTotal: number
  front: {
    design: string
    fileName: string
    position: { x: number; y: number }
    size: number
  }
  back: {
    design: string
    fileName: string
    position: { x: number; y: number }
    size: number
  }
  requirementDetails: string
  timestamp: string
  userId?: string
  frontPreviewUrl?: string
  backPreviewUrl?: string
}
