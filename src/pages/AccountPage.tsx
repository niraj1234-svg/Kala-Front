import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShieldCheck, ShoppingBag, Calendar, LogOut, ArrowRight } from 'lucide-react';
import { api, type User as UserType } from '../lib/api';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('kala_user_profile');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    api.logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-kala-emerald/10 text-kala-emerald dark:text-emerald-400 flex items-center justify-center border border-kala-emerald/20">
                <User className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                    {user.name}
                  </h1>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-kala-emerald/10 text-kala-emerald dark:text-emerald-400">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-mid mt-0.5">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/orders"
            className="bg-card border border-border hover:border-foreground/40 rounded-2xl p-6 transition-all shadow-xs group flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-kala-emerald dark:text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-serif text-lg font-bold">My Orders</span>
              </div>
              <p className="text-xs text-mid">View your submitted print orders and production progress</p>
            </div>
            <ArrowRight className="w-4 h-4 text-mid group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/book-meeting"
            className="bg-card border border-border hover:border-foreground/40 rounded-2xl p-6 transition-all shadow-xs group flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#8a4f35] dark:text-[#d28c6e]">
                <Calendar className="w-5 h-5" />
                <span className="font-serif text-lg font-bold">Book Consultation</span>
              </div>
              <p className="text-xs text-mid">Schedule a design or bulk quote consultation</p>
            </div>
            <ArrowRight className="w-4 h-4 text-mid group-hover:translate-x-1 transition-transform" />
          </Link>

          {user.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="sm:col-span-2 bg-kala-emerald/5 border border-kala-emerald/30 hover:border-kala-emerald rounded-2xl p-6 transition-all shadow-xs group flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-kala-emerald dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-serif text-lg font-bold">Admin Management Console</span>
                </div>
                <p className="text-xs text-mid">Review meetings, confirm appointments, toggle stock, and update products</p>
              </div>
              <ArrowRight className="w-4 h-4 text-kala-emerald group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
