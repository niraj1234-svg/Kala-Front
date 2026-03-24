import React from 'react';
import { IMAGES } from '../../constants/images';
import OptimizedImage from "../../components/hustle-hour/OptimizedImage";

const Vancouver: React.FC = () => {
    return (
        <section id="vancouver" className="bg-cream py-32 px-9">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="reveal aspect-[4/5] overflow-hidden relative group shadow-2xl">
                    <OptimizedImage
                        src={IMAGES.vancouver}
                        alt="Vancouver Signature"
                        className="w-full h-full object-cover grayscale-[10%] transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                </div>

                <div className="reveal flex flex-col items-start text-left">
                    <span className="font-body text-[10px] tracking-[0.4em] uppercase text-mid mb-6">
                        Collections
                    </span>
                    <h2 className="font-display text-[clamp(44px,6vw,84px)] leading-[0.9] tracking-tight mb-8 uppercase">
                        Vancouver <br /> Signature
                    </h2>
                    <p className="font-light text-[15px] leading-[1.8] text-foreground/70 max-w-[440px] mb-10">
                        Inspired by the rugged beauty and urban energy of the Pacific Northwest, our signature collection creates timeless pieces that resonate with the spirit of exploration and ambition. Every stitch tells a story of the ingenious hour.
                    </p>
                    <a
                        href="#"
                        className="bg-foreground text-background px-12 py-4 font-body text-[11px] tracking-[0.3em] uppercase transition-all duration-500 hover:tracking-[0.5em] hover:bg-mid active:scale-95 shadow-lg"
                    >
                        Shop Now <span className="ml-2">→</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Vancouver;
