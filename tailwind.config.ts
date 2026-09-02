import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFCF7',
          100: '#FAF6E6',
          200: '#F4EBBA',
          300: '#EBDC89',
          400: '#DFC65A',
          500: '#D4AF37', // Luxury Champagne Gold
          600: '#B89225',
          700: '#8C6C16',
          800: '#61490C',
          900: '#382A05',
        },
        obsidian: {
          950: '#060608',
          900: '#0A0B0F',
          850: '#101217',
          800: '#161821',
          750: '#1D202B',
          700: '#252937',
          600: '#34394D',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FBF4D8 0%, #D4AF37 50%, #9B741E 100%)',
        'gold-gradient-soft': 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.02) 100%)',
        'dark-radial': 'radial-gradient(circle at 50% 30%, #171922 0%, #08090C 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(26,28,38,0.7) 0%, rgba(14,15,22,0.85) 100%)',
      },
      boxShadow: {
        'gold-sm': '0 0 15px rgba(212, 175, 55, 0.2)',
        'gold-md': '0 0 30px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 50px rgba(212, 175, 55, 0.45)',
        'inner-gold': 'inset 0 1px 1px 0 rgba(212, 175, 55, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
