// Demo 01 · Directorio
// Datos compartidos: assets/js/data.js

import {
  escapeHtml,
  formatDate,
  getSaving,
  listValues,
  loadDirectory,
  money,
  normalize,
  phoneDigits,
} from "../../assets/js/data.js";

const PAGE_SIZE = 12;
const FAV_KEY = "directorio:favoritos:negocios";
const LAYOUT_KEY = "directorio:vista";
const DIRECTORY_WHATSAPP = "51950141414";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const CATEGORY_STYLE = {
  Moda: { bg: "#fce7ef", color: "#b3184b", icon: "shirt" },
  Tecnología: { bg: "#e3f2fd", color: "#1565c0", icon: "phone" },
  Comida: { bg: "#ffedd5", color: "#c2410c", icon: "cup" },
  Spa: { bg: "#ccfbf1", color: "#0f766e", icon: "sparkle" },
  Belleza: { bg: "#fce7f3", color: "#be185d", icon: "sparkle" },
  Regalos: { bg: "#fef3c7", color: "#b45309", icon: "gift" },
  Sexshop: { bg: "#f3e8ff", color: "#7e22ce", icon: "heart" },
  Motos: { bg: "#e2e8f0", color: "#334155", icon: "tag" },
  Salud: { bg: "#dcfce7", color: "#15803d", icon: "heart" },
  Herramientas: { bg: "#e4e4e7", color: "#52525b", icon: "wrench" },
  Servicios: { bg: "#e0e7ff", color: "#4338ca", icon: "briefcase" },
  Entretenimiento: { bg: "#ede9fe", color: "#6d28d9", icon: "controller" },
  Otros: { bg: "#fef3c7", color: "#92400e", icon: "store" },
};
const DEFAULT_CATEGORY_STYLE = { bg: "#f3ece5", color: "#8a5a3b", icon: "store" };

const PRICE_BANDS = [
  { value: "Todos", label: "Cualquier precio", test: () => true },
  { value: "hasta50", label: "Hasta S/ 50", test: (price) => price > 0 && price <= 50 },
  { value: "50-100", label: "S/ 50 a 100", test: (price) => price > 50 && price <= 100 },
  { value: "100-200", label: "S/ 100 a 200", test: (price) => price > 100 && price <= 200 },
  { value: "200+", label: "Más de S/ 200", test: (price) => price > 200 },
];

const MODALITIES = ["Todos", "Sorteo", "Concurso", "Canje"];
const collator = new Intl.Collator("es-PE", { sensitivity: "base" });

const state = {
  view: "negocios",
  category: "Todos",
  search: "",
  searchRaw: "",
  floor: "Todos",
  type: "Todos",
  promoKind: "Descuento",
  modality: "Todos",
  price: "Todos",
  sort: "name",
  page: 1,
  layout: initialLayout(),
  favorites: loadFavorites(),
  profiles: [],
  promos: [],
  profilesById: new Map(),
  openBusinessId: null,
  openPromoId: null,
  backTo: null,
  loading: true,
  hasLoaded: false,
  error: null,
};

const ui = {
  siteHeader: $("#siteHeader"),
  searchForm: $("#searchForm"),
  searchInput: $("#searchInput"),
  clearSearch: $("#clearSearch"),
  mobileSearchForm: $("#mobileSearchForm"),
  mobileSearchInput: $("#mobileSearchInput"),
  clearSearchMobile: $("#clearSearchMobile"),
  mobileSearchToggle: $("#mobileSearchToggle"),
  mobileSearchWrap: $("#mobileSearchWrap"),
  favTrigger: $("#favTrigger"),
  favCount: $("#favCount"),
  favNavCount: $("#favNavCount"),
  heroBiz: $("#heroBiz"),
  heroPromos: $("#heroPromos"),
  heroCats: $("#heroCats"),
  heroMosaic: $("#heroMosaic"),
  heroSearchForm: $("#heroSearchForm"),
  heroSearchInput: $("#heroSearchInput"),
  clearSearchHero: $("#clearSearchHero"),
  heroQuickCats: $("#heroQuickCats"),
  legalBiz: $("#legalBiz"),
  legalPromos: $("#legalPromos"),
  categoriesSection: $("#categoriesSection"),
  categoryList: $("#categoryList"),
  catNote: $("#catNote"),
  results: $("#resultados"),
  resultsEyebrow: $("#resultsEyebrow"),
  resultsTitle: $("#resultsTitle"),
  resultsCount: $("#resultsCount"),
  promoTabs: $("#promoTabs"),
  countDesc: $("#countDesc"),
  countPrem: $("#countPrem"),
  filterBtn: $("#filterBtn"),
  filterCount: $("#filterCount"),
  activeFilters: $("#activeFilters"),
  sort: $("#sortSelect"),
  grid: $("#grid"),
  empty: $("#empty"),
  emptyTitle: $("#emptyTitle"),
  emptyText: $("#emptyText"),
  emptyReset: $("#emptyReset"),
  pagination: $("#pagination"),
  filterPanel: $("#filterPanel"),
  filterBackdrop: $("#filterBackdrop"),
  filterClose: $("#filterClose"),
  filterApply: $("#filterApply"),
  filterReset: $("#filterReset"),
  filterCategory: $("#filterCategory"),
  filterType: $("#filterType"),
  filterPrice: $("#filterPrice"),
  floorChips: $("#floorChips"),
  modalityChips: $("#modalityChips"),
  typeFilterWrap: $("#typeFilterWrap"),
  promoFilterWrap: $("#promoFilterWrap"),
  modalityWrap: $("#modalityWrap"),
  priceWrap: $("#priceWrap"),
  modal: $("#modal"),
  modalBody: $("#modalBody"),
  modalClose: $("#modalClose"),
  toTop: $("#toTop"),
};

let searchTimer = null;
let eventsBound = false;
let trapEl = null;
let lastFocus = null;

/* ---------- Utilidades ---------- */

function icon(name, extra = "") {
  return `<svg class="icon${extra ? ` ${extra}` : ""}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

function categoryStyle(category) {
  return CATEGORY_STYLE[category] || DEFAULT_CATEGORY_STYLE;
}

function categoryIcon(category) {
  return icon(categoryStyle(category).icon);
}

function profileLocation(profile) {
  const parts = [];
  if (profile.floor) parts.push(`Piso ${profile.floor}`);
  if (profile.unit) parts.push(`Local ${profile.unit}`);
  return parts.join(" · ") || "Ubicación no informada";
}

function discountPercent(promo) {
  if (promo.type !== "Descuento" || !(promo.regular > 0)) return 0;
  const saving = getSaving(promo);
  return saving > 0 ? Math.round((saving / promo.regular) * 100) : 0;
}

function sortedPromos(profile) {
  return [...profile.promos].sort((a, b) => (a.type === "Descuento" ? 0 : 1) - (b.type === "Descuento" ? 0 : 1));
}

function formatWhatsApp(value) {
  const digits = phoneDigits(value);
  if (digits.length === 11 && digits.startsWith("51")) {
    return `+51 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.length === 9) {
    return `+51 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return digits ? `+${digits}` : "";
}

function formatFixed(value) {
  const digits = phoneDigits(value);
  if (digits.length === 10 && digits.startsWith("511")) {
    return `(01) ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 7) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  return digits;
}

