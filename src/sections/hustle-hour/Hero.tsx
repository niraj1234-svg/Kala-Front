import React, { useState, useEffect } from 'react';

interface ColumnItem {
    id: number;
    bg: string;
    textColor: string;
    name: string;
    code: string;
    model: string;
    brand: string;
    letters: {
        top: string;
        mid: string;
        bot: string;
    };
}

// Corrected mapping: Mapping the actual model cutout assets to their correct Pantone columns
const COLUMNS: ColumnItem[] = [
    {
        id: 1,
        bg: '#efe8de', // EGRET (Cream)
        textColor: '#888279',
        name: 'EGRET',
        code: '11-0103 TCX',
        model: '/hero/hero5.png', // Cream Jacket Model (previously hero5)
        brand: 'EGONlab',
        letters: { top: '', mid: '', bot: '' }
    },
    {
        id: 2,
        bg: '#5d6b54', // OLIVINE (Green)
        textColor: '#dce5d6',
        name: 'OLIVINE',
        code: '18-0316 TCX',
        model: '/hero/hero4.png', // Green Coat Model (previously hero4)
        brand: 'Emporio Armani',
        letters: { top: 'T', mid: 'H', bot: 'H' }
    },
    {
        id: 3,
        bg: '#1f2d4d', // BLUE DEPTHS (Navy)
        textColor: '#abb5cb',
        name: 'BLUE DEPTHS',
        code: '19-3940 TCX',
        model: '/hero/hero1.png', // Navy Suit Model (previously hero1)
        brand: 'Juun. J',
        letters: { top: 'H', mid: 'U', bot: 'O' }
    },
    {
        id: 4,
        bg: '#8a4f35', // GINGERBREAD (Rust)
        textColor: '#f5dcd2',
        name: 'GINGERBREAD',
        code: '18-1244 TCX',
        model: '/hero/hero6.png', // Rust Suit Model (previously hero6)
        brand: 'Zegna',
        letters: { top: 'E', mid: 'S', bot: 'U' }
    },
    {
        id: 5,
        bg: '#622d35', // PORT (Burgundy)
        textColor: '#ebc0c5',
        name: 'PORT',
        code: '19-1525 TCX',
        model: '/hero/hero7.png', // Burgundy Suit Model (previously hero7)
        brand: 'Zegna',
        letters: { top: '', mid: 'T', bot: 'R' }
    },
    {
        id: 6,
        bg: '#4a3c36', // JAVA (Dark Brown)
        textColor: '#d9cdb8',
        name: 'JAVA',
        code: '19-1016 TCX',
        model: '/hero/hero2.png', // Dark Brown Sweater Model (previously hero2)
        brand: 'Jacquemus',
        letters: { top: '', mid: 'L', bot: '' }
    },
    {
        id: 7,
        bg: '#abb3bc', // HIGH RISE (Grey)
        textColor: '#474d53',
        name: 'HIGH RISE',
        code: '15-4101 TCX',
        model: '/hero/hero3.png', // Grey Draped Model (previously hero3)
        brand: 'Issey Miyake',
        letters: { top: '', mid: 'E', bot: '' }
    }
];

