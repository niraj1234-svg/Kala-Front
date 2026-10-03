import { Product } from '../models/Product'
import { connectDB } from './db'

export const SEED_PRODUCTS = [
  // AI & Data Science Polo T-Shirt (Featured First Product)
  {
    id: 'ai-data-science-polo-t-shirt',
    name: 'AI & Data Science Polo T-Shirt',
    category: 'Streetwear',
    price: 250,
    image: 'ai-data-science-polo-front.png',
    images: ['ai-data-science-polo-front.png', 'ai-data-science-polo-back.png'],
    description: 'Premium polo T-shirt with AI & Data Science artwork.',
    available: true,
  },

  // KALA Bihari Story Premium T-Shirt (Featured Second Product)
  {
    id: 'kala-bihari-story-premium-t-shirt',
    name: 'KALA Bihari Story Premium T-Shirt',
    category: 'Streetwear',
    price: 400,
    image: 'kala-bihari-story-front.png',
    images: [
      'kala-bihari-story-front.png',
      'kala-bihari-story-back.png',
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
    image: 'Streetwear 01.png',
    description: 'Premium 280 GSM oversized cotton tee.',
    available: true,
    freeShipping: true,
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

  // 8 New Original Streetwear Products
  {
    id: 'midnight-tokyo-tshirt',
    name: 'Midnight Tokyo T-Shirt',
    category: 'Streetwear',
    price: 499,
    image: 'midnight-tokyo-tshirt.png',
    description: 'Original anime-inspired urban artwork built for late-night streetwear.',
    available: true,
  },
  {
    id: 'no-signal-tshirt',
    name: 'No Signal T-Shirt',
    category: 'Streetwear',
    price: 449,
    image: 'no-signal-tshirt.png',
    description: 'Minimal glitch-inspired streetwear for an always-connected generation.',
    available: true,
  },
  {
    id: 'after-dark-tshirt',
    name: 'After Dark T-Shirt',
    category: 'Streetwear',
    price: 499,
    image: 'after-dark-tshirt.png',
    description: 'Original night-themed streetwear with moonlight and dark urban aesthetic.',
    available: true,
  },
  {
    id: 'lost-in-thought-tshirt',
    name: 'Lost In Thought T-Shirt',
    category: 'Streetwear',
    price: 499,
    image: 'lost-in-thought-tshirt.png',
    description: 'Original anime-inspired reflective artwork in an oversized graphic aesthetic.',
    available: true,
  },
  {
    id: 'offline-society-tshirt',
    name: 'Offline Society T-Shirt',
    category: 'Streetwear',
    price: 399,
    image: 'offline-society-tshirt.png',
    description: 'Minimalist typography-driven streetwear for disconnecting with purpose.',
    available: true,
  },
  {
    id: 'future-is-loading-tshirt',
    name: 'Future Is Loading T-Shirt',
    category: 'Streetwear',
    price: 449,
    image: 'future-is-loading-tshirt.png',
    description: 'Futuristic loading interface graphic designed for next-gen street style.',
    available: true,
  },
  {
    id: 'rebel-mind-tshirt',
    name: 'Rebel Mind T-Shirt',
    category: 'Streetwear',
    price: 499,
    image: 'rebel-mind-tshirt.png',
    description: 'Bold and edgy illustrated streetwear graphic for an independent mindset.',
    available: true,
  },
  {
    id: 'urban-chaos-tshirt',
    name: 'Urban Chaos T-Shirt',
    category: 'Streetwear',
    price: 499,
    image: 'urban-chaos-tshirt.png',
    description: 'Abstract geometric street graphic built for modern oversized streetwear.',
    available: true,
  },

  // Gaming (5 existing items)
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

  // 6 New Original Gaming Products
  {
    id: 'respawn-mode-tshirt',
    name: 'Respawn Mode T-Shirt',
    category: 'Gaming',
    price: 449,
    image: 'respawn-mode-tshirt.png',
    description: 'Futuristic gaming graphics built for your next level.',
    available: true,
  },
  {
    id: 'night-raid-tshirt',
    name: 'Night Raid T-Shirt',
    category: 'Gaming',
    price: 499,
    image: 'night-raid-tshirt.png',
    description: 'Tactical cyberpunk operative graphic inspired by high-stakes night missions.',
    available: true,
  },
  {
    id: 'level-up-tshirt',
    name: 'Level Up T-Shirt',
    category: 'Gaming',
    price: 399,
    image: 'level-up-tshirt.png',
    description: 'Clean pixel and futuristic graphics built for everyday gaming style.',
    available: true,
  },
  {
    id: 'critical-hit-tshirt',
    name: 'Critical Hit T-Shirt',
    category: 'Gaming',
    price: 449,
    image: 'critical-hit-tshirt.png',
    description: 'Energetic high-impact typography with dynamic dark gaming aesthetic.',
    available: true,
  },
  {
    id: 'cyber-player-tshirt',
    name: 'Cyber Player T-Shirt',
    category: 'Gaming',
    price: 499,
    image: 'cyber-player-tshirt.png',
    description: 'Cyberpunk-inspired player artwork crafted with sleek neon accents.',
    available: true,
  },
  {
    id: 'game-over-never-tshirt',
    name: 'Game Over Never T-Shirt',
    category: 'Gaming',
    price: 399,
    image: 'game-over-never-tshirt.png',
    description: 'Motivational minimalist gaming typography with digital glitch detailing.',
    available: true,
  },

  // Gymwear (7 existing items)
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
    id: 'gymwear-dynamic-stretch-shorts-06',
    name: 'KALA 5-Inch Dynamic Training Shorts',
    category: 'Gymwear',
    price: 569,
    image: 'Gymwear06.png',
    description: '5-inch stretch training shorts with compression liner.',
    available: true,
    variants: [
      {
        color: '#000000',
        colorName: 'Black',
        image: 'Gymwear06.png',
      },
      {
        color: '#FFFFFF',
        colorName: 'White',
        image: 'Gymwear-05.png',
      },
    ],
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

  // 6 New Original Gymwear Products
  {
    id: 'built-different-tshirt',
    name: 'Built Different T-Shirt',
    category: 'Gymwear',
    price: 499,
    image: 'built-different-tshirt.png',
    description: 'Minimal athletic streetwear for people who train with purpose.',
    available: true,
  },
  {
    id: 'no-days-off-tshirt',
    name: 'No Days Off T-Shirt',
    category: 'Gymwear',
    price: 449,
    image: 'no-days-off-tshirt.png',
    description: 'Bold monochrome athletic typography built for relentless daily consistency.',
    available: true,
  },
  {
    id: 'discipline-tshirt',
    name: 'Discipline T-Shirt',
    category: 'Gymwear',
    price: 499,
    image: 'discipline-tshirt.png',
    description: 'Minimalist strength graphic honoring discipline over fleeting motivation.',
    available: true,
  },
  {
    id: 'train-insane-tshirt',
    name: 'Train Insane T-Shirt',
    category: 'Gymwear',
    price: 499,
    image: 'train-insane-tshirt.png',
    description: 'High-performance gym aesthetic engineered for aggressive training sessions.',
    available: true,
  },
  {
    id: 'iron-mind-tshirt',
    name: 'Iron Mind T-Shirt',
    category: 'Gymwear',
    price: 499,
    image: 'iron-mind-tshirt.png',
    description: 'Industrial metallic graphic representing an unbreakable training mindset.',
    available: true,
  },
  {
    id: 'earn-your-strength-tshirt',
    name: 'Earn Your Strength T-Shirt',
    category: 'Gymwear',
    price: 449,
    image: 'earn-your-strength-tshirt.png',
    description: 'Clean motivational fitness graphic designed for dedicated lifters.',
    available: true,
  },
]

/**
 * Synchronizes the 40 authoritative products in MongoDB Atlas in-place without modifying _id
 * and removes any legacy non-catalog items.
 */
export const syncProductPrices = async () => {
  try {
    const validIds = SEED_PRODUCTS.map((p) => p.id)

    // Remove obsolete test/custom IDs so the collection has strictly the 40 catalog products
    const deleteRes = await Product.deleteMany({ id: { $nin: validIds } })
    if (deleteRes.deletedCount > 0) {
      console.log(`[MongoDB] Cleaned up ${deleteRes.deletedCount} non-catalog items.`)
    }

    let updatedCount = 0
    for (const item of SEED_PRODUCTS) {
      const updateData: any = {
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image,
        description: item.description,
        available: item.available,
      }
      if ((item as any).images) {
        updateData.images = (item as any).images
      }
      if ((item as any).variants) {
        updateData.variants = (item as any).variants
      }
      if ((item as any).freeShipping !== undefined) {
        updateData.freeShipping = (item as any).freeShipping
      }
      if ((item as any).customPrintTextEnabled !== undefined) {
        updateData.customPrintTextEnabled = (item as any).customPrintTextEnabled
      }
      if ((item as any).customPrintTextPrice !== undefined) {
        updateData.customPrintTextPrice = (item as any).customPrintTextPrice
      }

      const res = await Product.updateOne(
        { id: item.id },
        {
          $set: updateData,
          $setOnInsert: {
            id: item.id,
            createdAt:
              item.id === 'ai-data-science-polo-t-shirt'
                ? new Date('2019-01-01')
                : item.id === 'kala-bihari-story-premium-t-shirt'
                  ? new Date('2020-01-01')
                  : new Date(),
          },
        },
        { upsert: true }
      )
      if (res.matchedCount > 0 || res.upsertedCount > 0) {
        updatedCount++
      }
    }
    console.log(`[MongoDB] Successfully synchronized catalog for ${updatedCount} products in MongoDB.`)
  } catch (error) {
    console.error('[MongoDB] Error updating product catalog:', error)
  }
}

export const seedProducts = async (force: boolean = false) => {
  try {
    const count = await Product.countDocuments()
    if (count > 0 && !force) {
      console.log(`[MongoDB] Products collection contains ${count} items. Synchronizing catalog...`)
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

// Standalone execution support: npx ts-node src/config/seed.ts
if (require.main === module || process.argv[1]?.includes('seed')) {
  ;(async () => {
    await connectDB()
    await syncProductPrices()
    const finalCount = await Product.countDocuments()
    console.log(`[MongoDB] Final verified product count: ${finalCount}`)
    process.exit(0)
  })()
}
