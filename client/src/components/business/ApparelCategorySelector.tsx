import React from 'react'
import {
  APPAREL_CATEGORIES,
  type ApparelCategoryId,
  type ApparelCategoryData,
} from '../../data/businessProducts'

interface ApparelCategorySelectorProps {
  selectedCategoryId: ApparelCategoryId
  onSelectCategory: (id: ApparelCategoryId) => void
}

export const ApparelCategorySelector: React.FC<ApparelCategorySelectorProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const activeCategory: ApparelCategoryData =
    APPAREL_CATEGORIES.find((c) => c.id === selectedCategoryId) || APPAREL_CATEGORIES[0]

  return (
    <div className="kala-biz-category-section">
      <div className="kala-biz-field-label">
        <span className="kala-biz-step-badge">1</span>
        <span>Select Apparel</span>
      </div>

      {/* 3 Selectable Category Cards */}
      <div
        className="kala-biz-category-grid"
        role="radiogroup"
        aria-label="Apparel Category Options"
      >
        {APPAREL_CATEGORIES.map((cat) => {
          const isSelected = cat.id === selectedCategoryId
          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`kala-biz-cat-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <div className="kala-biz-cat-top">
                <span className="kala-biz-cat-name">{cat.name}</span>
                <span className="kala-biz-cat-radio" aria-hidden="true" />
              </div>
              <div className="kala-biz-cat-price">
                <span className="kala-biz-price-prefix">Starting from</span>
                <strong className="kala-biz-price-val">₹{cat.startingPrice}</strong>
                <span className="kala-biz-price-unit">/pc</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Clean, Short Product Information for Selected Category */}
      <div className="kala-biz-info-box" aria-live="polite">
        <div className="kala-biz-info-header">
          <strong>{activeCategory.name} Overview</strong>
          <span className="kala-biz-info-price">{activeCategory.startingPriceLabel}</span>
        </div>
        <ul className="kala-biz-feature-list">
          {activeCategory.features.map((feature, idx) => (
            <li key={idx} className="kala-biz-feature-item">
              <span className="kala-biz-check-bullet" aria-hidden="true">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ApparelCategorySelector
