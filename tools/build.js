#!/usr/bin/env node
// Gera as páginas HTML do site a partir de tools/conteudo.js.
// Uso: node tools/build.js   (sem dependências; não mexe em app-ads.txt)
'use strict';
const fs = require('fs');
const path = require('path');
const { C, R, AVISO } = require('../assets/calc.js');
const { paginas, hub } = require('./conteudo.js');

const RAIZ = path.resolve(__dirname, '..');
const SITE = 'https://josephsantiagos.github.io';
const LASTMOD = '2026-10-17';
const PLAY = 'https://play.google.com/store/apps/details?id=com.josephsantiago.calculadoraemprestimos';
const POLITICA = 'https://josephsantiagos.github.io/pilitica-de-privacidade-play-sotre-/';
const EMAIL = 'josephsantiago250@gmail.com';
const NOME_SITE = 'Calculadora Empréstimo e Juros';
const OG_IMG = SITE + '/assets/og-calculadora.png';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const semTags = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function linkPlay(slug) {
  return PLAY + '&referrer=utm_source%3Dsite%26utm_medium%3D' + slug + '%26utm_campaign%3Dorganico';
}

/* ---------- pedaços comuns ---------- */

function cabeca(o) {
  const ld = o.jsonld ? '<script type="application/ld+json">' + JSON.stringify(o.jsonld).replace(/</g, '\\u003c') + '</script>\n' : '';
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
${o.canonical ? `<link rel="canonical" href="${o.canonical}">\n` : ''}<meta name="robots" content="${o.robots || 'index, follow, max-image-preview:large'}">
<meta name="theme-color" content="#0A5F5B">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/assets/logo.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${NOME_SITE}">
<meta property="og:title" content="${esc(o.ogTitle || o.title)}">
<meta property="og:description" content="${esc(o.description)}">
${o.canonical ? `<meta property="og:url" content="${o.canonical}">\n` : ''}<meta property="og:image" content="${OG_IMG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Calculadora Empréstimo e Juros: simule parcelas e juros">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/site.css">
${ld}</head>`;
}

function topo() {
  return `<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo"><div class="topo-in"><a class="marca" href="/"><img src="/assets/logo.svg" alt="" width="32" height="32">${NOME_SITE}</a></div></header>`;
}

const ICONE_PLAY = '<svg width="26" height="28" viewBox="0 0 26 28" aria-hidden="true" focusable="false"><path d="M3 2.6v22.8a1.6 1.6 0 0 0 2.4 1.4l18.6-11.4a1.6 1.6 0 0 0 0-2.8L5.4 1.2A1.6 1.6 0 0 0 3 2.6z" fill="#FFD166"/><path d="M8 9.5v9l7.4-4.5z" fill="#111"/></svg>';

function cta(slug, texto) {
  return `<aside class="cta-app" aria-label="App para Android">
<p class="cta-titulo">Leve a calculadora no celular — grátis, sem cadastro</p>
<p class="cta-texto">${texto || 'Com o app Calculadora Empréstimo e Juros você simula parcelas e juros direto no seu Android.'}</p>
<a class="botao-play" href="${esc(linkPlay(slug))}" rel="noopener">${ICONE_PLAY}<span><small>Disponível no</small><b>Google Play</b></span></a>
</aside>`;
}

function rodape(slug) {
  const itens = paginas.map((p) => `<li><a href="${p.caminho}">${p.link.titulo}</a></li>`).join('');
  return `<footer class="rodape"><div class="rodape-in">
${cta(slug)}
<p class="aviso">${AVISO}</p>
<nav aria-label="Todas as calculadoras"><ul class="rodape-links"><li><a href="/">Início</a></li>${itens}</ul></nav>
<p>Feito por Joseph Santiago, desenvolvedor de apps Android. <a href="${PLAY}">Calculadora Empréstimo e Juros na Google Play</a> · <a href="${POLITICA}">Política de privacidade</a> · Contato: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
<p>Este site não exibe anúncios e não coleta os valores digitados: as contas são feitas no seu próprio aparelho.</p>
</div></footer>
<script src="/assets/calc.js" defer></script>
</body>
</html>
`;
}

