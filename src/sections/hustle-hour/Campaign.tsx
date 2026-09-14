import React from 'react';

interface ModelItem {
    id: number;
    src: string;
    left: string;
    scale: number;
    blurNum: number; // numeric value for dynamic calculation on hover
    opacityNum: number; // numeric value for dynamic calculation
    zIndex: number;
    floatDuration: string;
    floatDelay: string;
    isCenter?: boolean;
}

// Balanced offsets between 4% and 92% to pack them tightly inside the 960px container
const MODELS: ModelItem[] = [
    { id: 1, src: '/SHOP/collection1.png', left: '4%', scale: 0.50, blurNum: 6, opacityNum: 0.15, zIndex: 10, floatDuration: '6.5s', floatDelay: '0s' },
    { id: 2, src: '/SHOP/collection2.png', left: '11%', scale: 0.58, blurNum: 5, opacityNum: 0.25, zIndex: 10, floatDuration: '7.2s', floatDelay: '-1.5s' },
    { id: 3, src: '/SHOP/collection5.png', left: '18%', scale: 0.64, blurNum: 4, opacityNum: 0.35, zIndex: 10, floatDuration: '5.8s', floatDelay: '-3s' },
    { id: 4, src: '/SHOP/collection1.png', left: '25%', scale: 0.70, blurNum: 3, opacityNum: 0.50, zIndex: 20, floatDuration: '8s', floatDelay: '-4.2s' },
    { id: 5, src: '/SHOP/collection2.png', left: '33%', scale: 0.78, blurNum: 1.5, opacityNum: 0.70, zIndex: 20, floatDuration: '6s', floatDelay: '-2.1s' },
    { id: 6, src: '/SHOP/collection5.png', left: '41%', scale: 0.85, blurNum: 1, opacityNum: 0.85, zIndex: 20, floatDuration: '7s', floatDelay: '-5.5s' },
    // Central model (sharp focus, in front)
    { id: 7, src: '/SHOP/collection3.png', left: '50%', scale: 1.05, blurNum: 0, opacityNum: 1.0, zIndex: 30, floatDuration: '9s', floatDelay: '-6s', isCenter: true },
    { id: 8, src: '/SHOP/collection4.png', left: '58%', scale: 0.85, blurNum: 1, opacityNum: 0.85, zIndex: 20, floatDuration: '6.8s', floatDelay: '-3.3s' },
    { id: 9, src: '/SHOP/collection1.png', left: '65%', scale: 0.78, blurNum: 1.5, opacityNum: 0.70, zIndex: 20, floatDuration: '7.5s', floatDelay: '-2s' },
    { id: 10, src: '/SHOP/collection2.png', left: '72%', scale: 0.70, blurNum: 3, opacityNum: 0.50, zIndex: 20, floatDuration: '5.5s', floatDelay: '-1s' },
    { id: 11, src: '/SHOP/collection5.png', left: '79%', scale: 0.64, blurNum: 4, opacityNum: 0.35, zIndex: 10, floatDuration: '8.2s', floatDelay: '0s' },
    { id: 12, src: '/SHOP/collection1.png', left: '86%', scale: 0.58, blurNum: 5, opacityNum: 0.25, zIndex: 10, floatDuration: '6.2s', floatDelay: '-4s' },
    { id: 13, src: '/SHOP/collection2.png', left: '92%', scale: 0.50, blurNum: 6, opacityNum: 0.15, zIndex: 10, floatDuration: '7s', floatDelay: '-5s' },
];

