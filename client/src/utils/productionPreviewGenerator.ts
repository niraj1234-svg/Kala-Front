import { type ApparelType, type ViewPosition, isLightColor } from '../components/CustomApparel/ApparelMockup'
import { type ArtworkTransform } from '../components/CustomApparel/DesignControls'

export interface ProductionPreviewParams {
  apparelType: ApparelType
  view: ViewPosition
  color: string
  artworkDataUrl: string
  transform: ArtworkTransform
  width?: number
  height?: number
}

/**
 * Generates a high-resolution production preview PNG combining the blank apparel
 * mockup with the customer's uploaded artwork at the exact coordinates and rotation.
 */
export async function generateProductionPreview({
  apparelType,
  view,
  color,
  artworkDataUrl,
  transform,
  width = 1000,
  height = 1000,
}: ProductionPreviewParams): Promise<string> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve(artworkDataUrl)
        return
      }

      // 1. Clean Studio Background
      ctx.fillStyle = '#FAF9F6'
      ctx.fillRect(0, 0, width, height)

      // Resolve mockup PNG path
      const isBlack = color === 'black' || color === '#18181B' || color.toLowerCase().includes('black')
      const colorKey = isBlack ? 'black' : 'white'
      const viewKey = view === 'front' ? 'front' : 'back'
      const typeKey = apparelType.toLowerCase().includes('hoodie')
        ? 'hoodie'
        : apparelType.toLowerCase().includes('jersey')
        ? 'jersey'
        : 'tshirt'
      const mockupSrc = `/mockups/${typeKey}-${colorKey}-${viewKey}.png`

      // Helper to render artwork and export
      const renderArtworkAndFinish = () => {
        if (!artworkDataUrl) {
          resolve(canvas.toDataURL('image/png', 0.95))
          return
        }

        const artImg = new Image()
        artImg.crossOrigin = 'anonymous'
        artImg.onload = () => {
          try {
            ctx.save()
            const targetX = (transform.x / 100) * width
            const targetY = (transform.y / 100) * height
            const baseSize = width * 0.28 * transform.scale
            const naturalAspect = artImg.naturalWidth && artImg.naturalHeight
              ? artImg.naturalWidth / artImg.naturalHeight
              : 1

            let drawWidth = baseSize
            let drawHeight = baseSize / naturalAspect
            if (naturalAspect < 1) {
              drawHeight = baseSize
              drawWidth = baseSize * naturalAspect
            }

            ctx.translate(targetX, targetY)
            ctx.rotate((transform.rotation * Math.PI) / 180)
            ctx.drawImage(artImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
            ctx.restore()
            resolve(canvas.toDataURL('image/png', 0.95))
          } catch {
            resolve(canvas.toDataURL('image/png', 0.95))
          }
        }
        artImg.onerror = () => {
          resolve(canvas.toDataURL('image/png', 0.95))
        }
        artImg.src = artworkDataUrl
      }

      // Load Mockup Image first
      const mockupImg = new Image()
      mockupImg.crossOrigin = 'anonymous'
      mockupImg.onload = () => {
        try {
          ctx.drawImage(mockupImg, 0, 0, width, height)
          renderArtworkAndFinish()
        } catch {
          drawGarmentMockup(ctx, apparelType, view, color, width, height)
          renderArtworkAndFinish()
        }
      }
      mockupImg.onerror = () => {
        drawGarmentMockup(ctx, apparelType, view, color, width, height)
        renderArtworkAndFinish()
      }
      mockupImg.src = mockupSrc
    } catch {
      resolve(artworkDataUrl)
    }
  })
}

/**
 * Draws the vector contours of the plain garment onto the 2D canvas context
 */
