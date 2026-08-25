import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F1B35",
          50: "#E8EBF2",
          100: "#C5CCE0",
          200: "#9FACCA",
          300: "#788BB4",
          400: "#5A71A2",
          500: "#3D5990",
          600: "#2D4478",
          700: "#1F3060",
          800: "#0F1B35",
          900: "#060D1A",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#C9A84C",
          50: "#FDF8EC",
          100: "#F9EDC8",
          200: "#F0D88A",
          300: "#E6C45C",
          400: "#C9A84C",
          500: "#A8883A",
          600: "#87692C",
          700: "#664F1F",
          800: "#453413",
          900: "#241A07",
          foreground: "#FFFFFF",
        },
        background: "#F8F9FC",
        foreground: "#1A1A2E",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A2E",
        },
        border: "#E2E8F0",
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.07)",
        "card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.10)",
        premium: "0 20px 60px -10px rgba(15, 27, 53, 0.25)",
        glow: "0 0 30px rgba(201, 168, 76, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern": "linear-gradient(135deg, #0F1B35 0%, #1A2F5A 50%, #0F1B35 100%)",
        "gold-shine": "linear-gradient(90deg, #C9A84C 0%, #E6C45C 50%, #C9A84C 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
