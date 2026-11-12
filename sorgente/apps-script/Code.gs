/**
 * La Bonora — prenotazioni, avvisi Telegram, anagrafica clienti.
 *
 * Vive dentro il foglio Google "La Bonora · Prenotazioni" (Estensioni > Apps Script).
 * Proprietà dello script (Impostazioni progetto > Proprietà script):
 *   TELEGRAM_TOKEN   il token del bot, dato da @BotFather
 *   STAFF_PIN        il codice per la dashboard e per collegare Telegram (almeno 6 cifre)
 * Da eseguire a mano, una volta:
 *   1. setup()            crea i fogli, i colori e le chiavi interne
 *   2. (Distribuisci > Nuova distribuzione > App web, esegui come Me, accesso Chiunque)
 *   3. collegaTelegram()  dice a Telegram dove mandare i tasti Accetta / Rifiuta
 */

var TZ = "Europe/Rome";
var FOGLIO_P = "Prenotazioni", FOGLIO_C = "Clienti";
var COL_P = ["ID", "Ricevuta", "Data", "Ora", "Nome", "Telefono", "Email", "Persone", "Momento", "Dove", "Note", "Stato", "Deciso da", "Deciso il", "Compleanno", "Marketing", "Fonte", "Telegram"];
var COL_C = ["Telefono", "Nome", "Email", "Compleanno", "Marketing", "Consenso il", "Primo contatto", "Ultima richiesta", "Ultima visita", "Richieste", "Accettate", "Rifiutate"];
var STATO = { attesa: "In attesa", ok: "Accettata", no: "Rifiutata" };
var LOCALE = { nome: "La Bonora", indirizzo: "Largo Appio Claudio 344/348, Roma", tel: "06 8837 6508", waTxt: "349 506 9530", email: "info@labonora.it" };
var MOMENTI = { aperitivo: "Aperitivo", cena: "Cena", dopocena: "Dopocena", tutto: "Serata intera" };
var DOVE = { dentro: "dentro", fuori: "fuori nel patio", indifferente: "dentro o fuori" };
var GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
var MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

/* ---------------- impostazione ---------------- */

function setup() {
  var p = props(), book = SpreadsheetApp.getActiveSpreadsheet();
  p.setProperty("SHEET_ID", book.getId());
  if (!p.getProperty("WEBHOOK_SECRET")) p.setProperty("WEBHOOK_SECRET", Utilities.getUuid().replace(/-/g, ""));
  if (!p.getProperty("STAFF_PIN")) p.setProperty("STAFF_PIN", String(Math.floor(100000 + Math.random() * 900000)));
  if (!p.getProperty("ULTIMO_ID")) p.setProperty("ULTIMO_ID", "0");

  var sp = foglio(book, FOGLIO_P, COL_P), sc = foglio(book, FOGLIO_C, COL_C);
  // tutto testo, tranne le persone e i contatori: così telefoni e date non vengono "corretti" da Fogli
  sp.getRange("A:Q").setNumberFormat("@"); sp.getRange("H:H").setNumberFormat("0");
  sc.getRange("A:I").setNumberFormat("@"); sc.getRange("J:L").setNumberFormat("0");
  [70, 120, 90, 55, 160, 130, 190, 70, 100, 110, 220, 95, 90, 120, 85, 80, 60, 120].forEach(function (w, i) { sp.setColumnWidth(i + 1, w); });

  // righe colorate per stato: gialla in attesa, verde accettata, rossa rifiutata
  var r = sp.getRange("A2:R"), col = "$L2";
  sp.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied("=" + col + "=\"" + STATO.attesa + "\"").setBackground("#FBF1CF").setRanges([r]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied("=" + col + "=\"" + STATO.ok + "\"").setBackground("#DCEFE2").setRanges([r]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied("=" + col + "=\"" + STATO.no + "\"").setBackground("#F6D9D6").setRanges([r]).build()
  ]);
  var vuoto = book.getSheetByName("Foglio1") || book.getSheetByName("Sheet1");
  if (vuoto && vuoto.getLastRow() === 0 && book.getSheets().length > 2) book.deleteSheet(vuoto);
  Logger.log("Fatto. Codice staff (STAFF_PIN): " + p.getProperty("STAFF_PIN"));
}

