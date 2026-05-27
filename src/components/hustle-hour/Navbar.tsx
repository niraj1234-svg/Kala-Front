import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useAppralStore } from '../../store/appralStore';
import Sidebar from './Sidebar';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isToggleOn, setIsToggleOn] = useState(false);

    const authState = useAuthStore((state) => state);
    const cartState = useAppralStore((state) => state.cart);
    const cartCount = cartState.data?.item_count ?? 0;

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-[1000] flex flex-col border-b border-black/5 bg-background shadow-xs">
                {/* Top Announcement Bar */}
                <div className="w-full bg-[#1c1a17] text-white text-center py-2 flex items-center justify-center select-none">
                    <span className="font-body text-[8.5px] sm:text-[9.5px] tracking-[0.25em] uppercase font-bold text-white/95">
                        SPRING SALE LIVE NOW &nbsp;|&nbsp; UPTO 60% OFF
                    </span>
                </div>

                {/* Main Navbar */}
                <nav className="w-full bg-background flex items-center justify-between px-6 md:px-12 lg:px-16 py-4.5 select-none relative">
                    {/* Left Side: Toggle switch, Links, and Hamburger for Mobile */}
                    <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-1.5 -ml-1 text-[#1c1a17] hover:opacity-75 transition-opacity"
                            aria-label="Open Sidebar Menu"
                        >
                            <Menu className="w-5 h-5 stroke-[1.75]" />
                        </button>
                        
                        {/* Capsule Toggle Switch */}
                        <div 
                            onClick={() => setIsToggleOn(prev => !prev)}
                            className="w-[38px] h-[20px] rounded-full bg-[#1c1a17] p-[2.5px] transition-all duration-300 relative cursor-pointer flex items-center shadow-xs select-none"
                        >
                            <div 
                                className={cn(
                                    "w-[15px] h-[15px] rounded-full bg-white transition-all duration-300 shadow-xs",
                                    isToggleOn ? "translate-x-[18px]" : "translate-x-0"
                                )}
                            />
                        </div>

                        {/* Navigation Links (Desktop) */}
                        <ul className="hidden lg:flex items-center gap-6 xl:gap-8 list-none select-none">
                            <li>
                                <Link 
                                    to="/products" 
                                    className="font-body text-[11.5px] font-black tracking-[0.2em] uppercase text-[#10b981] hover:text-[#0b7f58] transition-colors duration-300"
                                >
                                    SALE
                                </Link>
                            </li>
                            {['SHOP', 'ABOUT', 'BLOG'].map((item) => (
                                <li key={item}>
                                    <Link
                                        to={item === 'SHOP' ? '/products' : item === 'ABOUT' ? '/about' : '#'}
                                        className="font-body text-[11.5px] font-extrabold tracking-[0.2em] uppercase text-[#1c1a17]/85 hover:text-[#1c1a17] link-underline transition-all duration-300"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Center: High-Fashion Spaced Out Brand Logo */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Link 
                            to="/" 
                            className="font-serif font-black text-3xl md:text-[38px] tracking-tight text-[#1c1a17] leading-none hover:opacity-80 transition-opacity"
                        >
                            4.10
                        </Link>
                    </div>

                    {/* Right Side: Interactive Outline Icons */}
                    <div className="flex items-center gap-4.5 md:gap-6">
                        {/* Search Action */}
                        <button 
                            className="p-1 text-[#1c1a17] hover:opacity-75 transition-opacity cursor-pointer"
                            aria-label="Search Collection"
                        >
                            <Search className="w-[18px] h-[18px] stroke-[1.5] transition-transform hover:scale-105" />
                        </button>

                        {/* Profile/Auth Action */}
                        <button
                            onClick={() => authState.isAuthenticated ? navigate('/profile') : navigate('/login')}
                            className="p-1 text-[#1c1a17] hover:opacity-75 transition-opacity relative cursor-pointer"
                            aria-label="User Account Profile"
                        >
                            <User className="w-[18px] h-[18px] stroke-[1.5] transition-transform hover:scale-105" />
                            {authState.isAuthenticated && (
                                <span className="absolute top-0 right-0 bg-[#8a4f35] rounded-full w-2 h-2 border border-background" />
                            )}
                        </button>

                        {/* Shopping Bag Count Indicator */}
                        <Link 
                            to="/cart" 
                            className="p-1.5 text-[#1c1a17] hover:opacity-75 transition-opacity relative cursor-pointer inline-flex items-center"
                            aria-label="Shopping Cart Bag"
                        >
                            <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5] transition-transform duration-300 hover:scale-105" />
                            <span className="absolute -top-1 -right-1.5 bg-black text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Slide-out Sidebar Component */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
};

export default Navbar;
