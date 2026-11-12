# Contenuti del sito La Bonora: racconto "Che ti va stasera?" con le tre anime.
import json

SOULS = [  # ordine della serata
    dict(key="conviviale", file="conviviale.html", name="La Conviviale", moment="L'aperitivo", want="Un aperitivo", short="aperitivo",
         line="Stasera mi va qualcosa di sfizioso, e un bicchiere in compagnia.",
         motto="Nella giungla dovrai stare finché un 5 o un 8 non compare.", photo="conviviale-sala", theme="wine"),
    dict(key="salotto", file="salotto.html", name="Il Salotto", moment="La cena", want="Una cena", short="cena",
         line="Stasera mi va di sedermi a tavola e mangiare bene.",
         motto="In amore e in cucina, ciò che è fatto troppo in fretta è fatto male.", photo="salotto-sala", theme="paper"),
    dict(key="giungla", file="giungla.html", name="La Giungla", moment="Il dopocena", want="Un drink", short="dopocena",
         line="Stasera mi va un bel drink, e di fare tardi.",
         motto="Il bere vince sempre sul male.", photo="giungla-sala", theme="ink"),
]
OTHER = [("menu.html", "Menu"), ("locale.html", "Il locale"), ("eventi.html", "Eventi")]

def photo(name, alt, cap=None, pos="center", sizes="(max-width:760px) 100vw, 50vw", cls="", style=""):
    c = f'<figcaption>{cap}</figcaption>' if cap else ""
    st = f' style="{style}"' if style else ""
    return (f'<figure class="photo {cls}"{st}><img src="img/{name}-s.jpg" srcset="img/{name}-s.jpg 800w, img/{name}.jpg 1600w" '
            f'sizes="{sizes}" alt="{alt}" loading="lazy" decoding="async" style="object-position:{pos}">{c}</figure>')

def header(cur):
    want = "".join(f'<a href="{s["file"]}"{" aria-current=" + chr(34) + "page" + chr(34) if s["file"] == cur else ""}><span>{s["want"]}</span><small>{s["name"]}</small></a>' for s in SOULS)
    other = "".join(f'<a href="{h}"{" aria-current=" + chr(34) + "page" + chr(34) if h == cur else ""}>{t}</a>' for h, t in OTHER)
    return f'''<header class="top"><div class="wrap">
<a class="logo" href="index.html">La Bonora<small>Laboratorio di Cibi e Alcolici</small></a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
<nav class="nav" id="nav" aria-label="Principale"><span class="ask">Che ti va stasera?</span><div class="want">{want}</div>{other}<a class="cta" href="prenota.html"{" aria-current=" + chr(34) + "page" + chr(34) if cur == "prenota.html" else ""}>Prenota</a></nav>
</div></header>'''

FOOTER = f'''<footer class="foot"><div class="wrap">
<div class="foot-grid">
<div><p class="d" style="font-size:44px">La Bonora</p><p class="s it" style="font-size:20px;margin-top:8px">Laboratorio di Cibi e Alcolici. Aperitivo, cena e dopocena a Cinecittà, Roma.</p></div>
<div><h4>Che ti va stasera?</h4><ul>{"".join(f'<li><a href="{s["file"]}">{s["want"]} · {s["name"]}</a></li>' for s in SOULS)}</ul></div>
<div><h4>Il locale</h4><ul><li><a href="menu.html">Menu</a></li><li><a href="locale.html">Il locale</a></li><li><a href="eventi.html">Eventi</a></li><li><a href="famiglia.html">La famiglia</a></li><li><a href="prenota.html">Prenota</a></li></ul></div>
<div><h4>Contatti</h4><ul><li>Largo Appio Claudio 344/348, Roma</li><li>Ogni sera 18:00 – 02:00</li><li><a href="{TEL}">{TEL_TXT}</a></li><li><a href="{WA}">WhatsApp {WA_TXT}</a></li><li><a href="mailto:info@labonora.it">info@labonora.it</a></li><li><a href="https://www.instagram.com/lab_bonora/">@lab_bonora</a></li></ul></div>
</div>
<div class="legal"><span>La Bonora S.r.l. · Largo Appio Claudio 344 · 00174 Roma · P.IVA e C.F. 14928281006 · REA RM-1555959</span><span><a href="privacy.html">Privacy e cookie</a> · La società ha ricevuto nel 2020 aiuti di stato pubblicati sul RNA, sezione trasparenza.</span></div>
</div></footer>
<nav class="actionbar" aria-label="Azioni rapide"><a class="fill" href="prenota.html">Prenota</a><a href="{WA}">WhatsApp</a><a href="{TEL}">Chiama</a></nav>'''

