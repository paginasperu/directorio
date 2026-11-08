// Capa de datos: carga, parseo y normalización.

import { normalize, parseCsv } from "./csv.js?v=2f119c97a127";

export { normalize, parseCsv };

// Raíz del sitio resuelta desde este archivo, no desde la página que lo importa.
const ROOT = new URL("../../", import.meta.url);

export const FILES = {
  profiles: new URL("data/negocios.csv", ROOT).href,
  promos: new URL("data/promociones.csv", ROOT).href,
};

export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatDate(value) {
  const [year, month, day] = String(value ?? "").split("-").map(Number);
  return year && month && day ? `${day} ${MONTHS[month - 1]} ${year}` : String(value ?? "");
}

export function money(value) {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) && number > 0 ? `S/ ${number.toFixed(number % 1 === 0 ? 0 : 2)}` : "";
}

export const listValues = (value) => String(value ?? "").split(/[,|;]+/).map((part) => part.trim()).filter(Boolean);
export const phoneDigits = (value) => String(value ?? "").replace(/\D/g, "");
export const imageUrl = (path) => {
  if (!path) return "";
  const localPath = String(path).replace(/^data\/images(?=\/)/, "data/img");
  return new URL(localPath, ROOT).href;
};
export const safeSocialUrl = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
};

// Acepta "79.90" y "79,90"; devuelve null si no hay número.
export const toNumber = (value) => {
  const text = String(value ?? "").trim().replace(",", ".");
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
};

function decorateProfile(row) {
  return {
    id: toNumber(row.id),
    name: row.nombre,
    floor: row.piso,
    unit: row.tienda,
    whatsapp: phoneDigits(row.whatsapp),
    fixed: phoneDigits(row.telefono_fijo),
    category: row.categoria,
    type: row.tipo,
    short: row["descripcion_corta"],
    long: row["descripcion_larga"],
    catalog: row.catalogo,
    keywords: row.busqueda,
    logo: imageUrl(row.logo),
    banner: imageUrl(row.banner),
    instagram: safeSocialUrl(row.instagram),
    facebook: safeSocialUrl(row.facebook),
    tiktok: safeSocialUrl(row.tiktok),
    promos: [],
  };
}

function decoratePromo(row) {
  const rawType = String(row.tipo || "").trim();
  const mode = String(row.modalidad || "").trim();
  let kind = rawType;
  if (rawType === "Regalo") {
    if (mode === "Canje") kind = "Canje";
    else if (mode === "Sorteo") kind = "Sorteo";
    else if (mode === "Concurso") kind = "Concurso";
  }

  return {
    id: String(row.id),
    profileId: toNumber(row.negocio_id),
    title: row.titulo,
    description: row.descripcion,
    conditions: row.condiciones,
    until: row["vigencia_hasta"],
    regular: toNumber(row.precio_regular) ?? 0,
    discounted: toNumber(row.precio_rebajado) ?? 0,
    category: row.categoria,
    type: rawType,
    kind,
    mode,
    image: imageUrl(row.banner),
    profile: null,
  };
}

export function getSaving(promo) {
  if (promo.type !== "Descuento" || !(promo.discounted > 0)) return 0;
  return promo.regular > promo.discounted ? promo.regular - promo.discounted : 0;
}

export async function loadProfiles() {
  const response = await fetch(FILES.profiles, { cache: "no-cache" });
  if (!response.ok) throw new Error(`negocios.csv (${response.status})`);
  return parseCsv(await response.text()).map(decorateProfile);
}

export async function loadPromos() {
  const response = await fetch(FILES.promos, { cache: "no-cache" });
  if (!response.ok) throw new Error(`promociones.csv (${response.status})`);
  return parseCsv(await response.text()).map(decoratePromo);
}

export function linkPromos(profiles, promos) {
  profiles.forEach((profile) => { profile.promos = []; });
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  promos.forEach((promo) => {
    promo.profile = profilesById.get(promo.profileId) || null;
    if (promo.profile) promo.profile.promos.push(promo);
  });
  return { profiles, promos, profilesById };
}

export async function loadDirectory() {
  const [profiles, promos] = await Promise.all([loadProfiles(), loadPromos()]);
  return linkPromos(profiles, promos);
}
