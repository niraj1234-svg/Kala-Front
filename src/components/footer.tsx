import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1: Shop */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Shop</h3>
            <ul className="space-y-3">
              <li>
                <a href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  All Products
                </a>
              </li>
              <li>
                <a href="/products/new" className="text-gray-400 hover:text-white transition-colors text-sm">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="/products/sale" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sale
                </a>
              </li>
              <li>
                <a href="/collections" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Collections
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Journal
                </a>
              </li>
              <li>
                <a href="/sustainability" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sustainability
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/help" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="/returns" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Returns
                </a>
              </li>
              <li>
                <a href="/size-guide" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Size Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get special offers and updates
            </p>
            <form className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:opacity-70 transition-opacity"
                >
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Social Media */}
            <div className="mt-8">
              <h4 className="text-xs uppercase tracking-widest mb-4 text-gray-500">Follow Us</h4>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10"></div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Copyright */}
          <div className="text-sm text-gray-400">
            © {currentYear} Raiments. All rights reserved.
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">We Accept</span>
            <div className="flex gap-2">
              <div className="w-10 h-7 bg-white/10 border border-white/20 rounded flex items-center justify-center">
                <svg className="w-6 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.265 0l-6.53 24h3.51l6.53-24zm-7.792 5.87l-4.473 12.26h3.654l.84-2.362h4.63l.543 2.362h4.052l-3.885-12.26zm-1.53 7.244l1.658-4.67.93 4.67z"/>
                </svg>
              </div>
              <div className="w-10 h-7 bg-white/10 border border-white/20 rounded flex items-center justify-center text-xs font-bold">
                MC
              </div>
              <div className="w-10 h-7 bg-white/10 border border-white/20 rounded flex items-center justify-center">
                <svg className="w-6 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.743-4.462z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;