PAGES = {}
def page(path, title, desc, body, extra=""):
    PAGES[path] = (head(title, desc, path, extra), header(path) + "<main>" + body + "</main>" + FOOTER)

def big_title(t, lead):
    return f'''<section style="padding-block:44px 24px;border-bottom:var(--rule);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:16px 40px">
<h1 class="d" style="font-size:clamp(72px,13vw,170px)">{t}</h1><p class="lead" style="max-width:420px">{lead}</p></section>'''

# ---------------- HOME ----------------
souls_cards = "".join(f'''<a class="soul" href="{s["file"]}">{photo(s["photo"], s["name"] + ", " + s["moment"].lower(), sizes="(max-width:900px) 100vw, 33vw")}
<p class="kick wine"><span class="n">{i+1}</span> · {s["moment"]}</p><p class="want-line">{s["line"]}</p><h3 class="d">{s["name"]}</h3><p class="motto">“{s["motto"]}”</p><span class="go">Scopri {s["name"]} →</span></a>''' for i, s in enumerate(SOULS))

page("index.html", "La Bonora · Cocktail bar e cucina a Cinecittà",
     "La Bonora, Laboratorio di Cibi e Alcolici a Cinecittà, Tuscolana: aperitivo, cena e cocktail bar fino alle 02. Tre anime in un solo locale, a Largo Appio Claudio.",
     f'''
<section class="entrance" aria-label="L'ingresso"><div class="wrap">
<figure class="photo hero-photo"><img src="img/ingresso-sera.jpg" srcset="img/ingresso-sera-s.jpg 800w, img/ingresso-sera.jpg 1600w" sizes="100vw" alt="L'insegna verde de La Bonora tra le luci" fetchpriority="high"></figure>
<div class="entrance-text">
<h1 class="d">Entra<br>alla Bonora</h1>
<div class="side">
<p class="lead">Alla Bonora mettiamo al centro il gusto e la qualità: materie prime selezionate, distillati di prima scelta e passione in ogni dettaglio.</p>
<div class="btns"><a class="btn fill" href="prenota.html">Prenota un tavolo</a><a class="btn" href="#anime">Che ti va stasera?</a></div>
</div>
</div>
<div class="facts">
<div><p class="kick">Stasera</p><p class="v" data-open-now>Ogni sera 18:00 – 02:00</p></div>
<div><p class="kick">Dove</p><p class="v">Largo Appio Claudio 344/348</p></div>
<div><p class="kick">Telefono</p><p class="v"><a href="{TEL}" style="text-decoration:none">{TEL_TXT}</a></p></div>
<div><p class="kick">WhatsApp</p><p class="v"><a href="{WA}" style="text-decoration:none">{WA_TXT}</a></p></div>
</div>
</div></section>

<section class="sec" id="anime" aria-labelledby="anime-h"><div class="wrap">
<div class="sec-head"><h2 class="d" id="anime-h">Che ti va stasera?</h2><p class="lead">Le tre anime della Bonora, una dopo l'altra, dalle 18 alle 02. Scegli tu da dove cominciare.</p></div>
<div class="souls">{souls_cards}</div>
</div></section>

<section class="sec" aria-labelledby="lab-h"><div class="wrap">
<div class="split">
{photo("bancone", "Il bancone verde de La Bonora con la bottigliera", pos="center 60%")}
<div>
<p class="kick wine">Il Lab</p>
<h2 class="d" id="lab-h" style="font-size:clamp(48px,7vw,84px);margin:8px 0 24px">Un vero laboratorio di cibi e alcolici</h2>
<div class="body">
<p>Prodotti di alta qualità incontrano l'estro dei nostri chef e dei nostri bartender. Tutto è fatto in casa, al momento: dai primi della tradizione romana ai burger, dai liquori infusi ai drink affumicati sotto la campana.</p>
<p>Al centro c'è il bancone, con la bottigliera alle spalle e la cucina a vista. Fuori, il patio sulla piazza di Largo Appio Claudio, con i funghi di calore per l'inverno. Piatti light, vegani, vegetariani e per celiaci.</p>
</div>
<p style="margin-top:24px"><a class="btn" href="locale.html">Scopri il locale</a></p>
</div>
</div>
</div></section>

<section class="sec" aria-label="Dal nostro Instagram"><div class="wrap">
<div class="sec-head"><h2 class="d" style="font-size:clamp(40px,5vw,60px)">@lab_bonora</h2><a class="btn" href="https://www.instagram.com/lab_bonora/">Seguici su Instagram</a></div>
<div class="strip">{photo("spritz","Uno spritz al tavolo",sizes="25vw")}{photo("cornucopia","La Matriciana in cornucopia",sizes="25vw")}{photo("bartender","Il bartender prepara un cocktail",sizes="25vw")}{photo("tartare","Tartare di manzo, pere e nocciole",sizes="25vw")}</div>
</div></section>

<section class="band ink" style="margin-top:72px" aria-labelledby="qr-h"><div class="wrap band-grid">
<div><p class="kick">Al tavolo</p><h2 class="d" id="qr-h" style="margin:8px 0 12px">Il menu è anche qui</h2><p class="s" style="font-size:22px;line-height:1.3">Sul tavolo trovi la carta e un QR: inquadralo per la carta del dopocena, sempre aggiornata.</p></div>
<div class="qr-row"><div class="qr" aria-hidden="true">QR</div><div class="links-col"><a href="menu.html#p-dopocena">Carta del dopocena →</a><a href="menu.html#p-cucina">Menu di cucina →</a><a href="https://www.instagram.com/lab_bonora/">Seguici su Instagram →</a></div></div>
</div></section>
''', extra='\n<meta property="og:image" content="' + SITE + '/img/ingresso-sera.jpg">\n<script type="application/ld+json">' + json.dumps(SCHEMA, ensure_ascii=False) + "</script>")

