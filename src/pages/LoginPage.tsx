import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { authStore, useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const authState = useAuthStore((state) => state);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }
    setFormError('');
    try {
      await authStore.login({ email, password });
      navigate('/');
    } catch (error) {
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 py-20 relative overflow-hidden text-foreground">
      {/* Grain Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="font-display text-7xl md:text-8xl uppercase tracking-tighter">Sign In</h1>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/40">
              Access your curated archive
            </p>
          </div>

          <div className="bg-foreground/5 p-8 md:p-12 border border-foreground/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            {(formError || authState.error) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-accent/10 border-l-2 border-accent text-accent px-4 py-3 mb-8 font-body text-[10px] tracking-wider uppercase"
              >
                {formError || authState.error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-1">
                <label className="font-body text-[9px] tracking-[0.4em] uppercase text-foreground/40 font-bold ml-1">Email Protocol</label>
                <input
                  type="email"
                  placeholder="name@archived.com"
                  className="w-full h-14 bg-transparent border-b border-foreground/10 text-foreground font-body text-xs tracking-widest focus:outline-none focus:border-accent transition-colors px-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="font-body text-[9px] tracking-[0.4em] uppercase text-foreground/40 font-bold">Secure Key</label>
                  <button type="button" className="font-body text-[8px] tracking-[0.2em] uppercase text-accent hover:text-foreground transition-colors">Recover</button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-14 bg-transparent border-b border-foreground/10 text-foreground font-body text-xs tracking-widest focus:outline-none focus:border-accent transition-colors px-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full h-16 bg-foreground text-background font-body text-[11px] tracking-[0.4em] uppercase hover:bg-accent hover:text-foreground transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                  disabled={authState.loading}
                >
                  {authState.loading ? 'Authenticating...' : (
                    <>
                      Verify Access
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="font-body text-[9px] tracking-[0.2em] uppercase text-foreground/40">
                New entity? <Link to="/signup" className="text-foreground font-bold hover:text-accent transition-colors">Register Profile</Link>
              </p>
              <Link to="/products" className="flex items-center gap-3 font-body text-[9px] tracking-[0.2em] uppercase text-foreground/40 hover:text-foreground transition-all group text-foreground font-bold">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Archive
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
