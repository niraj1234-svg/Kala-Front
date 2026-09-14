import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, User, ChevronDown } from 'lucide-react';
import { useAppralStore } from '../../store/appralStore';
import { useAuthStore, authStore } from '../../store/authStore';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

type MenuItem = {
    label: string;
    path: string;
    children?: MenuItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const authState = useAuthStore((state) => state);
    const categoriesState = useAppralStore((state) => state.categories);

    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const dynamicMenuItems = useMemo<MenuItem[]>(
        () =>
            categoriesState.data.map((category) => ({
                label: category.name,
                path: `/products?category=${encodeURIComponent(category.slug)}`,
                children: (category.children ?? []).map((child) => ({
                    label: child.name,
                    path: `/products?category=${encodeURIComponent(child.slug)}`,
                })),
            })),
        [categoriesState.data],
    );

    const additionalMenuItems = useMemo<MenuItem[]>(
        () => [
            { label: 'About Us', path: '/about' },
            { label: 'Customize', path: '/customize' },
            { label: 'Behind the Hype', path: '/blog' },
            { label: 'Street Wire — The Network', path: '/network' },
        ],
        [],
    );

    const mainMenu = useMemo<MenuItem[]>(
        () => (dynamicMenuItems.length > 0 ? [...dynamicMenuItems, ...additionalMenuItems] : additionalMenuItems),
        [additionalMenuItems, dynamicMenuItems],
    );

    const handleToggleMenu = (label: string) => {
        setOpenMenu(prev => (prev === label ? null : label));
    };

    const handleLogout = () => {
        authStore.logout();
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <div
            className={`fixed inset-0 z-[2000] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <div
                className={`absolute left-0 top-0 bottom-0 w-full sm:w-80 bg-background transition-transform duration-500 ease-out border-r border-foreground/5 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-foreground/5 flex justify-between items-center bg-cream/30">
                    <Link to="/" onClick={onClose} className="font-display text-2xl tracking-tighter text-foreground">
                        4.10<span className="text-accent">.</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-foreground/60"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
                    {/* User Section */}
                    {!authState.isAuthenticated ? (
                        <div className="mb-8 pb-8 border-b border-foreground/5 space-y-3">
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="w-full bg-foreground text-background py-3 px-4 rounded-none hover:opacity-90 transition inline-block text-center font-body text-[10px] tracking-[0.3em] uppercase"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                onClick={onClose}
                                className="w-full block text-center border border-foreground/20 py-3 px-4 rounded-none hover:bg-foreground/5 transition font-body text-[10px] tracking-[0.3em] uppercase"
                            >
                                Create Account
                            </Link>
                        </div>
                    ) : (
                        <div className="mb-8 pb-8 border-b border-foreground/5">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-accent/20 rounded-full w-12 h-12 flex items-center justify-center text-accent">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-display text-lg tracking-wide uppercase text-foreground">
                                        {authState.user?.first_name || 'Member'}
                                    </div>
                                    <div className="text-[9px] font-body tracking-[0.2em] uppercase text-foreground/40">Loyalty Member</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {['Profile', 'Orders', 'Wishlist'].map((link) => (
                                    <Link
                                        key={link}
                                        to={`/${link.toLowerCase()}`}
                                        onClick={onClose}
                                        className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/60 hover:text-foreground transition-all"
                                    >
                                        {link}
                                    </Link>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="font-body text-[10px] tracking-[0.2em] uppercase text-red-500/70 hover:text-red-500 transition-all text-left"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Navigation Menu */}
                    <div className="space-y-6">
                        {mainMenu.map((item) => {
                            const hasChildren = Boolean(item.children?.length);
                            const isOpen = openMenu === item.label;

                            return (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between group">
                                        <Link
                                            to={item.path}
                                            onClick={onClose}
                                            className="font-display text-2xl tracking-wide text-foreground group-hover:text-accent transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                        {hasChildren && (
                                            <button
                                                onClick={() => handleToggleMenu(item.label)}
                                                className="p-1 text-foreground/40 hover:text-foreground transition-colors"
                                            >
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {hasChildren && isOpen && (
                                        <ul className="mt-4 space-y-3 pl-4 border-l border-foreground/10">
                                            {item.children!.map((child) => (
                                                <li key={child.label}>
                                                    <Link
                                                        to={child.path}
                                                        onClick={onClose}
                                                        className="font-body text-[11px] tracking-[0.1em] text-foreground/50 hover:text-foreground transition-colors"
                                                    >
                                                        {child.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
