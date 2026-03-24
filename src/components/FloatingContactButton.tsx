import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ContactUs from './ContactUs';

const FloatingContactButton: React.FC = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      {/* Floating Contact Button - Hidden on mobile (BottomBar handles it) */}
      <button
        onClick={() => setIsContactOpen(true)}
        className="hidden sm:flex fixed bottom-6 right-6 z-40 items-center justify-center w-14 h-14 bg-[#7f6254] hover:bg-[#523f31] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Contact Us"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <ContactUs isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
};

export default FloatingContactButton;
