(() => {
  "use strict";

  const FILES = { profiles: "../data/perfiles.csv", promos: "../data/promociones.csv" };
  const state = { profiles: [], promos: [], category: "Todos", floor: "Todos", onlyPromo: false, search: "" };

  const $ = (selector) => document.querySelector(selector);
  const ui = {
    grid: $("#providerGrid"),
    categoryList: $("#categoryList"),
    count: $("#resultsCount"),
    empty: $("#emptyState"),
    search: $("#businessSearch"),
    mobileSearch: $("#mobileBusinessSearch"),
    floor: $("#floorFilter"),
    promo: $("#promoFilter"),
    sort: $("#sortSelect"),
    filterToggle: $("#filterToggle"),
    drawer: $("#moreFilters"),
    drawerBackdrop: $("#filterDrawerBackdrop"),
    reset: $("#resetFilters"),
    resetEmpty: $("#resetFiltersEmpty"),
    modal: $("#modalDetail"),
  };

  const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("es-PE");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const listValues = (value) => String(value ?? "").split(/[,|;]+/).map((part) => part.trim()).filter(Boolean);
  const money = (value) => {
    const number = Number(String(value ?? "").replace(",", "."));
    return Number.isFinite(number) && number > 0 ? `S/ ${number.toFixed(number % 1 === 0 ? 0 : 2)}` : "";
  };
  const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const formatDate = (value) => {
    const [year, month, day] = String(value ?? "").split("-").map(Number);
    return year && month && day ? `${day} ${MONTHS[month - 1]} ${year}` : String(value ?? "");
  };
  const imageUrl = (path) => (path ? `../${path}` : "");
  const phoneDigits = (value) => String(value ?? "").replace(/\D/g, "");

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
    if (rows.length < 2) return [];
    const headers = rows.shift().map((header) => normalize(header).replace(/\uFEFF/g, ""));
    return rows.map((values) => {
      const item = {};
      headers.forEach((header, index) => { item[header] = String(values[index] ?? "").trim(); });
      return item;
    });
  }

  function decorate(profile) {
    const whatsapp = phoneDigits(profile.whatsapp);
    const fixed = phoneDigits(profile["telefono_fijo"]);
    return {
      id: Number(profile.id),
      name: profile.nombre,
      floor: profile.piso,
      unit: profile.tienda,
      whatsapp,
      fixed,
      category: profile.categoria,
      type: profile.tipo,
      short: profile["descripcion_corta"],
      long: profile["descripcion_larga"],
      catalog: profile.catalogo,
      search: profile.busqueda,
      logo: imageUrl(profile.logo),
      banner: imageUrl(profile.banner),
      instagram: profile.instagram,
      facebook: profile.facebook,
      tiktok: profile.tiktok,
      promos: [],
    };
  }

  function searchable(profile) {
    return normalize([profile.name, profile.category, profile.type, profile.short, profile.catalog, profile.search, profile.floor, profile.unit].join(" "));
  }

  function matches(profile) {
    if (state.category !== "Todos" && profile.category !== state.category) return false;
    if (state.floor !== "Todos" && profile.floor !== state.floor) return false;
    if (state.onlyPromo && profile.promos.length === 0) return false;
    return !state.search || searchable(profile).includes(state.search);
  }

  function sorted(items) {
    const order = ui.sort.value;
    const result = [...items];
    if (order === "promo") result.sort((a, b) => b.promos.length - a.promos.length || a.name.localeCompare(b.name, "es-PE"));
    else if (order === "name") result.sort((a, b) => a.name.localeCompare(b.name, "es-PE"));
    return result;
  }

  function renderCategories() {
    const categories = ["Todos", ...new Set(state.profiles.map((item) => item.category).filter(Boolean))];
    ui.categoryList.innerHTML = categories.map((category) =>
      `<button type="button" class="category-option${category === state.category ? " is-active" : ""}" data-category="${escapeHtml(category)}" aria-pressed="${String(category === state.category)}">${escapeHtml(category)}</button>`
    ).join("");
  }

  function renderFloors() {
    const floors = [...new Set(state.profiles.map((item) => item.floor).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es-PE", { numeric: true }));
    ui.floor.innerHTML = '<option value="Todos">Todos los pisos</option>' + floors.map((floor) =>
      `<option value="${escapeHtml(floor)}">Piso ${escapeHtml(floor)}</option>`
    ).join("");
  }

  function promoBadge(profile) {
    if (!profile.promos.length) return "";
    const first = profile.promos.find((promo) => promo.tipo === "Descuento") || profile.promos[0];
    const regular = Number(first.precio_regular);
    const discounted = Number(first.precio_rebajado);
    let label = first.modalidad || first.tipo || "Promo";
    if (first.tipo === "Descuento" && regular > 0 && discounted > 0 && discounted < regular) {
      label = `−${Math.round((1 - discounted / regular) * 100)}%`;
    }
    return `<span class="d1-promo">${escapeHtml(label)}</span>`;
  }

  function card(profile) {
    const location = [profile.floor ? `Piso ${profile.floor}` : "", profile.unit ? `Local ${profile.unit}` : ""].filter(Boolean).join(" · ");
    const whatsapp = profile.whatsapp ? `https://wa.me/${profile.whatsapp}` : "";
    return `<article class="d1-card">
      <button type="button" class="d1-hit" data-detail="${profile.id}" aria-label="Ver ficha de ${escapeHtml(profile.name)}">
        <span class="d1-cover">
          <img class="d1-banner" src="${escapeHtml(profile.banner)}" alt="${escapeHtml(profile.name)}" width="600" height="300" loading="lazy" decoding="async">
          <span class="d1-cat">${escapeHtml(profile.category)}</span>
          ${promoBadge(profile)}
          <img class="d1-logo" src="${escapeHtml(profile.logo)}" alt="" width="56" height="56" loading="lazy" decoding="async">
        </span>
        <span class="d1-body">
          <span class="d1-name">${escapeHtml(profile.name)}</span>
          <span class="d1-desc">${escapeHtml(profile.short)}</span>
        </span>
      </button>
      <div class="d1-footer">
        <span class="d1-loc">${escapeHtml(location || "Ubicación no informada")}</span>
        ${whatsapp
          ? `<a class="provider-whatsapp" href="${whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de ${escapeHtml(profile.name)}">WhatsApp</a>`
          : '<span class="provider-whatsapp provider-whatsapp-unavailable">Sin WhatsApp</span>'}
      </div>
    </article>`;
  }

  function render() {
    renderCategories();
    const results = sorted(state.profiles.filter(matches));
    ui.grid.innerHTML = results.map(card).join("");
    ui.count.textContent = `${results.length} ${results.length === 1 ? "negocio" : "negocios"}`;
    ui.empty.classList.toggle("hidden", results.length > 0);
  }

  function setSearch(value) {
    state.search = normalize(value);
    ui.search.value = value;
    ui.mobileSearch.value = value;
    render();
  }

  function toggleDrawer(open) {
    ui.filterToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      document.body.classList.add("overflow-hidden");
      ui.drawerBackdrop.classList.remove("hidden");
      void ui.drawerBackdrop.offsetWidth;
      ui.drawerBackdrop.classList.remove("opacity-0");
      ui.drawerBackdrop.classList.add("opacity-100");
      ui.drawer.classList.remove("-translate-x-full");
    } else {
      ui.drawer.classList.add("-translate-x-full");
      ui.drawerBackdrop.classList.remove("opacity-100");
      ui.drawerBackdrop.classList.add("opacity-0");
      document.body.classList.remove("overflow-hidden");
      setTimeout(() => ui.drawerBackdrop.classList.add("hidden"), 220);
    }
  }

  function resetFilters() {
    state.category = "Todos";
    state.floor = "Todos";
    state.onlyPromo = false;
    state.search = "";
    ui.search.value = "";
    ui.mobileSearch.value = "";
    ui.floor.value = "Todos";
    ui.promo.checked = false;
    ui.sort.value = "original";
    render();
    toggleDrawer(false);
  }

  function promoBlock(promo) {
    const isGift = promo.tipo !== "Descuento";
    const regular = Number(promo["precio_regular"]);
    const discounted = Number(promo["precio_rebajado"]);
    const hasPrice = !isGift && discounted > 0;
    const saving = hasPrice && regular > discounted ? regular - discounted : 0;

    return `<li class="d1-promo-card">
      <div class="d1-promo-main">
        <div class="d1-promo-info">
          <div class="d1-tags">
            <span class="d1-tag">${escapeHtml(promo.tipo)}</span>
            ${promo.modalidad ? `<span class="d1-tag is-soft">${escapeHtml(promo.modalidad)}</span>` : ""}
          </div>
          <p class="d1-promo-title">${escapeHtml(promo.titulo)}</p>
          <p class="d1-promo-text">${escapeHtml(promo.descripcion)}</p>
        </div>
        ${hasPrice ? `<div class="d1-promo-price">
          <strong>${money(discounted)}</strong>
          ${regular > discounted ? `<s>${money(regular)}</s>` : ""}
          ${saving ? `<span class="d1-save">Ahorras ${money(saving)}</span>` : ""}
        </div>` : ""}
      </div>
      <div class="d1-promo-foot">
        <span>${promo["vigencia_hasta"] ? `Hasta ${escapeHtml(formatDate(promo["vigencia_hasta"]))}` : ""}</span>
        ${promo.condiciones ? `<details class="d1-more"><summary>Ver condiciones</summary><p>${escapeHtml(promo.condiciones)}</p></details>` : ""}
      </div>
    </li>`;
  }

  function showDetail(profile) {
    const socials = [
      { label: "Instagram", url: profile.instagram },
      { label: "Facebook", url: profile.facebook },
      { label: "TikTok", url: profile.tiktok },
    ].filter((social) => social.url);
    const catalog = listValues(profile.catalog);
    const location = [profile.floor ? `Piso ${profile.floor}` : "", profile.unit ? `Local ${profile.unit}` : ""].filter(Boolean).join(" · ");

    $("#modalBody").innerHTML = `
      <div class="d1-modal-cover">
        <img src="${escapeHtml(profile.banner)}" alt="" width="600" height="300">
        <img class="d1-modal-logo" src="${escapeHtml(profile.logo)}" alt="" width="72" height="72">
      </div>
      <div class="d1-modal-body p-5 sm:p-7 space-y-5">
        <div>
          <p class="text-xs font-medium text-slate-500">${escapeHtml(profile.category)} · ${escapeHtml(profile.type)}</p>
          <h2 id="modalTitle" class="text-2xl font-extrabold text-slate-900 leading-tight mt-1">${escapeHtml(profile.name)}</h2>
          <p class="text-slate-600 text-sm leading-relaxed mt-2">${escapeHtml(profile.long || profile.short)}</p>
        </div>
        <dl class="detail-info">
          ${location ? `<div><dt>Ubicación</dt><dd>${escapeHtml(location)}</dd></div>` : ""}
          ${profile.fixed ? `<div><dt>Teléfono</dt><dd>${escapeHtml(profile.fixed)}</dd></div>` : ""}
          ${profile.whatsapp ? `<div><dt>WhatsApp</dt><dd>${escapeHtml(profile.whatsapp)}</dd></div>` : ""}
        </dl>
        ${profile.promos.length ? `<section><div class="d1-promos-head"><h3 class="d1-section-title">Promociones</h3><span class="d1-count">${profile.promos.length}</span></div><ul class="d1-promos">${profile.promos.map(promoBlock).join("")}</ul></section>` : ""}
        ${catalog.length ? `<section><h3 class="d1-section-title">Productos y servicios</h3><ul class="d1-chips">${catalog.map((value) => `<li class="d1-chip is-filled">${escapeHtml(value)}</li>`).join("")}</ul></section>` : ""}
        ${socials.length ? `<section><h3 class="d1-section-title">Redes sociales</h3><div class="d1-chips">${socials.map((social) => `<a class="d1-chip is-social" href="${escapeHtml(social.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(social.label)}</a>`).join("")}</div></section>` : ""}
      </div>`;

    const call = $("#modalCallBtn");
    const wa = $("#modalWhatsappBtn");
    call.href = profile.fixed ? `tel:${profile.fixed}` : "#";
    call.classList.toggle("hidden", !profile.fixed);
    wa.href = profile.whatsapp ? `https://wa.me/${profile.whatsapp}` : "#";
    wa.classList.toggle("hidden", !profile.whatsapp);

    ui.modal.classList.remove("hidden");
    ui.modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");
  }

  function closeDetail() {
    ui.modal.classList.add("hidden");
    ui.modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  }

  function bindEvents() {
    ui.search.addEventListener("input", () => setSearch(ui.search.value));
    ui.mobileSearch.addEventListener("input", () => setSearch(ui.mobileSearch.value));
    ui.categoryList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      render();
    });
    ui.floor.addEventListener("change", () => { state.floor = ui.floor.value; render(); });
    ui.promo.addEventListener("change", () => { state.onlyPromo = ui.promo.checked; render(); });
    ui.sort.addEventListener("change", render);
    ui.reset.addEventListener("click", resetFilters);
    ui.resetEmpty.addEventListener("click", resetFilters);
    ui.filterToggle.addEventListener("click", () => toggleDrawer(true));
    $("#applyFilterDrawer").addEventListener("click", () => { render(); toggleDrawer(false); });
    $("#closeFilterDrawer").addEventListener("click", () => toggleDrawer(false));
    ui.drawerBackdrop.addEventListener("click", () => toggleDrawer(false));
    ui.grid.addEventListener("click", (event) => {
      if (event.target.closest(".provider-whatsapp")) return;
      const trigger = event.target.closest("[data-detail]");
      if (!trigger) return;
      const profile = state.profiles.find((item) => item.id === Number(trigger.dataset.detail));
      if (profile) showDetail(profile);
    });
    $("#closeDetail").addEventListener("click", closeDetail);
    ui.modal.addEventListener("click", (event) => { if (event.target === ui.modal) closeDetail(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !ui.modal.classList.contains("hidden")) closeDetail(); });
  }

  async function init() {
    try {
      const [profilesResponse, promosResponse] = await Promise.all([
        fetch(FILES.profiles, { cache: "no-cache" }),
        fetch(FILES.promos, { cache: "no-cache" }),
      ]);
      if (!profilesResponse.ok) throw new Error(`perfiles.csv (${profilesResponse.status})`);
      if (!promosResponse.ok) throw new Error(`promociones.csv (${promosResponse.status})`);

      const profiles = parseCsv(await profilesResponse.text()).map(decorate);
      const promos = parseCsv(await promosResponse.text());
      const byProfile = new Map();
      promos.forEach((promo) => {
        const key = Number(promo["perfil_id"]);
        if (!byProfile.has(key)) byProfile.set(key, []);
        byProfile.get(key).push(promo);
      });
      profiles.forEach((profile) => { profile.promos = byProfile.get(profile.id) || []; });

      state.profiles = profiles;
      state.promos = promos;
      renderFloors();
      bindEvents();
      render();

      const openId = Number(new URLSearchParams(location.search).get("open"));
      if (openId) {
        const profile = state.profiles.find((item) => item.id === openId);
        if (profile) showDetail(profile);
      }
    } catch (error) {
      console.error(error);
      ui.count.textContent = "No se pudieron cargar los datos";
      ui.empty.classList.remove("hidden");
    }
  }

  init();
})();
