import React from 'react';
import { useClock } from '../../hooks/useClock';
import { IMAGES } from '../../constants/images';
import OptimizedImage from '../../components/hustle-hour/OptimizedImage';

const Chronicle: React.FC = () => {
    const { hours, minutes, seconds } = useClock();

    return (
        <section id="chronicle" className="bg-background py-32 px-9 border-t border-black/5">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-20">
                {/* LEFT: text */}
                <div className="reveal flex flex-col justify-center items-start text-left">
                    <p className="font-body text-[10px] tracking-[0.5em] uppercase text-mid mb-8">
                        The Chronicle / 4.10
                    </p>
                    <h2 className="font-display text-[clamp(50px,8vw,100px)] leading-[0.85] tracking-tight text-foreground mb-12 uppercase">
                        CHRONICLE<br />
                        <span className="text-accent italic font-serif lowercase tracking-normal">of the</span><br />
                        HUSTLE
                    </h2>
                    <div className="flex flex-col gap-6 border-l-2 border-accent/30 pl-8 ml-2">
                        <strong className="font-display text-2xl tracking-[0.1em] uppercase">Jung Wook Jun</strong>
                        <p className="font-light text-[15px] text-foreground/60 leading-[1.8] max-w-[400px]">
                            Brilliance is often found in the unobserved hour. Our philosophy defines the ingenious moment where calculation meets intuition, creating a legacy of ambition redefined.
                        </p>
                    </div>
                </div>

                {/* RIGHT: Grid Layout */}
                <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Banner Illustration */}
                    <div className="relative aspect-[4/5] overflow-hidden group shadow-xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-accent z-[2]" />
                        <OptimizedImage
                            src={IMAGES.chronicle.banner}
                            alt="Chronicle Banner"
                            className="absolute inset-0 w-full h-full object-cover grayscale-[20%] transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-[1]" />
                        <div className="absolute bottom-8 left-8 z-[2]">
                            <span className="font-body text-[9px] tracking-[0.4em] uppercase text-accent mb-3 block">Perspective</span>
                            <p className="font-display text-4xl tracking-tight text-white leading-none uppercase">
                                Ambition<br />Meets<br />Execution
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-10">
                        {/* Clock Component */}
                        <div className="flex flex-col items-center justify-center bg-cream aspect-square p-10 shadow-lg relative group overflow-hidden">
                            <div className="absolute inset-0 hero-grain opacity-10 grain-animate" />
                            <div className="w-[180px] h-[180px] rounded-full border border-foreground/10 relative bg-white shadow-2xl flex items-center justify-center">
                                {/* Clock Center */}
                                <div className="absolute w-2 h-2 bg-foreground rounded-full z-10 shadow-sm" />

                                <div className="absolute top-6 font-display text-[12px] tracking-[0.2em] text-foreground/30">XII</div>
                                <div className="absolute bottom-6 font-display text-[14px] tracking-[0.3em] text-accent">4.10</div>

                                {/* Hands */}
                                <div
                                    className="absolute bottom-1/2 left-1/2 w-[3px] h-12 bg-foreground origin-bottom -translate-x-1/2 rounded-full transition-transform duration-500 ease-out"
                                    style={{ transform: `translateX(-50%) rotate(${hours}deg)` }}
                                />
                                <div
                                    className="absolute bottom-1/2 left-1/2 w-[2px] h-16 bg-foreground/60 origin-bottom -translate-x-1/2 rounded-full transition-transform duration-500 ease-out"
                                    style={{ transform: `translateX(-50%) rotate(${minutes}deg)` }}
                                />
                                <div
                                    className="absolute bottom-1/2 left-1/2 w-[1px] h-[72px] bg-accent origin-bottom -translate-x-1/2"
                                    style={{ transform: `translateX(-50%) rotate(${seconds}deg)` }}
                                />
                            </div>
                            <span className="font-display text-3xl tracking-[0.3em] uppercase mt-8 text-foreground/40 group-hover:text-foreground transition-colors duration-500">Hustle</span>
                        </div>

                        {/* Portrait */}
                        <div className="relative aspect-square overflow-hidden group shadow-lg">
                            <OptimizedImage
                                src={IMAGES.chronicle.portrait}
                                alt="Portrait"
                                className="w-full h-full object-cover grayscale-[30%] transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-6 left-6 z-[2]">
                                <span className="font-body text-[9px] tracking-[0.4em] uppercase text-accent">Editorial</span>
                                <p className="font-display text-xl tracking-[0.1em] text-white mt-1 uppercase">The Architect</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Chronicle;
