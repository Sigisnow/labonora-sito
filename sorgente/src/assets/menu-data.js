/* Menu de La Bonora — unica fonte per il sito.
   Nel sito definitivo questi dati arrivano da un foglio Google: chi aggiorna il menu non tocca il codice.
   prezzo: numero in euro, oppure null finché non è deciso.
   all: codici allergeni ("1·3·7"), oppure "verifica" se la cucina deve ancora confermarli. */
window.BONORA_MENU = {
  aggiornato: "novembre 2026 · bozza",
  allergeni: {1:"Cereali con glutine",2:"Crostacei",3:"Uova",4:"Pesce",5:"Arachidi",6:"Soia",7:"Latte e derivati",8:"Frutta a guscio",9:"Sedano",10:"Senape",11:"Semi di sesamo",12:"Anidride solforosa e solfiti",13:"Lupini",14:"Molluschi"},
  sezioni: [
    {id:"fritti", carta:"cucina", sale:["conviviale"], titolo:"Fritti", sottotitolo:"Da prendere con le mani", voci:[
      {nome:"Cartoccio dell'Ortolano", desc:"Verdure in cartoccio, fritte e croccanti.", prezzo:6, all:"1·3·8·11"},
      {nome:"Supplì", desc:"Il classico romano.", prezzo:5, all:"1·3·7·12"},
      {nome:"Montanarine al pomodoro", desc:"Bocconi di pasta fritta al pomodoro.", prezzo:6, all:"1·3·7·12"},
      {nome:"Stick di pollo", desc:"Pollo dorato e croccante.", prezzo:7, all:"1·3·6·7·8·10·11"},
      {nome:"Gamberi fritti", desc:"Croccanti, da gustare appena fatti.", prezzo:11, all:"1·2·3·5·6·7·8·10·11"},
      {nome:"Sfere di Camembert", desc:"Fritte e dorate, con il Camembert dal cuore morbido.", prezzo:7, all:"1·3·5·7·8·11·12"},
      {nome:"Sfera romana di bollito", desc:"Il bollito della tradizione, in una sfera croccante.", prezzo:6, all:"1·3·7·9·12"}
    ]},
    {id:"antipasti", carta:"cucina", sale:["conviviale","salotto"], titolo:"Antipasti", sottotitolo:"Per cominciare bene", voci:[
      {nome:"Tartare di manzo, pere e nocciole", desc:"Manzo danese battuto al coltello, pere, nocciole tostate e fonduta di Grana.", prezzo:15, all:"6·7·8·10", firma:true},
      {nome:"Tagliere di salumi e formaggi", desc:"Per due persone.", prezzo:16, all:"1·3·7·8"},
      {nome:"Arrosticini", desc:"", prezzo:10, all:"verifica"},
      {nome:"Crema di ceci", desc:"", prezzo:7, all:"1·12"},
      {nome:"Involtino di verza", desc:"Salsiccia e patate avvolte nella verza, su crema di pecorino.", prezzo:9, all:"1·3·7·12"}
    ]},
    {id:"pinse", carta:"cucina", sale:["conviviale"], titolo:"Pinse", sottotitolo:"Un impasto, molte idee", voci:[
      {nome:"Margherita", desc:"", prezzo:8, all:"1·6·7·10"},
      {nome:"Diavola", desc:"", prezzo:9, all:"1·6·7·10"},
      {nome:"Marinara della Bonora", desc:"Alici e olio all'aglio e prezzemolo fatto in casa.", prezzo:8, all:"1·4·6·10"},
      {nome:"Ortolona", desc:"Zucchine, melanzane, peperoni, patate e cipolla a julienne, cotti al forno.", prezzo:10, all:"verifica"},
      {nome:"Broccoli e salsiccia", desc:"Crema e cime di broccoli ripassate, salsiccia, crema di pecorino.", prezzo:11, all:"1·4·6·7·10·12"},
      {nome:"Scamorza e patate", desc:"Mozzarella, scamorza e patate.", prezzo:9, all:"1·6·7·10"},
      {nome:"Mortadella, burrata e pistacchio", desc:"Mortadella La Favola, burrata campana e pistacchio siciliano.", prezzo:13, all:"1·6·7·8·10", firma:true},
      {nome:"Scarola e speck", desc:"Mozzarella, scarola con uvetta, pinoli e olive, speck trentino.", prezzo:12, all:"1·4·6·7·10·12"}
    ]},
    {id:"primi", carta:"cucina", sale:["salotto"], titolo:"Primi", sottotitolo:"Tradizione e nuove idee", voci:[
      {nome:"Matriciana in cornucopia", desc:"La nostra Matriciana, servita in cornucopia.", prezzo:13, all:"1·7·12", firma:true},
      {nome:"Fettuccine al ragù di cinghiale", desc:"", prezzo:14, all:"1·3·7·9·12"},
      {nome:"Tagliolino al cavolo nero", desc:"Cavolo nero, fonduta di Grana e mandorle.", prezzo:12, all:"1·3·7·8"},
      {nome:"Ravioli di manzo", desc:"Su uno specchio di pomodoro, scaglie di pecorino e cacao amaro.", prezzo:14, all:"1·3·7·8·9·12"}
    ]},
    {id:"secondi", carta:"cucina", sale:["salotto"], titolo:"Secondi", sottotitolo:"I piatti forti", voci:[
      {nome:"Pancetta di maiale laccata", desc:"Laccata alla soia, su purea di patate.", prezzo:16, all:"6·8·9·10·11·12"},
      {nome:"Galletto al mattone", desc:"Cottura al mattone, circa 30 minuti di attesa.", prezzo:17, all:"verifica"},
      {nome:"Tagliata di funghi e Grana", desc:"Funghi e scaglie di Grana.", prezzo:20, all:"7"},
      {nome:"Tagliata di pollo", desc:"Su cuore di lattuga romana e pomodorini.", prezzo:14, all:"verifica"}
    ]},
    {id:"burger", carta:"cucina", sale:["salotto"], titolo:"Burger", sottotitolo:"Tutti con patatine fritte", voci:[
      {nome:"Classico", desc:"Manzo, cheddar, guanciale croccante, lattuga, pomodoro, cetriolo, maionese e ketchup.", prezzo:13, all:"1·3·7·11"},
      {nome:"Datte Foco", desc:"Burger di salsiccia fatto in casa, 'nduja, peperoni agropiccanti, lattuga, cicoria ripassata e salsa piccante.", prezzo:14, all:"1·3·6·7·8·10·11·12", firma:true},
      {nome:"Carbonaro", desc:"Manzo, uovo alla Bismarck, fonduta di pecorino, guanciale croccante e maionese.", prezzo:15, all:"1·3·7·8·11", firma:true},
      {nome:"Bonora", desc:"Manzo, puntarelle, pomodori secchi, stracciatella e mandorle tostate.", prezzo:15, all:"1·3·4·7·8·11", firma:true},
      {nome:"Double Cheese", desc:"Doppio manzo, cheddar, guanciale croccante, lattuga, pomodoro e maionese.", prezzo:16, all:"1·3·7·8·11"},
      {nome:"Pollaio Ubriaco", desc:"Pollo alla birra, pomodoro grigliato, olive taggiasche, pecorino, lattuga e salsa segreta.", prezzo:13, all:"1·3·6·7·8·10·11·12"},
      {nome:"Ortolano", desc:"Burger di cavolo nero e patate fatto in casa, scamorza, pomodori secchi, lattuga e maionese.", prezzo:12, all:"1·3·7·8·11"},
      {nome:"Veggie Burger", desc:"Burger di soia, scamorza, melanzane a funghetto, pomodoro e maionese al basilico.", prezzo:12, all:"1·3·5·6·7·8·9·10·11"}
    ]},
    {id:"contorni", carta:"cucina", sale:["salotto"], titolo:"Contorni", sottotitolo:"A completare il piatto", voci:[
      {nome:"Misticanza di campo con battuto", desc:"", prezzo:5, all:"4·12"},
      {nome:"Patate ripassate", desc:"", prezzo:5, all:"verifica"},
      {nome:"Verdure ripassate", desc:"", prezzo:5, all:"verifica"},
      {nome:"Verdure grigliate", desc:"", prezzo:5, all:"verifica"}
    ]},
    {id:"dolci", carta:"cucina", sale:["salotto"], titolo:"Dolci", sottotitolo:"C'è sempre posto", voci:[
      {nome:"Tiramisù", desc:"", prezzo:6, all:"1·3·7·8"},
      {nome:"Crema Maria Luisa", desc:"", prezzo:6, all:"1·3·7·8"},
      {nome:"Tortino al cioccolato", desc:"", prezzo:7, all:"1·3·7·8"},
      {nome:"Tarte Tatin", desc:"", prezzo:7, all:"1·3·7·8"},
      {nome:"Scomposta di ricotta e visciole", desc:"", prezzo:7, all:"1·3·7·8"}
    ]},
    {id:"signature", carta:"dopocena", sale:["giungla"], titolo:"Cocktail della casa", sottotitolo:"Con liquori e infusi fatti da noi", voci:[
      {nome:"Il Giardino di Katyusha", desc:"Il nostro liquore al cetriolo e vodka infusa alle scorze di limone.", prezzo:null, all:"", firma:true},
      {nome:"Basilicum", desc:"Tequila infusa al basilico.", prezzo:null, all:"", firma:true},
      {nome:"Il Pepe e le Bacche", desc:"Il nostro gin al pepe rosa.", prezzo:null, all:"", firma:true}
    ]},
    {id:"affumicati", carta:"dopocena", sale:["giungla"], titolo:"Affumicati", sottotitolo:"Su qualunque cocktail, con la spezia che scegli", voci:[
      {nome:"Old Fashioned affumicato", desc:"Bourbon, zucchero, bitter.", prezzo:null, all:""},
      {nome:"Negroni affumicato", desc:"Gin, vermouth rosso, bitter.", prezzo:null, all:""}
    ]},
    {id:"bancone", carta:"dopocena", sale:["giungla"], titolo:"Al bancone", sottotitolo:"Una bottigliera di oltre 600 distillati", voci:[
      {nome:"Classici della mixology", desc:"Eseguiti secondo le regole, o rivisitati sui tuoi gusti.", prezzo:null, all:""},
      {nome:"Distillati da tutto il mondo", desc:"Gin, rum, whisky, tequila, lisci o in miscela.", prezzo:null, all:""},
      {nome:"Birre artigianali", desc:"Alla spina e in bottiglia, a rotazione.", prezzo:null, all:""},
      {nome:"Cocktail analcolici", desc:"", prezzo:null, all:""},
      {nome:"Vini, amari e grappe", desc:"", prezzo:null, all:""}
    ]}
  ]
};
