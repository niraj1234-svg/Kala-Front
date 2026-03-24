import React from 'react';
import { IMAGES } from '../../constants/images';
import OptimizedImage from '../../components/hustle-hour/OptimizedImage';

const BrandStory: React.FC = () => {
    return (
        <section id="brand-story" className="bg-cream py-32 px-9 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div className="reveal">
                    <p className="font-body text-[10px] tracking-[0.5em] uppercase text-mid mb-8 italic">Our Philosophy</p>
                    <h2 className="font-display text-[clamp(44px,6vw,80px)] leading-[0.9] mb-10 uppercase tracking-tighter">
                        Designed <br />
                        <span className="text-accent italic font-serif lowercase tracking-normal">for the</span> <br />
                        Ingenious Hour
                    </h2>
                    <p className="font-light text-[17px] leading-[1.9] text-foreground/60 max-w-[460px] mb-12">
                        We believe that brilliance often occurs in the quiet, unexpected moments. Our collections are crafted for those who value both style and substance, blending traditional techniques with modern aesthetics. Every piece is an ode to the unobserved hour of hustle.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-[1px] bg-accent/40" />
                        <span className="font-body text-[9px] tracking-[0.3em] uppercase text-mid">Est. 2026 / Vancouver</span>
                    </div>
                </div>

                <div className="reveal relative">
                    <div className="relative z-10 w-full aspect-square rounded-full overflow-hidden border-[15px] border-white shadow-2xl group">
                        <OptimizedImage
                            src={IMAGES.collections[0]}
                            alt="The Philosophy"
                            className="w-full h-full object-cover grayscale-[10%] transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-2 whitespace-nowrap font-light text-[11px] tracking-[0.2em] shadow-xl border border-white/20 uppercase">
                            The Hustle Hour © 2026
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandStory;
