(() => {
  "use strict";

  const FILES = { profiles: "../data/perfiles.csv", promos: "../data/promociones.csv" };
  const state = { profiles: [], promos: [], promosById: new Map(), category: "Todos", floor: "Todos", onlyPromo: false, search: "", view: "negocios" };

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

  function matches(profile, ignoreCategory = false) {
    if (!ignoreCategory && state.category !== "Todos" && profile.category !== state.category) return false;
    if (state.floor !== "Todos" && profile.floor !== state.floor) return false;
    if (state.onlyPromo && profile.promos.length === 0) return false;
    return !state.search || searchable(profile).includes(state.search);
  }

  function matchesPromo(promo, ignoreCategory = false) {
    const profile = state.promosById.get(Number(promo.perfil_id)) || {};
    if (!ignoreCategory && state.category !== "Todos" && promo.categoria !== state.category) return false;
    if (state.floor !== "Todos" && profile.floor !== state.floor) return false;
    return !state.search || normalize([promo.titulo, promo.descripcion, promo.tipo, promo.modalidad, profile.name, promo.categoria].join(" ")).includes(state.search);
  }

  function sorted(items) {
    const order = ui.sort.value;
    const result = [...items];
    if (order === "promo") result.sort((a, b) => b.promos.length - a.promos.length || a.name.localeCompare(b.name, "es-PE"));
    else if (order === "piso") result.sort((a, b) => Number(a.floor) - Number(b.floor) || a.name.localeCompare(b.name, "es-PE"));
    else if (order === "name") result.sort((a, b) => a.name.localeCompare(b.name, "es-PE"));
    return result;
  }

  function renderCategories(counts) {
    const categories = ["Todos", ...new Set(state.profiles.map((item) => item.category).filter(Boolean))];
    ui.categoryList.innerHTML = categories.map((category) => {
      const total = category === "Todos" ? counts.total : (counts.byCategory.get(category) || 0);
      return `<button type="button" class="category-option${category === state.category ? " is-active" : ""}" data-category="${escapeHtml(category)}" aria-pressed="${String(category === state.category)}">${escapeHtml(category)}<span class="d1-cat-count">${total}</span></button>`;
    }).join("");
  }

  function renderFloors() {
    const floors = [...new Set(state.profiles.map((item) => item.floor).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es-PE", { numeric: true }));
    ui.floor.innerHTML = '<option value="Todos">Todos los pisos</option>' + floors.map((floor) =>
      `<option value="${escapeHtml(floor)}">Piso ${escapeHtml(floor)}</option>`
    ).join("");
  }


  function card(profile) {
    const location = [profile.floor ? `Piso ${profile.floor}` : "", profile.unit ? `Local ${profile.unit}` : ""].filter(Boolean).join(" · ");
    const whatsapp = profile.whatsapp ? `https://wa.me/${profile.whatsapp}` : "";
    return `<article class="d1-card">
      <button type="button" class="d1-hit" data-detail="${profile.id}" aria-label="Ver ficha de ${escapeHtml(profile.name)}">
        <span class="d1-cover">
          <img class="d1-banner" src="${escapeHtml(profile.banner)}" alt="${escapeHtml(profile.name)}" width="600" height="300" loading="lazy" decoding="async">
          <span class="d1-cat">${escapeHtml(profile.category)}</span>
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

  function promoCard(promo) {
    const profile = state.promosById.get(Number(promo.perfil_id)) || {};
    const regular = Number(promo.precio_regular);
    const discounted = Number(promo.precio_rebajado);
    const hasPrice = promo.tipo === "Descuento" && discounted > 0;
    const saving = hasPrice && regular > discounted ? regular - discounted : 0;
    return `<article class="d1-pcard">
      <button type="button" class="d1-hit" data-promo="${promo.id}" aria-label="Ver promoción ${escapeHtml(promo.titulo)}">
        <span class="d1-cover">
          <img class="d1-banner" src="${escapeHtml(imageUrl(promo.imagen))}" alt="" width="600" height="300" loading="lazy" decoding="async">
          <span class="d1-cat">${escapeHtml(promo.categoria)}</span>
          <span class="d1-promo">${escapeHtml(hasPrice && regular > discounted ? "−" + Math.round((1 - discounted / regular) * 100) + "%" : (promo.modalidad || promo.tipo))}</span>
        </span>
        <span class="d1-body">
          <span class="d1-name">${escapeHtml(promo.titulo)}</span>
          <span class="d1-desc">Ofrecido por ${escapeHtml(profile.name || "")}</span>
        </span>
      </button>
      <div class="d1-footer">
        ${hasPrice ? `<span class="d1-pcard-price">${money(discounted)}${regular > discounted ? ` <s>${money(regular)}</s>` : ""}</span>` : '<span class="d1-loc">Sin precio</span>'}
        ${saving ? `<span class="d1-save">Ahorras ${money(saving)}</span>` : ""}
      </div>
    </article>`;
  }

  function render() {
    if (state.view === "promos") {
      const basePromos = state.promos.filter((promo) => matchesPromo(promo, true));
      const promoCounts = { total: basePromos.length, byCategory: new Map() };
      basePromos.forEach((promo) => promoCounts.byCategory.set(promo.categoria, (promoCounts.byCategory.get(promo.categoria) || 0) + 1));
      renderCategories(promoCounts);
      const promos = state.promos.filter((promo) => matchesPromo(promo));
      ui.grid.innerHTML = promos.map(promoCard).join("");
      ui.count.textContent = `${promos.length} ${promos.length === 1 ? "promoción" : "promociones"}`;
      ui.empty.querySelector("p").textContent = "Prueba con otra palabra o categor\u00eda.";
    ui.empty.classList.toggle("hidden", promos.length > 0);
      return;
    }

    const base = state.profiles.filter((profile) => matches(profile, true));
    const counts = { total: base.length, byCategory: new Map() };
    base.forEach((profile) => counts.byCategory.set(profile.category, (counts.byCategory.get(profile.category) || 0) + 1));
    renderCategories(counts);

    const results = sorted(state.profiles.filter((profile) => matches(profile)));
    ui.grid.innerHTML = results.map(card).join("");
    ui.count.textContent = `${results.length} ${results.length === 1 ? "negocio" : "negocios"}`;
    ui.empty.querySelector("p").textContent = "Prueba con otra palabra, categor\u00eda o piso.";
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

  function showPromoDetail(promo) {
    const profile = state.promosById.get(Number(promo.perfil_id)) || {};
    const regular = Number(promo.precio_regular);
    const discounted = Number(promo.precio_rebajado);
    const hasPrice = promo.tipo === "Descuento" && discounted > 0;
    const saving = hasPrice && regular > discounted ? regular - discounted : 0;

    $("#modalBody").innerHTML = `
      <div class="d1-modal-cover">
        <img src="${escapeHtml(imageUrl(promo.imagen))}" alt="" width="600" height="300">
        <span class="d1-cat">${escapeHtml(promo.categoria)}</span>
      </div>
      <div class="d1-modal-body p-5 sm:p-7 space-y-5">
        <div>
          <div class="d1-tags">
            <span class="d1-tag">${escapeHtml(promo.tipo)}</span>
            ${promo.modalidad ? `<span class="d1-tag is-soft">${escapeHtml(promo.modalidad)}</span>` : ""}
          </div>
          <h2 id="modalTitle" class="d1-promo-hero">${escapeHtml(promo.titulo)}</h2>
          <p class="d1-promo-hero-text">${escapeHtml(promo.descripcion)}</p>
        </div>
        ${hasPrice ? `<div class="d1-price-block">
          <div><strong>${money(discounted)}</strong><s>${money(regular)}</s></div>
          ${saving ? `<span class="d1-save">Ahorras ${money(saving)}</span>` : ""}
        </div>` : ""}
        <dl class="detail-info">
          ${promo["vigencia_hasta"] ? `<div><dt>Vigente hasta</dt><dd>${escapeHtml(formatDate(promo["vigencia_hasta"]))}</dd></div>` : ""}
          <div><dt>Categoría</dt><dd>${escapeHtml(promo.categoria)}</dd></div>
        </dl>
        ${promo.condiciones ? `<section><h3 class="d1-section-title">Condiciones</h3><p class="d1-cond-text">${escapeHtml(promo.condiciones)}</p></section>` : ""}
        <section class="d1-offered">
          <h3 class="d1-section-title">Ofrecido por</h3>
          <button type="button" class="d1-offered-card" data-business="${profile.id}">
            <img src="${escapeHtml(profile.logo || "")}" alt="" width="44" height="44">
            <span class="d1-offered-info">
              <span class="d1-offered-name">${escapeHtml(profile.name || "")}</span>
              <span class="d1-offered-meta">${escapeHtml(profile.type || "")}${profile.floor ? ` · Piso ${escapeHtml(profile.floor)}` : ""}</span>
            </span>
            <span class="d1-offered-link">Ver ficha</span>
          </button>
        </section>
      </div>`;

    $("#modalCallBtn").classList.add("hidden");
    const wa = $("#modalWhatsappBtn");
    wa.href = profile.whatsapp ? `https://wa.me/${profile.whatsapp}` : "#";
    wa.classList.toggle("hidden", !profile.whatsapp);
    wa.textContent = profile.whatsapp ? "WhatsApp del negocio" : "WhatsApp";

    ui.modal.classList.remove("hidden");
    ui.modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");
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
    wa.textContent = "Contactar por WhatsApp";

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
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        state.view = button.dataset.view;
        document.querySelectorAll("[data-view]").forEach((other) => {
          const active = other === button;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-pressed", String(active));
        });
        ui.sort.closest(".results-actions")?.classList.toggle("hidden", state.view === "promos");
        ui.promo.closest("label")?.classList.toggle("hidden", state.view === "promos");
        render();
      });
    });
    ui.reset.addEventListener("click", resetFilters);
    ui.resetEmpty.addEventListener("click", resetFilters);
    ui.filterToggle.addEventListener("click", () => toggleDrawer(true));
    $("#applyFilterDrawer").addEventListener("click", () => { render(); toggleDrawer(false); });
    $("#closeFilterDrawer").addEventListener("click", () => toggleDrawer(false));
    ui.drawerBackdrop.addEventListener("click", () => toggleDrawer(false));
    ui.grid.addEventListener("click", (event) => {
      if (event.target.closest(".provider-whatsapp")) return;
      const promoTrigger = event.target.closest("[data-promo]");
      if (promoTrigger) {
        const promo = state.promos.find((item) => item.id === promoTrigger.dataset.promo);
        if (promo) showPromoDetail(promo);
        return;
      }
      const trigger = event.target.closest("[data-detail]");
      if (!trigger) return;
      const profile = state.profiles.find((item) => item.id === Number(trigger.dataset.detail));
      if (profile) showDetail(profile);
    });

    $("#modalBody").addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-business]");
      if (!trigger) return;
      const profile = state.profiles.find((item) => item.id === Number(trigger.dataset.business));
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
      state.promosById = new Map(profiles.map((profile) => [profile.id, profile]));
      renderFloors();
      bindEvents();
      render();

      const openId = Number(new URLSearchParams(location.search).get("open"));
      if (openId) {
        const profile = state.profiles.find((item) => item.id === openId);
        if (profile) showDetail(profile);
      }

      const promoId = new URLSearchParams(location.search).get("promo");
      if (promoId) {
        const promo = state.promos.find((item) => item.id === promoId);
        if (promo) showPromoDetail(promo);
      }

      if (new URLSearchParams(location.search).get("view") === "promos") {
        state.view = "promos";
        document.querySelectorAll("[data-view]").forEach((button) => {
          const active = button.dataset.view === "promos";
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        ui.sort.closest(".results-actions")?.classList.add("hidden");
        ui.promo.closest("label")?.classList.add("hidden");
        render();
      }
    } catch (error) {
      console.error(error);
      ui.count.textContent = "No se pudieron cargar los datos";
      ui.empty.classList.remove("hidden");
    }
  }

  init();
})();
