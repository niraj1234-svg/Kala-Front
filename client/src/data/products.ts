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
  badge?: string
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

  // 40 Interleaved Graphic Tees & Gymwear Sets
  {
    id: 'keep-moving-forward-tshirt',
    name: 'Keep Moving Forward T-Shirt',
    badge: 'ANIME',
    category: 'Streetwear',
    price: 499,
    image: getProductImage('keep-moving-forward-tshirt.png'),
    description: 'Rising sun crimson circle with stoic samurai silhouette, delicate sakura branches, and vertical Japanese kanji (進み続ける).',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Oversized Streetwear Fit' },
      { label: 'Fabric', value: '240 GSM 100% Cotton' },
      { label: 'Color', value: 'Jet Black' },
      { label: 'Pattern', value: 'Samurai & Rising Sun Screen Print' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-apex-compression-set',
    name: 'KALA Apex Compression Set',
    category: 'Gymwear',
    price: 549,
    image: getProductImage('kala-apex-compression-set.png'),
    images: [getProductImage('kala-apex-compression-set.png'), getProductImage('kala-apex-compression-set-back.png')],
    description: 'High-performance athletic compression set featuring moisture-wicking ergonomic tee and tapered compression training pants with reflective aerodynamic graphic lines.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Ergonomic Athletic Compression' },
      { label: 'Fabric', value: '88% Moisture-Wicking Poly / 12% Spandex' },
      { label: 'Includes', value: '2-Piece Set (Compression Tee + Tapered Pants)' },
      { label: 'Features', value: '4-Way Stretch, Reflective Tech Lines' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'wander-more-tshirt',
    name: 'Wander More T-Shirt',
    badge: 'TRAVEL',
    category: 'Streetwear',
    price: 449,
    image: getProductImage('wander-more-tshirt.png'),
    description: 'Fine-line woodcut alpine mountain peaks and pine ridge illustration with hand-drawn cursive lettering on vintage cream cotton.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Relaxed Fit' },
      { label: 'Fabric', value: '220 GSM 100% Combed Ringspun Cotton' },
      { label: 'Color', value: 'Vintage Cream / Ecru' },
      { label: 'Pattern', value: 'Alpine Peaks & Evergreen Forest Print' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-discipline-set',
    name: 'KALA Discipline Set',
    category: 'Gymwear',
    price: 549,
    image: getProductImage('kala-discipline-set.png'),
    images: [getProductImage('kala-discipline-set.png'), getProductImage('kala-discipline-set-back.png')],
    description: 'Discipline Builds Freedom heavyweight athletic training set in crisp white with contrasting black side-stripe pants and collegiate barbell artwork.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Relaxed Performance Training' },
      { label: 'Fabric', value: '240 GSM Heavyweight French Terry Cotton' },
      { label: 'Includes', value: '2-Piece Set (Discipline Tee + Side-Stripe Pants)' },
      { label: 'Pattern', value: 'Collegiate Barbell & Discipline Graphic' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-oni-training-set',
    name: 'KALA Oni Training Set',
    category: 'Gymwear',
    price: 549,
    image: getProductImage('kala-oni-training-set.png'),
    images: [getProductImage('kala-oni-training-set.png'), getProductImage('kala-oni-training-set-back.png')],
    description: 'Dark aesthetic strength training set with fierce Oni demon mask graphic, Japanese kanji for power (力), and dual-tone crimson trackpants.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Athletic Pump Cover & Tapered Joggers' },
      { label: 'Fabric', value: 'High-Density Breathable Cotton-Poly Blend' },
      { label: 'Includes', value: '2-Piece Set (Oni Graphic Tee + Dual-Tone Pants)' },
      { label: 'Pattern', value: 'Traditional Japanese Oni Demon & Kanji (力)' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'good-things-take-time-tshirt',
    name: 'Good Things Take Time T-Shirt',
    badge: 'MINIMAL',
    category: 'Streetwear',
    price: 399,
    image: getProductImage('good-things-take-time-tshirt.png'),
    description: 'Minimalist typography centered on chest with subtle horizontal line accent for mindful streetwear.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Boxy Relaxed Fit' },
      { label: 'Fabric', value: '220 GSM Compact Cotton' },
      { label: 'Color', value: 'Rich Jet Black' },
      { label: 'Pattern', value: 'Clean Minimalist Sans Typography' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-grind-mode-set',
    name: 'KALA Grind Mode Set',
    category: 'Gymwear',
    price: 499,
    image: getProductImage('kala-grind-mode-set.png'),
    images: [getProductImage('kala-grind-mode-set.png'), getProductImage('kala-grind-mode-set-back.png')],
    description: 'Tactical military olive green training set with Train Eat Sleep Repeat back graphic and relaxed utility cargo joggers.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Relaxed Utility Cargo Fit' },
      { label: 'Fabric', value: 'Durable Ripstop Cotton Blend' },
      { label: 'Includes', value: '2-Piece Set (Grind Mode Tee + Cargo Joggers)' },
      { label: 'Features', value: 'Deep Utility Pockets, Elastic Cuffs' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'out-of-office-tshirt',
    name: 'Out of Office T-Shirt',
    badge: 'VIBE',
    category: 'Streetwear',
    price: 449,
    image: getProductImage('out-of-office-tshirt.png'),
    description: 'Vintage 1970s classic sedan cruiser car with retro striped sunset oval and palm tree silhouettes.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Relaxed Streetwear Fit' },
      { label: 'Fabric', value: '240 GSM Pure Combed Cotton' },
      { label: 'Color', value: 'Vintage Warm Ecru' },
      { label: 'Pattern', value: '70s Classic Sedan & Retro Sunset Print' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-everyday-set',
    name: 'KALA Everyday Set',
    category: 'Gymwear',
    price: 549,
    image: getProductImage('kala-everyday-set.png'),
    images: [getProductImage('kala-everyday-set.png'), getProductImage('kala-everyday-set-back.png')],
    description: 'Everyday athletic set in deep midnight navy with Better Than Yesterday typography and moisture-wicking tapered trackpants.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Streamlined Athletic Fit' },
      { label: 'Fabric', value: 'Premium 230 GSM Combed Ringspun Cotton' },
      { label: 'Includes', value: '2-Piece Set (Better Than Yesterday Tee + Pants)' },
      { label: 'Color', value: 'Deep Midnight Navy' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'feel-everything-tshirt',
    name: 'Feel Everything T-Shirt',
    badge: 'ART',
    category: 'Streetwear',
    price: 449,
    image: getProductImage('feel-everything-tshirt.png'),
    description: "Renaissance marble sculpture bust of Michelangelo's David with a bold red censor block over eyes.",
    available: true,
    highlights: [
      { label: 'Fit', value: 'Oversized Drop-Shoulder Fit' },
      { label: 'Fabric', value: '250 GSM Mineral Acid-Washed Cotton' },
      { label: 'Color', value: 'Mineral Washed Acid Charcoal' },
      { label: 'Pattern', value: 'Chiaroscuro Sculpture & Red Censor Bar' },
      { label: 'Neck Type', value: 'Heavy Crew Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-evolve-set',
    name: 'KALA Evolve Set',
    category: 'Gymwear',
    price: 499,
    image: getProductImage('kala-evolve-set.png'),
    images: [getProductImage('kala-evolve-set.png'), getProductImage('kala-evolve-set-back.png')],
    description: 'Warm desert sand beige gym set featuring Lift Grow Evolve barbell typography and matching relaxed athletic track shorts.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Relaxed Summer Training' },
      { label: 'Fabric', value: 'Bio-Washed French Terry' },
      { label: 'Includes', value: '2-Piece Set (Lift Grow Evolve Tee + Track Shorts)' },
      { label: 'Color', value: 'Warm Desert Sand Beige' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'lost-in-the-right-direction-tshirt',
    name: 'Lost in the Right Direction T-Shirt',
    badge: 'TRAVEL',
    category: 'Streetwear',
    price: 449,
    image: getProductImage('lost-in-the-right-direction-tshirt.png'),
    description: 'Framed ocean swell landscape photograph with clean editorial typography and geographic coordinates.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Boxy Structured Fit' },
      { label: 'Fabric', value: '240 GSM Pure Combed Cotton' },
      { label: 'Color', value: 'Heavyweight Crisp White' },
      { label: 'Pattern', value: 'Framed Ocean Photo & Editorial Typography' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-no-limits-set',
    name: 'KALA No Limits Set',
    category: 'Gymwear',
    price: 549,
    image: getProductImage('kala-no-limits-set.png'),
    images: [getProductImage('kala-no-limits-set.png'), getProductImage('kala-no-limits-set-back.png')],
    description: 'Blackout performance gym set with bold crimson No Limits distressed text and white lightning slash graphic joggers.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Oversized Athletic Streetwear' },
      { label: 'Fabric', value: '240 GSM Acid-Washed Cotton Blend' },
      { label: 'Includes', value: '2-Piece Set (No Limits Tee + Slash Graphic Pants)' },
      { label: 'Pattern', value: 'Distressed Red Stencil & White Lightning Slashes' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'anti-social-club-tshirt',
    name: 'Anti Social Club T-Shirt',
    badge: 'STREETWEAR',
    category: 'Streetwear',
    price: 449,
    image: getProductImage('anti-social-club-tshirt.png'),
    description: 'Distressed stencil block lettering with a neon hot-pink dripping spray-paint smiley face.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Oversized Boxy Streetwear' },
      { label: 'Fabric', value: '240 GSM Acid-Washed Cotton' },
      { label: 'Color', value: 'Washed Acid Black' },
      { label: 'Pattern', value: 'Distressed Typography & Dripping Pink Spray' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-wings-set',
    name: 'KALA Wings Set',
    category: 'Gymwear',
    price: 549,
    image: getProductImage('kala-wings-set.png'),
    images: [getProductImage('kala-wings-set.png'), getProductImage('kala-wings-set-back.png')],
    description: 'Angelic valkyrie feathered wing graphics spreading across shoulders and back on pure white performance tee with matching training pants.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Athletic Performance Fit' },
      { label: 'Fabric', value: '4-Way Stretch Breathable Polyester Blend' },
      { label: 'Includes', value: '2-Piece Set (Wings Back Tee + Training Pants)' },
      { label: 'Pattern', value: 'Detailed Valkyrie Feathered Wings Artwork' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'moon-friend-tshirt',
    name: 'Moon Friend T-Shirt',
    badge: 'SPACE',
    category: 'Gaming',
    price: 449,
    image: getProductImage('moon-friend-tshirt.png'),
    description: 'Cute spacesuit astronaut sitting on a cratered moon holding a glowing Earth balloon with twinkling stars.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Relaxed Fit' },
      { label: 'Fabric', value: '230 GSM Combed Ringspun Cotton' },
      { label: 'Color', value: 'Warm Mocha Chocolate Brown' },
      { label: 'Pattern', value: 'Astronaut On Moon & Earth Orb Graphic' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-relentless-set',
    name: 'KALA Relentless Set',
    category: 'Gymwear',
    price: 549,
    image: getProductImage('kala-relentless-set.png'),
    images: [getProductImage('kala-relentless-set.png'), getProductImage('kala-relentless-set-back.png')],
    description: 'Deep crimson maroon athletic set featuring Relentless Progress Over Excuses typography and black trackpants with ruby side panels.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Tapered Athletic Training' },
      { label: 'Fabric', value: '240 GSM Heavy Cotton & Ribbed Poly' },
      { label: 'Includes', value: '2-Piece Set (Relentless Tee + Side-Panel Pants)' },
      { label: 'Color', value: 'Rich Vintage Crimson Maroon & Black' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'evolve-tshirt',
    name: 'Evolve T-Shirt',
    badge: 'LIFESTYLE',
    category: 'Gaming',
    price: 399,
    image: getProductImage('evolve-tshirt.png'),
    description: 'Hyper-vivid electric blue Morpho butterfly with a floating gold coronet crown and motivational subtitle.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Boxy Modern Fit' },
      { label: 'Fabric', value: '240 GSM Premium Combed Cotton' },
      { label: 'Color', value: 'Crisp Heavyweight White' },
      { label: 'Pattern', value: 'Electric Morpho Butterfly & Gold Crown' },
      { label: 'Neck Type', value: 'Thick Ribbed Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-overthink-set',
    name: 'KALA Overthink Set',
    category: 'Gymwear',
    price: 549,
    image: getProductImage('kala-overthink-set.png'),
    images: [getProductImage('kala-overthink-set.png'), getProductImage('kala-overthink-set-back.png')],
    description: 'Edgy gothic gymwear set in pitch black with thorny barbed wire graphic framing Overthink lettering and matching graphic trackpants.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Boxy Drop-Shoulder & Graphic Joggers' },
      { label: 'Fabric', value: '250 GSM Mineral Washed Cotton' },
      { label: 'Includes', value: '2-Piece Set (Overthink Tee + Thorn Graphic Pants)' },
      { label: 'Pattern', value: 'Gothic Barbed Wire & Thorny Branch Graphics' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'beyond-reality-tshirt',
    name: 'Beyond Reality T-Shirt',
    badge: 'ANIME',
    category: 'Gaming',
    price: 449,
    image: getProductImage('beyond-reality-tshirt.png'),
    description: 'Horizontal rectangular manga eye panel with intense piercing anime gaze, Japanese kanji and subtitle.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Oversized Anime Streetwear' },
      { label: 'Fabric', value: '240 GSM Heavy Cotton' },
      { label: 'Color', value: 'Deep Jet Black' },
      { label: 'Pattern', value: 'Manga Eyes Panel & Japanese Kanji' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'kala-nature-set',
    name: 'KALA Nature Set',
    category: 'Gymwear',
    price: 499,
    image: getProductImage('kala-nature-set.png'),
    images: [getProductImage('kala-nature-set.png'), getProductImage('kala-nature-set-back.png')],
    description: 'Deep evergreen pine forest green training set with Nature Heals mountain peak graphics and functional cargo pockets.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Relaxed Outdoor & Gym Utility' },
      { label: 'Fabric', value: '230 GSM Heavy Cotton' },
      { label: 'Includes', value: '2-Piece Set (Nature Heals Tee + Cargo Joggers)' },
      { label: 'Color', value: 'Tactical Forest Olive Green' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'create-your-own-reality-tshirt',
    name: 'Create Your Own Reality T-Shirt',
    badge: 'CREATIVE',
    category: 'Gaming',
    price: 449,
    image: getProductImage('create-your-own-reality-tshirt.png'),
    description: 'Chunky 90s 3D puffy graffiti lettering in emerald green with deep extruded shadow and star accent.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Relaxed Streetwear Fit' },
      { label: 'Fabric', value: '230 GSM Combed Ringspun Cotton' },
      { label: 'Color', value: 'Vanilla Cream' },
      { label: 'Pattern', value: '3D Puffy Bubble Graffiti & Emerald Star' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'chaos-makes-better-stories-tshirt',
    name: 'Chaos Makes Better Stories T-Shirt',
    badge: 'STREETWEAR',
    category: 'Gaming',
    price: 449,
    image: getProductImage('chaos-makes-better-stories-tshirt.png'),
    description: 'Gothic blackletter typography engulfed in vibrant electric purple/violet hot flames on pitch black cotton.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Oversized Boxy Fit' },
      { label: 'Fabric', value: '240 GSM Heavy Cotton' },
      { label: 'Color', value: 'Pitch Black' },
      { label: 'Pattern', value: 'Gothic Blackletter & Neon Violet Flames' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'still-here-tshirt',
    name: 'Still Here T-Shirt',
    badge: 'ART',
    category: 'Gaming',
    price: 449,
    image: getProductImage('still-here-tshirt.png'),
    description: 'Detailed anatomical woodcut engraving of a human ribcage with a vivid electric cyan butterfly on the clavicle.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Boxy Streetwear Silhouette' },
      { label: 'Fabric', value: '240 GSM Combed Cotton' },
      { label: 'Color', value: 'Deep Indigo Navy Blue' },
      { label: 'Pattern', value: 'Anatomical Skeleton Engraving & Butterfly' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'the-mountains-are-calling-tshirt',
    name: 'The Mountains Are Calling T-Shirt',
    badge: 'OUTDOOR',
    category: 'Gymwear',
    price: 449,
    image: getProductImage('the-mountains-are-calling-tshirt.png'),
    description: 'Bold typography with snowy alpine mountain ridges and warm harvest moon circle in vintage denim blue.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Relaxed Outdoor Fit' },
      { label: 'Fabric', value: '230 GSM Vintage Washed Cotton' },
      { label: 'Color', value: 'Washed Indigo Denim Blue' },
      { label: 'Pattern', value: 'Alpine Peaks & Harvest Moon Screen Print' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'bloom-at-your-own-pace-tshirt',
    name: 'Bloom at Your Own Pace T-Shirt',
    badge: 'MINIMAL',
    category: 'Gymwear',
    price: 399,
    image: getProductImage('bloom-at-your-own-pace-tshirt.png'),
    description: 'Delicate fine-line botanical illustration of tall sunflowers and daisies with refined serif typography.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Relaxed Mindful Fit' },
      { label: 'Fabric', value: '220 GSM Bio-Washed Combed Cotton' },
      { label: 'Color', value: 'Vintage Oatmeal Ecru Cream' },
      { label: 'Pattern', value: 'Botanical Wildflowers & Editorial Serif' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'inner-peace-tshirt',
    name: 'Inner Peace T-Shirt',
    badge: 'MINIMAL',
    category: 'Gymwear',
    price: 399,
    image: getProductImage('inner-peace-tshirt.png'),
    description: 'Woodcut linocut Great Wave circular crest with vertical Japanese kanji for Peace (平和).',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Boxy Drop-Shoulder' },
      { label: 'Fabric', value: '240 GSM Mineral Acid-Washed Cotton' },
      { label: 'Color', value: 'Mineral Washed Dark Charcoal' },
      { label: 'Pattern', value: 'Woodcut Tidal Wave & Peace Kanji Print' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'better-days-ahead-tshirt',
    name: 'Better Days Ahead T-Shirt',
    badge: 'MOTIVATIONAL',
    category: 'Gymwear',
    price: 399,
    image: getProductImage('better-days-ahead-tshirt.png'),
    description: 'Expressive hand-lettered brush script typography with golden sparkle starbursts in rich vintage maroon.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Athletic Pump Cover' },
      { label: 'Fabric', value: '240 GSM Heavyweight Cotton' },
      { label: 'Color', value: 'Rich Vintage Maroon Burgundy' },
      { label: 'Pattern', value: 'Hand-Lettered Brush Script & Starbursts' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
  {
    id: 'nature-heals-tshirt',
    name: 'Nature Heals T-Shirt',
    badge: 'NATURE',
    category: 'Gymwear',
    price: 399,
    image: getProductImage('nature-heals-tshirt.png'),
    description: 'Clean serif typography with a rectangular framed landscape print of misty evergreen pine forest and mountain ridges.',
    available: true,
    highlights: [
      { label: 'Fit', value: 'Oversized Athletic / Outdoor Fit' },
      { label: 'Fabric', value: '240 GSM Heavyweight Cotton' },
      { label: 'Color', value: 'Tactical Dark Military Olive Green' },
      { label: 'Pattern', value: 'Framed Misty Pine Forest Landscape Print' },
      { label: 'Neck Type', value: 'Round Neck' },
      { label: 'Sizes', value: 'S, M, L, XL, XXL' },
    ],
  },
]
