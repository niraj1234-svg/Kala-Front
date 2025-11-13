import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Almond color constants to use throughout the component
const ALMOND_COLORS = {
  50: '#fefaf6',
  100: '#fbf4ec',
  150: '#f8eee2',
  200: '#f4e8d8',
  400: '#e8d0b3',
  500: '#d4b896',
  600: '#b89a7a',
  700: '#9c7d5e',
  900: '#5c4734'
};

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: "Summer Collection Launch",
      subtitle: "NEW ARRIVALS",
      description: "Fresh styles for the sunny days ahead",
      buttonText: "Explore Now",
      background: `bg-[${ALMOND_COLORS[50]}]`,
      textColor: "text-[#5c4734]",
      accentColor: "text-[#b89a7a]",
      borderColor: "border-[#f4e8d8]",
      image: "",
      ctaColor: "bg-[#d4b896] hover:bg-[#b89a7a] border-[#e8d0b3] text-white"
    },
    {
      id: 2,
      title: "Free Express Shipping",
      subtitle: "LIMITED TIME",
      description: "Get your orders delivered in 2 days",
      buttonText: "Shop Now",
      background: "bg-white",
      textColor: "text-gray-800",
      accentColor: "text-[#b89a7a]",
      borderColor: "border-[#f8eee2]",
      image: "",
      ctaColor: "bg-[#d4b896] hover:bg-[#b89a7a] border-[#e8d0b3] text-white"
    },
    {
      id: 3,
      title: "Weekend Special",
      subtitle: "UP TO 40% OFF",
      description: "Perfect outfits for your weekend plans",
      buttonText: "Get Deal",
      background: `bg-[${ALMOND_COLORS[50]}]`,
      textColor: "text-[#5c4734]",
      accentColor: "text-[#9c7d5e]",
      borderColor: "border-[#f4e8d8]",
      image: "",
      ctaColor: "bg-[#b89a7a] hover:bg-[#9c7d5e] border-[#d4b896] text-white"
    },
    {
      id: 4,
      title: "Eco-Friendly Collection",
      subtitle: "SUSTAINABLE FASHION",
      description: "Style that cares for the planet",
      buttonText: "Discover",
      background: "bg-white",
      textColor: "text-gray-800",
      accentColor: "text-[#b89a7a]",
      borderColor: "border-[#f8eee2]",
      image: "",
      ctaColor: "bg-[#d4b896] hover:bg-[#b89a7a] border-[#e8d0b3] text-white"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  // Auto slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="relative w-full h-[8vh] pt-10 min-h-[70px] max-h-[80px] overflow-hidden border-b border-[#fbf4ec] bg-white z-40">
      {/* Banner Slides */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className={`w-full h-full ${banners[currentSlide].background} ${banners[currentSlide].textColor} flex items-center justify-center px-4`}
          style={{
            backgroundColor: banners[currentSlide].background.includes('almond') ? ALMOND_COLORS[50] : undefined
          }}
        >
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            {/* Left Content - Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <span 
                className={`px-3 py-1 rounded-full text-xs font-medium border ${banners[currentSlide].borderColor} ${banners[currentSlide].accentColor} bg-white/80 backdrop-blur-sm`}
                style={{
                  borderColor: banners[currentSlide].borderColor.includes('almond') ? 
                    (banners[currentSlide].borderColor.includes('150') ? ALMOND_COLORS[150] : 
                     banners[currentSlide].borderColor.includes('200') ? ALMOND_COLORS[200] : 
                     ALMOND_COLORS[400]) : undefined,
                  color: banners[currentSlide].accentColor.includes('almond') ?
                    (banners[currentSlide].accentColor.includes('700') ? ALMOND_COLORS[700] : ALMOND_COLORS[600]) : undefined
                }}
              >
                {banners[currentSlide].subtitle}
              </span>
            </motion.div>

            <div className="flex items-center gap-4 flex-1 justify-center px-6">
              <motion.h3
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-semibold text-center whitespace-nowrap"
              >
                {banners[currentSlide].title}
              </motion.h3>
              
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="hidden lg:inline-block text-xs opacity-75"
              >
                {banners[currentSlide].description}
              </motion.span>
            </div>

            {/* Right Content - CTA & Icon
            <div className="flex items-center gap-3 flex-shrink-0">
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap border shadow-sm hover:shadow-md ${banners[currentSlide].ctaColor.includes('text-white') ? 'text-white' : ''}`}
                style={{
                  backgroundColor: banners[currentSlide].ctaColor.includes('bg-[') ? 
                    (banners[currentSlide].ctaColor.includes('500') ? ALMOND_COLORS[500] : 
                     banners[currentSlide].ctaColor.includes('600') ? ALMOND_COLORS[600] : ALMOND_COLORS[500]) : undefined,
                  borderColor: banners[currentSlide].ctaColor.includes('border-[') ?
                    ALMOND_COLORS[400] : undefined
                }}
              >
                {banners[currentSlide].buttonText}
              </motion.button>
              
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-lg hidden md:block"
              >
                {banners[currentSlide].image}
              </motion.div>
            </div> */}
          </div>
        </motion.div>
      </AnimatePresence>    
    </div>
  );
};

export default Banner;