import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv, parseRows } from "../assets/js/csv.js";

test("parseRows conserva comas dentro de campos entrecomillados", () => {
  assert.deepEqual(parseRows('nombre,descripcion\nTienda,"ropa, calzado y accesorios"'), [
    ["nombre", "descripcion"],
    ["Tienda", "ropa, calzado y accesorios"],
  ]);
});

test("parseRows interpreta comillas escapadas", () => {
  assert.deepEqual(parseRows('nombre,descripcion\nTienda,"Dijo ""hola"""'), [
    ["nombre", "descripcion"],
    ["Tienda", 'Dijo "hola"'],
  ]);
});

test("parseRows conserva saltos de línea dentro de campos entrecomillados", () => {
  assert.deepEqual(parseRows('nombre,descripcion\r\nTienda,"primera línea\r\nsegunda línea"\r\nOtra,ok'), [
    ["nombre", "descripcion"],
    ["Tienda", "primera línea\r\nsegunda línea"],
    ["Otra", "ok"],
  ]);
});

test("parseCsv elimina el BOM del primer encabezado", () => {
  assert.deepEqual(parseCsv("\uFEFFid,nombre\r\n1,Tienda"), [
    { id: "1", nombre: "Tienda" },
  ]);
});

test("parseRows admite saltos LF y CRLF y omite filas vacías", () => {
  assert.deepEqual(parseRows("a,b\n\n1,2\r\n3,4\n"), [
    ["a", "b"],
    ["1", "2"],
    ["3", "4"],
  ]);
});
