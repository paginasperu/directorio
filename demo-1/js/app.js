// Orquestador: estado, filtros, orden, render y eventos.

import { loadDirectory, normalize } from "./data.js";
import { businessCard, businessDetail, promoCard, promoDetail } from "./views.js";

const state = {
  view: "negocios",
  category: "Todos",
  search: "",
  floor: "Todos",
  bizSort: "promos",
  promoTipo: "Todos",
  promoModalidad: "Todos",
  promoPrecio: "Todos",
  promoSort: "name",
  profiles: [],
  promos: [],
  profilesById: new Map(),
  backPromo: null,
  currentPromoId: null,
};

const $ = (selector) => document.querySelector(selector);
const ui = {
  grid: $("#providerGrid"),
  categoryList: $("#categoryList"),
  count: $("#resultsCount"),
  empty: $("#emptyState"),
  search: $("#businessSearch"),
  mobileSearch: $("#mobileBusinessSearch"),
  sort: $("#sortSelect"),
  sortMobile: $("#sortMobile"),
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
  modalidad: $("#modalidadFilter"),
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
    { value: "promos", label: "Con promoción primero" },
    { value: "name", label: "Nombre A–Z" },
    { value: "piso", label: "Piso" },
  ],
  promos: [
    { value: "name", label: "Nombre A–Z" },
    { value: "price-asc", label: "Precio: menor a mayor" },
    { value: "price-desc", label: "Precio: mayor a menor" },
    { value: "vigencia", label: "Vigencia" },
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

  const tipos = [...new Set(state.promos.map((promo) => promo.type).filter(Boolean))].sort(collator.compare);
  fillSelect(ui.tipo, [{ value: "Todos", label: "Todos los tipos" }, ...tipos.map((tipo) => ({ value: tipo, label: tipo }))], state.promoTipo);

  const modalidades = [...new Set(state.promos.map((promo) => promo.mode).filter(Boolean))].sort(collator.compare);
  fillSelect(ui.modalidad, [{ value: "Todos", label: "Todas las modalidades" }, ...modalidades.map((mode) => ({ value: mode, label: mode }))], state.promoModalidad);

  fillSelect(ui.precio, priceBands.map(({ value, label }) => ({ value, label })), state.promoPrecio);

  const categories = [...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))].sort(collator.compare);
  fillSelect(ui.categoryFilter, [{ value: "Todos", label: "Todas las categorías" }, ...categories.map((category) => ({ value: category, label: category }))], state.category);
}

function setupSort() {
  const options = sortOptions[state.view];
  const current = state.view === "negocios" ? state.bizSort : state.promoSort;
  fillSelect(ui.sort, options, current);
  fillSelect(ui.sortMobile, options, current);
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
  if (state.promoTipo !== "Todos" && promo.type !== state.promoTipo) return false;
  if (state.promoModalidad !== "Todos" && promo.mode !== state.promoModalidad) return false;
  if (!priceBands.find((band) => band.value === state.promoPrecio).test(promo.discounted)) return false;
  if (!state.search) return true;
  return normalize([promo.title, promo.description, promo.type, promo.mode, promo.profile?.name, promo.category].join(" ")).includes(state.search);
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
  if (state.promoSort === "price-asc") result.sort((a, b) => (a.discounted || Infinity) - (b.discounted || Infinity));
  else if (state.promoSort === "price-desc") result.sort((a, b) => (b.discounted || 0) - (a.discounted || 0));
  else if (state.promoSort === "vigencia") result.sort((a, b) => String(a.until).localeCompare(String(b.until)) || collator.compare(a.title, b.title));
  else result.sort((a, b) => collator.compare(a.title, b.title));
  return result;
}

/* ---------- render ---------- */

function renderCategories(counts) {
  const categories = ["Todos", ...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))].sort((a, b) => a === "Todos" ? -1 : b === "Todos" ? 1 : collator.compare(a, b));
  ui.categoryList.innerHTML = categories.map((category) => {
    const total = category === "Todos" ? counts.total : (counts.byCategory.get(category) || 0);
    return `<button type="button" class="category-option${category === state.category ? " is-active" : ""}" data-category="${category}" aria-pressed="${String(category === state.category)}">${category}<span class="d1-cat-count">${total}</span></button>`;
  }).join("");
}

function countBy(list, key, total) {
  const byCategory = new Map();
  list.forEach((item) => byCategory.set(item[key], (byCategory.get(item[key]) || 0) + 1));
  return { total, byCategory };
}

