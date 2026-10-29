// Demo 02: vistas y comportamiento en un solo archivo.
// Los datos viven en assets/js/data.js y son compartidos por todas las demos.

import { escapeHtml, formatDate, getSaving, listValues, loadDirectory, money, normalize } from "../../assets/js/data.js?v=29";

/* ---------- Vistas ---------- */

function primaryContact(profile) {
  if (profile.whatsapp) {
    return { href: `https://wa.me/${profile.whatsapp}`, label: "WhatsApp", external: true };
  }
  if (profile.fixed) {
    return { href: `tel:${profile.fixed}`, label: "Llamar", external: false };
  }
  if (profile.instagram) return { href: profile.instagram, label: "Instagram", external: true };
  if (profile.facebook) return { href: profile.facebook, label: "Facebook", external: true };
  if (profile.tiktok) return { href: profile.tiktok, label: "TikTok", external: true };
  return null;
}

const ICON_WHATSAPP = `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.6 2.33A7.85 7.85 0 0 0 7.99 0C3.63 0 .07 3.56.06 7.93c0 1.4.37 2.76 1.06 3.96L0 16l4.23-1.11a7.92 7.92 0 0 0 3.75.96h.01c4.36 0 7.92-3.56 7.93-7.93a7.9 7.9 0 0 0-2.32-5.59Zm-5.6 12.2a6.57 6.57 0 0 1-3.36-.92l-.24-.15-2.5.66.67-2.44-.16-.25a6.56 6.56 0 0 1-1-3.5c0-3.63 2.96-6.59 6.59-6.59a6.56 6.56 0 0 1 4.66 1.93 6.56 6.56 0 0 1 1.93 4.66c0 3.64-2.96 6.6-6.6 6.6Zm3.62-4.93c-.2-.1-1.17-.58-1.36-.65-.18-.06-.31-.1-.44.1-.14.2-.52.65-.63.78-.12.13-.23.15-.43.05-.2-.1-.84-.31-1.6-.99-.59-.52-.98-1.17-1.1-1.37-.11-.2-.01-.3.09-.4.09-.09.2-.24.3-.35.1-.12.13-.2.2-.33.06-.14.03-.25-.02-.35-.05-.1-.44-1.08-.6-1.47-.16-.39-.33-.34-.45-.34h-.38a.73.73 0 0 0-.53.25c-.18.2-.69.67-.69 1.65s.71 1.92.81 2.05c.1.13 1.4 2.13 3.38 2.99.47.2.84.33 1.13.42.48.15.9.13 1.25.08.38-.06 1.17-.48 1.34-.94.16-.47.16-.86.11-.95-.05-.08-.18-.13-.38-.23Z"/></svg>`;
const ICON_PHONE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>`;
const ICON_LINK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>`;

function contactIcon(label) {
  if (label === "WhatsApp") return ICON_WHATSAPP;
  if (label === "Llamar") return ICON_PHONE;
  return ICON_LINK;
}

function formatPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("51") && digits.length > 9) digits = digits.slice(2);
  if (digits.length === 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

function businessCard(profile) {
  const location = [
    profile.floor ? `Piso ${profile.floor}` : "",
    profile.unit ? `Local ${profile.unit}` : "",
  ].filter(Boolean).join(" · ");
  const contact = primaryContact(profile);
  const adult = profile.category === "Sexshop";
  const cover = adult
    ? `<span class="d1-cover d1-cover--adult">
        <span class="d1-adult">+18</span>
        <span class="d1-adult-label">Sexshop</span>
        <span class="d1-cat">${escapeHtml(profile.category)}</span>
        <img class="d1-logo" src="${escapeHtml(profile.logo)}" alt="" width="56" height="56" loading="lazy" decoding="async">
      </span>`
    : `<span class="d1-cover">
        <img class="d1-banner" src="${escapeHtml(profile.banner)}" alt="" width="600" height="300" loading="lazy" decoding="async">
        <span class="d1-cat">${escapeHtml(profile.category)}</span>
        <img class="d1-logo" src="${escapeHtml(profile.logo)}" alt="" width="56" height="56" loading="lazy" decoding="async">
      </span>`;

  return `<article class="d1-card">
    <button type="button" class="d1-hit" data-detail="${profile.id}">
      ${cover}
      <span class="d1-body">
        <span class="d1-name">${escapeHtml(profile.name)}</span>
        <span class="d1-desc">${escapeHtml(profile.short)}</span>
        <span class="d1-meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.6 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/></svg>
          <span>${escapeHtml(location || "Ubicación no informada")}</span>
        </span>
      </span>
    </button>
    <div class="d1-footer">
      ${contact
        ? `<a class="d1-cta${contact.label === "WhatsApp" ? "" : " d1-cta--alt"}" href="${escapeHtml(contact.href)}" ${contact.external ? 'target="_blank" rel="noopener noreferrer"' : ""} aria-label="${escapeHtml(contact.label)} de ${escapeHtml(profile.name)}">${contactIcon(contact.label)}<span>${escapeHtml(contact.label)}</span></a>`
        : '<span class="d1-cta d1-cta--off">Sin contacto</span>'}
      <span class="d1-open" aria-hidden="true">Ver ficha
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </span>
    </div>
  </article>`;
}

function promoCard(promo) {
  const saving = getSaving(promo);
  const discount = saving ? Math.round((saving / promo.regular) * 100) : 0;
  const badge = discount ? `-${discount}%` : promo.kind;
  const adult = promo.category === "Sexshop" || promo.profile?.category === "Sexshop";
  const badgeClass = discount ? "d1-promo is-discount" : "d1-promo";
  const cover = adult
    ? `<span class="d1-cover d1-cover--adult">
        <span class="d1-adult">+18</span>
        <span class="d1-adult-label">Sexshop</span>
        <span class="d1-cat">${escapeHtml(promo.category)}</span>
        <span class="${badgeClass}">${escapeHtml(badge)}</span>
      </span>`
    : `<span class="d1-cover">
        <img class="d1-banner" src="${escapeHtml(promo.image)}" alt="" width="600" height="300" loading="lazy" decoding="async">
        <span class="d1-cat">${escapeHtml(promo.category)}</span>
        <span class="${badgeClass}">${escapeHtml(badge)}</span>
      </span>`;

  return `<article class="d1-pcard${promo.discounted > 0 ? "" : " d1-pcard--free"}">
    <button type="button" class="d1-hit" data-promo="${promo.id}">
      ${cover}
      <span class="d1-body">
        <span class="d1-name">${escapeHtml(promo.title)}</span>
      </span>
    </button>
    ${promo.profile ? `<p class="d1-pcard-biz">Ofrecido por
      <button type="button" data-business="${escapeHtml(promo.profile.id)}" aria-label="Ver ficha de ${escapeHtml(promo.profile.name)}">${escapeHtml(promo.profile.name)}</button>
    </p>` : ""}
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
  return `<li class="d1-promo-card" data-promo="${promo.id}">
    <div class="d1-promo-main">
      <div class="d1-promo-info">
        <div class="d1-tags">
          <span class="d1-tag">${escapeHtml(promo.kind)}</span>
        </div>
        <p class="d1-promo-title">
          <button type="button" class="d1-promo-title-btn" data-promo="${promo.id}">
            <span>${escapeHtml(promo.title)}</span>
            <svg class="d1-promo-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </p>
        <p class="d1-promo-text">${escapeHtml(promo.description)}</p>
      </div>
    </div>
    ${promo.discounted > 0 ? `<div class="d1-promo-price">
      <strong>${money(promo.discounted)}</strong>
      ${promo.regular > promo.discounted ? `<s>${money(promo.regular)}</s>` : ""}
      ${saving ? `<span class="d1-save">Ahorras ${money(saving)}</span>` : ""}
    </div>` : ""}
    <div class="d1-promo-foot">
      <span>${promo.until ? `Hasta ${escapeHtml(formatDate(promo.until))}` : ""}</span>
      ${promo.conditions ? `<details class="d1-more"><summary>Ver condiciones</summary><p>${escapeHtml(promo.conditions)}</p></details>` : ""}
    </div>
  </li>`;
}

function businessDetail(profile, backPromoId) {
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
        <div class="d1-tags">
          <span class="d1-tag">${escapeHtml(profile.category)}</span>
          ${profile.type ? `<span class="d1-tag is-soft">${escapeHtml(profile.type)}</span>` : ""}
        </div>
        <h2 id="modalTitle" class="d1-title">${escapeHtml(profile.name)}</h2>
        <p class="d1-lead">${escapeHtml(profile.long || profile.short)}</p>
      </div>
      <dl class="detail-info">
        ${location ? `<div><dt>Ubicación</dt><dd>${escapeHtml(location)}</dd></div>` : ""}
        ${profile.fixed ? `<div><dt>Teléfono</dt><dd>${escapeHtml(profile.fixed)}</dd></div>` : ""}
        ${profile.whatsapp ? `<div><dt>WhatsApp</dt><dd>${escapeHtml(formatPhone(profile.whatsapp))}</dd></div>` : ""}
      </dl>
      ${profile.promos.length ? `<section>
        <div class="d1-promos-head"><h3 class="d1-section-title">Promociones</h3><span class="d1-count">${profile.promos.length}</span></div>
        <ul class="d1-promos">${profile.promos.map(promoRow).join("")}</ul>
      </section>` : ""}
      ${catalog.length ? `<section><h3 class="d1-section-title">Productos y servicios</h3><ul class="d1-chips">${catalog.map((value) => `<li class="d1-chip is-filled">${escapeHtml(value)}</li>`).join("")}</ul></section>` : ""}
      ${socials.length ? `<section><h3 class="d1-section-title">Redes sociales</h3><div class="d1-chips">${socials.map((social) => `<a class="d1-chip is-social" href="${escapeHtml(social.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(social.label)}</a>`).join("")}</div></section>` : ""}
    </div>`;
}

function promoDetail(promo, backBusinessId) {
  const profile = promo.profile || {};
  const saving = getSaving(promo);

  return `
    ${backBusinessId ? `<button type="button" class="d1-back" data-back-business="${escapeHtml(backBusinessId)}">← Volver al negocio</button>` : ""}
    <div class="d1-modal-cover">
      <img src="${escapeHtml(promo.image)}" alt="" width="600" height="300">
      <span class="d1-cat">${escapeHtml(promo.category)}</span>
    </div>
    <div class="d1-modal-body p-5 sm:p-7 space-y-5">
      <div>
        <div class="d1-tags">
          <span class="d1-tag">${escapeHtml(promo.kind)}</span>
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

/* ---------- Estado, filtros y eventos ---------- */
// Orquestador: estado, filtros, orden, render y eventos.


const state = {
  view: "negocios",
  category: "Todos",
  search: "",
  floor: "Todos",
  bizSort: "destacados",
  promoTipo: "Todos",
  promoPrecio: "Todos",
  promoSort: "price-asc",
  page: 12,
  profiles: [],
  promos: [],
  profilesById: new Map(),
  backPromo: null,
  currentPromoId: null,
  currentBusinessId: null,
};

const PAGE_SIZE = 12;

const $ = (selector) => document.querySelector(selector);
const ui = {
  header: $("#siteHeader"),
  grid: $("#providerGrid"),
  categoryList: $("#categoryList"),
  count: $("#resultsCount"),
  loadMore: $("#loadMore"),
  loadMoreWrap: $("#loadMoreWrap"),
  loadMoreNote: $("#loadMoreNote"),
  empty: $("#emptyState"),
  search: $("#businessSearch"),
  mobileSearch: $("#mobileBusinessSearch"),
  sort: $("#sortSelect"),
  filterToggle: $("#filterToggle"),
  drawer: $("#moreFilters"),
  drawerBackdrop: $("#filterDrawerBackdrop"),
  reset: $("#resetFilters"),
  resetEmpty: $("#resetFiltersEmpty"),
  modal: $("#modalDetail"),
  modalBody: $("#modalBody"),
  bizFilters: $("#bizFilters"),
  promoFilters: $("#promoFilters"),
  floor: $("#floorFilter"),
  tipo: $("#tipoFilter"),
  precio: $("#precioFilter"),
  categoryFilter: $("#categoryFilter"),
};

const collator = new Intl.Collator("es-PE", { sensitivity: "base" });

const priceBands = [
  { value: "Todos", label: "Cualquier precio", test: () => true },
  { value: "hasta50", label: "Hasta S/ 50", test: (price) => price > 0 && price <= 50 },
  { value: "50-100", label: "S/ 50 a 100", test: (price) => price > 50 && price <= 100 },
  { value: "100-200", label: "S/ 100 a 200", test: (price) => price > 100 && price <= 200 },
  { value: "200+", label: "Más de S/ 200", test: (price) => price > 200 },
];

const sortOptions = {
  negocios: [
    { value: "destacados", label: "Destacados" },
    { value: "name", label: "Nombre A–Z" },
    { value: "piso", label: "Piso" },
  ],
  promos: [
    { value: "price-asc", label: "Menor precio" },
    { value: "price-desc", label: "Mayor precio" },
    { value: "vigencia", label: "Vencen pronto" },
  ],
};

function fillSelect(select, options, current) {
  select.innerHTML = options.map((option) =>
    `<option value="${option.value}"${option.value === current ? " selected" : ""}>${option.label}</option>`
  ).join("");
}

function setupFilters() {
  const floors = [...new Set(state.profiles.map((profile) => profile.floor).filter(Boolean))]
    .sort((a, b) => Number(a) - Number(b));
  fillSelect(ui.floor, [{ value: "Todos", label: "Todos los pisos" }, ...floors.map((floor) => ({ value: floor, label: `Piso ${floor}` }))], state.floor);

  const tipos = [...new Set(state.promos.map((promo) => promo.kind).filter(Boolean))].sort(collator.compare);
  fillSelect(ui.tipo, [{ value: "Todos", label: "Todos los tipos" }, ...tipos.map((tipo) => ({ value: tipo, label: tipo }))], state.promoTipo);

  fillSelect(ui.precio, priceBands.map(({ value, label }) => ({ value, label })), state.promoPrecio);

  const categories = [...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))].sort(collator.compare);
  fillSelect(ui.categoryFilter, [{ value: "Todos", label: "Todas las categorías" }, ...categories.map((category) => ({ value: category, label: category }))], state.category);
}

function setupSort() {
  const options = sortOptions[state.view];
  const current = state.view === "negocios" ? state.bizSort : state.promoSort;
  fillSelect(ui.sort, options, current);
}

/* ---------- filtros ---------- */

function matchesBusiness(profile, ignoreCategory = false) {
  if (!ignoreCategory && state.category !== "Todos" && profile.category !== state.category) return false;
  if (state.floor !== "Todos" && profile.floor !== state.floor) return false;
  if (!state.search) return true;
  return normalize([profile.name, profile.category, profile.type, profile.short, profile.catalog, profile.keywords, profile.floor, profile.unit].join(" ")).includes(state.search);
}

function matchesPromo(promo, ignoreCategory = false) {
  if (!ignoreCategory && state.category !== "Todos" && promo.category !== state.category) return false;
  if (state.floor !== "Todos" && promo.profile?.floor !== state.floor) return false;
  if (state.promoTipo !== "Todos" && promo.kind !== state.promoTipo) return false;
  if (!priceBands.find((band) => band.value === state.promoPrecio).test(promo.discounted)) return false;
  if (!state.search) return true;
  return normalize([promo.title, promo.description, promo.kind, promo.profile?.name, promo.category].join(" ")).includes(state.search);
}

/* ---------- orden ---------- */

function sortedBusinesses(list) {
  const result = [...list];
  if (state.bizSort === "name") result.sort((a, b) => collator.compare(a.name, b.name));
  else if (state.bizSort === "piso") result.sort((a, b) => Number(a.floor) - Number(b.floor) || collator.compare(a.name, b.name));
  else result.sort((a, b) => b.promos.length - a.promos.length || collator.compare(a.name, b.name));
  return result;
}

function sortedPromos(list) {
  const result = [...list];
  if (state.promoSort === "price-desc") {
    result.sort((a, b) => (b.discounted || 0) - (a.discounted || 0) || collator.compare(a.title, b.title));
  } else if (state.promoSort === "vigencia") {
    result.sort((a, b) => String(a.until).localeCompare(String(b.until)) || collator.compare(a.title, b.title));
  } else {
    result.sort((a, b) => (a.discounted || Infinity) - (b.discounted || Infinity) || collator.compare(a.title, b.title));
  }
  return result;
}

/* ---------- render ---------- */

const categoryMenuIcons = {
  Todos: '<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><rect x="14" y="14" width="6" height="6" rx="1.2"/>',
  Moda: '<path d="m8.5 4-4 2.5 2 3.2 2-1.1V20h7V8.6l2 1.1 2-3.2-4-2.5-1.6 1.5h-3.8L8.5 4Z"/>',
  Motos: '<circle cx="6" cy="17" r="2.6"/><circle cx="18" cy="17" r="2.6"/><path d="M6 17h5l3-6h4M9 17l2.5-6"/>',
  "Tecnología": '<rect x="7" y="3" width="10" height="18" rx="2.2"/><path d="M10.5 18h3"/>',
  Entretenimiento: '<path d="M7 8h10a5 5 0 0 1 5 5v2a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2v-2a5 5 0 0 1 5-5Z"/><path d="M8 12v3M6.5 13.5h3M16 12h.01M18 14h.01"/>',
  Comida: '<path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8Z"/><path d="M16 9h2a3 3 0 0 1 0 6h-2M4 22h14"/>',
  Servicios: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  Belleza: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/>',
  Spa: '<path d="M5 19C5 11 10 6 19 5c0 9-5 14-14 14Z"/><path d="M7 17c2.5-3.5 5.5-6 9-7.5"/>',
  Regalos: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-2 0-4-1-4-3 0-1.5 2-2 4 3Zm0 0c2 0 4-1 4-3 0-1.5-2-2-4 3Z"/>',
  Salud: '<path d="M12 5v14M5 12h14"/>',
  Sexshop: '<path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z"/>',
  Herramientas: '<path d="M14.5 6.5a4 4 0 0 0-5.4 5.4L4 17l3 3 5.1-5.1a4 4 0 0 0 5.4-5.4l-3 3-3-3 3-3Z"/>',
  Otros: '<path d="M3 12 12 3h7v7l-9 9-7-7Z"/><circle cx="15.5" cy="7.5" r="1.3"/>'
};

function categoryIcon(name) {
  const body = categoryMenuIcons[name] || categoryMenuIcons.Otros;
  return `<span class="category-option__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg></span>`;
}

function renderCategories(counts) {
  const left = ui.categoryList.scrollLeft;
  const categories = ["Todos", ...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))].sort((a, b) => a === "Todos" ? -1 : b === "Todos" ? 1 : collator.compare(a, b));
  ui.categoryList.innerHTML = categories.map((category) => {
    const total = category === "Todos" ? counts.total : (counts.byCategory.get(category) || 0);
    const label = category === "Todos" ? "Todas" : category;
    return `<button type="button" class="category-option${category === state.category ? " is-active" : ""}" data-category="${category}" aria-pressed="${String(category === state.category)}">${categoryIcon(category)}<span class="category-option__name">${label}</span><span class="d1-cat-count">${total}</span></button>`;
  }).join("");
  ui.categoryList.scrollLeft = left;
  updateCategoryNav();
}

