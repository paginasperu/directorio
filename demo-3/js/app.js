import { getSaving, loadDirectory, normalize } from "../../shared/data.js";
import { detail, entry, feature, offer } from "./views.js";

const state = { category: "Todos", search: "", profiles: [], promos: [], byId: new Map() };

const $ = (selector) => document.querySelector(selector);
const ui = {
  sections: $("#sections"),
  feature: $("#feature"),
  offers: $("#offers"),
  entries: $("#entries"),
  entriesTitle: $("#entriesTitle"),
  count: $("#count"),
  empty: $("#empty"),
  search: $("#search"),
  modal: $("#modal"),
  modalCard: $("#modalCard"),
};

const collator = new Intl.Collator("es-PE", { sensitivity: "base" });

function matches(profile) {
  if (state.category !== "Todos" && profile.category !== state.category) return false;
  if (!state.search) return true;
  return normalize([profile.name, profile.type, profile.short, profile.catalog, profile.keywords, profile.floor, profile.unit].join(" ")).includes(state.search);
}

function renderSections() {
  const categories = ["Todos", ...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))].sort((a, b) => a === "Todos" ? -1 : b === "Todos" ? 1 : collator.compare(a, b));
  ui.sections.innerHTML = categories.map((category) =>
    `<button type="button" data-category="${category}" aria-pressed="${String(category === state.category)}" class="${category === state.category ? "is-active" : ""}">${category}</button>`
  ).join("");
}

function renderFeature() {
  const candidates = state.profiles
    .filter((profile) => profile.promos.length)
    .sort((a, b) => Math.max(...b.promos.map(getSaving)) - Math.max(...a.promos.map(getSaving)) || collator.compare(a.name, b.name));
  ui.feature.innerHTML = candidates[0] ? feature(candidates[0]) : "";
}

function renderOffers() {
  const offers = [...state.promos]
    .filter((promo) => getSaving(promo) > 0)
    .sort((a, b) => getSaving(b) - getSaving(a))
    .slice(0, 4);
  ui.offers.innerHTML = offers.map(offer).join("");
}

function renderEntries() {
  const results = state.profiles.filter(matches).sort((a, b) => collator.compare(a.name, b.name));
  ui.entriesTitle.textContent = state.category === "Todos" ? "Todos los negocios" : state.category;
  ui.entries.innerHTML = results.map((profile, index) => entry(profile, index)).join("");
  ui.count.textContent = `${results.length} ${results.length === 1 ? "negocio" : "negocios"}`;
  ui.empty.classList.toggle("hidden", results.length > 0);
}

function render() {
  renderSections();
  renderFeature();
  renderOffers();
  renderEntries();
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
  ui.sections.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    render();
  });

  ui.search.addEventListener("input", () => {
    state.search = normalize(ui.search.value);
    renderEntries();
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-id]");
    if (trigger) {
      const profile = state.byId.get(Number(trigger.dataset.id));
      if (profile) openDetail(profile);
      return;
    }
    if (event.target === ui.modal || event.target.closest("[data-close]")) closeDetail();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !ui.modal.classList.contains("hidden")) closeDetail();
  });
}

async function init() {
  try {
    const { profiles, promos, profilesById } = await loadDirectory();
    state.profiles = profiles;
    state.promos = promos;
    state.byId = profilesById;

    const now = new Date();
    const label = new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" }).format(now);
    $("#issueDate").textContent = label;

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
