/** Configuración de Tailwind para Directorio.
 *  Para regenerar el CSS después de cambiar clases o colores:
 *    npm run build:css
 */
module.exports = {
  content: ["../*.html", "../*.js", "../v/**/*.html", "../v/**/*.js", "../assets/js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