# ---------------- LE TRE ANIME ----------------
def others_for(key):
    rest = [s for s in SOULS if s["key"] != key]
    return '<nav class="others" aria-label="Le altre anime">' + "".join(
        f'<a href="{s["file"]}"><p class="kick">{s["want"]} · {s["moment"].lower()}</p><p class="d">{s["name"]} →</p></a>' for s in rest) + "</nav>"

def soul_page(key, title, desc, intro, gallery, features, menu_title, menu_lead, extra_section=""):
    s = next(x for x in SOULS if x["key"] == key); i = SOULS.index(s)
    g = photo(gallery[0][0], gallery[0][1], pos=gallery[0][2] if len(gallery[0]) > 2 else "center", sizes="(max-width:760px) 100vw, 66vw") + \
        "".join(photo(p[0], p[1], pos=p[2] if len(p) > 2 else "center", sizes="(max-width:760px) 100vw, 33vw") for p in gallery[1:])
    page(s["file"], title, desc, f'''
<section class="room-hero {s["theme"]}"><div class="wrap">
<p class="kick">{i+1} di 3 · {s["moment"]} · {s["want"]}</p>
<div class="room-hero-grid"><h1 class="d">{s["name"].replace(" ", "<br>", 1)}</h1><div><p class="lead">{s["line"]}</p><p class="s" style="font-size:19px;line-height:1.45;margin-top:14px;opacity:.9">{intro}</p></div></div>
<p class="motto-big">“{s["motto"]}”</p>
</div></section>
<div class="wrap">
<div class="gallery">{g}</div>
<div class="feature-list">{"".join(f'<div><p class="kick wine">{k}</p><h3>{t}</h3><p>{p}</p></div>' for k, t, p in features)}</div>
{extra_section}
<section class="sec" aria-labelledby="carta-h">
<div class="sec-head"><h2 class="d" id="carta-h">{menu_title}</h2><p class="lead">{menu_lead}</p></div>
<div data-menu="sala:{key}" data-cols="3"><p class="note-line">Caricamento del menu…</p></div>
<p class="note-line">Prezzi in euro · i numeri sono gli allergeni, elenco completo nella <a href="menu.html#allergeni">pagina Menu</a> · piatti vegani, vegetariani e senza glutine su richiesta</p>
</section>
<section class="band wine" style="margin-top:64px" aria-label="Prenota"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:24px;padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))">
<div><h2 class="d" style="font-size:clamp(36px,5vw,56px)">Ti va {s["want"].lower()}?</h2><p class="s" style="font-size:21px;margin-top:6px">Prenota il tavolo: dentro o fuori, nel patio.</p></div>
<a class="btn light" href="prenota.html#{s["short"]}">Prenota</a>
</div></section>
{others_for(key)}
</div>''')

