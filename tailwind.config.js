/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: "var(--card)",
                cream: "var(--cream)",
                mid: "var(--mid)",
                accent: "var(--accent)",
                border: "var(--border)",
                kala: {
                    emerald: "#c15927",
                    primary: "#c15927",
                    terracotta: "#c15927",
                    earth: "#9e4419",
                    brown: "#6e432a",
                    dark: "#1c1a17",
                    cream: "#f5f3ef",
                    accent: "#d97443"
                }
            },
            fontFamily: {
                display: ["'Bahnschrift'", "'Myriad Pro'", "'Myriad'", "'Barlow Semi Condensed'", "sans-serif"],
                serif: ["'Bahnschrift'", "'Myriad Pro'", "'Myriad'", "sans-serif"],
                body: ["'Myriad Pro'", "'Myriad'", "'Bahnschrift'", "'Barlow'", "'DM Sans'", "sans-serif"],
                sans: ["'Myriad Pro'", "'Myriad'", "'Bahnschrift'", "'Barlow'", "sans-serif"],
                heading: ["'Bahnschrift'", "'Myriad Pro'", "'Myriad'", "sans-serif"],
            },
            animation: {
                'hzoom': 'hzoom 12s ease-out forwards',
                'grain': 'grain 8s steps(10) infinite',
                'figureRise': 'figureRise 1.6s cubic-bezier(0.16, 1, 0.3, 1) both',
                'heroSlide': 'heroSlide 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
                'marquee': 'marquee 20s linear infinite',
            },
            keyframes: {
                hzoom: {
                    'to': { transform: 'scale(1)' },
                },
                grain: {
                    '0%, 100%': { transform: 'translate(0, 0)' },
                    '10%': { transform: 'translate(-5%, -10%)' },
                    '20%': { transform: 'translate(-15%, 5%)' },
                    '30%': { transform: 'translate(7%, -25%)' },
                    '40%': { transform: 'translate(-5%, 25%)' },
                    '50%': { transform: 'translate(-15%, 10%)' },
                    '60%': { transform: 'translate(15%, 0)' },
                    '70%': { transform: 'translate(0, 15%)' },
                    '80%': { transform: 'translate(3%, 35%)' },
                    '90%': { transform: 'translate(-10%, 10%)' },
                },
                figureRise: {
                    'from': { transform: 'translateY(100%)', opacity: '0' },
                    'to': { opacity: '1', transform: 'none' },
                },
                heroSlide: {
                    'from': { transform: 'translateY(40px)', opacity: '0' },
                    'to': { transform: 'none', opacity: '1' },
                },
                marquee: {
                    'from': { transform: 'translateX(0)' },
                    'to': { transform: 'translateX(-50%)' },
                },
            },
        },
    },
    plugins: [],
}
