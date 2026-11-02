// La franja se decide en el head; la oferta nativa cambia la acción, no su altura.
const banner = document.querySelector('#installBanner');
const install = document.querySelector('#installApp');
const dismiss = document.querySelector('#dismissInstall');
const guide = document.querySelector('#installGuide');
const standalone = window.matchMedia('(display-mode: standalone)');
const key = 'directorio.install.dismissedUntil';
const cooldown = 30 * 24 * 60 * 60 * 1000;
let promptEvent;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function isInstalled() {
  return standalone.matches || navigator.standalone === true;
}
function dismissed() {
  try { return Number(localStorage.getItem(key)) > Date.now(); }
  catch { return false; }
}
function hideForNow() {
  try { localStorage.setItem(key, String(Date.now() + cooldown)); }
  catch { /* La instalación sigue funcionando si el almacenamiento no está disponible. */ }
  banner.hidden = true;
}
function refresh() {
  banner.hidden = isInstalled() || dismissed();
}
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  promptEvent = event;
  refresh();
});
window.addEventListener('appinstalled', () => {
  promptEvent = undefined;
  hideForNow();
});
standalone.addEventListener('change', refresh);
dismiss.addEventListener('click', hideForNow);
install.addEventListener('click', async () => {
  if (!promptEvent) {
    const steps = isIOS
      ? ['En Safari, toca Compartir', 'Elige Añadir a pantalla de inicio', 'Confirma con Añadir']
      : /Android/.test(navigator.userAgent)
        ? ['Abre el menú ⋮ de Chrome', 'Busca Añadir a pantalla de inicio o Instalar aplicación', 'Confirma la instalación si el navegador la ofrece']
        : ['Abre el menú de tu navegador', 'Busca la opción para instalar esta página como aplicación', 'Si no aparece, puedes seguir utilizando Directorio desde el navegador'];
    guide.querySelector('ol').replaceChildren(...steps.map((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
    guide.showModal();
    return;
  }
  const current = promptEvent;
  promptEvent = undefined;
  install.disabled = true;
  try {
    await current.prompt();
    const result = await current.userChoice;
    if (result.outcome === 'dismissed') hideForNow();
  } catch {
    // El navegador puede retirar la oferta de instalación entre eventos.
  } finally {
    install.disabled = false;
    refresh();
  }
});
refresh();
