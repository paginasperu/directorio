// Verifica que los enlaces y las imágenes referenciadas existan.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", ".git", "build"].includes(entry.name)) return [];
    const full = join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function parseCsv(text) {
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
  return rows;
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

for (const csvPath of ["data/perfiles.csv", "data/promociones.csv"]) {
  const rows = parseCsv(readFileSync(join(root, csvPath), "utf8"));
  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  const index = headers.indexOf(csvPath.includes("perfiles") ? "banner" : "imagen");
  if (index === -1) {
    problems.push(`${csvPath}: no encuentro la columna de imagen`);
    continue;
  }
  for (const row of rows.slice(1)) {
    const path = (row[index] || "").trim();
    if (path && !existsSync(join(root, path))) problems.push(`${csvPath}: falta ${path}`);
  }
}

const images = walk(join(root, "assets", "img", "businesses")).length;

if (problems.length) {
  console.error("Problemas encontrados:");
  problems.forEach((problem) => console.error(" -", problem));
  process.exit(1);
}

console.log(`OK: ${htmlFiles.length} páginas, ${images} imágenes, 0 referencias rotas.`);
