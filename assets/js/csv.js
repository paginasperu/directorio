// Utilidades de texto y CSV compartidas por el sitio y las herramientas.

export const normalize = (value) =>
  String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("es-PE");

export function parseRows(text) {
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

export function parseCsv(text) {
  const rows = parseRows(text);
  if (rows.length < 2) return [];

  const headers = rows.shift().map((header) => normalize(header).replace(/\uFEFF/g, ""));
  return rows.map((values) => {
    const item = {};
    headers.forEach((header, index) => { item[header] = String(values[index] ?? "").trim(); });
    return item;
  });
}
