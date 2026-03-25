import React from 'react';
import { Facebook, Instagram, Send } from 'lucide-react';

const PinterestIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.621 0 11.988-5.367 11.988-11.987C24.005 5.367 18.639 0 12.017 0z" />
    </svg>
);

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#fdf1f0] text-[#555] py-16 px-6 font-serif">
            <div className="max-w-7xl mx-auto flex flex-col items-center">

                {/* Logo Section */}
                <div className="relative mb-12 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 border border-[#888] rounded-full flex flex-col items-center justify-center p-4">
                        <span className="text-xl font-light italic leading-tight text-[#888]">Laugh.</span>
                        <span className="text-3xl font-serif italic -mt-1 -mb-1 lowercase text-[#888]">Cry.</span>
                        <span className="text-xl font-light italic leading-tight text-[#888]">Toast.</span>
                    </div>
                </div>

                {/* Top Navigation */}
                <div className="w-full border-t border-b border-[#ddd] py-4 mb-12">
                    <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-[11px] tracking-[0.2em] uppercase font-light">
                        <a href="/about" className="hover:text-black transition-colors">About Us</a>
                        <div className="w-[1px] h-4 bg-[#ddd] hidden sm:block"></div>
                        <a href="/events" className="hover:text-black transition-colors">Events</a>
                        <div className="w-[1px] h-4 bg-[#ddd] hidden sm:block"></div>
                        <a href="/consultations" className="hover:text-black transition-colors">Consultations</a>
                        <div className="w-[1px] h-4 bg-[#ddd] hidden sm:block"></div>
                        <a href="/family" className="hover:text-black transition-colors">Our Joy Family</a>
                        <div className="w-[1px] h-4 bg-[#ddd] hidden sm:block"></div>
                        <a href="/faq" className="hover:text-black transition-colors">FAQ</a>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full text-center md:text-left mb-16 px-4">

                    {/* Contact Column */}
                    <div className="flex flex-col items-center md:items-start md:border-r border-[#ddd] md:pr-12">
                        <h4 className="text-[12px] tracking-[0.2em] uppercase font-medium mb-6">Contact</h4>
                        <div className="space-y-3 text-[13px] font-light leading-relaxed">
                            <p>248.876.0833</p>
                            <p>info@joyabendmode.com</p>
                            <p className="mt-4">
                                506 S. Washington Avenue<br />
                                Royal Oak, Michigan 48067
                            </p>
                        </div>
                    </div>

                    {/* Hours Column */}
                    <div className="flex flex-col items-center md:items-start md:border-r border-[#ddd] md:px-12">
                        <h4 className="text-[12px] tracking-[0.2em] uppercase font-medium mb-6">Hours</h4>
                        <div className="space-y-3 text-[13px] font-light leading-relaxed text-center md:text-left">
                            <p className="italic font-normal">*by appointment only</p>
                            <p>Tues, Thurs, & Fri | 11AM–5PM</p>
                            <p>Wed & Sat | 11AM–7PM</p>
                            <p className="uppercase tracking-wide mt-2">Closed Sunday & Monday</p>
                        </div>
                    </div>

                    {/* Information Column */}
                    <div className="flex flex-col items-center md:items-start md:pl-12">
                        <h4 className="text-[12px] tracking-[0.2em] uppercase font-medium mb-6">Information</h4>
                        <div className="flex flex-col space-y-3 text-[13px] font-light">
                            <a href="/contact" className="hover:underline">Contact Us</a>
                            <a href="/collections" className="hover:underline">Browse Collections</a>
                            <a href="/terms" className="hover:underline">Terms & Conditions</a>
                            <a href="/privacy" className="hover:underline">Privacy Policy</a>
                        </div>
                    </div>
                </div>

                {/* Social & Newsletter */}
                <div className="w-full border-t border-[#ddd] py-12 flex flex-col md:flex-row items-center justify-between gap-12">

                    {/* Socials */}
                    <div className="flex items-center gap-6">
                        <span className="text-2xl font-serif italic text-gray-500 mr-2">Let's connect</span>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 hover:bg-black/5 rounded-full transition-colors"><Facebook size={20} strokeWidth={1.5} /></a>
                            <a href="#" className="p-2 hover:bg-black/5 rounded-full transition-colors"><Instagram size={20} strokeWidth={1.5} /></a>
                            <a href="#" className="p-2 hover:bg-black/5 rounded-full transition-colors"><PinterestIcon /></a>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="flex flex-col md:items-start items-center gap-4 w-full max-w-sm">
                        <h4 className="text-[10px] tracking-[0.2em] uppercase font-light">Stay in the know with Joy Abendmode:</h4>
                        <div className="relative w-full border-b border-gray-400">
                            <input
                                type="email"
                                placeholder=""
                                className="w-full bg-transparent py-2 focus:outline-none text-sm placeholder:italic"
                            />
                            <button className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors">
                                <Send size={18} strokeWidth={1} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="w-full pt-8 text-center border-t border-[#ddd]">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-gray-400 font-light">
                        © {new Date().getFullYear()} Joy Abendmode Bridal Boutique
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
