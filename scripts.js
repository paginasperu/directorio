(() => {
  "use strict";

  const columns = {
    name: "nombre",
    rating: "calificacion",
    reviews: "opiniones",
    floor: "piso",
    store: "tienda",
    phone: "telefono",
    category: "categoria",
    type: "tipo",
    description: "descripcion",
    catalog: "catalogo",
    status: "estado",
  };
  const state = { businesses: [], category: "Todos", floor: "Todos", minRating: 0, search: "" };
  const $ = (selector) => document.querySelector(selector);
  const ui = {
    grid: $("#providerGrid"),
    category: $("#categoryFilter"),
    mobileCategory: $("#categoryFilterMobile"),
    search: $("#businessSearch"),
    mobileSearch: $("#mobileBusinessSearch"),
    floor: $("#floorFilter"),
    rating: $("#ratingFilter"),
    sort: $("#sortSelect"),
    mobileSort: $("#sortSelectMobile"),
    count: $("#resultsCount"),
    empty: $("#emptyState"),
    filterToggle: $("#filterToggle"),
    mobileFilterToggle: $("#filterToggleMobile"),
    moreFilters: $("#moreFilters"),
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
      const get = (key) => String(values[indexes[normalize(columns[key])]] ?? "").trim();
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
    return String(value ?? "").split(/[|;]+/).map((part) => part.trim()).filter(Boolean);
  }

  function whatsappUrl(business) {
    return business.phone ? `https://wa.me/${business.phone}` : "";
  }

  function searchable(business) {
    return normalize([business.name, business.category, business.type, business.description, business.catalog, business.floor, business.store].join(" "));
  }

  function renderCategories() {
    const categories = ["Todos", ...new Set(state.businesses.map((item) => item.category).filter(Boolean))];
    categories.sort((a, b) => a === "Todos" ? -1 : b === "Todos" ? 1 : a.localeCompare(b, "es-PE"));
    const options = categories.map((category) => `<option value="${escapeHtml(category)}">${category === "Todos" ? "Todas las categorías" : escapeHtml(category)}</option>`).join("");
    [ui.category, ui.mobileCategory].forEach((select) => {
      const placeholder = select === ui.mobileCategory ? "Categorías" : "Todas las categorías";
      select.innerHTML = `<option value="Todos">${placeholder}</option>` + options.replace('<option value="Todos">Todas las categorías</option>', "");
      select.value = state.category;
    });
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

  function card(item) {
    const rating = item.rating === null
      ? '<span class="provider-rating-unavailable">Sin calificación</span>'
      : `<span class="provider-rating">★ ${item.rating.toFixed(1)}</span>${item.reviews === null ? "" : `<span>(${item.reviews.toLocaleString("es-PE")} opiniones)</span>`}`;
    const location = [
      item.floor ? `Piso ${escapeHtml(item.floor)}` : "",
      item.store ? `Tienda ${escapeHtml(item.store)}` : "",
    ].filter(Boolean).join(" · ");
    const whatsapp = whatsappUrl(item);
    return `<article class="provider-card">
      <button type="button" class="provider-primary" data-detail-id="${item.id}" aria-label="Ver ficha de ${escapeHtml(item.name)}">
        <span class="provider-avatar"><span>${escapeHtml(initials(item.name))}</span></span>
        <span class="provider-main">
          <span class="provider-top">
            <span class="provider-classification">${escapeHtml(item.category)} · ${escapeHtml(item.type)}</span>
            <span class="verification-badge${item.verified ? " is-verified" : ""}">${escapeHtml(item.status || "Estado no informado")}</span>
          </span>
          <span class="provider-name">${escapeHtml(item.name)}</span>
          <span class="provider-description">${escapeHtml(item.description)}</span>
          <span class="provider-rating-row">${rating}</span>
        </span>
      </button>
      <div class="provider-footer">
        <span class="provider-location">${location ? escapeHtml(location) : "Ubicación no informada"}</span>
        ${whatsapp ? `<a class="provider-whatsapp" href="${whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de ${escapeHtml(item.name)}">WhatsApp</a>` : '<span class="provider-whatsapp provider-whatsapp-unavailable">Teléfono no informado</span>'}
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
    ui.mobileSort.value = "original";
    render();
    ui.moreFilters.classList.add("hidden");
    [ui.filterToggle, ui.mobileFilterToggle].forEach((button) => {
      button.setAttribute("aria-expanded", "false");
      button.classList.remove("is-active");
    });
  }

  function showDetail(item) {
    $("#modalTitle").textContent = item.name;
    $("#modalDescription").textContent = item.description;
    $("#modalCategory").textContent = item.category;
    $("#modalTypeBadge").textContent = item.type;
    $("#modalInitials").textContent = initials(item.name);
    $("#modalRating").textContent = item.rating === null ? "Sin calificación" : `★ ${item.rating.toFixed(1)} de 5`;
    $("#modalRatingReviews").textContent = item.reviews === null ? "" : ` · ${item.reviews.toLocaleString("es-PE")} opiniones`;
    const location = [
      item.floor ? `Piso ${item.floor}` : "",
      item.store ? `Tienda ${item.store}` : "",
    ].filter(Boolean).join(" · ");
    $("#modalFloorLocation").textContent = location || "No informado";
    $("#modalPhone").textContent = item.phone || "No informado";
    $("#modalPhoneRow").classList.toggle("hidden", !item.phone);
    $("#modalFloorLocationRow").classList.toggle("hidden", !location);

    const catalog = listValues(item.catalog);
    $("#modalProducts").innerHTML = catalog.map((value) => `<li class="px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-700">${escapeHtml(value)}</li>`).join("");
    $("#modalProductsSection").classList.toggle("hidden", catalog.length === 0);
    $("#modalServicesSection").classList.add("hidden");
    $("#modalContactLinks").innerHTML = "";
    const call = $("#modalCallBtn"), wa = $("#modalWhatsappBtn");
    call.href = item.phone ? `tel:${item.phone}` : "#";
    call.classList.toggle("hidden", !item.phone);
    wa.href = whatsappUrl(item) || "#";
    wa.classList.toggle("hidden", !item.phone);
    const badge = $("#modalStatus");
    badge.textContent = item.status || "Estado no informado";
    badge.className = `verification-badge${item.verified ? " is-verified" : ""}`;

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

  function bindScrollHeader() {
    const header = $("#siteHeader");
    let previousY = window.scrollY;
    let scheduled = false;
    const update = () => {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - previousY;
      if (currentY < 80) header.classList.remove("site-header-hidden");
      else if (delta > 4) header.classList.add("site-header-hidden");
      else if (delta < -4) header.classList.remove("site-header-hidden");
      previousY = currentY;
      scheduled = false;
    };
    window.addEventListener("scroll", () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }, { passive: true });
  }

  function bindEvents() {
    ui.search.addEventListener("input", () => setSearch(ui.search.value));
    ui.mobileSearch.addEventListener("input", () => setSearch(ui.mobileSearch.value));
    [ui.search, ui.mobileSearch].forEach((input) => input.closest("form")?.addEventListener("submit", (event) => event.preventDefault()));
    [ui.category, ui.mobileCategory].forEach((select) => select.addEventListener("change", () => {
      state.category = select.value;
      ui.category.value = state.category;
      ui.mobileCategory.value = state.category;
      render();
    }));
    ui.floor.addEventListener("change", () => { state.floor = ui.floor.value; render(); });
    ui.rating.addEventListener("change", () => { state.minRating = Number(ui.rating.value); render(); });
    [ui.sort, ui.mobileSort].forEach((select) => select.addEventListener("change", () => {
      ui.sort.value = select.value;
      ui.mobileSort.value = select.value;
      render();
    }));
    ui.reset.addEventListener("click", resetFilters);
    ui.resetEmpty.addEventListener("click", resetFilters);
    [ui.filterToggle, ui.mobileFilterToggle].forEach((button) => button.addEventListener("click", () => {
      const expanded = ui.moreFilters.classList.contains("hidden");
      [ui.filterToggle, ui.mobileFilterToggle].forEach((control) => control.setAttribute("aria-expanded", String(expanded)));
      [ui.filterToggle, ui.mobileFilterToggle].forEach((control) => control.classList.toggle("is-active", expanded));
      ui.moreFilters.classList.toggle("hidden", !expanded);
    }));
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
      const response = await fetch("./negocios.csv", { cache: "no-cache" });
      if (!response.ok) throw new Error(`No se pudo cargar negocios.csv (${response.status})`);
      state.businesses = parseCsv(await response.text());
      if (!state.businesses.length) throw new Error("El CSV no contiene negocios o sus encabezados cambiaron.");
      renderFloors();
      bindEvents();
      bindScrollHeader();
      render();
    } catch (error) {
      console.error(error);
      ui.count.textContent = "No se pudieron cargar los negocios";
      ui.empty.classList.remove("hidden");
    }
  }

  init();
})();