function updateCategoryNav() {
  const prev = $(".cat-nav--prev");
  const next = $(".cat-nav--next");
  if (!prev || !next || !ui.categoryList) return;
  const max = ui.categoryList.scrollWidth - ui.categoryList.clientWidth;
  prev.disabled = ui.categoryList.scrollLeft <= 2;
  next.disabled = ui.categoryList.scrollLeft >= max - 2;
}

function setupCategoryNav() {
  const prev = $(".cat-nav--prev");
  const next = $(".cat-nav--next");
  if (!prev || !next) return;
  prev.addEventListener("click", () => ui.categoryList.scrollBy({ left: -320, behavior: "smooth" }));
  next.addEventListener("click", () => ui.categoryList.scrollBy({ left: 320, behavior: "smooth" }));
  ui.categoryList.addEventListener("scroll", updateCategoryNav, { passive: true });
  window.addEventListener("resize", updateCategoryNav);
  updateCategoryNav();
}

function countBy(list, key, total) {
  const byCategory = new Map();
  list.forEach((item) => byCategory.set(item[key], (byCategory.get(item[key]) || 0) + 1));
  return { total, byCategory };
}

function renderLoadMore(total, shown) {
  if (!ui.loadMore || !ui.loadMoreWrap) return;
  const rest = total - shown;
  ui.loadMoreWrap.hidden = rest <= 0;
  if (ui.loadMoreNote) ui.loadMoreNote.textContent = `Mostrando ${shown} de ${total}`;
  if (rest <= 0) return;
  const next = Math.min(PAGE_SIZE, rest);
  ui.loadMore.textContent = rest === 1
    ? "Cargar 1 más"
    : next === rest
      ? `Cargar los ${rest} restantes`
      : `Cargar ${next} más`;
}

