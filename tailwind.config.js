/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * CivicAI Design Tokens
 * ------------------------------------------------------------
 * Single source of truth for color, type, spacing, radius,
 * shadow, z-index and motion. Nothing in the app hardcodes
 * raw values — everything resolves through these tokens.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
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
          hover: "#1D4ED8",
          light: "#DBEAFE",
          dark: "#1E3A8A",
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

        // Semantic feedback colors
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
          foreground: "#166534",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          foreground: "#92400E",
        },
        error: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
          foreground: "#991B1B",
        },
        info: {
          DEFAULT: "#0EA5E9",
          light: "#E0F2FE",
          foreground: "#0C4A6E",
        },

        // Brand accent — sustainability / community
        brand: {
          DEFAULT: "#0D9488",
          light: "#CCFBF1",
          foreground: "#134E4A",
        },

        // AI accent — intelligence (indigo/violet family)
        ai: {
          DEFAULT: "#6366F1",
          light: "#E0E7FF",
          deep: "#4F46E5",
          foreground: "#312E81",
        },
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },

      fontSize: {
        // Fluid display scale for hero headlines
        display: ["clamp(2.25rem, 5vw, 3.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        // Semantic type hierarchy — centralized so pages stop guessing sizes
        h1: ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        h2: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        h3: ["1.125rem", { lineHeight: "1.4" }],
        h4: ["1rem", { lineHeight: "1.5" }],
        "body-lg": ["1rem", { lineHeight: "1.6" }],
        body: ["0.875rem", { lineHeight: "1.55" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5" }],
        caption: ["0.75rem", { lineHeight: "1.45" }],
        label: ["0.8125rem", { lineHeight: "1.25", fontWeight: "500" }],
        button: ["0.875rem", { lineHeight: "1", fontWeight: "500" }],
      },

      borderRadius: {
        // Spec: 6 / 10 / 14 / 18 / pill
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
        pill: "999px",
      },

      boxShadow: {
        // Cards rely on border + subtle shadow + spacing
        soft: "0 1px 2px 0 rgb(15 23 42 / 0.05)",
        card: "0 1px 3px 0 rgb(15 23 42 / 0.05), 0 4px 16px -6px rgb(15 23 42 / 0.08)",
        lift: "0 2px 4px 0 rgb(15 23 42 / 0.05), 0 12px 32px -12px rgb(15 23 42 / 0.16)",
        "ai-glow": "0 8px 32px -8px rgb(99 102 241 / 0.35)",
      },

      zIndex: {
        header: "50",
        overlay: "100",
        dropdown: "500",
        modal: "1000",
        toast: "1100",
      },

      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "350ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "zoom-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "zoom-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.96)" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-8px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(8px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "gradient-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.9" },
          "50%": { opacity: "0.25" },
        },
        dash: {
          to: { strokeDashoffset: "48" },
        },
        sweep: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
      },

      animation: {
        "fade-in": "fade-in 250ms ease-out both",
        "fade-out": "fade-out 200ms ease-out both",
        "zoom-in": "zoom-in 250ms ease-out both",
        "zoom-out": "zoom-out 200ms ease-out both",
        "slide-in-from-top": "slide-in-from-top 250ms ease-out both",
        "slide-in-from-bottom": "slide-in-from-bottom 250ms ease-out both",
        "slide-in-from-left": "slide-in-from-left 250ms ease-out both",
        "slide-in-from-right": "slide-in-from-right 250ms ease-out both",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
        "gradient-pan": "gradient-pan 6s ease infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        twinkle: "twinkle 3s ease-in-out infinite",
        dash: "dash 1.2s linear infinite",
        sweep: "sweep 4s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