/* ---------- formulário ---------- */

function campo(prefixo, f) {
  const id = prefixo + '-' + f.nome;
  const dica = f.dica ? `<p class="dica" id="${id}-dica">${f.dica}</p>` : '';
  const desc = f.dica ? ` aria-describedby="${id}-dica"` : '';
  const classe = 'campo' + (f.largo ? ' largo' : '');
  if (f.tipo === 'dinheiro') {
    return `<div class="${classe}"><label for="${id}">${f.rotulo}</label><div class="entrada"><span class="un" aria-hidden="true">R$</span><input id="${id}" name="${f.nome}" type="text" inputmode="decimal" autocomplete="off" value="${esc(f.valor)}"${desc}></div>${dica}</div>`;
  }
  if (f.tipo === 'taxa') {
    const sel = f.periodo
      ? `<select name="tipo" aria-label="Período da taxa"><option value="mes"${f.periodo === 'mes' ? ' selected' : ''}>ao mês</option><option value="ano"${f.periodo === 'ano' ? ' selected' : ''}>ao ano</option></select>`
      : '';
    const un = f.periodo ? '%' : '% ao mês';
    return `<div class="${classe}"><label for="${id}">${f.rotulo}</label><div class="dupla"><div class="entrada"><input id="${id}" name="${f.nome}" type="text" inputmode="decimal" autocomplete="off" value="${esc(f.valor)}"${desc}><span class="un" aria-hidden="true">${un}</span></div>${sel}</div>${dica}</div>`;
  }
  if (f.tipo === 'pct') {
    return `<div class="${classe}"><label for="${id}">${f.rotulo}</label><div class="entrada"><input id="${id}" name="${f.nome}" type="text" inputmode="decimal" autocomplete="off" value="${esc(f.valor)}"${desc}><span class="un" aria-hidden="true">%</span></div>${dica}</div>`;
  }
  if (f.tipo === 'inteiro') {
    const sel = f.unidades
      ? `<select name="${f.unidades.nome}" aria-label="Unidade do prazo">${f.unidades.opcoes.map(([v, t]) => `<option value="${v}"${v === f.unidades.valor ? ' selected' : ''}>${t}</option>`).join('')}</select>`
      : '';
    const un = f.un ? `<span class="un" aria-hidden="true">${f.un}</span>` : '';
    const caixa = `<div class="entrada"><input id="${id}" name="${f.nome}" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${esc(f.valor)}"${desc}>${un}</div>`;
    return `<div class="${classe}"><label for="${id}">${f.rotulo}</label>${sel ? `<div class="dupla">${caixa}${sel}</div>` : caixa}${dica}</div>`;
  }
  if (f.tipo === 'select') {
    return `<div class="${classe}"><label for="${id}">${f.rotulo}</label><select id="${id}" name="${f.nome}">${f.opcoes.map(([v, t]) => `<option value="${v}"${v === f.valor ? ' selected' : ''}>${t}</option>`).join('')}</select>${dica}</div>`;
  }
  if (f.tipo === 'radio') {
    return `<fieldset class="${classe} opcoes"><legend>${f.rotulo}</legend>${f.opcoes.map(([v, t]) => `<label><input type="radio" name="${f.nome}" value="${v}"${v === f.valor ? ' checked' : ''}> ${t}</label>`).join('')}</fieldset>`;
  }
  throw new Error('tipo de campo desconhecido: ' + f.tipo);
}

function valoresPadrao(campos) {
  const v = {};
  for (const f of campos) {
    v[f.nome] = f.valor;
    if (f.tipo === 'taxa' && f.periodo) v.tipo = f.periodo;
    if (f.unidades) v[f.unidades.nome] = f.unidades.valor;
  }
  return v;
}

