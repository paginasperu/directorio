/** Configuración de Tailwind para Full Market.
 *  Para regenerar el CSS después de cambiar clases o colores:
 *    npm run build:css
 */
module.exports = {
  content: ["./index.html", "./scripts.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95"
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706"
        }
      }
    }
  },
  plugins: []
};
