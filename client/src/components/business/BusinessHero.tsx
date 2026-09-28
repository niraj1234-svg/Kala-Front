import React from 'react'

export const BusinessHero: React.FC = () => {
  return (
    <div className="kala-biz-header">
      <div className="kala-biz-eyebrow-wrap">
        <span className="kala-biz-eyebrow-dot" aria-hidden="true" />
        <span className="kala-biz-eyebrow">KALA BUSINESS</span>
      </div>
      <h2 id="bulk-order-heading" className="kala-biz-heading">
        Create Custom Apparel for Your Team
      </h2>
      <p className="kala-biz-subheading">
        Custom apparel for companies, colleges, events, gyms and sports teams.
      </p>
    </div>
  )
}

export default BusinessHero
