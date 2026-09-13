import React from 'react';
import { ArrowRight, CheckCircle, Sparkles, ShoppingBag, Shirt, Package, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BakeryCaseStudy: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-kala-earth dark:text-kala-accent block mb-3">
            CASE STUDY
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-[1.05]">
            From a local shop &rarr; to a recognizable brand
          </h2>
          <p className="font-body text-sm sm:text-base text-mid mt-3">
            A unified visual system across packaging, staff wear, and print collateral.
          </p>
        </div>

        {/* Case Study Card */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
          {/* Header Banner */}
          <div className="bg-[#1c1a17] text-white px-6 sm:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-mono tracking-widest uppercase text-amber-200">
                CASE STUDY
              </span>
              <span className="text-white/40">&bull;</span>
              <span className="font-serif text-sm font-bold tracking-wider text-white">
                BRAND CONCEPT — THE BAKERY HOUSE
              </span>
            </div>
            <span className="text-[11px] font-mono text-mid tracking-wider">
              [Concept Exploration by KALA]
            </span>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Visual Mockup */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-border shadow-md group">
                  <img
                    src="/images/bakery-house-concept.jpg"
                    alt="Brand Concept - The Bakery House by KALA"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-full">
                    KALA Concept Mockup
                  </div>
                </div>

                {/* Sub-grid of deliverables */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Branded Carry Bag', icon: ShoppingBag, detail: '180 GSM Kraft Paper' },
                    { label: 'Staff T-Shirt', icon: Shirt, detail: 'Embroidered Heavy Cotton' },
                    { label: 'Pastry Packaging', icon: Package, detail: 'Food-Grade Box + String' },
                    { label: 'Visual Identity', icon: Layers, detail: 'Typography & Guidelines' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-background/80 border border-border rounded-xl p-3 text-center">
                      <item.icon className="w-4 h-4 mx-auto text-kala-emerald dark:text-emerald-400 mb-1" />
                      <p className="text-xs font-bold text-foreground">{item.label}</p>
                      <p className="text-[10px] text-mid mt-0.5">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Three-Stage Evolution */}
              <div className="lg:col-span-5 space-y-6">
                {/* Stage 1: Before */}
                <div className="border-l-2 border-red-400/80 pl-5 py-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold block mb-1">
                    STAGE 01 &bull; BEFORE
                  </span>
                  <h4 className="font-serif text-lg font-bold text-foreground mb-1.5">
                    Before: Generic Storefront
                  </h4>
                  <p className="text-xs text-mid leading-relaxed">
                    Unmarked plastic bags, mismatched staff clothing, and generic takeaway packaging.
                  </p>
                </div>

                {/* Stage 2: KALA Concept */}
                <div className="border-l-2 border-kala-emerald pl-5 py-1 bg-kala-emerald/5 -ml-2 p-3 rounded-r-xl">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-kala-emerald dark:text-emerald-400 font-bold block mb-1">
                    STAGE 02 &bull; KALA CONCEPT
                  </span>
                  <h4 className="font-serif text-lg font-bold text-foreground mb-1.5">
                    KALA Brand System
                  </h4>
                  <ul className="text-xs text-foreground/85 space-y-1.5 leading-relaxed">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-kala-emerald shrink-0" />
                      <span>Artisanal kraft carry bags with wheat insignia</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-kala-emerald shrink-0" />
                      <span>Heavyweight staff uniform tees</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-kala-emerald shrink-0" />
                      <span>Branded pastry boxes &amp; gift tags</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-kala-emerald shrink-0" />
                      <span>Cohesive menus, seals &amp; stickers</span>
                    </li>
                  </ul>
                </div>

                {/* Stage 3: After */}
                <div className="border-l-2 border-emerald-500 pl-5 py-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                    STAGE 03 &bull; AFTER
                  </span>
                  <h4 className="font-serif text-lg font-bold text-foreground mb-1.5">
                    After: Recognizable Brand
                  </h4>
                  <p className="text-xs text-mid leading-relaxed">
                    A memorable customer experience with elevated perceived value and repeat neighborhood orders.
                  </p>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <Link
                    to="/business-branding"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-kala-emerald text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-md hover:bg-kala-emerald/90 transition-transform hover:-translate-y-0.5"
                  >
                    <span>Build Your Brand</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BakeryCaseStudy;
