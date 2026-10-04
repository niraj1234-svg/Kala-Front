import os
import re

# 20 Gymwear sets definition
gymwear_sets = [
    {
        'id': 'kala-apex-compression-set',
        'name': 'KALA Apex Compression Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-apex-compression-set.png',
        'description': 'High-performance athletic compression set featuring moisture-wicking ergonomic tee and tapered compression training pants with reflective aerodynamic graphic lines.',
        'highlights': [
            {'label': 'Fit', 'value': 'Ergonomic Athletic Compression'},
            {'label': 'Fabric', 'value': '88% Moisture-Wicking Poly / 12% Spandex'},
            {'label': 'Includes', 'value': '2-Piece Set (Compression Tee + Tapered Pants)'},
            {'label': 'Features', 'value': '4-Way Stretch, Reflective Tech Lines'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-discipline-set',
        'name': 'KALA Discipline Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-discipline-set.png',
        'description': 'Discipline Builds Freedom heavyweight athletic training set in crisp white with contrasting black side-stripe pants and collegiate barbell artwork.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Performance Training'},
            {'label': 'Fabric', 'value': '240 GSM Heavyweight French Terry Cotton'},
            {'label': 'Includes', 'value': '2-Piece Set (Discipline Tee + Side-Stripe Pants)'},
            {'label': 'Pattern', 'value': 'Collegiate Barbell & Discipline Graphic'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-oni-training-set',
        'name': 'KALA Oni Training Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-oni-training-set.png',
        'description': 'Dark aesthetic strength training set with fierce Oni demon mask graphic, Japanese kanji for power (力), and dual-tone crimson trackpants.',
        'highlights': [
            {'label': 'Fit', 'value': 'Athletic Pump Cover & Tapered Joggers'},
            {'label': 'Fabric', 'value': 'High-Density Breathable Cotton-Poly Blend'},
            {'label': 'Includes', 'value': '2-Piece Set (Oni Graphic Tee + Dual-Tone Pants)'},
            {'label': 'Pattern', 'value': 'Traditional Japanese Oni Demon & Kanji (力)'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-grind-mode-set',
        'name': 'KALA Grind Mode Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 499,
        'image': 'kala-grind-mode-set.png',
        'description': 'Tactical military olive green training set with Train Eat Sleep Repeat back graphic and relaxed utility cargo joggers.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Utility Cargo Fit'},
            {'label': 'Fabric', 'value': 'Durable Ripstop Cotton Blend'},
            {'label': 'Includes', 'value': '2-Piece Set (Grind Mode Tee + Cargo Joggers)'},
            {'label': 'Features', 'value': 'Deep Utility Pockets, Elastic Cuffs'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-everyday-set',
        'name': 'KALA Everyday Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-everyday-set.png',
        'description': 'Everyday athletic set in deep midnight navy with Better Than Yesterday typography and moisture-wicking tapered trackpants.',
        'highlights': [
            {'label': 'Fit', 'value': 'Streamlined Athletic Fit'},
            {'label': 'Fabric', 'value': 'Premium 230 GSM Combed Ringspun Cotton'},
            {'label': 'Includes', 'value': '2-Piece Set (Better Than Yesterday Tee + Pants)'},
            {'label': 'Color', 'value': 'Deep Midnight Navy'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-evolve-set',
        'name': 'KALA Evolve Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 499,
        'image': 'kala-evolve-set.png',
        'description': 'Warm desert sand beige gym set featuring Lift Grow Evolve barbell typography and matching relaxed athletic track shorts.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Summer Training'},
            {'label': 'Fabric', 'value': 'Bio-Washed French Terry'},
            {'label': 'Includes', 'value': '2-Piece Set (Lift Grow Evolve Tee + Track Shorts)'},
            {'label': 'Color', 'value': 'Warm Desert Sand Beige'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-no-limits-set',
        'name': 'KALA No Limits Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-no-limits-set.png',
        'description': 'Blackout performance gym set with bold crimson No Limits distressed text and white lightning slash graphic joggers.',
        'highlights': [
            {'label': 'Fit', 'value': 'Oversized Athletic Streetwear'},
            {'label': 'Fabric', 'value': '240 GSM Acid-Washed Cotton Blend'},
            {'label': 'Includes', 'value': '2-Piece Set (No Limits Tee + Slash Graphic Pants)'},
            {'label': 'Pattern', 'value': 'Distressed Red Stencil & White Lightning Slashes'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-wings-set',
        'name': 'KALA Wings Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-wings-set.png',
        'description': 'Angelic valkyrie feathered wing graphics spreading across shoulders and back on pure white performance tee with matching training pants.',
        'highlights': [
            {'label': 'Fit', 'value': 'Athletic Performance Fit'},
            {'label': 'Fabric', 'value': '4-Way Stretch Breathable Polyester Blend'},
            {'label': 'Includes', 'value': '2-Piece Set (Wings Back Tee + Training Pants)'},
            {'label': 'Pattern', 'value': 'Detailed Valkyrie Feathered Wings Artwork'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-relentless-set',
        'name': 'KALA Relentless Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-relentless-set.png',
        'description': 'Deep crimson maroon athletic set featuring Relentless Progress Over Excuses typography and black trackpants with ruby side panels.',
        'highlights': [
            {'label': 'Fit', 'value': 'Tapered Athletic Training'},
            {'label': 'Fabric', 'value': '240 GSM Heavy Cotton & Ribbed Poly'},
            {'label': 'Includes', 'value': '2-Piece Set (Relentless Tee + Side-Panel Pants)'},
            {'label': 'Color', 'value': 'Rich Vintage Crimson Maroon & Black'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-overthink-set',
        'name': 'KALA Overthink Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-overthink-set.png',
        'description': 'Edgy gothic gymwear set in pitch black with thorny barbed wire graphic framing Overthink lettering and matching graphic trackpants.',
        'highlights': [
            {'label': 'Fit', 'value': 'Boxy Drop-Shoulder & Graphic Joggers'},
            {'label': 'Fabric', 'value': '250 GSM Mineral Washed Cotton'},
            {'label': 'Includes', 'value': '2-Piece Set (Overthink Tee + Thorn Graphic Pants)'},
            {'label': 'Pattern', 'value': 'Gothic Barbed Wire & Thorny Branch Graphics'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-nature-set',
        'name': 'KALA Nature Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 499,
        'image': 'kala-nature-set.png',
        'description': 'Deep evergreen pine forest green training set with Nature Heals mountain peak graphics and functional cargo pockets.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Outdoor & Gym Utility'},
            {'label': 'Fabric', 'value': '230 GSM Heavy Cotton'},
            {'label': 'Includes', 'value': '2-Piece Set (Nature Heals Tee + Cargo Joggers)'},
            {'label': 'Color', 'value': 'Tactical Forest Olive Green'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-iron-mind-set',
        'name': 'KALA Iron Mind Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-iron-mind-set.png',
        'description': 'Futuristic mecha armor and cyborg exoskeleton graphic on pitch black cotton-poly blend with high-density tech joggers.',
        'highlights': [
            {'label': 'Fit', 'value': 'Performance Compression & Tech Joggers'},
            {'label': 'Fabric', 'value': 'Ergonomic Thermal Poly Blend'},
            {'label': 'Includes', 'value': '2-Piece Set (Mecha Exoskeleton Tee + Tech Pants)'},
            {'label': 'Features', 'value': 'Cyberpunk Robot Armor Graphic'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-good-mood-set',
        'name': 'KALA Good Mood Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 499,
        'image': 'kala-good-mood-set.png',
        'description': 'Vibrant indigo blue gym set with Good Muscles Good Mood barbell back stamp and ergonomic four-way stretch joggers.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Athletic Fit'},
            {'label': 'Fabric', 'value': 'Bio-Washed Combed Cotton'},
            {'label': 'Includes', 'value': '2-Piece Set (Good Mood Barbell Tee + Joggers)'},
            {'label': 'Color', 'value': 'Washed Denim Blue'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-zen-set',
        'name': 'KALA Zen Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-zen-set.png',
        'description': 'Traditional Japanese irezumi koi fish and sacred lotus flower graphics with Peace kanji (平和) on washed black athletic cotton.',
        'highlights': [
            {'label': 'Fit', 'value': 'Boxy Traditional Silhouette'},
            {'label': 'Fabric', 'value': '240 GSM Washed Cotton'},
            {'label': 'Includes', 'value': '2-Piece Set (Irezumi Koi Tee + Lotus Pants)'},
            {'label': 'Pattern', 'value': 'Japanese Koi Fish, Sacred Lotus & Peace Kanji (平和)'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-tech-set',
        'name': 'KALA Tech Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 499,
        'image': 'kala-tech-set.png',
        'description': 'Cyberpunk geometric paneling compression set with breathable side mesh zones in futuristic white and platinum grey.',
        'highlights': [
            {'label': 'Fit', 'value': 'Aerodynamic Compression Fit'},
            {'label': 'Fabric', 'value': 'Breathable Hexagonal Mesh & Elastane'},
            {'label': 'Includes', 'value': '2-Piece Set (Tech Compression Tee + Pants)'},
            {'label': 'Color', 'value': 'Platinum White & Tech Slate Grey'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-purpose-set',
        'name': 'KALA Purpose Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-purpose-set.png',
        'description': 'Intense crimson fire embers and Pain Progress Purpose motivational lettering on jet black athletic performance fabric.',
        'highlights': [
            {'label': 'Fit', 'value': 'Athletic Muscle Fit'},
            {'label': 'Fabric', 'value': '240 GSM Cotton-Poly Blend'},
            {'label': 'Includes', 'value': '2-Piece Set (Pain Progress Purpose Tee + Pants)'},
            {'label': 'Pattern', 'value': 'Crimson Fire Embers & Bold Typography'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-focus-set',
        'name': 'KALA Focus Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 499,
        'image': 'kala-focus-set.png',
        'description': 'Deep petrol teal blue gym set with Discipline Today Results Tomorrow typography and flexible moisture-wicking joggers.',
        'highlights': [
            {'label': 'Fit', 'value': 'Flexible Athletic Fit'},
            {'label': 'Fabric', 'value': '4-Way Stretch VaporLite Cotton'},
            {'label': 'Includes', 'value': '2-Piece Set (Discipline Today Tee + Joggers)'},
            {'label': 'Color', 'value': 'Deep Petrol Teal Blue'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-progress-set',
        'name': 'KALA Progress Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-progress-set.png',
        'description': 'Vintage ecru training set featuring Great Wave woodcut crest with crimson rising sun and Small Steps Big Changes philosophy.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Street & Gym Fit'},
            {'label': 'Fabric', 'value': '230 GSM French Terry Cotton'},
            {'label': 'Includes', 'value': '2-Piece Set (Wave Graphic Tee + Ecru Pants)'},
            {'label': 'Pattern', 'value': 'Great Wave Woodcut, Rising Sun & Small Steps Philosophy'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-chaos-set',
        'name': 'KALA Chaos Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 549,
        'image': 'kala-chaos-set.png',
        'description': 'Neon electric purple cyber butterfly with Chaos Breeds Growth typography and matching purple flame accent joggers.',
        'highlights': [
            {'label': 'Fit', 'value': 'Oversized Athletic Streetwear'},
            {'label': 'Fabric', 'value': '240 GSM Heavyweight Jet Black Cotton'},
            {'label': 'Includes', 'value': '2-Piece Set (Chaos Breeds Growth Tee + Flame Pants)'},
            {'label': 'Pattern', 'value': 'Neon Electric Violet Butterfly & Purple Flames'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'kala-repeat-set',
        'name': 'KALA Repeat Set',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 499,
        'image': 'kala-repeat-set.png',
        'description': 'Heather stone grey athletic gym set with Run Lift Improve Repeat chevron layout and performance trackpants.',
        'highlights': [
            {'label': 'Fit', 'value': 'Athletic Training Set'},
            {'label': 'Fabric', 'value': 'Heather Melange Breathable Cotton'},
            {'label': 'Includes', 'value': '2-Piece Set (Run Lift Repeat Tee + Joggers)'},
            {'label': 'Color', 'value': 'Athletic Heather Stone Grey'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    }
]

# 20 T-Shirts definition
tshirts = [
    {
        'id': 'keep-moving-forward-tshirt',
        'name': 'Keep Moving Forward T-Shirt',
        'badge': 'ANIME',
        'category': 'Streetwear',
        'price': 499,
        'image': 'keep-moving-forward-tshirt.png',
        'description': 'Rising sun crimson circle with stoic samurai silhouette, delicate sakura branches, and vertical Japanese kanji (進み続ける).',
        'highlights': [
            {'label': 'Fit', 'value': 'Oversized Streetwear Fit'},
            {'label': 'Fabric', 'value': '240 GSM 100% Cotton'},
            {'label': 'Color', 'value': 'Jet Black'},
            {'label': 'Pattern', 'value': 'Samurai & Rising Sun Screen Print'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'wander-more-tshirt',
        'name': 'Wander More T-Shirt',
        'badge': 'TRAVEL',
        'category': 'Streetwear',
        'price': 449,
        'image': 'wander-more-tshirt.png',
        'description': 'Fine-line woodcut alpine mountain peaks and pine ridge illustration with hand-drawn cursive lettering on vintage cream cotton.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Fit'},
            {'label': 'Fabric', 'value': '220 GSM 100% Combed Ringspun Cotton'},
            {'label': 'Color', 'value': 'Vintage Cream / Ecru'},
            {'label': 'Pattern', 'value': 'Alpine Peaks & Evergreen Forest Print'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'brooklyn-varsity-tshirt',
        'name': 'Brooklyn Varsity T-Shirt',
        'badge': 'STREETWEAR',
        'category': 'Streetwear',
        'price': 399,
        'image': 'brooklyn-varsity-tshirt.png',
        'description': 'Arched collegiate varsity lettering with athletic double outline and New York division text.',
        'highlights': [
            {'label': 'Fit', 'value': 'Boxy Athletic Streetwear'},
            {'label': 'Fabric', 'value': '230 GSM Heavy Cotton'},
            {'label': 'Color', 'value': 'Deep Forest Emerald Green'},
            {'label': 'Pattern', 'value': 'Arched Collegiate Varsity Screen Print'},
            {'label': 'Neck Type', 'value': 'Thick Ribbed Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'good-things-take-time-tshirt',
        'name': 'Good Things Take Time T-Shirt',
        'badge': 'MINIMAL',
        'category': 'Streetwear',
        'price': 399,
        'image': 'good-things-take-time-tshirt.png',
        'description': 'Minimalist typography centered on chest with subtle horizontal line accent for mindful streetwear.',
        'highlights': [
            {'label': 'Fit', 'value': 'Boxy Relaxed Fit'},
            {'label': 'Fabric', 'value': '220 GSM Compact Cotton'},
            {'label': 'Color', 'value': 'Rich Jet Black'},
            {'label': 'Pattern', 'value': 'Clean Minimalist Sans Typography'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'out-of-office-tshirt',
        'name': 'Out of Office T-Shirt',
        'badge': 'VIBE',
        'category': 'Streetwear',
        'price': 449,
        'image': 'out-of-office-tshirt.png',
        'description': 'Vintage 1970s classic sedan cruiser car with retro striped sunset oval and palm tree silhouettes.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Streetwear Fit'},
            {'label': 'Fabric', 'value': '240 GSM Pure Combed Cotton'},
            {'label': 'Color', 'value': 'Vintage Warm Ecru'},
            {'label': 'Pattern', 'value': '70s Classic Sedan & Retro Sunset Print'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'feel-everything-tshirt',
        'name': 'Feel Everything T-Shirt',
        'badge': 'ART',
        'category': 'Streetwear',
        'price': 449,
        'image': 'feel-everything-tshirt.png',
        'description': "Renaissance marble sculpture bust of Michelangelo's David with a bold red censor block over eyes.",
        'highlights': [
            {'label': 'Fit', 'value': 'Oversized Drop-Shoulder Fit'},
            {'label': 'Fabric', 'value': '250 GSM Mineral Acid-Washed Cotton'},
            {'label': 'Color', 'value': 'Mineral Washed Acid Charcoal'},
            {'label': 'Pattern', 'value': 'Chiaroscuro Sculpture & Red Censor Bar'},
            {'label': 'Neck Type', 'value': 'Heavy Crew Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'lost-in-the-right-direction-tshirt',
        'name': 'Lost in the Right Direction T-Shirt',
        'badge': 'TRAVEL',
        'category': 'Streetwear',
        'price': 449,
        'image': 'lost-in-the-right-direction-tshirt.png',
        'description': 'Framed ocean swell landscape photograph with clean editorial typography and geographic coordinates.',
        'highlights': [
            {'label': 'Fit', 'value': 'Boxy Structured Fit'},
            {'label': 'Fabric', 'value': '240 GSM Pure Combed Cotton'},
            {'label': 'Color', 'value': 'Heavyweight Crisp White'},
            {'label': 'Pattern', 'value': 'Framed Ocean Photo & Editorial Typography'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'anti-social-club-tshirt',
        'name': 'Anti Social Club T-Shirt',
        'badge': 'STREETWEAR',
        'category': 'Streetwear',
        'price': 449,
        'image': 'anti-social-club-tshirt.png',
        'description': 'Distressed stencil block lettering with a neon hot-pink dripping spray-paint smiley face.',
        'highlights': [
            {'label': 'Fit', 'value': 'Oversized Boxy Streetwear'},
            {'label': 'Fabric', 'value': '240 GSM Acid-Washed Cotton'},
            {'label': 'Color', 'value': 'Washed Acid Black'},
            {'label': 'Pattern', 'value': 'Distressed Typography & Dripping Pink Spray'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'moon-friend-tshirt',
        'name': 'Moon Friend T-Shirt',
        'badge': 'SPACE',
        'category': 'Gaming',
        'price': 449,
        'image': 'moon-friend-tshirt.png',
        'description': 'Cute spacesuit astronaut sitting on a cratered moon holding a glowing Earth balloon with twinkling stars.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Fit'},
            {'label': 'Fabric', 'value': '230 GSM Combed Ringspun Cotton'},
            {'label': 'Color', 'value': 'Warm Mocha Chocolate Brown'},
            {'label': 'Pattern', 'value': 'Astronaut On Moon & Earth Orb Graphic'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'evolve-tshirt',
        'name': 'Evolve T-Shirt',
        'badge': 'LIFESTYLE',
        'category': 'Gaming',
        'price': 399,
        'image': 'evolve-tshirt.png',
        'description': 'Hyper-vivid electric blue Morpho butterfly with a floating gold coronet crown and motivational subtitle.',
        'highlights': [
            {'label': 'Fit', 'value': 'Boxy Modern Fit'},
            {'label': 'Fabric', 'value': '240 GSM Premium Combed Cotton'},
            {'label': 'Color', 'value': 'Crisp Heavyweight White'},
            {'label': 'Pattern', 'value': 'Electric Morpho Butterfly & Gold Crown'},
            {'label': 'Neck Type', 'value': 'Thick Ribbed Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'beyond-reality-tshirt',
        'name': 'Beyond Reality T-Shirt',
        'badge': 'ANIME',
        'category': 'Gaming',
        'price': 449,
        'image': 'beyond-reality-tshirt.png',
        'description': 'Horizontal rectangular manga eye panel with intense piercing anime gaze, Japanese kanji and subtitle.',
        'highlights': [
            {'label': 'Fit', 'value': 'Oversized Anime Streetwear'},
            {'label': 'Fabric', 'value': '240 GSM Heavy Cotton'},
            {'label': 'Color', 'value': 'Deep Jet Black'},
            {'label': 'Pattern', 'value': 'Manga Eyes Panel & Japanese Kanji'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'create-your-own-reality-tshirt',
        'name': 'Create Your Own Reality T-Shirt',
        'badge': 'CREATIVE',
        'category': 'Gaming',
        'price': 449,
        'image': 'create-your-own-reality-tshirt.png',
        'description': 'Chunky 90s 3D puffy graffiti lettering in emerald green with deep extruded shadow and star accent.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Streetwear Fit'},
            {'label': 'Fabric', 'value': '230 GSM Combed Ringspun Cotton'},
            {'label': 'Color', 'value': 'Vanilla Cream'},
            {'label': 'Pattern', 'value': '3D Puffy Bubble Graffiti & Emerald Star'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'chaos-makes-better-stories-tshirt',
        'name': 'Chaos Makes Better Stories T-Shirt',
        'badge': 'STREETWEAR',
        'category': 'Gaming',
        'price': 449,
        'image': 'chaos-makes-better-stories-tshirt.png',
        'description': 'Gothic blackletter typography engulfed in vibrant electric purple/violet hot flames on pitch black cotton.',
        'highlights': [
            {'label': 'Fit', 'value': 'Oversized Boxy Fit'},
            {'label': 'Fabric', 'value': '240 GSM Heavy Cotton'},
            {'label': 'Color', 'value': 'Pitch Black'},
            {'label': 'Pattern', 'value': 'Gothic Blackletter & Neon Violet Flames'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'still-here-tshirt',
        'name': 'Still Here T-Shirt',
        'badge': 'ART',
        'category': 'Gaming',
        'price': 449,
        'image': 'still-here-tshirt.png',
        'description': 'Detailed anatomical woodcut engraving of a human ribcage with a vivid electric cyan butterfly on the clavicle.',
        'highlights': [
            {'label': 'Fit', 'value': 'Boxy Streetwear Silhouette'},
            {'label': 'Fabric', 'value': '240 GSM Combed Cotton'},
            {'label': 'Color', 'value': 'Deep Indigo Navy Blue'},
            {'label': 'Pattern', 'value': 'Anatomical Skeleton Engraving & Butterfly'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'discipline-builds-freedom-tshirt',
        'name': 'Discipline Builds Freedom T-Shirt',
        'badge': 'GYMWEAR',
        'category': 'Gymwear',
        'price': 399,
        'image': 'discipline-builds-freedom-tshirt.png',
        'description': 'Collegiate arched typography with heavy Olympic barbell and knurled iron plates for training consistency.',
        'highlights': [
            {'label': 'Fit', 'value': 'Heavy Athletic Pump Cover'},
            {'label': 'Fabric', 'value': '240 GSM Heavyweight French Terry Cotton'},
            {'label': 'Color', 'value': 'Dark Forest Pine Green'},
            {'label': 'Pattern', 'value': 'Collegiate Barbell & Iron Plates Print'},
            {'label': 'Neck Type', 'value': 'High Ribbed Collar'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'the-mountains-are-calling-tshirt',
        'name': 'The Mountains Are Calling T-Shirt',
        'badge': 'OUTDOOR',
        'category': 'Gymwear',
        'price': 449,
        'image': 'the-mountains-are-calling-tshirt.png',
        'description': 'Bold typography with snowy alpine mountain ridges and warm harvest moon circle in vintage denim blue.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Outdoor Fit'},
            {'label': 'Fabric', 'value': '230 GSM Vintage Washed Cotton'},
            {'label': 'Color', 'value': 'Washed Indigo Denim Blue'},
            {'label': 'Pattern', 'value': 'Alpine Peaks & Harvest Moon Screen Print'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'bloom-at-your-own-pace-tshirt',
        'name': 'Bloom at Your Own Pace T-Shirt',
        'badge': 'MINIMAL',
        'category': 'Gymwear',
        'price': 399,
        'image': 'bloom-at-your-own-pace-tshirt.png',
        'description': 'Delicate fine-line botanical illustration of tall sunflowers and daisies with refined serif typography.',
        'highlights': [
            {'label': 'Fit', 'value': 'Relaxed Mindful Fit'},
            {'label': 'Fabric', 'value': '220 GSM Bio-Washed Combed Cotton'},
            {'label': 'Color', 'value': 'Vintage Oatmeal Ecru Cream'},
            {'label': 'Pattern', 'value': 'Botanical Wildflowers & Editorial Serif'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'inner-peace-tshirt',
        'name': 'Inner Peace T-Shirt',
        'badge': 'MINIMAL',
        'category': 'Gymwear',
        'price': 399,
        'image': 'inner-peace-tshirt.png',
        'description': 'Woodcut linocut Great Wave circular crest with vertical Japanese kanji for Peace (平和).',
        'highlights': [
            {'label': 'Fit', 'value': 'Boxy Drop-Shoulder'},
            {'label': 'Fabric', 'value': '240 GSM Mineral Acid-Washed Cotton'},
            {'label': 'Color', 'value': 'Mineral Washed Dark Charcoal'},
            {'label': 'Pattern', 'value': 'Woodcut Tidal Wave & Peace Kanji Print'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'better-days-ahead-tshirt',
        'name': 'Better Days Ahead T-Shirt',
        'badge': 'MOTIVATIONAL',
        'category': 'Gymwear',
        'price': 399,
        'image': 'better-days-ahead-tshirt.png',
        'description': 'Expressive hand-lettered brush script typography with golden sparkle starbursts in rich vintage maroon.',
        'highlights': [
            {'label': 'Fit', 'value': 'Athletic Pump Cover'},
            {'label': 'Fabric', 'value': '240 GSM Heavyweight Cotton'},
            {'label': 'Color', 'value': 'Rich Vintage Maroon Burgundy'},
            {'label': 'Pattern', 'value': 'Hand-Lettered Brush Script & Starbursts'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    },
    {
        'id': 'nature-heals-tshirt',
        'name': 'Nature Heals T-Shirt',
        'badge': 'NATURE',
        'category': 'Gymwear',
        'price': 399,
        'image': 'nature-heals-tshirt.png',
        'description': 'Clean serif typography with a rectangular framed landscape print of misty evergreen pine forest and mountain ridges.',
        'highlights': [
            {'label': 'Fit', 'value': 'Oversized Athletic / Outdoor Fit'},
            {'label': 'Fabric', 'value': '240 GSM Heavyweight Cotton'},
            {'label': 'Color', 'value': 'Tactical Dark Military Olive Green'},
            {'label': 'Pattern', 'value': 'Framed Misty Pine Forest Landscape Print'},
            {'label': 'Neck Type', 'value': 'Round Neck'},
            {'label': 'Sizes', 'value': 'S, M, L, XL, XXL'},
        ]
    }
]

# Interleave the 20 T-Shirts and 20 Gymwear sets
interleaved = []
for i in range(20):
    interleaved.append(tshirts[i])
    interleaved.append(gymwear_sets[i])

print(f"Generated interleaved sequence of {len(interleaved)} products.")

def format_ts_product(p, is_client=True):
    img_val = f"getProductImage('{p['image']}')" if is_client else f"'{p['image']}'"
    lines = [
        "  {",
        f"    id: '{p['id']}',",
        f"    name: '{p['name']}',",
        f"    badge: '{p['badge']}',",
        f"    category: '{p['category']}',",
        f"    price: {p['price']},",
        f"    image: {img_val},",
        f"    description: {repr(p['description'])},",
        "    available: true,"
    ]
    if is_client and 'highlights' in p:
        lines.append("    highlights: [")
        for h in p['highlights']:
            lines.append(f"      {{ label: '{h['label']}', value: '{h['value']}' }},")
        lines.append("    ],")
    lines.append("  },")
    return "\n".join(lines)

# Read client products.ts
with open('client/src/data/products.ts', 'r', encoding='utf-8') as f:
    client_content = f.read()

# Locate where the original 20 products started (keep-moving-forward-tshirt)
split_token = "  {\n    id: 'keep-moving-forward-tshirt',"
parts = client_content.split(split_token)
if len(parts) == 2:
    prefix = parts[0]
    client_new_body = "\n".join(format_ts_product(p, is_client=True) for p in interleaved)
    new_client_content = prefix + client_new_body + "\n]\n"
    with open('client/src/data/products.ts', 'w', encoding='utf-8') as f:
        f.write(new_client_content)
    print("Updated client/src/data/products.ts successfully!")
else:
    print("ERROR: Could not find split_token in client/src/data/products.ts!")

# Read backend seed.ts
with open('backend/src/config/seed.ts', 'r', encoding='utf-8') as f:
    backend_content = f.read()

# Locate where the original 20 products started in backend
backend_split_token = "  // 8 New Original Streetwear Products\n  {\n    id: 'keep-moving-forward-tshirt',"
b_parts = backend_content.split(backend_split_token)
if len(b_parts) == 2:
    b_prefix = b_parts[0]
    # Find the end of SEED_PRODUCTS array (before syncProductPrices)
    # The array ends before /**\n * Synchronizes
    end_token = "\n]\n\n/**\n * Synchronizes"
    b_suffix_parts = b_parts[1].split(end_token)
    if len(b_suffix_parts) == 2:
        b_suffix = end_token + b_suffix_parts[1]
        backend_new_body = "  // 40 Interleaved Graphic Tees & Gymwear Sets\n" + "\n".join(format_ts_product(p, is_client=False) for p in interleaved)
        new_backend_content = b_prefix + backend_new_body + b_suffix
        with open('backend/src/config/seed.ts', 'w', encoding='utf-8') as f:
            f.write(new_backend_content)
        print("Updated backend/src/config/seed.ts successfully!")
    else:
        print("ERROR: Could not find end_token in backend/src/config/seed.ts!")
else:
    print("ERROR: Could not find backend_split_token in backend/src/config/seed.ts!")
