import React, { useEffect } from 'react'
import BulkApparelBuilder from '../components/BulkApparelBuilder/BulkApparelBuilder'

export const CustomApparel: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = 'Create Custom Apparel | Bulk Orders & Team Merch | KALA'
  }, [])

  return (
    <main className="kala-custom-apparel-workspace-page">
      <BulkApparelBuilder />
    </main>
  )
}

export default CustomApparel