function renderBusinesses() {
  const base = state.profiles.filter((profile) => matchesBusiness(profile, true));
  renderCategories(countBy(base, "category", base.length));

  const results = sortedBusinesses(state.profiles.filter((profile) => matchesBusiness(profile)));
  const shown = results.slice(0, state.page);
  ui.grid.innerHTML = shown.map(businessCard).join("");
  renderLoadMore(results.length, shown.length);
  ui.count.textContent = `${results.length} ${results.length === 1 ? "negocio" : "negocios"}`;
  ui.empty.querySelector("p").textContent = "Prueba con otra palabra, categoría o piso.";
  ui.empty.classList.toggle("hidden", results.length > 0);
}

function renderPromos() {
  const base = state.promos.filter((promo) => matchesPromo(promo, true));
  renderCategories(countBy(base, "category", base.length));

  const results = sortedPromos(state.promos.filter((promo) => matchesPromo(promo)));
  const shown = results.slice(0, state.page);
  ui.grid.innerHTML = shown.map(promoCard).join("");
  renderLoadMore(results.length, shown.length);
  ui.count.textContent = `${results.length} ${results.length === 1 ? "promoción" : "promociones"}`;
  ui.empty.querySelector("p").textContent = "Prueba con otra palabra, categoría o filtro.";
  ui.empty.classList.toggle("hidden", results.length > 0);
}

