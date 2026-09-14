import React from 'react';

interface MarqueeProps {
    text?: string[];
    light?: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({
    text = ["THE HUSTLE HOUR", "4.10 ANTHOLOGY", "REDEFINING AMBITION"],
    light = false
}) => {
    return (
        <div className={`overflow-hidden border-y border-foreground py-3.5 ${light ? 'bg-background text-foreground' : 'bg-foreground text-background'}`}>
            <div className="flex whitespace-nowrap animate-marquee">
                {[...Array(4)].map((_, i) => (
                    <React.Fragment key={i}>
                        {text.map((item, index) => (
                            <span key={index} className="flex items-center">
                                <span className="font-body text-[11px] tracking-[4px] uppercase px-6">{item}</span>
                                <span className="px-6">/</span>
                            </span>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Marquee;
