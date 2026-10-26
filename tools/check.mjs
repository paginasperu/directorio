// Verifica que los enlaces y las imágenes referenciadas existan.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseRows } from "../assets/js/csv.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", ".git", "tools"].includes(entry.name)) return [];
    const full = join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function readCsv(path) {
  const rows = parseRows(readFileSync(join(root, path), "utf8"));
  if (rows.length < 2) return [];
  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, String(values[index] ?? "").trim()])));
}

const htmlFiles = walk(root).filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const base = dirname(file);
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((url) => !/^(https?:|#|mailto:|tel:|\/\/|data:)/.test(url))
    .map((url) => url.split("?")[0].split("#")[0])
    .filter(Boolean);

  for (const reference of new Set(references)) {
    if (!existsSync(resolve(base, reference))) problems.push(`${file.replace(root + "\\", "")} -> ${reference}`);
  }
}

const negocios = readCsv("data/negocios.csv");
const promos = readCsv("data/promociones.csv");

const negociosIds = new Set(negocios.map((row) => row.id));
for (const promo of promos) {
  if (!negociosIds.has(promo.negocio_id)) {
    problems.push(`promociones.csv: id ${promo.id} apunta a negocio_id ${promo.negocio_id} inexistente`);
  }
}

for (const [file, rows, columns] of [
  ["data/negocios.csv", negocios, ["logo", "banner"]],
  ["data/promociones.csv", promos, ["imagen"]],
]) {
  for (const column of columns) {
    if (!rows.length || !(column in rows[0])) {
      problems.push(`${file}: no encuentro la columna ${column}`);
      continue;
    }
    for (const row of rows) {
      const path = row[column];
      if (path && !existsSync(join(root, path))) problems.push(`${file}: falta ${path}`);
    }
  }
}

const images = walk(join(root, "assets", "img", "businesses")).length;

if (problems.length) {
  console.error("Problemas encontrados:");
  problems.forEach((problem) => console.error(" -", problem));
  process.exit(1);
}

console.log(`OK: ${htmlFiles.length} páginas, ${negocios.length} negocios, ${promos.length} promociones, ${images} imágenes, 0 referencias rotas.`);
