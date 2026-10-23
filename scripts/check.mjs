import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const failures = [];
const checks = [];

const html = read("index.html");
const app = read("assets/js/app.js");
const csv = read("data/negocios.csv");

// 1. Every local file referenced by the page must exist.
const localReferences = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((url) => !/^(https?:|#|mailto:|tel:|\/\/)/.test(url))
  .map((url) => url.split("?")[0]);

for (const reference of new Set(localReferences)) {
  if (!existsSync(resolve(root, reference))) {
    failures.push(`Missing local file: ${reference}`);
  }
}
checks.push(`${new Set(localReferences).size} local file references`);

// 2. Every id used by the JavaScript must exist in the HTML.
const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const scriptIds = new Set([...app.matchAll(/\$\("#([^"]+)"\)/g)].map((match) => match[1]));

for (const id of scriptIds) {
  if (!htmlIds.has(id)) failures.push(`JavaScript references a missing id: #${id}`);
}
checks.push(`${scriptIds.size} JavaScript ids`);

// 3. The data file path must match the file that exists.
if (!app.includes("./data/negocios.csv")) {
  failures.push("app.js does not load ./data/negocios.csv");
}
checks.push("data file path");

// 4. The columns map in app.js must match the CSV header.
const columnsBlock = app.match(/const columns = \{([\s\S]*?)\};/);
if (!columnsBlock) {
  failures.push("The columns object was not found in app.js");
} else {
  const mappedColumns = [...columnsBlock[1].matchAll(/\w+:\s*"([^"]+)"/g)].map((match) => match[1]);
  const header = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)[0]
    .split(",")
    .map((cell) => cell.replace(/^"|"$/g, "").trim());

  const missing = mappedColumns.filter((column) => !header.includes(column));
  const extra = header.filter((column) => !mappedColumns.includes(column));

  if (missing.length) failures.push(`CSV is missing columns: ${missing.join(", ")}`);
  if (extra.length) failures.push(`CSV has unmapped columns: ${extra.join(", ")}`);
  checks.push(`${header.length} CSV columns`);
}

// 5. The CSV must contain data rows.
const dataLines = csv.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
if (dataLines.length < 2) {
  failures.push("The CSV has no data rows");
} else {
  checks.push(`${dataLines.length - 1} business rows`);
}

for (const check of checks) console.log(`  ok  ${check}`);

if (failures.length) {
  console.error("\nFAILED:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nAll checks passed.");
