import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}", // Only if using `pages` directory
  ],
  theme: {
    extend: {
    }
  },
  plugins: [],
};

export default config;
