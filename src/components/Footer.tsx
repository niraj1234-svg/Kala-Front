import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

type FooterSection = {
  title: string;
  links: { label: string; href: string }[];
};

const Footer: React.FC = () => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const footerSections: FooterSection[] = [
    {
      title: 'Policies',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Shipping Policy', href: '/shipping-policy' },
        { label: 'Terms & Conditions', href: '/terms-conditions' },
        { label: 'Return & Exchange', href: '/return-exchange' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'Express Delivery', href: '/express-delivery' },
        { label: 'Custom Tailoring', href: '/customization' },
        { label: 'Gift Cards', href: '/gift-cards' },
        { label: 'Track Order', href: '/track-order' },
      ],
    },
    {
      title: 'Content',
      links: [
        { label: 'Newsletter', href: '/newsletter' },
        { label: 'Blog', href: '/blog' },
        { label: 'Vlog', href: '/vlog' },
        { label: 'Photoshoot Gallery', href: '/photoshoot' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press Kit', href: '/press' },
        { label: 'Sustainability', href: '/sustainability' },
      ],
    },
  ];

  return (
    <footer className="bg-[#5c4734] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Top Section - Brand */}
        <div className="mb-12 text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Appral</h2>
          <p className="text-sm text-white/80 max-w-md mx-auto lg:mx-0">
            Crafting timeless fashion with attention to detail and sustainable practices.
          </p>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title} className="border-b border-white/10 pb-4 lg:border-b-0 lg:pb-0">
              {/* Mobile Accordion Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full text-left lg:cursor-default"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 lg:mb-4">
                  {section.title}
                </h3>
                <span className="lg:hidden">
                  {openSections.has(section.title) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              </button>

              {/* Links - Collapsible on mobile, always visible on desktop */}
              <ul
                className={`space-y-2 transition-all duration-300 overflow-hidden ${
                  openSections.has(section.title) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 lg:max-h-96 lg:opacity-100'
                }`}
              >
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="max-w-md mx-auto lg:mx-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Stay Updated</h3>
            <p className="text-sm text-white/70 mb-4">
              Subscribe to our newsletter for exclusive offers and style tips.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors text-sm"
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-[#d4b896] hover:bg-[#b89a7a] text-white font-medium transition-colors text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} Appral. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors text-xs uppercase tracking-wider"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors text-xs uppercase tracking-wider"
            >
              Facebook
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors text-xs uppercase tracking-wider"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
