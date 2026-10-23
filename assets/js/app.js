(() => {
  "use strict";


  const columns = {
    name: "nombre",
    rating: "calificacion",
    reviews: "opiniones",
    floor: "piso",
    store: "local",
    phone: "telefono",
    category: "categoria",
    type: "tipo",
    description: "descripcion",
    catalog: "catalogo",
    status: "estado",
    phone2: "telefono2",
    instagram: "instagram",
    facebook: "facebook",
    tiktok: "tiktok",
  };
  const state = { businesses: [], category: "Todos", floor: "Todos", minRating: 0, search: "" };
  const $ = (selector) => document.querySelector(selector);
  const ui = {
    grid: $("#providerGrid"),
    categoryList: $("#categoryList"),
    search: $("#businessSearch"),
    mobileSearch: $("#mobileBusinessSearch"),
    floor: $("#floorFilter"),
    rating: $("#ratingFilter"),
    sort: $("#sortSelect"),
    count: $("#resultsCount"),
    empty: $("#emptyState"),
    filterToggle: $("#filterToggle"),
    drawer: $("#moreFilters"),
    drawerBackdrop: $("#filterDrawerBackdrop"),
    reset: $("#resetFilters"),
    resetEmpty: $("#resetFiltersEmpty"),
    modal: $("#modalDetail"),
    modalContent: $("#modalDetailContent"),
  };

  function normalize(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("es-PE");
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
    if (rows.length < 2) return [];

    const headers = rows.shift().map(normalize);
    const indexes = Object.fromEntries(headers.map((header, index) => [header, index]));
    return rows.map((values, index) => {
      const get = (key) => {
        const col = columns[key];
        const idx = indexes[normalize(col)];
        return idx !== undefined ? String(values[idx] ?? "").trim() : "";
      };
      const rating = Number(get("rating").replace(",", "."));
      const reviews = Number(get("reviews"));
      const status = get("status");
      return {
        id: index + 1,
        name: get("name"),
        rating: get("rating") && Number.isFinite(rating) ? rating : null,
        reviews: get("reviews") && Number.isFinite(reviews) ? reviews : null,
        floor: get("floor"),
        store: get("store"),
        phone: get("phone").replace(/\D/g, ""),
        category: get("category"),
        type: get("type"),
        description: get("description"),
        catalog: get("catalog"),
        status,
        verified: normalize(status) === "verificado",
        phone2: get("phone2").replace(/\D/g, ""),
        instagram: get("instagram"),
        facebook: get("facebook"),
        tiktok: get("tiktok"),
      };
    }).filter((business) => business.name);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  }

  function initials(name) {
    return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("es-PE");
  }

  function listValues(value) {
    return String(value ?? "").split(/[,|;]+/).map((part) => part.trim()).filter(Boolean);
  }

  function whatsappUrl(business) {
    return business.phone ? `https://wa.me/${business.phone}` : "";
  }

  function searchable(business) {
    return normalize([business.name, business.category, business.type, business.description, business.catalog, business.products, business.services, business.floor, business.store].join(" "));
  }

  function renderCategories() {
    const categories = ["Todos", ...new Set(state.businesses.map((item) => item.category).filter(Boolean))];
    categories.sort((a, b) => a === "Todos" ? -1 : b === "Todos" ? 1 : a.localeCompare(b, "es-PE"));
    ui.categoryList.innerHTML = categories.map((category) => `<button type="button" class="category-option${category === state.category ? " is-active" : ""}" data-category="${escapeHtml(category)}" aria-pressed="${String(category === state.category)}">${escapeHtml(category)}</button>`).join("");
  }

  function renderFloors() {
    const floors = [...new Set(state.businesses.map((item) => item.floor).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es-PE", { numeric: true }));
    ui.floor.innerHTML = '<option value="Todos">Todos los pisos</option>' + floors.map((floor) =>
      `<option value="${escapeHtml(floor)}">Piso ${escapeHtml(floor)}</option>`
    ).join("");
  }

  function matches(item) {
    if (state.category !== "Todos" && item.category !== state.category) return false;
    if (state.floor !== "Todos" && item.floor !== state.floor) return false;
    if (state.minRating && (item.rating === null || item.rating < state.minRating)) return false;
    return !state.search || searchable(item).includes(state.search);
  }

  function sorted(items) {
    const result = [...items], order = ui.sort.value;
    if (order === "rating") result.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    else if (order === "reviews") result.sort((a, b) => (b.reviews ?? -1) - (a.reviews ?? -1));
    else if (order === "name") result.sort((a, b) => a.name.localeCompare(b.name, "es-PE"));
    return result;
  }

  const palettes = [
    ["#eef1f6", "#d7deea"],
    ["#edf3ef", "#cfe0d6"],
    ["#f6f1ea", "#e6d8c8"],
    ["#f7eef1", "#e8d3da"],
    ["#eef3f8", "#d3e0ee"],
    ["#f1eef7", "#dcd4ea"],
    ["#f7f4e8", "#e8dfc2"],
    ["#eaf3f2", "#cde3e0"],
  ];

  function palette(text) {
    let hash = 0;
    for (const character of String(text ?? "")) hash = (hash * 31 + character.charCodeAt(0)) % 997;
    return palettes[hash % palettes.length];
  }

  function card(item) {
    const rating = item.rating === null
      ? '<span class="provider-rating-unavailable">Sin calificación</span>'
      : `<span class="provider-rating">★ ${item.rating.toFixed(1)}</span>${item.reviews === null ? "" : `<span class="provider-reviews">${item.reviews.toLocaleString("es-PE")} opiniones</span>`}`;
    const location = [
      item.floor ? `Piso ${escapeHtml(item.floor)}` : "",
      item.store ? `Local ${escapeHtml(item.store)}` : "",
    ].filter(Boolean).join(" · ");
    const whatsapp = whatsappUrl(item);
    const [coverA, coverB] = palette(item.category);
    return `<article class="provider-card">
      <button type="button" class="provider-primary" data-detail-id="${item.id}" aria-label="Ver ficha de ${escapeHtml(item.name)}">
        <span class="provider-cover" style="--cover-a:${coverA};--cover-b:${coverB}" aria-hidden="true">
          <span class="provider-cover-initials">${escapeHtml(initials(item.name))}</span>
          <span class="provider-tag">${escapeHtml(item.category)}</span>
        </span>
        <span class="provider-body">
          <span class="provider-name">${escapeHtml(item.name)}</span>
          <span class="provider-type">${escapeHtml(item.type)}</span>
          <span class="provider-description">${escapeHtml(item.description)}</span>
          <span class="provider-rating-row">${rating}</span>
        </span>
      </button>
      <div class="provider-footer">
        <span class="provider-location">${escapeHtml(location)}</span>
        ${whatsapp ? `<a class="provider-whatsapp" href="${whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de ${escapeHtml(item.name)}">WhatsApp</a>` : '<span class="provider-whatsapp provider-whatsapp-unavailable">Sin teléfono</span>'}
      </div>
    </article>`;
  }

  function render() {
    renderCategories();
    const results = sorted(state.businesses.filter(matches));
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
    if (!ui.drawer || !ui.drawerBackdrop) return;
    ui.filterToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      ui.drawerBackdrop.classList.remove("hidden");
      requestAnimationFrame(() => {
        ui.drawerBackdrop.classList.remove("opacity-0");
        ui.drawerBackdrop.classList.add("opacity-100");
        ui.drawer.classList.remove("-translate-x-full");
      });
    } else {
      ui.drawer.classList.add("-translate-x-full");
      ui.drawerBackdrop.classList.remove("opacity-100");
      ui.drawerBackdrop.classList.add("opacity-0");
      setTimeout(() => {
        ui.drawerBackdrop.classList.add("hidden");
      }, 300);
    }
  }

  function resetFilters() {
    state.category = "Todos";
    state.floor = "Todos";
    state.minRating = 0;
    state.search = "";
    ui.search.value = "";
    ui.mobileSearch.value = "";
    ui.floor.value = "Todos";
    ui.rating.value = "0";
    ui.sort.value = "original";
    render();
    toggleDrawer(false);
  }

  function showDetail(item) {
    const [coverA, coverB] = palette(item.category);
    ui.modalContent.style.setProperty("--cover-a", coverA);
    ui.modalContent.style.setProperty("--cover-b", coverB);
    $("#modalTitle").textContent = item.name;
    $("#modalDescription").textContent = item.description;
    $("#modalCategory").textContent = item.category;
    $("#modalTypeBadge").textContent = item.type;
    $("#modalInitials").textContent = initials(item.name);
    $("#modalRating").textContent = item.rating === null ? "Sin calificación" : `★ ${item.rating.toFixed(1)} de 5`;
    $("#modalRatingReviews").textContent = item.reviews === null ? "" : ` · ${item.reviews.toLocaleString("es-PE")} opiniones`;
    const location = [
      item.floor ? `Piso ${item.floor}` : "",
      item.store ? `Local ${escapeHtml(item.store)}` : "",
    ].filter(Boolean).join(" · ");
    $("#modalFloorLocation").textContent = location || "No informado";
    $("#modalPhone").textContent = item.phone || "No informado";
    $("#modalPhoneRow").classList.toggle("hidden", !item.phone);
    $("#modalPhone2").textContent = item.phone2 || "No informado";
    $("#modalPhone2Row").classList.toggle("hidden", !item.phone || !item.phone2);
    $("#modalFloorLocationRow").classList.toggle("hidden", !location);

    const socials = [
      { label: "Instagram", url: item.instagram },
      { label: "Facebook", url: item.facebook },
      { label: "TikTok", url: item.tiktok },
    ].filter((social) => social.url);
    $("#modalSocialLinks").innerHTML = socials.map((social) =>
      `<a class="social-link" href="${escapeHtml(social.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(social.label)}</a>`
    ).join("");
    $("#modalSocialSection").classList.toggle("hidden", socials.length === 0);

    const catalog = listValues(item.catalog);
    $("#modalProducts").innerHTML = catalog.map((value) => `<li class="px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-700">${escapeHtml(value)}</li>`).join("");
    $("#modalProductsSection").classList.toggle("hidden", catalog.length === 0);
    const call = $("#modalCallBtn"), wa = $("#modalWhatsappBtn");
    call.href = item.phone ? `tel:${item.phone}` : "#";
    call.classList.toggle("hidden", !item.phone);
    wa.href = whatsappUrl(item) || "#";
    wa.classList.toggle("hidden", !item.phone);
    const badge = $("#modalStatus");
    badge.textContent = item.status || "Verificado";
    badge.className = `verification-badge${item.verified ? " is-verified" : ""}`;
    badge.classList.toggle("hidden", !item.verified);

    ui.modal.classList.remove("hidden");
    ui.modal.classList.add("flex");
    requestAnimationFrame(() => {
      ui.modalContent.classList.remove("scale-95", "opacity-0");
      ui.modalContent.classList.add("scale-100", "opacity-100");
    });
    document.body.classList.add("overflow-hidden");
  }

  function closeDetail() {
    ui.modal.classList.add("hidden");
    ui.modal.classList.remove("flex");
    ui.modalContent.classList.add("scale-95", "opacity-0");
    ui.modalContent.classList.remove("scale-100", "opacity-100");
    document.body.classList.remove("overflow-hidden");
  }

  function bindEvents() {
    ui.search.addEventListener("input", () => setSearch(ui.search.value));
    ui.mobileSearch.addEventListener("input", () => setSearch(ui.mobileSearch.value));
    [ui.search, ui.mobileSearch].forEach((input) => input.closest("form")?.addEventListener("submit", (event) => event.preventDefault()));
    ui.categoryList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      render();
    });
    ui.floor.addEventListener("change", () => { state.floor = ui.floor.value; render(); });
    ui.rating.addEventListener("change", () => { state.minRating = Number(ui.rating.value); render(); });
    ui.sort.addEventListener("change", render);
    ui.reset.addEventListener("click", resetFilters);
    ui.resetEmpty.addEventListener("click", resetFilters);
    ui.filterToggle.addEventListener("click", () => toggleDrawer(true));
    $("#applyFilterDrawer")?.addEventListener("click", () => {
      render();
      toggleDrawer(false);
    });
    $("#closeFilterDrawer")?.addEventListener("click", () => toggleDrawer(false));
    ui.drawerBackdrop?.addEventListener("click", () => toggleDrawer(false));
    ui.grid.addEventListener("click", (event) => {
      if (event.target.closest(".provider-whatsapp")) return;
      const trigger = event.target.closest("[data-detail-id]");
      if (!trigger) return;
      const item = state.businesses.find((business) => business.id === Number(trigger.dataset.detailId));
      if (item) showDetail(item);
    });
    $('[aria-label="Cerrar ficha"]').addEventListener("click", closeDetail);
    ui.modal.addEventListener("click", (event) => { if (event.target === ui.modal) closeDetail(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !ui.modal.classList.contains("hidden")) closeDetail(); });
  }

  async function init() {
    try {
      const response = await fetch("./data/negocios.csv", { cache: "no-cache" });
      if (!response.ok) throw new Error(`No se pudo cargar negocios.csv (${response.status})`);
      state.businesses = parseCsv(await response.text());
      if (!state.businesses.length) throw new Error("El CSV no contiene negocios o sus encabezados cambiaron.");
      renderFloors();
      bindEvents();
      render();
    } catch (error) {
      console.error(error);
      ui.count.textContent = "No se pudieron cargar los negocios";
      ui.empty.classList.remove("hidden");
    }
  }

  init();
})();
