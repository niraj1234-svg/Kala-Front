import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useAppralStore } from '../../store/appralStore';
import Sidebar from './Sidebar';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const authState = useAuthStore((state) => state);
    const cartState = useAppralStore((state) => state.cart);
    const cartCount = cartState.data?.item_count ?? 0;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 w-full z-[1000] flex items-center justify-between px-6 md:px-12 lg:px-16 transition-all duration-500",
                    isScrolled
                        ? "glass-nav py-4 shadow-sm"
                        : "bg-transparent py-7"
                )}
            >
                {/* Left Side: Hamburger Menu & Elegant Logo */}
                <div className="flex items-center gap-6 md:gap-8">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 hover:text-accent transition-colors text-foreground"
                        aria-label="Open Sidebar Menu"
                    >
                        <Menu className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
                    </button>
                    <Link 
                        to="/" 
                        className="font-display text-2xl md:text-3xl tracking-tighter text-foreground leading-none hover:text-accent transition-colors duration-300"
                    >
                        4.10<span className="text-accent">.</span>
                    </Link>
                </div>

                {/* Center: High-Fashion Spaced Out Navigation Links (Desktop) */}
                <ul className="hidden lg:flex gap-8 xl:gap-10 list-none absolute left-1/2 -translate-x-1/2 select-none">
                    {['About', 'Hub', 'Timelines', 'Projects', 'Stories'].map((item) => (
                        <li key={item}>
                            <a
                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                className="link-underline font-body text-[9.5px] tracking-[0.25em] uppercase text-foreground/80 hover:text-foreground font-extrabold transition-all duration-300"
                            >
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Right Side: Interactive Action Icons & Call to Action */}
                <div className="flex items-center gap-3 md:gap-6">
                    {/* Search & Profile Icons */}
                    <div className="hidden sm:flex items-center gap-5 mr-1 md:mr-3">
                        <button 
                            className="p-1 text-foreground/80 hover:text-accent transition-colors"
                            aria-label="Search Collection"
                        >
                            <Search className="w-4 h-4 transition-transform hover:scale-105" />
                        </button>
                        <button
                            onClick={() => authState.isAuthenticated ? navigate('/profile') : navigate('/login')}
                            className="p-1 text-foreground/80 hover:text-accent transition-colors relative"
                            aria-label="User Account Profile"
                        >
                            <User className="w-4 h-4 transition-transform hover:scale-105" />
                            {authState.isAuthenticated && (
                                <span className="absolute top-0.5 right-0.5 bg-accent rounded-full w-1.5 h-1.5" />
                            )}
                        </button>
                    </div>

                    {/* Subscription CTA: Solid Java-Espresso button blending into Accent on hover */}
                    <Link
                        to="/login"
                        className="hidden md:block font-body text-[9px] tracking-[0.25em] uppercase px-5 py-2.5 bg-foreground text-background hover:bg-accent hover:text-[#f5f3ef] transition-all duration-500 rounded-[3px] font-bold shadow-sm select-none"
                    >
                        {authState.isAuthenticated ? 'Account' : 'Subscribe →'}
                    </Link>

                    {/* Shopping Bag Icon with Cart Count */}
                    <Link 
                        to="/cart" 
                        className="p-2 hover:text-accent transition-colors text-foreground relative"
                        aria-label="Shopping Cart Bag"
                    >
                        <ShoppingBag className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-accent text-[#f5f3ef] text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </nav>

            {/* Slide-out Sidebar Component */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
};

export default Navbar;