function render({ keepPage = false } = {}) {
  if (!keepPage) state.page = PAGE_SIZE;
  if (state.view === "promos") renderPromos();
  else renderBusinesses();
  ui.grid.setAttribute("aria-busy", "false");
  ui.bizFilters.classList.toggle("hidden", state.view !== "negocios");
  ui.promoFilters.classList.toggle("hidden", state.view !== "promos");
  ui.categoryFilter.value = state.category;
  syncUrl();
}

/* ---------- navegación ---------- */

function syncUrl() {
  const params = new URLSearchParams();
  if (state.view !== "negocios") params.set("view", state.view);
  if (state.category !== "Todos") params.set("cat", state.category);
  const query = params.toString();
  history.replaceState(null, "", query ? `?${query}` : location.pathname);
}

function setView(view) {
  state.view = view;
  document.body.dataset.view = view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  setupSort();
  render();
  alignListToHeader();
}

/* Al cambiar de vista estando abajo, deja el listado justo debajo de la cabecera */
function alignListToHeader() {
  const toolbar = document.getElementById("resultsToolbar");
  if (!toolbar) return;
  const align = () => {
    const offset = toolbar.getBoundingClientRect().top - ui.header.offsetHeight - 12;
    if (offset < 0) window.scrollBy({ top: offset, behavior: "instant" });
  };
  align();
  requestAnimationFrame(() => requestAnimationFrame(align));
}