function socialHandle(url) {
  const clean = String(url || "").replace(/[?#].*$/, "").replace(/\/+$/, "");
  const last = clean.split("/").pop() || "";
  if (!last) return "";
  return last.startsWith("@") ? last : `@${last}`;
}

function socialContact(kind, url) {
  const label = kind === "instagram" ? "Instagram" : kind === "facebook" ? "Facebook" : "TikTok";
  return {
    kind,
    icon: kind,
    label,
    display: kind === "facebook" ? "Facebook" : socialHandle(url),
    href: url,
    external: true,
  };
}

function whatsappHref(profile, text = "") {
  const digits = phoneDigits(profile.whatsapp);
  if (!digits) return "";
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

function primaryContact(profile) {
  const whatsapp = phoneDigits(profile.whatsapp);
  if (whatsapp) {
    return {
      kind: "whatsapp",
      icon: "whatsapp",
      label: "WhatsApp",
      display: formatWhatsApp(whatsapp),
      href: `https://wa.me/${whatsapp}`,
      external: true,
    };
  }
  const fixed = phoneDigits(profile.fixed);
  if (fixed) {
    return {
      kind: "phone",
      icon: "call",
      label: "Llamar",
      display: formatFixed(fixed),
      href: `tel:+${fixed}`,
      external: false,
    };
  }
  if (profile.instagram) return socialContact("instagram", profile.instagram);
  if (profile.facebook) return socialContact("facebook", profile.facebook);
  if (profile.tiktok) return socialContact("tiktok", profile.tiktok);
  return null;
}

function contactLinks(profile) {
  const links = [];
  const whatsapp = phoneDigits(profile.whatsapp);
  if (whatsapp) {
    links.push({
      kind: "whatsapp",
      icon: "whatsapp",
      label: "WhatsApp",
      display: formatWhatsApp(whatsapp),
      href: `https://wa.me/${whatsapp}`,
      external: true,
    });
  }
  const fixed = phoneDigits(profile.fixed);
  if (fixed) {
    links.push({
      kind: "phone",
      icon: "call",
      label: "Llamar",
      display: formatFixed(fixed),
      href: `tel:+${fixed}`,
      external: false,
    });
  }
  if (profile.instagram) links.push(socialContact("instagram", profile.instagram));
  if (profile.facebook) links.push(socialContact("facebook", profile.facebook));
  if (profile.tiktok) links.push(socialContact("tiktok", profile.tiktok));
  return links;
}

function favoriteButton(profile, className) {
  const active = state.favorites.has(profile.id);
  return `<button type="button" class="${className}${active ? " is-active" : ""}" data-fav="${profile.id}" data-name="${escapeHtml(profile.name)}" aria-pressed="${active}" aria-label="${active ? "Quitar de favoritos" : "Guardar en favoritos"}: ${escapeHtml(profile.name)}">${icon("heart")}</button>`;
}

function defaultSort(view = state.view, promoKind = state.promoKind) {
  if (view === "promos") return promoKind === "Descuento" ? "price-asc" : "name";
  return "name";
}

/* ---------- Persistencia ---------- */

function initialLayout() {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved === "grid" || saved === "list") return saved;
  } catch {}
  return window.matchMedia("(max-width: 700px)").matches ? "list" : "grid";
}

function loadFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(Number).filter(Number.isFinite));
  } catch {
    return new Set();
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...state.favorites]));
  } catch {}
}

/* ---------- Datos ---------- */

function currentList() {
  if (state.view === "promos") return state.promos;
  if (state.view === "favoritos") return state.profiles.filter((profile) => state.favorites.has(profile.id));
  return state.profiles;
}

function matches(item, ignoreCategory = false) {
  if (state.view === "promos") {
    const promo = item;
    if (promo.type !== state.promoKind) return false;
    if (!ignoreCategory && state.category !== "Todos" && promo.category !== state.category) return false;
    if (state.floor !== "Todos" && String(promo.profile?.floor || "") !== state.floor) return false;

    if (state.promoKind === "Premio" && state.modality !== "Todos" && promo.mode !== state.modality) return false;
    if (state.promoKind === "Descuento") {
      const band = PRICE_BANDS.find((entry) => entry.value === state.price) || PRICE_BANDS[0];
      if (!band.test(promo.discounted)) return false;
    }

    if (!state.search) return true;
    return normalize([
      promo.title,
      promo.description,
      promo.type,
      promo.mode,
      promo.category,
      promo.profile?.name,
      promo.profile?.type,
      promo.profile?.catalog,
      promo.profile?.keywords,
    ].join(" ")).includes(state.search);
  }

  const profile = item;
  if (!ignoreCategory && state.category !== "Todos" && profile.category !== state.category) return false;
  if (state.floor !== "Todos" && String(profile.floor || "") !== state.floor) return false;
  if (state.type !== "Todos" && profile.type !== state.type) return false;

  if (!state.search) return true;
  return normalize([
    profile.name,
    profile.category,
    profile.type,
    profile.short,
    profile.long,
    profile.catalog,
    profile.keywords,
    profile.floor,
    profile.unit,
    profile.promos?.map((promo) => `${promo.title} ${promo.description}`).join(" "),
  ].join(" ")).includes(state.search);
}

function sortList(list) {
  const result = [...list];

  if (state.view === "promos") {
    if (state.sort === "price-asc") {
      result.sort((a, b) => (a.discounted || Infinity) - (b.discounted || Infinity) || collator.compare(a.title, b.title));
    } else if (state.sort === "price-desc") {
      result.sort((a, b) => (b.discounted || 0) - (a.discounted || 0) || collator.compare(a.title, b.title));
    } else if (state.sort === "business") {
      result.sort((a, b) => collator.compare(a.profile?.name || "", b.profile?.name || "") || collator.compare(a.title, b.title));
    } else if (state.sort === "modality") {
      result.sort((a, b) => collator.compare(a.mode || "", b.mode || "") || collator.compare(a.title, b.title));
    } else {
      result.sort((a, b) => collator.compare(a.title, b.title));
    }
    return result;
  }

  if (state.sort === "floor") {
    result.sort((a, b) => Number(a.floor) - Number(b.floor) || collator.compare(a.name, b.name));
  } else if (state.sort === "category") {
    result.sort((a, b) => collator.compare(a.category, b.category) || collator.compare(a.name, b.name));
  } else {
    result.sort((a, b) => collator.compare(a.name, b.name));
  }
  return result;
}

/* ---------- Vistas ---------- */

