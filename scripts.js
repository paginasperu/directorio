(() => {
  "use strict";

  const fallbackBusinesses = ﻿[{"id":1,"name":"Fashion Outlet Perú","rating":4.9,"reviews":263,"floor":"","store":"","phone":"955012834","category":"Moda y accesorios","type":"Tienda de ropa","description":"Tienda de ropa y moda.","catalog":"Ropa, prendas de vestir","status":"No verificado"},{"id":2,"name":"JG Motos","rating":4.1,"reviews":115,"floor":"","store":"","phone":"986037168","category":"Vehículos y motocicletas","type":"Tienda de repuestos para motocicletas","description":"Tienda especializada en repuestos para motocicletas.","catalog":"Repuestos para motocicletas, partes para motocicletas","status":"No verificado"},{"id":3,"name":"DMAX","rating":4.9,"reviews":80,"floor":"","store":"","phone":"","category":"Tecnología","type":"Servicio técnico de celulares y laptops","description":"Servicio técnico para celulares y laptops.","catalog":"Reparación de celulares, reparación de laptops","status":"No verificado"},{"id":4,"name":"Gekko Bookstore","rating":4.7,"reviews":68,"floor":"","store":"","phone":"955071104","category":"Libros y entretenimiento","type":"Tienda de cómics","description":"Librería especializada en cómics e historietas.","catalog":"Cómics, historietas","status":"No verificado"},{"id":5,"name":"Papurri Store TCG","rating":4.9,"reviews":57,"floor":"","store":"","phone":"975568299","category":"Juguetes y entretenimiento","type":"Tienda de juegos","description":"Tienda de juegos y entretenimiento.","catalog":"Juegos","status":"No verificado"},{"id":6,"name":"Kuro Kuma","rating":2.6,"reviews":53,"floor":"","store":"","phone":"","category":"Gastronomía","type":"Restaurante","description":"Restaurante.","catalog":"Restaurante","status":"No verificado"},{"id":7,"name":"Latino Seguridad","rating":4.8,"reviews":28,"floor":"","store":"","phone":"","category":"Seguridad","type":"Proveedor de sistemas de seguridad","description":"Soluciones de videovigilancia y seguridad discreta.","catalog":"Sistemas de seguridad, cámaras ocultas, seguridad discreta","status":"No verificado"},{"id":8,"name":"DapKris Store","rating":4.5,"reviews":26,"floor":"","store":"","phone":"946445043","category":"Juguetes y entretenimiento","type":"Tienda de cartas coleccionables","description":"Tienda de cartas coleccionables.","catalog":"Cartas coleccionables","status":"No verificado"},{"id":9,"name":"Factory Comics Store","rating":3.7,"reviews":13,"floor":"","store":"","phone":"915088664","category":"Libros y entretenimiento","type":"Tienda de cómics","description":"Tienda de cómics.","catalog":"Cómics","status":"No verificado"},{"id":10,"name":"Nasareth","rating":5,"reviews":12,"floor":"","store":"","phone":"","category":"Belleza y cuidado personal","type":"Salón de belleza","description":"Salón de belleza y bienestar.","catalog":"Servicios de belleza","status":"No verificado"},{"id":11,"name":"Latinos.pe","rating":4.9,"reviews":12,"floor":"","store":"","phone":"987423543","category":"Tecnología","type":"Tienda de accesorios tecnológicos","description":"Tienda de accesorios tecnológicos.","catalog":"Accesorios tecnológicos","status":"No verificado"},{"id":12,"name":"Kratos Toys","rating":5,"reviews":12,"floor":"","store":"","phone":"999389905","category":"Juguetes y entretenimiento","type":"Tienda de hobbies y pasatiempos","description":"Tienda de hobbies y artículos para pasatiempos.","catalog":"Hobbies, artículos para pasatiempos","status":"No verificado"},{"id":13,"name":"Eco Wheels","rating":4.2,"reviews":12,"floor":"","store":"","phone":"934992264","category":"Vehículos y motocicletas","type":"Concesionario de motocicletas","description":"Venta de motocicletas.","catalog":"Motocicletas","status":"No verificado"},{"id":14,"name":"Marabu Spa","rating":4.6,"reviews":11,"floor":"","store":"","phone":"","category":"Salud y bienestar","type":"Spa y centro de bienestar","description":"Spa y centro de bienestar.","catalog":"Spa, bienestar","status":"No verificado"},{"id":15,"name":"Style Mobile","rating":4.2,"reviews":10,"floor":"","store":"","phone":"","category":"Tecnología","type":"Servicio técnico de celulares","description":"Servicio técnico y reparación de celulares.","catalog":"Reparación de celulares, servicio técnico","status":"No verificado"},{"id":16,"name":"Gaelino Store","rating":4,"reviews":9,"floor":"","store":"","phone":"998136686","category":"Juguetes y entretenimiento","type":"Tienda de coleccionables","description":"Tienda de artículos coleccionables.","catalog":"Artículos coleccionables","status":"No verificado"},{"id":17,"name":"Innovatronic","rating":4.1,"reviews":9,"floor":"","store":"","phone":"969236132","category":"Tecnología","type":"Tienda de accesorios para celulares","description":"Tienda de accesorios para celulares.","catalog":"Accesorios para celulares","status":"No verificado"},{"id":18,"name":"Poleras para Enamorados","rating":3.7,"reviews":7,"floor":"","store":"","phone":"922910754","category":"Regalos y recuerdos","type":"Tienda de regalos","description":"Tienda de regalos.","catalog":"Regalos","status":"No verificado"},{"id":19,"name":"Bocadulce","rating":4.3,"reviews":6,"floor":"","store":"","phone":"934154217","category":"Regalos y recuerdos","type":"Tienda de regalos","description":"Tienda de regalos.","catalog":"Regalos","status":"No verificado"},{"id":20,"name":"Tienda Sent","rating":4.8,"reviews":5,"floor":"","store":"","phone":"6761209","category":"Moda y accesorios","type":"Tienda de ropa para hombres","description":"Tienda de ropa para hombres.","catalog":"Ropa para hombres, prendas de vestir","status":"No verificado"},{"id":21,"name":"Firgún Perú","rating":4.8,"reviews":5,"floor":"","store":"","phone":"948713263","category":"Belleza y cuidado personal","type":"Perfumería","description":"Perfumería.","catalog":"Perfumes, fragancias","status":"No verificado"},{"id":22,"name":"Factory Toys","rating":4.2,"reviews":5,"floor":"","store":"","phone":"902267651","category":"Juguetes y entretenimiento","type":"Tienda de coleccionables","description":"Tienda de artículos coleccionables.","catalog":"Artículos coleccionables","status":"No verificado"},{"id":23,"name":"Generación Abeja","rating":4.5,"reviews":4,"floor":"","store":"","phone":"4724790","category":"Alimentos y productos naturales","type":"Tienda de productos naturales","description":"Tienda de productos naturales.","catalog":"Productos naturales","status":"No verificado"},{"id":24,"name":"Mila Masajes","rating":3.7,"reviews":3,"floor":"","store":"","phone":"","category":"Salud y bienestar","type":"Servicio de masajes deportivos","description":"Servicio de masajes deportivos.","catalog":"Masajes deportivos","status":"No verificado"},{"id":25,"name":"Okami Dex","rating":5,"reviews":3,"floor":"","store":"","phone":"930133751","category":"Juguetes y entretenimiento","type":"Juguetería","description":"Juguetería.","catalog":"Juguetes","status":"No verificado"},{"id":26,"name":"Katari Spa","rating":3.7,"reviews":3,"floor":"","store":"","phone":"","category":"Salud y bienestar","type":"Spa de masajes","description":"Spa de masajes.","catalog":"Masajes, servicios de spa","status":"No verificado"},{"id":27,"name":"Gin \u0026 Tonic","rating":5,"reviews":3,"floor":"","store":"","phone":"989333194","category":"Moda y accesorios","type":"Tienda de ropa juvenil","description":"Tienda de ropa juvenil.","catalog":"Ropa juvenil, prendas de vestir","status":"No verificado"},{"id":28,"name":"Masajes Antiestrés 1","rating":2.3,"reviews":3,"floor":"2","store":"46","phone":"","category":"Salud y bienestar","type":"Servicio de masajes","description":"Servicio de masajes.","catalog":"Masajes","status":"No verificado"},{"id":29,"name":"Masajes Antiestrés 2","rating":2.3,"reviews":3,"floor":"2","store":"39","phone":"","category":"Salud y bienestar","type":"Servicio de masajes","description":"Servicio de masajes.","catalog":"Masajes","status":"No verificado"},{"id":30,"name":"Elias","rating":4.7,"reviews":3,"floor":"","store":"","phone":"","category":"Salud y bienestar","type":"Servicio de masajes y quiropraxia","description":"Servicio de masajes y quiropraxia.","catalog":"Masajes, quiropraxia","status":"No verificado"},{"id":31,"name":"Lilliput","rating":4.5,"reviews":2,"floor":"","store":"","phone":"987775689","category":"Juguetes y entretenimiento","type":"Juguetería","description":"Juguetería.","catalog":"Juguetes","status":"No verificado"},{"id":32,"name":"Lmcell","rating":3,"reviews":2,"floor":"","store":"","phone":"","category":"Tecnología","type":"Servicio técnico de celulares","description":"Servicio técnico y reparación de celulares.","catalog":"Reparación de celulares, servicio técnico","status":"No verificado"},{"id":33,"name":"Zavarcelo Tattoo","rating":5,"reviews":2,"floor":"","store":"","phone":"","category":"Belleza y cuidado personal","type":"Estudio de tatuajes","description":"Estudio de tatuajes.","catalog":"Tatuajes","status":"No verificado"},{"id":34,"name":"Juanecotoys","rating":3,"reviews":2,"floor":"","store":"","phone":"4946788","category":"Juguetes y entretenimiento","type":"Juguetería","description":"Juguetería.","catalog":"Juguetes","status":"No verificado"},{"id":35,"name":"BCJ","rating":3,"reviews":2,"floor":"","store":"","phone":"2651581","category":"Farmacia y salud","type":"Farmacia","description":"Farmacia.","catalog":"Productos de farmacia","status":"No verificado"},{"id":36,"name":"DibuToys Lima","rating":5,"reviews":2,"floor":"","store":"","phone":"992660301","category":"Juguetes y entretenimiento","type":"Tienda de coleccionables","description":"Tienda de artículos coleccionables.","catalog":"Artículos coleccionables","status":"No verificado"},{"id":37,"name":"Sexshop Vip Lince","rating":5,"reviews":1,"floor":"","store":"","phone":"","category":"Salud y bienestar","type":"Tienda de bienestar íntimo","description":"Tienda de bienestar íntimo y productos para adultos.","catalog":"Productos para adultos, bienestar íntimo","status":"No verificado"},{"id":38,"name":"Welcome to Turin","rating":5,"reviews":1,"floor":"","store":"76","phone":"993338268","category":"Tecnología","type":"Tienda de electrónica","description":"Tienda de productos electrónicos.","catalog":"Electrónica","status":"No verificado"},{"id":39,"name":"Ventas en Línea","rating":5,"reviews":1,"floor":"","store":"","phone":"7515600","category":"Moda y accesorios","type":"Tienda de accesorios de moda","description":"Tienda de accesorios de moda.","catalog":"Accesorios de moda","status":"No verificado"},{"id":40,"name":"Gugatienda","rating":5,"reviews":1,"floor":"","store":"","phone":"947815407","category":"Moda y accesorios","type":"Tienda de accesorios de moda","description":"Tienda de accesorios de moda.","catalog":"Accesorios de moda","status":"No verificado"},{"id":41,"name":"SeoSupremo","rating":5,"reviews":1,"floor":"","store":"76","phone":"","category":"Servicios profesionales","type":"Agencia de marketing","description":"Agencia de marketing.","catalog":"Marketing","status":"No verificado"},{"id":42,"name":"Rapioptica","rating":4,"reviews":1,"floor":"","store":"","phone":"","category":"Salud y bienestar","type":"Servicio de optometría","description":"Servicios de optometría y salud visual.","catalog":"Optometría, salud visual","status":"No verificado"},{"id":43,"name":"Kiputron","rating":1,"reviews":1,"floor":"","store":"","phone":"","category":"Tecnología","type":"Especialistas en hardware y software","description":"Especialistas en hardware y software.","catalog":"Hardware, software","status":"No verificado"},{"id":44,"name":"Alexa Disfraces","rating":5,"reviews":1,"floor":"","store":"","phone":"944640299","category":"Sex shop","type":"Tienda para adultos","description":"Sex shop con productos de lencería.","catalog":"Lencería","status":"No verificado"},{"id":45,"name":"Worldtech Perú","rating":5,"reviews":1,"floor":"","store":"","phone":"6377838","category":"Hogar y oficina","type":"Tienda de escritorios para computadora","description":"Tienda de escritorios para computadora.","catalog":"Escritorios para computadora","status":"No verificado"},{"id":46,"name":"Dynamis","rating":5,"reviews":1,"floor":"","store":"10","phone":"938864771","category":"Moda y accesorios","type":"Tienda de accesorios de moda","description":"Tienda de accesorios de moda.","catalog":"Accesorios de moda","status":"No verificado"},{"id":47,"name":"LimonBird","rating":null,"reviews":null,"floor":"","store":"","phone":"984120033","category":"Regalos y recuerdos","type":"Tienda de recuerdos y souvenirs","description":"Tienda de recuerdos y souvenirs.","catalog":"Recuerdos, souvenirs","status":"No verificado"},{"id":48,"name":"PokeNipon","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Juguetes y entretenimiento","type":"Tienda de cartas coleccionables","description":"Tienda de cartas coleccionables.","catalog":"Cartas coleccionables","status":"No verificado"},{"id":49,"name":"Diseños","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Salud y bienestar","type":"Spa","description":"Spa y bienestar.","catalog":"Servicios de spa, bienestar","status":"No verificado"},{"id":50,"name":"Smartphone Rocket","rating":null,"reviews":null,"floor":"","store":"29","phone":"987951023","category":"Tecnología","type":"Tienda de celulares","description":"Tienda de celulares.","catalog":"Celulares","status":"No verificado"},{"id":51,"name":"Duo Salón","rating":null,"reviews":null,"floor":"2","store":"67","phone":"","category":"Salud y bienestar","type":"Spa de día","description":"Spa de día y bienestar.","catalog":"Servicios de spa, bienestar","status":"No verificado"},{"id":52,"name":"Full Natura","rating":null,"reviews":null,"floor":"","store":"","phone":"922400229","category":"Alimentos y productos naturales","type":"Tienda de productos naturales","description":"Tienda de productos naturales.","catalog":"Productos naturales","status":"No verificado"},{"id":53,"name":"Kurama","rating":null,"reviews":null,"floor":"","store":"","phone":"947842138","category":"Vehículos y motocicletas","type":"Tienda de repuestos para motocicletas","description":"Tienda de repuestos para motocicletas.","catalog":"Repuestos para motocicletas","status":"No verificado"},{"id":54,"name":"Bathmate Peruvian","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Salud y bienestar","type":"Sexología y bienestar íntimo","description":"Negocio de sexología y bienestar íntimo.","catalog":"Sexología, bienestar íntimo","status":"No verificado"},{"id":55,"name":"Bathmate Hydromax Peru","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Salud y bienestar","type":"Sexología y bienestar íntimo","description":"Negocio de sexología y bienestar íntimo.","catalog":"Sexología, bienestar íntimo","status":"No verificado"},{"id":56,"name":"KingStore","rating":null,"reviews":null,"floor":"2","store":"48","phone":"","category":"Tecnología","type":"Tienda de accesorios para celulares","description":"Tienda de accesorios para celulares.","catalog":"Accesorios para celulares","status":"No verificado"},{"id":57,"name":"Dertel Peru","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Herramientas e industria","type":"Tienda de herramientas y equipos de medición","description":"Herramientas y equipos de medición: alcoholímetros, tacómetros, anemómetros, pirómetros, luxómetros y distanciómetros.","catalog":"Herramientas de medición, alcoholímetros, tacómetros, anemómetros, pirómetros, luxómetros, distanciómetros","status":"No verificado"},{"id":58,"name":"Taller Gonk","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Arte y entretenimiento","type":"Estudio de arte","description":"Estudio de arte.","catalog":"Arte","status":"No verificado"},{"id":59,"name":"Burning Toys","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Tabaco y fumadores","type":"Proveedor de productos de tabaco","description":"Proveedor de productos de tabaco.","catalog":"Productos de tabaco","status":"No verificado"},{"id":60,"name":"Kobdi","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Herramientas e industria","type":"Proveedor de equipos industriales","description":"Proveedor de equipos industriales.","catalog":"Equipos industriales","status":"No verificado"},{"id":61,"name":"Popzilla","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Juguetes y entretenimiento","type":"Tienda de hobbies y pasatiempos","description":"Tienda de hobbies y pasatiempos.","catalog":"Hobbies, artículos para pasatiempos","status":"No verificado"},{"id":62,"name":"Comunicaciones N\u0026M","rating":null,"reviews":null,"floor":"","store":"","phone":"931405922","category":"Tecnología","type":"Tienda de celulares","description":"Tienda de celulares.","catalog":"Celulares","status":"No verificado"},{"id":63,"name":"Amanzintoys","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Juguetes y entretenimiento","type":"Tienda de cartas coleccionables","description":"Tienda de cartas coleccionables.","catalog":"Cartas coleccionables","status":"No verificado"},{"id":64,"name":"El Buzón de Pókemon","rating":null,"reviews":null,"floor":"","store":"","phone":"994129440","category":"Juguetes y entretenimiento","type":"Tienda de cartas coleccionables","description":"Tienda de cartas coleccionables.","catalog":"Cartas coleccionables","status":"No verificado"},{"id":65,"name":"Mahira Masajes SPA","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Belleza y cuidado personal","type":"Spa y centro de masajes","description":"Spa con servicios de masajes y cuidado personal.","catalog":"Servicios de spa, masajes","status":"No verificado"},{"id":66,"name":"Johnny Cell Phone","rating":null,"reviews":null,"floor":"","store":"","phone":"989796177","category":"Tecnología","type":"Tienda de celulares","description":"Tienda de celulares.","catalog":"Celulares","status":"No verificado"},{"id":67,"name":"Bellas Lenceria","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Moda y accesorios","type":"Tienda de ropa para mujeres","description":"Tienda de ropa para mujeres.","catalog":"Ropa para mujeres, prendas de vestir","status":"No verificado"},{"id":68,"name":"Toys Vaita","rating":null,"reviews":null,"floor":"","store":"","phone":"993553087","category":"Juguetes y entretenimiento","type":"Juguetería","description":"Juguetería.","catalog":"Juguetes","status":"No verificado"},{"id":69,"name":"Kaita","rating":null,"reviews":null,"floor":"","store":"","phone":"4710210","category":"Alimentos y productos naturales","type":"Tienda de alimentos saludables","description":"Tienda de alimentos saludables.","catalog":"Alimentos saludables","status":"No verificado"},{"id":70,"name":"Ham Sekai Store","rating":null,"reviews":null,"floor":"","store":"","phone":"4711786","category":"Moda y accesorios","type":"Tienda de accesorios de moda","description":"Tienda de accesorios de moda.","catalog":"Accesorios de moda","status":"No verificado"},{"id":71,"name":"Siete Regalos","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Regalos y recuerdos","type":"Tienda de regalos","description":"Tienda de regalos.","catalog":"Regalos","status":"No verificado"},{"id":72,"name":"Electri LM","rating":null,"reviews":null,"floor":"","store":"","phone":"934992264","category":"Herramientas e industria","type":"Tienda de motores eléctricos","description":"Tienda de motores eléctricos.","catalog":"Motores eléctricos","status":"No verificado"},{"id":73,"name":"Ponte Tacones y Más","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Moda y accesorios","type":"Tienda de accesorios de moda","description":"Tienda de accesorios de moda.","catalog":"Accesorios de moda","status":"No verificado"},{"id":74,"name":"OG Parfums","rating":null,"reviews":null,"floor":"","store":"","phone":"966432229","category":"Belleza y cuidado personal","type":"Perfumería","description":"Perfumería.","catalog":"Perfumes, fragancias","status":"No verificado"},{"id":75,"name":"Medsi Store","rating":null,"reviews":null,"floor":"","store":"","phone":"993553087","category":"Juguetes y entretenimiento","type":"Juguetería","description":"Juguetería.","catalog":"Juguetes","status":"No verificado"},{"id":76,"name":"Mariana Fashion","rating":null,"reviews":null,"floor":"","store":"","phone":"2662458","category":"Moda y accesorios","type":"Tienda de vestidos","description":"Tienda de vestidos.","catalog":"Vestidos","status":"No verificado"},{"id":77,"name":"Anima Toons Store","rating":null,"reviews":null,"floor":"","store":"","phone":"946180581","category":"Juguetes y entretenimiento","type":"Juguetería","description":"Juguetería.","catalog":"Juguetes","status":"No verificado"},{"id":78,"name":"Datex Store","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Tecnología","type":"Servicio técnico de celulares","description":"Servicio técnico y reparación de celulares.","catalog":"Reparación de celulares, servicio técnico","status":"No verificado"},{"id":79,"name":"La Madriguera TCG","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Juguetes y entretenimiento","type":"Club de juegos de mesa","description":"Club de juegos de mesa.","catalog":"Juegos de mesa","status":"No verificado"},{"id":80,"name":"Linduras Studio Nails","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Belleza y cuidado personal","type":"Salón de manicura y uñas","description":"Salón de manicura y cuidado de uñas.","catalog":"Manicura, cuidado de uñas","status":"No verificado"},{"id":81,"name":"Powerboy Store","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Juguetes y entretenimiento","type":"Tienda de coleccionables","description":"Tienda de artículos coleccionables.","catalog":"Artículos coleccionables","status":"No verificado"},{"id":82,"name":"9no Pasajero","rating":null,"reviews":null,"floor":"","store":"","phone":"991942844","category":"Juguetes y entretenimiento","type":"Juguetería","description":"Juguetería.","catalog":"Juguetes","status":"No verificado"},{"id":83,"name":"San Sebastián","rating":null,"reviews":null,"floor":"","store":"","phone":"","category":"Salud y bienestar","type":"Servicio de podología","description":"Servicio de podología.","catalog":"Podología, cuidado podológico","status":"No verificado"},{"id":84,"name":"Legión Force Sede Lince","rating":null,"reviews":null,"floor":"","store":"","phone":"977822745","category":"Comercio general","type":"Tienda","description":"Tienda ubicada en Full Market.","catalog":"","status":"No verificado"},{"id":85,"name":"Krasa Boutiques","rating":null,"reviews":null,"floor":"","store":"","phone":"958992917","category":"Moda y accesorios","type":"Boutique","description":"Boutique de moda.","catalog":"Moda, prendas de vestir","status":"No verificado"}];

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
        <span class="provider-avatar">${item.logo ? `<img src="${escapeHtml(item.logo)}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>${escapeHtml(initials(item.name))}</span>` : `<span>${escapeHtml(initials(item.name))}</span>`}</span>
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

    function toggleDrawer(open) {
    if (!ui.drawer || !ui.drawerBackdrop) return;
    if (open) {
      ui.drawerBackdrop.classList.remove("hidden");
      requestAnimationFrame(() => {
        ui.drawerBackdrop.classList.remove("opacity-0");
        ui.drawerBackdrop.classList.add("opacity-100");
        ui.drawer.classList.remove("-translate-x-full");
      });
      document.body.classList.add("overflow-hidden");
    } else {
      ui.drawer.classList.add("-translate-x-full");
      ui.drawerBackdrop.classList.remove("opacity-100");
      ui.drawerBackdrop.classList.add("opacity-0");
      setTimeout(() => {
        ui.drawerBackdrop.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
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
    let lastScrollY = window.scrollY;
    let hiddenDistance = 0;
    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
      const movement = currentScrollY - lastScrollY;
      const headerHeight = header.offsetHeight;
      hiddenDistance = currentScrollY < 30
        ? 0
        : Math.max(0, Math.min(headerHeight, hiddenDistance + movement * 0.75));
      header.style.transform = `translateY(-${hiddenDistance}px)`;
      lastScrollY = currentScrollY;
    }, { passive: true });
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

