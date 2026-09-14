import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, Mail, Instagram, ArrowRight, Heart } from 'lucide-react';
import { KALA_CONFIG } from '../constants/config';

export const KalaFooter: React.FC = () => {
  return (
    <footer className="bg-[#12110f] text-[#efe8de] border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center p-1 border border-white/20">
                <img
                  src="/kala-logo.png"
                  alt="KALA Logo"
                  className="w-full h-full object-contain filter drop-shadow-xs"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/lo.png';
                  }}
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-black tracking-[0.2em] text-white">
                  KALA
                </span>
                <span className="block font-body text-[8.5px] uppercase tracking-[0.25em] text-[#a0998f]">
                  Originals Studio
                </span>
              </div>
            </Link>

            <p className="font-serif text-lg text-white font-medium italic">
              "Your idea. Your brand. Your identity."
            </p>

            <p className="text-xs text-[#a0998f] leading-relaxed max-w-sm">
              Custom apparel and business branding studio with zero bulk minimums.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://wa.me/${KALA_CONFIG.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#22c55e] text-white flex items-center justify-center transition-colors"
                title={`WhatsApp: ${KALA_CONFIG.phone}`}
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`tel:${KALA_CONFIG.whatsapp}`}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title={`Phone: ${KALA_CONFIG.phone}`}
                aria-label="Phone"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${KALA_CONFIG.email}`}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#8a4f35] text-white flex items-center justify-center transition-colors"
                title={`Email: ${KALA_CONFIG.email}`}
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={KALA_CONFIG.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-orange-500 text-white flex items-center justify-center transition-colors"
                title="Instagram: @kala_originals"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#a0998f]">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">Shop Catalog</Link>
              </li>
              <li>
                <Link to="/custom-apparel" className="hover:text-white transition-colors">Custom Apparel</Link>
              </li>
              <li>
                <Link to="/business-branding" className="hover:text-white transition-colors">Business Branding</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                  <span>My Wishlist</span>
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">My Orders & Tracking</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-white">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#a0998f]">
              <li>
                <Link to="/shop?collection=Streetwear" className="hover:text-white transition-colors">Streetwear Oversized Tees</Link>
              </li>
              <li>
                <Link to="/shop?collection=Gaming" className="hover:text-white transition-colors">Esports & Gaming Jerseys</Link>
              </li>
              <li>
                <Link to="/shop?collection=Gym" className="hover:text-white transition-colors">Gymwear & Training Sets</Link>
              </li>
              <li>
                <Link to="/business-branding" className="hover:text-white transition-colors">Kraft Paper Carry Bags</Link>
              </li>
              <li>
                <Link to="/business-branding" className="hover:text-white transition-colors">Staff Uniform Polos & Caps</Link>
              </li>
              <li>
                <Link to="/book-meeting" className="hover:text-white transition-colors font-semibold text-emerald-400">Book Meeting Consultation</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-white">
              Studio Contact
            </h4>
            <p className="text-xs text-[#a0998f] leading-relaxed">
              Questions about custom printing, sizing, or bulk orders?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-kala-emerald hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              <span>Contact KALA Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="pt-2 text-xs text-[#a0998f] space-y-1">
              <p><span className="font-semibold text-white">WhatsApp / Call:</span> {KALA_CONFIG.phone}</p>
              <p><span className="font-semibold text-white">Email:</span> {KALA_CONFIG.email}</p>
              <p><span className="font-semibold text-white">Dispatch:</span> Bilaspur & Pan-India</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a0998f]">
          <p>
            &copy; {new Date().getFullYear()} KALA Originals Studio. All rights reserved. Made in India.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link>
            <Link to="/about" className="hover:text-white transition-colors">About KALA</Link>
            <Link to="/admin" className="text-white/30 hover:text-white/80 transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default KalaFooter;