/* ---------- detalle ---------- */

let modalLastFocus = null;

function openModal() {
  modalLastFocus = document.activeElement;
  ui.modal.classList.remove("hidden");
  ui.modal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
  setTimeout(() => $("#closeDetail")?.focus(), 0);
}

function closeModal() {
  ui.modal.classList.add("hidden");
  ui.modal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
  if (modalLastFocus && modalLastFocus.isConnected) modalLastFocus.focus({ preventScroll: true });
  modalLastFocus = null;
}

function showPromo(promo, backBusinessId = null) {
  state.backPromo = null;
  state.currentPromoId = promo.id;
  ui.modalBody.innerHTML = promoDetail(promo, backBusinessId);
  $("#modalCallBtn").classList.add("hidden");
  const wa = $("#modalWhatsappBtn");
  wa.href = promo.profile?.whatsapp ? `https://wa.me/${promo.profile.whatsapp}` : "#";
  wa.classList.toggle("hidden", !promo.profile?.whatsapp);
  wa.textContent = "WhatsApp del negocio";
  openModal();
}

function showBusiness(profile, backPromoId = null) {
  state.backPromo = backPromoId;
  state.currentBusinessId = profile.id;
  ui.modalBody.innerHTML = businessDetail(profile, backPromoId);
  const call = $("#modalCallBtn");
  call.href = profile.fixed ? `tel:${profile.fixed}` : "#";
  call.classList.toggle("hidden", !profile.fixed);
  const wa = $("#modalWhatsappBtn");
  wa.href = profile.whatsapp ? `https://wa.me/${profile.whatsapp}` : "#";
  wa.classList.toggle("hidden", !profile.whatsapp);
  wa.textContent = "Contactar por WhatsApp";
  openModal();
}

