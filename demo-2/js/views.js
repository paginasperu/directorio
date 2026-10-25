import { escapeHtml, formatDate, getSaving, money } from "../../shared/data.js";

function location(profile) {
  return [profile.floor ? `Piso ${profile.floor}` : "", profile.unit ? `Local ${profile.unit}` : ""].filter(Boolean).join(" · ");
}

function bestPromo(profile) {
  return [...profile.promos].sort((a, b) => getSaving(b) - getSaving(a))[0] || null;
}

export function categoryCard(category, count, profile) {
  const image = profile?.banner || "";
  return `<button type="button" class="cat-card" data-category="${escapeHtml(category)}">
      <img src="${escapeHtml(image)}" alt="" loading="lazy">
      <span>
        <span class="cat-name">${escapeHtml(category)}</span>
        <span class="cat-count">${count} ${count === 1 ? "negocio" : "negocios"}</span>
      </span>
    </button>`;
}

export function deal(promo) {
  const saving = getSaving(promo);
  const profile = promo.profile;
  return `<button type="button" class="deal" data-id="${profile.id}">
      <span class="deal-media">
        <img src="${escapeHtml(promo.image)}" alt="" loading="lazy">
        <span class="deal-off">${saving ? `−${Math.round((saving / promo.regular) * 100)}%` : escapeHtml(promo.mode || promo.type)}</span>
      </span>
      <span class="deal-body">
        <span class="deal-title">${escapeHtml(promo.title)}</span>
        ${saving ? `<span class="deal-price">${money(promo.discounted)}<s>${money(promo.regular)}</s></span>` : `<span class="deal-meta">${escapeHtml(promo.type)}${promo.mode ? ` · ${escapeHtml(promo.mode)}` : ""}</span>`}
        <span class="deal-meta">${escapeHtml(profile.name)} · ${escapeHtml(profile.floor ? `Piso ${profile.floor}` : "")}</span>
      </span>
    </button>`;
}

export function block(category, profiles) {
  return `<section class="block">
      <div class="block-head">
        <h3>${escapeHtml(category)}</h3>
        <button type="button" data-category="${escapeHtml(category)}">Ver todo</button>
      </div>
      <div class="block-grid">${profiles.map(mini).join("")}</div>
    </section>`;
}

function mini(profile) {
  const promo = bestPromo(profile);
  const saving = promo ? getSaving(promo) : 0;
  return `<button type="button" class="mini" data-id="${profile.id}">
      <span class="mini-media"><img src="${escapeHtml(profile.banner)}" alt="" loading="lazy"></span>
      <span class="mini-name">${escapeHtml(profile.name)}</span>
      <span class="mini-sub">${saving ? money(promo.discounted) : escapeHtml(profile.type)}</span>
    </button>`;
}

export function resultRow(profile) {
  const promo = bestPromo(profile);
  const saving = promo ? getSaving(promo) : 0;
  return `<button type="button" class="result" data-id="${profile.id}">
      <img src="${escapeHtml(profile.logo)}" alt="" loading="lazy">
      <span>
        <span class="result-name">${escapeHtml(profile.name)}</span>
        <span class="result-meta">${escapeHtml(profile.category)} · ${escapeHtml(location(profile) || profile.type)}</span>
        <span class="result-desc">${escapeHtml(profile.short)}</span>
      </span>
      <span class="result-price">
        ${saving ? `<strong>${money(promo.discounted)}</strong><s>${money(promo.regular)}</s>` : `<strong>${profile.promos.length} ofertas</strong>`}
      </span>
    </button>`;
}

export function sheet(profile) {
  const promo = bestPromo(profile);
  const saving = promo ? getSaving(promo) : 0;

  const promos = profile.promos.map((item) => {
    const save = getSaving(item);
    return `<div class="promo-line">
      <span class="promo-tag">${escapeHtml(item.type)}${item.mode ? ` · ${escapeHtml(item.mode)}` : ""}</span>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.description)}</p>
      <p>${save ? `<strong>${money(item.discounted)}</strong> <s style="color:#8a8a8e">${money(item.regular)}</s> · ` : ""}Hasta ${escapeHtml(formatDate(item.until))}</p>
    </div>`;
  }).join("");

  return `<button type="button" class="sheet-close" data-close aria-label="Cerrar">×</button>
    <div class="sheet-grid">
      <div class="sheet-media">
        <img src="${escapeHtml(profile.banner)}" alt="" width="600" height="300">
        <div class="sheet-thumbs">
          ${profile.promos.map((item) => `<img src="${escapeHtml(item.image)}" alt="">`).join("")}
        </div>
      </div>
      <div>
        <p class="sheet-kicker">${escapeHtml(profile.category)} · ${escapeHtml(profile.type)}</p>
        <h2 class="sheet-title" id="sheetTitle">${escapeHtml(profile.name)}</h2>
        <p class="sheet-lead">${escapeHtml(profile.long || profile.short)}</p>

        <div class="buybox">
          ${saving ? `<div class="buybox-price">${money(promo.discounted)}<s>${money(promo.regular)}</s></div>
          <div class="buybox-sub">Ahorras ${money(saving)} en ${escapeHtml(promo.title)}</div>` : `<div class="buybox-price">${profile.promos.length} ofertas</div>
          <div class="buybox-sub">Premios y beneficios disponibles</div>`}
          <div class="buybox-actions">
            ${profile.whatsapp ? `<a class="primary" href="https://wa.me/${profile.whatsapp}" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>` : ""}
            ${profile.fixed ? `<a class="secondary" href="tel:${profile.fixed}">Llamar al negocio</a>` : ""}
          </div>
        </div>

        <div style="margin-top:14px">
          <div class="info-row"><span>Ubicación</span><span>${escapeHtml(location(profile) || "—")}</span></div>
          ${profile.fixed ? `<div class="info-row"><span>Teléfono</span><span>${escapeHtml(profile.fixed)}</span></div>` : ""}
          ${profile.whatsapp ? `<div class="info-row"><span>WhatsApp</span><span>${escapeHtml(profile.whatsapp)}</span></div>` : ""}
          <div class="info-row"><span>Categoría</span><span>${escapeHtml(profile.category)}</span></div>
        </div>

        ${profile.promos.length ? `<div style="margin-top:16px"><h3 style="margin:0 0 4px;font-size:13px;font-weight:800">Ofertas</h3>${promos}</div>` : ""}
      </div>
    </div>`;
}