function blocoCalculadora(p) {
  const prefixo = p.calc.tipo;
  const saida = 'resultado-' + prefixo;
  const r = R[p.calc.tipo](valoresPadrao(p.calc.campos));
  if (!r.ok) throw new Error('Exemplo padrão inválido em ' + p.slug);
  return `<section class="calc" id="calculadora" aria-labelledby="titulo-calc">
<h2 id="titulo-calc" style="margin-top:0">${p.calc.titulo}</h2>
<form data-calc="${p.calc.tipo}" data-saida="${saida}" data-anuncio="anuncio-${prefixo}" novalidate>
<div class="campos">
${p.calc.campos.map((f) => campo(prefixo, f)).join('\n')}
</div>
<button class="botao" type="submit">${p.calc.botao || 'Calcular'}</button>
</form>
<p class="sr" id="anuncio-${prefixo}" aria-live="polite"></p>
<div class="resultado" id="${saida}">${r.html}</div>
</section>`;
}

function outras(atual) {
  const itens = paginas.filter((p) => p.slug !== atual)
    .map((p) => `<li><a href="${p.caminho}"><strong>${p.link.titulo}</strong><span>${p.link.desc}</span></a></li>`).join('\n');
  return `<nav class="outras" aria-labelledby="titulo-outras"><h2 id="titulo-outras">Outras calculadoras</h2><ul class="links">\n${itens}\n</ul></nav>`;
}

function faqHtml(faq) {
  return `<section class="faq" aria-labelledby="titulo-faq"><h2 id="titulo-faq">Perguntas frequentes</h2>
${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
</section>`;
}

function jsonLdPagina(p) {
  const url = SITE + p.caminho;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': url + '#calculadora',
        name: p.appNome,
        url: url,
        description: p.description,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Qualquer sistema com navegador',
        browserRequirements: 'Requer JavaScript',
        inLanguage: 'pt-BR',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        author: { '@type': 'Person', name: 'Joseph Santiago' }
      },
      {
        '@type': 'FAQPage',
        '@id': url + '#faq',
        mainEntity: p.faq.map(([q, a]) => ({
          '@type': 'Question',
          name: semTags(q),
          acceptedAnswer: { '@type': 'Answer', text: semTags(a) }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        '@id': url + '#trilha',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: p.trilha, item: url }
        ]
      }
    ]
  };
}

function paginaCalculadora(p) {
  const url = SITE + p.caminho;
  return cabeca({ title: p.title, description: p.description, canonical: url, jsonld: jsonLdPagina(p) }) + `
<body>
${topo()}
<main id="conteudo">
<nav class="trilha" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li aria-current="page">${p.trilha}</li></ol></nav>
<h1>${p.h1}</h1>
<p class="lead">${p.lead}</p>
${blocoCalculadora(p)}
${cta(p.slug)}
<article class="texto">
${typeof p.artigo === 'function' ? p.artigo() : p.artigo}
</article>
${faqHtml(p.faq)}
${outras(p.slug)}
</main>
${rodape(p.slug)}`;
}

/* ---------- hub (index.html) ---------- */

function paginaHub() {
  const url = SITE + '/';
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': url + '#site', name: NOME_SITE, url: url, inLanguage: 'pt-BR', publisher: { '@id': url + '#joseph' } },
      { '@type': 'Person', '@id': url + '#joseph', name: 'Joseph Santiago', jobTitle: 'Desenvolvedor de apps Android', email: 'mailto:' + EMAIL, url: url },
      {
        '@type': 'MobileApplication', '@id': url + '#app', name: 'Calculadora Empréstimo e Juros', operatingSystem: 'Android',
        applicationCategory: 'FinanceApplication', url: PLAY, installUrl: PLAY, inLanguage: 'pt-BR',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' }, author: { '@id': url + '#joseph' }
      },
      {
        '@type': 'ItemList', '@id': url + '#calculadoras', name: 'Calculadoras de empréstimo e juros',
        itemListElement: paginas.map((p, k) => ({ '@type': 'ListItem', position: k + 1, name: p.link.titulo, url: SITE + p.caminho }))
      },
      {
        '@type': 'FAQPage', '@id': url + '#faq',
        mainEntity: hub.faq.map(([q, a]) => ({ '@type': 'Question', name: semTags(q), acceptedAnswer: { '@type': 'Answer', text: semTags(a) } }))
      }
    ]
  };
  const cards = paginas.map((p) => `<li><a href="${p.caminho}"><strong>${p.link.titulo}</strong><span>${p.link.desc}</span></a></li>`).join('\n');
  return cabeca({ title: hub.title, description: hub.description, canonical: url, jsonld }) + `
<body>
${topo()}
<main id="conteudo" class="hero-hub">
<h1>${hub.h1}</h1>
<p class="lead">${hub.lead}</p>
<h2 style="margin-top:12px">Escolha a calculadora</h2>
<ul class="links">
${cards}
</ul>
${cta('inicio')}
<article class="texto">
${hub.artigo}
</article>
${faqHtml(hub.faq)}
</main>
${rodape('inicio')}`;
}

