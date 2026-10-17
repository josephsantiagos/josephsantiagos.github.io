#!/usr/bin/env python3
"""Confere o site servido localmente (ou publicado).

Uso:
  python3 -m http.server 8811 --bind 127.0.0.1   (na raiz do repositório)
  python3 tools/verificar-site.py http://127.0.0.1:8811
"""
import json
import re
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

SITE = "https://josephsantiagos.github.io"
AVISO = ("Simulação ilustrativa. Não oferecemos nem intermediamos crédito e não temos vínculo com bancos, "
         "financeiras ou órgãos públicos. Antes de contratar, confira o Custo Efetivo Total (CET) informado pela instituição.")
PLAY = "https://play.google.com/store/apps/details?id=com.josephsantiago.calculadoraemprestimos"

PAGINAS = [
    "/simulador-emprestimo/", "/simulador-financiamento-carro/", "/simulador-financiamento-moto/",
    "/juros-parcelamento/", "/descobrir-taxa-de-juros/", "/tabela-price/", "/price-ou-sac/",
    "/emprestimo-consignado/", "/juros-compostos/", "/juros-cartao-de-credito/", "/quanto-fica-emprestimo/",
]


class Coletor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self._em_title = False
        self.meta = {}
        self.links = []
        self.canonical = None
        self.h1 = 0
        self.jsonld = []
        self._em_ld = False
        self._buf = ""
        self.ids = []
        self.labels_for = set()
        self.inputs = []
        self.imgs_sem_alt = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.append(a["id"])
        if tag == "title":
            self._em_title = True
        elif tag == "meta":
            chave = a.get("name") or a.get("property")
            if chave:
                self.meta[chave] = a.get("content", "")
        elif tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag == "h1":
            self.h1 += 1
        elif tag == "script" and a.get("type") == "application/ld+json":
            self._em_ld = True
            self._buf = ""
        elif tag == "label" and a.get("for"):
            self.labels_for.add(a["for"])
        elif tag in ("input", "select") and a.get("type") not in ("radio", "hidden", "submit"):
            self.inputs.append(a)
        elif tag == "img" and "alt" not in a:
            self.imgs_sem_alt += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._em_title = False
        elif tag == "script" and self._em_ld:
            self.jsonld.append(self._buf)
            self._em_ld = False

    def handle_data(self, data):
        if self._em_title:
            self.title += data
        if self._em_ld:
            self._buf += data


def baixar(url):
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            return r.status, r.read(), r.headers.get("Content-Type", "")
    except urllib.error.HTTPError as e:
        return e.code, e.read(), ""


def tipos_ld(dados):
    tipos = set()
    itens = dados.get("@graph", [dados]) if isinstance(dados, dict) else dados
    for it in itens:
        t = it.get("@type")
        tipos.update(t if isinstance(t, list) else [t])
    return tipos


