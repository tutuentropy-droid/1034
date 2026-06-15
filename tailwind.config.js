/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        parchment: {
          50: "#FDF8F0",
          100: "#F8EFE0",
          200: "#F0DFC4",
          300: "#E6CCA3",
          400: "#D9B882",
          500: "#C9A263",
        },
        ochre: {
          50: "#FDF5EE",
          100: "#FAE9D8",
          200: "#F3D0B0",
          300: "#E9B17E",
          400: "#DC8F4D",
          500: "#8B4513",
          600: "#7A3C10",
          700: "#63300D",
        },
        stoneAge: "#757575",
        agricultural: "#558B2F",
        imperial: "#4A148C",
        scientific: "#0D47A1",
        gold: {
          400: "#D4AF37",
          500: "#B8860B",
          600: "#9A7209",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Source Han Serif"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'parchment-texture': "linear-gradient(135deg, #F8EFE0 0%, #F0DFC4 50%, #E6CCA3 100%)",
        'card-gradient': "linear-gradient(180deg, rgba(253,248,240,0.95) 0%, rgba(248,239,224,0.98) 100%)",
      },
      boxShadow: {
        'card': '0 10px 40px -10px rgba(62, 39, 35, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'button': '0 4px 15px -5px rgba(184, 134, 11, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'button-hover': '0 6px 20px -5px rgba(184, 134, 11, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 20px rgba(212, 175, 55, 0.4)',
        'inner-engraved': 'inset 0 2px 8px rgba(62, 39, 35, 0.4)',
      },
      animation: {
        'scroll-reveal': 'scrollReveal 1s ease-out forwards',
        'page-turn': 'pageTurn 0.8s ease-in-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'number-scroll': 'numberScroll 0.5s ease-out',
        'timeline-draw': 'timelineDraw 1.5s ease-out forwards',
      },
      keyframes: {
        scrollReveal: {
          '0%': { opacity: '0', transform: 'translateY(-30px) scaleY(0.8)' },
          '100%': { opacity: '1', transform: 'translateY(0) scaleY(1)' },
        },
        pageTurn: {
          '0%': { transform: 'rotateY(0deg)', opacity: '1' },
          '50%': { transform: 'rotateY(-90deg)', opacity: '0.5' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.8)' },
        },
        numberScroll: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        timelineDraw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
