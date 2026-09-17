// Product image map using Vite's glob import
const imageMap = import.meta.glob('/images/*', { eager: true, import: 'default' }) as Record<string, string>

export function getProductImage(filename: string): string {
  const path = `/images/${filename}`
  return imageMap[path] || path
}

export interface Product {
  id: string
  name: string
  category: 'Streetwear' | 'Gaming' | 'Gymwear'
  price: number
  image: string
  description: string
  available: boolean
}

export const PRODUCTS: Product[] = [
  // Streetwear (6 items)
  {
    id: 'streetwear-oversized-acid-tee',
    name: 'KALA Raw Acid-Wash Oversized Tee',
    category: 'Streetwear',
    price: 1899,
    image: getProductImage('Streetwear 01.png'),
    description: 'Heavyweight 280 GSM cotton oversized streetwear t-shirt featuring artisanal acid-wash finish and dropped shoulders.',
    available: true,
  },
  {
    id: 'streetwear-heavyweight-hoodie-onyx',
    name: 'KALA Heavyweight Boxy Hoodie',
    category: 'Streetwear',
    price: 3499,
    image: getProductImage('Streetwear -02.png'),
    description: '450 GSM French Terry luxury heavyweight hoodie with double-layered hood and minimalist tonal embroidered branding.',
    available: true,
  },
  {
    id: 'streetwear-tactical-cargo-pant',
    name: 'KALA Utility Relaxed Cargo',
    category: 'Streetwear',
    price: 2999,
    image: getProductImage('Streetwear 03.png'),
    description: 'Relaxed fit industrial streetwear cargo pants engineered with deep gusseted pockets and adjustable ankle cinches.',
    available: true,
  },
  {
    id: 'streetwear-vintage-wash-tee',
    name: 'KALA Vintage Fade Graphic Tee',
    category: 'Streetwear',
    price: 1799,
    image: getProductImage('Streetwear 04.png'),
    description: 'Custom vintage wash tee crafted from 100% combed ringspun cotton with distressed hand-feel typography.',
    available: true,
  },
  {
    id: 'streetwear-monochrome-sweatshirt',
    name: 'KALA Minimalist Crewneck Sweatshirt',
    category: 'Streetwear',
    price: 2799,
    image: getProductImage('Streetwear 05.png'),
    description: 'Clean architectural crewneck cut from premium brushed cotton fleece with ribbed collar and cuffs.',
    available: true,
  },
  {
    id: 'streetwear-distressed-urban-tee',
    name: 'KALA Urban Statement Distressed Tee',
    category: 'Streetwear',
    price: 1999,
    image: getProductImage('Streetwear 06.png'),
    description: 'Modern Indian street aesthetic with subtle raw hemlines, high ribbed collar, and signature KALA orange accent tab.',
    available: true,
  },

  // Gaming (5 items)
  {
    id: 'gaming-cyber-pro-jersey-01',
    name: 'KALA Apex Cyber Esports Jersey',
    category: 'Gaming',
    price: 2499,
    image: getProductImage('gaming 01.png'),
    description: 'Performance-grade moisture-wicking esports tournament jersey engineered with anti-snag aerodynamic microfiber.',
    available: true,
  },
  {
    id: 'gaming-stealth-tactical-hoodie-02',
    name: 'KALA Stealth Tactical Gamer Hoodie',
    category: 'Gaming',
    price: 3899,
    image: getProductImage('gaming 02.png'),
    description: 'Ergonomic hoodie with headset-compatible deep hood, thumbhole storm cuffs, and matte black cybernetic detailing.',
    available: true,
  },
  {
    id: 'gaming-neon-overload-tee-03',
    name: 'KALA Neo-Tokyo Glitch Graphic Tee',
    category: 'Gaming',
    price: 1699,
    image: getProductImage('gaming 03.png'),
    description: 'High-density cyber-punk graphic tee inspired by competitive gaming culture and digital distortion aesthetics.',
    available: true,
  },
  {
    id: 'gaming-pro-arena-warmup-04',
    name: 'KALA Arena Champion Warmup Zip',
    category: 'Gaming',
    price: 3299,
    image: getProductImage('gaming 04.png'),
    description: 'Ultra-lightweight quarter-zip athletic trainer jacket with vented back yoke for peak tournament performance.',
    available: true,
  },
  {
    id: 'gaming-shadow-spec-ops-tee-05',
    name: 'KALA Shadow Protocol Gaming Tee',
    category: 'Gaming',
    price: 1799,
    image: getProductImage('gaming 05.png'),
    description: 'Stealth edition gaming apparel with breathable side mesh panels and low-friction wrist seam construction.',
    available: true,
  },

  // Gymwear (9 items)
  {
    id: 'gymwear-performance-compression-tee-01',
    name: 'KALA Aerodynamic Compression Tee',
    category: 'Gymwear',
    price: 1499,
    image: getProductImage('gymwear-01.jpg.jpeg'),
    description: '4-way stretch second-skin compression top that optimizes muscle temperature and accelerates post-lift recovery.',
    available: true,
  },
  {
    id: 'gymwear-seamless-muscle-tank-02',
    name: 'KALA Core Seamless Muscle Tank',
    category: 'Gymwear',
    price: 1299,
    image: getProductImage('gymwear02.png'),
    description: 'Deep cut drop-armhole stringer tank made from sweat-wicking poly-spandex blend for unrestricted mobility.',
    available: true,
  },
  {
    id: 'gymwear-tapered-jogger-03',
    name: 'KALA Precision Tapered Training Jogger',
    category: 'Gymwear',
    price: 2499,
    image: getProductImage('gymwear-03.png'),
    description: 'Tailored athletic joggers featuring zippered waterproof pockets, ankle zips, and squat-proof stretch fabric.',
    available: true,
  },
  {
    id: 'gymwear-endurance-dryfit-tee-04',
    name: 'KALA VaporLite Dry-Fit Tee',
    category: 'Gymwear',
    price: 1399,
    image: getProductImage('Gymwear04.png'),
    description: 'Featherlight anti-odor training tee built with micro-perforated back zone for rapid heat dissipation.',
    available: true,
  },
  {
    id: 'gymwear-oversized-pump-cover-05',
    name: 'KALA Heavy Pump Cover Tee',
    category: 'Gymwear',
    price: 1899,
    image: getProductImage('Gymwear-05.png'),
    description: 'Boxy bodybuilding pump cover crafted from durable 300 GSM dense cotton with wide ribbed neck collar.',
    available: true,
  },
  {
    id: 'gymwear-dynamic-stretch-shorts-06',
    name: 'KALA 5-Inch Dynamic Training Shorts',
    category: 'Gymwear',
    price: 1699,
    image: getProductImage('Gymwear06.png'),
    description: 'High-split lightweight training shorts with internal compression liner and secure zippered phone pocket.',
    available: true,
  },
  {
    id: 'gymwear-hybrid-longsleeve-07',
    name: 'KALA Thermal Guard Hybrid Longsleeve',
    category: 'Gymwear',
    price: 2199,
    image: getProductImage('Gymwear07.png'),
    description: 'Breathable cold-weather training longsleeve with ergonomic raglan sleeves and reflective night-run accents.',
    available: true,
  },
  {
    id: 'gymwear-power-lifting-hoodie-08',
    name: 'KALA Iron Cut Sleeveless Lift Hoodie',
    category: 'Gymwear',
    price: 2299,
    image: getProductImage('Gymwear08.png'),
    description: 'Heavyweight sleeveless fleece hoodie built for heavy barbell sessions and rugged athletic movement.',
    available: true,
  },
  {
    id: 'gymwear-elite-recovery-pants-09',
    name: 'KALA Elite Recovery Ribbed Trackpant',
    category: 'Gymwear',
    price: 2699,
    image: getProductImage('Gymwear09.png'),
    description: 'Plush ribbed athletic trackpants designed for post-workout downtime, travel, and cool-down comfort.',
    available: true,
  },
]
