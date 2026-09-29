import React from 'react'

export type ApparelType = 'tshirt' | 'hoodie' | 'jersey'
export type ViewPosition = 'front' | 'back' | 'left' | 'right'

export interface PrintableBounds {
  x: number // percentage 0-100
  y: number // percentage 0-100
  width: number // percentage 0-100
  height: number // percentage 0-100
}

/**
 * Printable area boundaries for each apparel type and view position
 * Expressed as percentages of the 500x500 stage coordinate system.
 */
export const PRINTABLE_AREAS: Record<ApparelType, Record<ViewPosition, PrintableBounds>> = {
  tshirt: {
    front: { x: 30, y: 24, width: 40, height: 48 },
    back: { x: 30, y: 20, width: 40, height: 52 },
    left: { x: 32, y: 26, width: 36, height: 42 },
    right: { x: 32, y: 26, width: 36, height: 42 },
  },
  hoodie: {
    front: { x: 30, y: 28, width: 40, height: 36 },
    back: { x: 30, y: 24, width: 40, height: 48 },
    left: { x: 32, y: 28, width: 36, height: 40 },
    right: { x: 32, y: 28, width: 36, height: 40 },
  },
  jersey: {
    front: { x: 29, y: 25, width: 42, height: 46 },
    back: { x: 29, y: 20, width: 42, height: 52 },
    left: { x: 32, y: 25, width: 36, height: 42 },
    right: { x: 32, y: 25, width: 36, height: 42 },
  },
}

interface ApparelMockupProps {
  apparelType: ApparelType
  view: ViewPosition
  color: string // Hex color string, e.g. '#FFFFFF', '#18181B'
  showPrintableArea?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Returns whether a color is considered light or dark
 */
export function isLightColor(hex: string): boolean {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]
  const r = parseInt(c.substring(0, 2), 16) || 0
  const g = parseInt(c.substring(2, 4), 16) || 0
  const b = parseInt(c.substring(4, 6), 16) || 0
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 140
}

