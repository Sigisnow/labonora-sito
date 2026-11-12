/* La Bonora — comportamenti del sito: menu di navigazione, "aperto ora", menu da dati, prenotazione. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Navigazione su telefono */
  var btn = $(".menu-btn"), nav = $(".nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Chiudi" : "Menu";
    });
  }


  /* Anteprima: dentro un riquadro (anteprima di Claude) i link tel: e mailto: non sono affidabili.
     Lì mostriamo il numero o l'indirizzo e lo copiamo; sul sito vero i link funzionano normalmente. */
  var framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  if (framed) {
    var toast = document.createElement("div");
    toast.className = "toast"; toast.setAttribute("role", "status"); toast.hidden = true;
    document.body.appendChild(toast);
    var timer;
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="tel:"],a[href^="mailto:"]');
      if (!a) return;
      ev.preventDefault();
      var isTel = a.getAttribute("href").indexOf("tel:") === 0;
      var val = isTel ? "06 8837 6508" : a.getAttribute("href").slice(7);
      var msg = (isTel ? "Telefono: " : "Email: ") + val;
      var show = function (extra) { toast.textContent = msg + extra; toast.hidden = false; clearTimeout(timer); timer = setTimeout(function () { toast.hidden = true; }, 3500); };
      try { navigator.clipboard.writeText(val).then(function () { show(" · copiato"); }, function () { show(""); }); } catch (e) { show(""); }
    });
  }

  /* Aperto ora? Ogni sera 18:00–02:00, ora di Roma */
  function romeHour() {
    try {
      var parts = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var h = 0, m = 0;
      parts.forEach(function (p) { if (p.type === "hour") h = +p.value % 24; if (p.type === "minute") m = +p.value; });
      return h + m / 60;
    } catch (e) { return new Date().getHours(); }
  }
  $$("[data-open-now]").forEach(function (el) {
    var h = romeHour(), open = h >= 18 || h < 2;
    var dot = document.createElement("span");
    dot.className = "dot-open" + (open ? " on" : "");
    dot.setAttribute("aria-hidden", "true");
    el.textContent = open ? "Aperti ora, fino alle 02:00" : "Apriamo alle 18:00";
    el.prepend(dot);
  });

  /* Menu */
  var M = window.BONORA_MENU;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function price(p) { return p == null ? "—" : "€ " + p; }
  function item(v) {
    var meta = [];
    if (v.firma) meta.push('<span class="tag">Firma Bonora</span>');
    if (v.all === "verifica") meta.push("<span>allergeni in verifica</span>");
    else if (v.all) meta.push('<span title="Allergeni">' + esc(v.all) + "</span>");
    return '<div class="item"><div class="item-head"><span class="item-name">' + esc(v.nome) +
      '</span><span class="item-dots" aria-hidden="true"></span><span class="item-price">' + price(v.prezzo) + "</span></div>" +
      (v.desc ? '<p class="item-desc">' + esc(v.desc) + "</p>" : "") +
      (meta.length ? '<div class="item-meta">' + meta.join("") + "</div>" : "") + "</div>";
  }
  function section(s, letter) {
    return '<section class="menu-sec" aria-labelledby="m-' + s.id + '"><p class="kick wine">' + (letter ? letter + " · " : "") + esc(s.sottotitolo) +
      '</p><h3 id="m-' + s.id + '">' + esc(s.titolo) + "</h3>" + s.voci.map(item).join("") + "</section>";
  }
  /* divide le sezioni in colonne consecutive, bilanciando il numero di voci e mantenendo l'ordine */
  function columns(secs, n) {
    var w = secs.map(function (s) { return s.voci.length + 3; });
    var total = w.reduce(function (a, b) { return a + b; }, 0), cols = [[]], acc = 0;
    secs.forEach(function (s, i) {
      var left = n - cols.length;
      if (cols[cols.length - 1].length && left > 0 && acc + w[i] / 2 > total * cols.length / n) cols.push([]);
      cols[cols.length - 1].push(section(s, String.fromCharCode(65 + i)));
      acc += w[i];
    });
    return cols.map(function (c) { return '<div class="menu-col">' + c.join("") + "</div>"; }).join("");
  }
  function render(el) {
    if (!M) { el.innerHTML = '<p class="note-line">Menu non disponibile.</p>'; return; }
    var key = el.getAttribute("data-menu"), n = +(el.getAttribute("data-cols") || 3), secs;
    if (key.indexOf("sala:") === 0) { var sala = key.slice(5); secs = M.sezioni.filter(function (s) { return s.sale.indexOf(sala) >= 0; }); }
    else secs = M.sezioni.filter(function (s) { return s.carta === key; });
    el.className = "menu-grid" + (n === 2 ? " two" : "");
    el.innerHTML = columns(secs, n);
  }
  $$("[data-menu]").forEach(render);
  $$("[data-allergens]").forEach(function (el) {
    if (!M) return;
    el.innerHTML = Object.keys(M.allergeni).map(function (k) { return "<div><b>" + k + "</b>" + esc(M.allergeni[k]) + "</div>"; }).join("");
  });
  $$("[data-menu-date]").forEach(function (el) { if (M) el.textContent = M.aggiornato; });

  /* Schede Cucina / Dopocena sulla pagina Menu (#cucina, #dopocena) */
  var tabs = $$("[role=tab]");
  function showTab(id) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("aria-controls") === id;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  }
  if (tabs.length) {
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        var id = t.getAttribute("aria-controls"); showTab(id);
        try { history.replaceState(null, "", "#" + id); } catch (e) {}
      });
    });
    var start = (location.hash || "").slice(1);
    showTab(document.getElementById(start) && start.indexOf("p-") === 0 ? start : tabs[0].getAttribute("aria-controls"));
    window.addEventListener("hashchange", function () { var h = location.hash.slice(1); if (document.getElementById(h) && h.indexOf("p-") === 0) showTab(h); });
  }

  /* Prenotazione */
  var form = $("#booking");
  if (form) {
    var day = $("#b-day"), time = $("#b-time");
    var today = new Date(); var iso = function (d) { return d.toISOString().slice(0, 10); };
    if (day) { day.min = iso(today); day.value = iso(today); }
    if (time) {
      for (var h = 18; h <= 23; h++) ["00", "30"].forEach(function (m) {
        var o = document.createElement("option"); o.value = o.textContent = h + ":" + m; if (h === 21 && m === "00") o.selected = true; time.appendChild(o);
      });
    }
    var pre = (location.hash || "").slice(1);
    var preset = form.querySelector('input[name=momento][value="' + pre + '"]');
    if (preset) preset.checked = true;

    function setErr(id, msg) { var e = document.getElementById(id + "-err"); if (e) { e.textContent = msg || ""; e.hidden = !msg; } }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ok = true, v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var checks = [
        ["b-name", v("b-name").length >= 2, "Scrivi il tuo nome."],
        ["b-phone", /^[+\d][\d\s.-]{7,}$/.test(v("b-phone")), "Serve un cellulare valido per confermarti."],
        ["b-email", !v("b-email") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("b-email")), "L'email non sembra corretta."],
        ["b-people", +v("b-people") >= 1 && +v("b-people") <= 40, "Indica quante persone (da 1 a 40)."],
        ["b-bday", !v("b-bday") || /^(0?[1-9]|[12]\d|3[01])[\/.-](0?[1-9]|1[0-2])$/.test(v("b-bday")), "Scrivilo come giorno/mese, per esempio 14/03."],
        ["b-privacy", $("#b-privacy").checked, "Serve il consenso per gestire la prenotazione."]
      ];
      checks.forEach(function (c) { setErr(c[0], c[1] ? "" : c[2]); if (!c[1]) ok = false; });
      if (!ok) { var first = checks.filter(function (c) { return !c[1]; })[0]; var f = document.getElementById(first[0]); if (f) f.focus(); return; }
      var mom = (form.querySelector("input[name=momento]:checked") || {}).value || "tutto";
      var dove = (form.querySelector("input[name=dove]:checked") || {}).value || "indifferente";
      var nm = { aperitivo: "aperitivo", cena: "cena", dopocena: "dopocena", tutto: "la serata intera" };
      var nd = { dentro: "dentro", fuori: "fuori nel patio", indifferente: "dentro o fuori" };
      var d = day && day.value ? new Date(day.value + "T12:00:00") : null;
      var when = d ? d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }) : "";
      var summary = v("b-name") + ", " + v("b-people") + " persone, " + when + " alle " + (time ? time.value : "") + ": " + nm[mom] + ", " + nd[dove] + ".";
      var hasMail = !!v("b-email");
      var finish = function (live) {
        $("#done-text").textContent = summary;
        $("#done-note").textContent = live
          ? (hasMail ? "Ti arriva l'email di conferma appena il locale accetta. Per qualsiasi cosa: WhatsApp 349 506 9530." : "Ti confermiamo con un messaggio al cellulare che hai indicato. Per qualsiasi cosa: WhatsApp 349 506 9530.")
          : "Questa è una demo: la richiesta non è stata inviata. Nel sito definitivo arriva al locale su Telegram con i tasti Accetta e Rifiuta, e a te parte l'email di conferma.";
        form.hidden = true; $("#done").hidden = false; $("#done").focus();
      };
      var API = window.BONORA_API;
      if (!API) { finish(false); return; }
      var send = form.querySelector("button[type=submit]"), label = send.textContent, fail = $("#send-err");
      send.disabled = true; send.textContent = "Invio in corso…"; if (fail) fail.hidden = true;
      var payload = {
        action: "book", nome: v("b-name"), telefono: v("b-phone"), email: v("b-email"), persone: +v("b-people"),
        data: day ? day.value : "", ora: time ? time.value : "", momento: mom, dove: dove, note: v("b-notes"),
        compleanno: v("b-bday"), privacy: $("#b-privacy").checked, mkt: !!($("#b-mkt") && $("#b-mkt").checked), hp: v("b-hp")
      };
      fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.ok) { form.reset(); if (day) day.value = iso(today); finish(true); }
          else throw new Error((res && res.error) || "errore");
        })
        .catch(function (err) {
          if (fail) { fail.innerHTML = "Non siamo riusciti a inviare la richiesta" + (err && err.message && err.message !== "errore" && err.message.indexOf("fetch") < 0 ? " (" + err.message + ")" : "") + ". Riprova, oppure scrivici su <a href=\"https://wa.me/393495069530\">WhatsApp</a>."; fail.hidden = false; }
        })
        .then(function () { send.disabled = false; send.textContent = label; });
    });
    var again = $("#done-again");
    if (again) again.addEventListener("click", function () { $("#done").hidden = true; form.hidden = false; });
  }
})();
