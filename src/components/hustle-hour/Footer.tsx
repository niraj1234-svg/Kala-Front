import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-background py-24 px-9 border-t border-black/5">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="reveal col-span-1 lg:col-span-1">
                        <a href="#" className="font-display text-4xl tracking-tighter text-foreground leading-none mb-8 block">
                            4.10<span className="text-accent">.</span>
                        </a>
                        <p className="font-light text-[14px] leading-[1.8] text-foreground/50 max-w-[240px]">
                            Redefining ambition through the unobserved hour. A legacy of execution and minimalism.
                        </p>
                    </div>

                    <div className="reveal">
                        <h4 className="font-display text-lg tracking-[0.1em] uppercase mb-8">Navigation</h4>
                        <ul className="flex flex-col gap-4 list-none">
                            {['About', 'Collections', 'Campaign', 'Chronicle', 'Stories'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="link-underline font-body text-[10px] tracking-[0.3em] uppercase text-mid hover:text-foreground transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="reveal">
                        <h4 className="font-display text-lg tracking-[0.1em] uppercase mb-8">Connect</h4>
                        <ul className="flex flex-col gap-4 list-none">
                            {['Instagram', 'Twitter', 'LinkedIn', 'Vimeo'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="link-underline font-body text-[10px] tracking-[0.3em] uppercase text-mid hover:text-foreground transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="reveal">
                        <h4 className="font-display text-lg tracking-[0.1em] uppercase mb-8">Newsletter</h4>
                        <p className="font-light text-[13px] text-foreground/50 mb-6">Join our private circle for early access.</p>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="w-full bg-transparent border-b border-black/10 py-3 font-light text-sm focus:outline-none focus:border-accent transition-colors"
                            />
                            <button className="absolute right-0 bottom-3 font-body text-[10px] tracking-widest uppercase text-accent hover:text-foreground transition-colors">
                                Join →
                            </button>
                        </div>
                    </div>
                </div>

                <div className="reveal pt-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="font-body text-[9px] tracking-[0.3em] uppercase text-mid">
                        © 2026 The Hustle Hour. All Rights Reserved.
                    </p>
                    <div className="flex gap-10">
                        <a href="#" className="font-body text-[9px] tracking-[0.3em] uppercase text-mid hover:text-foreground transition-colors">Privacy Policy</a>
                        <a href="#" className="font-body text-[9px] tracking-[0.3em] uppercase text-mid hover:text-foreground transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
