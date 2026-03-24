import React, { useState } from 'react';
import { IMAGES } from '../../constants/images';
import OptimizedImage from "../../components/hustle-hour/OptimizedImage";

const Collections: React.FC = () => {
    const [activeItem, setActiveItem] = useState<number | null>(null);

    return (
        <section id="collections" className="bg-background py-32 px-9 relative">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-6">
                    <div className="reveal">
                        <h2 className="font-display text-[clamp(40px,5vw,72px)] tracking-tight uppercase mb-2">
                            Curated <span className="text-accent italic font-serif lowercase tracking-normal">Collections</span>
                        </h2>
                    </div>
                    <div className="reveal hidden md:flex gap-12 border-l border-black/5 pl-12">
                        <div className="flex flex-col gap-1">
                            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-mid">Season</span>
                            <span className="font-display text-sm tracking-[0.1em]">FW26 / 4.10</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-mid">Scope</span>
                            <span className="font-display text-sm tracking-[0.1em]">Tech Editorial</span>
                        </div>
                    </div>
                </div>

                <div className="reveal relative">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-10">
                        {IMAGES.collections.map((img, i) => (
                            <div
                                key={i}
                                className={`flex-none h-[540px] relative overflow-hidden cursor-pointer transition-all duration-700 ease-in-out group shadow-xl ${activeItem === i ? 'w-[450px]' : 'w-[280px]'
                                    }`}
                                onMouseEnter={() => setActiveItem(i)}
                                onMouseLeave={() => setActiveItem(null)}
                            >
                                <OptimizedImage
                                    src={img}
                                    alt={`Collection ${i + 1}`}
                                    className={`w-full h-full object-cover transition-all duration-1000 ${activeItem === i ? 'scale-105 grayscale-0' : 'grayscale-[40%] opacity-80'
                                        }`}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                                <span className="absolute top-6 right-6 font-display text-[84px] text-white/5 leading-none pointer-events-none transition-all duration-500 group-hover:text-white/10 group-hover:scale-110">
                                    {String(i + 1).padStart(2, '0')}
                                </span>

                                <div className={`absolute bottom-8 left-8 right-8 transition-all duration-500 ${activeItem === i ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                    }`}>
                                    <span className="font-body text-[9px] tracking-[0.4em] uppercase text-accent mb-2 block">Premium Line</span>
                                    <h3 className="font-display text-3xl tracking-wide text-white mb-4 uppercase">Urban Anthology</h3>
                                    <span className="inline-block border-b border-white/40 pb-1 font-body text-[10px] tracking-[0.3em] uppercase text-white/80 hover:text-white hover:border-white transition-all">
                                        View Lookbook
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="reveal flex gap-6 mt-4 items-center justify-center">
                    <button className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center transition-all hover:bg-foreground hover:text-background hover:border-foreground group">
                        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    </button>
                    <div className="h-[1px] w-24 bg-black/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-accent w-1/3 animate-[marquee_5s_linear_infinite]" />
                    </div>
                    <button className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center transition-all hover:bg-foreground hover:text-background hover:border-foreground group">
                        <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Collections;
