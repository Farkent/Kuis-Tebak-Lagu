/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
theme: {
  extend: {
    fontFamily: { mono: ['"Space Mono"', 'monospace'] },
    borderWidth: { '3': '3px' },
  },
}
};
