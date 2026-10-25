import { getSaving, loadDirectory, normalize } from "../../shared/data.js";
import { block, categoryCard, deal, resultRow, sheet } from "./views.js";

const state = {
  category: "Todos",
  floor: "Todos",
  search: "",
  profiles: [],
  promos: [],
  byId: new Map(),
  view: "home",
};

const $ = (selector) => document.querySelector(selector);
const ui = {
  head: $("#siteHead"),
  headNav: $("#headNav"),
  rail: $("#categoryRail"),
  dealGrid: $("#dealGrid"),
  dealCount: $("#dealCount"),
  blocks: $("#categoryBlocks"),
  floorSelect: $("#floorSelect"),
  floorChips: $("#floorChips"),
  footFloors: $("#footFloors"),
  searchCategory: $("#searchCategory"),
  searchInput: $("#searchInput"),
  home: $("#home"),
  results: $("#results"),
  resultsTitle: $("#resultsTitle"),
  resultList: $("#resultList"),
  empty: $("#empty"),
  sheet: $("#sheet"),
  sheetPanel: $("#sheetPanel"),
};

const collator = new Intl.Collator("es-PE", { sensitivity: "base" });

/* ---------- cabecera que se oculta gradualmente ---------- */

function initHeader() {
  let lastY = window.scrollY;
  let offset = 0;

  const update = () => {
    const height = ui.head.offsetHeight;
    const y = window.scrollY;
    const delta = y - lastY;
    lastY = y;

    if (y <= 0) {
      offset = 0;
    } else if (Math.abs(delta) > 1) {
      // Se mueve con el scroll, pero nunca más de 30 px por evento: se siente progresivo.
      const step = Math.max(-60, Math.min(60, delta)) * 0.5;
      offset = Math.min(height, Math.max(0, offset + step));
    }

    ui.head.style.transform = offset > 0 ? `translateY(${-offset}px)` : "";
    ui.head.classList.toggle("is-stuck", offset < 2 && y > 8);
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", () => { offset = 0; ui.head.style.transform = ""; });
}

/* ---------- datos derivados ---------- */

function categories() {
  return [...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))].sort(collator.compare);
}

function imageFor(category) {
  const withPromo = state.profiles.filter((profile) => profile.category === category && profile.promos.length);
  return (withPromo[0] || state.profiles.find((profile) => profile.category === category) || {}).banner || "";
}

function matches(profile) {
  if (state.category !== "Todos" && profile.category !== state.category) return false;
  if (state.floor !== "Todos" && profile.floor !== state.floor) return false;
  if (!state.search) return true;
  return normalize([profile.name, profile.category, profile.type, profile.short, profile.catalog, profile.keywords, profile.floor, profile.unit].join(" ")).includes(state.search);
}

/* ---------- render ---------- */

function renderNav() {
  const cats = categories();
  const html = [`<button type="button" data-category="Todos" class="${state.category === "Todos" ? "is-active" : ""}">Todo</button>`]
    .concat(cats.map((category) => `<button type="button" data-category="${category}" class="${state.category === category ? "is-active" : ""}">${category}</button>`))
    .join("");
  ui.headNav.innerHTML = html;
}

function renderRail() {
  ui.rail.innerHTML = categories()
    .map((category) => categoryCard(category, state.profiles.filter((profile) => profile.category === category).length, state.profiles.find((profile) => profile.category === category)))
    .join("");
}

function renderDeals() {
  const deals = [...state.promos].filter((promo) => getSaving(promo) > 0).sort((a, b) => getSaving(b) - getSaving(a)).slice(0, 8);
  ui.dealGrid.innerHTML = deals.map(deal).join("");
  ui.dealCount.textContent = state.promos.length;
}

function renderBlocks() {
  ui.blocks.innerHTML = categories().map((category) => {
    const profiles = state.profiles
      .filter((profile) => profile.category === category)
      .sort((a, b) => collator.compare(a.name, b.name))
      .slice(0, 4);
    return block(category, profiles);
  }).join("");
}