function businessCard(profile, index = 0) {
  const promos = sortedPromos(profile);
  const discount = promos.find((promo) => promo.type === "Descuento");
  const prize = promos.find((promo) => promo.type === "Premio");
  const percent = discount ? discountPercent(discount) : 0;
  const contact = primaryContact(profile);
  const contactClass = contact && contact.kind !== "whatsapp" && contact.kind !== "phone" ? " meta--social" : contact?.kind === "phone" ? " meta--phone" : "";
  const promoStrip = [
    discount ? `<span class="promo-chip promo-chip--discount">${icon("tag", "icon--sm")} −${percent}%</span>` : "",
    prize ? `<span class="promo-chip promo-chip--prize">${icon("gift", "icon--sm")} ${escapeHtml(prize.mode || "Premio")}</span>` : "",
  ].join("");
  const contactHtml = contact
    ? `<a class="meta meta--contact${contactClass}" href="${escapeHtml(contact.href)}" ${contact.external ? 'target="_blank" rel="noopener noreferrer"' : ""} aria-label="${escapeHtml(contact.label)} de ${escapeHtml(profile.name)}: ${escapeHtml(contact.display)}">${icon(contact.icon)}<span>${escapeHtml(contact.display)}</span></a>`
    : `<span class="meta meta--muted">${icon("call")} Contacto no disponible</span>`;

  return `<article class="biz-card" data-card-business="${profile.id}">
    <div class="biz-card__media">
      <div class="biz-card__shot">
        <img class="biz-card__banner" src="${escapeHtml(profile.banner)}" alt="" width="600" height="300" loading="${index < 3 ? "eager" : "lazy"}" decoding="async"${index < 3 ? ' fetchpriority="high"' : ""}>
      </div>
      <div class="biz-card__badges">
        ${profile.floor ? `<span class="badge badge--floor">${icon("pin")} Piso ${escapeHtml(profile.floor)}</span>` : ""}
        ${discount ? `<span class="badge badge--promo">−${percent}%</span>` : ""}
      </div>
      ${favoriteButton(profile, "fav-btn")}
      <img class="biz-card__logo" src="${escapeHtml(profile.logo)}" alt="" width="56" height="56" loading="lazy" decoding="async">
    </div>
    <div class="biz-card__body">
      <p class="biz-card__type">${escapeHtml(profile.type)}</p>
      <h3 class="biz-card__name"><button type="button" data-business="${profile.id}">${escapeHtml(profile.name)}</button></h3>
      <p class="biz-card__desc">${escapeHtml(profile.short)}</p>
      ${promoStrip ? `<div class="promo-strip">${promoStrip}</div>` : ""}
      <div class="biz-card__meta">
        <span class="meta">${icon("pin")}<span>${escapeHtml(profileLocation(profile))}</span></span>
        ${contactHtml}
      </div>
    </div>
    <div class="biz-card__foot">
      <span class="cat-tag" style="--cat-color:${categoryStyle(profile.category).color}"><span class="cat-tag__dot"></span><span>${escapeHtml(profile.category)}</span></span>
      <button type="button" class="card-link" data-business="${profile.id}">Ver ficha ${icon("arrow-right")}</button>
    </div>
  </article>`;
}

function promoCard(promo, index = 0) {
  const isPrize = promo.type === "Premio";
  const percent = discountPercent(promo);
  const saving = getSaving(promo);
  const badge = isPrize ? (promo.mode || "Premio") : percent ? `−${percent}%` : "Descuento";
  const business = promo.profile;
  const priceBlock = !isPrize && promo.discounted > 0
    ? `<div class="promo-card__price">
        <strong>${money(promo.discounted)}</strong>
        ${promo.regular > promo.discounted ? `<s>${money(promo.regular)}</s>` : ""}
        ${saving ? `<span class="save-tag">Ahorras ${money(saving)}</span>` : ""}
      </div>`
    : `<div class="promo-card__prize">${icon("gift")} ${escapeHtml(promo.mode || "Premio")} · ${escapeHtml(formatDate(promo.until))}</div>`;

  return `<article class="promo-card promo-card--${isPrize ? "premio" : "descuento"}" data-card-promo="${escapeHtml(promo.id)}">
    <div class="promo-card__shot">
      <img class="promo-card__banner" src="${escapeHtml(promo.image)}" alt="" width="600" height="300" loading="${index < 3 ? "eager" : "lazy"}" decoding="async"${index < 3 ? ' fetchpriority="high"' : ""}>
    </div>
    <div class="promo-card__badges"><span class="badge ${isPrize ? "badge--prize" : "badge--promo"}">${escapeHtml(badge)}</span></div>
    <div class="promo-card__body">
      <p class="promo-card__kind">${isPrize ? "Premio" : "Descuento"}</p>
      <h3 class="promo-card__title"><button type="button" data-promo="${escapeHtml(promo.id)}">${escapeHtml(promo.title)}</button></h3>
      ${business ? `<p class="promo-card__biz">En <button type="button" data-business="${business.id}">${escapeHtml(business.name)}</button></p>` : ""}
      <p class="promo-card__desc">${escapeHtml(promo.description)}</p>
      ${priceBlock}
    </div>
    <div class="promo-card__foot">
      <span class="cat-tag" style="--cat-color:${categoryStyle(promo.category).color}"><span class="cat-tag__dot"></span><span>${escapeHtml(promo.category)}</span></span>
      <button type="button" class="card-link" data-promo="${escapeHtml(promo.id)}">${isPrize ? "Ver premio" : "Ver oferta"} ${icon("arrow-right")}</button>
    </div>
  </article>`;
}

function detailPromoRow(promo, profile) {
  const isPrize = promo.type === "Premio";
  const percent = discountPercent(promo);
  const price = isPrize
    ? `<span class="prize-label">${escapeHtml(promo.mode || "Premio")}</span>`
    : `${money(promo.discounted)}${promo.regular > promo.discounted ? `<s>${money(promo.regular)}</s>` : ""}`;
  return `<button type="button" class="detail-promo" data-promo="${escapeHtml(promo.id)}" data-back-business="${profile.id}">
    <span>
      <span class="detail-promo__title">${escapeHtml(promo.title)}</span>
      <span class="detail-promo__meta">${isPrize ? "Premio" : "Descuento"}${!isPrize && percent ? ` · −${percent}%` : ""} · ${escapeHtml(promo.category)}</span>
    </span>
    <span class="detail-promo__price">${price}</span>
  </button>`;
}

function backButton() {
  if (!state.backTo) return "";
  const label = state.backTo.type === "business" ? "Volver al negocio" : "Volver a la promoción";
  return `<button type="button" class="detail-back" data-back="${state.backTo.type}" data-back-id="${escapeHtml(state.backTo.id)}">${icon("chevron-left")} ${label}</button>`;
}

function businessDetail(profile) {
  const promos = sortedPromos(profile);
  const catalog = listValues(profile.catalog);
  const contacts = contactLinks(profile);
  const contactButtons = contacts.length
    ? contacts.map((contact) => {
        const modifier = contact.kind === "whatsapp" ? "contact-btn--wa" : contact.kind === "phone" ? "contact-btn--phone" : "contact-btn--social";
        const label = contact.kind === "whatsapp" ? "WhatsApp" : contact.kind === "phone" ? "Llamar" : contact.label;
        return `<a class="contact-btn ${modifier}" href="${escapeHtml(contact.href)}" ${contact.external ? 'target="_blank" rel="noopener noreferrer"' : ""}>${icon(contact.icon)} ${escapeHtml(label)}</a>`;
      }).join("")
    : `<p class="detail-note">Este negocio aún no tiene un canal de contacto publicado. Los datos son referenciales.</p>`;
  const info = [
    `<div><dt>Ubicación</dt><dd>${escapeHtml(profileLocation(profile))}</dd></div>`,
    profile.whatsapp ? `<div><dt>WhatsApp</dt><dd>${escapeHtml(formatWhatsApp(profile.whatsapp))}</dd></div>` : "",
    profile.fixed ? `<div><dt>Teléfono</dt><dd>${escapeHtml(formatFixed(profile.fixed))}</dd></div>` : "",
  ].filter(Boolean).join("");

  return `${backButton()}
    <div class="detail-hero">
      <img src="${escapeHtml(profile.banner)}" alt="" width="600" height="300">
      <div class="detail-hero__badges">
        <span class="badge badge--soft">${escapeHtml(profile.category)}</span>
        ${profile.floor ? `<span class="badge badge--floor">${icon("pin")} Piso ${escapeHtml(profile.floor)}</span>` : ""}
      </div>
      <img class="detail-hero__logo" src="${escapeHtml(profile.logo)}" alt="" width="76" height="76">
    </div>
    <div class="detail-body">
      <p class="detail-kicker">${escapeHtml(profile.type)} · ${escapeHtml(profile.category)}</p>
      <div class="detail-title-row">
        <h2 class="detail-title" id="modalTitle">${escapeHtml(profile.name)}</h2>
        ${favoriteButton(profile, "detail-fav")}
      </div>
      <p class="detail-lead">${escapeHtml(profile.long || profile.short)}</p>
      <div class="detail-actions">${contactButtons}</div>
      <dl class="detail-info">${info}</dl>
      ${promos.length ? `<section class="detail-section">
        <h3>Promociones (${promos.length})</h3>
        <div class="detail-promos">${promos.map((promo) => detailPromoRow(promo, profile)).join("")}</div>
      </section>` : ""}
      ${catalog.length ? `<section class="detail-section">
        <h3>Productos y servicios</h3>
        <ul class="detail-chips">${catalog.map((value) => `<li class="detail-chip">${escapeHtml(value)}</li>`).join("")}</ul>
      </section>` : ""}
    </div>`;
}

