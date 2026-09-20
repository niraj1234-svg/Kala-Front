import { Product } from '../models/Product'
import { connectDB } from './db'

export const SEED_PRODUCTS = [
  // Streetwear (6 items)
  {
    id: 'streetwear-oversized-acid-tee',
    name: 'KALA Raw Acid-Wash Oversized Tee',
    category: 'Streetwear',
    price: 399,
    image: 'Streetwear 01.png',
    description: 'Premium 280 GSM oversized cotton tee.',
    available: true,
  },
  {
    id: 'streetwear-heavyweight-hoodie-onyx',
    name: 'KALA Heavyweight Boxy Hoodie',
    category: 'Streetwear',
    price: 499,
    image: 'Streetwear -02.png',
    description: 'Heavyweight 450 GSM French Terry boxy hoodie.',
    available: true,
  },
  {
    id: 'streetwear-tactical-cargo-pant',
    name: 'KALA Utility Relaxed Cargo',
    category: 'Streetwear',
    price: 479,
    image: 'Streetwear 03.png',
    description: 'Relaxed utility cargo pants with deep pockets.',
    available: true,
  },
  {
    id: 'streetwear-vintage-wash-tee',
    name: 'KALA Vintage Fade Graphic Tee',
    category: 'Streetwear',
    price: 349,
    image: 'Streetwear 04.png',
    description: 'Vintage fade combed ringspun cotton graphic tee.',
    available: true,
  },
  {
    id: 'streetwear-monochrome-sweatshirt',
    name: 'KALA Minimalist Crewneck Sweatshirt',
    category: 'Streetwear',
    price: 449,
    image: 'Streetwear 05.png',
    description: 'Minimalist brushed cotton fleece crewneck sweatshirt.',
    available: true,
  },
  {
    id: 'streetwear-distressed-urban-tee',
    name: 'KALA Urban Statement Distressed Tee',
    category: 'Streetwear',
    price: 379,
    image: 'Streetwear 06.png',
    description: 'Modern urban raw-hemline streetwear tee.',
    available: true,
  },

  // Gaming (5 items)
  {
    id: 'gaming-cyber-pro-jersey-01',
    name: 'KALA Apex Cyber Esports Jersey',
    category: 'Gaming',
    price: 429,
    image: 'gaming 01.png',
    description: 'Moisture-wicking tournament esports jersey.',
    available: true,
  },
  {
    id: 'gaming-stealth-tactical-hoodie-02',
    name: 'KALA Stealth Tactical Gamer Hoodie',
    category: 'Gaming',
    price: 499,
    image: 'gaming 02.png',
    description: 'Tactical hoodie with headset-compatible hood.',
    available: true,
  },
  {
    id: 'gaming-neon-overload-tee-03',
    name: 'KALA Neo-Tokyo Glitch Graphic Tee',
    category: 'Gaming',
    price: 349,
    image: 'gaming 03.png',
    description: 'High-density glitch graphic gaming tee.',
    available: true,
  },
  {
    id: 'gaming-pro-arena-warmup-04',
    name: 'KALA Arena Champion Warmup Zip',
    category: 'Gaming',
    price: 479,
    image: 'gaming 04.png',
    description: 'Lightweight quarter-zip athletic trainer jacket.',
    available: true,
  },
  {
    id: 'gaming-shadow-spec-ops-tee-05',
    name: 'KALA Shadow Protocol Gaming Tee',
    category: 'Gaming',
    price: 369,
    image: 'gaming 05.png',
    description: 'Breathable mesh-paneled stealth gaming tee.',
    available: true,
  },

  // Gymwear (9 items)
  {
    id: 'gymwear-performance-compression-tee-01',
    name: 'KALA Aerodynamic Compression Tee',
    category: 'Gymwear',
    price: 549,
    image: 'gymwear-01.jpg.jpeg',
    description: '4-way stretch athletic compression tee.',
    available: true,
  },
  {
    id: 'gymwear-seamless-muscle-tank-02',
    name: 'KALA Core Seamless Muscle Tank',
    category: 'Gymwear',
    price: 499,
    image: 'gymwear02.png',
    description: 'Drop-armhole sweat-wicking seamless muscle tank.',
    available: true,
  },
  {
    id: 'gymwear-tapered-jogger-03',
    name: 'KALA Precision Tapered Training Jogger',
    category: 'Gymwear',
    price: 749,
    image: 'gymwear-03.png',
    description: 'Squat-proof tapered training joggers with zip pockets.',
    available: true,
  },
  {
    id: 'gymwear-endurance-dryfit-tee-04',
    name: 'KALA VaporLite Dry-Fit Tee',
    category: 'Gymwear',
    price: 519,
    image: 'Gymwear04.png',
    description: 'Featherlight anti-odor dry-fit training tee.',
    available: true,
  },
  {
    id: 'gymwear-oversized-pump-cover-05',
    name: 'KALA Heavy Pump Cover Tee',
    category: 'Gymwear',
    price: 599,
    image: 'Gymwear-05.png',
    description: 'Heavyweight 300 GSM boxy cotton pump cover tee.',
    available: true,
  },
  {
    id: 'gymwear-dynamic-stretch-shorts-06',
    name: 'KALA 5-Inch Dynamic Training Shorts',
    category: 'Gymwear',
    price: 569,
    image: 'Gymwear06.png',
    description: '5-inch stretch training shorts with compression liner.',
    available: true,
  },
  {
    id: 'gymwear-hybrid-longsleeve-07',
    name: 'KALA Thermal Guard Hybrid Longsleeve',
    category: 'Gymwear',
    price: 699,
    image: 'Gymwear07.png',
    description: 'Breathable thermal training longsleeve.',
    available: true,
  },
  {
    id: 'gymwear-power-lifting-hoodie-08',
    name: 'KALA Iron Cut Sleeveless Lift Hoodie',
    category: 'Gymwear',
    price: 729,
    image: 'Gymwear08.png',
    description: 'Heavyweight sleeveless fleece lifting hoodie.',
    available: true,
  },
  {
    id: 'gymwear-elite-recovery-pants-09',
    name: 'KALA Elite Recovery Ribbed Trackpant',
    category: 'Gymwear',
    price: 799,
    image: 'Gymwear09.png',
    description: 'Plush ribbed athletic recovery trackpants.',
    available: true,
  },
]

