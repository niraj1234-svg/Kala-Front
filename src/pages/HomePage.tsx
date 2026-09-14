import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shirt, Building2 } from 'lucide-react';
import WhatHappensNextSlider from '../components/WhatHappensNextSlider';
import BakeryCaseStudy from '../components/BakeryCaseStudy';
import { api, type Product } from '../lib/api';
import { KALA_PRODUCTS } from '../constants/products';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(() =>
    (KALA_PRODUCTS.filter(p => p.isFeatured).slice(0, 4) as unknown as Product[])
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.getProducts({ isFeatured: true });
        if (res && res.products && res.products.length > 0) {
          setFeaturedProducts(res.products.slice(0, 4));
        }
      } catch (err) {
        // Retain fallback from KALA_PRODUCTS
      } finally {
        setIsLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. HERO SECTION */}
      <section className="relative pt-36 sm:pt-44 pb-20 sm:pb-32 overflow-hidden border-b border-border">
        {/* Grain overlay */}
        <div className="hero-grain" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-kala-emerald/10 border border-kala-emerald/20 text-kala-emerald dark:text-emerald-400 text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CUSTOM APPAREL &amp; BRANDING</span>
            </motion.div>

            {/* Core Message Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-foreground leading-[0.95]"
            >
              YOUR IDEA. <br />
              YOUR BRAND. <br />
              <span className="text-kala-emerald dark:text-emerald-400">YOUR IDENTITY.</span>
            </motion.h1>

            {/* Supporting Line */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-serif text-xl sm:text-2xl md:text-3xl italic text-foreground/80 font-normal"
            >
              "Designed. Printed. Made for you."
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-sm sm:text-base text-mid max-w-2xl mx-auto leading-relaxed"
            >
              High-grade custom apparel, merchandise, and packaging — with zero minimum orders.
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/custom-apparel"
                className="w-full sm:w-auto px-8 py-4 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
              >
                <span>Start Custom Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-card border border-border hover:border-foreground/40 text-foreground rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. TWO LARGE PRIMARY PATHWAYS */}
      <section className="py-20 sm:py-28 bg-card/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-kala-earth dark:text-kala-accent block mb-2">
              CHOOSE YOUR DIRECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase text-foreground">
              From a single T-shirt to an entire brand identity.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* CARD 1: CUSTOM APPAREL */}
            <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between group hover:border-kala-emerald transition-all duration-300 shadow-md hover:shadow-xl">
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-kala-emerald/10 text-kala-emerald dark:text-emerald-400 flex items-center justify-center">
                  <Shirt className="w-7 h-7" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-mid font-semibold block">
                  01 &bull; APPAREL
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-black text-foreground uppercase">
                  CUSTOM APPAREL
                </h3>
                <p className="font-serif text-lg italic text-mid">
                  "For individuals, clubs & teams."
                </p>
                <p className="text-xs sm:text-sm text-mid leading-relaxed pt-2">
                  Streetwear tees, esports jerseys, gym sets, and hoodies crafted to order with no minimums.
                </p>
              </div>

              <div className="pt-10 relative z-10">
                <Link
                  to="/custom-apparel"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-kala-emerald text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-kala-emerald/90 transition-transform group-hover:translate-x-1"
                >
                  <span>Explore Apparel</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Decorative background image preview */}
              <div className="absolute right-0 bottom-0 w-1/2 h-2/3 opacity-15 pointer-events-none transition-transform group-hover:scale-105 duration-500">
                <img
                  src="/images/Streetwear 01.png"
                  alt="Apparel Preview"
                  className="w-full h-full object-contain object-bottom"
                />
              </div>
            </div>

            {/* CARD 2: BUSINESS BRANDING */}
            <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between group hover:border-[#8a4f35] transition-all duration-300 shadow-md hover:shadow-xl">
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#8a4f35]/10 text-[#8a4f35] dark:text-[#d28c6e] flex items-center justify-center">
                  <Building2 className="w-7 h-7" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-mid font-semibold block">
                  02 &bull; BRANDING
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-black text-foreground uppercase">
                  BUSINESS BRANDING
                </h3>
                <p className="font-serif text-lg italic text-mid">
                  "For local shops & emerging brands."
                </p>
                <p className="text-xs sm:text-sm text-mid leading-relaxed pt-2">
                  Kraft carry bags, packaging, stickers, and staff polos designed to elevate your brand presence.
                </p>
              </div>

              <div className="pt-10 relative z-10">
                <Link
                  to="/business-branding"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#8a4f35] hover:bg-[#723f2a] text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-transform group-hover:translate-x-1"
                >
                  <span>Build Your Brand</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Decorative background image preview */}
              <div className="absolute right-0 bottom-0 w-1/2 h-2/3 opacity-15 pointer-events-none transition-transform group-hover:scale-105 duration-500">
                <img
                  src="/images/bakery-house-concept.jpg"
                  alt="Branding Preview"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LARGE PREMIUM VISUAL SHOWCASE */}
      <section className="py-20 sm:py-28 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400 block mb-2">
                STUDIO ARCHIVE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase text-foreground">
                Crafted In The KALA Studio
              </h2>
              <p className="text-sm text-mid mt-2 max-w-xl">
                Premium apparel and merchandise produced for creators, teams, and brands.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-kala-emerald dark:text-emerald-400 hover:underline"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4-Item Visual Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-3/4 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
              ))
            ) : (
              featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#faf8f5] dark:bg-[#1c1a17] p-6 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-[#1c1a17] text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                        {product.badge}
                      </span>
                    )}
                    {product.isSoldOut && (
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                        SOLD OUT
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-mid uppercase mb-1">
                        <span>{product.subCategory}</span>
                        <span>{product.designCategory || 'Custom'}</span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-foreground group-hover:text-kala-emerald transition-colors line-clamp-2">
                        {product.name}
                      </h4>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-foreground">₹{product.price}</span>
                        {product.salePrice && (
                          <span className="text-xs text-mid line-through">₹{product.salePrice}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-kala-emerald dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. WHAT HAPPENS NEXT? INTERACTIVE SLIDER */}
      <WhatHappensNextSlider />

      {/* 5. BRAND CONCEPT - THE BAKERY HOUSE CASE STUDY */}
      <BakeryCaseStudy />

      {/* 6. BOTTOM CALLOUT / GOOGLE FORM CTA */}
      <section className="py-20 sm:py-28 bg-[#853816] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#f2a883] block">
            ON-DEMAND STUDIO
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-tight">
            Have an idea? <br />
            Let's bring it to life.
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
            Zero minimums. From 1 custom tee to full corporate packaging.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/custom-apparel"
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#853816] hover:bg-amber-50 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <span>Start Custom Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/book-meeting"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <span>Book Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
