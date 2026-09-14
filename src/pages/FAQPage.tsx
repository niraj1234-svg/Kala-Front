import React, { useState } from 'react';
import { ChevronDown, MessageCircle, ArrowUpRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FAQS } from '../constants/faqs';

export const FAQPage: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(1);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'General', 'Apparel', 'Branding', 'Printing', 'Orders', 'Packaging'];

  const filteredFaqs = FAQS.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400 block">
            HELP & KNOWLEDGE BASE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black uppercase text-foreground leading-[1]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-mid max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our custom printing techniques, turnaround times, zero minimum orders, and business branding.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-kala-emerald text-white border-kala-emerald shadow-xs'
                  : 'bg-card border-border hover:border-foreground/40 text-mid'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-colors shadow-xs"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-serif text-base sm:text-lg font-bold text-foreground"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-kala-emerald dark:text-emerald-400 font-bold shrink-0">
                      {String(faq.id).padStart(2, '0')}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 text-mid transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-mid leading-relaxed border-t border-border/50">
                    <p>{faq.answer}</p>
                    {faq.id === 15 && (
                      <div className="mt-4">
                        <Link
                          to="/custom-apparel"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-kala-emerald text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-kala-emerald/90 transition-colors"
                        >
                          <span>Open Custom Studio</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-16 bg-card border border-border rounded-3xl p-8 sm:p-10 text-center space-y-4">
          <HelpCircle className="w-8 h-8 text-kala-emerald dark:text-emerald-400 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-foreground">
            Still have a question?
          </h3>
          <p className="text-xs sm:text-sm text-mid max-w-md mx-auto">
            Our team is available on WhatsApp at 9406030116. We usually reply within 1–2 hours.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/919406030116"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
