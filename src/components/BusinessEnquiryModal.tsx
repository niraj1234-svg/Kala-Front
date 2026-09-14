import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, CheckCircle2, Upload, ArrowRight } from 'lucide-react';
import { KALA_CONFIG } from '../constants/config';

interface BusinessEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BRAND_SERVICES = [
  'Retail Carry Bags (Kraft/Bleached)',
  'Packaging & Delivery Boxes',
  'Die-Cut Stickers & Seals',
  'Bottle / Jar Labels',
  'Thank-You & Post-Purchase Cards',
  'Logo & Brand Identity Design',
  'Staff Pique Polo T-Shirts',
  'Work Aprons & Uniforms',
  'Structured Caps & Headwear',
  'Promotional Tote Bags',
  'Storefront & Event Posters',
  'Cafe & Restaurant Menus',
  'Social Media Creatives & Kit',
  'Premium 450 GSM Business Cards'
];

export const BusinessEnquiryModal: React.FC<BusinessEnquiryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Cafe / Bakery');
  const [currentBranding, setCurrentBranding] = useState('Have existing logo, need print production');
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Retail Carry Bags (Kraft/Bleached)',
    'Thank-You & Post-Purchase Cards',
    'Staff Pique Polo T-Shirts'
  ]);
  const [estimatedQuantity, setEstimatedQuantity] = useState('100–250 units');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string | null>(null);

  const toggleService = (srv: string) => {
    setSelectedServices(prev =>
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !contactPerson || !phone || !email) {
      alert('Please fill in your business name, contact person, phone, and email.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `KALA-BIZ-${Math.floor(10000 + Math.random() * 90000)}`;

      try {
        const existing = JSON.parse(localStorage.getItem('kala_business_enquiries') || '[]');
        existing.unshift({
          id: generatedId,
          businessName,
          contactPerson,
          phone,
          email,
          category,
          currentBranding,
          selectedServices,
          estimatedQuantity,
          description,
          fileName,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('kala_business_enquiries', JSON.stringify(existing));
      } catch (err) {
        console.error(err);
      }

      setIsSubmitting(false);
      setSubmittedEnquiryId(generatedId);
    }, 600);
  };

  const handleReset = () => {
    setSubmittedEnquiryId(null);
    setDescription('');
    setFileName('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="relative bg-card border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 my-8 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-border flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#8a4f35]/10 text-[#8a4f35] dark:text-[#d28c6e] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-black uppercase tracking-wide text-foreground">
                    Start Your Brand Project
                  </h2>
                  <p className="text-xs text-mid">
                    Transform your shop into a recognizable brand &bull; Custom packaging, apparel & print
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-mid hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
              {submittedEnquiryId ? (
                /* Success Screen */
                <div className="text-center py-8 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[#8a4f35]/15 text-[#8a4f35] dark:text-[#d28c6e] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8a4f35] dark:text-[#d28c6e]">
                      Enquiry Received ✓
                    </span>
                    <h3 className="font-serif text-3xl font-black uppercase text-foreground">
                      We look forward to collaborating!
                    </h3>
                    <p className="text-sm text-mid max-w-md mx-auto leading-relaxed">
                      Our brand studio team has received your business project requirements. We will prepare an initial proposal and connect with you on WhatsApp/phone.
                    </p>
                  </div>

                  <div className="bg-background border border-border rounded-2xl p-4 max-w-sm mx-auto space-y-1">
                    <span className="text-[10px] font-mono text-mid uppercase tracking-widest block">
                      Brand Project ID
                    </span>
                    <span className="font-mono text-lg font-black text-foreground">
                      {submittedEnquiryId}
                    </span>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${KALA_CONFIG.whatsapp}?text=Hi%20KALA%2C%20I%20just%20submitted%20brand%20project%20enquiry%20${submittedEnquiryId}%20for%20${encodeURIComponent(businessName)}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-6 py-3 bg-[#8a4f35] hover:bg-[#723f2a] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Chat with Studio Lead on WhatsApp ↗
                    </a>
                    <button
                      onClick={handleReset}
                      className="w-full sm:w-auto px-6 py-3 bg-background border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Screen */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Business & Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Business / Store Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. The Bakehouse Cafe, Aura Boutique"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#8a4f35]"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#8a4f35]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 9XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#8a4f35]"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Business Email
                      </label>
                      <input
                        type="email"
                        placeholder="contact@yourbusiness.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#8a4f35]"
                        required
                      />
                    </div>
                  </div>

                  {/* Category & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Business Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#8a4f35]"
                      >
                        <option value="Cafe / Bakery / Restaurant">Cafe / Bakery / Restaurant</option>
                        <option value="Retail Boutique / Clothing">Retail Boutique / Clothing</option>
                        <option value="Beauty / Salon / Wellness">Beauty / Salon / Wellness</option>
                        <option value="Gym / Fitness / Sports Center">Gym / Fitness / Sports Center</option>
                        <option value="Startup / Tech / Corporate">Startup / Tech / Corporate</option>
                        <option value="College / University / School">College / University / School</option>
                        <option value="Other">Other Business</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Current Branding Status
                      </label>
                      <select
                        value={currentBranding}
                        onChange={(e) => setCurrentBranding(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#8a4f35]"
                      >
                        <option value="Have existing logo, need print production">Have existing logo, need print production</option>
                        <option value="Need brand redesign & new print assets">Need brand redesign & new print assets</option>
                        <option value="Starting brand from scratch">Starting brand from scratch</option>
                      </select>
                    </div>
                  </div>

                  {/* Services Required Multi-select */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      Services Required (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-border rounded-2xl bg-background/50">
                      {BRAND_SERVICES.map((srv) => {
                        const isChecked = selectedServices.includes(srv);
                        return (
                          <label
                            key={srv}
                            onClick={() => toggleService(srv)}
                            className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                              isChecked
                                ? 'bg-[#8a4f35]/15 text-[#8a4f35] dark:text-[#d28c6e] font-semibold'
                                : 'hover:bg-black/5 dark:hover:bg-white/5 text-mid'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-[#8a4f35] rounded"
                            />
                            <span>{srv}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Estimated Quantity & Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Estimated Batch Quantity
                      </label>
                      <select
                        value={estimatedQuantity}
                        onChange={(e) => setEstimatedQuantity(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#8a4f35]"
                      >
                        <option value="25–50 units (Sample / Pilot)">25–50 units (Sample / Pilot)</option>
                        <option value="100–250 units (Standard Batch)">100–250 units (Standard Batch)</option>
                        <option value="500–1000 units (Volume Production)">500–1000 units (Volume Production)</option>
                        <option value="1000+ units (Enterprise)">1000+ units (Enterprise)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Upload Logo / Concept (Optional)
                      </label>
                      <div className="border border-dashed border-border hover:border-[#8a4f35]/60 rounded-xl p-2.5 text-center cursor-pointer transition-colors bg-background/50 relative">
                        <input
                          type="file"
                          accept="image/*,.pdf,.ai,.eps,.svg"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex items-center justify-center gap-2 text-xs text-mid">
                          <Upload className="w-3.5 h-3.5 text-[#8a4f35]" />
                          <span className="truncate max-w-[180px] font-mono">
                            {fileName ? fileName : 'Upload files (PDF, SVG, PNG)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      Tell us about your brand vision
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Share your goals, current aesthetic challenges, timeline, or specific items you need help with..."
                      className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#8a4f35] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#8a4f35] hover:bg-[#723f2a] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Submitting Project...</span>
                      ) : (
                        <>
                          <span>Submit Brand Project Enquiry</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BusinessEnquiryModal;