function collegaTelegram() {
  var url = prop("WEBAPP_URL") || ScriptApp.getService().getUrl();
  if (!url || !/\/exec$/.test(url)) throw new Error("Prima distribuisci come App web, poi copia l'URL che finisce con /exec nella proprietà WEBAPP_URL.");
  if (!prop("TELEGRAM_TOKEN")) throw new Error("Manca la proprietà TELEGRAM_TOKEN.");
  var res = tg("setWebhook", { url: url + "?tg=" + prop("WEBHOOK_SECRET"), allowed_updates: ["message", "callback_query"], drop_pending_updates: true });
  Logger.log(JSON.stringify(res));
  Logger.log("Ora scrivete al bot: /collega " + prop("STAFF_PIN"));
}

function foglio(book, nome, cols) {
  var s = book.getSheetByName(nome) || book.insertSheet(nome);
  s.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight("bold").setBackground("#1E3A2B").setFontColor("#EEE8DD");
  s.setFrozenRows(1);
  return s;
}

/* ---------------- ingresso: sito e Telegram ---------------- */

function doPost(e) {
  if (e && e.parameter && e.parameter.tg) {
    // risposta HtmlService: Telegram riceve un 200 diretto (con ContentService riceverebbe un rinvio)
    try { if (e.parameter.tg === prop("WEBHOOK_SECRET")) telegram(JSON.parse(e.postData.contents)); } catch (err) { console.error(err); }
    return HtmlService.createHtmlOutput("ok");
  }
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (d.action === "book") return json(prenota(d));
    return json({ ok: false, error: "Richiesta non valida." });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "Errore del server." });
  }
}

function doGet(e) {
  var q = (e && e.parameter) || {};
  if (q.action === "list") {
    if (!pinOk(q.pin)) return json({ ok: false, error: "pin" });
    return json({ ok: true, oggi: serata(), prenotazioni: elenco(q.from, q.to) });
  }
  return json({ ok: true, servizio: "La Bonora prenotazioni" });
}

function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------------- nuova prenotazione dal sito ---------------- */

function prenota(d) {
  if (d.hp) return { ok: true, id: 0 }; // campo trappola compilato: è un robot, facciamo finta di niente
  var nome = pulisci(d.nome, 60), tel = normTel(d.telefono), email = pulisci(d.email, 120).toLowerCase();
  var persone = parseInt(d.persone, 10), data = String(d.data || ""), ora = String(d.ora || "");
  var errori = [];
  if (nome.length < 2) errori.push("nome");
  if (!/^\+\d{8,15}$/.test(tel)) errori.push("telefono");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errori.push("email");
  if (!(persone >= 1 && persone <= 40)) errori.push("persone");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data < serataData(new Date()) || data > piuGiorni(serataData(new Date()), 366)) errori.push("data");
  if (!/^\d{1,2}:\d{2}$/.test(ora)) errori.push("ora");
  if (d.privacy !== true) errori.push("privacy");
  if (errori.length) return { ok: false, error: "Controlla: " + errori.join(", ") + "." };

  var cache = CacheService.getScriptCache(), k = "rl:" + tel, n = +(cache.get(k) || 0);
  if (n >= 4) return { ok: false, error: "Troppe richieste ravvicinate: scrivici su WhatsApp." };
  cache.put(k, String(n + 1), 900);

  var b = {
    nome: nome, telefono: tel, email: email, persone: persone, data: data, ora: ora,
    momento: MOMENTI[d.momento] ? d.momento : "tutto", dove: DOVE[d.dove] ? d.dove : "indifferente",
    note: pulisci(d.note, 500), compleanno: compleanno(d.compleanno), marketing: d.mkt === true, fonte: "sito", stato: STATO.attesa, decisoDa: "", decisoIl: ""
  };

  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  var visite;
  try {
    var p = props(); b.id = +(p.getProperty("ULTIMO_ID") || 0) + 1; p.setProperty("ULTIMO_ID", String(b.id));
    b.ricevuta = adesso();
    var sp = libro().getSheetByName(FOGLIO_P);
    var riga = [String(b.id), b.ricevuta, b.data, b.ora, b.nome, b.telefono, b.email, b.persone, b.momento, b.dove, b.note, STATO.attesa, "", "", b.compleanno, b.marketing ? "Sì" : "No", b.fonte, ""];
    sp.appendRow(riga);
    visite = cliente(b);
  } finally { lock.releaseLock(); }

  try { avvisa(b, visite); } catch (err) { console.error("Telegram: " + err); }
  return { ok: true, id: b.id };
}

