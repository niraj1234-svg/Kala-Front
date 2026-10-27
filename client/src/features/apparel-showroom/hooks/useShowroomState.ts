/**
 * KALA Interactive Apparel Showroom — State Controller Hook
 * 
 * Manages garment selection, per-garment color variant persistence,
 * size selection, detail panel toggle, keyboard navigation,
 * and reduced motion accessibility.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import type {
  ShowroomGarment,
  ShowroomColorVariant,
  ShowroomState,
  ShowroomActions,
} from '../types/showroom'

/**
 * Hook to detect and monitor user reduced-motion preference
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Backwards compatibility for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

export interface UseShowroomStateOptions {
  garments: ShowroomGarment[]
  initialGarmentId?: string
  preloadAssetCount?: number
}

export interface UseShowroomStateReturn {
  state: ShowroomState
  actions: ShowroomActions
  activeGarment: ShowroomGarment | null
  activeVariant: ShowroomColorVariant | null
  activeDisplayImage: string
  handleKeyboardNavigation: (event: React.KeyboardEvent) => void
}

export function useShowroomState({
  garments,
  initialGarmentId,
  preloadAssetCount = 3,
}: UseShowroomStateOptions): UseShowroomStateReturn {
  const prefersReducedMotion = usePrefersReducedMotion()

  const defaultId = useMemo(() => {
    if (initialGarmentId && garments.some((g) => g.id === initialGarmentId)) {
      return initialGarmentId
    }
    return garments[0]?.id || ''
  }, [garments, initialGarmentId])

  // Initialize variant mapping to first variant of each garment
  const initialVariantMap = useMemo(() => {
    const map: Record<string, string> = {}
    garments.forEach((g) => {
      if (g.colorVariants && g.colorVariants.length > 0) {
        map[g.id] = g.colorVariants[0].id
      }
    })
    return map
  }, [garments])

  const [selectedGarmentId, setSelectedGarmentId] = useState<string>(defaultId)
  const [selectedVariantByGarment, setSelectedVariantByGarment] =
    useState<Record<string, string>>(initialVariantMap)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Compute rail index from selected garment
  const railIndex = useMemo(() => {
    const idx = garments.findIndex((g) => g.id === selectedGarmentId)
    return idx >= 0 ? idx : 0
  }, [garments, selectedGarmentId])

  const activeGarment = useMemo(() => {
    return garments.find((g) => g.id === selectedGarmentId) || null
  }, [garments, selectedGarmentId])

  const activeVariant = useMemo(() => {
    if (!activeGarment || !activeGarment.colorVariants.length) return null
    const chosenVariantId = selectedVariantByGarment[activeGarment.id]
    return (
      activeGarment.colorVariants.find((v) => v.id === chosenVariantId) ||
      activeGarment.colorVariants[0] ||
      null
    )
  }, [activeGarment, selectedVariantByGarment])

  const activeDisplayImage = useMemo(() => {
    if (activeVariant?.garmentImage) return activeVariant.garmentImage
    if (activeGarment?.primaryImage) return activeGarment.primaryImage
    return '/mockups/tshirt-black-front.png'
  }, [activeVariant, activeGarment])

  // Preload immediate adjacent garment images for smooth transitions
  useEffect(() => {
    if (typeof window === 'undefined' || garments.length === 0) return

    const imagesToPreload: string[] = []
    const start = Math.max(0, railIndex - 1)
    const end = Math.min(garments.length, railIndex + preloadAssetCount)

    for (let i = start; i < end; i++) {
      const g = garments[i]
      if (g.primaryImage) imagesToPreload.push(g.primaryImage)
      g.colorVariants?.forEach((v) => {
        if (v.garmentImage) imagesToPreload.push(v.garmentImage)
      })
    }

    imagesToPreload.slice(0, 8).forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [railIndex, garments, preloadAssetCount])

  // Select garment and preserve default size selection
  const selectGarment = useCallback(
    (garmentId: string) => {
      const target = garments.find((g) => g.id === garmentId)
      if (!target) {
        setError(`Garment with ID "${garmentId}" not found in showroom.`)
        return
      }
      setError(null)
      setSelectedGarmentId(garmentId)

      // Reset size to first available size of new garment if current size isn't valid
      if (target.sizes.length > 0) {
        const availableSizes = target.sizes.filter((s) => s.inStock)
        if (!selectedSize || !target.sizes.some((s) => s.size === selectedSize && s.inStock)) {
          setSelectedSize(availableSizes[0]?.size || target.sizes[0].size)
        }
      }
    },
    [garments, selectedSize]
  )

  const selectVariant = useCallback((garmentId: string, variantId: string) => {
    setSelectedVariantByGarment((prev) => ({
      ...prev,
      [garmentId]: variantId,
    }))
  }, [])

  const selectSize = useCallback((size: string) => {
    setSelectedSize(size)
  }, [])

  const openDetailPanel = useCallback(() => {
    setIsDetailPanelOpen(true)
  }, [])

  const closeDetailPanel = useCallback(() => {
    setIsDetailPanelOpen(false)
  }, [])

  const toggleDetailPanel = useCallback(() => {
    setIsDetailPanelOpen((prev) => !prev)
  }, [])

  const nextGarment = useCallback(() => {
    if (garments.length === 0) return
    const nextIdx = (railIndex + 1) % garments.length
    selectGarment(garments[nextIdx].id)
  }, [garments, railIndex, selectGarment])

  const previousGarment = useCallback(() => {
    if (garments.length === 0) return
    const prevIdx = (railIndex - 1 + garments.length) % garments.length
    selectGarment(garments[prevIdx].id)
  }, [garments, railIndex, selectGarment])

  const setRailIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < garments.length) {
        selectGarment(garments[index].id)
      }
    },
    [garments, selectGarment]
  )

  const retryAssetLoading = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  // Keyboard navigation handler for the showroom container
  const handleKeyboardNavigation = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          nextGarment()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          previousGarment()
          break
        case 'Escape':
          if (isDetailPanelOpen) {
            event.preventDefault()
            closeDetailPanel()
          }
          break
        case 'Enter':
        case ' ':
          // If panel is closed, space/enter can open it
          if (!isDetailPanelOpen) {
            event.preventDefault()
            openDetailPanel()
          }
          break
        default:
          break
      }
    },
    [nextGarment, previousGarment, isDetailPanelOpen, closeDetailPanel, openDetailPanel]
  )

  const state: ShowroomState = useMemo(
    () => ({
      selectedGarmentId,
      selectedVariantByGarment,
      selectedSize,
      isDetailPanelOpen,
      railIndex,
      isLoading,
      error,
      prefersReducedMotion,
    }),
    [
      selectedGarmentId,
      selectedVariantByGarment,
      selectedSize,
      isDetailPanelOpen,
      railIndex,
      isLoading,
      error,
      prefersReducedMotion,
    ]
  )

  const actions: ShowroomActions = useMemo(
    () => ({
      selectGarment,
      selectVariant,
      selectSize,
      openDetailPanel,
      closeDetailPanel,
      toggleDetailPanel,
      nextGarment,
      previousGarment,
      setRailIndex,
      retryAssetLoading,
    }),
    [
      selectGarment,
      selectVariant,
      selectSize,
      openDetailPanel,
      closeDetailPanel,
      toggleDetailPanel,
      nextGarment,
      previousGarment,
      setRailIndex,
      retryAssetLoading,
    ]
  )

  return {
    state,
    actions,
    activeGarment,
    activeVariant,
    activeDisplayImage,
    handleKeyboardNavigation,
  }
}