function promoDetail(promo) {
  const business = promo.profile;
  const isPrize = promo.type === "Premio";
  const percent = discountPercent(promo);
  const saving = getSaving(promo);
  const primary = business ? primaryContact(business) : null;
  const ctaLabel = isPrize ? "Quiero participar" : "Quiero esta oferta";
  let cta = "";
  if (primary && business) {
    const message = `Hola, vi la promoción "${promo.title}" en el Directorio y quiero más información.`;
    const href = primary.kind === "whatsapp" ? whatsappHref(business, message) : primary.href;
    const modifier = primary.kind === "whatsapp" ? "contact-btn--wa" : primary.kind === "phone" ? "contact-btn--phone" : "contact-btn--social";
    cta = `<a class="contact-btn ${modifier}" href="${escapeHtml(href)}" ${primary.external ? 'target="_blank" rel="noopener noreferrer"' : ""}>${icon(primary.icon)} ${ctaLabel}</a>`;
  } else if (business) {
    cta = `<button type="button" class="contact-btn contact-btn--phone" data-business="${business.id}">Ver ficha del negocio</button>`;
  }

  const priceBlock = !isPrize && promo.discounted > 0
    ? `<div class="detail-price-block">
        <div><strong>${money(promo.discounted)}</strong>${promo.regular > promo.discounted ? `<s>${money(promo.regular)}</s>` : ""}</div>
        ${saving ? `<span class="save-tag">Ahorras ${money(saving)}</span>` : ""}
      </div>`
    : `<div class="detail-price-block">
        <div><strong>${escapeHtml(promo.mode || "Premio")}</strong></div>
        <span class="save-tag" style="background:var(--amber-soft);color:var(--amber)">${escapeHtml(formatDate(promo.until))}</span>
      </div>`;

  return `${backButton()}
    <div class="detail-hero">
      <img src="${escapeHtml(promo.image)}" alt="" width="600" height="300">
      <div class="detail-hero__badges">
        <span class="badge ${isPrize ? "badge--prize" : "badge--promo"}">${escapeHtml(isPrize ? (promo.mode || "Premio") : percent ? `−${percent}%` : "Descuento")}</span>
        <span class="badge badge--soft">${escapeHtml(promo.category)}</span>
      </div>
    </div>
    <div class="detail-body detail-body--promo">
      <p class="detail-kicker">${isPrize ? "Premio" : "Descuento"} · ${escapeHtml(promo.category)}</p>
      <div class="detail-title-row">
        <h2 class="detail-title detail-title--promo" id="modalTitle">${escapeHtml(promo.title)}</h2>
      </div>
      <p class="detail-lead">${escapeHtml(promo.description)}</p>
      ${priceBlock}
      <div class="detail-actions">${cta}</div>
      <dl class="detail-info">
        <div><dt>Vigente hasta</dt><dd>${escapeHtml(formatDate(promo.until))}</dd></div>
        <div><dt>Categoría</dt><dd>${escapeHtml(promo.category)}</dd></div>
        ${promo.mode ? `<div><dt>Modalidad</dt><dd>${escapeHtml(promo.mode)}</dd></div>` : ""}
      </dl>
      ${promo.conditions ? `<section class="detail-section"><h3>Condiciones</h3><p class="detail-note">${escapeHtml(promo.conditions)}</p></section>` : ""}
      ${business ? `<section class="detail-section">
        <h3>Ofrecido por</h3>
        <button type="button" class="detail-business-card" data-business="${business.id}" data-back-promo="${escapeHtml(promo.id)}">
          <img src="${escapeHtml(business.logo)}" alt="" width="44" height="44">
          <span class="detail-business-card__info">
            <span class="detail-business-card__name">${escapeHtml(business.name)}</span>
            <span class="detail-business-card__meta">${escapeHtml(business.type)} · ${escapeHtml(profileLocation(business))}</span>
          </span>
          <span class="detail-business-card__link">Ver ficha</span>
        </button>
      </section>` : ""}
    </div>`;
}

/* ---------- Render ---------- */

function renderSkeletons() {
  ui.grid.dataset.layout = state.layout;
  ui.grid.setAttribute("aria-busy", "true");
  ui.grid.innerHTML = Array.from({ length: 6 }, () => `<div class="skeleton-card">
    <div class="skeleton skeleton-card__media"></div>
    <div class="skeleton-card__body">
      <div class="skeleton skeleton-line skeleton-line--short"></div>
      <div class="skeleton skeleton-line skeleton-line--medium"></div>
      <div class="skeleton skeleton-line skeleton-line--tiny"></div>
    </div>
  </div>`).join("");
  ui.resultsCount.textContent = "Cargando…";
  ui.empty.hidden = true;
  ui.pagination.innerHTML = "";
  ui.activeFilters.innerHTML = "";
  ui.filterCount.hidden = true;
  ui.promoTabs.hidden = true;
}

function render() {
  if (!state.hasLoaded) return;

  syncNav();
  ui.categoriesSection.hidden = state.view === "favoritos";
  ui.promoTabs.hidden = state.view !== "promos";
  ui.resultsEyebrow.textContent = state.view === "promos" ? "Ofertas y premios" : state.view === "favoritos" ? "Guardados" : "Directorio";
  ui.resultsTitle.textContent = state.view === "promos" ? "Promociones" : state.view === "favoritos" ? "Tus favoritos" : "Negocios";

  updatePromoTabs();
  setupSortOptions();
  renderFiltersVisibility();
  syncControls();

  const all = currentList();
  const base = all.filter((item) => matches(item, true));
  renderCategories(base);

  const results = sortList(all.filter((item) => matches(item, false)));
  const total = results.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (state.page > pages) state.page = pages;
  if (state.page < 1) state.page = 1;

  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = results.slice(start, start + PAGE_SIZE);

  ui.grid.dataset.layout = state.layout;
  ui.grid.innerHTML = pageItems.length
    ? pageItems.map((item, index) => state.view === "promos" ? promoCard(item, index) : businessCard(item, index)).join("")
    : "";
  ui.grid.setAttribute("aria-busy", "false");

  updateCount(total, start, pageItems.length);
  renderEmpty(total);
  renderPagination(total, pages);
  renderActiveFilters();
  updateFilterCount();
  updateFavoriteUI();
  syncUrl();
}