soul_page("conviviale", "Aperitivo e apericena a Cinecittà · La Conviviale · La Bonora",
    "L'aperitivo de La Bonora a Cinecittà, Tuscolana: fritti, taglieri e pinse da condividere, un drink e la compagnia giusta. Ogni sera dalle 18.",
    "La Conviviale è l'anima dello stare insieme: quadri alle pareti, musica, tavoli da condividere e qualcosa da mangiare con le mani.",
    [("conviviale-sala", "La sala con il neon e la parete verde", "center 40%"), ("pinsa", "Una pinsa appena sfornata"), ("tagliere", "Un tagliere di salumi e formaggi")],
    [("Da prendere con le mani", "Fritti", "Supplì, montanarine, sfere di bollito e di Camembert."),
     ("Un impasto, molte idee", "Pinse", "Dalla Margherita alla mortadella, burrata e pistacchio."),
     ("Da condividere", "Taglieri", "Salumi e formaggi scelti, per due o per tutto il tavolo.")],
    "Da condividere", "Fritti, antipasti e pinse, da accompagnare con un drink.",
    extra_section='<div class="strip" style="margin-top:16px">' + photo("spritz", "Uno spritz", sizes="25vw") + photo("burger-amici", "Burger, patatine e drink al tavolo", sizes="25vw") + photo("conviviale-parete", "La parete con i quadri pop", sizes="25vw") + photo("tagliere", "Tagliere al tavolo", sizes="25vw", pos="center 30%") + "</div>")

soul_page("salotto", "Cena a Cinecittà, cucina romana e burger · Il Salotto · La Bonora",
    "La cena de La Bonora a Cinecittà: primi della tradizione romana, Matriciana in cornucopia, tartare, burger fatti in casa e dolci. Prenota il tuo tavolo.",
    "Il Salotto è l'anima della casa: la cucina di famiglia, la tradizione romana e i nostri burger, da gustare con calma.",
    [("salotto-sala", "La sala calda, con la lampada e le bottiglie", "center 55%"), ("cornucopia", "La Matriciana in cornucopia"), ("tartare", "Tartare di manzo, pere e nocciole")],
    [("Tradizione", "Primi romani", "Matriciana in cornucopia, fettuccine al ragù di cinghiale."),
     ("Fatti in casa", "Burger", "Otto burger con patatine fritte, anche vegetariani."),
     ("Per finire", "Dolci", "Tiramisù, Tarte Tatin, crema Maria Luisa.")],
    "La cena", "Tradizione romana e nuove idee. Tutti i burger con patatine fritte.",
    extra_section='<div class="strip" style="margin-top:16px">' + photo("burger", "Un burger con patatine", sizes="25vw") + photo("ragu", "Un primo al ragù", sizes="25vw") + photo("tatin", "La Tarte Tatin", sizes="25vw") + photo("pistacchio", "Dolce al pistacchio", sizes="25vw") + "</div>")

