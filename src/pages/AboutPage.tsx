import React from 'react';
import { Sparkles, Shirt, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-kala-emerald/10 border border-kala-emerald/20 text-kala-emerald dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ABOUT KALA</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-foreground leading-[1]">
            More than printing.
          </h1>

          <p className="font-serif text-2xl sm:text-3xl italic text-foreground/80 font-normal">
            "Turning ideas into things people can see, wear and remember."
          </p>

          <p className="text-sm sm:text-base text-mid leading-relaxed max-w-2xl mx-auto pt-2">
            We combine design, high-grade printing, and production to turn creative ideas into physical products — with no minimum order barriers.
          </p>
        </div>

        {/* Philosophy & Two Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-kala-emerald/10 text-kala-emerald dark:text-emerald-400 flex items-center justify-center">
              <Shirt className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold uppercase text-foreground">
              Custom Apparel for People & Teams
            </h3>
            <p className="text-xs sm:text-sm text-mid leading-relaxed">
              High-GSM streetwear, team jerseys, and activewear engineered to order from a single piece.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#8a4f35]/10 text-[#8a4f35] dark:text-[#d28c6e] flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold uppercase text-foreground">
              Branding for Growing Businesses
            </h3>
            <p className="text-xs sm:text-sm text-mid leading-relaxed">
              Custom carry bags, staff uniforms, and packaging systems that elevate local shops into memorable brands.
            </p>
          </div>
        </div>

        {/* WHY KALA (Rule 58) */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400">
              OUR PILLARS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold uppercase text-foreground">
              Why KALA
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="font-mono text-sm font-bold text-kala-emerald">01</div>
              <h4 className="font-serif text-lg font-bold text-foreground">Designed around you</h4>
              <p className="text-xs text-mid leading-relaxed">
                Tailored to your aesthetic, brand voice, and specifications.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-sm font-bold text-kala-emerald">02</div>
              <h4 className="font-serif text-lg font-bold text-foreground">Flexible ordering</h4>
              <p className="text-xs text-mid leading-relaxed">
                Order single pieces or bulk with zero minimum barriers.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-sm font-bold text-kala-emerald">03</div>
              <h4 className="font-serif text-lg font-bold text-foreground">Idea to product</h4>
              <p className="text-xs text-mid leading-relaxed">
                Design, material sourcing, and printing in one unified studio.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-sm font-bold text-kala-emerald">04</div>
              <h4 className="font-serif text-lg font-bold text-foreground">Individuals &amp; businesses</h4>
              <p className="text-xs text-mid leading-relaxed">
                From personal streetwear to complete commercial merchandise lines.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="text-center bg-[#853816] text-white rounded-3xl p-10 sm:p-16 space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl font-black uppercase text-white">
            Start Your KALA Project Today
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed">
            Have a concept in mind? Let's discuss fabrics, prints, and turnaround times.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/custom-apparel"
              className="px-8 py-3.5 bg-white text-[#853816] hover:bg-amber-50 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2"
            >
              <span>Create Custom Apparel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/book-meeting"
              className="px-8 py-3.5 border border-white/20 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <span>Book Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