export const ApparelMockup: React.FC<ApparelMockupProps> = ({
  apparelType,
  view,
  color,
  showPrintableArea = true,
  className = '',
  children,
}) => {
  const isLight = isLightColor(color)
  const shadowOpacity = isLight ? 0.14 : 0.45
  const highlightOpacity = isLight ? 0.35 : 0.12
  const seamStroke = isLight ? '#C5CAD1' : '#2D3748'
  const printBounds = PRINTABLE_AREAS[apparelType][view]

  const renderGarmentPaths = () => {
    switch (apparelType) {
      case 'tshirt':
        return renderTShirtPaths(view, color, seamStroke, shadowOpacity, highlightOpacity)
      case 'hoodie':
        return renderHoodiePaths(view, color, seamStroke, shadowOpacity, highlightOpacity)
      case 'jersey':
        return renderJerseyPaths(view, color, seamStroke, shadowOpacity, highlightOpacity)
      default:
        return renderTShirtPaths(view, color, seamStroke, shadowOpacity, highlightOpacity)
    }
  }

  return (
    <div
      className={`kala-mockup-wrapper relative w-full h-full select-none ${className}`}
      style={{ aspectRatio: '1 / 1' }}
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle Stage Drop Shadow */}
          <filter id="garment-shadow" x="-8%" y="-8%" width="116%" height="120%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.10" />
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.05" />
          </filter>

          {/* Shading Gradients */}
          <linearGradient id="body-shade-horizontal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
            <stop offset="15%" stopColor="#000000" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
          </linearGradient>

          <linearGradient id="fold-shade-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.08" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.06" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.24" />
          </linearGradient>
        </defs>

        {/* 1. Base Garment Vector Silhouette + Shading */}
        <g filter="url(#garment-shadow)">
          {renderGarmentPaths()}
        </g>

        {/* 2. Printable Area Boundary (Guide Box) */}
        {showPrintableArea && (
          <g className="kala-printable-guide" opacity="0.85">
            <rect
              x={`${printBounds.x}%`}
              y={`${printBounds.y}%`}
              width={`${printBounds.width}%`}
              height={`${printBounds.height}%`}
              fill="rgba(217, 71, 0, 0.02)"
              stroke="#D94700"
              strokeWidth="1.4"
              strokeDasharray="5,4"
              rx="4"
              pointerEvents="none"
            />
            {/* Corner Markers */}
            <circle cx={`${printBounds.x}%`} cy={`${printBounds.y}%`} r="2.5" fill="#D94700" />
            <circle cx={`${printBounds.x + printBounds.width}%`} cy={`${printBounds.y}%`} r="2.5" fill="#D94700" />
            <circle cx={`${printBounds.x}%`} cy={`${printBounds.y + printBounds.height}%`} r="2.5" fill="#D94700" />
            <circle cx={`${printBounds.x + printBounds.width}%`} cy={`${printBounds.y + printBounds.height}%`} r="2.5" fill="#D94700" />
          </g>
        )}
      </svg>

      {/* 3. Interactive Artwork Placement Canvas / Container */}
      <div
        className="kala-mockup-artwork-overlay absolute inset-0 pointer-events-none"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ==========================================================================
   T-SHIRT VECTOR PATHS (Front, Back, Left, Right)
   ========================================================================== */
function renderTShirtPaths(
  view: ViewPosition,
  color: string,
  seamStroke: string,
  shadowOpacity: number,
  _highlightOpacity: number
) {
  if (view === 'front') {
    return (
      <g id="tshirt-front">
        {/* Main Body + Sleeves Contour */}
        <path
          d="M 175 68
             C 195 95 305 95 325 68
             L 425 115
             L 375 198
             L 330 174
             L 335 432
             C 335 436 331 440 326 440
             L 174 440
             C 169 440 165 436 165 432
             L 170 174
             L 125 198
             L 75 115
             Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.2"
        />

        {/* Shading Overlay */}
        <path
          d="M 175 68 C 195 95 305 95 325 68 L 425 115 L 375 198 L 330 174 L 335 432 C 335 436 331 440 326 440 L 174 440 C 169 440 165 436 165 432 L 170 174 L 125 198 L 75 115 Z"
          fill="url(#body-shade-horizontal)"
          opacity={shadowOpacity}
        />
        <path
          d="M 165 174 L 335 174 L 335 440 L 165 440 Z"
          fill="url(#fold-shade-vertical)"
          opacity={shadowOpacity * 0.8}
        />

        {/* Collar Ribbing & Stitching */}
        <path
          d="M 175 68 C 200 102 300 102 325 68 C 305 84 195 84 175 68 Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.5"
          filter="brightness(0.96)"
        />
        <path
          d="M 183 72 C 205 96 295 96 317 72"
          fill="none"
          stroke={seamStroke}
          strokeWidth="0.8"
          strokeDasharray="2,2"
        />

        {/* Sleeve Seams */}
        <path d="M 170 174 C 185 130 195 98 205 80" fill="none" stroke={seamStroke} strokeWidth="1" opacity="0.65" />
        <path d="M 330 174 C 315 130 305 98 295 80" fill="none" stroke={seamStroke} strokeWidth="1" opacity="0.65" />

        {/* Underarm Subtle Shadow Creases */}
        <path d="M 170 176 C 182 195 190 220 188 245" fill="none" stroke="#000000" strokeWidth="2.5" opacity={shadowOpacity * 1.5} strokeLinecap="round" />
        <path d="M 330 176 C 318 195 310 220 312 245" fill="none" stroke="#000000" strokeWidth="2.5" opacity={shadowOpacity * 1.5} strokeLinecap="round" />

        {/* Hemline Stitching */}
        <line x1="166" y1="428" x2="334" y2="428" stroke={seamStroke} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.75" />
      </g>
    )
  }

  if (view === 'back') {
    return (
      <g id="tshirt-back">
        {/* Main Body + Sleeves Contour */}
        <path
          d="M 175 64
             C 210 75 290 75 325 64
             L 425 115
             L 375 198
             L 330 174
             L 335 432
             C 335 436 331 440 326 440
             L 174 440
             C 169 440 165 436 165 432
             L 170 174
             L 125 198
             L 75 115
             Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.2"
        />

        {/* Shading */}
        <path
          d="M 175 64 C 210 75 290 75 325 64 L 425 115 L 375 198 L 330 174 L 335 432 C 335 436 331 440 326 440 L 174 440 C 169 440 165 436 165 432 L 170 174 L 125 198 L 75 115 Z"
          fill="url(#body-shade-horizontal)"
          opacity={shadowOpacity}
        />

        {/* High Back Collar */}
        <path
          d="M 175 64 C 210 76 290 76 325 64 C 305 70 195 70 175 64 Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.5"
        />
        <path
          d="M 180 67 C 212 78 288 78 320 67"
          fill="none"
          stroke={seamStroke}
          strokeWidth="0.8"
          strokeDasharray="2,2"
        />

        {/* Raglan / Shoulder Stitch Lines */}
        <path d="M 170 174 C 185 130 195 98 205 75" fill="none" stroke={seamStroke} strokeWidth="1" opacity="0.65" />
        <path d="M 330 174 C 315 130 305 98 295 75" fill="none" stroke={seamStroke} strokeWidth="1" opacity="0.65" />

        {/* Hemline Stitching */}
        <line x1="166" y1="428" x2="334" y2="428" stroke={seamStroke} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.75" />
      </g>
    )
  }

  // Left & Right Side Views
  const isRight = view === 'right'
  const transform = isRight ? 'translate(500, 0) scale(-1, 1)' : ''

  return (
    <g id={`tshirt-${view}`} transform={transform}>
      {/* Side Torso & Sleeve Profile */}
      <path
        d="M 215 68
           C 230 68 250 78 275 88
           L 320 180
           L 275 220
           L 260 175
           L 275 432
           C 275 436 271 440 266 440
           L 194 440
           C 189 440 185 436 185 432
           L 180 170
           C 180 130 190 90 215 68
           Z"
        fill={color}
        stroke={seamStroke}
        strokeWidth="1.2"
      />
      <path
        d="M 215 68 C 230 68 250 78 275 88 L 320 180 L 275 220 L 260 175 L 275 432 C 275 436 271 440 266 440 L 194 440 C 189 440 185 436 185 432 L 180 170 C 180 130 190 90 215 68 Z"
        fill="url(#body-shade-horizontal)"
        opacity={shadowOpacity}
      />
      {/* Sleeve Seam */}
      <path d="M 215 85 C 240 120 250 150 260 175" fill="none" stroke={seamStroke} strokeWidth="1" opacity="0.7" />
      {/* Side Seam Down Torso */}
      <line x1="228" y1="180" x2="228" y2="440" stroke={seamStroke} strokeWidth="0.9" opacity="0.6" strokeDasharray="3,2" />
    </g>
  )
}

/* ==========================================================================
   HOODIE VECTOR PATHS (Front, Back, Left, Right)
   ========================================================================== */
function renderHoodiePaths(
  view: ViewPosition,
  color: string,
  seamStroke: string,
  shadowOpacity: number,
  _highlightOpacity: number
) {
  if (view === 'front') {
    return (
      <g id="hoodie-front">
        {/* Main Body + Boxy Sleeves */}
        <path
          d="M 180 78
             L 215 48
             C 235 44 265 44 285 48
             L 320 78
             L 435 125
             L 395 240
             L 345 200
             L 345 420
             C 345 425 341 430 336 430
             L 164 430
             C 159 430 155 425 155 420
             L 155 200
             L 105 240
             L 65 125
             Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.3"
        />

        {/* Shading */}
        <path
          d="M 180 78 L 215 48 C 235 44 265 44 285 48 L 320 78 L 435 125 L 395 240 L 345 200 L 345 420 C 345 425 341 430 336 430 L 164 430 C 159 430 155 425 155 420 L 155 200 L 105 240 L 65 125 Z"
          fill="url(#body-shade-horizontal)"
          opacity={shadowOpacity}
        />

        {/* Hood Structure */}
        <path
          d="M 195 82
             C 195 40 230 24 250 24
             C 270 24 305 40 305 82
             C 285 96 215 96 195 82 Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.6"
          filter="brightness(0.97)"
        />
        {/* Inner Hood Shadow */}
        <path
          d="M 215 80 C 230 92 270 92 285 80 C 275 60 225 60 215 80 Z"
          fill="#000000"
          opacity={shadowOpacity * 1.8}
        />

        {/* Drawstrings */}
        <path d="M 230 88 Q 228 125 224 150" fill="none" stroke={seamStroke} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 270 88 Q 272 125 276 150" fill="none" stroke={seamStroke} strokeWidth="2.5" strokeLinecap="round" />
        {/* Metal Eyelets */}
        <circle cx="230" cy="88" r="3" fill="#A0AEC0" stroke="#4A5568" strokeWidth="0.8" />
        <circle cx="270" cy="88" r="3" fill="#A0AEC0" stroke="#4A5568" strokeWidth="0.8" />

        {/* Kangaroo Pocket */}
        <path
          d="M 190 320
             L 310 320
             L 330 395
             L 170 395
             Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.4"
          filter="brightness(0.98)"
        />
        <path d="M 190 320 L 170 395" stroke={seamStroke} strokeWidth="1.2" strokeDasharray="3,2" />
        <path d="M 310 320 L 330 395" stroke={seamStroke} strokeWidth="1.2" strokeDasharray="3,2" />

        {/* Ribbed Hem & Cuffs */}
        <rect x="155" y="415" width="190" height="22" fill={color} stroke={seamStroke} strokeWidth="1" filter="brightness(0.95)" />
        <line x1="155" y1="415" x2="345" y2="415" stroke={seamStroke} strokeWidth="1.2" />
      </g>
    )
  }

  if (view === 'back') {
    return (
      <g id="hoodie-back">
        <path
          d="M 180 78 L 215 48 C 235 44 265 44 285 48 L 320 78 L 435 125 L 395 240 L 345 200 L 345 420 C 345 425 341 430 336 430 L 164 430 C 159 430 155 425 155 420 L 155 200 L 105 240 L 65 125 Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.3"
        />
        <path
          d="M 180 78 L 215 48 C 235 44 265 44 285 48 L 320 78 L 435 125 L 395 240 L 345 200 L 345 420 C 345 425 341 430 336 430 L 164 430 C 159 430 155 425 155 420 L 155 200 L 105 240 L 65 125 Z"
          fill="url(#body-shade-horizontal)"
          opacity={shadowOpacity}
        />

        {/* Back Hood Outline & Seams */}
        <path
          d="M 185 75 C 185 30 220 18 250 18 C 280 18 315 30 315 75 C 290 105 210 105 185 75 Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.5"
        />
        <path d="M 250 18 L 250 88" stroke={seamStroke} strokeWidth="1.2" strokeDasharray="3,2" />

        {/* Ribbed Hem */}
        <rect x="155" y="415" width="190" height="22" fill={color} stroke={seamStroke} strokeWidth="1" filter="brightness(0.95)" />
      </g>
    )
  }

  // Left & Right Side Views
  const isRight = view === 'right'
  const transform = isRight ? 'translate(500, 0) scale(-1, 1)' : ''

  return (
    <g id={`hoodie-${view}`} transform={transform}>
      <path
        d="M 220 70
           C 200 45 220 20 250 20
           C 275 20 290 40 300 70
           L 345 185
           L 295 240
           L 270 190
           L 280 420
           C 280 425 276 430 271 430
           L 189 430
           C 184 430 180 425 180 420
           L 175 180
           Z"
        fill={color}
        stroke={seamStroke}
        strokeWidth="1.3"
      />
      <path
        d="M 220 70 C 200 45 220 20 250 20 C 275 20 290 40 300 70 L 345 185 L 295 240 L 270 190 L 280 420 C 280 425 276 430 271 430 L 189 430 C 184 430 180 425 180 420 L 175 180 Z"
        fill="url(#body-shade-horizontal)"
        opacity={shadowOpacity}
      />
      {/* Side Hood Outline */}
      <path d="M 210 65 C 200 35 225 20 250 20 C 275 20 295 40 295 75" fill="none" stroke={seamStroke} strokeWidth="1.5" />
    </g>
  )
}

/* ==========================================================================
   JERSEY VECTOR PATHS (Athletic Esports Cut, V-Neck, Raglan)
   ========================================================================== */
function renderJerseyPaths(
  view: ViewPosition,
  color: string,
  seamStroke: string,
  shadowOpacity: number,
  _highlightOpacity: number
) {
  if (view === 'front') {
    return (
      <g id="jersey-front">
        {/* Athletic Torso & Short Raglan Sleeves */}
        <path
          d="M 180 65
             L 250 115
             L 320 65
             L 420 110
             L 375 190
             L 332 165
             L 336 435
             C 336 439 332 442 328 442
             L 172 442
             C 168 442 164 439 164 435
             L 168 165
             L 125 190
             L 80 110
             Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.3"
        />

        {/* Shading */}
        <path
          d="M 180 65 L 250 115 L 320 65 L 420 110 L 375 190 L 332 165 L 336 435 C 336 439 332 442 328 442 L 172 442 C 168 442 164 439 164 435 L 168 165 L 125 190 L 80 110 Z"
          fill="url(#body-shade-horizontal)"
          opacity={shadowOpacity}
        />

        {/* Athletic V-Neck Collar */}
        <path
          d="M 180 65 L 250 115 L 320 65 L 310 58 L 250 102 L 190 58 Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.6"
          filter="brightness(0.95)"
        />

        {/* Raglan Sleeve Seams */}
        <line x1="180" y1="65" x2="168" y2="165" stroke={seamStroke} strokeWidth="1.2" />
        <line x1="320" y1="65" x2="332" y2="165" stroke={seamStroke} strokeWidth="1.2" />

        {/* Athletic Breathable Side Mesh Panels */}
        <path d="M 168 165 L 180 165 L 182 440 L 164 440 Z" fill="#000000" opacity="0.08" />
        <path d="M 332 165 L 320 165 L 318 440 L 336 440 Z" fill="#000000" opacity="0.08" />
      </g>
    )
  }

  if (view === 'back') {
    return (
      <g id="jersey-back">
        {/* Back Torso */}
        <path
          d="M 180 62
             C 215 72 285 72 320 62
             L 420 110
             L 375 190
             L 332 165
             L 336 435
             C 336 439 332 442 328 442
             L 172 442
             C 168 442 164 439 164 435
             L 168 165
             L 125 190
             L 80 110
             Z"
          fill={color}
          stroke={seamStroke}
          strokeWidth="1.3"
        />

        {/* Shading */}
        <path
          d="M 180 62 C 215 72 285 72 320 62 L 420 110 L 375 190 L 332 165 L 336 435 C 336 439 332 442 328 442 L 172 442 C 168 442 164 439 164 435 L 168 165 L 125 190 L 80 110 Z"
          fill="url(#body-shade-horizontal)"
          opacity={shadowOpacity}
        />

        {/* Back Neck Trim */}
        <path d="M 180 62 C 215 72 285 72 320 62" fill="none" stroke={seamStroke} strokeWidth="2" />

        {/* Raglan Seams */}
        <line x1="180" y1="62" x2="168" y2="165" stroke={seamStroke} strokeWidth="1.2" />
        <line x1="320" y1="62" x2="332" y2="165" stroke={seamStroke} strokeWidth="1.2" />
      </g>
    )
  }

  // Left & Right Side Views
  const isRight = view === 'right'
  const transform = isRight ? 'translate(500, 0) scale(-1, 1)' : ''

  return (
    <g id={`jersey-${view}`} transform={transform}>
      <path
        d="M 215 65
           L 275 85
           L 320 175
           L 275 215
           L 260 170
           L 275 435
           C 275 439 271 442 266 442
           L 194 442
           C 189 442 185 439 185 435
           L 180 165
           Z"
        fill={color}
        stroke={seamStroke}
        strokeWidth="1.3"
      />
      <path
        d="M 215 65 L 275 85 L 320 175 L 275 215 L 260 170 L 275 435 C 275 439 271 442 266 442 L 194 442 C 189 442 185 439 185 435 L 180 165 Z"
        fill="url(#body-shade-horizontal)"
        opacity={shadowOpacity}
      />
      {/* Side Athletic Piping */}
      <line x1="228" y1="170" x2="228" y2="442" stroke={seamStroke} strokeWidth="1.5" />
    </g>
  )
}

export default ApparelMockup
