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
            className="relative min-h-[95vh] w-full bg-background pt-24 pb-10 pl-2 pr-6 md:pl-4 md:pr-12 lg:pl-6 lg:pr-20 xl:pl-8 xl:pr-28 flex flex-col justify-end overflow-hidden select-none"
        >
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 z-[1] hero-grain opacity-[0.12] pointer-events-none" />

            {/* Main Flow Wrapper: Holds the left badge and the right image strips */}
            <div className="relative w-full max-w-[1550px] mx-auto z-10 flex flex-col lg:flex-row items-center gap-6 xl:gap-8 justify-end h-full">
                
                {/* Left Side Badge: Displayed on top for mobile, left side for desktop */}
                <div className="flex-none w-full lg:w-auto flex justify-start lg:justify-center lg:pr-2 xl:pr-4 mb-4 lg:mb-0">
                    <div className="bg-[#6b4528] text-[#f5f3ef] px-4 py-2.5 rounded-[4px] shadow-sm font-body text-[10px] tracking-[0.25em] uppercase font-bold select-none whitespace-nowrap">
                        In Trend : Collection
                    </div>
                </div>

                {/* Horizontal Static Grid of 7 Equal-Width Strips */}
                <div className="flex-1 w-full flex gap-3 md:gap-4 lg:gap-5 pb-4 overflow-x-auto no-scrollbar snap-x snap-mandatory md:overflow-visible">
                    {COLUMNS.map((col) => {
                        return (
                            <div
                                key={col.id}
                                className="relative snap-center flex flex-col items-center flex-1 min-w-[190px] md:min-w-0"
                            >
                                {/* Colored Pantone Strip */}
                                <div 
                                    className="relative w-full h-[540px] md:h-[600px] lg:h-[660px] rounded-[1px] shadow-[0_10px_25px_rgba(0,0,0,0.05)]"
                                    style={{ backgroundColor: col.bg }}
                                >
                                    {/* Pantone Vertical ID Label */}
                                    <div 
                                        className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center select-none pointer-events-none z-10 origin-center whitespace-nowrap -rotate-90"
                                        style={{ 
                                            color: col.textColor,
                                            transform: 'translateX(-50%) rotate(-90deg)'
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
                                <div className="absolute inset-x-0 top-0 bottom-[36px] flex flex-col justify-between py-16 md:py-20 lg:py-24 select-none pointer-events-none z-10">
                                    {/* Top Row Letter */}
                                    <div className="flex justify-center items-center h-1/3">
                                        {col.letters.top && (
                                            <span className="font-serif text-[15vw] md:text-[8vw] lg:text-[9vw] font-black leading-none text-white/50">
                                                {col.letters.top}
                                            </span>
                                        )}
                                    </div>

                                    {/* Middle Row Letter */}
                                    <div className="flex justify-center items-center h-1/3">
                                        {col.letters.mid && (
                                            <span className="font-serif text-[15vw] md:text-[8vw] lg:text-[9vw] font-black leading-none text-white/50">
                                                {col.letters.mid}
                                            </span>
                                        )}
                                    </div>

                                    {/* Bottom Row Letter */}
                                    <div className="flex justify-center items-center h-1/3">
                                        {col.letters.bot && (
                                            <span className="font-serif text-[15vw] md:text-[8vw] lg:text-[9vw] font-black leading-none text-white/50">
                                                {col.letters.bot}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Model Silhouette Cutout Image - z-20 with multiply blend mode to remove solid white background */}
                                <img
                                    src={col.model}
                                    alt={`${col.brand} Model`}
                                    className="absolute bottom-[36px] left-1/2 -translate-x-1/2 w-[140%] max-w-[155%] md:max-w-[165%] h-[74%] md:h-[76%] lg:h-[78%] object-contain z-20 pointer-events-none select-none mix-blend-multiply"
                                    loading="eager"
                                />

                                {/* Brand / Designer Label */}
                                <div className="h-[36px] flex items-center justify-center select-none pointer-events-none mt-2">
                                    <span className="font-body text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase text-foreground/80">
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