/* aggiorna o crea il cliente; restituisce quante richieste ha fatto prima di questa */
function cliente(b) {
  var sc = libro().getSheetByName(FOGLIO_C);
  var f = sc.getRange("A:A").createTextFinder(b.telefono).matchEntireCell(true).findNext();
  var oggi = adesso().slice(0, 10);
  if (!f) {
    sc.appendRow([b.telefono, b.nome, b.email, b.compleanno, b.marketing ? "Sì" : "No", b.marketing ? oggi : "", oggi, b.data, "", 1, 0, 0]);
    return 0;
  }
  var r = f.getRow(), v = sc.getRange(r, 1, 1, COL_C.length).getValues()[0];
  var prima = +v[9] || 0;
  v[1] = b.nome;
  if (b.email) v[2] = b.email;
  if (b.compleanno) v[3] = b.compleanno;
  if (b.marketing && v[4] !== "Sì") { v[4] = "Sì"; v[5] = oggi; } // un consenso si aggiunge, non si toglie per una casella lasciata vuota
  if (b.data > String(v[7])) v[7] = b.data;
  v[9] = prima + 1;
  sc.getRange(r, 1, 1, COL_C.length).setValues([v]);
  return prima;
}

/* ---------------- decisione: Accetta / Rifiuta ---------------- */

function decidi(id, stato, chi) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  var b;
  try {
    var sp = libro().getSheetByName(FOGLIO_P);
    var f = sp.getRange("A:A").createTextFinder(String(id)).matchEntireCell(true).findNext();
    if (!f) return { ok: false, msg: "Prenotazione non trovata" };
    var r = f.getRow(), v = sp.getRange(r, 1, 1, COL_P.length).getValues()[0];
    b = daRiga(v);
    if (b.stato !== STATO.attesa) return { ok: false, msg: "Già " + b.stato.toLowerCase() + (b.decisoDa ? " da " + b.decisoDa : ""), b: b };
    b.stato = stato; b.decisoDa = chi; b.decisoIl = adesso();
    sp.getRange(r, 12, 1, 3).setValues([[b.stato, b.decisoDa, b.decisoIl]]);
    var sc = libro().getSheetByName(FOGLIO_C);
    var fc = sc.getRange("A:A").createTextFinder(b.telefono).matchEntireCell(true).findNext();
    if (fc) {
      var rc = fc.getRow();
      if (stato === STATO.ok) { sc.getRange(rc, 11).setValue((+sc.getRange(rc, 11).getValue() || 0) + 1); if (b.data > String(sc.getRange(rc, 9).getValue())) sc.getRange(rc, 9).setValue(b.data); }
      else sc.getRange(rc, 12).setValue((+sc.getRange(rc, 12).getValue() || 0) + 1);
    }
  } finally { lock.releaseLock(); }
  try { mailCliente(b); } catch (err) { console.error("Email: " + err); }
  return { ok: true, b: b };
}

function mailCliente(b) {
  if (!b.email) return;
  var quando = quandoTxt(b.data) + " alle " + b.ora;
  var firma = "<p>A presto,<br>La Bonora · Laboratorio di Cibi e Alcolici<br>" + LOCALE.indirizzo + "<br>WhatsApp " + LOCALE.waTxt + " · Tel. " + LOCALE.tel + "</p>";
  var ok = b.stato === STATO.ok;
  var oggetto = ok ? "Tavolo confermato · La Bonora, " + quando : "La tua richiesta a La Bonora, " + quando;
  var corpo = ok
    ? "<p>Ciao " + esc(b.nome) + ",</p><p>il tuo tavolo è confermato: <b>" + quando + "</b>, " + b.persone + (b.persone == 1 ? " persona" : " persone") + ", " + MOMENTI[b.momento].toLowerCase() + ", " + DOVE[b.dove] + ".</p><p>Se cambia qualcosa scrivici su WhatsApp al " + LOCALE.waTxt + " o chiama lo " + LOCALE.tel + ".</p>"
    : "<p>Ciao " + esc(b.nome) + ",</p><p>ci dispiace: per " + quando + " non abbiamo posto.</p><p>Scrivici su WhatsApp al " + LOCALE.waTxt + ": proviamo a trovarti un altro orario.</p>";
  MailApp.sendEmail({ to: b.email, subject: oggetto, htmlBody: corpo + firma, name: "La Bonora", replyTo: LOCALE.email });
}

