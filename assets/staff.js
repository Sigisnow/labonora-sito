/* La Bonora — dashboard prenotazioni per lo staff.
   Legge dal servizio Google (window.BONORA_API) con il codice staff. Senza servizio mostra dati di esempio. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var API = window.BONORA_API, DEMO = !API;
  var GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  var MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  var MOM = { aperitivo: "Aperitivo", cena: "Cena", dopocena: "Dopocena", tutto: "Serata intera" };
  var DOVE = { dentro: "Dentro", fuori: "Fuori, patio", indifferente: "Dentro o fuori" };
  var CLS = { "In attesa": "pending", "Accettata": "ok", "Rifiutata": "no" };
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
                del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };

  var pin = store.get("bonora-pin") || "", day = null, filter = "tutte", data = [], timer = null;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function shift(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function romeNow() {
    var o = {}; new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false })
      .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { date: o.year + "-" + o.month + "-" + o.day, hour: +o.hour % 24 };
  }
  /* alle 01:00 si lavora ancora sulla serata di ieri */
  function tonight() { var n = romeNow(); return n.hour < 5 ? shift(n.date, -1) : n.date; }
  function telTxt(t) { var m = /^\+39(\d{3})(\d{3})(\d+)$/.exec(t); return m ? m[1] + " " + m[2] + " " + m[3] : t; }
  function label(s) { var d = parse(s); return GIORNI[d.getDay()] + " " + d.getDate() + " " + MESI[d.getMonth()]; }

  function show(id) { ["#st-login", "#st-app"].forEach(function (x) { $(x).hidden = x !== id; }); $("#st-logout").hidden = id !== "#st-app" || DEMO; }

  function demoData() {
    var t = tonight(), t1 = shift(t, 1);
    return [
      { id: 41, data: t, ora: "19:30", nome: "Giulia Ferri", telefono: "+393331112233", email: "giulia@example.com", persone: 4, momento: "aperitivo", dove: "fuori", note: "", stato: "Accettata", decisoDa: "Flavio", decisoIl: t + " 16:02", compleanno: "", storico: { richieste: 3, accettate: 3 } },
      { id: 43, data: t, ora: "20:30", nome: "Marco Rinaldi", telefono: "+393401234567", email: "", persone: 2, momento: "cena", dove: "dentro", note: "Anniversario, tavolo tranquillo", stato: "Accettata", decisoDa: "Flavio", decisoIl: t + " 17:40", compleanno: "", storico: { richieste: 1, accettate: 1 } },
      { id: 44, data: t, ora: "21:00", nome: "Sara Conti", telefono: "+393387654321", email: "sara@example.com", persone: 6, momento: "cena", dove: "indifferente", note: "Una persona celiaca", stato: "In attesa", decisoDa: "", decisoIl: "", compleanno: t.slice(8, 10) + "/" + t.slice(5, 7), storico: { richieste: 2, accettate: 1 } },
      { id: 45, data: t, ora: "21:30", nome: "Luca Bianchi", telefono: "+393209988776", email: "", persone: 12, momento: "tutto", dove: "dentro", note: "Addio al celibato", stato: "Rifiutata", decisoDa: "Flavio", decisoIl: t + " 18:15", compleanno: "", storico: { richieste: 1, accettate: 0 } },
      { id: 46, data: t, ora: "22:30", nome: "Andrea Russo", telefono: "+393475551234", email: "andrea@example.com", persone: 3, momento: "dopocena", dove: "fuori", note: "", stato: "In attesa", decisoDa: "", decisoIl: "", compleanno: "", storico: { richieste: 1, accettate: 0 } },
      { id: 47, data: t1, ora: "21:00", nome: "Elisa Marino", telefono: "+393351239876", email: "", persone: 2, momento: "cena", dove: "dentro", note: "", stato: "In attesa", decisoDa: "", decisoIl: "", compleanno: "", storico: { richieste: 1, accettate: 0 } }
    ];
  }

  function load(quiet) {
    if (!quiet) $("#st-list").innerHTML = '<li class="st-empty">Carico…</li>';
    if (DEMO) { data = demoData(); render(); stamp(); return; }
    var url = API + "?action=list&pin=" + encodeURIComponent(pin) + "&from=" + day + "&to=" + shift(day, 30) + "&t=" + Date.now();
    fetch(url).then(function (r) { return r.json(); }).then(function (res) {
      if (!res.ok && res.error === "pin") { store.del("bonora-pin"); pin = ""; show("#st-login"); $("#st-pin-err").hidden = false; return; }
      if (!res.ok) throw new Error(res.error);
      data = res.prenotazioni || []; render(); stamp();
    }).catch(function () { $("#st-upd").textContent = "Connessione assente: riprovo tra un minuto."; if (!quiet) $("#st-list").innerHTML = '<li class="st-empty">Non riesco a leggere le prenotazioni. Controlla la connessione.</li>'; });
  }
  function stamp() { var d = new Date(); $("#st-upd").textContent = (DEMO ? "Anteprima con prenotazioni di esempio · " : "") + "Aggiornato alle " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + " · si aggiorna da solo ogni minuto"; }

  function render() {
    var list = data.filter(function (b) { return b.data === day; });
    var sum = function (st) { var l = list.filter(function (b) { return b.stato === st; }); return { n: l.length, p: l.reduce(function (a, b) { return a + (+b.persone || 0); }, 0) }; };
    var a = sum("In attesa"), o = sum("Accettata"), r = sum("Rifiutata");
    $("#st-day").textContent = (day === tonight() ? "Stasera, " : "") + label(day);
    $("#st-sum").innerHTML =
      '<div class="ok"><b>' + o.p + '</b><span>coperti confermati</span><small>' + o.n + (o.n === 1 ? " tavolo" : " tavoli") + '</small></div>' +
      '<div class="pending"><b>' + a.p + '</b><span>in attesa</span><small>' + a.n + (a.n === 1 ? " richiesta" : " richieste") + '</small></div>' +
      '<div class="no"><b>' + r.n + '</b><span>rifiutate</span><small>' + r.p + ' persone</small></div>';
    var later = data.filter(function (b) { return b.data > day && b.stato === "In attesa"; });
    $("#st-later").innerHTML = later.length ? "Ci sono anche <b>" + later.length + "</b> " + (later.length === 1 ? "richiesta" : "richieste") + " in attesa nei prossimi giorni: " +
      later.slice(0, 6).map(function (b) { return '<button type="button" data-go="' + b.data + '">' + esc(label(b.data)) + ", " + esc(b.ora) + "</button>"; }).join(" ") : "";
    $$("#st-filter button").forEach(function (bt) { bt.setAttribute("aria-pressed", bt.getAttribute("data-f") === filter ? "true" : "false"); });
    var shown = list.filter(function (b) { return filter === "tutte" || CLS[b.stato] === filter; });
    $("#st-list").innerHTML = shown.length ? shown.map(card).join("") : '<li class="st-empty">' + (list.length ? "Nessuna prenotazione con questo filtro." : "Nessuna prenotazione per questa serata.") + "</li>";
  }

  function card(b) {
    var cls = CLS[b.stato] || "pending", wa = String(b.telefono).replace(/\D/g, "");
    var bday = b.compleanno && b.compleanno === b.data.slice(8, 10) + "/" + b.data.slice(5, 7);
    var visits = b.storico && b.storico.accettate > 1 ? '<span class="st-chip">' + b.storico.accettate + "ª volta da noi</span>" : (b.storico && b.storico.richieste <= 1 ? '<span class="st-chip">prima volta</span>' : "");
    var who = b.stato === "In attesa" ? "da decidere su Telegram" : (b.stato === "Accettata" ? "accettata" : "rifiutata") + (b.decisoDa ? " da " + esc(b.decisoDa) : "") + (b.decisoIl ? " alle " + esc(String(b.decisoIl).slice(11, 16)) : "");
    return '<li class="st-card ' + cls + '">' +
      '<div class="st-time">' + esc(b.ora) + '<small>' + esc(b.persone) + (b.persone == 1 ? " pers." : " pers.") + '</small></div>' +
      '<div class="st-body"><div class="st-head"><h3>' + esc(b.nome) + '</h3><span class="st-state">' + esc(b.stato) + '</span></div>' +
      '<p class="st-what">' + esc(MOM[b.momento] || b.momento) + " · " + esc(DOVE[b.dove] || b.dove) + "</p>" +
      (b.note ? '<p class="st-note">' + esc(b.note) + "</p>" : "") +
      '<div class="st-meta">' + (bday ? '<span class="st-chip bday">compie gli anni oggi</span>' : "") + visits +
      '<a href="tel:' + esc(b.telefono) + '">' + esc(telTxt(b.telefono)) + '</a><a href="https://wa.me/' + wa + '" target="_blank" rel="noopener">WhatsApp</a>' +
      '<span class="st-who">#' + esc(b.id) + " · " + who + "</span></div></div></li>";
  }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  function go(d) { day = d; $("#st-date").value = d; render(); }
  function start() {
    show("#st-app"); go(tonight()); load();
    clearInterval(timer); timer = setInterval(function () { load(true); }, 60000);
  }

  $("#st-login-form").addEventListener("submit", function (e) {
    e.preventDefault(); pin = $("#st-pin").value.trim(); if (!pin) return;
    if ($("#st-remember").checked) store.set("bonora-pin", pin);
    $("#st-pin-err").hidden = true; start();
  });
  $("#st-logout").addEventListener("click", function () { store.del("bonora-pin"); pin = ""; clearInterval(timer); show("#st-login"); });
  $("#st-prev").addEventListener("click", function () { go(shift(day, -1)); load(); });
  $("#st-next").addEventListener("click", function () { go(shift(day, 1)); load(); });
  $("#st-today").addEventListener("click", function () { go(tonight()); load(); });
  $("#st-date").addEventListener("change", function () { if (this.value) { go(this.value); load(); } });
  $("#st-filter").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; filter = b.getAttribute("data-f"); render(); });
  $("#st-later").addEventListener("click", function (e) { var b = e.target.closest("button[data-go]"); if (!b) return; go(b.getAttribute("data-go")); load(); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden && day && (pin || DEMO)) load(true); });

  if (DEMO || pin) start(); else show("#st-login");
})();
