import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const Chronicle: React.FC = () => {
    return (
        <section 
            id="chronicle" 
            className="relative w-full bg-background py-24 md:py-28 overflow-hidden select-none"
        >
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 z-[1] hero-grain opacity-[0.08] pointer-events-none" />

            {/* Layout Wrapper: Spans and centers with precise spacing */}
            <div className="relative w-full max-w-[1550px] mx-auto z-10 px-6 md:px-16 lg:px-24 xl:px-32 flex flex-col items-center">
                
                {/* Horizontal Left-Right Margin Sidebars (Desktop only) */}
                
                {/* Left Margin Sidebar */}
                <div className="absolute left-6 lg:left-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-start gap-40 z-20">
                    {/* shop now hollow rectangle button */}
                    <Link 
                        to="/products"
                        className="border border-foreground/45 text-foreground py-2.5 px-6 font-body text-[9.5px] tracking-[0.25em] hover:bg-foreground hover:text-background transition-all duration-300 font-extrabold uppercase whitespace-nowrap rounded-[1px] shadow-sm"
                    >
                        Shop Now
                    </Link>
                    {/* vertical bottom label */}
                    <div className="font-body text-[9.5px] tracking-[0.45em] font-black uppercase -rotate-90 origin-left text-foreground/40 select-none whitespace-nowrap pl-4 pt-12">
                        Streetwear
                    </div>
                </div>

                {/* Right Margin Sidebar (CORNER Text stack) */}
                <div className="absolute right-6 lg:right-10 top-[40%] -translate-y-1/2 hidden xl:flex flex-col items-center justify-center font-serif font-black italic text-[60px] lg:text-[76px] xl:text-[88px] text-foreground tracking-[0.1em] leading-[0.95] uppercase z-10 select-none pl-6 border-l border-foreground/5">
                    <span>C</span>
                    <span>O</span>
                    <span>R</span>
                    <span>N</span>
                    <span>E</span>
                    <span>R</span>
                </div>

                {/* Micro Right-Side Arrow */}
                <div className="absolute right-[8%] top-[55%] -translate-y-1/2 hidden xl:flex text-foreground/40 hover:text-foreground text-2xl transition-all cursor-pointer hover:translate-x-1.5 duration-300 z-20">
                    →
                </div>

                {/* 1. Large Top Styled Title: "SPRING IS AROUND THE" */}
                <div className="w-full text-center mb-10 select-none">
                    <h2 className="font-serif font-black italic tracking-normal uppercase text-foreground leading-[1.05] text-[34px] md:text-[54px] lg:text-[76px] xl:text-[88px]">
                        Spring is around the
                    </h2>
                </div>

                {/* 2. Spaced Out Category Navigation Tabs */}
                <div className="flex gap-8 md:gap-12 justify-center mb-14 select-none border-b border-foreground/5 pb-4 w-full max-w-[650px] mx-auto font-body text-[10px] tracking-[0.2em] font-extrabold text-foreground/45">
                    {['CLOTHING', 'BAGS', 'SHOES', 'ACCESSORIES'].map((tab, idx) => (
                        <span 
                            key={tab} 
                            className={`cursor-pointer transition-all duration-300 uppercase pb-1.5 ${
                                idx === 0 
                                    ? 'text-foreground border-b-2 border-foreground' 
                                    : 'hover:text-foreground/80'
                            }`}
                        >
                            {tab}
                        </span>
                    ))}
                </div>

                {/* 3. Three Columns Fashion Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 xl:gap-12 w-full max-w-[1080px] mx-auto z-10 relative">
                    
                    {/* Card 1: STRATEAS CARLUCCI */}
                    <div className="flex flex-col items-center group cursor-pointer">
                        <div className="relative aspect-[3/4.4] w-full overflow-hidden bg-transparent rounded-[1px]">
                            <img 
                                src="/corner/corner1.png" 
                                alt="STRATEAS CARLUCCI Surgical Coat" 
                                className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                            />
                        </div>
                        <span className="font-body text-[11.5px] font-bold tracking-[0.18em] text-foreground uppercase mt-5 text-center transition-colors group-hover:text-accent duration-300">
                            Strateas Carlucci
                        </span>
                        <span className="font-body text-[10px] text-foreground/50 tracking-wide mt-1.5 text-center">
                            Plated Surgical Coat
                        </span>
                        <span className="font-body text-[10px] text-foreground/35 line-through mt-2 text-center">
                            $1,200.00
                        </span>
                        <span className="font-body text-[11.5px] font-extrabold text-foreground tracking-wider mt-0.5 text-center">
                            $899.00
                        </span>
                    </div>

                    {/* Card 2: SYSTEM HOMME */}
                    <div className="flex flex-col items-center group cursor-pointer">
                        <div className="relative aspect-[3/4.4] w-full overflow-hidden bg-transparent rounded-[1px]">
                            <img 
                                src="/corner/corner2.png" 
                                alt="SYSTEM HOMME Cropped Coat" 
                                className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                            />
                        </div>
                        <span className="font-body text-[11.5px] font-bold tracking-[0.18em] text-foreground uppercase mt-5 text-center transition-colors group-hover:text-accent duration-300">
                            System Homme
                        </span>
                        <span className="font-body text-[10px] text-foreground/50 tracking-wide mt-1.5 text-center">
                            Cropped Coat
                        </span>
                        <span className="font-body text-[10px] text-foreground/35 line-through mt-2 text-center">
                            $920.00
                        </span>
                        <span className="font-body text-[11.5px] font-extrabold text-foreground tracking-wider mt-0.5 text-center">
                            $649.00
                        </span>
                    </div>

                    {/* Card 3: GRAVER */}
                    <div className="flex flex-col items-center group cursor-pointer">
                        <div className="relative aspect-[3/4.4] w-full overflow-hidden bg-transparent rounded-[1px]">
                            <img 
                                src="/corner/corner3.png" 
                                alt="GRAVER Gray Coat Spring" 
                                className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                            />
                        </div>
                        <span className="font-body text-[11.5px] font-bold tracking-[0.18em] text-foreground uppercase mt-5 text-center transition-colors group-hover:text-accent duration-300">
                            Graver
                        </span>
                        <span className="font-body text-[10px] text-foreground/50 tracking-wide mt-1.5 text-center">
                            Gray Coat Spring
                        </span>
                        <span className="font-body text-[10px] text-foreground/35 line-through mt-2 text-center">
                            $680.00
                        </span>
                        <span className="font-body text-[11.5px] font-extrabold text-foreground tracking-wider mt-0.5 text-center">
                            $499.00
                        </span>
                    </div>
                </div>

                {/* 4. Bottom Right Search / Sparkle Circular Badge */}
                <div className="absolute right-6 lg:right-10 bottom-6 w-11 h-11 rounded-full border border-foreground/10 flex items-center justify-center cursor-pointer hover:bg-foreground hover:text-background transition-all duration-500 shadow-sm bg-cream/30 z-20 group">
                    <Search className="w-3.5 h-3.5 text-foreground group-hover:text-background transition-colors" />
                    <span className="absolute -top-0.5 -right-0.5 bg-accent text-[#f5f3ef] text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center scale-90">✦</span>
                </div>

            </div>
        </section>
    );
};

export default Chronicle;
