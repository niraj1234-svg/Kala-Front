import React, { useState, useEffect } from 'react';

const HeroSection: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const opacity = Math.max(1 - scrollY / 500, 0);
  const scale = Math.max(1 - scrollY / 2000, 0.95);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-rose-100 via-amber-50 to-stone-200">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-100"
        style={{
          backgroundImage:
            'url(6.jpeg)',
          transform: `scale(${scale})`,
          opacity: opacity,
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center pt-20">
        <div
          className="text-center px-4 transition-all duration-300"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            opacity: opacity,
          }}
        >
          <h1
            className="font-serif text-5xl sm:text-7xl lg:text-8xl text-white mb-8 tracking-wide"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontFamily: "'Playfair Display', serif",
            }}
          >
            More Than A Dream
          </h1>
          <button className="group relative px-8 sm:px-12 py-3 sm:py-4 border-2 border-white text-white text-sm sm:text-base font-medium tracking-wider hover:bg-white hover:text-gray-900 transition-all duration-900 overflow-hidden">
            <span className="relative z-10">SHOP NEW SEASON</span>
            <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-900 origin-left"></div>
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300"
        style={{ opacity: opacity }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
