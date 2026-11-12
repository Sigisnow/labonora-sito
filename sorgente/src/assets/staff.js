/* La Bonora — agenda prenotazioni per lo staff.
   Legge dal servizio Google (window.BONORA_API) con il codice staff. Senza servizio mostra dati di esempio. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var API = window.BONORA_API, DEMO = !API;
  var GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  var MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  var MOM = { aperitivo: "Aperitivo", cena: "Cena", dopocena: "Dopocena", tutto: "Serata intera" };
  var DOVE = { dentro: "Dentro", fuori: "Fuori, patio", indifferente: "Dentro o fuori" };
  var CLS = { "In attesa": "pending", "Accettata": "ok", "Rifiutata": "no" };
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
                del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };

  /* vista: "giorno" (una serata), "settimana" (lun–dom), "prossime" (da stasera a 60 giorni) */
  var pin = store.get("bonora-pin") || "", view = "giorno", day = null, filter = "tutte", data = [], timer = null, seq = 0;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function shift(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function monday(s) { var d = parse(s); return shift(s, -((d.getDay() + 6) % 7)); }
  function romeNow() {
    var o = {}; new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { date: o.year + "-" + o.month + "-" + o.day, hour: +o.hour % 24 };
  }
  /* alle 01:00 si lavora ancora sulla serata di ieri */
  function tonight() { var n = romeNow(); return n.hour < 5 ? shift(n.date, -1) : n.date; }
  function label(s) { var d = parse(s); return GIORNI[d.getDay()] + " " + d.getDate() + " " + MESI[d.getMonth()]; }
  function short(s) { var d = parse(s); return d.getDate() + " " + MESI[d.getMonth()].slice(0, 3); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function telTxt(t) { var m = /^\+39(\d{3})(\d{3})(\d+)$/.exec(t); return m ? m[1] + " " + m[2] + " " + m[3] : t; }
  function dayName(s) { var t = tonight(); return s === t ? "Stasera" : s === shift(t, 1) ? "Domani" : s === shift(t, -1) ? "Ieri" : ""; }

  function range() {
    if (view === "giorno") return { from: day, to: day, fetchTo: shift(day, 30) };
    if (view === "settimana") { var m = monday(day); return { from: m, to: shift(m, 6), fetchTo: shift(m, 6) }; }
    return { from: tonight(), to: shift(tonight(), 60), fetchTo: shift(tonight(), 60) };
  }

  function show(id) { ["#st-login", "#st-app"].forEach(function (x) { $(x).hidden = x !== id; }); $("#st-logout").hidden = id !== "#st-app" || DEMO; }

  function demoData() {
    var t = tonight(), b = [], n = 40;
    var people = [["Giulia Ferri", 4, "aperitivo", "fuori", "19:30"], ["Marco Rinaldi", 2, "cena", "dentro", "20:30"], ["Sara Conti", 6, "cena", "indifferente", "21:00"],
      ["Luca Bianchi", 12, "tutto", "dentro", "21:30"], ["Andrea Russo", 3, "dopocena", "fuori", "22:30"], ["Elisa Marino", 2, "cena", "dentro", "21:00"],
      ["Paolo Greco", 5, "aperitivo", "dentro", "19:00"], ["Chiara Gallo", 8, "cena", "fuori", "20:00"]];
    var st = ["Accettata", "Accettata", "In attesa", "Rifiutata", "In attesa", "In attesa", "Accettata", "In attesa"];
    for (var g = 0; g < 12; g++) {
      for (var i = 0; i < (g % 3) + 1 + (g === 0 ? 2 : 0); i++) {
        var p = people[(g + i) % people.length], s = g > 1 && st[(g + i) % st.length] === "Rifiutata" ? "Accettata" : st[(g + i) % st.length];
        b.push({ id: ++n, data: shift(t, g), ora: p[4], nome: p[0], telefono: "+39333" + (1000000 + n * 7919 % 9000000), email: "", persone: p[1], momento: p[2], dove: p[3],
          note: g === 0 && i === 1 ? "Anniversario, tavolo tranquillo" : (g === 0 && i === 2 ? "Una persona celiaca" : ""), stato: s, decisoDa: s === "In attesa" ? "" : "Flavio",
          decisoIl: s === "In attesa" ? "" : t + " 17:40", compleanno: g === 0 && i === 2 ? t.slice(8, 10) + "/" + t.slice(5, 7) : "", storico: { richieste: 1 + (i % 3), accettate: i % 3 } });
      }
    }
    return b;
  }

  function load(quiet) {
    var r = range(), my = ++seq;
    if (!quiet) $("#st-list").innerHTML = '<p class="st-empty">Carico…</p>';
    if (DEMO) { data = demoData(); render(); stamp(); return; }
    var url = API + "?action=list&pin=" + encodeURIComponent(pin) + "&from=" + r.from + "&to=" + r.fetchTo + "&t=" + Date.now();
    fetch(url).then(function (res) { return res.json(); }).then(function (res) {
      if (my !== seq) return; // nel frattempo è stata scelta un'altra vista
      if (!res.ok && res.error === "pin") { store.del("bonora-pin"); pin = ""; show("#st-login"); $("#st-pin-err").hidden = false; return; }
      if (!res.ok) throw new Error(res.error);
      data = res.prenotazioni || []; render(); stamp();
    }).catch(function () {
      if (my !== seq) return;
      $("#st-upd").textContent = "Connessione assente: riprovo tra un minuto.";
      if (!quiet) $("#st-list").innerHTML = '<p class="st-empty">Non riesco a leggere le prenotazioni. Controlla la connessione.</p>';
    });
  }
  function stamp() { var d = new Date(); $("#st-upd").textContent = (DEMO ? "Anteprima con prenotazioni di esempio · " : "") + "Aggiornato alle " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + " · si aggiorna da solo ogni minuto"; }

  function totals(list) {
    var t = { ok: { n: 0, p: 0 }, pending: { n: 0, p: 0 }, no: { n: 0, p: 0 } };
    list.forEach(function (b) { var k = CLS[b.stato] || "pending"; t[k].n++; t[k].p += +b.persone || 0; });
    return t;
  }

  function render() {
    var r = range(), t0 = tonight();
    var inRange = data.filter(function (b) { return b.data >= r.from && b.data <= r.to; });

    // tasti delle viste
    var w = monday(t0), active = view === "giorno" ? (day === t0 ? "stasera" : day === shift(t0, 1) ? "domani" : "") : view === "settimana" ? (monday(day) === w ? "sett" : monday(day) === shift(w, 7) ? "prossima" : "") : "prossime";
    $$("#st-views button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-v") === active ? "true" : "false"); });

    // titolo e frecce
    if (view === "giorno") { var dn = dayName(day); $("#st-day").textContent = cap((dn ? dn + ", " : "") + label(day)); }
    else if (view === "settimana") { var m = monday(day); $("#st-day").textContent = (m === w ? "Questa settimana" : m === shift(w, 7) ? "Prossima settimana" : "Settimana") + " · " + short(m) + " – " + short(shift(m, 6)); }
    else $("#st-day").textContent = "Tutte le prossime";
    $("#st-step").hidden = view === "prossime";
    $("#st-prev").setAttribute("aria-label", view === "giorno" ? "Giorno precedente" : "Settimana precedente");
    $("#st-next").setAttribute("aria-label", view === "giorno" ? "Giorno successivo" : "Settimana successiva");
    $("#st-date").value = view === "settimana" ? monday(day) : day;

    // riepilogo
    var t = totals(inRange);
    $("#st-sum").innerHTML =
      '<div class="ok"><b>' + t.ok.p + '</b><span>coperti confermati</span><small>' + t.ok.n + (t.ok.n === 1 ? " tavolo" : " tavoli") + '</small></div>' +
      '<div class="pending"><b>' + t.pending.n + '</b><span>da decidere</span><small>' + t.pending.p + ' persone</small></div>' +
      '<div class="no"><b>' + t.no.n + '</b><span>rifiutate</span><small>' + t.no.p + ' persone</small></div>';

    // richieste in attesa nei giorni dopo (solo nella vista giorno)
    var later = view === "giorno" ? data.filter(function (b) { return b.data > day && b.stato === "In attesa"; }) : [];
    $("#st-later").innerHTML = later.length ? "Ci sono anche <b>" + later.length + "</b> " + (later.length === 1 ? "richiesta" : "richieste") + " da decidere nei prossimi giorni: " +
      later.slice(0, 6).map(function (b) { return '<button type="button" data-go="' + b.data + '">' + esc(label(b.data)) + ", " + esc(b.ora) + "</button>"; }).join(" ") : "";

    $$("#st-filter button").forEach(function (bt) { bt.setAttribute("aria-pressed", bt.getAttribute("data-f") === filter ? "true" : "false"); });
    var shown = inRange.filter(function (b) { return filter === "tutte" || CLS[b.stato] === filter; });

    if (!shown.length) { $("#st-list").innerHTML = '<p class="st-empty">' + (inRange.length ? "Nessuna prenotazione con questo filtro." : view === "giorno" ? "Nessuna prenotazione per questa serata." : "Nessuna prenotazione in questo periodo.") + "</p>"; return; }
    if (view === "giorno") { $("#st-list").innerHTML = '<ol class="st-cards">' + shown.map(card).join("") + "</ol>"; return; }

    // settimana o prossime: divise per giorno
    var days = {}; shown.forEach(function (b) { (days[b.data] = days[b.data] || []).push(b); });
    $("#st-list").innerHTML = Object.keys(days).sort().map(function (d) {
      var all = inRange.filter(function (b) { return b.data === d; }), tt = totals(all), dn = dayName(d);
      return '<section class="st-dayblock"><h2><button type="button" data-go="' + d + '">' + esc(cap((dn ? dn + ", " : "") + label(d))) + '</button>' +
        '<span><b class="c-ok">' + tt.ok.p + ' confermati</b>' + (tt.pending.n ? ' · <b class="c-pe">' + tt.pending.n + ' da decidere</b>' : "") + "</span></h2>" +
        '<ol class="st-cards">' + days[d].map(card).join("") + "</ol></section>";
    }).join("");
  }

  function card(b) {
    var cls = CLS[b.stato] || "pending", wa = String(b.telefono).replace(/\D/g, "");
    var bday = b.compleanno && b.compleanno === b.data.slice(8, 10) + "/" + b.data.slice(5, 7);
    var visits = b.storico && b.storico.accettate > 1 ? '<span class="st-chip">' + b.storico.accettate + "ª volta da noi</span>" : (b.storico && b.storico.richieste <= 1 ? '<span class="st-chip">prima volta</span>' : "");
    var who = b.stato === "In attesa" ? "da decidere su Telegram" : (b.stato === "Accettata" ? "accettata" : "rifiutata") + (b.decisoDa ? " da " + esc(b.decisoDa) : "") + (b.decisoIl ? " alle " + esc(String(b.decisoIl).slice(11, 16)) : "");
    return '<li class="st-card ' + cls + '">' +
      '<div class="st-time">' + esc(b.ora) + '<small>' + esc(b.persone) + ' pers.</small></div>' +
      '<div class="st-body"><div class="st-head"><h3>' + esc(b.nome) + '</h3><span class="st-state">' + esc(b.stato) + '</span></div>' +
      '<p class="st-what">' + esc(MOM[b.momento] || b.momento) + " · " + esc(DOVE[b.dove] || b.dove) + "</p>" +
      (b.note ? '<p class="st-note">' + esc(b.note) + "</p>" : "") +
      '<div class="st-meta">' + (bday ? '<span class="st-chip bday">compie gli anni oggi</span>' : "") + visits +
      '<a href="tel:' + esc(b.telefono) + '">' + esc(telTxt(b.telefono)) + '</a><a href="https://wa.me/' + wa + '" target="_blank" rel="noopener">WhatsApp</a>' +
      '<span class="st-who">#' + esc(b.id) + " · " + who + "</span></div></div></li>";
  }

  function set(v, d) { view = v; if (d) day = d; render(); load(); }
  function start() {
    show("#st-app"); view = "giorno"; day = tonight(); render(); load();
    clearInterval(timer); timer = setInterval(function () { load(true); }, 60000);
  }

  $("#st-login-form").addEventListener("submit", function (e) {
    e.preventDefault(); pin = $("#st-pin").value.trim(); if (!pin) return;
    if ($("#st-remember").checked) store.set("bonora-pin", pin);
    $("#st-pin-err").hidden = true; start();
  });
  $("#st-logout").addEventListener("click", function () { store.del("bonora-pin"); pin = ""; clearInterval(timer); show("#st-login"); });
  $("#st-views").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var t = tonight(), v = b.getAttribute("data-v");
    if (v === "stasera") set("giorno", t);
    else if (v === "domani") set("giorno", shift(t, 1));
    else if (v === "sett") set("settimana", t);
    else if (v === "prossima") set("settimana", shift(monday(t), 7));
    else set("prossime");
  });
  $("#st-prev").addEventListener("click", function () { set(view, shift(day, view === "giorno" ? -1 : -7)); });
  $("#st-next").addEventListener("click", function () { set(view, shift(day, view === "giorno" ? 1 : 7)); });
  $("#st-date").addEventListener("change", function () { if (this.value) set(view === "prossime" ? "giorno" : view, this.value); });
  $("#st-filter").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; filter = b.getAttribute("data-f"); render(); });
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("button[data-go]"); if (!b) return; set("giorno", b.getAttribute("data-go")); window.scrollTo(0, 0); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden && day && (pin || DEMO)) load(true); });

  if (DEMO || pin) start(); else show("#st-login");
})();
