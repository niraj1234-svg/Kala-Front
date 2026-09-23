// Product image map using Vite's compile-time glob import
const imageMap: Record<string, string> = import.meta.glob('/images/*', {
  eager: true,
  import: 'default',
})

export function getProductImage(filename: string): string {
  if (!filename) return ''
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('data:')) {
    return filename
  }
  const cleanName = filename.replace(/^\/?(images\/)?/, '')
  const path = `/images/${cleanName}`
  return imageMap[path] || imageMap[decodeURIComponent(path)] || path
}

export interface ProductColorVariant {
  color: string
  colorName: string
  image: string
}

export interface Product {
  id: string
  name: string
  category: 'Streetwear' | 'Gaming' | 'Gymwear'
  price: number
  image: string
  images?: string[]
  description: string
  available: boolean
  variants?: ProductColorVariant[]
}

export interface ProductHighlight {
  label: string
  value: string
}

export function isTShirtProduct(product: Product): boolean {
  const name = product.name.toLowerCase()
  const id = product.id.toLowerCase()
  return (
    name.includes('tee') ||
    name.includes('t-shirt') ||
    name.includes('jersey') ||
    id.includes('tee') ||
    id.includes('jersey')
  )
}

export function getProductHighlights(product: Product): ProductHighlight[] {
  if (!isTShirtProduct(product)) {
    return []
  }

  const id = product.id.toLowerCase()
  const desc = product.description.toLowerCase()
  const name = product.name.toLowerCase()
  const highlights: ProductHighlight[] = []

  // 1. Sleeve
  if (name.includes('longsleeve') || desc.includes('longsleeve') || id.includes('longsleeve')) {
    highlights.push({ label: 'Sleeve', value: 'Full Sleeve' })
  } else {
    highlights.push({ label: 'Sleeve', value: 'Half Sleeve' })
  }

  // 2. Fabric (derived from verified product description)
  if (desc.includes('280 gsm') || name.includes('280 gsm')) {
    highlights.push({ label: 'Fabric', value: '280 GSM Cotton' })
  } else if (desc.includes('300 gsm') || name.includes('300 gsm')) {
    highlights.push({ label: 'Fabric', value: '300 GSM Cotton' })
  } else if (desc.includes('combed ringspun') || desc.includes('ringspun')) {
    highlights.push({ label: 'Fabric', value: 'Combed Ringspun Cotton' })
  } else if (desc.includes('4-way stretch') || desc.includes('compression')) {
    highlights.push({ label: 'Fabric', value: '4-Way Stretch Poly-Spandex' })
  } else if (desc.includes('dry-fit') || desc.includes('dryfit') || name.includes('dry-fit')) {
    highlights.push({ label: 'Fabric', value: 'Dry-Fit Polyester' })
  } else if (desc.includes('cotton blend') || name.includes('cotton blend')) {
    highlights.push({ label: 'Fabric', value: 'Cotton Blend' })
  } else if (desc.includes('cotton')) {
    highlights.push({ label: 'Fabric', value: '100% Cotton' })
  } else if (desc.includes('moisture-wicking') || name.includes('jersey')) {
    highlights.push({ label: 'Fabric', value: 'Moisture-Wicking Polyester' })
  }

  // 3. Neck Type
  if (desc.includes('v-neck') || name.includes('v-neck')) {
    highlights.push({ label: 'Neck Type', value: 'V-Neck' })
  } else {
    highlights.push({ label: 'Neck Type', value: 'Round Neck' })
  }

  // 4. Pattern
  if (name.includes('acid-wash') || desc.includes('acid-wash')) {
    highlights.push({ label: 'Pattern', value: 'Acid Wash' })
  } else if (name.includes('graphic') || desc.includes('graphic') || desc.includes('glitch')) {
    highlights.push({ label: 'Pattern', value: 'Graphic Print' })
  } else if (name.includes('distressed') || desc.includes('distressed')) {
    highlights.push({ label: 'Pattern', value: 'Distressed / Solid' })
  } else if (name.includes('jersey') || desc.includes('jersey')) {
    highlights.push({ label: 'Pattern', value: 'Esports Print' })
  } else if (desc.includes('solid') || name.includes('compression') || name.includes('dry-fit') || name.includes('pump cover')) {
    highlights.push({ label: 'Pattern', value: 'Solid' })
  }

  return highlights
}