/**
 * Safely updates prices and simplified descriptions in MongoDB Atlas in-place without modifying _id, names,
 * categories, or images.
 */
export const syncProductPrices = async () => {
  try {
    let updatedCount = 0
    for (const item of SEED_PRODUCTS) {
      const res = await Product.updateOne(
        { id: item.id },
        { $set: { price: item.price, description: item.description } }
      )
      if (res.matchedCount > 0) {
        updatedCount++
      }
    }
    console.log(`[MongoDB] Successfully synchronized authoritative catalog for ${updatedCount} products in MongoDB.`)
  } catch (error) {
    console.error('[MongoDB] Error updating product catalog:', error)
  }
}

export const seedProducts = async (force: boolean = false) => {
  try {
    const count = await Product.countDocuments()
    if (count > 0 && !force) {
      console.log(`[MongoDB] Products collection contains ${count} items. Synchronizing authoritative catalog...`)
      await syncProductPrices()
      return
    }

    if (force) {
      await Product.deleteMany({})
      console.log('[MongoDB] Cleared existing products for re-seeding.')
    }

    await Product.insertMany(SEED_PRODUCTS)
    console.log(`[MongoDB] Successfully seeded ${SEED_PRODUCTS.length} KALA products into MongoDB Atlas.`)
  } catch (error) {
    console.error('[MongoDB] Error seeding products:', error)
  }
}

// Standalone execution support: tsx src/config/seed.ts
if (require.main === module || process.argv[1]?.includes('seed')) {
  ;(async () => {
    await connectDB()
    await syncProductPrices()
    process.exit(0)
  })()
}