function renderCategories(base) {
  const source = state.view === "promos" ? state.promos : state.profiles;
  const categories = [...new Set(source.map((item) => item.category).filter(Boolean))].sort(collator.compare);
  const counts = new Map();
  base.forEach((item) => counts.set(item.category, (counts.get(item.category) || 0) + 1));

  const allCount = base.length;
  const todosStyle = { bg: "#fdecee", color: "#c71f37", icon: "store" };
  const tiles = [`<button type="button" class="cat-tile${state.category === "Todos" ? " is-active" : ""}" data-category="Todos" aria-pressed="${state.category === "Todos"}" style="--cat-bg:${todosStyle.bg};--cat-color:${todosStyle.color}">
    <span class="cat-tile__icon">${icon(todosStyle.icon)}</span>
    <span class="cat-tile__name">Todos</span>
    <span class="cat-tile__count">${allCount}</span>
  </button>`];

  categories.forEach((category) => {
    const style = categoryStyle(category);
    const active = state.category === category;
    tiles.push(`<button type="button" class="cat-tile${active ? " is-active" : ""}" data-category="${escapeHtml(category)}" aria-pressed="${active}" style="--cat-bg:${style.bg};--cat-color:${style.color}">
      <span class="cat-tile__icon">${icon(style.icon)}</span>
      <span class="cat-tile__name">${escapeHtml(category)}</span>
      <span class="cat-tile__count">${counts.get(category) || 0}</span>
    </button>`);
  });

  ui.categoryList.innerHTML = tiles.join("");
}

function getSortOptions() {
  if (state.view === "promos") {
    if (state.promoKind === "Premio") {
      return [
        { value: "name", label: "Nombre A–Z" },
        { value: "modality", label: "Modalidad" },
        { value: "business", label: "Negocio A–Z" },
      ];
    }
    return [
      { value: "price-asc", label: "Precio: menor a mayor" },
      { value: "price-desc", label: "Precio: mayor a menor" },
      { value: "name", label: "Nombre A–Z" },
      { value: "business", label: "Negocio A–Z" },
    ];
  }
  return [
    { value: "name", label: "Nombre A–Z" },
    { value: "floor", label: "Piso (menor a mayor)" },
    { value: "category", label: "Categoría A–Z" },
  ];
}

function setupSortOptions() {
  const options = getSortOptions();
  if (!options.some((option) => option.value === state.sort)) {
    state.sort = options[0].value;
  }
  ui.sort.innerHTML = options.map((option) => `<option value="${option.value}">${option.label}</option>`).join("");
  ui.sort.value = state.sort;
}

function renderFiltersVisibility() {
  ui.typeFilterWrap.hidden = state.view === "promos";
  ui.promoFilterWrap.hidden = state.view !== "promos";
  ui.modalityWrap.hidden = state.promoKind !== "Premio";
  ui.priceWrap.hidden = state.promoKind !== "Descuento";
}

