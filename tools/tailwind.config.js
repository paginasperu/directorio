/** Configuración de Tailwind para Directorio.
 *  Para regenerar el CSS después de cambiar clases o colores:
 *    npm run build:css
 */
module.exports = {
  content: ["../*.html", "../*.js", "../versions/**/*.html", "../versions/**/*.js", "../assets/js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
