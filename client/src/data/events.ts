import { getProductImage } from './products'

export interface ProductEvent {
  id: string
  type: 'product'
  title: string
  price: number
  currency: string
  status: string
  badge: string
  description: string
  productId: string
  link: string
  features: string[]
  frontImage: string
  backImage?: string
  ctaText: string
}

export interface BundleOption {
  count: number
  price: number
  label: string
  highlight?: string
  link: string
}

export interface BundleEvent {
  id: string
  type: 'bundle'
  title: string
  subtitle: string
  badge: string
  subBadge?: string
  description: string
  ctaText: string
  link: string
  options: BundleOption[]
  stackImages: string[]
}

export interface UpcomingEvent {
  id: string
  type: 'upcoming'
  locked: true
  categoryBadge: string
  title: string
  description: string
  date: string
  status: string
  topLeftBadge: string
  topRightBadge: string
  topRightIcon: string
  focalTag: string
  image: string
  badgeModifier?: string
}

export interface LiveEvent {
  id: string
  type: 'live'
  categoryBadge: string
  title: string
  slogan?: string
  description: string
  date: string
  time?: string
  fee?: number
  status: string
  topLeftBadge: string
  topRightBadge: string
  topRightIcon: string
  focalTag: string
  image: string
  badgeModifier?: string
  link: string
  ctaText: string
}

export type KalaEvent = ProductEvent | BundleEvent | UpcomingEvent | LiveEvent

export const KALA_EVENTS: KalaEvent[] = [
  // 1. Slide 1 — FEATURED DROP: KALA Bihari Story Premium T-Shirt
  {
    id: 'kala-bihari-story',
    type: 'product',
    title: 'KALA Bihari Story Premium T-Shirt',
    price: 400,
    currency: '₹',
    status: 'In Stock',
    badge: 'FEATURED DROP',
    description: "A premium 220 GSM everyday T-shirt rooted in Bihar's culture and designed for modern streetwear.",
    productId: 'kala-bihari-story-premium-t-shirt',
    link: '/product/kala-bihari-story-premium-t-shirt',
    features: ['220 GSM', 'Premium Comfort', 'Durable Fabric', 'Comfortable Fit'],
    frontImage: getProductImage('kala-bihari-story-front.png') || '/images/kala-bihari-story-front.png',
    backImage: getProductImage('kala-bihari-story-back.png') || '/images/kala-bihari-story-back.png',
    ctaText: 'VIEW PRODUCT',
  },

  // 2. Slide 2 — MULTI-BUY OFFER: Build Your T-Shirt Stack
  {
    id: 'tshirt-stack-bundle',
    type: 'bundle',
    title: 'BUILD YOUR T-SHIRT STACK',
    subtitle: 'CHOOSE MORE. SAVE MORE.',
    badge: 'LIMITED OFFER',
    subBadge: 'MULTI-BUY',
    description: 'Mix and match from our collection and create your own bundle.',
    ctaText: 'SHOP THE OFFER',
    link: '/bundle?offer=3',
    options: [
      {
        count: 2,
        price: 499,
        label: '2 T-SHIRTS — ₹499',
        link: '/bundle?offer=2',
      },
      {
        count: 3,
        price: 699,
        label: '3 T-SHIRTS — ₹699',
        link: '/bundle?offer=3',
      },
      {
        count: 5,
        price: 999,
        label: '5 T-SHIRTS — ₹999',
        highlight: 'BEST VALUE',
        link: '/bundle?offer=5',
      },
    ],
    stackImages: [
      getProductImage('Streetwear 01.png') || '/images/Streetwear 01.png',
      getProductImage('kala-bihari-story-front.png') || '/images/kala-bihari-story-front.png',
      getProductImage('Streetwear 05.png') || '/images/Streetwear 05.png',
    ],
  },

  // 3. Slide 3 — UPCOMING EVENT: KALA CULTURE DROPS
  {
    id: 'kala-culture-drops',
    type: 'upcoming',
    locked: true,
    categoryBadge: 'PAN-INDIA CULTURE DROPS',
    title: 'KALA CULTURE DROPS',
    description:
      'Wear your roots with pride. Create, customize, and cop original oversized streetwear inspired by the iconic cultures, art, and slang of states across India — reimagined with raw Gen-Z energy. Rep your state and wear your story.',
    date: 'COMING SOON',
    status: '🔒 LOCKED • RELEASING SOON',
    topLeftBadge: 'UPCOMING EVENT',
    topRightBadge: 'CULTURE DROP',
    topRightIcon: '🇮🇳',
    focalTag: 'STATE CULTURE INITIATIVE',
    image: '/events/culture-drops.jpg',
    badgeModifier: 'culture-badge',
  },

  // 4. Slide 4 — LIVE EVENT: DESIGNATHON IN GGV BY KALA
  {
    id: 'kala-designathon-ggv',
    type: 'live',
    categoryBadge: 'OFFICIAL EVENT • GGV',
    title: 'DESIGNATHON IN GGV BY KALA',
    slogan: 'SHOW YOUR कला',
    description:
      'Show Your कला! Unleash your design vision, battle with student creators across colleges, and win custom-printed T-shirts and exclusive KALA streetwear gear. Registration open now at ₹49.',
    date: '24 OCTOBER 2026',
    time: '11:00 AM–2:00 PM',
    fee: 49,
    status: 'LIVE EVENT • REGISTRATIONS OPEN',
    topLeftBadge: 'LIVE EVENT',
    topRightBadge: '₹49 ENTRY',
    topRightIcon: '🎨',
    focalTag: 'SHOW YOUR कला',
    image: '/events/campus-ideathon.jpg',
    badgeModifier: 'ideathon-badge',
    link: '/designathon',
    ctaText: 'REGISTER NOW (₹49)',
  },

  // 5. Slide 5 — UPCOMING EVENT: CREATOR × DESIGNER × KALA
  {
    id: 'creator-designer-kala',
    type: 'upcoming',
    locked: true,
    categoryBadge: 'KALA COLLABORATION',
    title: 'CREATOR × DESIGNER × KALA',
    description:
      'Creators bring the audience. Designers bring the ideas. KALA brings them to life. Collaborate, create original products, and earn together when your collection reaches customers.',
    date: 'COMING SOON',
    status: '🔒 LOCKED • RELEASING SOON',
    topLeftBadge: 'UPCOMING EVENT',
    topRightBadge: 'COLLAB DROP',
    topRightIcon: '🤝',
    focalTag: 'COLLABORATION INITIATIVE',
    image: '/events/collab-royalty.jpg',
    badgeModifier: 'collab-badge',
  },
]

export const UPCOMING_EVENTS = KALA_EVENTS.filter((e): e is UpcomingEvent => e.type === 'upcoming')
export const LIVE_EVENTS = KALA_EVENTS.filter((e): e is LiveEvent => e.type === 'live')
