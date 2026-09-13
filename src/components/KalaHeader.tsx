import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Sun, Moon, Menu, X, ArrowRight, ShieldCheck, LogOut, Heart } from 'lucide-react';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { api, type User as UserType } from '../lib/api';

interface KalaHeaderProps {
  onOpenSearch?: () => void;
  onOpenContactModal?: () => void;
}

export const KalaHeader: React.FC<KalaHeaderProps> = ({ onOpenSearch, onOpenContactModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Theme state: dark / light
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kala_theme');
      if (savedTheme) return savedTheme === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kala_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kala_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check user auth state
  useEffect(() => {
    const raw = localStorage.getItem('kala_user_profile');
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw));
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, [location.pathname]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Custom Apparel', path: '/custom-apparel' },
    { name: 'Business Branding', path: '/business-branding' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-md shadow-sm border-b border-border py-3'
          : 'bg-background/70 backdrop-blur-xs border-b border-border/50 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: KALA Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-kala-emerald/10 dark:bg-white/10 flex items-center justify-center p-1 transition-transform duration-300 group-hover:scale-105 border border-kala-emerald/20 dark:border-white/10">
            <img
              src="/kala-logo.png"
              alt="KALA Studio Logo"
              className="w-full h-full object-contain filter drop-shadow-xs"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/lo.png';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-black tracking-[0.2em] text-foreground leading-none">
              KALA
            </span>
            <span className="font-body text-[8.5px] uppercase tracking-[0.25em] text-mid font-semibold mt-0.5">
              Originals Studio
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links (Rule 3) */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-body text-[12.5px] tracking-[0.16em] uppercase transition-all duration-200 relative py-1 ${
                isActive(link.path)
                  ? 'text-foreground font-bold'
                  : 'text-mid hover:text-foreground font-medium'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-kala-emerald dark:bg-emerald-400 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right: Actions (Search, Wishlist, Cart, Account, Theme) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Search Trigger (Rule 4) */}
          <button
            onClick={onOpenSearch || (() => navigate('/shop'))}
            className="p-2 text-foreground/80 hover:text-foreground rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Search KALA products"
            aria-label="Search"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Wishlist Link & Count Badge (Rule 3 & 16) */}
          <Link
            to="/wishlist"
            className="p-2 text-foreground/80 hover:text-foreground rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistCount > 0 ? 'text-red-500 fill-red-500/20' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon & Count Badge (Rule 3) */}
          <Link
            to="/cart"
            className="p-2 text-foreground/80 hover:text-foreground rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative"
            title="Shopping Cart"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-kala-emerald text-white dark:bg-emerald-500 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account / Profile Dropdown (Rule 3 & 33) */}
          <div className="relative">
            <button
              onClick={() => {
                if (!currentUser) {
                  navigate('/login');
                } else {
                  setIsUserDropdownOpen(prev => !prev);
                }
              }}
              className="p-2 text-foreground/80 hover:text-foreground rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
              title={currentUser ? `Signed in as ${currentUser.name}` : 'Login or Sign Up'}
              aria-label="Account"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              {currentUser && (
                <span className="hidden md:inline-block text-xs font-semibold max-w-[80px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl py-2 z-50 text-foreground animate-in fade-in-50 zoom-in-95">
                <div className="px-4 py-2 border-b border-border/50">
                  <p className="text-xs text-mid">Signed in as</p>
                  <p className="text-sm font-bold truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-mid truncate">{currentUser.email}</p>
                </div>

                <Link
                  to="/account"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="block px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  My Account
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="block px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  My Orders
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="block px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Saved Wishlist
                </Link>

                {currentUser.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-kala-emerald dark:text-emerald-400 font-bold uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin Console
                  </Link>
                )}

                <div className="border-t border-border/50 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs uppercase tracking-wider font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-foreground/80 hover:text-foreground rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-mid hover:text-foreground" />
            )}
          </button>

          {/* Desktop Direct Shop CTA (replaces Google Form) */}
          <Link
            to="/shop"
            className="hidden xl:inline-flex items-center gap-1.5 px-4 py-2 bg-kala-emerald text-white hover:bg-kala-emerald/90 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-xs hover:-translate-y-0.5"
          >
            <span>Shop Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 text-foreground rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background border-b border-border px-6 pt-4 pb-8 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2.5 text-sm tracking-wider uppercase font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'text-kala-emerald dark:text-emerald-400 font-bold pl-2 border-l-2 border-kala-emerald dark:border-emerald-400'
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-border/50 flex flex-col gap-2.5">
            <Link
              to="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-xs uppercase tracking-wider font-bold text-foreground"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Wishlist
              </span>
              <span className="font-mono">{wishlistCount}</span>
            </Link>

            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-xs uppercase tracking-wider font-bold text-foreground"
            >
              <span>My Orders</span>
            </Link>

            {onOpenContactModal && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenContactModal();
                }}
                className="w-full text-center py-2.5 bg-card hover:bg-black/5 dark:hover:bg-white/5 border border-border text-foreground rounded-xl text-xs font-bold tracking-wider uppercase transition-colors"
              >
                Connect Studio
              </button>
            )}

            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-3 bg-kala-emerald text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <span>Explore KALA Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default KalaHeader;
