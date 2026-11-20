/* ============================================================
   TIZOKU · interacciones
   Lee los datos de js/config.js y arma botones, menú y mapa.
   ============================================================ */
(function () {
  "use strict";
  var C = window.TIZOKU;
  if (!C) return;

  /* ---------- Utilidades ---------- */
  function waUrl(message) {
    return "https://wa.me/" + C.whatsapp.number + "?text=" + encodeURIComponent(message || C.whatsapp.message);
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }
  function icon(id, cls) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", cls || "ico");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  /* ---------- Enlaces de contacto y redes ---------- */
  $all("[data-wa]").forEach(function (a) { a.href = waUrl(a.getAttribute("data-msg")); });
  $all("[data-tel]").forEach(function (a) {
    a.href = "tel:" + C.phone.tel;
    if (a.classList.contains("footer-phone")) a.textContent = C.phone.display;
  });
  $all("[data-social]").forEach(function (a) { a.href = C.social[a.getAttribute("data-social")] || "#"; });
  $all("[data-billing]").forEach(function (a) { a.href = C.billing; });
  var pdf = $("#menuPdf");
  if (pdf) pdf.href = C.menu.pdf;
  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Botones de pedido ---------- */
  var orderGrid = $("#orderGrid");
  if (orderGrid) {
    // 1) Llamar  2) WhatsApp  3) Plataformas de delivery
    orderGrid.appendChild(h("a", { "class": "order order--call", href: "tel:" + C.phone.tel }, [
      icon("i-phone", "ico big-ico"),
      h("small", { text: "Pasa por tu orden" }),
      h("strong", { text: "Llama, ordena y recoge" }),
      h("span", { "class": "go" }, [document.createTextNode(C.phone.display + " "), icon("i-arrow")])
    ]));
    orderGrid.appendChild(h("a", { "class": "order order--wa", href: waUrl(), target: "_blank", rel: "noopener" }, [
      icon("i-wa", "ico big-ico"),
      h("strong", { text: "WhatsApp directo" }),
      h("span", { "class": "go" }, [document.createTextNode("Escríbenos "), icon("i-arrow")])
    ]));
    C.delivery.forEach(function (d) {
      orderGrid.appendChild(h("a", { "class": "order order--app", href: d.url, target: "_blank", rel: "noopener" }, [
        h("small", { text: d.note }),
        h("strong", { text: d.name }),
        h("span", { "class": "go" }, [document.createTextNode("Pedir ahora "), icon("i-arrow")])
      ]));
    });
  }

  /* ---------- Menú (páginas en scroll + visor) ---------- */
  var menuPages = $("#menuPages");
  var box = $("#lightbox"), boxImg = $("#lightboxImg");
  if (menuPages) {
    C.menu.pages.forEach(function (p, i) {
      var img = h("img", { src: p.src, alt: p.alt, width: "1080", height: "1920" });
      if (i > 0) img.setAttribute("loading", "lazy");
      var btn = h("button", { "class": "menu-page", type: "button", "aria-label": "Ampliar página " + (i + 1) + " del menú" }, [img]);
      btn.addEventListener("click", function () {
        boxImg.src = p.src; boxImg.alt = p.alt;
        if (box.showModal) box.showModal(); else box.setAttribute("open", "");
      });
      menuPages.appendChild(btn);
    });
  }
  /* ---------- Botones por categoría: saltan a la parte del menú ---------- */
  var chips = $("#menuChips");
  if (chips && menuPages && C.menu.categories) {
    var chipEls = [];
    var track = h("div", { "class": "chips-track" });
    var arrowL = h("button", { "class": "chips-arrow chips-arrow--l", type: "button", "aria-label": "Ver categorías anteriores", text: "‹" });
    var arrowR = h("button", { "class": "chips-arrow chips-arrow--r", type: "button", "aria-label": "Ver más categorías", text: "›" });
    chips.appendChild(arrowL); chips.appendChild(track); chips.appendChild(arrowR);
    function updateArrows() {
      var max = track.scrollWidth - track.clientWidth;
      chips.classList.toggle("can-left", track.scrollLeft > 4);
      chips.classList.toggle("can-right", track.scrollLeft < max - 4);
    }
    arrowL.addEventListener("click", function () { track.scrollBy({ left: -track.clientWidth * 0.7, behavior: "smooth" }); });
    arrowR.addEventListener("click", function () { track.scrollBy({ left: track.clientWidth * 0.7, behavior: "smooth" }); });
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    C.menu.categories.forEach(function (cat) {
      var b = h("button", { "class": "chip", type: "button", text: cat.label });
      b.addEventListener("click", function () {
        var page = menuPages.children[cat.page - 1];
        if (!page) return;
        var offset = $(".site-header").offsetHeight + chips.offsetHeight + 12;
        var top = page.getBoundingClientRect().top + window.scrollY + cat.y * page.offsetHeight - offset;
        window.scrollTo({ top: top, behavior: "smooth" });
        chipEls.forEach(function (c) { c.classList.toggle("is-active", c === b); });
      });
      track.appendChild(b);
      chipEls.push(b);
    });
    updateArrows();

    /* Las categorías ruedan solas de ida y vuelta (solo si no caben en pantalla).
       Se detienen al tocar, deslizar o pasar el cursor, y retoman a los 4 s sin actividad.
       No ruedan si el menú no se ve, si la pestaña está oculta o con "movimiento reducido". */
    var calmChips = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calmChips) {
      var pos = 0, dir = 1, holdUntil = 0, idleUntil = 0, seen = true, rafId = null, lastT = 0;
      var SPEED = 22;                                       // píxeles por segundo
      var pauseChips = function () { idleUntil = performance.now() + 4000; };
      ["pointerdown", "touchstart", "wheel", "keydown", "focusin"].forEach(function (ev) {
        chips.addEventListener(ev, pauseChips, { passive: true });
      });
      chips.addEventListener("mouseenter", function () { idleUntil = Infinity; });
      chips.addEventListener("mouseleave", pauseChips);
      track.addEventListener("scroll", function () { if (performance.now() > idleUntil) return; pos = track.scrollLeft; }, { passive: true });

      var tick = function (t) {
        rafId = requestAnimationFrame(tick);
        var dt = Math.min(0.05, (t - (lastT || t)) / 1000);
        lastT = t;
        var max = track.scrollWidth - track.clientWidth;
        if (!seen || document.hidden || max < 8 || t < idleUntil || t < holdUntil) { pos = track.scrollLeft; return; }
        pos += dir * SPEED * dt;
        if (pos >= max) { pos = max; dir = -1; holdUntil = t + 1200; }
        else if (pos <= 0) { pos = 0; dir = 1; holdUntil = t + 1200; }
        track.scrollLeft = pos;
      };
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) { seen = entries[0].isIntersecting; }).observe(chips);
      }
      rafId = requestAnimationFrame(tick);
    }
  }

  if (box) {
    $("#lightboxClose").addEventListener("click", function () { box.close(); });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  }

  /* ---------- Ubicaciones ---------- */
  var locList = $("#locList");
  if (locList) {
    C.locations.forEach(function (loc) {
      if (loc.soon) {
        var soonCard = h("div", { "class": "loc-card" }, [
          h("span", { "class": "loc-tag", text: loc.tag }),
          h("h3", { text: loc.name }),
          h("p", { "class": "loc-soon", text: "Estamos preparando esta nueva sucursal. ¡Muy pronto te damos la fecha de apertura!" }),
          h("div", { "class": "loc-actions" }, [
            h("a", { "class": "btn btn--wa", target: "_blank", rel: "noopener",
              href: waUrl("¡Hola Tizoku! Quiero saber cuándo abre la sucursal de " + loc.name + " 🍣") },
              [icon("i-wa"), h("span", { text: "Avísame cuando abra" })])
          ])
        ]);
        locList.appendChild(h("article", { "class": "loc loc--soon" }, [soonCard]));
        return;
      }
      var q = encodeURIComponent(loc.mapQuery);
      var hours = loc.hours || "Consulta el horario por WhatsApp";

      // Si el horario trae varios rangos separados por "|", cada uno va en su propia línea.
      var hoursDd = h("dd", {});
      hours.split("|").forEach(function (part, i) {
        if (i > 0) hoursDd.appendChild(document.createElement("br"));
        hoursDd.appendChild(document.createTextNode(part.trim()));
      });

      var dl = h("dl", {}, [
        h("div", {}, [h("dt", { text: "Dirección" }), h("dd", { text: loc.address })]),
        h("div", {}, [h("dt", { text: "Horario" }), hoursDd]),
        h("div", {}, [h("dt", { text: "Teléfono" }), h("dd", {}, [h("a", { href: "tel:" + C.phone.tel, text: C.phone.display })])])
      ]);
      var actions = h("div", { "class": "loc-actions" }, [
        h("a", { "class": "btn btn--wa", href: "https://www.google.com/maps/dir/?api=1&destination=" + q, target: "_blank", rel: "noopener" },
          [icon("i-pin"), h("span", { text: "Google Maps" })]),
        h("a", { "class": "btn btn--call", href: "https://waze.com/ul?q=" + q + "&navigate=yes", target: "_blank", rel: "noopener" },
          [icon("i-pin"), h("span", { text: "Waze" })])
      ]);
      var card = h("div", { "class": "loc-card" }, [
        h("span", { "class": "loc-tag", text: loc.tag }),
        h("h3", { text: loc.name }), dl, actions
      ]);
      // El mapa NO se carga solo: primero se pregunta con qué app verlo.
      // Google Maps = se muestra aquí mismo (Google puede usar cookies); Apple Maps = abre la app/página de Apple.
      var map = h("div", { "class": "map map--ask" });
      var googleBtn = h("button", { "class": "btn btn--wa", type: "button" }, [icon("i-pin"), h("span", { text: "Ver mapa" })]);
      googleBtn.addEventListener("click", function () {
        map.classList.remove("map--ask");
        map.textContent = "";
        map.appendChild(h("iframe", {
          title: "Mapa de Tizoku " + loc.name,
          src: "https://maps.google.com/maps?q=" + q + "&output=embed",
          referrerpolicy: "no-referrer-when-downgrade", allowfullscreen: ""
        }));
      });
      map.appendChild(h("div", { "class": "map-ask" }, [
        icon("i-pin", "ico map-ico"),
        h("strong", { text: "Encuéntranos en el mapa" }),
        h("p", { text: "Al tocar el botón se carga el mapa de Google Maps, que puede usar cookies." }),
        h("div", { "class": "map-choices" }, [googleBtn])
      ]));
      locList.appendChild(h("article", { "class": "loc" }, [card, map]));
    });
  }

  /* ---------- Navegación móvil ---------- */
  var burger = $("#burger"), nav = $("#nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
    });
    $all("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Botón flotante (escritorio): visible al salir del hero ---------- */
  var floatBar = $(".float-bar"), heroEl = $("#inicio");
  if (floatBar && heroEl && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      floatBar.classList.toggle("show", !entries[0].isIntersecting);
    }).observe(heroEl);
  } else if (floatBar) {
    floatBar.classList.add("show");
  }

  /* ---------- Mazo de polaroids del hero ----------
     La de al frente (data-p="0") sale volando y pasa al fondo; las demás suben un lugar.
     Avanza sola cada 3.5 s (se pausa al tocar/pasar el cursor, fuera de pantalla o con la pestaña oculta),
     y también con clic/toque, deslizando o con los puntitos. Con "movimiento reducido" no avanza sola. */
  var deck = $("#heroPolaroids");
  if (deck) {
    var cards = $all(".pol", deck);
    var dotsBox = $("#polDots");
    var order = cards.slice();          // order[0] = la de al frente
    var busy = false, timer = null, paused = false, visible = true;
    var calmMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var dots = cards.map(function (card, i) {
      var b = h("button", { type: "button", "aria-label": "Ver foto " + (i + 1) + " de " + cards.length });
      b.addEventListener("click", function (e) { e.stopPropagation(); goTo(card); });
      dotsBox.appendChild(b);
      return b;
    });

    function render() {
      order.forEach(function (card, i) {
        card.setAttribute("data-p", String(i));
        card.setAttribute("aria-hidden", i === 0 ? "false" : "true");
        card.classList.remove("is-out");
      });
      dots.forEach(function (b, i) {
        if (cards[i] === order[0]) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
      });
    }

    function next() {
      if (busy) return;
      busy = true;
      var front = order[0];
      front.classList.add("is-out");                    // sale volando
      setTimeout(function () {
        front.classList.add("no-trans");                // se acomoda al fondo sin animar
        order.push(order.shift());
        render();
        void front.offsetWidth;                         // fuerza el reflujo antes de reactivar la animación
        front.classList.remove("no-trans");
        busy = false;
      }, calmMotion ? 0 : 450);
    }

    function goTo(card) {
      if (busy || order[0] === card) return;
      while (order[0] !== card) order.push(order.shift());
      render();
      restart();
    }

    function start() {
      stop();
      if (calmMotion || paused || !visible || document.hidden) return;
      timer = setInterval(next, 3500);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    // Clic o deslizamiento (en cualquier dirección) avanzan a la siguiente
    var startX = null, startY = null;
    deck.addEventListener("pointerdown", function (e) { startX = e.clientX; startY = e.clientY; paused = true; stop(); });
    deck.addEventListener("pointerup", function (e) {
      if (startX === null) return;
      var dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
      startX = startY = null;
      if (dx > 28 && dx > dy) next();
      else if (dx < 8 && dy < 8) next();
      paused = false; start();
    });
    deck.addEventListener("pointercancel", function () { startX = startY = null; paused = false; start(); });
    deck.addEventListener("mouseenter", function () { paused = true; stop(); });
    deck.addEventListener("mouseleave", function () { paused = false; start(); });
    document.addEventListener("visibilitychange", start);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; start(); }).observe(deck);
    }

    render();
    start();
  }

  /* ---------- Botón "volver arriba": aparece al bajar un poco ---------- */
  var toTop = $("#toTop");
  if (toTop) {
    var toggleTop = function () { toTop.classList.toggle("show", window.scrollY > 700); };
    window.addEventListener("scroll", toggleTop, { passive: true });
    toggleTop();
    toTop.addEventListener("click", function () {
      var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
    });
  }

  /* ---------- Promo del día ---------- */
  /**
   * Devuelve la promo vigente para la fecha dada: "2x1" (lun–mié), "4x3" (jue–dom) o null.
   * Se usa para resaltar la tarjeta "¡Hoy!" en la sección de promos.
   */
  function getTodayPromo(date) {
    // Día de la semana en la hora de Cd. Juárez, sin importar dónde esté el visitante
    var day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/Ciudad_Juarez" }).format(date);
    if (day === "Mon" || day === "Tue" || day === "Wed") return "2x1";
    return "4x3"; // jueves a domingo
  }

  var today = getTodayPromo(new Date());
  if (today) {
    var burst = $("#heroBurst");
    if (burst) {
      $("b", burst).textContent = today;
      $("small", burst).textContent = "Hoy en rollos";
    }
    $all(".promo").forEach(function (card) {
      var isToday = card.getAttribute("data-promo") === today;
      card.classList.toggle("is-today", isToday);
      var tag = $(".promo-today", card);
      if (tag) tag.hidden = !isToday;
    });
  }
})();
