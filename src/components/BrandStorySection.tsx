import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const BrandStorySection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
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

  // Mouse move effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Page transition effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !imageRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress (0 to 1)
      const scrollProgress = Math.max(0, Math.min(1, 
        (windowHeight - rect.top) / (windowHeight + rect.height)
      ));
      
      // Apply parallax to image
      if (imageRef.current) {
        const translateY = scrollProgress * 80 - 40; // -40 to 40
        imageRef.current.style.transform = `translateY(${translateY}px) scale(${1 + scrollProgress * 0.1})`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Split text into words for stagger animation
  const heading1 = "Crafting Quality,";
  const heading2 = "Delivering Excellence";
  const description = "We believe in creating products that matter. Every detail is crafted with precision, every design tells a story, and every product is made to last.";

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-black"
    >
      {/* Animated Background Gradient following cursor */}
      <div 
        className="absolute inset-0 opacity-30 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
        }}
      ></div>

      {/* Page Transition Overlay */}
      <div
        className={`absolute inset-0 bg-white origin-left transition-transform duration-1500 ease-in-out ${
          isVisible ? 'scale-x-0' : 'scale-x-100'
        }`}
        style={{ transformOrigin: 'left' }}
      ></div>

      {/* Main Grid Layout */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* Left Side - Text Content with Reveal Animation */}
        <div className="relative flex items-center justify-center p-8 sm:p-12 lg:p-16 text-white">
          <div className="max-w-xl space-y-8">
            
            {/* Badge with slide effect */}
            <div className="overflow-hidden">
              <div
                className={`transition-all duration-1000 ease-out ${
                  isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
                }`}
                style={{ transitionDelay: '400ms' }}
              >
                <span className="inline-block px-5 py-2 text-xs font-semibold uppercase tracking-widest border border-white/30 rounded-full backdrop-blur-sm">
                  Our Story
                </span>
              </div>
            </div>

            {/* Main Heading - Word by Word Reveal */}
            <div className="space-y-2">
              <div className="overflow-hidden">
                <h2
                  className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight transition-all duration-1000 ease-out ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                  }`}
                  style={{ transitionDelay: '600ms' }}
                >
                  {heading1}
                </h2>
              </div>
              <div className="overflow-hidden">
                <h2
                  className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-400 transition-all duration-1000 ease-out ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                  }`}
                  style={{ transitionDelay: '800ms' }}
                >
                  {heading2}
                </h2>
              </div>
            </div>

            {/* Description with Character Reveal Effect */}
            <div className="overflow-hidden">
              <p
                className={`text-lg sm:text-xl text-gray-300 leading-relaxed transition-all duration-1200 ease-out ${
                  isVisible ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-8 opacity-0 blur-sm'
                }`}
                style={{ transitionDelay: '1000ms' }}
              >
                {description}
              </p>
            </div>

            {/* Stats with Stagger Effect */}
            <div className="grid grid-cols-3 gap-8 py-8">
              {[
                { number: '50K+', label: 'Customers', delay: '1200ms' },
                { number: '200+', label: 'Products', delay: '1350ms' },
                { number: '15+', label: 'Years', delay: '1500ms' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`transition-all duration-1000 ease-out ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                  }`}
                  style={{ transitionDelay: stat.delay }}
                >
                  <div className="text-3xl sm:text-4xl font-bold mb-1">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Button with Scale Effect */}
            <div
              className={`transition-all duration-1000 ease-out ${
                isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
              }`}
              style={{ transitionDelay: '1650ms' }}
            >
              <a href="/about">
                <button className="group relative overflow-hidden px-8 py-4 bg-white text-black font-semibold text-sm uppercase tracking-wide transition-all duration-500 hover:bg-gray-100 hover:shadow-2xl hover:scale-105 hover:shadow-white/20">
                  <span className="relative z-10 flex items-center gap-2">
                    Discover More
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Right Side - Image with Advanced Effects */}
        <div className="relative overflow-hidden bg-gray-900">
          {/* Image Container with Parallax */}
          <div
            ref={imageRef}
            className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
          >
            <img
              src="12.jpeg"
              alt="Our Story"
              className={`w-full h-full object-cover transition-all duration-2000 ease-out ${
                isVisible ? 'scale-100 blur-0' : 'scale-110 blur-sm'
              }`}
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
            <div 
              className="absolute inset-0 opacity-30 mix-blend-overlay transition-opacity duration-700"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
              }}
            ></div>
            
            {/* Bottom Info Card with Slide Up */}
            <div
              className={`absolute bottom-8 left-8 right-8 transition-all duration-1200 ease-out ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
              }`}
              style={{ transitionDelay: '1800ms' }}
            >
             
            </div>
          </div>
        </div>
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Decorative Line */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-white/30 to-transparent hidden lg:block"></div>
    </section>
  );
};

export default BrandStorySection;