soul_page("giungla", "Cocktail bar a Cinecittà aperto fino alle 02 · La Giungla · La Bonora",
    "Il dopocena de La Bonora a Cinecittà: cocktail della casa con infusi fatti da noi, drink affumicati e oltre 600 distillati. Aperti fino alle 02.",
    "La Giungla è l'anima del bancone: piante, luci basse, il divano Chesterfield e una bottigliera di oltre 600 distillati.",
    [("giungla-sala", "La sala verde con le piante e i tavoli", "center 50%"), ("bartender", "Il bartender versa un cocktail"), ("divano", "Il divano Chesterfield sotto la parete verde")],
    [("Fatti da noi", "Liquori e infusi", "Liquore al cetriolo, vodka alle scorze di limone, tequila al basilico, gin al pepe rosa."),
     ("Sotto la campana", "Affumicatura", "Su qualunque cocktail, con la spezia che preferisci."),
     ("Food pairing", "Cocktail e piatto", "Scegli il piatto: il bartender ti prepara il drink che lo esalta.")],
    "Carta del dopocena", "I veri intenditori non bevono drink: degustano segreti.",
    extra_section='<div class="strip" style="margin-top:16px">' + photo("neon-wilde", "Il neon: I can resist anything except temptation", sizes="25vw") + photo("bartender-drink", "Il bartender con i drink pronti", sizes="25vw") + photo("bottiglie", "Bottiglie sul bancone", sizes="25vw") + photo("gorilla", "Il quadro del gorilla", sizes="25vw") + "</div>")

# ---------------- MENU ----------------
page("menu.html", "Menu · La Bonora", "Il menu de La Bonora a Cinecittà: fritti, pinse, primi romani, burger, dolci e la carta del dopocena con i cocktail della casa.", '''
<div class="wrap">''' + big_title("Il menu", 'Cucina e dopocena. Aggiornato: <span data-menu-date>novembre 2026</span>.') + '''
<div style="padding-top:28px"><div class="tabs" role="tablist" aria-label="Carte">
<button type="button" role="tab" id="t-cucina" aria-controls="p-cucina" aria-selected="true">Cucina</button>
<button type="button" role="tab" id="t-dopocena" aria-controls="p-dopocena" aria-selected="false">Dopocena</button>
</div></div>
<section id="p-cucina" role="tabpanel" aria-labelledby="t-cucina"><div data-menu="cucina" data-cols="3"></div></section>
<section id="p-dopocena" role="tabpanel" aria-labelledby="t-dopocena" hidden><div data-menu="dopocena" data-cols="3"></div><p class="note-line">Prezzi dei drink dalla nuova drink list, da completare</p></section>
<section class="sec" id="allergeni" aria-labelledby="all-h">
<div class="sec-head"><h2 class="d" id="all-h" style="font-size:clamp(40px,5vw,60px)">Allergeni</h2><p class="lead">Accanto a ogni piatto trovi i numeri. Per intolleranze, chiedi al personale.</p></div>
<div class="allergens" data-allergens></div>
</section>
</div>''')

# ---------------- IL LOCALE ----------------
page("locale.html", "Il locale · La Bonora", "Il locale de La Bonora a Largo Appio Claudio: tre sale, il bancone con 600 distillati, la cucina a vista e il patio sulla piazza. Feste private e parcheggi convenzionati.", f'''
<div class="wrap">''' + big_title("Il locale", "Legno, piante e rampicanti, luci soffuse e colorate. Tre sale, un bancone e un patio sulla piazza.") + f'''
<div class="gallery" style="padding-top:24px">{photo("bancone-2", "Il bancone verde con la scritta La Bonora", pos="center 60%", sizes="66vw")}{photo("lab-neon", "Il neon LAB sulla vetrata verso il patio", sizes="33vw")}{photo("divano", "Il divano Chesterfield", sizes="33vw")}</div>
<section class="sec"><div class="split">
{photo("facciata", "La facciata con le luci", pos="center 40%")}
<div>
<p class="kick wine">Lo spazio</p>
<h2 class="d" style="font-size:clamp(44px,6vw,72px);margin:8px 0 24px">Una giungla a tua disposizione</h2>
<div class="body">
<p>Edera sui muri, rami che scendono dal soffitto, animali esotici che spuntano qua e là. Cuscini colorati, mattoni rossi, lampade retrò e una parete piena di quadri.</p>
<p>Al centro il bancone, con un'enorme bottigliera alle spalle e, sullo sfondo, la cucina a vista. Intorno, tre sale diverse con panche, sgabelli, tavoli e un divano Chesterfield.</p>
<p>Fuori c'è il patio sulla piazza di Largo Appio Claudio, con tavoli, piante e luci, e i funghi di calore per godersi l'aria aperta anche d'inverno.</p>
</div>
</div>
</div></section>
<div class="feature-list">
<div><p class="kick wine">Per le tue feste</p><h3>Uso esclusivo</h3><p>Una delle tre sale tutta per voi, o l'intero locale. Organizziamo anche catering in altre location.</p></div>
<div><p class="kick wine">Fuori</p><h3>Il patio</h3><p>Sulla piazza, con i funghi di calore nei mesi freddi.</p></div>
<div><p class="kick wine">Arrivare</p><h3>Parcheggi</h3><p>In zona ci sono parcheggi coperti convenzionati.</p></div>
</div>
</div>''')