/* ---------- drawer y eventos ---------- */

function toggleDrawer(open) {
  ui.filterToggle.setAttribute("aria-expanded", String(open));
  if (open) {
    document.body.classList.add("overflow-hidden");
    ui.drawerBackdrop.classList.remove("hidden");
    void ui.drawerBackdrop.offsetWidth;
    ui.drawerBackdrop.classList.remove("opacity-0");
    ui.drawerBackdrop.classList.add("opacity-100");
    ui.drawer.classList.remove("-translate-x-full");
  } else {
    ui.drawer.classList.add("-translate-x-full");
    ui.drawerBackdrop.classList.remove("opacity-100");
    ui.drawerBackdrop.classList.add("opacity-0");
    document.body.classList.remove("overflow-hidden");
    setTimeout(() => ui.drawerBackdrop.classList.add("hidden"), 220);
  }
}

function resetFilters() {
  state.category = "Todos";
  state.search = "";
  state.floor = "Todos";
  state.bizSort = "destacados";
  state.promoTipo = "Todos";
  state.promoPrecio = "Todos";
  state.promoSort = "price-asc";
  ui.search.value = "";
  ui.mobileSearch.value = "";
  ui.floor.value = "Todos";
  ui.tipo.value = "Todos";
  ui.precio.value = "Todos";
  setupSort();
  render();
  toggleDrawer(false);
}

function setSearch(value) {
  state.search = normalize(value);
  ui.search.value = value;
  ui.mobileSearch.value = value;
  render();
}

