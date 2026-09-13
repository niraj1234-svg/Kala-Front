import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ArrowUpRight, MessageCircle, Phone, Mail, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionUrl?: string;
  actionLabel?: string;
  timestamp: string;
}

const FAQ_LIST = [
  {
    id: 1,
    q: "What does KALA do?",
    a: "KALA is a creative custom printing and branding studio. We produce custom apparel (T-shirts, hoodies, activewear, jerseys) for individuals, clubs, colleges, and teams, as well as complete brand packages (packaging, carry bags, uniforms, marketing materials) for businesses.",
    actionLabel: "Explore Custom Apparel",
    actionUrl: "/custom-apparel"
  },
  {
    id: 2,
    q: "Do you provide custom T-shirts?",
    a: "Yes! Custom T-shirts are our signature specialty. We offer oversized streetwear tees, regular fit, bio-washed cotton, polo tees, and drop-shoulder silhouettes with high-density screen, puff, and DTF printing.",
    actionLabel: "Browse T-Shirts",
    actionUrl: "/shop?category=Apparel"
  },
  {
    id: 3,
    q: "Can I order a single T-shirt?",
    a: "Yes! We believe personal ideas shouldn't require bulk factory minimums. You can order a single 1-piece custom T-shirt made just for you.",
    actionLabel: "Create 1-Piece Apparel",
    actionUrl: "/custom-apparel"
  },
  {
    id: 4,
    q: "Do you have minimum order quantities?",
    a: "For apparel, there is NO minimum order quantity (MOQ is 1 piece). For specialized business packaging (like custom paper bags or rigid boxes), standard low minimums apply to keep unit prices low.",
    actionLabel: "Book Consultation",
    actionUrl: "/book-meeting"
  },
  {
    id: 5,
    q: "Can I order custom jerseys?",
    a: "Yes! We manufacture sublimated esports, gaming clan, football, cricket, and marathon jerseys with custom gamer tags, numbers, and sponsor logos.",
    actionLabel: "View Gaming Jerseys",
    actionUrl: "/custom-apparel"
  },
  {
    id: 6,
    q: "Can I provide my own design?",
    a: "Absolutely. You can upload your artwork, vector logo, or PNG directly in our order form or share it with us on WhatsApp. Our team checks resolution and print-readiness.",
    actionLabel: "Submit Your Artwork",
    actionUrl: "/custom-apparel"
  },
  {
    id: 7,
    q: "Can KALA create the design for me?",
    a: "Yes! If you only have a concept or rough sketch, our in-house designers will work with you to turn it into an editorial, production-ready graphic.",
    actionLabel: "Start Design Consultation",
    actionUrl: "/book-meeting"
  },
  {
    id: 8,
    q: "Do you print logos?",
    a: "Yes, we print crisp vector logos across all apparel, workwear, tote bags, caps, coffee cups, packaging labels, and stickers.",
    actionLabel: "Business Branding",
    actionUrl: "/business-branding"
  },
  {
    id: 9,
    q: "Do you provide embroidery?",
    a: "Yes, we offer precision flat embroidery and 3D puff embroidery for polo collars, chest crests, hoodies, and caps.",
    actionLabel: "Custom Merch",
    actionUrl: "/shop"
  },
  {
    id: 10,
    q: "What products can I customize?",
    a: "You can customize oversized tees, graphic streetwear, gym wear, esports jerseys, hoodies, tote bags, caps, thank-you cards, paper bags, die-cut stickers, and business packaging.",
    actionLabel: "Explore Full Catalog",
    actionUrl: "/shop"
  },
  {
    id: 11,
    q: "Do you provide college/team merchandise?",
    a: "Yes! We work extensively with university departments, college fests, student clubs, and sports teams across India with volume discounts.",
    actionLabel: "College Merch Inquiry",
    actionUrl: "/custom-apparel"
  },
  {
    id: 12,
    q: "Do you handle business branding?",
    a: "Yes! We transform local shops, cafes, bakeries, and startups into recognizable brands with matching packaging, staff apparel, and visual identity.",
    actionLabel: "Explore Business Branding",
    actionUrl: "/business-branding"
  },
  {
    id: 13,
    q: "Can you create packaging for my business?",
    a: "Yes. We create custom kraft carry bags, product labels, thank-you cards, shipping box seals, and branded packaging tape.",
    actionLabel: "View Packaging Services",
    actionUrl: "/business-branding"
  },
  {
    id: 14,
    q: "Can you create staff uniforms?",
    a: "Yes, we supply coordinated staff apparel including embroidered polo shirts, branded aprons, caps, and comfort work tees.",
    actionLabel: "Staff Uniform Quote",
    actionUrl: "/book-meeting"
  },
  {
    id: 15,
    q: "How do I place an order?",
    a: "You can browse our catalog, select size and color, and click 'Add to Cart' or 'Buy Now'. You can also submit custom apparel ideas directly on our website.",
    actionLabel: "Browse KALA Shop",
    actionUrl: "/shop"
  },
  {
    id: 16,
    q: "How can I contact KALA?",
    a: "You can reach us on WhatsApp at 9406030116, call us at 9406030116, email KalaOriginals@gmail.com, or DM on Instagram @kala_originals.",
    actionLabel: "Chat on WhatsApp",
    actionUrl: "https://wa.me/919406030116"
  },
  {
    id: 17,
    q: "How long does an order take?",
    a: "Standard custom apparel orders are printed and dispatched within 3–7 business days. Bulk orders are scheduled during your initial consultation.",
    actionLabel: "Order Status / FAQ",
    actionUrl: "/faq"
  },
  {
    id: 18,
    q: "Can I request a bulk order?",
    a: "Yes! We offer tiered wholesale pricing for bulk runs of 25+, 50+, 100+, or 500+ units. Fill out the order form or book a consultation.",
    actionLabel: "Submit Custom Request",
    actionUrl: "/custom-apparel"
  },
  {
    id: 19,
    q: "Can I book a consultation?",
    a: "Yes! You can use our Book a Meeting calendar directly on this website to pick your preferred date and time for a brand or merchandise session.",
    actionLabel: "Book a Meeting",
    actionUrl: "/book-meeting"
  },
  {
    id: 20,
    q: "Where can I find KALA on Instagram?",
    a: "You can follow our latest design drops, printing videos, and customer showcases at @kala_originals on Instagram.",
    actionLabel: "Visit Instagram",
    actionUrl: "https://www.instagram.com/kala_originals/"
  }
];

