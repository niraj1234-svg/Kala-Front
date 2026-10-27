/**
 * KALA Interactive Apparel Showroom Feature Module — Stage 1 Foundation
 * 
 * Exports domain types, curated development fixtures, interaction state hooks,
 * and scoped design tokens.
 */

// Domain Types
export * from './types/showroom'

// Development Fixtures & Utilities
export * from './data/showroomFixtures'

// Interaction & Accessibility Hooks
export * from './hooks/useShowroomState'

// Components
export * from './components/ShowroomContainer'
export * from './components/ClothingRail'
export * from './components/Hanger'
export * from './components/ProductInspectionDrawer'
export * from './components/Garment360Viewer'
export * from './components/GarmentAlternateViewer'

// Utilities & Asset Preloaders
export * from './utils/turntablePreloader'

// Design Tokens & Isolated Scoped Styles
import './styles/showroom.tokens.css'
