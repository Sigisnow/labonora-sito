# La Bonora · sito (demo)

Demo del nuovo sito de La Bonora, Laboratorio di Cibi e Alcolici, Largo Appio Claudio 344/348, Roma.

- Il sito pubblicato è nella cartella principale (pagine `.html`, `assets/`, `img/`).
- Il menu sta in un solo file: `assets/menu-data.js`. Cambiando un prezzo lì, si aggiorna in tutte le pagine.
- `sorgente/` contiene lo script che genera le pagine (`python3 build.py`): le pagine non si modificano a mano, si modifica `pages.py` e si rigenera.

**Demo**: le pagine hanno `noindex`, così Google non le indicizza. Al momento del lancio su labonora.it va tolto (riga `robots` in `build.py`).
