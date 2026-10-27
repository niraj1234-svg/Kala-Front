/**
 * KALA Interactive Apparel Showroom — 360 Turntable Asset Preloader & Utilities
 * 
 * Verifies and manages frame sequences for multi-angle turntable inspection.
 * In Stage 3, this prepares asset preloading and provides configuration metadata
 * for Stage 4's interactive detail inspection.
 */

// 24 verified frames for the signature Oversized T-Shirt (0° to 345° in 15° increments)
export const TSHIRT_360_FRAMES: string[] = Array.from({ length: 24 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0')
  return `/products/tshirt-360/${num}.png`
})

export interface TurntableConfig {
  supported: boolean
  garmentId: string
  frames: string[]
  frameCount: number
  rotationStepDeg: number
  dimensions: { width: number; height: number }
  notes: string
}

const cachedLoadedFrames: Record<string, HTMLImageElement[]> = {}

/**
 * Returns turntable sequence configuration and verified assets for a given garment.
 */
export function getGarmentTurntableConfig(garmentId: string): TurntableConfig {
  if (garmentId === 'kala-sig-heavyweight-tee') {
    return {
      supported: true,
      garmentId,
      frames: TSHIRT_360_FRAMES,
      frameCount: 24,
      rotationStepDeg: 15,
      dimensions: { width: 1024, height: 935 },
      notes: '24-frame continuous turntable sequence with 15-degree rotation intervals.',
    }
  }

  // Hoodies, polos, and athletic jerseys currently use multi-view front/back transparent mockups
  return {
    supported: false,
    garmentId,
    frames: [],
    frameCount: 0,
    rotationStepDeg: 0,
    dimensions: { width: 1024, height: 1024 },
    notes: 'Static multi-angle studio cutouts (front and back alternate views).',
  }
}

/**
 * Preloads a frame sequence into browser cache with optional progress callback.
 * Ensures zero lag when Stage 4 mounts interactive rotation.
 */
export function preloadTurntableFrames(
  frames: string[],
  onProgress?: (loadedCount: number, total: number) => void
): Promise<HTMLImageElement[]> {
  const cacheKey = frames.join(',')
  if (cachedLoadedFrames[cacheKey]) {
    onProgress?.(frames.length, frames.length)
    return Promise.resolve(cachedLoadedFrames[cacheKey])
  }

  if (typeof window === 'undefined') {
    return Promise.resolve([])
  }

  let loadedCount = 0
  const total = frames.length

  const loadPromises = frames.map((src) => {
    return new Promise<HTMLImageElement>((resolve) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        loadedCount++
        onProgress?.(loadedCount, total)
        resolve(img)
      }
      img.onerror = () => {
        loadedCount++
        onProgress?.(loadedCount, total)
        resolve(img) // Resolve anyway to avoid blocking the batch
      }
    })
  })

  return Promise.all(loadPromises).then((images) => {
    cachedLoadedFrames[cacheKey] = images
    return images
  })
}
