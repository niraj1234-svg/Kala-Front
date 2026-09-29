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
  title: string
  badge: string
  icon: string
  description: string
  releaseDate: string
  releaseDateLabel: string
  conceptTag: string
  backgroundGraphic?: string
}

export type KalaEvent = ProductEvent | BundleEvent | UpcomingEvent

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

  // 3. Slide 3 — UPCOMING EVENT: Designathon Idea
  {
    id: 'designathon-idea',
    type: 'upcoming',
    locked: true,
    title: 'DESIGNATHON IDEA',
    badge: 'UPCOMING EVENT',
    icon: '🎁',
    description:
      'Create a T-shirt design and submit it through KALA. Once your design is selected and the T-shirt is available on KALA, you can earn a royalty whenever customers purchase your design.',
    releaseDate: '25 / 10 / 2026',
    releaseDateLabel: 'October 2026',
    conceptTag: 'CREATOR ROYALTY PROGRAM',
    backgroundGraphic: getProductImage('gaming 03.png') || '/images/gaming 03.png',
  },
]
