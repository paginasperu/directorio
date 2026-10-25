// Capa de vistas: solo HTML. No conoce el estado ni los eventos.

import { escapeHtml, formatDate, getSaving, listValues, money } from "../assets/js/data.js";

export function businessCard(profile) {
  const location = [
    profile.floor ? `Piso ${profile.floor}` : "",
    profile.unit ? `Local ${profile.unit}` : "",
  ].filter(Boolean).join(" · ");
  const whatsapp = profile.whatsapp ? `https://wa.me/${profile.whatsapp}` : "";

  return `<article class="d1-card">
    <button type="button" class="d1-hit" data-detail="${profile.id}" aria-label="Ver ficha de ${escapeHtml(profile.name)}">
      <span class="d1-cover">
        <img class="d1-banner" src="${escapeHtml(profile.banner)}" alt="" width="600" height="300" loading="lazy" decoding="async">
        <span class="d1-cat">${escapeHtml(profile.category)}</span>
        <img class="d1-logo" src="${escapeHtml(profile.logo)}" alt="" width="56" height="56" loading="lazy" decoding="async">
      </span>
      <span class="d1-body">
        <span class="d1-name">${escapeHtml(profile.name)}</span>
        <span class="d1-desc">${escapeHtml(profile.short)}</span>
      </span>
    </button>
    <div class="d1-footer">
      <span class="d1-loc">${escapeHtml(location || "Ubicación no informada")}</span>
      ${whatsapp
        ? `<a class="provider-whatsapp" href="${whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de ${escapeHtml(profile.name)}">WhatsApp</a>`
        : '<span class="provider-whatsapp provider-whatsapp-unavailable">Sin WhatsApp</span>'}
    </div>
  </article>`;
}

export function promoCard(promo) {
  const saving = getSaving(promo);
  const discount = saving ? Math.round((saving / promo.regular) * 100) : 0;
  const badge = discount ? `−${discount}%` : (promo.mode || promo.type);

  return `<article class="d1-pcard">
    <button type="button" class="d1-hit" data-promo="${promo.id}" aria-label="Ver promoción ${escapeHtml(promo.title)}">
      <span class="d1-cover">
        <img class="d1-banner" src="${escapeHtml(promo.image)}" alt="" width="600" height="300" loading="lazy" decoding="async">
        <span class="d1-cat">${escapeHtml(promo.category)}</span>
        <span class="d1-promo">${escapeHtml(badge)}</span>
      </span>
      <span class="d1-body">
        <span class="d1-name">${escapeHtml(promo.title)}</span>
        <span class="d1-desc">Ofrecido por ${escapeHtml(promo.profile?.name || "")}</span>
      </span>
    </button>
    <div class="d1-footer">
      ${promo.discounted > 0
        ? `<span class="d1-pcard-price">${money(promo.discounted)}${promo.regular > promo.discounted ? ` <s>${money(promo.regular)}</s>` : ""}</span>`
        : `<span class="d1-loc">${promo.until ? `Hasta ${escapeHtml(formatDate(promo.until))}` : ""}</span>`}
      ${saving ? `<span class="d1-save">Ahorras ${money(saving)}</span>` : ""}
    </div>
  </article>`;
}

function promoRow(promo) {
  const saving = getSaving(promo);
  return `<li class="d1-promo-card">
    <div class="d1-promo-main">
      <div class="d1-promo-info">
        <div class="d1-tags">
          <span class="d1-tag">${escapeHtml(promo.type)}</span>
          ${promo.mode ? `<span class="d1-tag is-soft">${escapeHtml(promo.mode)}</span>` : ""}
        </div>
        <p class="d1-promo-title">${escapeHtml(promo.title)}</p>
        <p class="d1-promo-text">${escapeHtml(promo.description)}</p>
      </div>
      ${promo.discounted > 0 ? `<div class="d1-promo-price">
        <strong>${money(promo.discounted)}</strong>
        ${promo.regular > promo.discounted ? `<s>${money(promo.regular)}</s>` : ""}
        ${saving ? `<span class="d1-save">Ahorras ${money(saving)}</span>` : ""}
      </div>` : ""}
    </div>
    <div class="d1-promo-foot">
      <span>${promo.until ? `Hasta ${escapeHtml(formatDate(promo.until))}` : ""}</span>
      ${promo.conditions ? `<details class="d1-more"><summary>Ver condiciones</summary><p>${escapeHtml(promo.conditions)}</p></details>` : ""}
    </div>
  </li>`;
}

