import React from 'react';
import { IMAGES } from '../../constants/images';
import OptimizedImage from "../../components/hustle-hour/OptimizedImage";

const Hero: React.FC = () => {
    return (
        <section id="hero" className="relative h-screen w-full overflow-hidden bg-foreground">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <OptimizedImage
                    src={IMAGES.hero}
                    alt="The Hustle Hour Hero"
                    className="h-full w-full object-cover animate-hzoom"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 hero-grain opacity-20" />
            </div>

            {/* Fashion figure silhouettes */}
            <div className="absolute bottom-0 right-0 z-10 hidden w-1/2 justify-end lg:flex items-center">
                {IMAGES.figures.map((fig, i) => (
                    <OptimizedImage
                        key={i}
                        src={fig}
                        alt={`Figure ${i + 1}`}
                        className={`mx-[-80px] h-[80vh] w-auto animate-figureRise opacity-0 will-change-transform grayscale group transition-all duration-1000 delay-[${i * 200}ms]`}
                        style={{ animationDelay: `${(i + 4) * 150}ms` }}
                        priority
                    />
                ))}
            </div>

            {/* Hero copy */}
            <div className="relative z-10 px-9 pb-[8vh] w-full flex flex-col justify-end min-h-screen">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="max-w-[600px] animate-heroSlide delay-300">
                        <h1 className="font-display text-[clamp(60px,15vw,160px)] leading-[0.85] tracking-[-0.03em] text-white">
                            4.10<br />
                            <span className="text-accent italic font-serif lowercase tracking-normal">redefining</span><br />
                            AMBITION
                        </h1>
                    </div>

                    <div className="text-left md:text-right max-w-[280px] animate-heroSlide delay-700 md:pb-4">
                        <p className="font-body text-[10px] tracking-[0.4em] uppercase text-accent/80 mb-3">
                            The Unexplored Hour
                        </p>
                        <h3 className="font-display text-[22px] tracking-[0.1em] text-white/90 uppercase leading-tight">
                            RECLAIM THE MOMENT OF EXECUTION
                        </h3>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-8 animate-heroSlide delay-900">
                    <a
                        href="#chronicle"
                        className="link-underline font-body text-[11px] tracking-[0.25em] uppercase text-white/70 hover:text-white transition-all duration-300"
                    >
                        Learn More →
                    </a>
                    <div className="hidden md:flex gap-8">
                        <span className="font-body text-[9px] tracking-[0.3em] uppercase text-white/40">Est. 2026</span>
                        <span className="font-body text-[9px] tracking-[0.3em] uppercase text-white/40">Vancouver / Studio</span>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default Hero;
