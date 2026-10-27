import React from 'react'
import { ShowroomContainer } from '../features/apparel-showroom'

/**
 * Showroom Page — Stage 2/5
 * 
 * Replaces development placeholder cards with the physical KALA apparel showroom:
 * - Architectural warm studio environment.
 * - Horizontal brushed-steel clothing rail with suspension cables.
 * - Individually hung garments using verified transparent KALA cutouts.
 * - Functional selection state and accessible keyboard controls.
 */
export const Showroom: React.FC = () => {
  return (
    <div className="kala-showroom-page-wrapper">
      <ShowroomContainer />
    </div>
  )
}

export default Showroom
