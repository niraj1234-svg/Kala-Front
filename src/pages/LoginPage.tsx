import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }
    setFormError('');
    setIsLoading(true);

    try {
      const res = await api.login(email, password);
      if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } catch (err: any) {
      setFormError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminFill = () => {
    setEmail('admin@kala.com');
    setPassword('admin12345');
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
              Sign In
            </h1>
            <p className="font-body text-xs tracking-wider uppercase text-mid">
              Access your orders and account
            </p>
          </div>

          <div className="bg-card p-8 border border-border rounded-3xl shadow-xl space-y-6">
            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
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
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Admin Quick Fill Pill */}
            <div className="pt-4 border-t border-border/60 text-center">
              <button
                type="button"
                onClick={handleAdminFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-kala-emerald/10 text-[11px] font-mono text-mid hover:text-kala-emerald transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fill Admin Demo Credentials (admin@kala.com)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-mid">
            <Link to="/" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to store
            </Link>
            <p>
              Need an account?{' '}
              <Link to="/signup" className="text-kala-emerald dark:text-emerald-400 font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
