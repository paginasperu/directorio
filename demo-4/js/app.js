import { getSaving, loadDirectory, normalize } from "../../shared/data.js";
import { hero, sheet, tile } from "./views.js";

const state = { category: "Todos", search: "", onlyPromo: false, profiles: [], promos: [], byId: new Map() };

const $ = (selector) => document.querySelector(selector);
const ui = {
  hero: $("#hero"),
  categories: $("#categories"),
  grid: $("#grid"),
  gridTitle: $("#gridTitle"),
  count: $("#count"),
  empty: $("#empty"),
  search: $("#search"),
  promoToggle: $("#promoToggle"),
  sheet: $("#sheet"),
  sheetPanel: $("#sheetPanel"),
};

const collator = new Intl.Collator("es-PE", { sensitivity: "base" });

function matches(profile) {
  if (state.category !== "Todos" && profile.category !== state.category) return false;
  if (state.onlyPromo && profile.promos.length === 0) return false;
  if (!state.search) return true;
  return normalize([profile.name, profile.type, profile.short, profile.catalog, profile.keywords, profile.floor, profile.unit].join(" ")).includes(state.search);
}

function renderHero() {
  const featured = [...state.profiles]
    .filter((profile) => profile.promos.length)
    .sort((a, b) => Math.max(...b.promos.map(getSaving)) - Math.max(...a.promos.map(getSaving)) || collator.compare(a.name, b.name))[0];

  const stats = {
    negocios: state.profiles.length,
    promos: state.promos.length,
    premios: state.promos.filter((promo) => promo.type === "Premio").length,
    descuentos: state.promos.filter((promo) => promo.type === "Descuento").length,
    categorias: new Set(state.profiles.map((profile) => profile.category)).size,
  };

  ui.hero.innerHTML = hero(featured, stats);
}

function renderCategories() {
  const categories = ["Todos", ...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))].sort((a, b) => a === "Todos" ? -1 : b === "Todos" ? 1 : collator.compare(a, b));
  ui.categories.innerHTML = categories.map((category) =>
    `<button type="button" class="chip${category === state.category ? " is-active" : ""}" data-category="${category}" aria-pressed="${String(category === state.category)}">${category}</button>`
  ).join("");
}

function renderGrid() {
  const results = state.profiles.filter(matches).sort((a, b) => collator.compare(a.name, b.name));
  ui.grid.innerHTML = results.map((profile, index) => tile(profile, index)).join("");
  ui.count.textContent = `${results.length} ${results.length === 1 ? "negocio" : "negocios"}`;
  ui.gridTitle.textContent = state.onlyPromo ? "Con promociones" : (state.category === "Todos" ? "Todos los negocios" : state.category);
  ui.empty.classList.toggle("hidden", results.length > 0);
}

function render() {
  renderCategories();
  renderGrid();
}

function openSheet(profile) {
  ui.sheetPanel.innerHTML = sheet(profile);
  ui.sheet.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeSheet() {
  ui.sheet.classList.add("hidden");
  document.body.style.overflow = "";
}

function bind() {
  ui.search.addEventListener("input", () => {
    state.search = normalize(ui.search.value);
    renderGrid();
  });

  ui.categories.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category]");
    if (!chip) return;
    state.category = chip.dataset.category;
    render();
  });

  ui.promoToggle.addEventListener("click", () => {
    state.onlyPromo = !state.onlyPromo;
    ui.promoToggle.setAttribute("aria-pressed", String(state.onlyPromo));
    renderGrid();
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-id]");
    if (target) {
      const profile = state.byId.get(Number(target.dataset.id));
      if (profile) openSheet(profile);
      return;
    }
    if (event.target.closest("[data-close]")) closeSheet();
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

    bind();
    renderHero();
    render();

    const openId = Number(new URLSearchParams(location.search).get("open"));
    if (openId) {
      const profile = state.byId.get(openId);
      if (profile) openSheet(profile);
    }
  } catch (error) {
    console.error(error);
    ui.count.textContent = "No se pudieron cargar los datos";
  }
}

init();
