import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor: React.FC = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 150 };
    const dotX = useSpring(cursorX, { damping: 20, stiffness: 250 });
    const dotY = useSpring(cursorY, { damping: 20, stiffness: 250 });
    const ringX = useSpring(cursorX, springConfig);
    const ringY = useSpring(cursorY, springConfig);

    const [isHovering, setIsHovering] = useState(false);
    const [isDarkSection, setIsDarkSection] = useState(false);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);

            const target = e.target as HTMLElement;
            const isClickable = target.closest('a, button, .clickable, .collection-item, .camp-cell');
            setIsHovering(!!isClickable);

            const section = target.closest('section, div');
            if (section) {
                const bg = window.getComputedStyle(section).backgroundColor;
                // Simple dark section detection
                if (bg === 'rgb(10, 10, 10)' || bg === 'black' || bg === 'rgb(0, 0, 0)') {
                    setIsDarkSection(true);
                } else {
                    setIsDarkSection(false);
                }
            }
        };

        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, [cursorX, cursorY]);

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-9 h-9 border border-foreground rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: ringX,
                    y: ringY,
                    translateX: '-50%',
                    translateY: '-50%',
                    scale: isHovering ? 1.5 : 1,
                    borderColor: isDarkSection ? 'var(--white)' : 'var(--black)',
                }}
                transition={{ scale: { duration: 0.3 } }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-foreground rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: dotX,
                    y: dotY,
                    translateX: '-50%',
                    translateY: '-50%',
                    backgroundColor: isDarkSection ? 'var(--white)' : 'var(--black)',
                }}
            />
        </>
    );
};

export default CustomCursor;
