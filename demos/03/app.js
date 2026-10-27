// Demo 03 — oscuro con acento coral.

import {
    escapeHtml,
    formatDate,
    getSaving,
    loadDirectory,
    money,
    normalize,
    phoneDigits,
} from "../../assets/js/data.js";

const FAV_KEY = "directorio03:favoritos";

const $ = (selector) => document.querySelector(selector);

const state = {
    view: "negocios",
    category: "Todos",
    floor: "Todos",
    query: "",
    sort: "az",
    layout: "grid",
    favorites: new Set(),
    profiles: [],
    promos: [],
    byId: new Map(),
};

const ui = {
    q: $("#q"),
    filterBtn: $("#filterBtn"),
    filters: $("#filters"),
    fCategory: $("#fCategory"),
    fFloor: $("#fFloor"),
    fSort: $("#fSort"),
    clearFilters: $("#clearFilters"),
    chips: $("#chips"),
    grid: $("#grid"),
    empty: $("#empty"),
    resetAll: $("#resetAll"),
    viewTitle: $("#viewTitle"),
    resultCount: $("#resultCount"),
    favCount: $("#favCount"),
    favBtn: $("#favBtn"),
    modal: $("#modal"),
    modalBody: $("#modalBody"),
    modalClose: $("#modalClose"),
    sortQuick: $("#sortQuick"),
    statBiz: $("#statBiz"),
    statPromos: $("#statPromos"),
    statFloors: $("#statFloors"),
};

/* ---------- Favoritos ---------- */

function readFavorites() {
    try {
        return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
    } catch {
        return new Set();
    }
}

function saveFavorites() {
    localStorage.setItem(FAV_KEY, JSON.stringify([...state.favorites]));
}

function toggleFavorite(id) {
    const key = String(id);
    if (state.favorites.has(key)) state.favorites.delete(key);
    else state.favorites.add(key);
    saveFavorites();
    render();
}

/* ---------- Filtros ---------- */

function matchesBusiness(profile) {
    if (state.category !== "Todos" && profile.category !== state.category) return false;
    if (state.floor !== "Todos" && String(profile.floor) !== String(state.floor)) return false;
    if (!state.query) return true;
    const text = normalize([
        profile.name,
        profile.type,
        profile.category,
        profile.keywords,
        profile.unit,
        ...profile.promos.map((promo) => `${promo.title} ${promo.category}`),
    ].join(" "));
    return text.includes(state.query);
}

function matchesPromo(promo) {
    if (state.category !== "Todos" && promo.category !== state.category) return false;
    if (state.floor !== "Todos" && String(promo.profile?.floor) !== String(state.floor)) return false;
    if (!state.query) return true;
    const text = normalize([
        promo.title,
        promo.description,
        promo.type,
        promo.mode,
        promo.category,
        promo.profile?.name,
    ].join(" "));
    return text.includes(state.query);
}

function sortList(items) {
    const list = [...items];
    if (state.sort === "az") return list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (state.sort === "promos") return list.sort((a, b) => b.promos.length - a.promos.length || a.name.localeCompare(b.name, "es"));
    return list.sort((a, b) => (Number(a.floor) || 0) - (Number(b.floor) || 0) || a.name.localeCompare(b.name, "es"));
}

function sortPromos(items) {
    const list = [...items];
    if (state.sort === "floor") return list.sort((a, b) => (Number(a.profile?.floor) || 0) - (Number(b.profile?.floor) || 0));
    if (state.sort === "promos") return list.sort((a, b) => getSaving(b) - getSaving(a));
    return list.sort((a, b) => a.title.localeCompare(b.title, "es"));
}

/* ---------- Tarjetas ---------- */

function location(profile) {
    const parts = [];
    if (profile.floor) parts.push(`Piso ${profile.floor}`);
    if (profile.unit) parts.push(`Local ${profile.unit}`);
    return parts.join(" · ") || "Centro comercial";
}

function favoriteButton(id, extra = "") {
    const on = state.favorites.has(String(id));
    return `<button type="button" class="fav${on ? " is-on" : ""} ${extra}" data-fav="${id}" aria-pressed="${on}" aria-label="Guardar en favoritos">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z"/></svg>
    </button>`;
}