# ---------------- EVENTI ----------------
page("eventi.html", "Eventi · La Bonora", "Le serate de La Bonora a Cinecittà: musica dal vivo, cene a tema, degustazioni di gin e whisky, feste in maschera e feste private.", f'''
<div class="wrap">''' + big_title("Eventi", "Si dice che per sopravvivere qui bisogna essere matti come un cappellaio. Matto.") + f'''
<section class="sec" aria-labelledby="next-h" style="padding-top:40px">
<p class="kick wine" id="next-h">Prossimi appuntamenti</p>
<div class="empty" style="margin-top:14px"><p class="s" style="font-size:22px;max-width:52ch">Il calendario delle prossime serate è in aggiornamento. Le date nuove escono prima su Instagram.</p><a class="btn ink" href="https://www.instagram.com/lab_bonora/">@lab_bonora</a></div>
</section>
<section class="sec" aria-labelledby="kinds-h">
<div class="sec-head"><h2 class="d" id="kinds-h">Le nostre serate</h2><p class="lead">Tante idee e quel pizzico di pazzia per rendere diverse le tue serate.</p></div>
<div class="kinds">
<div><p class="kick wine">Musica</p><h3>Live, sax set e disco</h3><p class="s" style="font-size:19px">Musica dal vivo, bartender show, show cooking, spettacoli di magia e danza.</p></div>
<div><p class="kick wine">In cucina</p><h3>Cene a tema</h3><p class="s" style="font-size:19px">Hamburger Day, Pasta Day, cena con menu arabo, apericena brasiliana, San Valentino.</p></div>
<div><p class="kick wine">Al bancone</p><h3>Serate drink</h3><p class="s" style="font-size:19px">Degustazioni di gin e whisky, Exotic e Tiki drink, Beer night, cocktail di San Patrizio.</p></div>
<div><p class="kick wine">In maschera</p><h3>Feste a tema</h3><p class="s" style="font-size:19px">Natale, Halloween, Carnevale, Día de los Muertos, Pin Up Party, Cosplay, karaoke.</p></div>
</div>
<div class="strip" style="margin-top:24px">{photo("natale","Le decorazioni di Natale",sizes="25vw")}{photo("bartender-drink","Il bartender al bancone",sizes="25vw")}{photo("neon-wilde","Il neon di Oscar Wilde",sizes="25vw")}{photo("spritz","Drink al tavolo",sizes="25vw")}</div>
</section>
<section class="band wine" style="margin-top:64px" aria-labelledby="priv-h"><div class="band-grid" style="padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))">
<div><p class="kick">Feste private</p><h2 class="d" id="priv-h" style="margin:8px 0 12px">Una sala tutta per voi</h2><p class="s" style="font-size:21px;line-height:1.35">Compleanni, lauree, aperitivi aziendali: una delle tre sale in esclusiva, o tutto il locale. Organizziamo anche catering in altre location.</p></div>
<div class="btns"><a class="btn light" href="{WA}">Scrivici su WhatsApp</a><a class="btn light" href="prenota.html">Richiedi una data</a></div>
</div></section>
</div>''')

