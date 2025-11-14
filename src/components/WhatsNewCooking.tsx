import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

type CookingCard = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  status: 'ongoing' | 'upcoming' | 'concept';
};

const WhatsNewCooking: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const cookingItems: CookingCard[] = [
    {
      id: 'item-1',
      title: 'Summer Breeze Collection',
      subtitle: 'Ongoing',
      description: 'Light fabrics and vibrant colors for the season',
      image: '4.jpeg',
      status: 'ongoing',
    },
    {
      id: 'item-2',
      title: 'Artisan Denim Series',
      subtitle: 'Upcoming',
      description: 'Hand-crafted denim with unique washes',
      image: '5.jpeg',
      status: 'upcoming',
    },
    {
      id: 'item-3',
      title: 'Minimalist Essentials',
      subtitle: 'Concept',
      description: 'Timeless pieces for everyday elegance',
      image: '6.jpeg',
      status: 'concept',
    },
    {
      id: 'item-4',
      title: 'Heritage Prints',
      subtitle: 'Ongoing',
      description: 'Traditional patterns meet modern silhouettes',
      image: '7.jpeg',
      status: 'ongoing',
    },
    {
      id: 'item-5',
      title: 'Urban Explorer',
      subtitle: 'Upcoming',
      description: 'Functional fashion for city adventures',
      image: '8.jpeg',
      status: 'upcoming',
    },
    {
      id: 'item-6',
      title: 'Sustainable Luxe',
      subtitle: 'Concept',
      description: 'Eco-conscious materials with premium feel',
      image: '9.jpeg',
      status: 'concept',
    },
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-500/90 text-white';
      case 'upcoming':
        return 'bg-blue-500/90 text-white';
      case 'concept':
        return 'bg-purple-500/90 text-white';
      default:
        return 'bg-gray-500/90 text-white';
    }
  };

  return (
    <section ref={sectionRef} className="bg-[#fefaf6] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Behind the Scenes</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What's New Cooking</h2>
          <p className="mt-2 text-sm text-gray-600">Ongoing and upcoming creations from our design studio</p>
        </header>

        <div className="relative">
          {/* Horizontal Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {cookingItems.map((item, index) => {
              const delay = isVisible ? `${index * 100}ms` : '0ms';
              return (
                <div
                  key={item.id}
                  className={`group relative flex-shrink-0 w-[280px] sm:w-[320px] overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-700 snap-start hover:shadow-2xl ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: delay }}
                >
                  {/* Image */}
                  <div className="relative h-[360px] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    )}
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-[#d4b896] hover:text-[#b89a7a] transition-colors">
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scroll Indicator */}
          <div className="mt-4 flex justify-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">← Scroll to explore →</p>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default WhatsNewCooking;
