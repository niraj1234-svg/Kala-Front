import React from 'react';
import { IMAGES } from '../../constants/images';
import OptimizedImage from "../../components/hustle-hour/OptimizedImage";

const Campaign: React.FC = () => {
    return (
        <section id="campaign" className="bg-foreground py-32 px-9 relative overflow-hidden">
            {/* Background Texture/Accent */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row items-start justify-between mb-20 gap-10">
                    <div className="reveal">
                        <h2 className="font-display text-[clamp(60px,10vw,140px)] leading-[0.8] tracking-tighter uppercase mb-2">
                            Campaign
                        </h2>
                        <span className="font-serif italic text-accent text-3xl lowercase">twenty-six / anthology</span>
                    </div>

                    <div className="reveal lg:pt-8 max-w-[400px]">
                        <p className="font-light text-[16px] leading-[1.8] text-background/50">
                            Exploring the intersection of <strong className="text-accent italic font-serif">minimalism</strong> and <strong className="text-accent italic font-serif">luxury</strong>. Each piece in this anthology is a testament to the unobserved hour of hustle—where ambition meets absolute execution.
                        </p>
                    </div>
                </div>

                <div className="reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.4fr_1fr] lg:grid-rows-2 gap-4">
                    {IMAGES.campaign.map((img, i) => (
                        <div
                            key={i}
                            className={`relative overflow-hidden group cursor-pointer bg-neutral-900 transition-all duration-700 shadow-2xl ${i === 0 ? 'lg:row-span-2 aspect-[3/4]' : 'aspect-[4/3.2]'
                                }`}
                        >
                            <OptimizedImage
                                src={img}
                                alt={`Campaign ${i + 1}`}
                                className="w-full h-full object-cover grayscale-[40%] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-[1] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-all duration-500 z-[2] m-4" />

                            <div className="absolute bottom-0 left-0 right-0 p-8 z-[3] flex items-end justify-between translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex flex-col">
                                    <span className="font-body text-[9px] tracking-[0.4em] uppercase text-accent mb-2">Portfolio</span>
                                    <strong className="font-display text-2xl tracking-widest text-white uppercase">
                                        EDITORIAL
                                    </strong>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-500">
                                    <span className="text-white text-xs">→</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Campaign;
