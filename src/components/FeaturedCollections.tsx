import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const FeaturedCollections: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const collections = [
    {
      id: 1,
      title: 'NEW ARRIVALS',
      subtitle: 'Fresh Styles For The Season',
      image: '10.jpeg',
      buttonText: 'SHOP NEW',
    },
    {
      id: 2,
      title: 'BEST SELLERS',
      subtitle: 'Customer Favorites',
      image: '11.jpeg',
      buttonText: 'SHOP NOW',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className={`group relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden rounded-sm transition-all duration-700 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Background Image */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${collection.image})`,
                  }}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-500"></div>
                </div>
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center text-center px-6 sm:px-8">
                <h3
                  className="text-sm sm:text-base font-medium tracking-[0.2em] text-white/90 mb-2 sm:mb-3 transition-all duration-500 group-hover:text-white group-hover:tracking-[0.3em]"
                >
                  {collection.title}
                </h3>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 transition-all duration-500 group-hover:scale-105"
                  style={{ lineHeight: '1.2' }}
                >
                  {collection.subtitle}
                </h2>

                {/* CTA Button */}
                <button className="relative group/btn overflow-hidden">
                  <div className="relative z-10 flex items-center gap-2 px-8 sm:px-10 py-3 sm:py-4 border-2 border-white text-white text-sm sm:text-base font-medium tracking-wider transition-colors duration-300 group-hover/btn:text-black">
                    <span>{collection.buttonText}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </div>
                  <div className="absolute inset-0 bg-white transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>

                {/* Bottom Text */}
                <p className="absolute bottom-8 sm:bottom-10 left-1/2 transform -translate-x-1/2 text-white/80 text-xs sm:text-sm tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500">
                  EXPLORE COLLECTION
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;