/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // This is the key setting
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0', transform: 'scale(0.95)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
            },
          },
          animation: {
            fadeIn: 'fadeIn 0.15s ease-out',
          },
        },
      },
      
    plugins: [],
  };
  