const Campaign: React.FC = () => {
    return (
        <section 
            id="campaign" 
            className="relative w-full bg-background py-16 md:py-20 lg:py-24 overflow-hidden select-none"
        >
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 z-[1] hero-grain opacity-[0.08] pointer-events-none" />

            {/* Layout Wrapper: Spans and centers the grid cleanly */}
            <div className="relative w-full max-w-[1550px] mx-auto z-10 px-6 md:px-12 lg:px-16 xl:px-20">
                
                {/* Spaced-out horizontal perspective lineup spanning the container width */}
                <div className="relative w-full h-[480px] md:h-[560px] lg:h-[640px] flex items-end justify-center select-none pb-12 border-b border-foreground/5 z-10">
                    
                    {/* Background Models Stack Container */}
                    <div className="absolute inset-x-0 bottom-[12px] h-full flex items-end justify-center z-10">
                        {MODELS.map((col) => {
                            const scale = col.isCenter ? 1.05 : col.scale;
                            const opacity = col.opacityNum;
                            const blur = col.blurNum;
                            const zIndex = col.zIndex;

                            const translateStyle = col.isCenter 
                                ? 'translateX(-50%) scale(1.05)' 
                                : `translateX(-50%) scale(${scale})`;

                            return (
                                <div
                                    key={col.id}
                                    className="absolute bottom-[-15px] select-none mix-blend-multiply"
                                    style={{
                                        left: col.left,
                                        transform: translateStyle,
                                        zIndex: zIndex,
                                    }}
                                >
                                    <img
                                        src={col.src}
                                        alt="Collection Silhouette Model"
                                        className="max-w-none w-[180px] md:w-[220px] lg:w-[260px] h-auto object-contain select-none mix-blend-multiply"
                                        style={{
                                            filter: `blur(${blur}px) grayscale(0.1)`,
                                            opacity: opacity,
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Overlay Typography Details Block 1 (Left near Model 4/5) */}
                    <div className="absolute left-[16%] md:left-[22%] lg:left-[25%] bottom-[12%] z-25 text-left select-none text-[8.5px] md:text-[9.5px] leading-[1.6] font-body text-foreground/80 hidden md:block">
                        <div className="flex flex-col gap-1.5 font-body">
                            <span className="font-extrabold tracking-[0.25em] text-[10px] text-foreground/85">MENSWEAR</span>
                            <span className="tracking-[0.15em] text-foreground/50 text-[8px] uppercase">CURRENT</span>
                            <div className="flex flex-col mt-2 select-text font-semibold text-foreground/60 tracking-wider">
                                <span>P.R. PATTERSON</span>
                                <span className="text-[7.5px] opacity-75 font-light">Coat Wool</span>
                                <span className="mt-1">P.R. PATTERSON</span>
                                <span className="text-[7.5px] opacity-75 font-light">Shirt Canvas</span>
                                <span className="mt-1">P.R. PATTERSON</span>
                                <span className="text-[7.5px] opacity-75 font-light">Trouser Canvas</span>
                                <span className="mt-1">MA+</span>
                                <span className="text-[7.5px] opacity-75 font-light">Boot Leather</span>
                            </div>
                            <span className="font-serif italic text-accent text-[9.5px] mt-2 cursor-pointer hover:text-foreground transition-all duration-300">Enquire</span>
                            <span className="text-[7.5px] opacity-40 font-mono tracking-widest mt-1">Zoom / Hide Details</span>
                        </div>
                    </div>

                    {/* Overlay Typography Details Block 2 (Center near Central Model 7) */}
                    <div className="absolute left-[34%] md:left-[39%] lg:left-[41.5%] bottom-[16%] z-25 text-left select-none text-[8.5px] md:text-[9.5px] leading-[1.6] font-body text-foreground/80 hidden lg:block">
                        <div className="flex flex-col gap-1.5 font-body">
                            <span className="font-extrabold tracking-[0.25em] text-[10px] text-foreground/85">MENSWEAR</span>
                            <span className="tracking-[0.15em] text-foreground/50 text-[8px] uppercase">CURRENT</span>
                            <div className="flex flex-col mt-2 select-text font-semibold text-foreground/60 tracking-wider">
                                <span>P.R. PATTERSON</span>
                                <span className="text-[7.5px] opacity-75 font-light">Coat Wool</span>
                                <span className="mt-1">P.R. PATTERSON</span>
                                <span className="text-[7.5px] opacity-75 font-light">Shirt Canvas</span>
                                <span className="mt-1">P.R. PATTERSON</span>
                                <span className="text-[7.5px] opacity-75 font-light">Trouser Canvas</span>
                                <span className="mt-1">MA+</span>
                                <span className="text-[7.5px] opacity-75 font-light">Boot Leather</span>
                            </div>
                            <span className="font-serif italic text-accent text-[9.5px] mt-2 cursor-pointer hover:text-foreground transition-all duration-300">Enquire</span>
                            <span className="text-[7.5px] opacity-40 font-mono tracking-widest mt-1 font-semibold">Zoom / Hide Details</span>
                        </div>
                    </div>

                    {/* Bottom Right Interactive Cursive / Link Indicator Icon */}
                    <div className="absolute right-8 bottom-6 text-foreground/45 hover:text-foreground text-[10px] font-mono tracking-widest cursor-pointer transition-all duration-300 z-20 font-bold">
                        .. ↗
                    </div>

                </div>

            </div>
        </section>
    );
};

export default Campaign;
