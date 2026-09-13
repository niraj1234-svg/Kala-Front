import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle2, Shirt, ArrowRight } from 'lucide-react';
import { KALA_CONFIG } from '../constants/config';

interface CustomApparelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductType?: string;
}

const APPAREL_TYPES = [
  'T-Shirt',
  'Oversized T-Shirt',
  'Esports Jersey',
  'Hoodie',
  'Polo T-Shirt',
  'Cap',
  'Tote Bag',
  'Other'
];

const PRINT_PLACEMENTS = [
  'Front Only',
  'Back Only',
  'Front + Back',
  'Left Chest + Back',
  'Sleeve + Chest',
  'All-Over Sublimation'
];

export const CustomApparelOrderModal: React.FC<CustomApparelOrderModalProps> = ({
  isOpen,
  onClose,
  initialProductType,
}) => {
  const [productType, setProductType] = useState(initialProductType || 'Oversized T-Shirt');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizes, setSizes] = useState<string>('L');
  const [color, setColor] = useState<string>('Black');
  const [placement, setPlacement] = useState<string>('Front + Back');
  const [ideaDescription, setIdeaDescription] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !email) {
      alert('Please fill out your contact name, phone, and email.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `KALA-CUSTOM-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Save locally to kala_custom_requests
      try {
        const existing = JSON.parse(localStorage.getItem('kala_custom_requests') || '[]');
        existing.unshift({
          id: generatedId,
          productType,
          quantity,
          sizes,
          color,
          placement,
          ideaDescription,
          customerName,
          phone,
          email,
          fileName,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('kala_custom_requests', JSON.stringify(existing));
      } catch (err) {
        console.error(err);
      }

      setIsSubmitting(false);
      setSubmittedRequestId(generatedId);
    }, 600);
  };

  const handleReset = () => {
    setSubmittedRequestId(null);
    setIdeaDescription('');
    setFilePreview(null);
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
                <div className="w-10 h-10 rounded-xl bg-kala-emerald/10 text-kala-emerald dark:text-emerald-400 flex items-center justify-center">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-black uppercase tracking-wide text-foreground">
                    Create Your Custom Apparel
                  </h2>
                  <p className="text-xs text-mid">
                    Direct studio ordering &bull; Zero bulk minimums &bull; Custom graphics & prints
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
              {submittedRequestId ? (
                /* Success State */
                <div className="text-center py-8 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-kala-emerald dark:text-emerald-400">
                      Request Received ✓
                    </span>
                    <h3 className="font-serif text-3xl font-black uppercase text-foreground">
                      Thanks for sharing your idea!
                    </h3>
                    <p className="text-sm text-mid max-w-md mx-auto leading-relaxed">
                      The KALA team will review your requirements, verify print specs, and contact you directly on WhatsApp or email with digital proof mockups.
                    </p>
                  </div>

                  <div className="bg-background border border-border rounded-2xl p-4 max-w-sm mx-auto space-y-1">
                    <span className="text-[10px] font-mono text-mid uppercase tracking-widest block">
                      Custom Request ID
                    </span>
                    <span className="font-mono text-lg font-black text-foreground">
                      {submittedRequestId}
                    </span>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${KALA_CONFIG.whatsapp}?text=Hi%20KALA%2C%20I%20just%20submitted%20custom%20apparel%20request%20${submittedRequestId}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Chat with KALA on WhatsApp ↗
                    </a>
                    <button
                      onClick={handleReset}
                      className="w-full sm:w-auto px-6 py-3 bg-background border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Done & Continue
                    </button>
                  </div>
                </div>
              ) : (
                /* Form State */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* What do you want? */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      1. What do you want to create?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {APPAREL_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setProductType(type)}
                          className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                            productType === type
                              ? 'bg-kala-emerald text-white border-kala-emerald shadow-xs'
                              : 'bg-background border-border text-mid hover:text-foreground hover:border-foreground/30'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity & Size requirements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Estimated Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                        required
                      />
                      <span className="text-[10px] text-mid">No minimum limit (1 piece welcomed).</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Sizes Needed
                      </label>
                      <input
                        type="text"
                        value={sizes}
                        onChange={(e) => setSizes(e.target.value)}
                        placeholder="e.g. 1x L, or 5x M, 10x XL"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                        required
                      />
                    </div>
                  </div>

                  {/* Color & Print Placement */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Base Apparel Colour
                      </label>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="e.g. Jet Black, Vintage Cream, Forest Green"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Print Placement
                      </label>
                      <select
                        value={placement}
                        onChange={(e) => setPlacement(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                      >
                        {PRINT_PLACEMENTS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Design Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      Upload Design, Reference, or Logo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-border hover:border-kala-emerald/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-background/50 relative">
                      <input
                        type="file"
                        accept="image/*,.pdf,.ai,.psd"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-mid mx-auto mb-1" />
                      <p className="text-xs font-bold text-foreground">
                        {fileName ? fileName : 'Click or drag artwork here'}
                      </p>
                      <p className="text-[10px] text-mid mt-0.5">
                        PNG, JPG, Vector SVG, or PDF (high resolution preferred)
                      </p>
                    </div>
                    {filePreview && (
                      <div className="mt-2 flex items-center gap-3 p-2 bg-background border border-border rounded-xl">
                        <img
                          src={filePreview}
                          alt="Uploaded preview"
                          className="w-12 h-12 object-contain rounded-lg border border-border"
                        />
                        <span className="text-xs text-mid font-mono truncate">{fileName}</span>
                      </div>
                    )}
                  </div>

                  {/* Describe idea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      Describe your idea or special instructions
                    </label>
                    <textarea
                      rows={3}
                      value={ideaDescription}
                      onChange={(e) => setIdeaDescription(e.target.value)}
                      placeholder="Tell us what you want printed, text slogans, fabric thickness (GSM), or special branding tags..."
                      className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald resize-none"
                    />
                  </div>

                  {/* Customer Information */}
                  <div className="border-t border-border pt-4 space-y-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-mid block">
                      Your Contact Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone / WhatsApp"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Processing Request...</span>
                      ) : (
                        <>
                          <span>Submit Custom Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-mid mt-2">
                      Our design team reviews artwork for free and will confirm exact mockups before any payment.
                    </p>
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

export default CustomApparelOrderModal;
