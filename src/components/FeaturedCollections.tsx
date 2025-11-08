import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type CollectionCard = {
  id: string;
  title: string;
  subtitle?: string;
  caption?: string;
  image: string;
  buttonText?: string;
  href?: string;
};

const FeaturedCollections: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cardsPerView, setCardsPerView] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideStepPx, setSlideStepPx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const collections: CollectionCard[] = useMemo(
    () => [
      {
        id: 'new-arrivals',
        title: 'NEW ARRIVALS',
        subtitle: 'Fresh Styles For The Season',
        image: '10.jpeg',
        buttonText: 'SHOP NEW',
        href: '/products?sort=new',
      },
      {
        id: 'best-sellers',
        title: 'BEST SELLERS',
        subtitle: 'Customer Favorites',
        image: '11.jpeg',
        buttonText: 'SHOP NOW',
        href: '/products?sort=featured',
      },
      {
        id: 'menswear',
        title: 'Menswear Essentials',
        caption: 'Tailored layers, built for the everyday hustle.',
        image: '2.jpeg',
        buttonText: 'SHOP ALL',
        href: '/products?collection=menswear',
      },
      {
        id: 'new-drops',
        title: 'New Drops',
        caption: 'Fresh arrivals and limited editions just released.',
        image: '3.jpeg',
        buttonText: 'EXPLORE',
        href: '/products?sort=new',
      },
    ],
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
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

  useEffect(() => {
    const computeCardsPerView = () => {
      setCardsPerView(window.innerWidth >= 1024 ? 2 : 1);
    };

    computeCardsPerView();
    window.addEventListener('resize', computeCardsPerView);
    return () => window.removeEventListener('resize', computeCardsPerView);
  }, []);

  useEffect(() => {
    const maxIndex = Math.max(0, collections.length - cardsPerView);
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [cardsPerView, collections.length]);

  useEffect(() => {
    const updateSlideStep = () => {
      if (!trackRef.current || trackRef.current.children.length === 0) {
        setSlideStepPx(0);
        return;
      }

      const firstChild = trackRef.current.children[0] as HTMLElement;
      const style = window.getComputedStyle(trackRef.current);
      const gapValue = parseFloat(style.columnGap || style.gap || '0');
      const width = firstChild.getBoundingClientRect().width;
      const step = width + (Number.isNaN(gapValue) ? 0 : gapValue);
      setSlideStepPx(step);
    };

    updateSlideStep();
    window.addEventListener('resize', updateSlideStep);
    return () => window.removeEventListener('resize', updateSlideStep);
  }, [cardsPerView, collections.length]);

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < collections.length - cardsPerView;
  const translatePixels = slideStepPx * currentIndex;

  return (
    <section ref={sectionRef} className="bg-white px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Featured</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Collections on rotation</h2>
          </div>
          <div className="hidden gap-3 lg:flex">
            <button
              type="button"
              onClick={() => canPrev && setCurrentIndex((prev) => prev - 1)}
              className={`rounded-full border border-gray-200 p-2 transition ${
                canPrev ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
              }`}
              disabled={!canPrev}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => canNext && setCurrentIndex((prev) => prev + 1)}
              className={`rounded-full border border-gray-200 p-2 transition ${
                canNext ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
              }`}
              disabled={!canNext}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex gap-4 sm:gap-6 lg:gap-8 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${translatePixels}px)` }}
            >
              {collections.map((collection, index) => {
                const delay = isVisible ? `${index * 120}ms` : '0ms';
                const cardClassName = `group relative flex-shrink-0 basis-full lg:basis-1/2 overflow-hidden rounded-xl bg-black text-white shadow-lg transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`;

                const cardContent = (
                  <>
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                    <div className="relative flex h-[420px] flex-col justify-end gap-5 px-6 py-10 sm:h-[500px] sm:px-10">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                          {collection.subtitle ?? 'Shop All'}
                        </p>
                        <h3 className="text-3xl font-semibold sm:text-4xl">{collection.title}</h3>
                        {collection.caption && (
                          <p className="text-sm text-white/80 sm:max-w-md">{collection.caption}</p>
                        )}
                      </div>
                      {collection.buttonText && (
                        <span className="inline-flex items-center gap-3 text-sm font-medium uppercase tracking-widest">
                          {collection.buttonText}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </>
                );

                if (collection.href) {
                  return (
                    <Link
                      key={collection.id}
                      to={collection.href}
                      className={cardClassName}
                      style={{ transitionDelay: delay }}
                    >
                      {cardContent}
                    </Link>
                  );
                }

                return (
                  <div key={collection.id} className={cardClassName} style={{ transitionDelay: delay }}>
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => canPrev && setCurrentIndex((prev) => prev - 1)}
              className={`rounded-full border border-gray-200 p-2 transition ${
                canPrev ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
              }`}
              disabled={!canPrev}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => canNext && setCurrentIndex((prev) => prev + 1)}
              className={`rounded-full border border-gray-200 p-2 transition ${
                canNext ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
              }`}
              disabled={!canNext}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;