function bindEvents() {
  ui.search.addEventListener("input", () => setSearch(ui.search.value));
  ui.mobileSearch.addEventListener("input", () => setSearch(ui.mobileSearch.value));

  if (ui.loadMore) {
    ui.loadMore.addEventListener("click", () => {
      state.page += PAGE_SIZE;
      render({ keepPage: true });
    });
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  ui.categoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    render();
  });

  ui.categoryFilter.addEventListener("change", () => { state.category = ui.categoryFilter.value; render(); });
  ui.floor.addEventListener("change", () => { state.floor = ui.floor.value; render(); });
  ui.tipo.addEventListener("change", () => { state.promoTipo = ui.tipo.value; render(); });
  ui.precio.addEventListener("change", () => { state.promoPrecio = ui.precio.value; render(); });

  function applySort(value) {
    if (state.view === "negocios") state.bizSort = value;
    else state.promoSort = value;
    ui.sort.value = value;
    render();
  }

  ui.sort.addEventListener("change", () => applySort(ui.sort.value));

  ui.reset.addEventListener("click", resetFilters);
  ui.resetEmpty.addEventListener("click", resetFilters);
  ui.filterToggle.addEventListener("click", () => toggleDrawer(true));
  $("#applyFilterDrawer").addEventListener("click", () => toggleDrawer(false));
  $("#closeFilterDrawer").addEventListener("click", () => toggleDrawer(false));
  ui.drawerBackdrop.addEventListener("click", () => toggleDrawer(false));

  ui.grid.addEventListener("click", (event) => {
    if (event.target.closest("a.d1-cta")) return;

    const bizTrigger = event.target.closest("[data-business]");
    if (bizTrigger) {
      const profile = state.profilesById.get(Number(bizTrigger.dataset.business));
      if (profile) showBusiness(profile);
      return;
    }

    const card = event.target.closest(".d1-card, .d1-pcard");
    const promoTrigger = event.target.closest("[data-promo]") || card?.querySelector("[data-promo]");
    if (promoTrigger) {
      const promo = state.promos.find((item) => item.id === promoTrigger.dataset.promo);
      if (promo) showPromo(promo);
      return;
    }

    const trigger = event.target.closest("[data-detail]") || card?.querySelector("[data-detail]");
    if (!trigger) return;
    const profile = state.profilesById.get(Number(trigger.dataset.detail));
    if (profile) showBusiness(profile);
  });

  ui.modalBody.addEventListener("click", (event) => {
    const business = event.target.closest("[data-business]");
    if (business) {
      const profile = state.profilesById.get(Number(business.dataset.business));
      if (profile) showBusiness(profile, state.currentPromoId);
      return;
    }
    const back = event.target.closest("[data-back-promo]");
    if (back) {
      const promo = state.promos.find((item) => item.id === back.dataset.backPromo);
      if (promo) showPromo(promo, state.currentBusinessId);
      return;
    }
    const backBusiness = event.target.closest("[data-back-business]");
    if (backBusiness) {
      const profile = state.profilesById.get(Number(backBusiness.dataset.backBusiness));
      if (profile) showBusiness(profile, state.currentPromoId);
      return;
    }
    if (event.target.closest(".d1-more")) return;

    const promoTrigger = event.target.closest("[data-promo]");
    if (promoTrigger) {
      const promo = state.promos.find((item) => item.id === promoTrigger.dataset.promo);
      if (promo) showPromo(promo, state.currentBusinessId);
    }
  });

  $("#closeDetail").addEventListener("click", closeModal);
  ui.modal.addEventListener("click", (event) => { if (event.target === ui.modal) closeModal(); });
  document.addEventListener("keydown", (event) => {
    if (ui.modal.classList.contains("hidden")) return;
    if (event.key === "Escape") {
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = [...ui.modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function setupHeaderScroll() {
  const header = ui.header;
  let hidden = 0;      // px que la cabecera está fuera de la pantalla
  let target = 0;      // px que debería estar según el scroll
  let lastY = window.scrollY;
  let frame = 0;

  const paint = () => {
    hidden += (target - hidden) * 0.3;
    if (Math.abs(target - hidden) < 0.4) hidden = target;
    header.style.transform = hidden > 0.4 ? `translate3d(0, ${(-hidden).toFixed(2)}px, 0)` : "";
    frame = hidden === target ? 0 : requestAnimationFrame(paint);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(paint);
  };

  const pinAt = () => 0;

  const onScroll = () => {
    const y = window.scrollY;
    const delta = y - lastY;
    const height = header.offsetHeight;
    lastY = y;

    if (y <= pinAt()) target = 0;
    else if (Math.abs(delta) > 0.5) {
      target = Math.max(0, Math.min(height, target + delta));
    }

    schedule();
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener("resize", () => {
    const height = header.offsetHeight;
    target = window.scrollY <= pinAt() ? 0 : Math.max(0, Math.min(height, target));
    hidden = Math.max(0, Math.min(height, hidden));
    lastY = window.scrollY;
    schedule();
  });
}

async function init() {
  try {
    // Solo para probar el esqueleto: ?slow=2000
    const slow = Number(new URLSearchParams(location.search).get("slow"));
    if (slow > 0) await new Promise((resolve) => setTimeout(resolve, slow));

    const { profiles, promos, profilesById } = await loadDirectory();
    state.profiles = profiles;
    state.promos = promos;
    state.profilesById = profilesById;

    const countNegocios = document.getElementById("countNegocios");
    const countPromos = document.getElementById("countPromos");
    if (countNegocios) countNegocios.textContent = profiles.length;
    if (countPromos) countPromos.textContent = promos.length;

    setupFilters();
    setupSort();
    setupCategoryNav();
    setupHeaderScroll();
    bindEvents();

    const params = new URLSearchParams(location.search);
    if (params.get("cat")) state.category = params.get("cat");
    setView(params.get("view") === "promos" ? "promos" : "negocios");

    const openId = Number(params.get("open"));
    if (openId) {
      const profile = state.profilesById.get(openId);
      if (profile) showBusiness(profile);
    }

    const promoId = params.get("promo");
    if (promoId) {
      const promo = state.promos.find((item) => item.id === promoId);
      if (promo) showPromo(promo);
    }
  } catch (error) {
    console.error(error);
    ui.grid.setAttribute("aria-busy", "false");
    ui.grid.innerHTML = "";
    ui.count.textContent = "No se pudieron cargar los datos";
    ui.empty.classList.remove("hidden");
  }
}

init();