# ---------------- PRENOTA ----------------
page("prenota.html", "Prenota · La Bonora", "Prenota un tavolo a La Bonora, Largo Appio Claudio 344/348, Roma: aperitivo, cena o dopocena, dentro o nel patio. Ti confermiamo noi.", f'''
<div class="wrap">''' + big_title("Prenota", "Dicci cosa ti va e quando: ti confermiamo noi, di solito in pochi minuti.") + f'''
<div class="book">
<div style="min-width:0">
<form id="booking" novalidate>
<fieldset><legend class="kick wine">1 · Che ti va?</legend>
<div class="choice">
<label><input type="radio" name="momento" value="aperitivo"><span class="n">Aperitivo</span><span class="t">La Conviviale</span></label>
<label><input type="radio" name="momento" value="cena"><span class="n">Cena</span><span class="t">Il Salotto</span></label>
<label><input type="radio" name="momento" value="dopocena"><span class="n">Dopocena</span><span class="t">La Giungla</span></label>
<label><input type="radio" name="momento" value="tutto" checked><span class="n">Un po' tutto</span><span class="t">la serata intera</span></label>
</div></fieldset>
<fieldset><legend class="kick wine">2 · Dove ti siedi?</legend>
<div class="choice three">
<label><input type="radio" name="dove" value="dentro" checked><span class="n">Dentro</span><span class="t">nel locale</span></label>
<label><input type="radio" name="dove" value="fuori"><span class="n">Fuori</span><span class="t">nel patio sulla piazza</span></label>
<label><input type="radio" name="dove" value="indifferente"><span class="n">Decidete voi</span><span class="t">va bene tutto</span></label>
</div></fieldset>
<fieldset><legend class="kick wine">3 · Quando e in quanti</legend>
<div class="fields">
<label class="f"><span>Giorno</span><input id="b-day" type="date" required></label>
<label class="f"><span>Ora</span><select id="b-time"></select></label>
<label class="f"><span>Persone</span><input id="b-people" type="number" min="1" max="40" value="2" inputmode="numeric"><small class="err" id="b-people-err" hidden></small></label>
</div></fieldset>
<fieldset><legend class="kick wine">4 · I tuoi dati</legend>
<div class="fields two">
<label class="f"><span>Nome</span><input id="b-name" type="text" autocomplete="name" placeholder="Il tuo nome"><small class="err" id="b-name-err" hidden></small></label>
<label class="f"><span>Cellulare</span><input id="b-phone" type="tel" autocomplete="tel" placeholder="333 000 0000"><small class="err" id="b-phone-err" hidden></small></label>
<label class="f"><span>Email (per la conferma)</span><input id="b-email" type="email" autocomplete="email" placeholder="nome@email.it"><small class="err" id="b-email-err" hidden></small></label>
<label class="f"><span>Compleanno, facoltativo</span><input id="b-bday" type="text" placeholder="gg/mm" inputmode="numeric" maxlength="5"></label>
<label class="f full"><span>Note</span><textarea id="b-notes" placeholder="Occasione, intolleranze, seggiolone…"></textarea></label>
</div></fieldset>
<div class="checks">
<label><input type="checkbox" id="b-privacy"><span>Ho letto l'<a href="privacy.html">informativa privacy</a> e acconsento al trattamento dei dati per gestire la prenotazione. (obbligatorio)</span></label>
<small class="err" id="b-privacy-err" hidden style="color:var(--wine)"></small>
<label><input type="checkbox" id="b-mkt"><span>Voglio ricevere gli auguri di compleanno e poche novità l'anno via email o WhatsApp. (facoltativo)</span></label>
</div>
<div class="submit-row"><button class="btn fill" type="submit">Invia la richiesta</button><p>Per gruppi oltre 10 persone o per stasera è più veloce WhatsApp.</p></div>
</form>
<div class="done" id="done" hidden tabindex="-1">
<p class="kick wine">Richiesta ricevuta</p>
<h3>Grazie, ci sentiamo a breve</h3>
<p class="s" style="font-size:21px" id="done-text"></p>
<p style="font-size:14px;color:var(--muted)">Questa è una demo: la richiesta non è stata inviata. Nel sito definitivo arriva al locale su Telegram con i tasti Accetta e Rifiuta, e a te parte l'email di conferma.</p>
<div><button class="btn" type="button" id="done-again">Nuova prenotazione</button></div>
</div>
</div>
<aside aria-label="Contatti">
<p class="kick wine">Per stasera</p>
<h2 class="d" style="font-size:44px;margin-top:6px">Più veloce</h2>
<div class="quick"><a class="ink" href="{WA}"><span>WhatsApp</span><span>{WA_TXT} →</span></a><a href="{TEL}"><span>Telefono</span><span>{TEL_TXT} →</span></a></div>
<div style="border-top:var(--rule)">
<div class="contact"><p class="kick">Indirizzo</p><p class="v">Largo Appio Claudio 344/348, 00174 Roma</p></div>
<div class="contact"><p class="kick">Orari</p><p class="v">Ogni sera, 18:00 – 02:00</p></div>
<div class="contact"><p class="kick">Email</p><p class="v"><a href="mailto:info@labonora.it">info@labonora.it</a></p></div>
<div class="contact"><p class="kick">Parcheggio</p><p class="v">In zona ci sono parcheggi coperti convenzionati.</p></div>
</div>
<p style="margin-top:28px"><a class="btn" href="https://www.google.com/maps/search/?api=1&amp;query=La+Bonora+Largo+Appio+Claudio+344+Roma">Apri in Google Maps</a></p>
{photo("lab-neon", "Il neon LAB e il patio", sizes="33vw", style="margin-top:28px;aspect-ratio:4/5")}
</aside>
</div>
</div>''')

