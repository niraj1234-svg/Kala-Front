import React, { useState } from 'react';
import { Package, Sparkles, Shirt, Megaphone, CheckCircle2, Calendar, PhoneCall, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatHappensNextSlider from '../components/WhatHappensNextSlider';
import BakeryCaseStudy from '../components/BakeryCaseStudy';
import BusinessEnquiryModal from '../components/BusinessEnquiryModal';

const SERVICES = [
  {
    category: 'Packaging',
    icon: Package,
    description: 'Carry bags, boxes, tape, and labels that elevate unboxing.',
    items: [
      'Thank-you cards',
      'Carry bags (Kraft & Bleached)',
      'Die-cut & roll stickers',
      'Bottle & jar labels',
      'Rigid & corrugated boxes',
      'Custom product packaging'
    ]
  },
  {
    category: 'Brand Identity',
    icon: Sparkles,
    description: 'Logos, typography, color palettes, and brand guidelines.',
    items: [
      'Logo design & marks',
      'Complete brand identity systems',
      'Visual identity & font pairings',
      'Brand style guidelines',
      'Packaging design templates',
      'Social media brand kit'
    ]
  },
  {
    category: 'Business Merchandise',
    icon: Shirt,
    description: 'Staff polos, heavy crew necks, aprons, and branded caps.',
    items: [
      'Staff pique polo T-shirts',
      'Heavy cotton crew neck tees',
      'Embroidered work aprons',
      'Custom structured caps',
      'Canvas tote bags',
      'Customer promotional merchandise'
    ]
  },
  {
    category: 'Marketing Materials',
    icon: Megaphone,
    description: 'Posters, menu designs, flyers, and 450 GSM business cards.',
    items: [
      'Storefront & event posters',
      'Cafe & restaurant menu designs',
      'Promotional creatives',
      'Social media graphics',
      'Laminated flyers & leaflets',
      'Heavy 450 GSM business cards'
    ]
  }
];

export const BusinessBrandingPage: React.FC = () => {
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-20 sm:mb-28">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8a4f35]/10 border border-[#8a4f35]/20 text-[#8a4f35] dark:text-[#d28c6e] text-xs font-bold uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5" />
            <span>BUSINESS BRANDING</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-black uppercase text-foreground leading-[0.95]">
            Build Your Brand
          </h1>

          <p className="font-serif text-2xl sm:text-3xl italic text-foreground/85 font-normal">
            "Your shop deserves to be a brand."
          </p>

          <p className="text-sm sm:text-base text-mid max-w-2xl mx-auto leading-relaxed">
            Turn your business into a recognizable brand with custom packaging, uniforms, and print collateral.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-[#8a4f35] hover:bg-[#703b25] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <span>Start Business Enquiry</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/book-meeting"
              className="w-full sm:w-auto px-8 py-4 bg-card border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Consultation</span>
            </Link>
          </div>
        </div>

        {/* WHAT WE CAN CREATE — 4 Comprehensive Services Cards */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400 block mb-2">
              COMPREHENSIVE CAPABILITIES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase text-foreground">
              What We Can Create
            </h2>
            <p className="text-sm text-mid mt-2">
              Packaging, staff uniforms, and brand collateral.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map((srv, idx) => {
              const ServiceIcon = srv.icon;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-kala-emerald/10 text-kala-emerald dark:text-emerald-400 flex items-center justify-center">
                      <ServiceIcon className="w-7 h-7" />
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground uppercase">
                      {srv.category}
                    </h3>

                    <p className="text-xs sm:text-sm text-mid leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="pt-4 border-t border-border">
                      <p className="text-xs font-mono font-bold uppercase tracking-wider text-kala-earth dark:text-kala-accent mb-3">
                        Deliverables Include:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {srv.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-kala-emerald shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-6">
                    <button
                      onClick={() => setIsEnquiryModalOpen(true)}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-kala-emerald dark:text-emerald-400 hover:underline"
                    >
                      <span>Inquire for {srv.category} &rarr;</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* WHAT HAPPENS NEXT? SECTION */}
      <WhatHappensNextSlider />

      {/* CASE STUDY SECTION — BRAND CONCEPT: THE BAKERY HOUSE */}
      <BakeryCaseStudy />

      {/* CALL TO ACTION */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center bg-card border border-border rounded-3xl p-10 sm:p-16 space-y-6">
        <Building2 className="w-10 h-10 text-[#8a4f35] dark:text-[#d28c6e] mx-auto" />
        <h2 className="font-serif text-3xl sm:text-5xl font-black uppercase text-foreground">
          Ready to turn your shop into a recognized brand?
        </h2>
        <p className="text-sm sm:text-base text-mid max-w-xl mx-auto">
          Book a 1-on-1 consultation to evaluate your branding and packaging.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/book-meeting"
            className="w-full sm:w-auto px-8 py-4 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Book A Brand Meeting</span>
          </Link>
          <a
            href="https://wa.me/919406030116"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-card border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Chat On WhatsApp (9406030116)</span>
          </a>
        </div>
      </div>

      {/* Native Business Enquiry Modal */}
      <BusinessEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
      />
    </div>
  );
};

export default BusinessBrandingPage;