export const KalaChatbot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! Welcome to KALA Studio. Tap any question below or ask how we can help design and print your ideas today.',
      timestamp: 'Just now'
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSelectFaq = (faq: typeof FAQ_LIST[0]) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: faq.q,
      timestamp: 'Just now'
    };

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: faq.a,
      actionLabel: faq.actionLabel,
      actionUrl: faq.actionUrl,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const handleActionClick = (url?: string) => {
    if (!url) return;
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setIsOpen(false);
      navigate(url);
    }
  };

  const filteredFaqs = FAQ_LIST.filter(f =>
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 group border-2 border-white/20"
        title="KALA Studio Assistant & FAQs"
        aria-label="Open Chatbot"
      >
        <MessageSquare className="w-6 h-6 transition-transform group-hover:scale-110" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-background rounded-full" />
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[420px] h-[560px] max-h-[80vh] bg-card text-foreground border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-body"
          >
            {/* Header */}
            <div className="bg-kala-emerald text-white p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base tracking-wide uppercase leading-tight">KALA Studio Assistant</h3>
                  <p className="text-[10px] text-emerald-200 tracking-wider">20 FAQs & Instant Quick Connect</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-black/5 dark:bg-white/5 px-3 py-2 border-b border-border flex items-center gap-2 overflow-x-auto text-[11px] font-bold uppercase tracking-wider scrollbar-none">
              <a
                href="https://wa.me/919406030116"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-md hover:bg-emerald-600/20 whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
              <a
                href="tel:+919406030116"
                className="flex items-center gap-1 px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-md hover:bg-black/10 whitespace-nowrap"
              >
                <Phone className="w-3 h-3" /> Call
              </a>
              <a
                href="mailto:KalaOriginals@gmail.com"
                className="flex items-center gap-1 px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-md hover:bg-black/10 whitespace-nowrap"
              >
                <Mail className="w-3 h-3" /> Email
              </a>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/custom-apparel');
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-kala-earth/15 text-kala-earth dark:text-amber-300 rounded-md hover:bg-kala-earth/25 whitespace-nowrap"
              >
                Custom Order ↗
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/book-meeting');
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-md hover:bg-black/10 whitespace-nowrap"
              >
                <Calendar className="w-3 h-3" /> Book Slot
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-kala-emerald text-white rounded-tr-none'
                        : 'bg-black/5 dark:bg-white/10 text-foreground rounded-tl-none border border-border/40'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {msg.actionUrl && (
                      <button
                        onClick={() => handleActionClick(msg.actionUrl)}
                        className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 bg-kala-emerald text-white rounded-md font-bold text-[11px] tracking-wider uppercase hover:opacity-90 transition-opacity"
                      >
                        <span>{msg.actionLabel || 'Learn More'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="text-[9.5px] text-mid mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Predefined FAQ Buttons & Search */}
            <div className="p-3 bg-black/5 dark:bg-white/5 border-t border-border flex flex-col gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter 20 FAQs (e.g. bulk, jersey, pricing)..."
                className="w-full text-xs px-3 py-1.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-kala-emerald text-foreground"
              />

              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {filteredFaqs.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleSelectFaq(faq)}
                    className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md bg-card hover:bg-kala-emerald/10 hover:border-kala-emerald border border-border transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate pr-2 font-medium">{faq.id}. {faq.q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-mid group-hover:text-kala-emerald shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KalaChatbot;
