import { escapeHtml, formatDate, getSaving, money } from "../../shared/data.js";

function location(profile) {
  return [profile.floor ? `Piso ${profile.floor}` : "", profile.unit ? `Local ${profile.unit}` : ""].filter(Boolean).join(" · ");
}

function offLabel(promo) {
  const saving = getSaving(promo);
  return saving ? `−${Math.round((saving / promo.regular) * 100)}%` : (promo.mode || promo.type);
}

function bestPromo(profile) {
  return [...profile.promos].sort((a, b) => getSaving(b) - getSaving(a))[0] || null;
}

export function hero(profile, stats) {
  if (!profile) return "";
  return `<button type="button" class="hero-cover" data-id="${profile.id}">
      <img src="${escapeHtml(profile.banner)}" alt="" width="600" height="300">
      <span class="hero-body">
        <span class="hero-eyebrow">Destacado de la semana</span>
        <span class="hero-name">${escapeHtml(profile.name)}</span>
        <span class="hero-desc">${escapeHtml(profile.short)}</span>
        <span class="hero-meta"><span>${escapeHtml(profile.category)}</span><span>${escapeHtml(location(profile) || "—")}</span></span>
      </span>
    </button>
    <div class="hero-side">
      <div class="stat">
        <span class="stat-label">Promociones activas</span>
        <span class="stat-value">${stats.promos}</span>
        <span class="stat-sub">${stats.premios} premios · ${stats.descuentos} descuentos</span>
      </div>
      <div class="stat light">
        <span class="stat-label">Negocios en el directorio</span>
        <span class="stat-value">${stats.negocios}</span>
        <span class="stat-sub">${stats.categorias} categorías</span>
      </div>
    </div>`;
}

export function tile(profile, index) {
  const promo = bestPromo(profile);
  const saving = promo ? getSaving(promo) : 0;
  const variant = index % 9 === 0 ? "wide media" : index % 5 === 0 ? "media" : index % 7 === 3 ? "dark" : "compact";
  const label = promo ? offLabel(promo) : "";
  const price = saving ? money(promo.discounted) : "";

  const top = `<span class="tile-top">
      <span class="tile-cat">${escapeHtml(profile.category)}</span>
      ${promo ? `<span class="tile-off">${escapeHtml(label)}</span>` : ""}
    </span>`;

  if (variant.includes("media")) {
    return `<button type="button" class="tile ${variant}" data-id="${profile.id}">
        <img class="tile-media" src="${escapeHtml(profile.banner)}" alt="" width="600" height="300" loading="lazy">
        ${top}
        <span class="tile-name">${escapeHtml(profile.name)}</span>
        <span class="tile-sub">${escapeHtml(location(profile) || profile.type)}</span>
        ${price ? `<span class="tile-price">${price}<s>${money(promo.regular)}</s></span>` : ""}
      </button>`;
  }

  return `<button type="button" class="tile ${variant}" data-id="${profile.id}">
      ${top}
      <img class="tile-logo" src="${escapeHtml(profile.logo)}" alt="" width="44" height="44" loading="lazy">
      <span class="tile-name">${escapeHtml(profile.name)}</span>
      <span class="tile-sub">${escapeHtml(profile.type)}</span>
      ${price ? `<span class="tile-price">${price}<s>${money(promo.regular)}</s></span>` : ""}
    </button>`;
}

export function sheet(profile) {
  const promos = profile.promos.map((promo) => {
    const saving = getSaving(promo);
    return `<div class="s-promo">
      <span class="tile-off" style="background:#eef4ff;color:#0a6fd8">${escapeHtml(promo.type)}${promo.mode ? ` · ${escapeHtml(promo.mode)}` : ""}</span>
      <h4>${escapeHtml(promo.title)}</h4>
      <p>${escapeHtml(promo.description)}</p>
      ${saving ? `<div class="s-price"><strong>${money(promo.discounted)}</strong><s>${money(promo.regular)}</s><span style="font-size:11px;color:#8b8c93">Ahorras ${money(saving)}</span></div>` : ""}
      <p style="margin-top:6px;color:#8b8c93">Hasta ${escapeHtml(formatDate(promo.until))}</p>
    </div>`;
  }).join("");

  return `<div class="s-cover">
      <img src="${escapeHtml(profile.banner)}" alt="" width="600" height="300">
      <button type="button" class="s-close" data-close aria-label="Cerrar">×</button>
    </div>
    <div class="s-body">
      <p class="s-kicker">${escapeHtml(profile.category)} · ${escapeHtml(profile.type)}</p>
      <h2 class="s-title" id="sheetTitle">${escapeHtml(profile.name)}</h2>
      <p class="s-lead">${escapeHtml(profile.long || profile.short)}</p>
      <dl class="s-info">
        ${location(profile) ? `<div><dt>Ubicación</dt><dd>${escapeHtml(location(profile))}</dd></div>` : ""}
        ${profile.fixed ? `<div><dt>Teléfono</dt><dd>${escapeHtml(profile.fixed)}</dd></div>` : ""}
        ${profile.whatsapp ? `<div><dt>WhatsApp</dt><dd>${escapeHtml(profile.whatsapp)}</dd></div>` : ""}
      </dl>
      ${profile.promos.length ? `<h3 style="margin:18px 0 6px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#8b8c93">Promociones</h3>${promos}` : ""}
      <div class="s-actions">
        ${profile.whatsapp ? `<a class="primary" href="https://wa.me/${profile.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ""}
        ${profile.fixed ? `<a href="tel:${profile.fixed}">Llamar</a>` : ""}
        <button type="button" data-close>Cerrar</button>
      </div>
    </div>`;
}