const Hero: React.FC = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <section 
            id="hero" 
            className="relative min-h-[95vh] w-full bg-background pt-24 pb-10 pl-2 pr-6 md:pl-4 md:pr-12 lg:pl-6 lg:pr-20 xl:pl-8 xl:pr-28 flex flex-col justify-end overflow-hidden select-none"
        >
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 z-[1] hero-grain opacity-[0.12] pointer-events-none" />

            {/* Main Flow Wrapper: Holds the left badge and the right image strips */}
            <div className="relative w-full max-w-[1550px] mx-auto z-10 flex flex-col lg:flex-row items-center gap-6 xl:gap-8 justify-end h-full">
                
                {/* Left Side Badge: Displayed on top for mobile, left side for desktop */}
                <div className="flex-none w-full lg:w-auto flex justify-start lg:justify-center lg:pr-2 xl:pr-4 mb-4 lg:mb-0">
                    <div 
                        className={`bg-[#6b4528] text-[#f5f3ef] px-4 py-2.5 rounded-[4px] shadow-sm font-body text-[10px] tracking-[0.25em] uppercase font-bold select-none whitespace-nowrap transition-all duration-1000 ${
                            isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
                        }`}
                    >
                        In Trend : Collection
                    </div>
                </div>

                {/* Horizontal Flex Grid of Strips: Starts AFTER the left badge */}
                <div 
                    className={`flex-1 w-full flex gap-3 md:gap-4 lg:gap-5 pb-4 overflow-x-auto no-scrollbar snap-x snap-mandatory md:overflow-visible transition-all duration-1000 ${
                        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                >
                    {COLUMNS.map((col, idx) => {
                        const isHovered = hoveredIndex === idx;
                        const isAnyHovered = hoveredIndex !== null;
                        
                        // Premium accordion column expansion widths
                        let flexClass = 'flex-1 min-w-[190px] md:min-w-0';
                        if (isAnyHovered) {
                            flexClass = isHovered 
                                ? 'flex-[1.55] min-w-[210px] md:min-w-0' 
                                : 'flex-[0.82] min-w-[170px] md:min-w-0';
                        }

                        return (
                            <div
                                key={col.id}
                                className={`relative snap-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center ${flexClass}`}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Colored Pantone Strip */}
                                <div 
                                    className="relative w-full h-[540px] md:h-[600px] lg:h-[660px] rounded-[1px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                    style={{ 
                                        backgroundColor: col.bg,
                                        transform: isHovered ? 'scale(1.01)' : 'none',
                                        boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.12)' : '0 10px 25px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {/* Pantone Vertical ID Label */}
                                    <div 
                                        className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center select-none pointer-events-none z-10 origin-center whitespace-nowrap -rotate-90 transition-all duration-500"
                                        style={{ 
                                            color: col.textColor,
                                            transform: `translateX(-50%) rotate(-90deg) translateY(${isHovered ? '-3px' : '0px'})`
                                        }}
                                    >
                                        <span className="font-body text-[9px] md:text-[10px] tracking-[0.25em] font-extrabold opacity-75">
                                            {col.name}
                                        </span>
                                        <span className="font-mono text-[8px] tracking-[0.1em] opacity-45 mt-1">
                                            {col.code}
                                        </span>
                                    </div>
                                </div>

                                {/* Overlaid Large Typography Letters (THE HUSTLE HOUR) - z-10 to sit BEHIND models for 3D depth */}
                                <div className="absolute inset-x-0 top-0 bottom-[36px] flex flex-col justify-between py-24 select-none pointer-events-none z-10">
                                    {/* Top Row Letter */}
                                    <div className="flex justify-center items-center h-1/3">
                                        {col.letters.top && (
                                            <span 
                                                className="font-display text-[15vw] md:text-[8vw] lg:text-[9vw] font-black leading-none text-white/20 transition-all duration-700"
                                                style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
                                            >
                                                {col.letters.top}
                                            </span>
                                        )}
                                    </div>

                                    {/* Middle Row Letter */}
                                    <div className="flex justify-center items-center h-1/3">
                                        {col.letters.mid && (
                                            <span 
                                                className="font-display text-[15vw] md:text-[8vw] lg:text-[9vw] font-black leading-none text-white/20 transition-all duration-700"
                                                style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
                                            >
                                                {col.letters.mid}
                                            </span>
                                        )}
                                    </div>

                                    {/* Bottom Row Letter */}
                                    <div className="flex justify-center items-center h-1/3">
                                        {col.letters.bot && (
                                            <span 
                                                className="font-display text-[15vw] md:text-[8vw] lg:text-[9vw] font-black leading-none text-white/20 transition-all duration-700"
                                                style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
                                            >
                                                {col.letters.bot}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Model Silhouette Cutout Image - z-20 with multiply blend mode to remove solid white background */}
                                <img
                                    src={col.model}
                                    alt={`${col.brand} Model`}
                                    className={`absolute bottom-[36px] left-1/2 -translate-x-1/2 w-[140%] max-w-[155%] md:max-w-[165%] h-[74%] md:h-[76%] lg:h-[78%] object-contain z-20 pointer-events-none select-none mix-blend-multiply transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                        isMounted 
                                            ? 'translate-y-0 opacity-100' 
                                            : 'translate-y-12 opacity-0'
                                    }`}
                                    style={{
                                        transitionDelay: `${idx * 80}ms`,
                                        transform: isHovered ? 'translateX(-50%) scale(1.025)' : 'translateX(-50%)'
                                    }}
                                />

                                {/* Brand / Designer Label */}
                                <div className="h-[36px] flex items-center justify-center select-none pointer-events-none mt-2">
                                    <span 
                                        className={`font-body text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-500 ${
                                            isHovered ? 'text-accent' : 'text-foreground/80'
                                        }`}
                                    >
                                        {col.brand}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Separator Line */}
            <div className="w-full max-w-[1550px] mx-auto h-[1px] bg-foreground/10 mt-3 z-10" />
        </section>
    );
};

export default Hero;
