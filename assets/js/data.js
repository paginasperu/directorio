// Capa de datos: carga, parseo y normalización.

import { normalize, parseCsv } from "./csv.js";

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
export const imageUrl = (path) => (path ? new URL(path, ROOT).href : "");

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
    instagram: row.instagram,
    facebook: row.facebook,
    tiktok: row.tiktok,
    promos: [],
  };
}

function decoratePromo(row) {
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
    type: row.tipo,
    mode: row.modalidad,
    image: imageUrl(row.banner),
    profile: null,
  };
}

export function getSaving(promo) {
  if (promo.type !== "Descuento" || !(promo.discounted > 0)) return 0;
  return promo.regular > promo.discounted ? promo.regular - promo.discounted : 0;
}

export async function loadDirectory() {
  const [profilesResponse, promosResponse] = await Promise.all([
    fetch(FILES.profiles, { cache: "no-cache" }),
    fetch(FILES.promos, { cache: "no-cache" }),
  ]);
  if (!profilesResponse.ok) throw new Error(`negocios.csv (${profilesResponse.status})`);
  if (!promosResponse.ok) throw new Error(`promociones.csv (${promosResponse.status})`);

  const profiles = parseCsv(await profilesResponse.text()).map(decorateProfile);
  const promos = parseCsv(await promosResponse.text()).map(decoratePromo);

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  promos.forEach((promo) => {
    promo.profile = profilesById.get(promo.profileId) || null;
    if (promo.profile) promo.profile.promos.push(promo);
  });

  return { profiles, promos, profilesById };
}
