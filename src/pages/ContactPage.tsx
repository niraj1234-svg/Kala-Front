import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Instagram, ArrowUpRight, Calendar, CheckCircle2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';


export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    try {
      await api.submitContact({
        name,
        email,
        phone,
        subject,
        message,
        channel: 'Website Contact Page'
      });
      setIsSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      alert('Failed to send message. Please try WhatsApp for faster response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400 block">
            REACH THE STUDIO
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-black uppercase text-foreground leading-[1]">
            Contact KALA
          </h1>
          <p className="text-sm sm:text-base text-mid max-w-xl mx-auto leading-relaxed">
            Have questions about custom printing, bulk club orders, or business branding? We respond promptly through any channel.
          </p>
        </div>

        {/* 4 Direct Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {/* WhatsApp */}
          <a
            href="https://wa.me/919406030116"
            target="_blank"
            rel="noreferrer"
            className="bg-[#22c55e] text-white p-6 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="font-serif text-xl font-bold block">WhatsApp Chat</span>
              <p className="text-xs text-white/90 mt-1">Direct messaging with team</p>
            </div>
            <p className="text-sm font-bold font-mono mt-6">9406030116 &rarr;</p>
          </a>

          {/* Call Us */}
          <a
            href="tel:+919406030116"
            className="bg-[#1c1a17] text-white p-6 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <Phone className="w-6 h-6" />
              </div>
              <span className="font-serif text-xl font-bold block">Call Us</span>
              <p className="text-xs text-white/90 mt-1">Direct telephonic assistance</p>
            </div>
            <p className="text-sm font-bold font-mono mt-6">9406030116 &rarr;</p>
          </a>

          {/* Email */}
          <a
            href="mailto:KalaOriginals@gmail.com"
            className="bg-[#78442a] text-white p-6 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <Mail className="w-6 h-6" />
              </div>
              <span className="font-serif text-xl font-bold block">Email Inquiries</span>
              <p className="text-xs text-white/90 mt-1">Specifications & RFPs</p>
            </div>
            <p className="text-xs font-bold truncate mt-6">KalaOriginals@gmail.com &rarr;</p>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/kala_originals/"
            target="_blank"
            rel="noreferrer"
            className="bg-gradient-to-tr from-[#9b1d96] via-[#d6249f] to-[#fd5949] text-white p-6 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <Instagram className="w-6 h-6" />
              </div>
              <span className="font-serif text-xl font-bold block">Instagram DM</span>
              <p className="text-xs text-white/90 mt-1">Design drops & behind-the-scenes</p>
            </div>
            <p className="text-sm font-bold font-mono mt-6">@kala_originals &rarr;</p>
          </a>
        </div>

        {/* Form and Quick Actions Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Message Inquiry Form */}
          <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
              Send a Direct Message
            </h3>
            <p className="text-xs text-mid mb-6">
              Fill out your inquiry and our team will get in touch with you shortly.
            </p>

            {isSuccess ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-kala-emerald mx-auto" />
                <h4 className="font-serif text-2xl font-bold text-foreground">Message Sent!</h4>
                <p className="text-xs text-mid max-w-sm mx-auto">
                  Thank you for reaching out. We will respond to your email shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 px-6 py-2.5 bg-kala-emerald text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold uppercase tracking-wider block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                    />
                  </div>
                  <div>
                    <label className="font-bold uppercase tracking-wider block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aarav@example.com"
                      className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold uppercase tracking-wider block mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9406030116"
                      className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                    />
                  </div>
                  <div>
                    <label className="font-bold uppercase tracking-wider block mb-1">Inquiry Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald font-medium"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Custom Apparel">Custom Apparel / T-Shirts</option>
                      <option value="Business Branding">Business Branding & Packaging</option>
                      <option value="Bulk Order">Bulk Club / College Order</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you would like to print or design..."
                    className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Direct Actions & Booking */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-foreground">
                Prefer submitting custom specifications?
              </h3>
              <p className="text-xs text-mid leading-relaxed">
                Use our native studio builder to upload artwork, specify print locations (front, back, sleeve), fabric GSM, and get instant quote validation.
              </p>
              <div className="pt-2">
                <Link
                  to="/custom-apparel"
                  className="w-full py-4 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Open Custom Studio</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-[#78442a] text-white rounded-3xl p-8 space-y-4 shadow-sm">
              <Calendar className="w-8 h-8 text-amber-200" />
              <h3 className="font-serif text-2xl font-bold">
                Book a 1-on-1 Consultation
              </h3>
              <p className="text-xs text-white/90 leading-relaxed">
                Schedule a dedicated video or WhatsApp call session to discuss brand packages, mockups, or bulk quotes.
              </p>
              <div className="pt-2">
                <Link
                  to="/book-meeting"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#78442a] hover:bg-amber-50 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md"
                >
                  <span>Schedule Meeting Slot</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
