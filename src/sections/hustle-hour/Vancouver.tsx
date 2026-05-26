import React from 'react';

interface ProductColumn {
    id: number;
    silhouette: string;
    itemsPack: string;
    modelName: string;
    itemsLabel: string;
    floatClass: string;
}

const PRODUCTS: ProductColumn[] = [
    { id: 1, silhouette: '/PRODUCT/girls2.png', itemsPack: '/PRODUCT/girls5.png', modelName: 'Look 01', itemsLabel: 'items', floatClass: 'model-float' },
    { id: 2, silhouette: '/PRODUCT/girls6.png', itemsPack: '/PRODUCT/girls3.png', modelName: 'Look 02', itemsLabel: 'items', floatClass: 'model-float-delayed-1' },
    { id: 3, silhouette: '/PRODUCT/girls8.png', itemsPack: '/PRODUCT/girls7.png', modelName: 'Look 03', itemsLabel: 'items', floatClass: 'model-float-delayed-2' },
    { id: 4, silhouette: '/PRODUCT/girls1.png', itemsPack: '/PRODUCT/girls4.png', modelName: 'Look 04', itemsLabel: 'items', floatClass: 'model-float-delayed-3' },
    { id: 5, silhouette: '/PRODUCT/girls2.png', itemsPack: '/PRODUCT/girls7.png', modelName: 'Look 05', itemsLabel: 'items', floatClass: 'model-float-delayed-4' },
    { id: 6, silhouette: '/PRODUCT/girls6.png', itemsPack: '/PRODUCT/girls3.png', modelName: 'Look 06', itemsLabel: 'items', floatClass: 'model-float-delayed-5' },
];

const Vancouver: React.FC = () => {
    return (
        <section 
            id="vancouver" 
            className="relative w-full bg-background py-24 md:py-32 overflow-hidden select-none border-b border-foreground/5"
        >
            {/* Inject smooth hover/float CSS styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes modelBob {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .model-float {
                    animation: modelBob 8s ease-in-out infinite;
                }
                .model-float-delayed-1 {
                    animation: modelBob 7.5s ease-in-out infinite;
                    animation-delay: -1.5s;
                }
                .model-float-delayed-2 {
                    animation: modelBob 8.5s ease-in-out infinite;
                    animation-delay: -3s;
                }
                .model-float-delayed-3 {
                    animation: modelBob 7s ease-in-out infinite;
                    animation-delay: -4.5s;
                }
                .model-float-delayed-4 {
                    animation: modelBob 9s ease-in-out infinite;
                    animation-delay: -2s;
                }
                .model-float-delayed-5 {
                    animation: modelBob 8.2s ease-in-out infinite;
                    animation-delay: -5.5s;
                }
            `}} />

            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 z-[1] hero-grain opacity-[0.08] pointer-events-none" />

            {/* Giant Typography Background Overlay (Aligned perfectly behind the models with screen-fitted font sizes) */}
            <div className="absolute left-0 right-0 bottom-[140px] md:bottom-[180px] lg:bottom-[205px] flex flex-col items-center pointer-events-none select-none z-0 overflow-hidden px-4">
                <span className="font-sans font-[900] text-[clamp(40px,7.5vw,135px)] text-black tracking-[0.03em] uppercase leading-none text-center whitespace-nowrap">
                    ACHROMATIC COLOR
                </span>
                <span className="font-sans font-medium text-[clamp(8px,0.8vw,11px)] text-black/70 tracking-[0.5em] uppercase mt-3.5 whitespace-nowrap">
                    W W W . J Y C E - S H O P . C O M
                </span>
            </div>

            {/* Vertical Fashion Caption (Center, between Col 3 and Col 4) */}
            <div className="absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none hidden lg:flex flex-col items-center gap-1.5 text-[9px] font-sans font-medium tracking-[0.1em] text-black/70 bg-background/90 px-1.5 py-3 rounded-[1px] shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                <span>時</span>
                <span>尚</span>
                <span>無</span>
                <span>彩</span>
                <span>度</span>
                <span>配</span>
                <span>色</span>
            </div>

            {/* Content Container (Removed relative and z-10 stacking context to allow mix-blend-multiply backdrop blending) */}
            <div className="w-full max-w-[1550px] mx-auto px-6 md:px-12 lg:px-16 xl:px-20">
                
                {/* 1. Header with thin separator line on left and text on right */}
                <div className="w-full flex items-baseline gap-6 mb-16 md:mb-20 select-none">
                    <div className="w-full h-[1px] bg-accent/40 relative top-[-6px]" />
                    <h2 className="font-serif font-black italic tracking-wide uppercase text-[24px] md:text-[34px] lg:text-[40px] text-accent leading-none whitespace-nowrap">
                        SHOP BY PRODUCTS
                    </h2>
                </div>

                {/* 2. 6-Column Responsive Grid Layout (Removed relative and z-10 stacking context) */}
                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-10 items-end">
                    {PRODUCTS.map((prod) => (
                        <div 
                            key={prod.id} 
                            className="flex flex-col items-center justify-end text-center group cursor-pointer transition-all duration-500 hover:scale-[1.025]"
                        >
                            {/* Silhouette Model container with bobbing float animation & mix-blend-multiply */}
                            <div className={`w-full aspect-[2/3.1] overflow-hidden relative mb-5 mix-blend-multiply ${prod.floatClass}`}>
                                <img
                                    src={prod.silhouette}
                                    alt={prod.modelName}
                                    className="w-full h-full object-contain mix-blend-multiply transition-all duration-1000 ease-out group-hover:scale-[1.04]"
                                    loading="lazy"
                                />
                            </div>
                            
                            {/* Product Info / Items pack underneath */}
                            <div className="flex flex-col items-center mt-2 w-full">
                                <span className="font-mono text-[9px] tracking-wider text-accent/60 opacity-60 group-hover:opacity-100 transition-opacity mb-1 block">
                                    {prod.modelName}
                                </span>
                                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-mid mb-2.5">
                                    {prod.itemsLabel}
                                </span>
                                
                                {/* Items pack thumbnail with mix-blend-multiply */}
                                <div className="w-16 h-16 md:w-20 md:h-20 overflow-hidden relative rounded-sm p-1.5 border border-foreground/5 bg-background/30 group-hover:border-accent/20 transition-all duration-500 shadow-[0_2px_10px_rgba(0,0,0,0.02)] group-hover:shadow-[0_4px_16px_rgba(138,79,53,0.06)] mix-blend-multiply">
                                    <img
                                        src={prod.itemsPack}
                                        alt={`${prod.modelName} items pack`}
                                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-1000 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Vancouver;
