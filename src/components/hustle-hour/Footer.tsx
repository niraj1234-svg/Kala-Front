import React from 'react';

const IconTarget = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const IconZap = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const IconSpiral = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="7" />
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const Footer: React.FC = () => {
    return (
        <footer className="relative w-full bg-[#0a0a0a] text-[#a0a0a0] py-20 px-6 md:px-12 lg:px-16 xl:px-20 overflow-hidden font-sans border-t border-neutral-900 select-none">
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 z-[1] hero-grain opacity-[0.05] pointer-events-none" />

            <div className="relative w-full max-w-[1550px] mx-auto z-10">
                {/* 3-Column Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-start text-center md:text-left justify-between w-full mb-16 px-4">
                    
                    {/* Left Column: Menu links */}
                    <div className="flex flex-col items-center md:items-start space-y-2.5">
                        <a href="/" className="text-white hover:text-accent font-medium text-[13px] tracking-widest uppercase transition-colors">Home</a>
                        <a href="/works" className="text-[#a0a0a0] hover:text-white text-[13px] tracking-widest uppercase transition-colors">Works</a>
                        <a href="/services" className="text-[#a0a0a0] hover:text-white text-[13px] tracking-widest uppercase transition-colors">Services</a>
                        <a href="/about" className="text-[#a0a0a0] hover:text-white text-[13px] tracking-widest uppercase transition-colors">About</a>
                        <a href="/pricing" className="text-[#a0a0a0] hover:text-white text-[13px] tracking-widest uppercase transition-colors">Pricing</a>
                        <a href="/contact" className="text-[#a0a0a0] hover:text-white text-[13px] tracking-widest uppercase transition-colors">Contact us</a>
                    </div>

                    {/* Center Column: Follow us, Contact Info, Badges */}
                    <div className="flex flex-col items-center space-y-5">
                        <h4 className="text-[13px] tracking-[0.2em] uppercase font-semibold text-white/90">Follow us</h4>
                        
                        <div className="flex flex-col items-center space-y-1.5 text-[13px] text-white/70">
                            <p className="hover:text-white transition-colors cursor-pointer">mail@studio.com</p>
                            <p className="hover:text-white transition-colors cursor-pointer">+91 0123456789</p>
                        </div>

                        {/* Social Square Badges */}
                        <div className="flex items-center gap-4 mt-2">
                            <a href="#" className="w-11 h-11 rounded-lg bg-[#141414] border border-neutral-900 flex items-center justify-center text-white/80 hover:text-white hover:bg-neutral-800 hover:scale-105 hover:border-neutral-700 transition-all duration-300 shadow-md">
                                <IconTarget />
                            </a>
                            <a href="#" className="w-11 h-11 rounded-lg bg-[#141414] border border-neutral-900 flex items-center justify-center text-white/80 hover:text-white hover:bg-neutral-800 hover:scale-105 hover:border-neutral-700 transition-all duration-300 shadow-md">
                                <IconZap />
                            </a>
                            <a href="#" className="w-11 h-11 rounded-lg bg-[#141414] border border-neutral-900 flex items-center justify-center text-white/80 hover:text-white hover:bg-neutral-800 hover:scale-105 hover:border-neutral-700 transition-all duration-300 shadow-md">
                                <IconSpiral />
                            </a>
                            <a href="#" className="w-11 h-11 rounded-lg bg-[#141414] border border-neutral-900 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#1f1f1f] hover:scale-105 hover:border-neutral-700 transition-all duration-300 shadow-md">
                                <IconSearch />
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Address */}
                    <div className="flex flex-col items-center md:items-end space-y-4">
                        <h4 className="text-[13px] tracking-[0.2em] uppercase font-semibold text-white/90">Address</h4>
                        <div className="space-y-1.5 text-[13px] text-white/70 text-center md:text-right leading-relaxed font-light">
                            <p>#21, North Street,</p>
                            <p>Velachery,</p>
                            <p>Chennai.</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Legal / Copyright Row */}
                <div className="w-full pt-8 border-t border-neutral-900/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] tracking-wider font-light text-white/40">
                    <p>© 2026 Studio. All Rights Reserved.</p>
                    <div className="flex gap-6">
                        <a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a>
                        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                    </div>
                </div>

                {/* Giant Typography Background Overlay */}
                <div className="w-full mt-16 md:mt-24 pt-8 flex flex-col items-center justify-center select-none pointer-events-none relative overflow-hidden">
                    <span className="font-serif font-black text-[clamp(45px,7.5vw,115px)] text-[#181818] uppercase tracking-[0.18em] leading-none text-center whitespace-nowrap">
                        THE HUSTLE HOUR
                    </span>
                    <span className="font-serif font-black text-[clamp(85px,18vw,290px)] text-[#444444] tracking-tighter leading-none text-center whitespace-nowrap mt-[-10px] md:mt-[-35px] lg:mt-[-45px]">
                        4.10
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
