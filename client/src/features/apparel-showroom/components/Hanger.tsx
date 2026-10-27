import React from 'react'

export interface HangerProps {
  className?: string
  isActive?: boolean
  style?: React.CSSProperties
  width?: number
  height?: number
}

/**
 * Physical Apparel Hanger Component
 * 
 * Renders an architectural, contoured clothing hanger with:
 * - A dark-steel hook that curves over the clothing rail.
 * - An ergonomic shoulder yoke matching garment neckline contours.
 * - Layered metallic highlights and wall drop-shadows.
 */
export const Hanger: React.FC<HangerProps> = ({
  className = '',
  isActive = false,
  style,
  width = 160,
  height = 90,
}) => {
  return (
    <div
      className={`kala-showroom-hanger ${isActive ? 'is-active' : ''} ${className}`}
      style={style}
      aria-hidden="true"
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 160 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="kala-showroom-hanger-svg"
      >
        <defs>
          {/* Hook metallic gradient */}
          <linearGradient id="hangerHookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A4A4E" />
            <stop offset="50%" stopColor="#252528" />
            <stop offset="100%" stopColor="#121214" />
          </linearGradient>

          {/* Active hook accent gradient */}
          <linearGradient id="hangerHookActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A33" />
            <stop offset="60%" stopColor="#D94700" />
            <stop offset="100%" stopColor="#8C2C00" />
          </linearGradient>

          {/* Wood / matte shoulder beam gradient */}
          <linearGradient id="hangerBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2E2E32" />
            <stop offset="40%" stopColor="#202022" />
            <stop offset="100%" stopColor="#141416" />
          </linearGradient>

          {/* Wall drop shadow */}
          <filter id="hangerShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.22" />
          </filter>
        </defs>

        <g filter="url(#hangerShadow)">
          {/* 1. Metal Hook curving over the rail */}
          {/* Rail is at y = 14 */}
          <path
            d="M 80 42 
               L 80 26 
               C 80 18, 86 10, 94 10 
               C 101 10, 106 14, 106 20 
               C 106 24, 102 27, 98 27"
            stroke={isActive ? 'url(#hangerHookActiveGrad)' : 'url(#hangerHookGrad)'}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Swivel collar joint */}
          <rect
            x="77.5"
            y="40"
            width="5"
            height="5"
            rx="1.5"
            fill={isActive ? '#D94700' : '#4E4E52'}
          />

          {/* 2. Contoured Hanger Shoulder Yoke */}
          <path
            d="M 12 76 
               Q 44 58, 77 44 
               L 83 44 
               Q 116 58, 148 76 
               Q 146 80, 142 80 
               Q 114 65, 83 52 
               L 77 52 
               Q 46 65, 18 80 
               Q 14 80, 12 76 Z"
            fill="url(#hangerBeamGrad)"
          />

          {/* Shoulder highlight top edge */}
          <path
            d="M 14 76 Q 45 59, 78 45 L 82 45 Q 115 59, 146 76"
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth="0.8"
            fill="none"
          />

          {/* 3. Lower tie / cross bar */}
          <line
            x1="26"
            y1="75"
            x2="134"
            y2="75"
            stroke="#242426"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
        </g>
      </svg>
    </div>
  )
}

export default Hanger