function businessCard(profile) {
    const promo = profile.promos[0];
    const promoLine = promo
        ? `<div class="card-promo"><strong>${escapeHtml(promo.title)}</strong>${promo.type === "Descuento" ? `${money(promo.discounted)} · antes ${money(promo.regular)}` : `Premio · ${escapeHtml(promo.mode || "Sorteo")}`}</div>`
        : "";
    const wa = phoneDigits(profile.whatsapp);

    return `<article class="card">
        <div class="card-media">
            <img src="${escapeHtml(profile.banner)}" alt="" loading="lazy" decoding="async">
            ${favoriteButton(profile.id)}
            <img class="card-logo" src="${escapeHtml(profile.logo)}" alt="" loading="lazy" decoding="async">
        </div>
        <div class="card-body">
            <span class="card-cat">${escapeHtml(profile.category)}</span>
            <h3 class="card-name">${escapeHtml(profile.name)}</h3>
            <p class="card-type">${escapeHtml(profile.type)}</p>
            <div class="card-meta">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>
                <span>${escapeHtml(location(profile))}</span>
            </div>
            ${promoLine}
        </div>
        <div class="card-foot">
            <button type="button" class="card-btn" data-business="${profile.id}">Ver ficha</button>
            <a class="card-btn${wa ? " is-accent" : ""}" ${wa ? `href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer"` : "aria-disabled=\"true\""}>WhatsApp</a>
        </div>
    </article>`;
}

function promoCard(promo) {
    const saving = getSaving(promo);
    const percent = saving > 0 && promo.regular > 0 ? Math.round((saving / promo.regular) * 100) : 0;
    const tag = promo.type === "Descuento" ? (percent ? `−${percent}%` : "Descuento") : (promo.mode || "Premio");
    const price = promo.type === "Descuento" && promo.discounted > 0
        ? `<div class="promo-price"><strong>${money(promo.discounted)}</strong><s>${money(promo.regular)}</s>${saving ? `<span class="promo-save">Ahorras ${money(saving)}</span>` : ""}</div>`
        : `<p class="card-type">Vence ${escapeHtml(formatDate(promo.until))}</p>`;

    return `<article class="card promo-card">
        <div class="card-media">
            <img src="${escapeHtml(promo.image)}" alt="" loading="lazy" decoding="async">
            <span class="promo-tag">${escapeHtml(tag)}</span>
        </div>
        <div class="card-body">
            <span class="card-cat">${escapeHtml(promo.profile?.name || promo.category)}</span>
            <h3 class="card-name">${escapeHtml(promo.title)}</h3>
            ${price}
        </div>
        <div class="card-foot">
            <button type="button" class="card-btn is-accent" data-promo="${escapeHtml(promo.id)}">Ver oferta</button>
        </div>
    </article>`;
}

/* ---------- Render ---------- */

function renderChips() {
    const categories = [...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "es"));
    ui.chips.innerHTML = ["Todos", ...categories]
        .map((category) => `<button type="button" class="chip" data-cat="${escapeHtml(category)}" aria-pressed="${state.category === category}">${escapeHtml(category)}</button>`)
        .join("");
}

function renderFilters() {
    const categories = [...new Set(state.profiles.map((profile) => profile.category).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "es"));
    ui.fCategory.innerHTML = ["Todos", ...categories]
        .map((category) => `<option value="${escapeHtml(category)}"${state.category === category ? " selected" : ""}>${escapeHtml(category)}</option>`)
        .join("");

    const floors = [...new Set(state.profiles.map((profile) => profile.floor).filter(Boolean))]
        .sort((a, b) => Number(a) - Number(b));
    ui.fFloor.innerHTML = ["Todos", ...floors]
        .map((floor) => `<option value="${escapeHtml(floor)}"${String(state.floor) === String(floor) ? " selected" : ""}>Piso ${escapeHtml(floor)}</option>`)
        .join("");

    ui.fSort.value = state.sort;
}

function render() {
    let items = [];

    if (state.view === "negocios") {
        items = sortList(state.profiles.filter(matchesBusiness));
        ui.viewTitle.textContent = "Negocios";
    } else if (state.view === "promos") {
        items = sortPromos(state.promos.filter(matchesPromo));
        ui.viewTitle.textContent = "Promociones";
    } else {
        items = sortList(state.profiles.filter((profile) => matchesBusiness(profile) && state.favorites.has(String(profile.id))));
        ui.viewTitle.textContent = "Favoritos";
    }

    const noun = state.view === "promos" ? "promociones" : "negocios";
    ui.resultCount.textContent = `${items.length} ${noun}${items.length === 1 ? "" : ""}`;

    ui.grid.dataset.layout = state.layout;
    ui.grid.innerHTML = items.map((item) => (state.view === "promos" ? promoCard(item) : businessCard(item))).join("");

    ui.empty.hidden = items.length > 0;
    ui.grid.hidden = items.length === 0;

    document.querySelectorAll("[data-view]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.view === state.view);
    });

    const favorites = state.favorites.size;
    ui.favCount.textContent = favorites;
    ui.favCount.hidden = favorites === 0;
}

/* ---------- Ficha ---------- */

function openModal(html) {
    ui.modalBody.innerHTML = html;
    ui.modal.hidden = false;
    document.body.style.overflow = "hidden";
    ui.modalClose.focus();
}

function closeModal() {
    ui.modal.hidden = true;
    document.body.style.overflow = "";
}

function businessDetail(profile) {
    const wa = phoneDigits(profile.whatsapp);
    const phone = phoneDigits(profile.fixed);
    const socials = [
        ["Instagram", profile.instagram],
        ["Facebook", profile.facebook],
        ["TikTok", profile.tiktok],
    ].filter(([, url]) => url);

    const promos = profile.promos.length
        ? `<div class="detail-promos">${profile.promos.map((promo) => `
            <button type="button" class="detail-promo" data-promo="${escapeHtml(promo.id)}">
                <span>
                    <strong>${escapeHtml(promo.title)}</strong>
                    <span>${escapeHtml(promo.type)}${promo.type === "Descuento" ? ` · vence ${escapeHtml(formatDate(promo.until))}` : ""}</span>
                </span>
                ${promo.type === "Descuento" ? `<b>${money(promo.discounted)}</b>` : ""}
            </button>`).join("")}</div>`
        : `<p>Este negocio todavía no publicó promociones.</p>`;

    const links = socials.length
        ? `<div class="detail-actions">${socials.map(([name, url]) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${name}</a>`).join("")}</div>`
        : "";

    return `
        <div class="detail-banner"><img src="${escapeHtml(profile.banner)}" alt="" decoding="async"></div>
        <div class="detail-head">
            <img class="detail-logo" src="${escapeHtml(profile.logo)}" alt="" decoding="async">
            <div>
                <h2 class="detail-title" id="modalTitle">${escapeHtml(profile.name)}</h2>
                <p class="detail-sub">${escapeHtml(profile.category)} · ${escapeHtml(profile.type)}</p>
            </div>
        </div>
        <div class="detail-body">
            <dl class="detail-grid">
                <div class="detail-item"><dt>Ubicación</dt><dd>${escapeHtml(location(profile))}</dd></div>
                <div class="detail-item"><dt>WhatsApp</dt><dd>${wa ? escapeHtml(profile.whatsapp) : "No publicado"}</dd></div>
            </dl>
            <section class="detail-section">
                <h3>Qué ofrece</h3>
                <p>${escapeHtml(profile.short || profile.long)}</p>
            </section>
            <section class="detail-section">
                <h3>Promociones</h3>
                ${promos}
            </section>
            ${links}
            <div class="detail-actions">
                <a class="${wa ? "is-accent" : "is-muted"}" ${wa ? `href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer"` : ""}>WhatsApp</a>
                <a class="${phone ? "" : "is-muted"}" ${phone ? `href="tel:+${phone}"` : ""}>Llamar</a>
            </div>
        </div>`;
}

function promoDetail(promo) {
    const profile = promo.profile;
    const saving = getSaving(promo);
    const percent = saving > 0 && promo.regular > 0 ? Math.round((saving / promo.regular) * 100) : 0;
    const wa = phoneDigits(profile?.whatsapp);

    return `
        <div class="detail-banner"><img src="${escapeHtml(promo.image)}" alt="" decoding="async"></div>
        <div class="detail-head">
            <img class="detail-logo" src="${escapeHtml(profile?.logo || promo.image)}" alt="" decoding="async">
            <div>
                <h2 class="detail-title" id="modalTitle">${escapeHtml(promo.title)}</h2>
                <p class="detail-sub">${escapeHtml(profile?.name || "")}${percent ? ` · −${percent}%` : ""}</p>
            </div>
        </div>
        <div class="detail-body">
            <dl class="detail-grid">
                <div class="detail-item"><dt>Tipo</dt><dd>${escapeHtml(promo.type)}${promo.mode ? ` · ${escapeHtml(promo.mode)}` : ""}</dd></div>
                <div class="detail-item"><dt>Vence</dt><dd>${escapeHtml(formatDate(promo.until))}</dd></div>
                ${promo.type === "Descuento" && promo.discounted > 0
                    ? `<div class="detail-item"><dt>Precio</dt><dd>${money(promo.discounted)}${promo.regular > promo.discounted ? ` · antes ${money(promo.regular)}` : ""}</dd></div>`
                    : ""}
            </dl>
            <section class="detail-section">
                <h3>Descripción</h3>
                <p>${escapeHtml(promo.description)}</p>
            </section>
            <section class="detail-section">
                <h3>Condiciones</h3>
                <p>${escapeHtml(promo.conditions)}</p>
            </section>
            <div class="detail-actions">
                ${profile ? `<button type="button" data-business="${profile.id}">Ver negocio</button>` : ""}
                <a class="${wa ? "is-accent" : "is-muted"}" ${wa ? `href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer"` : ""}>WhatsApp</a>
            </div>
        </div>`;
}

/* ---------- Eventos ---------- */

function setView(view) {
    state.view = view;
    render();
}

function bind() {
    ui.q.addEventListener("input", () => {
        state.query = normalize(ui.q.value);
        render();
    });

    ui.filterBtn.addEventListener("click", () => {
        const open = ui.filters.hidden;
        ui.filters.hidden = !open;
        ui.filterBtn.setAttribute("aria-expanded", String(open));
    });

    ui.fCategory.addEventListener("change", () => {
        state.category = ui.fCategory.value;
        renderChips();
        render();
    });

    ui.fFloor.addEventListener("change", () => {
        state.floor = ui.fFloor.value;
        render();
    });

    ui.fSort.addEventListener("change", () => {
        state.sort = ui.fSort.value;
        render();
    });

    ui.clearFilters.addEventListener("click", () => {
        state.category = "Todos";
        state.floor = "Todos";
        state.query = "";
        ui.q.value = "";
        renderFilters();
        renderChips();
        render();
    });

    ui.resetAll.addEventListener("click", () => ui.clearFilters.click());

    ui.sortQuick.addEventListener("click", () => {
        const order = ["az", "promos", "floor"];
        state.sort = order[(order.indexOf(state.sort) + 1) % order.length];
        ui.fSort.value = state.sort;
        ui.sortQuick.textContent = { az: "A–Z", promos: "Con promo", floor: "Piso" }[state.sort];
        render();
    });

    ui.chips.addEventListener("click", (event) => {
        const chip = event.target.closest("[data-cat]");
        if (!chip) return;
        state.category = chip.dataset.cat;
        ui.fCategory.value = state.category;
        renderChips();
        render();
    });

    ui.grid.addEventListener("click", (event) => {
        const fav = event.target.closest("[data-fav]");
        if (fav) return toggleFavorite(fav.dataset.fav);

        const business = event.target.closest("[data-business]");
        if (business) {
            const profile = state.byId.get(Number(business.dataset.business));
            if (profile) openModal(businessDetail(profile));
            return;
        }

        const promo = event.target.closest("[data-promo]");
        if (promo) {
            const item = state.promos.find((entry) => String(entry.id) === String(promo.dataset.promo));
            if (item) openModal(promoDetail(item));
        }
    });

    ui.modalBody.addEventListener("click", (event) => {
        const fav = event.target.closest("[data-fav]");
        if (fav) return toggleFavorite(fav.dataset.fav);

        const promo = event.target.closest("[data-promo]");
        if (promo) {
            const item = state.promos.find((entry) => String(entry.id) === String(promo.dataset.promo));
            if (item) openModal(promoDetail(item));
            return;
        }

        const business = event.target.closest("[data-business]");
        if (business) {
            const profile = state.byId.get(Number(business.dataset.business));
            if (profile) openModal(businessDetail(profile));
        }
    });

    document.querySelectorAll("[data-layout]").forEach((button) => {
        button.addEventListener("click", () => {
            state.layout = button.dataset.layout;
            document.querySelectorAll("[data-layout]").forEach((other) => {
                other.setAttribute("aria-pressed", String(other === button));
            });
            render();
        });
    });

    document.querySelectorAll("[data-view]").forEach((tab) => {
        tab.addEventListener("click", () => setView(tab.dataset.view));
    });

    ui.favBtn.addEventListener("click", () => setView("favoritos"));

    ui.modalClose.addEventListener("click", closeModal);
    ui.modal.addEventListener("click", (event) => {
        if (event.target === ui.modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !ui.modal.hidden) closeModal();
    });
}

/* ---------- Inicio ---------- */

async function init() {
    try {
        const { profiles, promos, profilesById } = await loadDirectory();
        state.profiles = profiles;
        state.promos = promos;
        state.byId = profilesById;
        state.favorites = readFavorites();

        ui.statBiz.textContent = profiles.length;
        ui.statPromos.textContent = promos.length;
        ui.statFloors.textContent = new Set(profiles.map((profile) => profile.floor).filter(Boolean)).size;

        renderChips();
        renderFilters();
        bind();
        render();
    } catch (error) {
        console.error(error);
        ui.grid.innerHTML = "";
        ui.resultCount.textContent = "No se pudieron cargar los datos.";
        ui.empty.hidden = true;
    }
}

init();
