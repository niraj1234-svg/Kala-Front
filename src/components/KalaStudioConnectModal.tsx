import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Mail, Instagram, ArrowUpRight, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KalaStudioConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KalaStudioConnectModal: React.FC<KalaStudioConnectModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    window.open('https://wa.me/919406030116', '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    window.location.href = 'tel:+919406030116';
  };

  const handleEmail = () => {
    window.location.href = 'mailto:KalaOriginals@gmail.com';
  };

  const handleInstagram = () => {
    window.open('https://www.instagram.com/kala_originals/', '_blank', 'noopener,noreferrer');
  };

  const handleOrderForm = () => {
    onClose();
    navigate('/custom-apparel');
  };

  const handleBookMeeting = () => {
    onClose();
    navigate('/book-meeting');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-[#f5f4ef] dark:bg-[#181614] text-[#1c1a17] dark:text-[#efe8de] rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#e6e2dc] dark:border-white/10 z-10 my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-mid hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-7 pt-1">
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#8a4f35] dark:text-[#d28c6e] block mb-2">
                KALA STUDIO CONNECT
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-foreground uppercase leading-[1.05]">
                START YOUR CONVERSATION
              </h2>
              <p className="font-body text-xs sm:text-sm text-mid mt-3 max-w-md mx-auto leading-relaxed">
                Reach us directly for custom orders, bulk quotes, or branding consultations.
              </p>
            </div>

            {/* 4 Contact Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {/* WhatsApp Card */}
              <button
                onClick={handleWhatsApp}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer"
              >
                <div className="mb-2 transition-transform group-hover:scale-110">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <span className="font-serif text-lg font-bold tracking-tight">WhatsApp Chat</span>
                <span className="text-xs font-semibold opacity-95 mt-0.5">9406030116</span>
              </button>

              {/* Call Us Card */}
              <button
                onClick={handleCall}
                className="bg-[#1c1a17] hover:bg-black text-white p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer"
              >
                <div className="mb-2 transition-transform group-hover:scale-110">
                  <Phone className="w-7 h-7" />
                </div>
                <span className="font-serif text-lg font-bold tracking-tight">Call Us</span>
                <span className="text-xs font-semibold opacity-95 mt-0.5">9406030116</span>
              </button>

              {/* Email Inquiries Card */}
              <button
                onClick={handleEmail}
                className="bg-[#78442a] hover:bg-[#633721] text-white p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer"
              >
                <div className="mb-2 transition-transform group-hover:scale-110">
                  <Mail className="w-7 h-7" />
                </div>
                <span className="font-serif text-lg font-bold tracking-tight">Email Inquiries</span>
                <span className="text-xs font-semibold opacity-95 mt-0.5 truncate max-w-full">KalaOriginals@gmail.com</span>
              </button>

              {/* Instagram DM Card */}
              <button
                onClick={handleInstagram}
                className="bg-gradient-to-r from-[#9b1d96] via-[#d6249f] to-[#fd5949] hover:opacity-95 text-white p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer"
              >
                <div className="mb-2 transition-transform group-hover:scale-110">
                  <Instagram className="w-7 h-7" />
                </div>
                <span className="font-serif text-lg font-bold tracking-tight">Instagram DM</span>
                <span className="text-xs font-semibold opacity-95 mt-0.5">@kala_originals</span>
              </button>
            </div>

            {/* Direct Submission Box */}
            <div className="bg-white/60 dark:bg-black/30 border border-border/80 rounded-xl p-5 text-center mb-5">
              <p className="text-xs font-bold text-foreground mb-3.5">
                Prefer submitting your specifications directly?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleOrderForm}
                  className="w-full py-3 bg-[#1c1a17] hover:bg-black text-white rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>ORDER FORM</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleBookMeeting}
                  className="w-full py-3 bg-[#78442a] hover:bg-[#633721] text-white rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>BOOK A MEETING</span>
                </button>
              </div>
            </div>

            {/* Footer Notice */}
            <p className="text-[11px] text-mid text-center font-mono">
              Typically responded to within 1–2 hours on WhatsApp.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KalaStudioConnectModal;
