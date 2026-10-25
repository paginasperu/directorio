import { loadDirectory, normalize } from "../../shared/data.js";
import { detail, row } from "./views.js";

const state = {
  category: "Todos",
  floor: "Todos",
  sort: "name",
  search: "",
  profiles: [],
  byId: new Map(),
};

const $ = (selector) => document.querySelector(selector);
const ui = {
  rows: $("#rows"),
  count: $("#count"),
  empty: $("#empty"),
  search: $("#search"),
  category: $("#category"),
  floor: $("#floor"),
  sort: $("#sort"),
  modal: $("#modal"),
  modalCard: $("#modalCard"),
};

const collator = new Intl.Collator("es-PE", { sensitivity: "base" });

function fill(select, options, current) {
  select.innerHTML = options.map((option) =>
    `<option value="${option.value}"${option.value === current ? " selected" : ""}>${option.label}</option>`
  ).join("");
}

function setup() {
  const categories = [...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))].sort(collator.compare);
  fill(ui.category, [{ value: "Todos", label: "Todas las categorías" }, ...categories.map((value) => ({ value, label: value }))], state.category);

  const floors = [...new Set(state.profiles.map((profile) => profile.floor).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  fill(ui.floor, [{ value: "Todos", label: "Todos los pisos" }, ...floors.map((value) => ({ value, label: `Piso ${value}` }))], state.floor);
}

function matches(profile) {
  if (state.category !== "Todos" && profile.category !== state.category) return false;
  if (state.floor !== "Todos" && profile.floor !== state.floor) return false;
  if (!state.search) return true;
  return normalize([profile.name, profile.type, profile.short, profile.catalog, profile.keywords, profile.floor, profile.unit].join(" ")).includes(state.search);
}

function sorted(list) {
  const result = [...list];
  if (state.sort === "piso") result.sort((a, b) => Number(a.floor) - Number(b.floor) || collator.compare(a.name, b.name));
  else if (state.sort === "promos") result.sort((a, b) => b.promos.length - a.promos.length || collator.compare(a.name, b.name));
  else result.sort((a, b) => collator.compare(a.name, b.name));
  return result;
}

function render() {
  const results = sorted(state.profiles.filter(matches));
  let html = "";
  let letter = "";

  for (const profile of results) {
    const initial = normalize(profile.name).charAt(0).toUpperCase();
    if (initial !== letter) {
      letter = initial;
      html += `<div class="letter">${letter}</div>`;
    }
    html += row(profile);
  }

  ui.rows.innerHTML = html;
  ui.count.textContent = `${results.length} ${results.length === 1 ? "negocio" : "negocios"}`;
  ui.empty.classList.toggle("hidden", results.length > 0);
}

function openDetail(profile) {
  ui.modalCard.innerHTML = detail(profile);
  ui.modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeDetail() {
  ui.modal.classList.add("hidden");
  document.body.style.overflow = "";
}

function bind() {
  ui.search.addEventListener("input", () => { state.search = normalize(ui.search.value); render(); });
  ui.category.addEventListener("change", () => { state.category = ui.category.value; render(); });
  ui.floor.addEventListener("change", () => { state.floor = ui.floor.value; render(); });
  ui.sort.addEventListener("change", () => { state.sort = ui.sort.value; render(); });

  ui.rows.addEventListener("click", (event) => {
    if (event.target.closest(".wa")) return;
    const button = event.target.closest("[data-id]");
    if (!button) return;
    const profile = state.byId.get(Number(button.dataset.id));
    if (profile) openDetail(profile);
  });

  ui.modal.addEventListener("click", (event) => {
    if (event.target === ui.modal || event.target.closest("[data-close]")) closeDetail();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !ui.modal.classList.contains("hidden")) closeDetail();
  });
}

async function init() {
  try {
    const { profiles, profilesById } = await loadDirectory();
    state.profiles = profiles;
    state.byId = profilesById;
    setup();
    bind();
    render();

    const openId = Number(new URLSearchParams(location.search).get("open"));
    if (openId) {
      const profile = state.byId.get(openId);
      if (profile) openDetail(profile);
    }
  } catch (error) {
    console.error(error);
    ui.count.textContent = "No se pudieron cargar los datos";
  }
}

init();
