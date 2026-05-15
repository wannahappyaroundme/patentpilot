import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1240px",
      },
    },
    extend: {
      colors: {
        // NextUnicorn-inspired palette
        brand: {
          DEFAULT: "#006EFF",
          50: "#EAF3FF",
          100: "#D5E7FF",
          200: "#A8CDFF",
          300: "#7AB3FF",
          400: "#3A8DFF",
          500: "#006EFF",
          600: "#005ED9",
          700: "#0049A8",
          800: "#003577",
          900: "#001E47",
        },
        accent: "#00E4DF",
        ink: {
          900: "#262626",
          700: "#424242",
          500: "#616161",
          300: "#9E9E9E",
          200: "#BDBDBD",
          100: "#E0E0E0",
          50: "#F5F5F5",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "'Pretendard Variable'",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "'Helvetica Neue'",
          "'Apple SD Gothic Neo'",
          "'Noto Sans KR'",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