function syncControls() {
  ui.filterCategory.value = state.category;
  ui.filterType.value = state.type;
  ui.filterPrice.value = state.price;
  ui.sort.value = state.sort;

  $$("[data-floor]", ui.floorChips).forEach((button) => {
    const active = button.dataset.floor === state.floor;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $$("[data-modality]", ui.modalityChips).forEach((button) => {
    const active = button.dataset.modality === state.modality;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $$(".view-btn[data-layout]").forEach((button) => {
    const active = button.dataset.layout === state.layout;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateSearchClear();
}

function updatePromoTabs() {
  const discounts = state.promos.filter((promo) => promo.type === "Descuento").length;
  const prizes = state.promos.filter((promo) => promo.type === "Premio").length;
  ui.countDesc.textContent = discounts;
  ui.countPrem.textContent = prizes;
  $$("[data-promo-kind]", ui.promoTabs).forEach((button) => {
    const active = button.dataset.promoKind === state.promoKind;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function updateCount(total, start, visible) {
  const noun = state.view === "promos"
    ? state.promoKind === "Premio" ? (total === 1 ? "premio" : "premios") : (total === 1 ? "descuento" : "descuentos")
    : state.view === "favoritos" ? (total === 1 ? "favorito" : "favoritos") : (total === 1 ? "negocio" : "negocios");

  if (!total) {
    ui.resultsCount.textContent = `0 ${noun}`;
  } else if (total <= PAGE_SIZE) {
    ui.resultsCount.textContent = `${total} ${noun}`;
  } else {
    ui.resultsCount.textContent = `Mostrando ${start + 1}–${start + visible} de ${total} ${noun}`;
  }
}

function renderEmpty(total) {
  if (state.error) {
    ui.empty.hidden = false;
    ui.emptyTitle.textContent = "No se pudieron cargar los datos";
    ui.emptyText.textContent = "Revisa tu conexión e inténtalo de nuevo.";
    ui.emptyReset.textContent = "Reintentar";
    ui.emptyReset.dataset.action = "retry";
    return;
  }

  if (total > 0) {
    ui.empty.hidden = true;
    return;
  }

  ui.empty.hidden = false;

  if (state.view === "favoritos" && state.favorites.size === 0) {
    ui.emptyTitle.textContent = "Aún no tienes favoritos";
    ui.emptyText.textContent = "Toca el corazón de un negocio para guardarlo aquí.";
    ui.emptyReset.textContent = "Explorar negocios";
    ui.emptyReset.dataset.action = "explore";
    return;
  }

  ui.emptyTitle.textContent = state.view === "favoritos" ? "No hay favoritos con esos filtros" : "No encontramos resultados";
  ui.emptyText.textContent = state.view === "promos"
    ? "Prueba con otra palabra, categoría o filtro."
    : "Prueba con otra palabra, categoría o piso.";
  ui.emptyReset.textContent = "Limpiar filtros";
  ui.emptyReset.dataset.action = "reset";
}

function renderPagination(total, pages) {
  if (total === 0 || pages <= 1) {
    ui.pagination.innerHTML = "";
    return;
  }

  const items = [];
  items.push(`<button type="button" class="page-btn" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Página anterior">${icon("chevron-left")}</button>`);

  const numbers = [];
  const add = (value) => numbers.push(value);
  if (pages <= 7) {
    for (let page = 1; page <= pages; page++) add(page);
  } else {
    add(1);
    let from = Math.max(2, state.page - 1);
    let to = Math.min(pages - 1, state.page + 1);
    if (state.page <= 3) {
      from = 2;
      to = Math.min(pages - 1, 5);
    } else if (state.page >= pages - 2) {
      from = Math.max(2, pages - 4);
      to = pages - 1;
    }
    if (from > 2) add("…");
    for (let page = from; page <= to; page++) add(page);
    if (to < pages - 1) add("…");
    add(pages);
  }

  numbers.forEach((page) => {
    if (page === "…") {
      items.push('<span class="page-ellipsis" aria-hidden="true">…</span>');
      return;
    }
    const active = page === state.page;
    items.push(`<button type="button" class="page-btn${active ? " is-active" : ""}" data-page="${page}" ${active ? 'aria-current="page"' : ""} aria-label="Página ${page}">${page}</button>`);
  });

  items.push(`<button type="button" class="page-btn" data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""} aria-label="Página siguiente">${icon("chevron-right")}</button>`);
  ui.pagination.innerHTML = items.join("");
}

function renderActiveFilters() {
  const chips = [];
  const add = (label, key) => {
    chips.push(`<span class="filter-chip"><span>${escapeHtml(label)}</span><button type="button" class="filter-chip__x" data-clear="${key}" aria-label="Quitar filtro ${escapeHtml(label)}">${icon("close")}</button></span>`);
  };

  if (state.searchRaw.trim()) {
    const raw = state.searchRaw.trim();
    add(`“${raw.length > 22 ? `${raw.slice(0, 22)}…` : raw}”`, "search");
  }
  if (state.category !== "Todos") add(state.category, "category");
  if (state.floor !== "Todos") add(`Piso ${state.floor}`, "floor");
  if (state.view !== "promos" && state.type !== "Todos") add(state.type, "type");
  if (state.view === "promos" && state.promoKind === "Premio" && state.modality !== "Todos") add(state.modality, "modality");
  if (state.view === "promos" && state.promoKind === "Descuento" && state.price !== "Todos") {
    const band = PRICE_BANDS.find((entry) => entry.value === state.price);
    if (band) add(band.label, "price");
  }

  ui.activeFilters.innerHTML = chips.length
    ? `${chips.join("")}<button type="button" class="filter-clear-all" data-clear="all">Limpiar todo</button>`
    : "";
}

function updateFilterCount() {
  const count = [
    state.category !== "Todos",
    state.floor !== "Todos",
    state.view !== "promos" && state.type !== "Todos",
    state.view === "promos" && state.promoKind === "Premio" && state.modality !== "Todos",
    state.view === "promos" && state.promoKind === "Descuento" && state.price !== "Todos",
  ].filter(Boolean).length;
  ui.filterCount.textContent = count;
  ui.filterCount.hidden = count === 0;
}

function syncNav() {
  $$("[data-view].nav-link").forEach((button) => {
    const active = button.dataset.view === state.view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function updateFavoriteUI() {
  const count = state.favorites.size;
  [ui.favCount, ui.favNavCount].forEach((element) => {
    element.textContent = count;
    element.hidden = count === 0;
  });
  ui.favTrigger.setAttribute("aria-label", count ? `Ver favoritos (${count})` : "Ver favoritos");

  $$("[data-fav]").forEach((button) => {
    const active = state.favorites.has(Number(button.dataset.fav));
    const name = button.dataset.name || "negocio";
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", `${active ? "Quitar de favoritos" : "Guardar en favoritos"}: ${name}`);
  });
}

function updateSearchClear() {
  const hasValue = state.searchRaw.length > 0;
  ui.clearSearch.hidden = !hasValue;
  ui.clearSearchMobile.hidden = !hasValue;
  ui.clearSearchHero.hidden = !hasValue;
}

function syncSearchInputs(value) {
  ui.searchInput.value = value;
  ui.mobileSearchInput.value = value;
  ui.heroSearchInput.value = value;
  updateSearchClear();
}

/* ---------- Filtros ---------- */

function setupFilters() {
  const categories = [...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))].sort(collator.compare);
  const types = [...new Set(state.profiles.map((profile) => profile.type).filter(Boolean))].sort(collator.compare);
  const floors = [...new Set(state.profiles.map((profile) => String(profile.floor)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));

  ui.filterCategory.innerHTML = `<option value="Todos">Todas las categorías</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
  ui.filterType.innerHTML = `<option value="Todos">Todos los tipos</option>${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}`;
  ui.filterPrice.innerHTML = PRICE_BANDS.map((band) => `<option value="${band.value}">${band.label}</option>`).join("");

  ui.filterCategory.setAttribute("aria-label", "Filtrar por categoría");
  ui.filterType.setAttribute("aria-label", "Filtrar por tipo de negocio");
  ui.filterPrice.setAttribute("aria-label", "Filtrar por precio");

  ui.floorChips.innerHTML = ["Todos", ...floors].map((floor) => {
    const active = floor === state.floor;
    const label = floor === "Todos" ? "Todos" : `Piso ${floor}`;
    return `<button type="button" class="chip-option${active ? " is-active" : ""}" data-floor="${escapeHtml(floor)}" aria-pressed="${active}">${label}</button>`;
  }).join("");

  ui.modalityChips.innerHTML = MODALITIES.map((modality) => {
    const active = modality === state.modality;
    return `<button type="button" class="chip-option${active ? " is-active" : ""}" data-modality="${escapeHtml(modality)}" aria-pressed="${active}">${modality}</button>`;
  }).join("");

  ui.catNote.textContent = `${categories.length} categorías · ${floors.length} pisos para explorar.`;
}

function resetFilters(includeSearch = true) {
  state.category = "Todos";
  state.floor = "Todos";
  state.type = "Todos";
  state.modality = "Todos";
  state.price = "Todos";
  state.page = 1;

  if (includeSearch) {
    state.searchRaw = "";
    state.search = "";
    syncSearchInputs("");
  }

  render();
}

function clearFilter(key) {
  if (key === "all") {
    resetFilters(true);
    return;
  }
  if (key === "search") {
    clearTimeout(searchTimer);
    state.searchRaw = "";
    state.search = "";
    syncSearchInputs("");
  } else if (key === "category") {
    state.category = "Todos";
  } else if (key === "floor") {
    state.floor = "Todos";
  } else if (key === "type") {
    state.type = "Todos";
  } else if (key === "modality") {
    state.modality = "Todos";
  } else if (key === "price") {
    state.price = "Todos";
  }
  state.page = 1;
  render();
}

/* ---------- Navegación ---------- */

function setView(view) {
  if (!["negocios", "promos", "favoritos"].includes(view)) return;
  state.view = view;
  state.page = 1;
  state.sort = defaultSort(view, state.promoKind);
  closeMobileSearch();
  render();
  scrollToResults();
}

function setPromoKind(kind) {
  if (!["Descuento", "Premio"].includes(kind)) return;
  state.promoKind = kind;
  state.modality = "Todos";
  state.price = "Todos";
  state.page = 1;
  state.sort = defaultSort("promos", kind);
  render();
}

function setLayout(layout) {
  if (!["grid", "list"].includes(layout) || state.layout === layout) return;
  state.layout = layout;
  try {
    localStorage.setItem(LAYOUT_KEY, layout);
  } catch {}
  ui.grid.dataset.layout = layout;
  $$(".view-btn[data-layout]").forEach((button) => {
    const active = button.dataset.layout === layout;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  syncUrl();
}

function scrollToResults() {
  ui.results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeMobileSearch() {
  ui.mobileSearchWrap.classList.remove("is-open");
  ui.mobileSearchToggle.setAttribute("aria-expanded", "false");
}

/* ---------- Favoritos ---------- */

function toggleFavorite(id) {
  const numericId = Number(id);
  if (!state.profilesById.has(numericId)) return;
  if (state.favorites.has(numericId)) state.favorites.delete(numericId);
  else state.favorites.add(numericId);
  saveFavorites();
  updateFavoriteUI();
  if (state.view === "favoritos") render();
}

/* ---------- Modal ---------- */

function openModal() {
  lastFocus = document.activeElement;
  trapEl = ui.modal;
  ui.modal.hidden = false;
  document.body.classList.add("no-scroll");
  requestAnimationFrame(() => ui.modalClose.focus());
}

function closeModal() {
  if (ui.modal.hidden) return;
  ui.modal.hidden = true;
  ui.modalBody.innerHTML = "";
  document.body.classList.remove("no-scroll");
  trapEl = null;
  state.openBusinessId = null;
  state.openPromoId = null;
  state.backTo = null;
  syncUrl();
  if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
  lastFocus = null;
}

function openBusiness(id, backTo = null) {
  const profile = state.profilesById.get(Number(id));
  if (!profile) return;
  state.openBusinessId = profile.id;
  state.openPromoId = null;
  state.backTo = backTo;
  ui.modalBody.innerHTML = businessDetail(profile);
  openModal();
  updateFavoriteUI();
  syncUrl();
}

function openPromo(id, backTo = null) {
  const promo = state.promos.find((item) => String(item.id) === String(id));
  if (!promo) return;
  state.openPromoId = promo.id;
  state.openBusinessId = null;
  state.backTo = backTo;
  ui.modalBody.innerHTML = promoDetail(promo);
  openModal();
  syncUrl();
}

/* ---------- Panel de filtros ---------- */

function openFilter() {
  if (!ui.modal.hidden) closeModal();
  lastFocus = document.activeElement;
  trapEl = ui.filterPanel;
  ui.filterPanel.classList.add("is-open");
  ui.filterBackdrop.classList.add("is-open");
  ui.filterPanel.setAttribute("aria-hidden", "false");
  ui.filterBtn.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
  requestAnimationFrame(() => ui.filterClose.focus());
}

function closeFilter() {
  if (!ui.filterPanel.classList.contains("is-open")) return;
  ui.filterPanel.classList.remove("is-open");
  ui.filterBackdrop.classList.remove("is-open");
  ui.filterPanel.setAttribute("aria-hidden", "true");
  ui.filterBtn.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
  trapEl = null;
  if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
  lastFocus = null;
}

/* ---------- URL ---------- */

function readUrl() {
  const params = new URLSearchParams(location.search);
  const view = params.get("v");
  state.view = view === "promos" || view === "favoritos" ? view : "negocios";
  state.category = params.get("cat") || "Todos";
  state.floor = params.get("piso") || "Todos";
  state.type = params.get("tipo") || "Todos";
  state.promoKind = params.get("promo") === "Premio" ? "Premio" : "Descuento";
  state.modality = params.get("mod") || "Todos";
  state.price = params.get("precio") || "Todos";
  state.sort = defaultSort(state.view, state.promoKind);

  const query = params.get("q") || "";
  state.searchRaw = query;
  state.search = normalize(query);

  const page = Number(params.get("page"));
  state.page = Number.isFinite(page) && page >= 1 ? page : 1;

  const order = params.get("orden");
  if (order) state.sort = order;

  const layout = params.get("layout");
  if (layout === "list" || layout === "grid") state.layout = layout;

  state.openBusinessId = Number(params.get("negocio")) || null;
  state.openPromoId = params.get("oferta") || null;
}

function validateState() {
  const categories = new Set(state.profiles.map((profile) => profile.category));
  const floors = new Set(state.profiles.map((profile) => String(profile.floor)));
  const types = new Set(state.profiles.map((profile) => profile.type));

  if (state.category !== "Todos" && !categories.has(state.category)) state.category = "Todos";
  if (state.floor !== "Todos" && !floors.has(state.floor)) state.floor = "Todos";
  if (state.type !== "Todos" && !types.has(state.type)) state.type = "Todos";
  if (!MODALITIES.includes(state.modality)) state.modality = "Todos";
  if (!PRICE_BANDS.some((band) => band.value === state.price)) state.price = "Todos";
  if (!["Descuento", "Premio"].includes(state.promoKind)) state.promoKind = "Descuento";
  if (!["grid", "list"].includes(state.layout)) state.layout = "grid";

  if (state.openBusinessId && !state.profilesById.has(state.openBusinessId)) state.openBusinessId = null;
  if (state.openPromoId && !state.promos.some((promo) => String(promo.id) === String(state.openPromoId))) state.openPromoId = null;
}

function syncUrl() {
  if (!state.hasLoaded) return;
  const params = new URLSearchParams();
  if (state.view !== "negocios") params.set("v", state.view);
  if (state.category !== "Todos") params.set("cat", state.category);
  if (state.floor !== "Todos") params.set("piso", state.floor);
  if (state.view !== "promos" && state.type !== "Todos") params.set("tipo", state.type);
  if (state.view === "promos") {
    if (state.promoKind === "Premio") params.set("promo", "Premio");
    if (state.promoKind === "Premio" && state.modality !== "Todos") params.set("mod", state.modality);
    if (state.promoKind === "Descuento" && state.price !== "Todos") params.set("precio", state.price);
  }
  if (state.searchRaw.trim()) params.set("q", state.searchRaw.trim());
  if (state.sort !== defaultSort(state.view, state.promoKind)) params.set("orden", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.layout !== "grid") params.set("layout", state.layout);
  if (state.openBusinessId) params.set("negocio", String(state.openBusinessId));
  else if (state.openPromoId) params.set("oferta", String(state.openPromoId));

  const query = params.toString();
  try {
    history.replaceState(null, "", query ? `${location.pathname}?${query}` : location.pathname);
  } catch {}
}

/* ---------- Datos iniciales ---------- */

function populateHero() {
  const categories = [...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))];
  const floors = [...new Set(state.profiles.map((profile) => String(profile.floor)).filter(Boolean))];
  ui.heroBiz.textContent = state.profiles.length;
  ui.heroPromos.textContent = state.promos.length;
  ui.heroCats.textContent = categories.length;
  ui.legalBiz.textContent = state.profiles.length;
  ui.legalPromos.textContent = state.promos.length;

  const preferred = [1, 6, 47].map((id) => state.profilesById.get(id)).filter(Boolean);
  const picks = preferred.length >= 3 ? preferred.slice(0, 3) : state.profiles.slice(0, 3);
  const figures = picks.map((profile, index) => `<figure class="hero__shot${index === 0 ? " hero__shot--main" : ""}">
    <img src="${escapeHtml(profile.banner)}" alt="" width="600" height="300" loading="eager" decoding="async"${index === 0 ? ' fetchpriority="high"' : ""}>
    <figcaption>${escapeHtml(profile.category)}</figcaption>
  </figure>`).join("");

  ui.heroMosaic.innerHTML = `<div class="hero__sticker"><strong>${state.promos.length}</strong><span>promociones<br>activas</span></div>${figures}`;
  ui.catNote.textContent = `${categories.length} categorías · ${floors.length} pisos para explorar.`;

  const counts = new Map();
  state.profiles.forEach((profile) => counts.set(profile.category, (counts.get(profile.category) || 0) + 1));
  const popular = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || collator.compare(a[0], b[0]))
    .slice(0, 4);
  ui.heroQuickCats.innerHTML = popular
    .map(([category]) => `<button type="button" class="hero-chip" data-hero-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`)
    .join("");
}

async function loadData() {
  state.loading = true;
  state.error = null;
  renderSkeletons();

  try {
    const { profiles, promos, profilesById } = await loadDirectory();
    state.profiles = profiles;
    state.promos = promos;
    state.profilesById = profilesById;
    state.favorites = new Set([...state.favorites].filter((id) => profilesById.has(id)));
    saveFavorites();

    setupFilters();
    populateHero();
    readUrl();
    validateState();
    syncSearchInputs(state.searchRaw);

    state.loading = false;
    state.hasLoaded = true;
    render();

    if (state.openBusinessId) openBusiness(state.openBusinessId);
    else if (state.openPromoId) openPromo(state.openPromoId);
  } catch (error) {
    console.error(error);
    state.loading = false;
    state.hasLoaded = false;
    state.error = error;
    ui.grid.innerHTML = "";
    ui.grid.setAttribute("aria-busy", "false");
    ui.resultsCount.textContent = "No se pudieron cargar los datos";
    ui.pagination.innerHTML = "";
    ui.promoTabs.hidden = true;
    ui.categoryList.innerHTML = "";
    ui.activeFilters.innerHTML = "";
    ui.filterCount.hidden = true;
    renderEmpty(0);
  }
}

/* ---------- Eventos ---------- */

function handleSearchInput(value) {
  state.searchRaw = value;
  state.search = normalize(value);
  updateSearchClear();

  if (document.activeElement !== ui.searchInput) ui.searchInput.value = value;
  if (document.activeElement !== ui.mobileSearchInput) ui.mobileSearchInput.value = value;
  if (document.activeElement !== ui.heroSearchInput) ui.heroSearchInput.value = value;

  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.page = 1;
    render();
  }, 180);
}

function submitSearch() {
  clearTimeout(searchTimer);
  state.search = normalize(state.searchRaw);
  state.page = 1;
  render();
  scrollToResults();
}

function clearSearch() {
  clearTimeout(searchTimer);
  state.searchRaw = "";
  state.search = "";
  syncSearchInputs("");
  state.page = 1;
  render();
}

function onKeydown(event) {
  if (event.key === "Escape") {
    if (!ui.modal.hidden) {
      closeModal();
      return;
    }
    if (ui.filterPanel.classList.contains("is-open")) {
      closeFilter();
      return;
    }
    if (ui.mobileSearchWrap.classList.contains("is-open")) {
      closeMobileSearch();
      return;
    }
  }

  if (event.key !== "Tab" || !trapEl) return;
  const focusable = [...trapEl.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element.getClientRects().length > 0 && element.getAttribute("aria-hidden") !== "true");
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
}

function bindEvents() {
  if (eventsBound) return;
  eventsBound = true;

  ui.searchInput.addEventListener("input", () => handleSearchInput(ui.searchInput.value));
  ui.mobileSearchInput.addEventListener("input", () => handleSearchInput(ui.mobileSearchInput.value));
  ui.heroSearchInput.addEventListener("input", () => handleSearchInput(ui.heroSearchInput.value));
  ui.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitSearch();
  });
  ui.mobileSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitSearch();
  });
  ui.heroSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitSearch();
  });

  ui.heroQuickCats.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-hero-category]");
    if (!chip) return;
    state.category = chip.dataset.heroCategory;
    state.page = 1;
    render();
    scrollToResults();
  });

  ui.clearSearch.addEventListener("click", clearSearch);
  ui.clearSearchMobile.addEventListener("click", clearSearch);
  ui.clearSearchHero.addEventListener("click", clearSearch);

  ui.mobileSearchToggle.addEventListener("click", () => {
    const open = !ui.mobileSearchWrap.classList.contains("is-open");
    ui.mobileSearchWrap.classList.toggle("is-open", open);
    ui.mobileSearchToggle.setAttribute("aria-expanded", String(open));
    if (open) setTimeout(() => ui.mobileSearchInput.focus(), 0);
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-view]");
    if (!trigger) return;
    event.preventDefault();
    setView(trigger.dataset.view);
    const scrollTarget = trigger.dataset.scroll;
    if (scrollTarget) {
      requestAnimationFrame(() => {
        document.getElementById(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  });

  ui.categoryList.addEventListener("click", (event) => {
    const tile = event.target.closest("[data-category]");
    if (!tile) return;
    state.category = tile.dataset.category;
    state.page = 1;
    render();
    scrollToResults();
  });

  ui.promoTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-promo-kind]");
    if (!tab) return;
    setPromoKind(tab.dataset.promoKind);
  });

  ui.filterBtn.addEventListener("click", () => {
    if (ui.filterPanel.classList.contains("is-open")) closeFilter();
    else openFilter();
  });
  ui.filterClose.addEventListener("click", closeFilter);
  ui.filterBackdrop.addEventListener("click", closeFilter);
  ui.filterApply.addEventListener("click", closeFilter);
  ui.filterReset.addEventListener("click", () => resetFilters(false));

  ui.filterCategory.addEventListener("change", () => {
    state.category = ui.filterCategory.value;
    state.page = 1;
    render();
  });
  ui.filterType.addEventListener("change", () => {
    state.type = ui.filterType.value;
    state.page = 1;
    render();
  });
  ui.filterPrice.addEventListener("change", () => {
    state.price = ui.filterPrice.value;
    state.page = 1;
    render();
  });

  ui.floorChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-floor]");
    if (!button) return;
    state.floor = button.dataset.floor;
    state.page = 1;
    render();
  });

  ui.modalityChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-modality]");
    if (!button) return;
    state.modality = button.dataset.modality;
    state.page = 1;
    render();
  });

  ui.sort.addEventListener("change", () => {
    state.sort = ui.sort.value;
    state.page = 1;
    render();
  });

  $$(".view-btn[data-layout]").forEach((button) => {
    button.addEventListener("click", () => setLayout(button.dataset.layout));
  });

  ui.activeFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-clear]");
    if (!button) return;
    clearFilter(button.dataset.clear);
  });

  ui.grid.addEventListener("click", (event) => {
    const favorite = event.target.closest("[data-fav]");
    if (favorite) {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(favorite.dataset.fav);
      return;
    }

    if (event.target.closest("a")) return;

    const business = event.target.closest("[data-business]");
    if (business) {
      event.preventDefault();
      openBusiness(business.dataset.business);
      return;
    }

    const promo = event.target.closest("[data-promo]");
    if (promo) {
      event.preventDefault();
      openPromo(promo.dataset.promo);
      return;
    }

    const cardBusiness = event.target.closest("[data-card-business]");
    if (cardBusiness) {
      openBusiness(cardBusiness.dataset.cardBusiness);
      return;
    }

    const cardPromo = event.target.closest("[data-card-promo]");
    if (cardPromo) {
      openPromo(cardPromo.dataset.cardPromo);
    }
  });

  ui.pagination.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const page = Number(button.dataset.page);
    if (!Number.isFinite(page) || page === state.page) return;
    state.page = page;
    render();
    scrollToResults();
  });

  ui.emptyReset.addEventListener("click", () => {
    const action = ui.emptyReset.dataset.action;
    if (action === "retry") loadData();
    else if (action === "explore") setView("negocios");
    else resetFilters(true);
  });

  ui.modalClose.addEventListener("click", closeModal);
  ui.modal.addEventListener("click", (event) => {
    if (event.target === ui.modal || event.target.closest("[data-close-modal]")) closeModal();
  });

  ui.modalBody.addEventListener("click", (event) => {
    const favorite = event.target.closest("[data-fav]");
    if (favorite) {
      event.preventDefault();
      toggleFavorite(favorite.dataset.fav);
      return;
    }

    const back = event.target.closest("[data-back]");
    if (back) {
      event.preventDefault();
      if (back.dataset.back === "business") openBusiness(back.dataset.backId);
      else openPromo(back.dataset.backId);
      return;
    }

    const business = event.target.closest("[data-business]");
    if (business) {
      event.preventDefault();
      const backTo = business.dataset.backPromo ? { type: "promo", id: business.dataset.backPromo } : null;
      openBusiness(business.dataset.business, backTo);
      return;
    }

    const promo = event.target.closest("[data-promo]");
    if (promo) {
      event.preventDefault();
      const backTo = promo.dataset.backBusiness ? { type: "business", id: promo.dataset.backBusiness } : null;
      openPromo(promo.dataset.promo, backTo);
    }
  });

  document.addEventListener("keydown", onKeydown);

  ui.toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    const visible = window.scrollY > 600;
    ui.toTop.hidden = !visible;
    ui.toTop.classList.toggle("is-visible", visible);
  }, { passive: true });

  window.addEventListener("storage", (event) => {
    if (event.key !== FAV_KEY) return;
    state.favorites = loadFavorites();
    updateFavoriteUI();
    if (state.view === "favoritos") render();
  });
}

/* ---------- Arranque ---------- */

function setupHeroSearchVisibility() {
  if (!("IntersectionObserver" in window)) return;
  const update = (visible) => ui.siteHeader.classList.toggle("is-hero-search-visible", visible);
  const rect = ui.heroSearchForm.getBoundingClientRect();
  update(rect.top < window.innerHeight && rect.bottom > 70);

  const observer = new IntersectionObserver(([entry]) => {
    update(entry.isIntersecting);
  }, { threshold: 0, rootMargin: "-70px 0px 0px 0px" });
  observer.observe(ui.heroSearchForm);
}

function init() {
  renderSkeletons();
  setupHeroSearchVisibility();
  bindEvents();
  loadData();
}

init();
