import { escapeHtml, formatDate, getSaving, money } from "../../shared/data.js";

function location(profile) {
  return [profile.floor ? `Piso ${profile.floor}` : "", profile.unit ? `Local ${profile.unit}` : ""].filter(Boolean).join(" · ");
}

function badge(promo) {
  const saving = getSaving(promo);
  return saving ? `−${Math.round((saving / promo.regular) * 100)}%` : (promo.mode || promo.type);
}

export function feature(profile) {
  return `<div class="feature-media">
      <img src="${escapeHtml(profile.banner)}" alt="${escapeHtml(profile.name)}" width="600" height="300">
    </div>
    <div>
      <p class="feature-kicker">Portada · ${escapeHtml(profile.category)}</p>
      <h2>${escapeHtml(profile.name)}</h2>
      <p>${escapeHtml(profile.long || profile.short)}</p>
      <div class="feature-meta">
        <span>${escapeHtml(location(profile) || "—")}</span>
        <span>${escapeHtml(profile.type)}</span>
      </div>
      <button type="button" class="feature-link" data-id="${profile.id}">Leer la ficha →</button>
    </div>`;
}

export function offer(promo) {
  const saving = getSaving(promo);
  return `<button type="button" class="offer" data-id="${promo.profile.id}">
    <span class="offer-price">${saving ? money(promo.discounted) : "Gratis"}</span>
    <span class="offer-title">${escapeHtml(promo.title)}</span>
    <span class="offer-meta">${escapeHtml(promo.profile.name)} · ${escapeHtml(badge(promo))}</span>
  </button>`;
}

export function entry(profile, index) {
  const promo = profile.promos[0];
  return `<button type="button" class="entry" data-id="${profile.id}">
    <span class="entry-index">${String(index + 1).padStart(2, "0")}</span>
    <span>
      <span class="entry-cat">${escapeHtml(profile.category)}</span>
      <span class="entry-name">${escapeHtml(profile.name)}</span>
      <span class="entry-desc">${escapeHtml(profile.short)}</span>
      <span class="entry-meta">${escapeHtml(location(profile) || profile.type)}</span>
    </span>
    ${promo ? `<span class="entry-promo">${escapeHtml(badge(promo))}</span>` : ""}
  </button>`;
}

export function detail(profile) {
  const promos = profile.promos.map((promo) => {
    const saving = getSaving(promo);
    return `<div class="m-promo">
      <h4>${escapeHtml(promo.title)}</h4>
      <p>${escapeHtml(promo.description)}</p>
      <p>${saving ? `<span class="m-price">${money(promo.discounted)}<s>${money(promo.regular)}</s></span> · ` : ""}${escapeHtml(promo.type)}${promo.mode ? ` · ${escapeHtml(promo.mode)}` : ""} · Hasta ${escapeHtml(formatDate(promo.until))}</p>
    </div>`;
  }).join("");

  return `<div class="m-cover">
      <img src="${escapeHtml(profile.banner)}" alt="" width="600" height="300">
      <button type="button" class="m-close" data-close aria-label="Cerrar">×</button>
    </div>
    <div class="m-body">
      <p class="m-kicker">${escapeHtml(profile.category)} · ${escapeHtml(profile.type)}</p>
      <h2 class="m-title" id="modalTitle">${escapeHtml(profile.name)}</h2>
      <p class="m-lead">${escapeHtml(profile.long || profile.short)}</p>
      <div class="m-columns">
        <div>
          <p class="m-section-title">Ficha</p>
          <dl class="m-info">
            ${location(profile) ? `<div><dt>Ubicación</dt><dd>${escapeHtml(location(profile))}</dd></div>` : ""}
            ${profile.fixed ? `<div><dt>Teléfono</dt><dd>${escapeHtml(profile.fixed)}</dd></div>` : ""}
            ${profile.whatsapp ? `<div><dt>WhatsApp</dt><dd>${escapeHtml(profile.whatsapp)}</dd></div>` : ""}
          </dl>
        </div>
        <div>
          <p class="m-section-title">Ofertas (${profile.promos.length})</p>
          ${promos || '<p class="m-lead">Sin ofertas en esta edición.</p>'}
        </div>
      </div>
      <div class="m-actions">
        ${profile.whatsapp ? `<a class="primary" href="https://wa.me/${profile.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ""}
        ${profile.fixed ? `<a href="tel:${profile.fixed}">Llamar</a>` : ""}
        <button type="button" data-close>Cerrar</button>
      </div>
    </div>`;
}