function renderFloors() {
  const floors = [...new Set(state.profiles.map((profile) => profile.floor).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const options = floors.map((floor) => ({
    value: floor,
    count: state.profiles.filter((profile) => profile.floor === floor).length,
  }));

  ui.floorSelect.innerHTML = `<option value="Todos">Todos los pisos</option>` +
    options.map((option) => `<option value="${option.value}">Piso ${option.value}</option>`).join("");

  ui.floorChips.innerHTML = options.map((option) =>
    `<button type="button" class="floor-chip" data-floor="${option.value}">Piso ${option.value}<span>${option.count}</span></button>`
  ).join("");

  ui.footFloors.innerHTML = options.map((option) =>
    `<span>Piso ${option.value} · ${option.count} negocios</span>`
  ).join("");

  ui.searchCategory.innerHTML = `<option value="Todos">Todas</option>` +
    categories().map((category) => `<option value="${category}">${category}</option>`).join("");
}

function showHome() {
  state.view = "home";
  ui.home.classList.remove("hidden");
  ui.results.classList.add("hidden");
  renderNav();
}

function showResults() {
  state.view = "results";
  const results = state.profiles.filter(matches).sort((a, b) => collator.compare(a.name, b.name));

  ui.home.classList.add("hidden");
  ui.results.classList.remove("hidden");
  renderNav();

  const title = state.search
    ? `Resultados para “${ui.searchInput.value.trim()}”`
    : (state.category === "Todos" ? "Todos los negocios" : state.category);
  ui.resultsTitle.textContent = `${title} · ${results.length}`;

  ui.resultList.innerHTML = results.map(resultRow).join("");
  ui.empty.classList.toggle("hidden", results.length > 0);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setCategory(category) {
  state.category = category;
  showResults();
}

/* ---------- ficha ---------- */

function openSheet(profile) {
  ui.sheetPanel.innerHTML = sheet(profile);
  ui.sheet.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeSheet() {
  ui.sheet.classList.add("hidden");
  document.body.style.overflow = "";
}

/* ---------- eventos ---------- */

function bind() {
  document.addEventListener("click", (event) => {
    const categoryTrigger = event.target.closest("[data-category]");
    if (categoryTrigger) {
      setCategory(categoryTrigger.dataset.category);
      return;
    }

    const floorTrigger = event.target.closest("[data-floor]");
    if (floorTrigger) {
      state.floor = floorTrigger.dataset.floor;
      ui.floorSelect.value = state.floor;
      showResults();
      return;
    }

    const card = event.target.closest("[data-id]");
    if (card) {
      const profile = state.byId.get(Number(card.dataset.id));
      if (profile) openSheet(profile);
      return;
    }

    if (event.target.closest("[data-close]")) closeSheet();
  });

  $("#searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.search = normalize(ui.searchInput.value);
    state.category = ui.searchCategory.value;
    showResults();
  });

  $("#searchInput").addEventListener("input", () => {
    if (!ui.searchInput.value.trim() && state.view === "results") {
      state.search = "";
      showHome();
    }
  });

  ui.searchCategory.addEventListener("change", () => {
    state.category = ui.searchCategory.value;
    if (state.view === "results") showResults();
  });

  ui.floorSelect.addEventListener("change", () => {
    state.floor = ui.floorSelect.value;
    if (state.view === "results") showResults();
    else showResults();
  });

  $("#dealsBtn").addEventListener("click", () => {
    document.querySelector(".deals").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#allDeals").addEventListener("click", () => {
    state.search = "";
    state.category = "Todos";
    ui.searchInput.value = "";
    showResults();
  });

  $("#clearFilters").addEventListener("click", () => {
    state.category = "Todos";
    state.floor = "Todos";
    state.search = "";
    ui.searchInput.value = "";
    ui.searchCategory.value = "Todos";
    ui.floorSelect.value = "Todos";
    showHome();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !ui.sheet.classList.contains("hidden")) closeSheet();
  });
}

async function init() {
  try {
    const { profiles, promos, profilesById } = await loadDirectory();
    state.profiles = profiles;
    state.promos = promos;
    state.byId = profilesById;

    renderFloors();
    renderRail();
    renderDeals();
    renderBlocks();
    renderNav();
    initHeader();
    bind();

    const params = new URLSearchParams(location.search);
    const openId = Number(params.get("open"));
    const cat = params.get("cat");
    const query = params.get("q");

    if (cat || query) {
      if (cat) { state.category = cat; ui.searchCategory.value = cat; }
      if (query) { state.search = normalize(query); ui.searchInput.value = query; }
      showResults();
    }

    if (openId) {
      const profile = state.byId.get(openId);
      if (profile) openSheet(profile);
    }
  } catch (error) {
    console.error(error);
    ui.resultsTitle.textContent = "No se pudieron cargar los datos";
  }
}

init();
