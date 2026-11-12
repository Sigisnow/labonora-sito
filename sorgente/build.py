#!/usr/bin/env python3
"""Genera il sito La Bonora: pagine HTML statiche con intestazione e piè di pagina comuni.
dist/      -> sito completo (GitHub Pages o qualsiasi hosting statico)
artifact/  -> stessa cosa, con index.html senza <html>/<head> (formato anteprima)"""
import os, re, shutil, json
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, DIST, ART = (os.path.join(ROOT, d) for d in ("src", "dist", "artifact"))

SITE = "https://www.labonora.it"
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;600;700&display=swap">'
# indirizzo dell'App web Google (finisce con /exec). Vuoto = modulo in modalità demo.
API_URL = os.environ.get("BONORA_API_TEST", "")
WA, WA_TXT, TEL, TEL_TXT = "https://wa.me/393495069530", "349 506 9530", "tel:+390688376508", "06 8837 6508"

SCHEMA = {"@context": "https://schema.org", "@type": "BarOrPub", "name": "La Bonora – Laboratorio di Cibi e Alcolici",
          "url": SITE + "/", "telephone": "+39 06 8837 6508", "email": "info@labonora.it",
          "address": {"@type": "PostalAddress", "streetAddress": "Largo Appio Claudio 344/348", "postalCode": "00174", "addressLocality": "Roma", "addressRegion": "RM", "addressCountry": "IT"},
          "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "18:00", "closes": "02:00"}],
          "servesCuisine": ["Romana", "Burger", "Pinsa", "Cocktail"], "acceptsReservations": SITE + "/prenota.html", "hasMenu": SITE + "/menu.html",
          "sameAs": ["https://www.instagram.com/lab_bonora/", "https://www.facebook.com/labonora/"]}

def head(title, desc, path, extra=""):
    return f'''<title>{title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="{desc}">
<link rel="canonical" href="{SITE}/{"" if path == "index.html" else path}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:type" content="website"><meta property="og:locale" content="it_IT">
{FONTS}
<link rel="stylesheet" href="assets/style.css">{extra}'''

exec(open(os.path.join(ROOT, "pages.py"), encoding="utf-8").read())

SCRIPTS = '<script src="assets/menu-data.js"></script><script src="assets/site.js"></script>'
def scripts(path, api):
    cfg = f'<script>window.BONORA_API={json.dumps(api)};</script>'
    if path == "staff.html": return cfg + '<script src="assets/staff.js"></script>'
    return cfg + SCRIPTS

def build():
    for d in (DIST, ART):
        shutil.rmtree(d, ignore_errors=True); shutil.copytree(os.path.join(SRC, "assets"), os.path.join(d, "assets")); shutil.copytree(os.path.join(SRC, "img"), os.path.join(d, "img"))
    doc = lambda h, b, sc: f'<!doctype html>\n<html lang="it">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n{h}\n</head>\n<body>\n{b}\n{sc}\n</body>\n</html>\n'
    for path, (h, b) in PAGES.items():
        # il sito vero parla con il servizio Google; l'anteprima su Claude resta in demo
        open(os.path.join(DIST, path), "w", encoding="utf-8").write(doc(h, b, scripts(path, API_URL)))
        sc = scripts(path, "")
        open(os.path.join(ART, path), "w", encoding="utf-8").write(f'{h}\n{b}\n{sc}\n' if path == "index.html" else doc(h, b, sc))
    print("pagine:", ", ".join(PAGES))

if __name__ == "__main__":
    build()