export function businessDetail(profile, backPromoId) {
  const socials = [
    { label: "Instagram", url: profile.instagram },
    { label: "Facebook", url: profile.facebook },
    { label: "TikTok", url: profile.tiktok },
  ].filter((social) => social.url);
  const catalog = listValues(profile.catalog);
  const location = [
    profile.floor ? `Piso ${profile.floor}` : "",
    profile.unit ? `Local ${profile.unit}` : "",
  ].filter(Boolean).join(" · ");

  return `
    ${backPromoId ? `<button type="button" class="d1-back" data-back-promo="${escapeHtml(backPromoId)}">← Volver a la promoción</button>` : ""}
    <div class="d1-modal-cover">
      <img src="${escapeHtml(profile.banner)}" alt="" width="600" height="300">
      <img class="d1-modal-logo" src="${escapeHtml(profile.logo)}" alt="" width="64" height="64">
    </div>
    <div class="d1-modal-body p-5 sm:p-7 space-y-5">
      <div>
        <p class="d1-kicker">${escapeHtml(profile.category)} · ${escapeHtml(profile.type)}</p>
        <h2 id="modalTitle" class="d1-title">${escapeHtml(profile.name)}</h2>
        <p class="d1-lead">${escapeHtml(profile.long || profile.short)}</p>
      </div>
      <dl class="detail-info">
        ${location ? `<div><dt>Ubicación</dt><dd>${escapeHtml(location)}</dd></div>` : ""}
        ${profile.fixed ? `<div><dt>Teléfono</dt><dd>${escapeHtml(profile.fixed)}</dd></div>` : ""}
        ${profile.whatsapp ? `<div><dt>WhatsApp</dt><dd>${escapeHtml(profile.whatsapp)}</dd></div>` : ""}
      </dl>
      ${profile.promos.length ? `<section>
        <div class="d1-promos-head"><h3 class="d1-section-title">Promociones</h3><span class="d1-count">${profile.promos.length}</span></div>
        <ul class="d1-promos">${profile.promos.map(promoRow).join("")}</ul>
      </section>` : ""}
      ${catalog.length ? `<section><h3 class="d1-section-title">Productos y servicios</h3><ul class="d1-chips">${catalog.map((value) => `<li class="d1-chip is-filled">${escapeHtml(value)}</li>`).join("")}</ul></section>` : ""}
      ${socials.length ? `<section><h3 class="d1-section-title">Redes sociales</h3><div class="d1-chips">${socials.map((social) => `<a class="d1-chip is-social" href="${escapeHtml(social.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(social.label)}</a>`).join("")}</div></section>` : ""}
    </div>`;
}

export function promoDetail(promo) {
  const profile = promo.profile || {};
  const saving = getSaving(promo);

  return `
    <div class="d1-modal-cover">
      <img src="${escapeHtml(promo.image)}" alt="" width="600" height="300">
      <span class="d1-cat">${escapeHtml(promo.category)}</span>
    </div>
    <div class="d1-modal-body p-5 sm:p-7 space-y-5">
      <div>
        <div class="d1-tags">
          <span class="d1-tag">${escapeHtml(promo.type)}</span>
          ${promo.mode ? `<span class="d1-tag is-soft">${escapeHtml(promo.mode)}</span>` : ""}
        </div>
        <h2 id="modalTitle" class="d1-promo-hero">${escapeHtml(promo.title)}</h2>
        <p class="d1-promo-hero-text">${escapeHtml(promo.description)}</p>
      </div>
      ${promo.discounted > 0 ? `<div class="d1-price-block">
        <div><strong>${money(promo.discounted)}</strong><s>${money(promo.regular)}</s></div>
        ${saving ? `<span class="d1-save">Ahorras ${money(saving)}</span>` : ""}
      </div>` : ""}
      <dl class="detail-info">
        ${promo.until ? `<div><dt>Vigente hasta</dt><dd>${escapeHtml(formatDate(promo.until))}</dd></div>` : ""}
        <div><dt>Categoría</dt><dd>${escapeHtml(promo.category)}</dd></div>
      </dl>
      ${promo.conditions ? `<section><h3 class="d1-section-title">Condiciones</h3><p class="d1-cond-text">${escapeHtml(promo.conditions)}</p></section>` : ""}
      <section>
        <h3 class="d1-section-title">Ofrecido por</h3>
        <button type="button" class="d1-offered-card" data-business="${profile.id}">
          <img src="${escapeHtml(profile.logo || "")}" alt="" width="44" height="44">
          <span class="d1-offered-info">
            <span class="d1-offered-name">${escapeHtml(profile.name || "")}</span>
            <span class="d1-offered-meta">${escapeHtml(profile.type || "")}${profile.floor ? ` · Piso ${escapeHtml(profile.floor)}` : ""}</span>
          </span>
          <span class="d1-offered-link">Ver ficha</span>
        </button>
      </section>
    </div>`;
}
