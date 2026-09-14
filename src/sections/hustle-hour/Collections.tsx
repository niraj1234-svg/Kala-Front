import React from 'react';

const Collections: React.FC = () => {
    return (
        <section 
            id="collections" 
            className="relative w-full bg-background py-16 md:py-20 overflow-hidden select-none"
        >
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 z-[1] hero-grain opacity-[0.08] pointer-events-none" />

            {/* Layout Wrapper: Centers and sizes the grid cleanly */}
            <div className="relative w-full max-w-[1550px] mx-auto z-10 px-6 md:px-12 lg:px-16 xl:px-20">
                
                {/* 4-Column Asymmetric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-10 w-full mx-auto relative items-start">
                    
                    {/* Column 1: Stacked Images (Red Crumpled Paper + Streetwear Yellow Chair Model) */}
                    {/* Combined height exactly matches the other columns (620px on desktop) */}
                    <div className="w-full flex flex-col gap-6 h-auto lg:h-[620px]">
                        {/* Top: Red Crumpled Paper Poster */}
                        <div className="w-full flex-1 relative overflow-hidden rounded-[1px] aspect-[3/4.2] lg:aspect-auto">
                            <img 
                                src="/3rdSection/c70c0b46-01f3-47aa-9853-02df36ce3831.png" 
                                alt="Age of Rage Crumpled Poster" 
                                className="w-full h-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015]"
                            />
                        </div>

                        {/* Bottom: Streetwear model sitting in yellow chair */}
                        <div className="w-full flex-1 relative overflow-hidden rounded-[1px] aspect-[3/4.2] lg:aspect-auto">
                            <img 
                                src="/3rdSection/9d586e2e-a806-48d5-aa34-df9e7dd679dc.png" 
                                alt="IDC Teens Streetwear Model" 
                                className="w-full h-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015]"
                            />
                        </div>
                    </div>

                    {/* Column 2: Red Bodysuit Model + Paragraph Text Block */}
                    {/* Restricting total height to 620px on desktop so the text is perfectly adjusted inside and aligns at the bottom */}
                    <div className="w-full flex flex-col justify-between h-auto lg:h-[620px]">
                        {/* Red Bodysuit Model (Drop Amore) - Fills the remaining space dynamically */}
                        <div className="w-full flex-1 relative overflow-hidden rounded-[1px] aspect-[3/4.4] lg:aspect-auto mb-5">
                            <img 
                                src="/3rdSection/3a78ec58-fc3d-433f-8796-a53524c789e9.png" 
                                alt="Drop Amore Model" 
                                className="w-full h-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015]"
                            />
                        </div>

                        {/* Paragraph editorial block underneath the model - Aligned inside the 620px bounds */}
                        <div className="flex-none select-text">
                            <p className="font-body text-[12px] md:text-[12.5px] lg:text-[13px] text-foreground/80 leading-[1.75] tracking-wide text-justify pr-2">
                                Step into the new season with streetwear that speaks louder than words. Spring 2026 is redefining urban fashion perfect mix of comfort, confidence, and creativity. Whether you're hitting the streets or curating your everydaylook, this season
                            </p>
                        </div>
                    </div>

                    {/* Column 3: B&W Blurred walking models (Resilience) */}
                    <div className="flex flex-col w-full h-auto lg:h-[620px]">
                        <div className="w-full h-full relative overflow-hidden rounded-[1px]">
                            <img 
                                src="/3rdSection/acc81a50-7e57-462e-93d9-940f4ff63ea2 (1).png" 
                                alt="Julius Resilience Motion Blur Silhouettes" 
                                className="w-full h-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015]"
                            />
                        </div>
                    </div>

                    {/* Column 4: Green Puffer Coat Model (Human & Nature / Summer Capsule '26 built-in) */}
                    <div className="flex flex-col w-full h-auto lg:h-[620px]">
                        <div className="w-full h-full relative overflow-hidden rounded-[1px]">
                            <img 
                                src="/3rdSection/4289a6a2-b13d-4aab-9aaa-ca3920c045ef.png" 
                                alt="Summer Capsule Puffer Model" 
                                className="w-full h-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015]"
                            />
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
};

export default Collections;
