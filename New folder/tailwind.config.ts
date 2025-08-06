import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // LUMINIX ECO MIND - Spotify-inspired dark theme
        luminix: {
          bg: "hsl(var(--luminix-bg))",
          "bg-darker": "hsl(var(--luminix-bg-darker))",
          surface: "hsl(var(--luminix-surface))",
          "surface-hover": "hsl(var(--luminix-surface-hover))",
          green: "hsl(var(--luminix-green))",
          "green-hover": "hsl(var(--luminix-green-hover))",
          text: "hsl(var(--luminix-text))",
          "text-muted": "hsl(var(--luminix-text-muted))",
          neon: "hsl(var(--luminix-neon))",
          glass: "hsl(var(--luminix-glass))",
        },
        // Mood-based theme colors
        mood: {
          happy: "hsl(var(--mood-happy))",
          sad: "hsl(var(--mood-sad))",
          angry: "hsl(var(--mood-angry))",
          calm: "hsl(var(--mood-calm))",
          neutral: "hsl(var(--mood-neutral))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "mood-shift": {
          "0%": { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(360deg)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "confetti": {
          "0%": { transform: "rotateZ(0deg)" },
          "100%": { transform: "rotateZ(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "mood-shift": "mood-shift 5s linear infinite",
        "shake": "shake 0.5s ease-in-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "confetti": "confetti 1s linear infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "neon": "0 0 20px hsl(var(--luminix-neon)), 0 0 40px hsl(var(--luminix-neon)), 0 0 60px hsl(var(--luminix-neon))",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "mood-happy": "0 0 30px hsl(var(--mood-happy))",
        "mood-sad": "0 0 30px hsl(var(--mood-sad))",
        "mood-angry": "0 0 30px hsl(var(--mood-angry))",
        "mood-calm": "0 0 30px hsl(var(--mood-calm))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