def main():
    base = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8811").rstrip("/")
    erros = []
    links_internos = set()

    def falha(msg):
        erros.append(msg)

    for caminho in ["/"] + PAGINAS:
        status, corpo, ctype = baixar(base + caminho)
        if status != 200:
            falha(f"{caminho}: HTTP {status}")
            continue
        html = corpo.decode("utf-8")
        c = Coletor()
        c.feed(html)
        slug = "inicio" if caminho == "/" else caminho.strip("/")
        titulo = c.title.strip()
        desc = c.meta.get("description", "")
        problemas = []
        if not titulo or len(titulo) > 60:
            problemas.append(f"title com {len(titulo)} caracteres")
        if not desc or len(desc) > 155:
            problemas.append(f"description com {len(desc)} caracteres")
        if c.canonical != SITE + caminho:
            problemas.append(f"canonical {c.canonical}")
        if c.h1 != 1:
            problemas.append(f"{c.h1} h1")
        for og in ("og:title", "og:description", "og:url", "og:image", "og:type", "og:locale"):
            if not c.meta.get(og):
                problemas.append("sem " + og)
        if c.meta.get("og:url") != SITE + caminho:
            problemas.append("og:url diferente do canonical")
        # JSON-LD
        tipos = set()
        for bloco in c.jsonld:
            try:
                tipos |= tipos_ld(json.loads(bloco))
            except Exception as e:  # noqa: BLE001
                problemas.append(f"JSON-LD inválido: {e}")
        esperado = {"WebSite", "MobileApplication", "FAQPage"} if caminho == "/" else {"WebApplication", "FAQPage", "BreadcrumbList"}
        if not esperado <= tipos:
            problemas.append(f"JSON-LD sem {esperado - tipos}")
        if "aggregateRating" in html or "ratingValue" in html:
            problemas.append("tem avaliação no JSON-LD")
        # aviso, CTA com UTM
        if html.count(AVISO) < (1 if caminho == "/" else 2):
            problemas.append(f"aviso aparece {html.count(AVISO)}x")
        utm = f"{PLAY}&amp;referrer=utm_source%3Dsite%26utm_medium%3D{slug}%26utm_campaign%3Dorganico"
        if html.count(utm) < 2:
            problemas.append(f"CTA com UTM aparece {html.count(utm)}x")
        if "Leve a calculadora no celular — grátis, sem cadastro" not in html or "Disponível no" not in html:
            problemas.append("texto do CTA ausente")
        # acessibilidade básica
        for inp in c.inputs:
            if inp.get("id") and inp["id"] not in c.labels_for:
                problemas.append(f"campo {inp['id']} sem label")
            if inp.get("id") is None and not inp.get("aria-label"):
                problemas.append(f"campo {inp.get('name')} sem rótulo")
        if c.imgs_sem_alt:
            problemas.append(f"{c.imgs_sem_alt} img sem alt")
        dup = {i for i in c.ids if c.ids.count(i) > 1}
        if dup:
            problemas.append(f"ids repetidos: {dup}")
        if caminho != "/":
            if 'data-calc="' not in html:
                problemas.append("sem calculadora")
            if 'class="res-destaque"' not in html and "comparativo" not in html:
                problemas.append("resultado não pré-calculado")
            if "Outras calculadoras" not in html:
                problemas.append("sem bloco Outras calculadoras")
            pos_calc, pos_artigo = html.find("data-calc="), html.find('<article class="texto">')
            if not (0 < pos_calc < pos_artigo):
                problemas.append("calculadora não está antes do texto")
            if 'inputmode="decimal"' not in html:
                problemas.append("sem inputmode decimal")
        if re.search(r"https?://(?!josephsantiagos\.github\.io|play\.google\.com|schema\.org|www\.sitemaps\.org|www\.w3\.org)", html):
            problemas.append("recurso externo inesperado: " + re.search(r"https?://[^\"' <]+", html).group(0))
        for href in c.links:
            if href.startswith("/"):
                links_internos.add(href.split("#")[0].split("?")[0])
        print(f"{'OK ' if not problemas else 'ERR'} {caminho:34} {len(titulo):2}/{len(desc):3}  JSON-LD: {', '.join(sorted(tipos))}")
        for p in problemas:
            falha(f"{caminho}: {p}")

    # links internos, assets e arquivos auxiliares
    for href in sorted(links_internos | {"/assets/site.css", "/assets/calc.js", "/assets/logo.svg", "/assets/favicon-32.png",
                                          "/assets/apple-touch-icon.png", "/assets/og-calculadora.png", "/favicon.ico",
                                          "/404.html", "/robots.txt", "/sitemap.xml", "/app-ads.txt"}):
        status, corpo, ctype = baixar(base + href)
        if status != 200:
            falha(f"link/arquivo {href}: HTTP {status}")
    status, corpo, _ = baixar(base + "/assets/og-calculadora.png")
    if status == 200 and corpo[:8] == b"\x89PNG\r\n\x1a\n":
        import struct
        w, h = struct.unpack(">II", corpo[16:24])
        if (w, h) != (1200, 630):
            falha(f"og image {w}x{h}")
    # sitemap
    status, corpo, _ = baixar(base + "/sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    raiz = ET.fromstring(corpo)
    locs = [u.find("s:loc", ns).text for u in raiz.findall("s:url", ns)]
    mods = {u.find("s:lastmod", ns).text for u in raiz.findall("s:url", ns)}
    if sorted(locs) != sorted([SITE + "/"] + [SITE + p for p in PAGINAS]):
        falha("sitemap com URLs diferentes das páginas")
    if mods != {"2026-10-17"}:
        falha(f"lastmod {mods}")
    status, corpo, _ = baixar(base + "/robots.txt")
    rb = corpo.decode()
    if "Allow: /" not in rb or f"Sitemap: {SITE}/sitemap.xml" not in rb:
        falha("robots.txt incompleto")
    status, corpo, _ = baixar(base + "/app-ads.txt")
    if corpo.decode().strip() != "google.com, pub-6560293652268094, DIRECT, f08c47fec0942fa0":
        falha("app-ads.txt mudou!")
    status, corpo, _ = baixar(base + "/404.html")
    if b"noindex" not in corpo:
        falha("404 sem noindex")

    print(f"\n{len(locs)} URLs no sitemap; {len(links_internos)} links internos conferidos.")
    if erros:
        print("\nPROBLEMAS:")
        for e in erros:
            print(" -", e)
        sys.exit(1)
    print("Tudo certo.")


if __name__ == "__main__":
    main()
