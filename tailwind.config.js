/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      colors: {
        // Light Theme Colors
        background: {
          DEFAULT: "#ffffff",
          dark: "#0a0a0a",
        },
        foreground: {
          DEFAULT: "#0a0a0a",
          dark: "#fafafa",
        },
        card: {
          DEFAULT: "#f5f5f5",
          dark: "#141414",
          foreground: "#0a0a0a",
          "foreground-dark": "#fafafa",
        },
        popover: {
          DEFAULT: "#ffffff",
          dark: "#141414",
          foreground: "#0a0a0a",
          "foreground-dark": "#fafafa",
        },
        primary: {
          DEFAULT: "#171717",
          dark: "#fafafa",
          foreground: "#fafafa",
          "foreground-dark": "#171717",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          dark: "#262626",
          foreground: "#171717",
          "foreground-dark": "#fafafa",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          dark: "#262626",
          foreground: "#737373",
          "foreground-dark": "#a3a3a3",
        },
        accent: {
          DEFAULT: "#f5f5f5",
          dark: "#333333",
          foreground: "#171717",
          "foreground-dark": "#fafafa",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fafafa",
        },
        border: {
          DEFAULT: "#e5e5e5",
          dark: "#2e2e2e",
        },
        input: {
          DEFAULT: "#e5e5e5",
          dark: "#2e2e2e",
        },
        ring: {
          DEFAULT: "#a3a3a3",
          dark: "#595959",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
