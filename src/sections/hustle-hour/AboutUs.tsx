import React from 'react';

interface AboutCard {
    id: number;
    image: string;
    isTextCard: boolean;
    alt: string;
    offsetClass: string;
}

const CARDS: AboutCard[] = [
    { id: 1, image: '/about/about2.png', isTextCard: false, alt: 'Knit Shirt Model', offsetClass: 'translate-y-[-10px] md:translate-y-[-25px] lg:translate-y-[-45px] xl:translate-y-[-60px]' },
    { id: 2, image: '/about/about1.png', isTextCard: true, alt: 'Visuals Don\'t Match Value', offsetClass: 'translate-y-[-20px] md:translate-y-[-50px] lg:translate-y-[-80px] xl:translate-y-[-110px]' },
    { id: 3, image: '/about/about3.png', isTextCard: false, alt: 'Sincere Shirt Model', offsetClass: 'translate-y-[-15px] md:translate-y-[-35px] lg:translate-y-[-55px] xl:translate-y-[-75px]' },
    { id: 4, image: '/about/about1.png', isTextCard: true, alt: 'Visuals Don\'t Match Value', offsetClass: 'translate-y-[10px] md:translate-y-[25px] lg:translate-y-[45px] xl:translate-y-[60px]' },
    { id: 5, image: '/about/about4.png', isTextCard: false, alt: 'Brown Zip Shirt', offsetClass: 'translate-y-[5px] md:translate-y-[10px] lg:translate-y-[15px] xl:translate-y-[20px]' },
    { id: 6, image: '/about/about1.png', isTextCard: true, alt: 'Visuals Don\'t Match Value', offsetClass: 'translate-y-[15px] md:translate-y-[40px] lg:translate-y-[65px] xl:translate-y-[85px]' },
];

const AboutUs: React.FC = () => {
    return (
        <section 
            id="about-us" 
            className="relative w-full bg-background py-28 md:py-40 lg:py-48 overflow-hidden select-none border-b border-foreground/5"
        >
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 z-[1] hero-grain opacity-[0.08] pointer-events-none" />

            {/* Giant Background Lettering */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden py-10">
                <span className="font-serif font-black text-[clamp(100px,18vw,275px)] text-accent tracking-tighter uppercase leading-none text-center whitespace-nowrap">
                    About Us
                </span>
            </div>

            {/* Cards Container */}
            <div className="relative w-full max-w-[1550px] mx-auto z-10 px-6 md:px-12 lg:px-16 xl:px-20">
                
                {/* Header with thin separator line on left and text on right */}
                <div className="w-full flex items-baseline gap-6 mb-16 md:mb-24 select-none">
                    <div className="w-full h-[1px] bg-accent/40 relative top-[-6px]" />
                    <h2 className="font-serif font-black italic tracking-wide uppercase text-[24px] md:text-[34px] lg:text-[40px] text-accent leading-none whitespace-nowrap">
                        ABOUT US
                    </h2>
                </div>

                {/* 3-Column Staggered Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-16 lg:gap-x-16 xl:gap-x-20 items-start justify-center z-10 relative py-10 md:py-16">
                    {CARDS.map((card, idx) => (
                        <div 
                            key={idx}
                            className={`w-full transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${card.offsetClass}`}
                        >
                            {/* Inner Card Container (Handles border, shadow, and scaling interaction independently) */}
                            <div 
                                className={`w-full relative overflow-hidden bg-background shadow-[0_6px_30px_rgba(0,0,0,0.04)] rounded-[2px] border border-foreground/5 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.035] hover:shadow-[0_20px_50px_rgba(0,0,0,0.09)] hover:-translate-y-1.5 cursor-pointer ${
                                    card.isTextCard ? 'aspect-[3/2]' : 'aspect-[4/5]'
                                }`}
                            >
                                <img 
                                    src={card.image} 
                                    alt={card.alt} 
                                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default AboutUs;