/* ---------------- Telegram ---------------- */

function avvisa(b, visite) {
  var chats = chatList(); if (!chats.length || !prop("TELEGRAM_TOKEN")) return;
  var ids = [];
  chats.forEach(function (c) {
    var res = tg("sendMessage", { chat_id: c, text: testoTg(b, visite), parse_mode: "HTML", disable_web_page_preview: true, reply_markup: tasti(b) });
    if (res && res.ok) ids.push(c + ":" + res.result.message_id);
  });
  if (ids.length) {
    var sp = libro().getSheetByName(FOGLIO_P);
    var f = sp.getRange("A:A").createTextFinder(String(b.id)).matchEntireCell(true).findNext();
    if (f) sp.getRange(f.getRow(), 18).setValue(ids.join("|"));
  }
}

function telegram(u) {
  var cache = CacheService.getScriptCache();
  if (cache.get("u:" + u.update_id)) return; // stesso aggiornamento già gestito
  cache.put("u:" + u.update_id, "1", 21600);

  if (u.callback_query) {
    var cq = u.callback_query, chat = String(cq.message.chat.id);
    if (chatList().indexOf(chat) < 0) { tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Chat non autorizzata" }); return; }
    var m = /^(a|r):(\d+)$/.exec(cq.data || "");
    if (!m) { tg("answerCallbackQuery", { callback_query_id: cq.id }); return; }
    var chi = [cq.from.first_name, cq.from.last_name].filter(Boolean).join(" ") || "staff";
    var res = decidi(+m[2], m[1] === "a" ? STATO.ok : STATO.no, chi);
    tg("answerCallbackQuery", { callback_query_id: cq.id, text: res.ok ? (res.b.stato === STATO.ok ? "Accettata ✅" : "Rifiutata ❌") : res.msg, show_alert: !res.ok });
    if (res.b) aggiornaMessaggi(res.b);
    return;
  }

  var msg = u.message; if (!msg || !msg.text) return;
  var c = String(msg.chat.id), t = msg.text.trim(), autorizzata = chatList().indexOf(c) >= 0;
  var mc = /^\/collega(?:@\w+)?\s+(\S+)/.exec(t);
  if (mc) {
    var kk = "try:" + c, tent = +(cache.get(kk) || 0);
    if (tent >= 5) { reply(c, "Troppi tentativi, riprova tra un'ora."); return; }
    if (mc[1] === prop("STAFF_PIN")) { var l = chatList(); if (l.indexOf(c) < 0) { l.push(c); props().setProperty("CHATS", JSON.stringify(l)); } reply(c, "✅ Collegato. Da ora le nuove prenotazioni arrivano qui.\n/oggi per vedere quelle di stasera."); }
    else { cache.put(kk, String(tent + 1), 3600); reply(c, "Codice sbagliato."); }
    return;
  }
  if (/^\/oggi/.test(t) && autorizzata) { reply(c, riepilogo(serata())); return; }
  if (/^\/scollega/.test(t) && autorizzata) { props().setProperty("CHATS", JSON.stringify(chatList().filter(function (x) { return x !== c; }))); reply(c, "Scollegato."); return; }
  if (/^\/start/.test(t) || !autorizzata) { reply(c, autorizzata ? "Sei già collegato. /oggi per le prenotazioni di stasera." : "Ciao! Per ricevere le prenotazioni de La Bonora scrivi /collega seguito dal codice staff."); }
}

function aggiornaMessaggi(b) {
  String(b.tg || "").split("|").filter(Boolean).forEach(function (x) {
    var p = x.split(":");
    tg("editMessageText", { chat_id: p[0], message_id: +p[1], text: testoTg(b), parse_mode: "HTML", disable_web_page_preview: true, reply_markup: tasti(b) });
  });
}

function testoTg(b, visite) {
  var pallino = b.stato === STATO.ok ? "🟢" : b.stato === STATO.no ? "🔴" : "🟡";
  var titolo = b.stato === STATO.ok ? "Accettata" : b.stato === STATO.no ? "Rifiutata" : "Nuova richiesta";
  var righe = [
    pallino + " <b>" + titolo + " #" + b.id + "</b>",
    "<b>" + esc(b.nome) + "</b> · " + b.persone + (b.persone == 1 ? " persona" : " persone"),
    cap(quandoTxt(b.data)) + " · <b>" + b.ora + "</b>",
    MOMENTI[b.momento] + " · " + DOVE[b.dove],
    "📞 " + b.telefono + (b.email ? "\n✉️ " + esc(b.email) : "")
  ];
  if (b.note) righe.push("📝 " + esc(b.note));
  if (b.compleanno) righe.push("🎂 compleanno " + b.compleanno + (compieQuelGiorno(b) ? " · <b>compie gli anni quel giorno</b>" : ""));
  if (visite) righe.push("👤 ha già prenotato " + visite + (visite == 1 ? " volta" : " volte"));
  if (b.stato !== STATO.attesa) righe.push("\n" + (b.stato === STATO.ok ? "✅" : "❌") + " " + b.stato + " da " + esc(b.decisoDa) + " alle " + String(b.decisoIl).slice(11, 16) + (b.email ? " · email inviata" : " · nessuna email, scrivigli su WhatsApp"));
  return righe.join("\n");
}

function tasti(b) {
  var nome = b.nome.split(" ")[0], quando = quandoTxt(b.data) + " alle " + b.ora;
  var testo = b.stato === STATO.ok ? "Ciao " + nome + ", ti confermiamo il tavolo per " + b.persone + " " + quando + " a La Bonora. A presto!"
    : b.stato === STATO.no ? "Ciao " + nome + ", purtroppo " + quando + " siamo al completo. Se vuoi ti proponiamo un altro orario."
    : "Ciao " + nome + ", ti scriviamo da La Bonora per la tua richiesta di " + quando + ".";
  var wa = [{ text: "💬 WhatsApp al cliente", url: "https://wa.me/" + b.telefono.replace(/\D/g, "") + "?text=" + encodeURIComponent(testo) }];
  if (b.stato !== STATO.attesa) return { inline_keyboard: [wa] };
  return { inline_keyboard: [[{ text: "✅ Accetta", callback_data: "a:" + b.id }, { text: "❌ Rifiuta", callback_data: "r:" + b.id }], wa] };
}

function riepilogo(giorno) {
  var l = elenco(giorno, giorno);
  if (!l.length) return "Nessuna prenotazione per " + quandoTxt(giorno) + ".";
  var tot = function (s) { return l.filter(function (b) { return b.stato === s; }).reduce(function (a, b) { return a + (+b.persone || 0); }, 0); };
  return cap(quandoTxt(giorno)) + ": " + tot(STATO.ok) + " coperti confermati, " + tot(STATO.attesa) + " in attesa\n\n" +
    l.map(function (b) { return (b.stato === STATO.ok ? "🟢" : b.stato === STATO.no ? "🔴" : "🟡") + " " + b.ora + "  " + b.nome + " · " + b.persone + " · " + MOMENTI[b.momento].toLowerCase(); }).join("\n");
}

function reply(chat, text) { tg("sendMessage", { chat_id: chat, text: text }); }

function tg(metodo, dati) {
  var r = UrlFetchApp.fetch("https://api.telegram.org/bot" + prop("TELEGRAM_TOKEN") + "/" + metodo, { method: "post", contentType: "application/json", payload: JSON.stringify(dati), muteHttpExceptions: true });
  try { return JSON.parse(r.getContentText()); } catch (e) { return null; }
}

function chatList() { try { return (JSON.parse(prop("CHATS") || "[]") || []).map(String); } catch (e) { return []; } }

/* ---------------- lettura per la dashboard ---------------- */

function elenco(da, a) {
  da = /^\d{4}-\d{2}-\d{2}$/.test(da || "") ? da : serata();
  a = /^\d{4}-\d{2}-\d{2}$/.test(a || "") ? a : da;
  var sp = libro().getSheetByName(FOGLIO_P), n = sp.getLastRow();
  if (n < 2) return [];
  var visite = {};
  var sc = libro().getSheetByName(FOGLIO_C), nc = sc.getLastRow();
  if (nc >= 2) sc.getRange(2, 1, nc - 1, 11).getValues().forEach(function (v) { visite[String(v[0])] = { richieste: +v[9] || 0, accettate: +v[10] || 0 }; });
  return sp.getRange(2, 1, n - 1, COL_P.length).getValues().map(daRiga)
    .filter(function (b) { return b.data >= da && b.data <= a; })
    .map(function (b) { b.storico = visite[b.telefono] || null; delete b.tg; return b; })
    .sort(function (x, y) { return (x.data + pad(x.ora)).localeCompare(y.data + pad(y.ora)); });
}

function daRiga(v) {
  return { id: +v[0], ricevuta: testo(v[1], "yyyy-MM-dd HH:mm"), data: testo(v[2], "yyyy-MM-dd"), ora: testo(v[3], "HH:mm"), nome: String(v[4]), telefono: String(v[5]), email: String(v[6]),
    persone: +v[7] || 0, momento: MOMENTI[v[8]] ? String(v[8]) : "tutto", dove: DOVE[v[9]] ? String(v[9]) : "indifferente", note: String(v[10]), stato: String(v[11]) || STATO.attesa,
    decisoDa: String(v[12]), decisoIl: testo(v[13], "yyyy-MM-dd HH:mm"), compleanno: String(v[14]), marketing: v[15] === "Sì", fonte: String(v[16]), tg: String(v[17]) };
}

/* ---------------- utilità ---------------- */

function props() { return PropertiesService.getScriptProperties(); }
function prop(k) { return props().getProperty(k) || ""; }
function libro() { return SpreadsheetApp.openById(prop("SHEET_ID")); }
function adesso() { return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm"); }
/* la "serata" va dalle 5 del mattino alle 5 del giorno dopo: alle 01:00 è ancora la serata di ieri */
function serataData(d) { return Utilities.formatDate(new Date(d.getTime() - 5 * 3600 * 1000), TZ, "yyyy-MM-dd"); }
function serata() { return serataData(new Date()); }
function piuGiorni(iso, n) { var p = iso.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2] + n, 12); return Utilities.formatDate(d, TZ, "yyyy-MM-dd"); }
function quandoTxt(iso) { var p = String(iso).split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2], 12); return GIORNI[d.getDay()] + " " + (+p[2]) + " " + MESI[+p[1] - 1]; }
function testo(v, f) { return v instanceof Date ? Utilities.formatDate(v, TZ, f) : String(v); }
function pad(o) { return ("0" + o).slice(-5); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function pulisci(s, max) { return String(s == null ? "" : s).replace(/[\u0000-\u001f]+/g, " ").replace(/^[=+\-@]+/, "").trim().slice(0, max); }
function normTel(t) {
  var s = String(t || "").replace(/[^\d+]/g, "");
  if (s.indexOf("00") === 0) s = "+" + s.slice(2);
  if (s.charAt(0) !== "+") s = (/^[03]\d{5,10}$/.test(s) ? "+39" : "+") + s;
  return s;
}
function compleanno(s) {
  var m = /^(\d{1,2})[\/.\-](\d{1,2})$/.exec(String(s || "").trim());
  if (!m || +m[1] < 1 || +m[1] > 31 || +m[2] < 1 || +m[2] > 12) return "";
  return ("0" + m[1]).slice(-2) + "/" + ("0" + m[2]).slice(-2);
}
function compieQuelGiorno(b) { return b.compleanno && b.compleanno === b.data.slice(8, 10) + "/" + b.data.slice(5, 7); }
function pinOk(pin) {
  var c = CacheService.getScriptCache(), fall = +(c.get("pinfail") || 0);
  if (fall >= 30) return false; // troppi tentativi sbagliati: si blocca per 10 minuti
  var ok = !!pin && String(pin) === prop("STAFF_PIN");
  if (!ok) c.put("pinfail", String(fall + 1), 600);
  return ok;
}
