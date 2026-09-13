import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, FileText, Search, PhoneCall, Palette, Printer } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Share Your Idea',
    desc: 'Submit your requirements, design concept, or existing logo.',
    icon: FileText,
    action: 'Share Idea',
    link: '/business-branding'
  },
  {
    number: '02',
    title: 'Studio Review',
    desc: 'We evaluate fabrics, print techniques, and specs.',
    icon: Search,
    action: 'Studio Review',
    link: null
  },
  {
    number: '03',
    title: 'Quick Consultation',
    desc: 'We connect on WhatsApp or call to finalize details and budget.',
    icon: PhoneCall,
    action: 'Book Call',
    link: '/book-meeting'
  },
  {
    number: '04',
    title: 'Mockup & Quote',
    desc: 'Review realistic mockups and upfront transparent pricing.',
    icon: Palette,
    action: 'View Mockups',
    link: '/custom-apparel'
  },
  {
    number: '05',
    title: 'Print & Delivery',
    desc: 'Precision printing, quality check, and doorstep dispatch.',
    icon: Printer,
    action: 'Explore Catalog',
    link: '/shop'
  }
];

export const WhatHappensNextSlider: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? STEPS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === STEPS.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation (Rule 38)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch and Swipe navigation (Rule 38)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
  };

  const currentStep = STEPS[activeIndex];
  const IconComponent = currentStep.icon;

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      aria-label="What Happens Next - Interactive 5-Step Process Slider. Use left and right arrow keys or swipe to navigate."
      className="py-20 sm:py-24 bg-card/60 dark:bg-card/40 border-y border-border relative overflow-hidden focus:outline-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-kala-earth dark:text-kala-accent block mb-2">
              OUR PROCESS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase">
              What happens next?
            </h2>
            <p className="font-body text-sm sm:text-base text-mid mt-2 max-w-xl">
              From your idea to doorstep delivery in 5 simple steps.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border border-border bg-background hover:bg-black/5 dark:hover:bg-white/5 text-foreground flex items-center justify-center transition-colors shadow-xs"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full border border-border bg-background hover:bg-black/5 dark:hover:bg-white/5 text-foreground flex items-center justify-center transition-colors shadow-xs"
              aria-label="Next step"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Desktop Overview & Mobile Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {STEPS.map((step, idx) => {
            const isCurrent = idx === activeIndex;
            const StepIcon = step.icon;

            return (
              <div
                key={step.number}
                onClick={() => setActiveIndex(idx)}
                className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 relative border flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-background border-kala-emerald dark:border-emerald-500 shadow-lg scale-[1.02]'
                    : 'bg-background/40 border-border hover:border-border/80 hover:bg-background/80 opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-serif text-3xl font-black text-kala-emerald dark:text-emerald-400">
                      {step.number}
                    </span>
                    <div className={`p-2 rounded-lg ${isCurrent ? 'bg-kala-emerald/10 text-kala-emerald dark:text-emerald-400' : 'bg-black/5 dark:bg-white/5 text-mid'}`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-foreground mb-2 leading-snug">
                    {step.title}
                  </h3>

                  <p className="font-body text-xs text-mid leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {isCurrent && (
                  <div className="mt-6 pt-4 border-t border-border flex items-center gap-1.5 text-xs font-bold text-kala-emerald dark:text-emerald-400">
                    <span>Active Step</span>
                    <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Step Highlight Card */}
        <div className="mt-8 bg-background border border-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-kala-emerald text-white flex items-center justify-center shrink-0 shadow-md">
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-kala-earth dark:text-kala-accent uppercase">Step {currentStep.number}</span>
                <span className="text-mid text-xs">&bull;</span>
                <span className="text-xs text-mid">KALA Workflow</span>
              </div>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                {currentStep.title}
              </h4>
              <p className="text-sm text-mid mt-1">
                {currentStep.desc}
              </p>
            </div>
          </div>

          {currentStep.link && (
            <a
              href={currentStep.link}
              target={currentStep.link.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className="w-full md:w-auto px-6 py-3 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              <span>{currentStep.action}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-8 bg-kala-emerald dark:bg-emerald-400' : 'w-2 bg-border hover:bg-mid'
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatHappensNextSlider;
