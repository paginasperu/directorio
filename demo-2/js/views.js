import { escapeHtml, formatDate, getSaving, money } from "../../shared/data.js";

export function row(profile) {
  const location = [profile.floor ? `Piso ${profile.floor}` : "", profile.unit ? `Local ${profile.unit}` : ""].filter(Boolean).join(" · ");
  const promo = profile.promos[0];
  const badge = promo ? promoBadge(promo) : "";
  const whatsapp = profile.whatsapp ? `https://wa.me/${profile.whatsapp}` : "";

  return `<button type="button" class="row" data-id="${profile.id}">
    <span class="cell-name">
      <img src="${escapeHtml(profile.logo)}" alt="" width="34" height="34" loading="lazy">
      <span>
        <span class="name">${escapeHtml(profile.name)}</span>
        <span class="desc">${escapeHtml(profile.short)}</span>
      </span>
    </span>
    <span class="rubro">${escapeHtml(profile.type)}</span>
    <span class="ubi">${escapeHtml(location || "—")}</span>
    <span class="cell-promo">${badge}</span>
    <span class="action">${whatsapp
      ? `<a class="wa" href="${whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`
      : '<span class="none">—</span>'}</span>
  </button>`;
}

function promoBadge(promo) {
  const saving = getSaving(promo);
  if (saving) return `<span class="pill">−${Math.round((saving / promo.regular) * 100)}%</span>`;
  return `<span class="pill muted">${escapeHtml(promo.mode || promo.type)}</span>`;
}

export function detail(profile) {
  const location = [profile.floor ? `Piso ${profile.floor}` : "", profile.unit ? `Local ${profile.unit}` : ""].filter(Boolean).join(" · ");

  const promos = profile.promos.map((promo) => {
    const saving = getSaving(promo);
    return `<div class="m-promo">
      <div>
        <span class="pill">${escapeHtml(promo.type)}</span>
        ${promo.mode ? `<span class="pill muted">${escapeHtml(promo.mode)}</span>` : ""}
        <h4>${escapeHtml(promo.title)}</h4>
        <p>${escapeHtml(promo.description)}</p>
        <p style="color:#86868b">Vigente hasta ${escapeHtml(formatDate(promo.until))}</p>
      </div>
      ${saving ? `<div class="m-price"><strong>${money(promo.discounted)}</strong><s>${money(promo.regular)}</s></div>` : ""}
    </div>`;
  }).join("");

  return `
    <div class="m-cover">
      <img src="${escapeHtml(profile.banner)}" alt="" width="600" height="300">
      <button type="button" class="m-close" data-close aria-label="Cerrar">×</button>
    </div>
    <div class="m-body">
      <p class="m-kicker">${escapeHtml(profile.category)} · ${escapeHtml(profile.type)}</p>
      <h2 class="m-title" id="modalTitle">${escapeHtml(profile.name)}</h2>
      <p class="m-lead">${escapeHtml(profile.long || profile.short)}</p>
      <dl class="m-info">
        ${location ? `<div><dt>Ubicación</dt><dd>${escapeHtml(location)}</dd></div>` : ""}
        ${profile.fixed ? `<div><dt>Teléfono</dt><dd>${escapeHtml(profile.fixed)}</dd></div>` : ""}
        ${profile.whatsapp ? `<div><dt>WhatsApp</dt><dd>${escapeHtml(profile.whatsapp)}</dd></div>` : ""}
      </dl>
      ${profile.promos.length ? `<section class="m-section"><h3>Promociones (${profile.promos.length})</h3>${promos}</section>` : ""}
      <div class="m-actions">
        ${profile.whatsapp ? `<a class="primary" href="https://wa.me/${profile.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ""}
        ${profile.fixed ? `<a class="ghost" href="tel:${profile.fixed}">Llamar</a>` : ""}
        <button type="button" class="ghost" data-close>Cerrar</button>
      </div>
    </div>`;
}