function renderBusinesses() {
  const base = state.profiles.filter((profile) => matchesBusiness(profile, true));
  renderCategories(countBy(base, "category", base.length));

  const results = sortedBusinesses(state.profiles.filter((profile) => matchesBusiness(profile)));
  ui.grid.innerHTML = results.map(businessCard).join("");
  ui.count.textContent = `${results.length} ${results.length === 1 ? "negocio" : "negocios"}`;
  ui.empty.querySelector("p").textContent = "Prueba con otra palabra, categoría o piso.";
  ui.empty.classList.toggle("hidden", results.length > 0);
}

function renderPromos() {
  const base = state.promos.filter((promo) => matchesPromo(promo, true));
  renderCategories(countBy(base, "category", base.length));

  const results = sortedPromos(state.promos.filter((promo) => matchesPromo(promo)));
  ui.grid.innerHTML = results.map(promoCard).join("");
  ui.count.textContent = `${results.length} ${results.length === 1 ? "promoción" : "promociones"}`;
  ui.empty.querySelector("p").textContent = "Prueba con otra palabra, categoría o filtro.";
  ui.empty.classList.toggle("hidden", results.length > 0);
}

function render() {
  if (state.view === "promos") renderPromos();
  else renderBusinesses();
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
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  setupSort();
  render();
}

/* ---------- detalle ---------- */

function openModal() {
  ui.modal.classList.remove("hidden");
  ui.modal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
}

function closeModal() {
  ui.modal.classList.add("hidden");
  ui.modal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
}

function showPromo(promo) {
  state.backPromo = null;
  state.currentPromoId = promo.id;
  ui.modalBody.innerHTML = promoDetail(promo);
  $("#modalCallBtn").classList.add("hidden");
  const wa = $("#modalWhatsappBtn");
  wa.href = promo.profile?.whatsapp ? `https://wa.me/${promo.profile.whatsapp}` : "#";
  wa.classList.toggle("hidden", !promo.profile?.whatsapp);
  wa.textContent = "WhatsApp del negocio";
  openModal();
}

function showBusiness(profile, backPromoId = null) {
  state.backPromo = backPromoId;
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
  state.bizSort = "promos";
  state.promoTipo = "Todos";
  state.promoModalidad = "Todos";
  state.promoPrecio = "Todos";
  state.promoSort = "name";
  ui.search.value = "";
  ui.mobileSearch.value = "";
  ui.floor.value = "Todos";
  ui.tipo.value = "Todos";
  ui.modalidad.value = "Todos";
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
  ui.modalidad.addEventListener("change", () => { state.promoModalidad = ui.modalidad.value; render(); });
  ui.precio.addEventListener("change", () => { state.promoPrecio = ui.precio.value; render(); });

  function applySort(value) {
    if (state.view === "negocios") state.bizSort = value;
    else state.promoSort = value;
    ui.sort.value = value;
    ui.sortMobile.value = value;
    render();
  }

  ui.sort.addEventListener("change", () => applySort(ui.sort.value));
  ui.sortMobile.addEventListener("change", () => applySort(ui.sortMobile.value));

  ui.reset.addEventListener("click", resetFilters);
  ui.resetEmpty.addEventListener("click", resetFilters);
  ui.filterToggle.addEventListener("click", () => toggleDrawer(true));
  $("#applyFilterDrawer").addEventListener("click", () => toggleDrawer(false));
  $("#closeFilterDrawer").addEventListener("click", () => toggleDrawer(false));
  ui.drawerBackdrop.addEventListener("click", () => toggleDrawer(false));

  ui.grid.addEventListener("click", (event) => {
    if (event.target.closest(".provider-whatsapp")) return;
    const promoTrigger = event.target.closest("[data-promo]");
    if (promoTrigger) {
      const promo = state.promos.find((item) => item.id === promoTrigger.dataset.promo);
      if (promo) showPromo(promo);
      return;
    }
    const trigger = event.target.closest("[data-detail]");
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
      if (promo) showPromo(promo);
    }
  });

  $("#closeDetail").addEventListener("click", closeModal);
  ui.modal.addEventListener("click", (event) => { if (event.target === ui.modal) closeModal(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !ui.modal.classList.contains("hidden")) closeModal(); });
}

async function init() {
  try {
    const { profiles, promos, profilesById } = await loadDirectory();
    state.profiles = profiles;
    state.promos = promos;
    state.profilesById = profilesById;

    setupFilters();
    setupSort();
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
    ui.count.textContent = "No se pudieron cargar los datos";
    ui.empty.classList.remove("hidden");
  }
}

init();