# ---------------- FAMIGLIA ----------------
page("famiglia.html", "La famiglia · La Bonora", "La Bonora e N'Antro, calici e taglieri: due locali della famiglia Pulicati, uno accanto all'altro a Largo Appio Claudio, Roma.", '''
<div class="wrap">''' + big_title("La famiglia", "Una famiglia di ristoratori dal 1987. Il luogo può cambiare, la passione no.") + '''
<p class="draft" style="margin-top:28px">Bozza: testo da riscrivere con Flavio.</p>
<section class="sec" style="padding-top:40px"><div class="places">
<div class="place">''' + photo("ingresso-sera", "L'insegna de La Bonora", sizes="50vw") + '''<p class="kick wine">Largo Appio Claudio 344/348</p><h3 class="d">La Bonora</h3><p class="s" style="font-size:20px">Il Laboratorio di Cibi e Alcolici: aperitivo, cena e dopocena, tre anime in un solo locale.</p><a class="btn" href="index.html" style="align-self:flex-start">Sei qui</a></div>
<div class="place">''' + photo("nantro", "L'insegna di N'Antro, calici e taglieri", sizes="50vw", pos="center 30%") + '''<p class="kick wine">Largo Appio Claudio, accanto a La Bonora</p><h3 class="d">N'Antro</h3><p class="s" style="font-size:20px">Calici e taglieri. [Descrizione da scrivere: cosa si beve, cosa si mangia, che atmosfera ha.]</p><a class="btn" href="#" style="align-self:flex-start">Instagram di N'Antro</a></div>
</div></section>
<section class="sec"><div class="strip">''' + photo("famiglia-tavola", "A tavola", sizes="25vw") + photo("cuoca", "In cucina", sizes="25vw") + photo("caffe", "Il caffè", sizes="25vw") + photo("salotto-sala", "La sala", sizes="25vw") + '''</div></section>
</div>''')

# ---------------- PRIVACY ----------------
page("privacy.html", "Privacy e cookie · La Bonora", "Informativa privacy e cookie de La Bonora S.r.l.", '''
<div class="wrap" style="padding-block:44px 24px">
<h1 class="d" style="font-size:clamp(56px,9vw,110px)">Privacy e cookie</h1>
<p class="draft" style="margin-top:24px;max-width:70ch">Da completare prima della messa online: l'informativa va aggiornata con i nuovi trattamenti (prenotazioni, anagrafica clienti, auguri e comunicazioni). Fino ad allora vale quella del sito attuale: <a href="https://www.labonora.it/trattamento-dei-dati-cookie-policy/">labonora.it/trattamento-dei-dati-cookie-policy</a>.</p>
<p class="body" style="margin-top:24px">Titolare del trattamento: La Bonora S.r.l., Largo Appio Claudio 344, 00174 Roma, P.IVA 14928281006, info@labonora.it.</p>
</div>''')