function drawGarmentMockup(
  ctx: CanvasRenderingContext2D,
  apparelType: ApparelType,
  view: ViewPosition,
  color: string,
  w: number,
  h: number
) {
  const isLight = isLightColor(color)
  const seamStroke = isLight ? '#C5CAD1' : '#2D3748'
  const shadowAlpha = isLight ? 0.12 : 0.40

  ctx.save()
  // Scale canvas context to 500x500 reference vector coordinate system
  ctx.scale(w / 500, h / 500)

  // Soft garment drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 12

  // Silhouette Path
  ctx.beginPath()

  if (apparelType === 'tshirt') {
    if (view === 'front') {
      ctx.moveTo(175, 68)
      ctx.bezierCurveTo(195, 95, 305, 95, 325, 68)
      ctx.lineTo(425, 115)
      ctx.lineTo(375, 198)
      ctx.lineTo(330, 174)
      ctx.lineTo(335, 432)
      ctx.arcTo(335, 440, 326, 440, 5)
      ctx.lineTo(174, 440)
      ctx.arcTo(165, 440, 165, 432, 5)
      ctx.lineTo(170, 174)
      ctx.lineTo(125, 198)
      ctx.lineTo(75, 115)
      ctx.closePath()
    } else if (view === 'back') {
      ctx.moveTo(175, 64)
      ctx.bezierCurveTo(210, 75, 290, 75, 325, 64)
      ctx.lineTo(425, 115)
      ctx.lineTo(375, 198)
      ctx.lineTo(330, 174)
      ctx.lineTo(335, 432)
      ctx.arcTo(335, 440, 326, 440, 5)
      ctx.lineTo(174, 440)
      ctx.arcTo(165, 440, 165, 432, 5)
      ctx.lineTo(170, 174)
      ctx.lineTo(125, 198)
      ctx.lineTo(75, 115)
      ctx.closePath()
    } else {
      // Side view
      ctx.moveTo(215, 68)
      ctx.bezierCurveTo(230, 68, 250, 78, 275, 88)
      ctx.lineTo(320, 180)
      ctx.lineTo(275, 220)
      ctx.lineTo(260, 175)
      ctx.lineTo(275, 432)
      ctx.lineTo(194, 440)
      ctx.lineTo(180, 170)
      ctx.closePath()
    }
  } else if (apparelType === 'hoodie') {
    ctx.moveTo(180, 78)
    ctx.lineTo(215, 48)
    ctx.bezierCurveTo(235, 44, 265, 44, 285, 48)
    ctx.lineTo(320, 78)
    ctx.lineTo(435, 125)
    ctx.lineTo(395, 240)
    ctx.lineTo(345, 200)
    ctx.lineTo(345, 420)
    ctx.lineTo(155, 420)
    ctx.lineTo(155, 200)
    ctx.lineTo(105, 240)
    ctx.lineTo(65, 125)
    ctx.closePath()
  } else {
    // Jersey
    ctx.moveTo(180, 65)
    ctx.lineTo(250, 115)
    ctx.lineTo(320, 65)
    ctx.lineTo(420, 110)
    ctx.lineTo(375, 190)
    ctx.lineTo(332, 165)
    ctx.lineTo(336, 435)
    ctx.lineTo(172, 442)
    ctx.lineTo(168, 165)
    ctx.lineTo(125, 190)
    ctx.lineTo(80, 110)
    ctx.closePath()
  }

  // Fill Base Garment Color
  ctx.fillStyle = color
  ctx.fill()

  // Reset shadow for inner strokes and shading
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  ctx.strokeStyle = seamStroke
  ctx.lineWidth = 1.4
  ctx.stroke()

  // Subtle Torso Contour Shade
  const gradient = ctx.createLinearGradient(0, 0, 500, 0)
  gradient.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`)
  gradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.02)')
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)')
  gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.02)')
  gradient.addColorStop(1, `rgba(0, 0, 0, ${shadowAlpha})`)
  ctx.fillStyle = gradient
  ctx.fill()

  // Collar Outline for Front T-Shirt
  if (apparelType === 'tshirt' && view === 'front') {
    ctx.beginPath()
    ctx.moveTo(175, 68)
    ctx.bezierCurveTo(200, 102, 300, 102, 325, 68)
    ctx.bezierCurveTo(305, 84, 195, 84, 175, 68)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = seamStroke
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // Hood for Hoodie
  if (apparelType === 'hoodie') {
    ctx.beginPath()
    ctx.moveTo(195, 82)
    ctx.bezierCurveTo(195, 40, 230, 24, 250, 24)
    ctx.bezierCurveTo(270, 24, 305, 40, 305, 82)
    ctx.bezierCurveTo(285, 96, 215, 96, 195, 82)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = seamStroke
    ctx.lineWidth = 1.6
    ctx.stroke()
  }

  ctx.restore()
}