export const PRODUCTS: Product[] = [
  // Streetwear (6 items)
  {
    id: 'streetwear-oversized-acid-tee',
    name: 'KALA Raw Acid-Wash Oversized Tee',
    category: 'Streetwear',
    price: 1,
    image: getProductImage('Streetwear 01.png'),
    description: 'Premium 280 GSM oversized cotton tee.',
    available: true,
  },
  {
    id: 'streetwear-heavyweight-hoodie-onyx',
    name: 'KALA Heavyweight Boxy Hoodie',
    category: 'Streetwear',
    price: 499,
    image: getProductImage('Streetwear -02.png'),
    description: 'Heavyweight 450 GSM French Terry boxy hoodie.',
    available: true,
  },
  {
    id: 'streetwear-tactical-cargo-pant',
    name: 'KALA Utility Relaxed Cargo',
    category: 'Streetwear',
    price: 479,
    image: getProductImage('Streetwear 03.png'),
    description: 'Relaxed utility cargo pants with deep pockets.',
    available: true,
  },
  {
    id: 'streetwear-vintage-wash-tee',
    name: 'KALA Vintage Fade Graphic Tee',
    category: 'Streetwear',
    price: 349,
    image: getProductImage('Streetwear 04.png'),
    description: 'Vintage fade combed ringspun cotton graphic tee.',
    available: true,
  },
  {
    id: 'streetwear-monochrome-sweatshirt',
    name: 'KALA Minimalist Crewneck Sweatshirt',
    category: 'Streetwear',
    price: 449,
    image: getProductImage('Streetwear 05.png'),
    description: 'Minimalist brushed cotton fleece crewneck sweatshirt.',
    available: true,
  },
  {
    id: 'streetwear-distressed-urban-tee',
    name: 'KALA Urban Statement Distressed Tee',
    category: 'Streetwear',
    price: 379,
    image: getProductImage('Streetwear 06.png'),
    description: 'Modern urban raw-hemline streetwear tee.',
    available: true,
  },

  // Gaming (5 items)
  {
    id: 'gaming-cyber-pro-jersey-01',
    name: 'KALA Apex Cyber Esports Jersey',
    category: 'Gaming',
    price: 429,
    image: getProductImage('gaming 01.png'),
    description: 'Moisture-wicking tournament esports jersey.',
    available: true,
  },
  {
    id: 'gaming-stealth-tactical-hoodie-02',
    name: 'KALA Stealth Tactical Gamer Hoodie',
    category: 'Gaming',
    price: 499,
    image: getProductImage('gaming 02.png'),
    description: 'Tactical hoodie with headset-compatible hood.',
    available: true,
  },
  {
    id: 'gaming-neon-overload-tee-03',
    name: 'KALA Neo-Tokyo Glitch Graphic Tee',
    category: 'Gaming',
    price: 349,
    image: getProductImage('gaming 03.png'),
    description: 'High-density glitch graphic gaming tee.',
    available: true,
  },
  {
    id: 'gaming-pro-arena-warmup-04',
    name: 'KALA Arena Champion Warmup Zip',
    category: 'Gaming',
    price: 479,
    image: getProductImage('gaming 04.png'),
    description: 'Lightweight quarter-zip athletic trainer jacket.',
    available: true,
  },
  {
    id: 'gaming-shadow-spec-ops-tee-05',
    name: 'KALA Shadow Protocol Gaming Tee',
    category: 'Gaming',
    price: 369,
    image: getProductImage('gaming 05.png'),
    description: 'Breathable mesh-paneled stealth gaming tee.',
    available: true,
  },

  // Gymwear (9 items)
  {
    id: 'gymwear-performance-compression-tee-01',
    name: 'KALA Aerodynamic Compression Tee',
    category: 'Gymwear',
    price: 549,
    image: getProductImage('gymwear-01.jpg.jpeg'),
    description: '4-way stretch athletic compression tee.',
    available: true,
  },
  {
    id: 'gymwear-tapered-jogger-03',
    name: 'KALA Precision Tapered Training Jogger',
    category: 'Gymwear',
    price: 749,
    image: getProductImage('gymwear-03.png'),
    description: 'Squat-proof tapered training joggers with zip pockets.',
    available: true,
  },
  {
    id: 'gymwear-endurance-dryfit-tee-04',
    name: 'KALA VaporLite Dry-Fit Tee',
    category: 'Gymwear',
    price: 519,
    image: getProductImage('Gymwear04.png'),
    description: 'Featherlight anti-odor dry-fit training tee.',
    available: true,
  },
  {
    id: 'gymwear-dynamic-stretch-shorts-06',
    name: 'KALA 5-Inch Dynamic Training Shorts',
    category: 'Gymwear',
    price: 569,
    image: getProductImage('Gymwear06.png'),
    description: '5-inch stretch training shorts with compression liner.',
    available: true,
    variants: [
      {
        color: '#000000',
        colorName: 'Black',
        image: getProductImage('Gymwear06.png'),
      },
      {
        color: '#FFFFFF',
        colorName: 'White',
        image: getProductImage('Gymwear-05.png'),
      },
    ],
  },
  {
    id: 'gymwear-hybrid-longsleeve-07',
    name: 'KALA Thermal Guard Hybrid Longsleeve',
    category: 'Gymwear',
    price: 699,
    image: getProductImage('Gymwear07.png'),
    description: 'Breathable thermal training longsleeve.',
    available: true,
  },
  {
    id: 'gymwear-power-lifting-hoodie-08',
    name: 'KALA Iron Cut Sleeveless Lift Hoodie',
    category: 'Gymwear',
    price: 729,
    image: getProductImage('Gymwear08.png'),
    description: 'Heavyweight sleeveless fleece lifting hoodie.',
    available: true,
  },
  {
    id: 'gymwear-elite-recovery-pants-09',
    name: 'KALA Elite Recovery Ribbed Trackpant',
    category: 'Gymwear',
    price: 799,
    image: getProductImage('Gymwear09.png'),
    description: 'Plush ribbed athletic recovery trackpants.',
    available: true,
  },
]
