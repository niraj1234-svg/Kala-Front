import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ArrowRight, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

const PURPOSES = [
  'Custom Apparel / Club Merchandise',
  'Business Branding & Packaging',
  'Bulk Printing Order (25+ units)',
  'Brand Consultation & Strategy',
  'Esports / Team Jersey Design',
  'Other Custom Requirements'
];

export const BookMeetingPage: React.FC = () => {
  // Step state: 1 = Form & Date/Time, 2 = Review, 3 = Confirmed PENDING
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [message, setMessage] = useState('');

  // Date selection (default to tomorrow)
  const tomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(tomorrowStr());
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; isAvailable: boolean }>>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch slot availability whenever date changes
  useEffect(() => {
    async function loadSlots() {
      if (!date) return;
      setIsLoadingSlots(true);
      setErrorMsg('');
      try {
        const res = await api.getMeetingSlots(date);
        setAvailableSlots(res.slots);
        // Pre-select first available slot if previous is unavailable
        const firstAvail = res.slots.find((s) => s.isAvailable);
        if (firstAvail) {
          setSelectedTime(firstAvail.time);
        } else {
          setSelectedTime('');
        }
      } catch (err: any) {
        console.error('Failed to load slots:', err);
        setErrorMsg('Unable to retrieve slots for this date.');
      } finally {
        setIsLoadingSlots(false);
      }
    }
    loadSlots();
  }, [date]);

  // Minimum allowed date is tomorrow
  const minDate = tomorrowStr();

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerEmail.trim() || !phone.trim() || !date || !selectedTime) {
      setErrorMsg('Please complete all required fields and select an available time slot.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.bookMeeting({
        customerName,
        customerEmail,
        phone,
        companyName,
        purpose,
        date,
        time: selectedTime,
        message
      });

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit meeting request. Please try another slot.');
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400 block">
            DIRECT CONSULTATION
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black uppercase text-foreground leading-[1]">
            Book a Meeting
          </h1>
          <p className="text-sm text-mid max-w-xl mx-auto leading-relaxed">
            Schedule a dedicated design and production consultation with KALA Originals Studio. Every slot is reviewed and confirmed personally.
          </p>
        </div>

        {/* Multi-step Container */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-lg">
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border text-xs font-bold uppercase tracking-wider">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-kala-emerald dark:text-emerald-400' : 'text-mid'}`}>
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono">
                1
              </span>
              <span>Details & Slot</span>
            </div>
            <div className="w-8 sm:w-16 h-[1px] bg-border" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-kala-emerald dark:text-emerald-400' : 'text-mid'}`}>
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono">
                2
              </span>
              <span>Review Summary</span>
            </div>
            <div className="w-8 sm:w-16 h-[1px] bg-border" />
            <div className={`flex items-center gap-2 ${step === 3 ? 'text-kala-emerald dark:text-emerald-400' : 'text-mid'}`}>
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono">
                3
              </span>
              <span>Pending Review</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: FORM & DATE/TIME SELECTION */}
          {step === 1 && (
            <form onSubmit={handleProceedToReview} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. aarav@example.com"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    WhatsApp / Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9406030116"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Business / College / Club Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. The Bakery House, Nexus Esports"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                  />
                </div>
              </div>

              {/* Purpose of Meeting */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Purpose of Meeting <span className="text-red-500">*</span>
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Picker & Time Slot Picker */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-border">
                {/* Date Picker */}
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-kala-emerald" />
                    <span>Preferred Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={minDate}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                  />
                  <p className="text-[11px] text-mid">
                    Past dates are disabled. Weekend and weekday consultation slots available.
                  </p>
                </div>

                {/* Time Slots Selector */}
                <div className="md:col-span-7 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-kala-emerald" />
                    <span>Available Time Slot</span>
                  </label>

                  {isLoadingSlots ? (
                    <div className="py-6 text-center text-xs text-mid">Checking available slots...</div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot.time}
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2 px-1 text-xs rounded-lg font-mono transition-all text-center border ${
                            !slot.isAvailable
                              ? 'bg-black/5 dark:bg-white/5 text-mid/50 border-dashed border-border cursor-not-allowed line-through'
                              : selectedTime === slot.time
                              ? 'bg-kala-emerald text-white border-kala-emerald font-bold shadow-xs'
                              : 'bg-background border-border hover:border-foreground/40 text-foreground'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-mid">No slots available for this date.</p>
                  )}
                  <p className="text-[11px] text-mid">
                    Unavailable slots indicate another scheduled consultation to prevent double bookings.
                  </p>
                </div>
              </div>

              {/* Message / Requirements */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Notes & Project Specifications (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details such as estimated quantities, preferred fabric GSM, target delivery date, or questions..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                />
              </div>

              {/* Submit to Review */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  <span>Review Meeting Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW SUMMARY BEFORE SUBMISSION */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-foreground">Review Your Specifications</h3>
                <p className="text-xs text-mid">
                  Please verify your meeting details before dispatching the request to KALA Studio.
                </p>
              </div>

              <div className="bg-background border border-border rounded-2xl p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-mid uppercase font-mono block">Customer Name</span>
                    <span className="font-bold text-sm text-foreground">{customerName}</span>
                  </div>
                  <div>
                    <span className="text-mid uppercase font-mono block">Email Address</span>
                    <span className="font-bold text-sm text-foreground">{customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-mid uppercase font-mono block">WhatsApp / Phone</span>
                    <span className="font-bold text-sm text-foreground">{phone}</span>
                  </div>
                  <div>
                    <span className="text-mid uppercase font-mono block">Company / Club</span>
                    <span className="font-bold text-sm text-foreground">{companyName || 'N/A (Individual)'}</span>
                  </div>
                  <div>
                    <span className="text-mid uppercase font-mono block">Scheduled Date</span>
                    <span className="font-bold text-sm text-kala-emerald dark:text-emerald-400">{date}</span>
                  </div>
                  <div>
                    <span className="text-mid uppercase font-mono block">Time Slot</span>
                    <span className="font-bold text-sm text-kala-emerald dark:text-emerald-400">{selectedTime}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <span className="text-mid uppercase font-mono block">Consultation Purpose</span>
                  <span className="font-semibold text-foreground">{purpose}</span>
                </div>

                {message && (
                  <div className="border-t border-border pt-3">
                    <span className="text-mid uppercase font-mono block">Message Notes</span>
                    <p className="text-mid italic mt-0.5">{message}</p>
                  </div>
                )}
              </div>

              {/* Workflow Notice */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>Important Note:</strong> Your meeting status will initially be <strong>PENDING</strong>. Our production team reviews and confirms all appointments within 2 hours. You will receive an email confirmation once finalized.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-border rounded-xl text-xs font-bold uppercase tracking-wider text-mid hover:text-foreground flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Submitting Request...' : 'Request Meeting'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUBMITTED CONFIRMATION SCREEN (STATUS PENDING) */}
          {step === 3 && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/20 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                  STATUS: PENDING REVIEW
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-black uppercase text-foreground">
                  Meeting Request Received
                </h3>
                <p className="text-sm text-mid max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{customerName}</strong>! Your consultation request for <strong>{date} at {selectedTime}</strong> has been saved to the database.
                </p>
              </div>

              {/* Workflow Breakdown Box */}
              <div className="bg-background border border-border rounded-2xl p-6 max-w-lg mx-auto text-left text-xs space-y-3">
                <h4 className="font-serif text-sm font-bold text-foreground uppercase border-b border-border pb-2">
                  What Happens Next?
                </h4>
                <div className="space-y-2 text-mid">
                  <p className="flex items-start gap-2">
                    <span className="font-mono font-bold text-kala-emerald">&bull;</span>
                    <span>An alert has been dispatched to <strong>KalaOriginals@gmail.com</strong>.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-mono font-bold text-kala-emerald">&bull;</span>
                    <span>You will receive an acknowledgment email at <strong>{customerEmail}</strong>.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-mono font-bold text-kala-emerald">&bull;</span>
                    <span>The KALA team will review the slot and send a formal calendar confirmation or connect via WhatsApp at <strong>{phone}</strong>.</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setCustomerName('');
                    setMessage('');
                  }}
                  className="px-6 py-3 border border-border rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black/5"
                >
                  Book Another Slot
                </button>
                <a
                  href="https://wa.me/919406030116"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 bg-kala-emerald text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Chat on WhatsApp ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookMeetingPage;
