import React from 'react';
import { Phone, Mail, MessageCircle, Instagram, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { KALA_CONFIG } from '../constants/config';

type ContactMethod = {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  action: string;
  color: string;
};

interface ContactUsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ isOpen, onClose }) => {
  const contactMethods: ContactMethod[] = [
    {
      id: 'call',
      icon: <Phone className="w-8 h-8" />,
      label: 'Call Us',
      value: KALA_CONFIG.phone,
      action: `tel:${KALA_CONFIG.whatsapp}`,
      color: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      id: 'email',
      icon: <Mail className="w-8 h-8" />,
      label: 'Email',
      value: KALA_CONFIG.email,
      action: `mailto:${KALA_CONFIG.email}`,
      color: 'bg-[#8a4f35] hover:bg-[#723f2a]',
    },
    {
      id: 'whatsapp',
      icon: <MessageCircle className="w-8 h-8" />,
      label: 'WhatsApp',
      value: KALA_CONFIG.phone,
      action: `https://wa.me/${KALA_CONFIG.whatsapp}`,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'instagram',
      icon: <Instagram className="w-8 h-8" />,
      label: 'Instagram',
      value: '@kala_originals',
      action: KALA_CONFIG.social.instagram,
      color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:opacity-90',
    },
  ];

  const handleContact = (method: ContactMethod) => {
    if (method.action.startsWith('http')) {
      window.open(method.action, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = method.action;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h2>
                <p className="text-sm text-gray-600">Choose your preferred way to reach us</p>
              </div>

              {/* Contact Methods Grid */}
              <div className="grid grid-cols-2 gap-4">
                {contactMethods.map((method, index) => (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleContact(method)}
                    className={`${method.color} text-white rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
                  >
                    <div className="bg-white/20 rounded-full p-3">
                      {method.icon}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">{method.label}</p>
                      <p className="text-xs opacity-90 mt-1">{method.value}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  Quick response within 1–2 hours
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactUs;
