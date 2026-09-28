import React from 'react'
import { BULK_CATEGORIES, type BulkCategory } from '../../data/bulkPricing'

interface ProductCategorySelectorProps {
  selectedCategory: BulkCategory
  onSelectCategory: (category: BulkCategory) => void
}

export const ProductCategorySelector: React.FC<ProductCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="kala-bulk-cat-section">
      <div className="kala-bulk-cat-header">
        <span className="kala-bulk-step-num">1</span>
        <h4 className="kala-bulk-step-title">Select Apparel Category</h4>
      </div>

      <div
        className="kala-bulk-cat-grid"
        role="tablist"
        aria-label="Apparel categories"
      >
        {BULK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`kala-bulk-cat-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <div className="kala-bulk-cat-emoji" aria-hidden="true">
                {cat.emoji}
              </div>
              <div className="kala-bulk-cat-info">
                <span className="kala-bulk-cat-name">{cat.name}</span>
                <span className="kala-bulk-cat-start">
                  From ₹{cat.startingPrice}/pc
                </span>
              </div>
              {isSelected && (
                <div className="kala-bulk-cat-check" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProductCategorySelector
