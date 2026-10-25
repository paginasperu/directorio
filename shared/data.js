// Capa de datos: carga, parseo y normalización.

const FILES = { profiles: "../data/negocios.csv", promos: "../data/promociones.csv" };
const ROOT = "../";

export const normalize = (value) =>
  String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("es-PE");

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
export const imageUrl = (path) => (path ? `${ROOT}${path}` : "");

export function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const character = text[i], next = text[i + 1];
    if (character === '"' && quoted && next === '"') { cell += '"'; i++; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") i++;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = []; cell = "";
    } else cell += character;
  }
  if (cell.length || row.length) { row.push(cell); if (row.some((value) => value.trim())) rows.push(row); }
  if (rows.length < 2) return [];

  const headers = rows.shift().map((header) => normalize(header).replace(/\uFEFF/g, ""));
  return rows.map((values) => {
    const item = {};
    headers.forEach((header, index) => { item[header] = String(values[index] ?? "").trim(); });
    return item;
  });
}

function decorateProfile(row) {
  return {
    id: Number(row.id),
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
    profileId: Number(row.negocio_id || row.perfil_id),
    title: row.titulo,
    description: row.descripcion,
    conditions: row.condiciones,
    until: row["vigencia_hasta"],
    regular: Number(row.precio_regular),
    discounted: Number(row.precio_rebajado),
    category: row.categoria,
    type: row.tipo,
    mode: row.modalidad,
    image: imageUrl(row.imagen),
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
