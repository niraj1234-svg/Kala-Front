import React from 'react';

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

const COLUMNS: ColumnItem[] = [
    {
        id: 1,
        bg: '#efe8de', // EGRET (Cream)
        textColor: '#888279',
        name: 'EGRET',
        code: '11-0103 TCX',
        model: '/hero/hero5.png',
        brand: 'EGONlab',
        letters: { top: '', mid: '', bot: '' }
    },
    {
        id: 2,
        bg: '#5d6b54', // OLIVINE (Green)
        textColor: '#dce5d6',
        name: 'OLIVINE',
        code: '18-0316 TCX',
        model: '/hero/hero4.png',
        brand: 'Emporio Armani',
        letters: { top: 'T', mid: 'H', bot: 'H' }
    },
    {
        id: 3,
        bg: '#1f2d4d', // BLUE DEPTHS (Navy)
        textColor: '#abb5cb',
        name: 'BLUE DEPTHS',
        code: '19-3940 TCX',
        model: '/hero/hero1.png',
        brand: 'Juun. J',
        letters: { top: 'H', mid: 'U', bot: 'O' }
    },
    {
        id: 4,
        bg: '#8a4f35', // GINGERBREAD (Rust)
        textColor: '#f5dcd2',
        name: 'GINGERBREAD',
        code: '18-1244 TCX',
        model: '/hero/hero6.png',
        brand: 'Zegna',
        letters: { top: 'E', mid: 'S', bot: 'U' }
    },
    {
        id: 5,
        bg: '#622d35', // PORT (Burgundy)
        textColor: '#ebc0c5',
        name: 'PORT',
        code: '19-1525 TCX',
        model: '/hero/hero7.png',
        brand: 'Zegna',
        letters: { top: '', mid: 'T', bot: 'R' }
    },
    {
        id: 6,
        bg: '#4a3c36', // JAVA (Dark Brown)
        textColor: '#d9cdb8',
        name: 'JAVA',
        code: '19-1016 TCX',
        model: '/hero/hero2.png',
        brand: 'Jacquemus',
        letters: { top: '', mid: 'L', bot: '' }
    },
    {
        id: 7,
        bg: '#abb3bc', // HIGH RISE (Grey)
        textColor: '#474d53',
        name: 'HIGH RISE',
        code: '15-4101 TCX',
        model: '/hero/hero3.png',
        brand: 'Issey Miyake',
        letters: { top: '', mid: 'E', bot: '' }
    }
];

const Hero: React.FC = () => {
    return (
        <section 
            id="hero" 
            className="relative min-h-screen w-full bg-background pt-24 pb-12 px-6 md:px-12 lg:px-16 xl:px-20 flex flex-col items-center justify-center overflow-hidden select-none animate-heroSlide"
        >
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 z-[1] hero-grain opacity-[0.12] pointer-events-none" />

            {/* Left Side Badge: Positioned on the far left of the entire section/viewport, completely clear of the centered grid */}
            <div className="absolute left-4 md:left-8 lg:left-12 xl:left-16 top-[68%] -translate-y-1/2 z-30 hidden md:block">
                <div className="bg-[#6b4528] text-[#f5f3ef] px-4.5 py-3 rounded-[3px] font-body text-[10px] tracking-[0.25em] uppercase font-bold select-none whitespace-nowrap">
                    In Trend : Collection
                </div>
            </div>

            {/* Main Flow Wrapper: Holds the relative stacking context for the grid */}
            <div className="relative w-full max-w-[1550px] mx-auto z-10">
                
                {/* Mobile Badge: Displayed on top of columns for mobile screen widths */}
                <div className="md:hidden w-full flex justify-start mb-6">
                    <div className="bg-[#6b4528] text-[#f5f3ef] px-4 py-2.5 rounded-[3px] font-body text-[10px] tracking-[0.2em] uppercase font-bold select-none">
                        In Trend : Collection
                    </div>
                </div>

                {/* Horizontal Static Grid of 7 Equal-Width Strips - Centered perfectly */}
                <div className="w-full flex justify-center gap-3 md:gap-4 lg:gap-5 pb-4 overflow-x-auto no-scrollbar snap-x snap-mandatory md:overflow-visible">
                    {COLUMNS.map((col) => {
                        return (
                            <div
                                key={col.id}
                                className="relative snap-center flex flex-col items-center flex-1 min-w-[130px] max-w-[170px] h-[560px] md:h-[630px] lg:h-[700px] justify-between"
                            >
                                {/* Colored Pantone Strip - Placed at the top, shorter than the card to let models extend below */}
                                <div 
                                    className="relative w-full h-[480px] md:h-[540px] lg:h-[600px] rounded-none shadow-none z-10"
                                    style={{ backgroundColor: col.bg }}
                                >
                                    {/* Pantone Vertical ID Label - Single line, left-aligned, running vertically downwards */}
                                    <div 
                                        className="absolute top-10 left-3 md:left-4 lg:left-5 origin-top-left rotate-90 whitespace-nowrap select-none pointer-events-none z-20 flex items-center gap-2.5"
                                        style={{ color: col.textColor }}
                                    >
                                        <span className="font-body text-[9px] md:text-[10px] tracking-[0.25em] font-black uppercase">
                                            {col.name}
                                        </span>
                                        <span className="font-mono text-[7.5px] md:text-[8px] tracking-[0.1em] opacity-50 ml-1">
                                            {col.code}
                                        </span>
                                    </div>
                                </div>

                                {/* Overlaid Large Typography Letters (THE HUSTLE HOUR) - z-30 (placed in front of models so they overlap cleanly, centered in the colored strip area) */}
                                <div className="absolute inset-x-0 top-0 h-[480px] md:h-[540px] lg:h-[600px] flex flex-col justify-between py-4 md:py-6 lg:py-8 select-none pointer-events-none z-30">
                                    {/* Top Row Letter */}
                                    <div className="flex justify-center items-center h-1/3">
                                        {col.letters.top && (
                                            <span className="font-serif text-[10vw] md:text-[4.5vw] lg:text-[5vw] xl:text-[5.4vw] font-black leading-[0.8] text-white/40">
                                                {col.letters.top}
                                            </span>
                                        )}
                                    </div>

                                    {/* Middle Row Letter */}
                                    <div className="flex justify-center items-center h-1/3">
                                        {col.letters.mid && (
                                            <span className="font-serif text-[10vw] md:text-[4.5vw] lg:text-[5vw] xl:text-[5.4vw] font-black leading-[0.8] text-white/40">
                                                {col.letters.mid}
                                            </span>
                                        )}
                                    </div>

                                    {/* Bottom Row Letter */}
                                    <div className="flex justify-center items-center h-1/3">
                                        {col.letters.bot && (
                                            <span className="font-serif text-[10vw] md:text-[4.5vw] lg:text-[5vw] xl:text-[5.4vw] font-black leading-[0.8] text-white/40">
                                                {col.letters.bot}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Model Silhouette Cutout Image - z-20 (Standing at bottom edge of column card, extending below the colored strip) */}
                                <img
                                    src={col.model}
                                    alt={`${col.brand} Model`}
                                    className="absolute bottom-[36px] left-1/2 -translate-x-1/2 w-[140%] max-w-[155%] md:max-w-[165%] h-[86%] md:h-[90%] lg:h-[92%] object-contain z-20 pointer-events-none select-none mix-blend-multiply"
                                    loading="eager"
                                />

                                {/* Brand / Designer Label */}
                                <div className="h-[36px] flex items-center justify-center select-none pointer-events-none z-10 mt-auto">
                                    <span className="font-body text-[10px] md:text-[11px] font-semibold text-foreground/80">
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
