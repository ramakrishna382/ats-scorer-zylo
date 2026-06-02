/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Slate-Dark Theme (Strictly NO Purple/Violet/Indigo!)
        brand: {
          dark: '#030712',      // Deep space black
          card: '#0f172a',      // Rich slate card
          border: '#334155',    // Steel slate border
          text: '#f8fafc',      // Crisp white
          muted: '#94a3b8',     // Muted steel grey
          
          // Accent Palette
          emerald: '#10b981',   // Successful matches/high scores
          amber: '#f59e0b',     // Warning/partial matches
          rose: '#f43f5e',      // Danger/missing skills
          cyan: '#06b6d4',      // Premium tech glow
        }
      },

      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
