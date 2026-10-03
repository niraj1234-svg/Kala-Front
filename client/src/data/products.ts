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
  if (filename.startsWith('/custom-apparel/') || filename.startsWith('custom-apparel/')) {
    return filename.startsWith('/') ? filename : `/${filename}`
  }
  if (filename.includes('kala-custom-hero-floating.png')) {
    return '/custom-apparel/kala-custom-hero-floating.png'
  }
  const cleanName = filename.replace(/^\/?(images\/)?/, '')
  const path = `/images/${cleanName}`
  return imageMap[path] || imageMap[decodeURIComponent(path)] || (filename.startsWith('/') ? filename : path)
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
  highlights?: ProductHighlight[]
  freeShipping?: boolean
  customPrintTextEnabled?: boolean
  customPrintTextPrice?: number
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
    name.includes('polo') ||
    name.includes('jersey') ||
    id.includes('tee') ||
    id.includes('polo') ||
    id.includes('jersey')
  )
}

export function getProductHighlights(product: Product): ProductHighlight[] {
  if (product.highlights && product.highlights.length > 0) {
    return product.highlights
  }

  if (product.id === 'ai-data-science-polo-t-shirt') {
    return [
      { label: 'Collar', value: 'Polo collar' },
      { label: 'Placket', value: '2-button front placket' },
      { label: 'Color', value: 'Light grey' },
      { label: 'Front Print', value: 'Front chest university logo' },
      { label: 'Back Print', value: 'Large AI & Data Science back print' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ]
  }

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

  // 2. Fabric
  if (desc.includes('220 gsm') || name.includes('220 gsm')) {
    highlights.push({ label: 'Fabric', value: '220 GSM Premium Cotton' })
  } else if (desc.includes('280 gsm') || name.includes('280 gsm')) {
    highlights.push({ label: 'Fabric', value: '280 GSM Cotton' })
  } else if (desc.includes('450 gsm') || name.includes('450 gsm')) {
    highlights.push({ label: 'Fabric', value: '450 GSM French Terry Cotton' })
  } else if (desc.includes('fleece') || name.includes('fleece')) {
    highlights.push({ label: 'Fabric', value: 'Brushed Cotton Fleece' })
  } else if (desc.includes('combed') || name.includes('vintage')) {
    highlights.push({ label: 'Fabric', value: 'Combed Ringspun Cotton' })
  } else if (desc.includes('cotton blend') || name.includes('cotton blend')) {
    highlights.push({ label: 'Fabric', value: 'Cotton Blend' })
  } else if (desc.includes('cotton')) {
    highlights.push({ label: 'Fabric', value: '100% Cotton' })
  } else if (desc.includes('moisture-wicking') || name.includes('jersey')) {
    highlights.push({ label: 'Fabric', value: 'Moisture-Wicking Polyester' })
  } else {
    highlights.push({ label: 'Fabric', value: 'Comfortable Cotton Blend' })
  }

  // 3. Neck Type
  if (desc.includes('v-neck') || name.includes('v-neck')) {
    highlights.push({ label: 'Neck Type', value: 'V-Neck' })
  } else {
    highlights.push({ label: 'Neck Type', value: 'Round Neck' })
  }

  // 4. Pattern
  if (name.includes('bihari') || desc.includes('bihari')) {
    highlights.push({ label: 'Pattern', value: 'Cultural Graphic Print' })
  } else if (name.includes('acid-wash') || desc.includes('acid-wash')) {
    highlights.push({ label: 'Pattern', value: 'Acid Wash' })
  } else if (name.includes('graphic') || desc.includes('graphic') || desc.includes('glitch')) {
    highlights.push({ label: 'Pattern', value: 'Graphic Print' })
  } else if (name.includes('distressed') || desc.includes('distressed')) {
    highlights.push({ label: 'Pattern', value: 'Distressed / Solid' })
  } else if (name.includes('jersey') || desc.includes('jersey')) {
    highlights.push({ label: 'Pattern', value: 'Esports Print' })
  } else if (desc.includes('solid') || name.includes('compression') || name.includes('dry-fit') || name.includes('pump cover')) {
    highlights.push({ label: 'Pattern', value: 'Solid' })
  } else {
    highlights.push({ label: 'Pattern', value: 'Graphic Print' })
  }

  return highlights
}

export const PRODUCTS: Product[] = [
  // AI & Data Science Polo T-Shirt (Featured First Product)
  {
    id: 'ai-data-science-polo-t-shirt',
    name: 'AI & Data Science Polo T-Shirt',
    category: 'Streetwear',
    price: 250,
    image: getProductImage('ai-data-science-polo-front.png'),
    images: [
      getProductImage('ai-data-science-polo-front.png'),
      getProductImage('ai-data-science-polo-back.png'),
    ],
    description: 'Premium polo T-shirt with AI & Data Science artwork.',
    available: true,
    highlights: [
      { label: 'Collar', value: 'Polo collar' },
      { label: 'Placket', value: '2-button front placket' },
      { label: 'Color', value: 'Light grey' },
      { label: 'Front Print', value: 'Front chest university logo' },
      { label: 'Back Print', value: 'Large AI & Data Science back print' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },

  // KALA Bihari Story Premium T-Shirt (Featured Second Product)
  {
    id: 'kala-bihari-story-premium-t-shirt',
    name: 'KALA Bihari Story Premium T-Shirt',
    category: 'Streetwear',
    price: 400,
    image: getProductImage('kala-bihari-story-front.png'),
    images: [
      getProductImage('kala-bihari-story-front.png'),
      getProductImage('kala-bihari-story-back.png'),
    ],
    description: "A premium 220 GSM everyday T-shirt rooted in Bihar's culture and designed for modern streetwear. The forest-green finish, expressive artwork and comfortable construction make it an easy statement piece for everyday wear. Personalize the back with your own text for an additional ₹25.",
    available: true,
    customPrintTextEnabled: true,
    customPrintTextPrice: 25,
  },

  // Streetwear (6 items)
  {
    id: 'streetwear-oversized-acid-tee',
    name: 'KALA Raw Acid-Wash Oversized Tee',
    category: 'Streetwear',
    price: 350,
    image: getProductImage('Streetwear 01.png'),
    description: 'Premium 280 GSM oversized cotton tee.',
    available: true,
    freeShipping: true,
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

  // 8 New Original Streetwear Products
  {
    id: 'midnight-tokyo-tshirt',
    name: 'Midnight Tokyo T-Shirt',
    category: 'Streetwear',
    price: 499,
    image: getProductImage('midnight-tokyo-tshirt.png'),
    description: 'Original anime-inspired urban artwork built for late-night streetwear.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Streetwear fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Graphic print' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'no-signal-tshirt',
    name: 'No Signal T-Shirt',
    category: 'Streetwear',
    price: 449,
    image: getProductImage('no-signal-tshirt.png'),
    description: 'Minimal glitch-inspired streetwear for an always-connected generation.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Streetwear fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Glitch graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'after-dark-tshirt',
    name: 'After Dark T-Shirt',
    category: 'Streetwear',
    price: 499,
    image: getProductImage('after-dark-tshirt.png'),
    description: 'Original night-themed streetwear with moonlight and dark urban aesthetic.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Streetwear fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Graphic print' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'lost-in-thought-tshirt',
    name: 'Lost In Thought T-Shirt',
    category: 'Streetwear',
    price: 499,
    image: getProductImage('lost-in-thought-tshirt.png'),
    description: 'Original anime-inspired reflective artwork in an oversized graphic aesthetic.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Oversized-inspired design' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Artistic graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'offline-society-tshirt',
    name: 'Offline Society T-Shirt',
    category: 'Streetwear',
    price: 399,
    image: getProductImage('offline-society-tshirt.png'),
    description: 'Minimalist typography-driven streetwear for disconnecting with purpose.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Streetwear style' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Minimal typography' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'future-is-loading-tshirt',
    name: 'Future Is Loading T-Shirt',
    category: 'Streetwear',
    price: 449,
    image: getProductImage('future-is-loading-tshirt.png'),
    description: 'Futuristic loading interface graphic designed for next-gen street style.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Streetwear fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Tech UI graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'rebel-mind-tshirt',
    name: 'Rebel Mind T-Shirt',
    category: 'Streetwear',
    price: 499,
    image: getProductImage('rebel-mind-tshirt.png'),
    description: 'Bold and edgy illustrated streetwear graphic for an independent mindset.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Streetwear fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Bold graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'urban-chaos-tshirt',
    name: 'Urban Chaos T-Shirt',
    category: 'Streetwear',
    price: 499,
    image: getProductImage('urban-chaos-tshirt.png'),
    description: 'Abstract geometric street graphic built for modern oversized streetwear.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Oversized streetwear' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Abstract geometric' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },

  // Gaming (5 existing items)
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

  // 6 New Original Gaming Products
  {
    id: 'respawn-mode-tshirt',
    name: 'Respawn Mode T-Shirt',
    category: 'Gaming',
    price: 449,
    image: getProductImage('respawn-mode-tshirt.png'),
    description: 'Futuristic gaming graphics built for your next level.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Comfortable fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Gaming HUD graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'night-raid-tshirt',
    name: 'Night Raid T-Shirt',
    category: 'Gaming',
    price: 499,
    image: getProductImage('night-raid-tshirt.png'),
    description: 'Tactical cyberpunk operative graphic inspired by high-stakes night missions.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Streetwear style' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Tactical cyberpunk graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'level-up-tshirt',
    name: 'Level Up T-Shirt',
    category: 'Gaming',
    price: 399,
    image: getProductImage('level-up-tshirt.png'),
    description: 'Clean pixel and futuristic graphics built for everyday gaming style.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Comfortable fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Pixel typography' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'critical-hit-tshirt',
    name: 'Critical Hit T-Shirt',
    category: 'Gaming',
    price: 449,
    image: getProductImage('critical-hit-tshirt.png'),
    description: 'Energetic high-impact typography with dynamic dark gaming aesthetic.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Streetwear fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Dynamic gaming typography' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'cyber-player-tshirt',
    name: 'Cyber Player T-Shirt',
    category: 'Gaming',
    price: 499,
    image: getProductImage('cyber-player-tshirt.png'),
    description: 'Cyberpunk-inspired player artwork crafted with sleek neon accents.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Comfortable fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Cyberpunk graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'game-over-never-tshirt',
    name: 'Game Over Never T-Shirt',
    category: 'Gaming',
    price: 399,
    image: getProductImage('game-over-never-tshirt.png'),
    description: 'Motivational minimalist gaming typography with digital glitch detailing.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Casual fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Motivational typography' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },

  // Gymwear (7 existing items)
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

  // 6 New Original Gymwear Products
  {
    id: 'built-different-tshirt',
    name: 'Built Different T-Shirt',
    category: 'Gymwear',
    price: 499,
    image: getProductImage('built-different-tshirt.png'),
    description: 'Minimal athletic streetwear for people who train with purpose.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Athletic fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Minimal athletic typography' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'no-days-off-tshirt',
    name: 'No Days Off T-Shirt',
    category: 'Gymwear',
    price: 449,
    image: getProductImage('no-days-off-tshirt.png'),
    description: 'Bold monochrome athletic typography built for relentless daily consistency.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Gym-ready style' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Monochrome typography' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'discipline-tshirt',
    name: 'Discipline T-Shirt',
    category: 'Gymwear',
    price: 499,
    image: getProductImage('discipline-tshirt.png'),
    description: 'Minimalist strength graphic honoring discipline over fleeting motivation.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Athletic fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Strength graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'train-insane-tshirt',
    name: 'Train Insane T-Shirt',
    category: 'Gymwear',
    price: 499,
    image: getProductImage('train-insane-tshirt.png'),
    description: 'High-performance gym aesthetic engineered for aggressive training sessions.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Performance fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Bold gym graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'iron-mind-tshirt',
    name: 'Iron Mind T-Shirt',
    category: 'Gymwear',
    price: 499,
    image: getProductImage('iron-mind-tshirt.png'),
    description: 'Industrial metallic graphic representing an unbreakable training mindset.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Gym-ready style' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Industrial graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'earn-your-strength-tshirt',
    name: 'Earn Your Strength T-Shirt',
    category: 'Gymwear',
    price: 449,
    image: getProductImage('earn-your-strength-tshirt.png'),
    description: 'Clean motivational fitness graphic designed for dedicated lifters.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Athletic fit' },
      { label: 'Fabric', value: 'Comfortable cotton blend' },
      { label: 'Pattern', value: 'Motivational fitness graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
]
