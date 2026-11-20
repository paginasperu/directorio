import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const setup = source.slice(source.indexOf("function setupHeaderScroll()"), source.indexOf("/* ---------- detalle ---------- */"));

function page({ y = 0, banner = 0 } = {}) {
  const events = {};
  const win = { scrollY: y, innerHeight: 700, matchMedia: () => ({ matches: true }),
    addEventListener: (name, callback) => { events[name] = callback; } };
  const header = { offsetHeight: 148, style: {},
    get offsetTop() { return Math.max(banner, win.scrollY); },
    getBoundingClientRect: () => ({ top: 0 }),
    querySelector: () => ({ getBoundingClientRect: () => ({ top: 60 }) }) };
  const document = { documentElement: { scrollHeight: 2000 },
    getElementById: (id) => id === "headerOrigin" ? {
      getBoundingClientRect: () => ({ top: banner - win.scrollY })
    } : null };
  vm.runInNewContext(`${setup}; setupHeaderScroll();`, {
    ui: { header }, window: win, document, getComputedStyle: () => ({ display: "block" }),
    ResizeObserver: class { observe() {} }
  });
  return { header, scroll(value) { win.scrollY = value; events.scroll(); },
    resize() { events.resize(); }, banner(value) { banner = value; events.resize(); } };
}

test("la barra del navegador no devuelve el logo al final del listado", () => {
  const p = page();
  p.scroll(1200);
  assert.match(p.header.style.transform, /-148px/);
  p.resize();
  assert.match(p.header.style.transform, /-148px/);
  p.scroll(1100);
  assert.match(p.header.style.transform, /-48px/);
  p.resize();
  assert.match(p.header.style.transform, /-48px/);
  p.scroll(0);
  assert.equal(p.header.style.transform, "");
});

test("inicio real estable con aviso y restauración a mitad de página", () => {
  const p = page({ y: 900, banner: 60 });
  p.resize();
  assert.match(p.header.style.transform, /-148px/);
  p.scroll(800);
  assert.match(p.header.style.transform, /-48px/);
  p.banner(0);
  assert.match(p.header.style.transform, /-48px/);
  p.scroll(20);
  assert.match(p.header.style.transform, /-20px/);
  p.scroll(-30);
  assert.equal(p.header.style.transform, "");
});

test("el rebote inferior no se interpreta como una subida", () => {
  const p = page();
  p.scroll(1300);
  p.scroll(1400);
  p.scroll(1300);
  assert.match(p.header.style.transform, /-148px/);
});
