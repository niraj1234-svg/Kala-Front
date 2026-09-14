import React from 'react';
import { IMAGES } from '../../constants/images';
import OptimizedImage from "../../components/hustle-hour/OptimizedImage";

const FeaturedLooks: React.FC = () => {
    return (
        <section id="featured" className="bg-background py-32 px-9">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                    <div className="reveal">
                        <h2 className="font-display text-[clamp(50px,8vw,120px)] leading-[0.85] tracking-tighter uppercase">
                            Featured <br />
                            <span className="text-accent italic font-serif lowercase tracking-normal">Looks</span>
                        </h2>
                    </div>
                    <div className="reveal hidden md:block max-w-[300px] pb-4">
                        <p className="font-light text-sm text-foreground/50 leading-relaxed">
                            A curated selection of the season's most defining silhouettes, captured in the heart of the urban hustle.
                        </p>
                    </div>
                </div>

                <div className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {IMAGES.featured.map((img, i) => (
                        <div key={i} className="aspect-[2/3.2] relative overflow-hidden group cursor-pointer bg-neutral-900 shadow-2xl transition-all duration-700 hover:z-10">
                            <OptimizedImage
                                src={img}
                                alt={`Look ${i + 1}`}
                                className="w-full h-full object-cover grayscale-[30%] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-100" />

                            <div className="absolute inset-x-0 bottom-0 p-8 z-[2] translate-y-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                <span className="font-body text-[9px] tracking-[0.4em] uppercase text-accent mb-3 block">Anthology 4.10</span>
                                <p className="font-display text-2xl tracking-widest text-white uppercase mb-4">
                                    THE {['URBAN', 'SILENT', 'NOCTURNAL', 'MODERN'][i]} HUSTLE
                                </p>
                                <div className="w-10 h-[1px] bg-white/40 group-hover:w-full transition-all duration-700" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedLooks;
