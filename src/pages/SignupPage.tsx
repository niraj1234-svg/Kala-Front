import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormError('');
    setIsLoading(true);

    try {
      await api.register({ name, email, password, phone });
      navigate('/account');
    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 py-28 relative overflow-hidden text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <Link to="/" className="inline-block mb-3">
              <span className="font-serif text-3xl font-black tracking-[0.2em] text-foreground">
                KALA
              </span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Create Account
            </h1>
            <p className="font-body text-xs tracking-wider uppercase text-mid">
              Join KALA Originals Studio
            </p>
          </div>

          <div className="bg-card p-8 border border-border rounded-3xl shadow-xl space-y-6">
            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-body text-xs font-bold uppercase tracking-wider text-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-body text-xs font-bold uppercase tracking-wider text-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-body text-xs font-bold uppercase tracking-wider text-foreground">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9406030116"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-body text-xs font-bold uppercase tracking-wider text-foreground">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-between text-xs text-mid">
            <Link to="/" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to store
            </Link>
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-kala-emerald dark:text-emerald-400 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;