// frontend/tailwind.config.js

const colors = require('tailwindcss/colors');

module.exports = {
  // Configure files to scan for Tailwind classes
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // You can customize your color palette here
        emerald: colors.emerald,
        gray: colors.neutral, // Using neutral gray for a more modern look
      },
      fontFamily: {
        // Set a custom default font for the project
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    // Add official Tailwind plugins here
    require('@tailwindcss/forms'),
  ],
}