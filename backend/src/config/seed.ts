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

  // 40 Interleaved Graphic Tees & Gymwear Sets
  {
    id: 'keep-moving-forward-tshirt',
    name: 'Keep Moving Forward T-Shirt',
    badge: 'ANIME',
    category: 'Streetwear',
    price: 499,
    image: 'keep-moving-forward-tshirt.png',
    description: 'Rising sun crimson circle with stoic samurai silhouette, delicate sakura branches, and vertical Japanese kanji (進み続ける).',
    available: true,
  },
  {
    id: 'kala-apex-compression-set',
    name: 'KALA Apex Compression Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-apex-compression-set.png',
    images: ['kala-apex-compression-set.png', 'kala-apex-compression-set-back.png'],
    description: 'High-performance athletic compression set featuring moisture-wicking ergonomic tee and tapered compression training pants with reflective aerodynamic graphic lines.',
    available: true,
  },
  {
    id: 'wander-more-tshirt',
    name: 'Wander More T-Shirt',
    badge: 'TRAVEL',
    category: 'Streetwear',
    price: 449,
    image: 'wander-more-tshirt.png',
    description: 'Fine-line woodcut alpine mountain peaks and pine ridge illustration with hand-drawn cursive lettering on vintage cream cotton.',
    available: true,
  },
  {
    id: 'kala-discipline-set',
    name: 'KALA Discipline Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-discipline-set.png',
    images: ['kala-discipline-set.png', 'kala-discipline-set-back.png'],
    description: 'Discipline Builds Freedom heavyweight athletic training set in crisp white with contrasting black side-stripe pants and collegiate barbell artwork.',
    available: true,
  },
  {
    id: 'brooklyn-varsity-tshirt',
    name: 'Brooklyn Varsity T-Shirt',
    badge: 'STREETWEAR',
    category: 'Streetwear',
    price: 399,
    image: 'brooklyn-varsity-tshirt.png',
    description: 'Arched collegiate varsity lettering with athletic double outline and New York division text.',
    available: true,
  },
  {
    id: 'kala-oni-training-set',
    name: 'KALA Oni Training Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-oni-training-set.png',
    images: ['kala-oni-training-set.png', 'kala-oni-training-set-back.png'],
    description: 'Dark aesthetic strength training set with fierce Oni demon mask graphic, Japanese kanji for power (力), and dual-tone crimson trackpants.',
    available: true,
  },
  {
    id: 'good-things-take-time-tshirt',
    name: 'Good Things Take Time T-Shirt',
    badge: 'MINIMAL',
    category: 'Streetwear',
    price: 399,
    image: 'good-things-take-time-tshirt.png',
    description: 'Minimalist typography centered on chest with subtle horizontal line accent for mindful streetwear.',
    available: true,
  },
  {
    id: 'kala-grind-mode-set',
    name: 'KALA Grind Mode Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 499,
    image: 'kala-grind-mode-set.png',
    images: ['kala-grind-mode-set.png', 'kala-grind-mode-set-back.png'],
    description: 'Tactical military olive green training set with Train Eat Sleep Repeat back graphic and relaxed utility cargo joggers.',
    available: true,
  },
  {
    id: 'out-of-office-tshirt',
    name: 'Out of Office T-Shirt',
    badge: 'VIBE',
    category: 'Streetwear',
    price: 449,
    image: 'out-of-office-tshirt.png',
    description: 'Vintage 1970s classic sedan cruiser car with retro striped sunset oval and palm tree silhouettes.',
    available: true,
  },
  {
    id: 'kala-everyday-set',
    name: 'KALA Everyday Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-everyday-set.png',
    images: ['kala-everyday-set.png', 'kala-everyday-set-back.png'],
    description: 'Everyday athletic set in deep midnight navy with Better Than Yesterday typography and moisture-wicking tapered trackpants.',
    available: true,
  },
  {
    id: 'feel-everything-tshirt',
    name: 'Feel Everything T-Shirt',
    badge: 'ART',
    category: 'Streetwear',
    price: 449,
    image: 'feel-everything-tshirt.png',
    description: "Renaissance marble sculpture bust of Michelangelo's David with a bold red censor block over eyes.",
    available: true,
  },
  {
    id: 'kala-evolve-set',
    name: 'KALA Evolve Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 499,
    image: 'kala-evolve-set.png',
    images: ['kala-evolve-set.png', 'kala-evolve-set-back.png'],
    description: 'Warm desert sand beige gym set featuring Lift Grow Evolve barbell typography and matching relaxed athletic track shorts.',
    available: true,
  },
  {
    id: 'lost-in-the-right-direction-tshirt',
    name: 'Lost in the Right Direction T-Shirt',
    badge: 'TRAVEL',
    category: 'Streetwear',
    price: 449,
    image: 'lost-in-the-right-direction-tshirt.png',
    description: 'Framed ocean swell landscape photograph with clean editorial typography and geographic coordinates.',
    available: true,
  },
  {
    id: 'kala-no-limits-set',
    name: 'KALA No Limits Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-no-limits-set.png',
    images: ['kala-no-limits-set.png', 'kala-no-limits-set-back.png'],
    description: 'Blackout performance gym set with bold crimson No Limits distressed text and white lightning slash graphic joggers.',
    available: true,
  },
  {
    id: 'anti-social-club-tshirt',
    name: 'Anti Social Club T-Shirt',
    badge: 'STREETWEAR',
    category: 'Streetwear',
    price: 449,
    image: 'anti-social-club-tshirt.png',
    description: 'Distressed stencil block lettering with a neon hot-pink dripping spray-paint smiley face.',
    available: true,
  },
  {
    id: 'kala-wings-set',
    name: 'KALA Wings Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-wings-set.png',
    images: ['kala-wings-set.png', 'kala-wings-set-back.png'],
    description: 'Angelic valkyrie feathered wing graphics spreading across shoulders and back on pure white performance tee with matching training pants.',
    available: true,
  },
  {
    id: 'moon-friend-tshirt',
    name: 'Moon Friend T-Shirt',
    badge: 'SPACE',
    category: 'Gaming',
    price: 449,
    image: 'moon-friend-tshirt.png',
    description: 'Cute spacesuit astronaut sitting on a cratered moon holding a glowing Earth balloon with twinkling stars.',
    available: true,
  },
  {
    id: 'kala-relentless-set',
    name: 'KALA Relentless Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-relentless-set.png',
    images: ['kala-relentless-set.png', 'kala-relentless-set-back.png'],
    description: 'Deep crimson maroon athletic set featuring Relentless Progress Over Excuses typography and black trackpants with ruby side panels.',
    available: true,
  },
  {
    id: 'evolve-tshirt',
    name: 'Evolve T-Shirt',
    badge: 'LIFESTYLE',
    category: 'Gaming',
    price: 399,
    image: 'evolve-tshirt.png',
    description: 'Hyper-vivid electric blue Morpho butterfly with a floating gold coronet crown and motivational subtitle.',
    available: true,
  },
  {
    id: 'kala-overthink-set',
    name: 'KALA Overthink Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-overthink-set.png',
    images: ['kala-overthink-set.png', 'kala-overthink-set-back.png'],
    description: 'Edgy gothic gymwear set in pitch black with thorny barbed wire graphic framing Overthink lettering and matching graphic trackpants.',
    available: true,
  },
  {
    id: 'beyond-reality-tshirt',
    name: 'Beyond Reality T-Shirt',
    badge: 'ANIME',
    category: 'Gaming',
    price: 449,
    image: 'beyond-reality-tshirt.png',
    description: 'Horizontal rectangular manga eye panel with intense piercing anime gaze, Japanese kanji and subtitle.',
    available: true,
  },
  {
    id: 'kala-nature-set',
    name: 'KALA Nature Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 499,
    image: 'kala-nature-set.png',
    images: ['kala-nature-set.png', 'kala-nature-set-back.png'],
    description: 'Deep evergreen pine forest green training set with Nature Heals mountain peak graphics and functional cargo pockets.',
    available: true,
  },
  {
    id: 'create-your-own-reality-tshirt',
    name: 'Create Your Own Reality T-Shirt',
    badge: 'CREATIVE',
    category: 'Gaming',
    price: 449,
    image: 'create-your-own-reality-tshirt.png',
    description: 'Chunky 90s 3D puffy graffiti lettering in emerald green with deep extruded shadow and star accent.',
    available: true,
  },
  {
    id: 'kala-iron-mind-set',
    name: 'KALA Iron Mind Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-iron-mind-set.png',
    images: ['kala-iron-mind-set.png', 'kala-iron-mind-set-back.png'],
    description: 'Futuristic mecha armor and cyborg exoskeleton graphic on pitch black cotton-poly blend with high-density tech joggers.',
    available: true,
  },
  {
    id: 'chaos-makes-better-stories-tshirt',
    name: 'Chaos Makes Better Stories T-Shirt',
    badge: 'STREETWEAR',
    category: 'Gaming',
    price: 449,
    image: 'chaos-makes-better-stories-tshirt.png',
    description: 'Gothic blackletter typography engulfed in vibrant electric purple/violet hot flames on pitch black cotton.',
    available: true,
  },
  {
    id: 'kala-good-mood-set',
    name: 'KALA Good Mood Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 499,
    image: 'kala-good-mood-set.png',
    images: ['kala-good-mood-set.png', 'kala-good-mood-set-back.png'],
    description: 'Vibrant indigo blue gym set with Good Muscles Good Mood barbell back stamp and ergonomic four-way stretch joggers.',
    available: true,
  },
  {
    id: 'still-here-tshirt',
    name: 'Still Here T-Shirt',
    badge: 'ART',
    category: 'Gaming',
    price: 449,
    image: 'still-here-tshirt.png',
    description: 'Detailed anatomical woodcut engraving of a human ribcage with a vivid electric cyan butterfly on the clavicle.',
    available: true,
  },
  {
    id: 'kala-zen-set',
    name: 'KALA Zen Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-zen-set.png',
    images: ['kala-zen-set.png', 'kala-zen-set-back.png'],
    description: 'Traditional Japanese irezumi koi fish and sacred lotus flower graphics with Peace kanji (平和) on washed black athletic cotton.',
    available: true,
  },
  {
    id: 'discipline-builds-freedom-tshirt',
    name: 'Discipline Builds Freedom T-Shirt',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 399,
    image: 'discipline-builds-freedom-tshirt.png',
    description: 'Collegiate arched typography with heavy Olympic barbell and knurled iron plates for training consistency.',
    available: true,
  },
  {
    id: 'kala-tech-set',
    name: 'KALA Tech Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 499,
    image: 'kala-tech-set.png',
    images: ['kala-tech-set.png', 'kala-tech-set-back.png'],
    description: 'Cyberpunk geometric paneling compression set with breathable side mesh zones in futuristic white and platinum grey.',
    available: true,
  },
  {
    id: 'the-mountains-are-calling-tshirt',
    name: 'The Mountains Are Calling T-Shirt',
    badge: 'OUTDOOR',
    category: 'Gymwear',
    price: 449,
    image: 'the-mountains-are-calling-tshirt.png',
    description: 'Bold typography with snowy alpine mountain ridges and warm harvest moon circle in vintage denim blue.',
    available: true,
  },
  {
    id: 'kala-purpose-set',
    name: 'KALA Purpose Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-purpose-set.png',
    images: ['kala-purpose-set.png', 'kala-purpose-set-back.png'],
    description: 'Intense crimson fire embers and Pain Progress Purpose motivational lettering on jet black athletic performance fabric.',
    available: true,
  },
  {
    id: 'bloom-at-your-own-pace-tshirt',
    name: 'Bloom at Your Own Pace T-Shirt',
    badge: 'MINIMAL',
    category: 'Gymwear',
    price: 399,
    image: 'bloom-at-your-own-pace-tshirt.png',
    description: 'Delicate fine-line botanical illustration of tall sunflowers and daisies with refined serif typography.',
    available: true,
  },
  {
    id: 'kala-focus-set',
    name: 'KALA Focus Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 499,
    image: 'kala-focus-set.png',
    images: ['kala-focus-set.png', 'kala-focus-set-back.png'],
    description: 'Deep petrol teal blue gym set with Discipline Today Results Tomorrow typography and flexible moisture-wicking joggers.',
    available: true,
  },
  {
    id: 'inner-peace-tshirt',
    name: 'Inner Peace T-Shirt',
    badge: 'MINIMAL',
    category: 'Gymwear',
    price: 399,
    image: 'inner-peace-tshirt.png',
    description: 'Woodcut linocut Great Wave circular crest with vertical Japanese kanji for Peace (平和).',
    available: true,
  },
  {
    id: 'kala-progress-set',
    name: 'KALA Progress Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-progress-set.png',
    images: ['kala-progress-set.png', 'kala-progress-set-back.png'],
    description: 'Vintage ecru training set featuring Great Wave woodcut crest with crimson rising sun and Small Steps Big Changes philosophy.',
    available: true,
  },
  {
    id: 'better-days-ahead-tshirt',
    name: 'Better Days Ahead T-Shirt',
    badge: 'MOTIVATIONAL',
    category: 'Gymwear',
    price: 399,
    image: 'better-days-ahead-tshirt.png',
    description: 'Expressive hand-lettered brush script typography with golden sparkle starbursts in rich vintage maroon.',
    available: true,
  },
  {
    id: 'kala-chaos-set',
    name: 'KALA Chaos Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 549,
    image: 'kala-chaos-set.png',
    images: ['kala-chaos-set.png', 'kala-chaos-set-back.png'],
    description: 'Neon electric purple cyber butterfly with Chaos Breeds Growth typography and matching purple flame accent joggers.',
    available: true,
  },
  {
    id: 'nature-heals-tshirt',
    name: 'Nature Heals T-Shirt',
    badge: 'NATURE',
    category: 'Gymwear',
    price: 399,
    image: 'nature-heals-tshirt.png',
    description: 'Clean serif typography with a rectangular framed landscape print of misty evergreen pine forest and mountain ridges.',
    available: true,
  },
  {
    id: 'kala-repeat-set',
    name: 'KALA Repeat Set',
    badge: 'GYMWEAR',
    category: 'Gymwear',
    price: 499,
    image: 'kala-repeat-set.png',
    images: ['kala-repeat-set.png', 'kala-repeat-set-back.png'],
    description: 'Heather stone grey athletic gym set with Run Lift Improve Repeat chevron layout and performance trackpants.',
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
