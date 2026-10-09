import React from 'react'
import '../styles/StreetwearMarquee.css'

const MARQUEE_ITEMS = [
  '220 GSM HEAVYWEIGHT COTTON',
  'AUTHENTIC STREETWEAR',
  'ROOTED IN BIHAR',
  'PAN-INDIA EXPRESS DISPATCH',
  'LIMITED RUN DROPS',
  'SCREEN PRINT & EMBROIDERY',
  'OVERSIZED LUXURY FIT',
  '4.9★ RATED BY CREATORS',
]

export const StreetwearMarquee: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  return (
    <div className={`kala-streetwear-marquee ${theme}`} aria-hidden="true">
      <div className="kala-marquee-track">
        {/* Double array for seamless infinite CSS loop */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
          <span key={idx} className="kala-marquee-item">
            <span className="kala-marquee-spark">✦</span>
            <span className="kala-marquee-text">{item}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default StreetwearMarquee