/* ---------- 404 ---------- */

function pagina404() {
  const cards = paginas.map((p) => `<li><a href="${p.caminho}"><strong>${p.link.titulo}</strong><span>${p.link.desc}</span></a></li>`).join('\n');
  return cabeca({ title: 'Página não encontrada | ' + NOME_SITE, description: 'Esta página não existe. Veja as calculadoras de empréstimo, financiamento e juros disponíveis.', robots: 'noindex, follow' }) + `
<body>
${topo()}
<main id="conteudo">
<h1>Página não encontrada</h1>
<p class="lead">O endereço pode ter mudado ou ter sido digitado com algum erro. Escolha uma das calculadoras abaixo ou <a href="/">volte para o início</a>.</p>
<ul class="links">
${cards}
</ul>
</main>
${rodape('404')}`;
}

/* ---------- sitemap e robots ---------- */

function sitemap() {
  const urls = ['/'].concat(paginas.map((p) => p.caminho));
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${LASTMOD}</lastmod></url>`).join('\n') + '\n</urlset>\n';
}

function robots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
}

/* ---------- checagens ---------- */

function contarPalavras(html) {
  const t = semTags(html.replace(/<table[\s\S]*?<\/table>/g, ' '));
  return t.split(/\s+/).filter((w) => /[A-Za-zÀ-ú0-9]/.test(w)).length;
}

function gravar(rel, conteudo) {
  const destino = path.join(RAIZ, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, conteudo);
}

function main() {
  const problemas = [];
  const vistos = new Set();
  for (const p of paginas) {
    if (vistos.has(p.slug)) problemas.push('slug repetido: ' + p.slug);
    vistos.add(p.slug);
    if (p.title.length > 60) problemas.push(`${p.slug}: title com ${p.title.length} caracteres`);
    if (p.description.length > 155) problemas.push(`${p.slug}: description com ${p.description.length} caracteres`);
    const html = paginaCalculadora(p);
    const textoArtigo = (typeof p.artigo === 'function' ? p.artigo() : p.artigo);
    const palavras = contarPalavras(p.lead + ' ' + textoArtigo + ' ' + p.faq.map((x) => x.join(' ')).join(' '));
    if (palavras < 600 || palavras > 1200) problemas.push(`${p.slug}: ${palavras} palavras (alvo 600–1.200)`);
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) problemas.push(p.slug + ': precisa de exatamente um h1');
    gravar(p.caminho.replace(/^\//, '') + 'index.html', html);
    console.log(`${p.caminho.padEnd(34)} title ${String(p.title.length).padStart(2)}  desc ${String(p.description.length).padStart(3)}  palavras ${palavras}`);
  }
  if (hub.title.length > 60) problemas.push('hub: title longo');
  if (hub.description.length > 155) problemas.push('hub: description longa');
  gravar('index.html', paginaHub());
  gravar('404.html', pagina404());
  gravar('sitemap.xml', sitemap());
  gravar('robots.txt', robots());
  console.log(`/ (hub)                            title ${hub.title.length}  desc ${hub.description.length}`);
  if (problemas.length) {
    console.error('\nPROBLEMAS:\n- ' + problemas.join('\n- '));
    process.exit(1);
  }
  console.log('\nOK: ' + (paginas.length + 2) + ' páginas geradas, sitemap.xml e robots.txt.');
}

if (require.main === module) main();
module.exports = { linkPlay, contarPalavras, paginas };
