import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Scissors, BookOpen, Play } from 'lucide-react';

const FeatureSections: React.FC = () => {
  const [isVisible, setIsVisible] = useState({ custom: false, blog: false, video: false });
  const customRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  const seasonalHighlights = [
    {
      title: 'Season 2026 — Coming Soon',
      description: 'Preview the silhouettes and palettes arriving with next year’s first drop.',
      badge: 'Sneak Peek',
      href: '/products?collection=season-2026',
      image: '4.jpeg',
    },
    {
      title: 'Winter Collection',
      description: 'Layer-ready knits, insulated outerwear, and weatherproof staples.',
      badge: 'Winter Edit',
      href: '/products?category=Outerwear',
      image: '5.jpeg',
    },
    {
      title: 'New Arrivals',
      description: 'Fresh drops from the studio — limited quantities, constant refresh.',
      badge: 'Just In',
      href: '/products?sort=new',
      image: '6.jpeg',
    },
    {
      title: 'Core Essentials',
      description: 'Everyday basics in premium fabrics to build your rotation.',
      badge: 'Essentials',
      href: '/products?collection=essentials',
      image: '7.jpeg',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section');
            if (id) setIsVisible(prev => ({ ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.3 }
    );

    [customRef, blogRef, videoRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* 1. CUSTOMIZE SECTION - Full Width Split with Image Reveal */}
      <section 
        ref={customRef}
        data-section="custom"
        className="relative h-screen overflow-hidden bg-black"
      >
        {/* Left Side - Image */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-1/2">
          <div 
            className={`h-full w-full transition-transform duration-[2000ms] ease-out ${
              isVisible.custom ? 'scale-100' : 'scale-110'
            }`}
          >
            <img
              src="8.jpeg"
              alt="Custom Tailoring"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        </div>

        {/* Right Side - Content Overlay */}
        <div className="relative h-full flex items-center justify-end px-6 lg:px-16">
          <div className="max-w-xl w-full lg:w-1/2">
            <div className="bg-white p-8 sm:p-12 lg:p-16">
              
              {/* Animated Badge */}
              <div 
                className={`overflow-hidden mb-8 transition-all duration-1000 ${
                  isVisible.custom ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] font-bold">
                  <Scissors className="w-5 h-5" />
                  <span>Your Style, Your Way</span>
                </div>
              </div>

              {/* Title */}
              <h2 
                className={`text-4xl lg:text-5xl xl:text-6xl font-black mb-6 transition-all duration-1000 delay-200 ${
                  isVisible.custom ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
              >
                CUSTOM
                <br />
                FIT
              </h2>

              {/* Description */}
              <p 
                className={`text-gray-700 text-lg mb-8 transition-all duration-1000 delay-400 ${
                  isVisible.custom ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                Made to measure. Built to last. Every piece tailored to your exact specifications.
              </p>

              {/* CTA */}
              <a 
                href="/customize"
                className={`inline-block transition-all duration-1000 delay-600 ${
                  isVisible.custom ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <div className="group relative overflow-hidden">
                  <div className="flex items-center gap-3 bg-black text-white px-8 py-4 font-bold uppercase tracking-wider">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </div>
                  <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  <div className="absolute inset-0 flex items-center gap-3 px-8 text-black font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-xs uppercase tracking-widest animate-bounce">
          Scroll
        </div>
      </section>

      {/* Seasonal Highlights */}
      <section className="bg-[var(--color-cream)] py-20 px-6 lg:px-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-brown-500)]">Collections</p>
              <h2 className="text-3xl font-semibold text-[var(--color-brown-900)] sm:text-4xl">
                Rotating highlights from the studio floor.
              </h2>
              <p className="text-sm text-[var(--color-brown-600)] sm:text-base">
                Slide into the upcoming releases, seasonal staples, and core drops — refreshed regularly to keep your wardrobe ahead.
              </p>
            </div>
            <a
              href="/products"
              className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-brown-500)] hover:text-[var(--color-brown-700)]"
            >
              View Full Catalogue
            </a>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {seasonalHighlights.map((highlight) => (
              <a
                key={highlight.title}
                href={highlight.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-brown-200)] bg-white shadow-[0_15px_35px_rgba(52,35,24,0.08)] transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(52,35,24,0.12)]"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={highlight.image}
                    alt={highlight.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-[var(--color-brown-900)]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-cream)]">
                    {highlight.badge}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 px-5 py-6">
                  <h3 className="text-lg font-semibold text-[var(--color-brown-900)]">{highlight.title}</h3>
                  <p className="text-sm text-[var(--color-brown-600)] leading-relaxed flex-1">{highlight.description}</p>
                  <span className="text-sm font-semibold text-[var(--color-brown-700)] transition-colors group-hover:text-[var(--color-brown-900)]">
                    Explore Collection
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 2. BLOG SECTION - Magazine Style Layout */}
      <section 
        ref={blogRef}
        data-section="blog"
        className="py-20 lg:py-32 px-6 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-16 lg:mb-24">
            <div 
              className={`inline-flex items-center gap-2 mb-6 transition-all duration-1000 ${
                isVisible.blog ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm uppercase tracking-[0.3em] font-bold">Latest Stories</span>
            </div>
            <h2 
              className={`text-5xl lg:text-7xl font-black uppercase transition-all duration-1000 delay-200 ${
                isVisible.blog ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
            >
              Journal
            </h2>
          </div>

          {/* Featured Post - Large */}
          <div 
            className={`mb-12 transition-all duration-1000 delay-400 ${
              isVisible.blog ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            <a href="/blog/1" className="group block">
              <div className="grid lg:grid-cols-2 gap-0 bg-black">
                <div className="relative aspect-[4/5] lg:aspect-auto overflow-hidden">
                  <img
                    src="9.jpeg"
                    alt="Featured Post"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-16 text-white">
                  <div className="text-xs uppercase tracking-widest mb-4 text-gray-400">Featured / Oct 10, 2025</div>
                  <h3 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                    The Future of Streetwear Culture
                  </h3>
                  <p className="text-gray-300 mb-8 text-lg">
                    Exploring how urban fashion continues to evolve and influence the global style landscape.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider group-hover:gap-4 transition-all">
                    Read Article
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Grid Posts */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                img: '8.jpeg',
                title: 'Behind the Design',
                cat: 'Process'
              },
              {
                img: '7.jpeg',
                title: 'Sustainable Materials',
                cat: 'Innovation'
              },
              {
                img: '6.jpeg',
                title: 'Style Guide 2025',
                cat: 'Fashion'
              }
            ].map((post, i) => (
              <a 
                key={i} 
                href={`/blog/${i+2}`}
                className={`group block transition-all duration-1000 ${
                  isVisible.blog ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
                style={{ transitionDelay: `${600 + i * 150}ms` }}
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-4">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="text-xs uppercase tracking-widest mb-2 text-gray-500">{post.cat}</div>
                <h4 className="text-xl font-bold group-hover:underline">{post.title}</h4>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VIDEO SECTION - Cinematic Full Width */}
      <section 
        ref={videoRef}
        data-section="video"
        className="relative h-screen overflow-hidden"
      >
        {/* Video Background */}
       {/* Video Background */}
<div className="absolute inset-0">
  <video
    src="/v3.mp4"
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-black/60"></div>
</div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 text-white">
          
          {/* Play Button */}
          <button 
            className={`group mb-12 transition-all duration-1000 ${
              isVisible.video ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
            onClick={() => window.open('https://youtube.com', '_blank')}
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center group-hover:bg-white transition-all duration-300">
                <Play className="w-10 h-10 ml-1 group-hover:text-black transition-colors" fill="white" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-20"></div>
            </div>
          </button>

          {/* Title */}
          <h2 
            className={`text-5xl lg:text-7xl xl:text-8xl font-black uppercase mb-6 transition-all duration-1000 delay-200 ${
              isVisible.video ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            Watch Our
            <br />
            Story
          </h2>

          {/* Description */}
          <p 
            className={`text-xl lg:text-2xl text-gray-300 max-w-2xl mb-12 transition-all duration-1000 delay-400 ${
              isVisible.video ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            Go behind the scenes and see how we create every piece with passion
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-600 ${
              isVisible.video ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group px-8 py-4 bg-red-600 text-white font-bold uppercase tracking-wider hover:bg-red-700 transition-all flex items-center gap-3"
            >
              <Play className="w-5 h-5" fill="white" />
              <span>Subscribe</span>
            </a>
            <a 
              href="/videos"
              className="px-8 py-4 border-2 border-white text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all"
            >
              All Videos
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeatureSections;