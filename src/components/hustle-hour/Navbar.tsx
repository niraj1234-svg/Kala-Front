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
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 w-full z-[1000] flex items-center justify-between px-8 md:px-12 lg:px-16 transition-all duration-500",
                    isScrolled
                        ? "glass-nav py-4 shadow-sm"
                        : "bg-transparent py-8"
                )}
            >
                {/* Left: Menu & Logo */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 hover:opacity-70 transition-opacity text-foreground"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <Link to="/" className="font-display text-2xl md:text-3xl tracking-tighter text-foreground leading-none hover:opacity-70 transition-opacity">
                        4.10<span className="text-accent">.</span>
                    </Link>
                </div>

                {/* Center: Navigation Links (Desktop) */}
                <ul className="hidden lg:flex gap-10 list-none absolute left-1/2 -translate-x-1/2">
                    {['About', 'Hub', 'Timelines', 'Projects', 'Stories'].map((item) => (
                        <li key={item}>
                            <a
                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                className="link-underline font-body text-[9px] tracking-[0.3em] uppercase text-foreground/60 hover:text-foreground transition-all duration-300"
                            >
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 md:gap-7">
                    <div className="hidden sm:flex items-center gap-6 mr-2">
                        <button className="text-foreground/60 hover:text-foreground transition-colors">
                            <Search className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => authState.isAuthenticated ? navigate('/profile') : navigate('/login')}
                            className="text-foreground/60 hover:text-foreground transition-colors relative"
                        >
                            <User className="w-4 h-4" />
                            {authState.isAuthenticated && (
                                <span className="absolute -top-1 -right-1 bg-accent rounded-full w-1.5 h-1.5" />
                            )}
                        </button>
                    </div>

                    <Link
                        to="/login"
                        className={cn(
                            "hidden md:block font-body text-[9px] tracking-[0.3em] uppercase px-5 py-2 transition-all duration-500 border",
                            isScrolled
                                ? "border-foreground/20 text-foreground hover:bg-foreground hover:text-background"
                                : "border-white/30 text-white hover:bg-white hover:text-foreground"
                        )}
                    >
                        {authState.isAuthenticated ? 'Account' : 'Subscribe →'}
                    </Link>

                    <Link to="/cart" className="p-2 hover:opacity-70 transition-opacity text-foreground relative">
                        <ShoppingBag className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-accent text-background text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </nav>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
};

export default Navbar;
