#!/usr/bin/env node
// Testes da matemática e das calculadoras (assets/calc.js). Uso: node tools/testar-calculos.js
'use strict';
const assert = require('assert');
const { C, R, AVISO } = require('../assets/calc.js');
const { paginas, hub } = require('./conteudo.js');

let ok = 0;
function t(nome, fn) {
  try { fn(); ok++; } catch (e) { console.error('FALHOU: ' + nome + '\n  ' + e.message); process.exitCode = 1; }
}
const perto = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} esperado ${b}, veio ${a}`);

/* ---------- referências do app ---------- */
t('R$ 15.000 a 2,2% em 24x = R$ 811,15', () => assert.strictEqual(C.brl(C.price(15000, 0.022, 24).parcela), 'R$ 811,15'));
t('R$ 40.000 a 1,49% em 48x = R$ 1.172,49', () => assert.strictEqual(C.brl(C.price(40000, 0.0149, 48).parcela), 'R$ 1.172,49'));
t('R$ 3.000 a 4,5% em 12x = R$ 329,00', () => assert.strictEqual(C.brl(C.price(3000, 0.045, 12).parcela), 'R$ 329,00'));

/* ---------- fórmulas ---------- */
t('PMT bate com a fórmula fechada', () => {
  for (const [pv, i, n] of [[1000, 0.01, 12], [50000, 0.035, 48], [2500, 0.15, 3], [100, 0.5, 1]]) {
    perto(C.pmt(pv, i, n), pv * i / (1 - Math.pow(1 + i, -n)), 1e-9);
  }
});
t('PMT com taxa zero = PV/n', () => perto(C.pmt(1200, 0, 12), 100, 1e-12));
t('anual → mensal: (1+a)^(1/12) − 1', () => {
  perto(C.mensalDeAnual(0.12), Math.pow(1.12, 1 / 12) - 1, 1e-15);
  perto(C.anualDeMensal(C.mensalDeAnual(0.3)), 0.3, 1e-12);
  assert.strictEqual(C.pct(C.mensalDeAnual(0.24)), '1,81%');
});
t('Price: saldo zera, amortizações somam o PV, total = parcela × n', () => {
  for (const [pv, i, n] of [[15000, 0.022, 24], [5000, 0.03, 12], [123456.78, 0.0179, 360], [100, 0, 3], [1000, 0.0001, 7]]) {
    const r = C.price(pv, i, n);
    assert.strictEqual(r.linhas.length, n);
    assert.strictEqual(r.linhas[n - 1].saldo, 0);
    perto(r.linhas.reduce((s, l) => s + l.amort, 0), pv, 0.005, 'soma amort');
    perto(r.linhas.reduce((s, l) => s + l.parcela, 0), r.total, 0.005, 'soma parcelas');
    for (const l of r.linhas) assert.ok(l.juros >= 0, 'juros negativo');
    // em prazos realistas, o resíduo do arredondamento cabe nos juros da última linha e o total é parcela × n
    if (i > 0.0001 && n <= 120) perto(r.total, C.r2(r.parcela * n), 0.005, 'total = parcela × n');
  }
});
t('Price: invariantes em varredura ampla (até 420 meses, até 30% a.m.)', () => {
  let n0 = 0;
  for (const n of [1, 2, 3, 6, 12, 18, 24, 36, 48, 60, 84, 120, 240, 360, 420]) {
    for (let t = 0; t <= 0.3; t += 0.0029) {
      if (Math.pow(1 + t, n) > 1e12) continue; // a interface recusa essas combinações
      for (const pv of [1, 99.99, 1000, 15000, 123456.78, 2500000]) {
        const r = C.price(pv, t, n), L = r.linhas;
        assert.strictEqual(L.length, n);
        perto(L.reduce((s, l) => s + l.amort, 0), pv, 0.01, `amort ${pv}/${t}/${n}`);
        assert.ok(Math.abs(L[n - 1].saldo) < 0.005, `saldo final ${pv}/${t}/${n}`);
        assert.ok(L.every((l) => l.amort > -1e-9 && l.juros > -1e-9), `negativo ${pv}/${t}/${n}`);
        perto(L.reduce((s, l) => s + l.parcela, 0), r.total, 0.011, `total ${pv}/${t}/${n}`);
        assert.ok(Math.abs(L[n - 1].parcela - r.parcela) <= Math.max(1, 0.01 * r.parcela) + 1e-9, `última parcela ${pv}/${t}/${n}`);
        n0++;
      }
    }
  }
  assert.ok(n0 > 5000);
});
t('Price 5.000 a 3% em 12x: primeiras linhas', () => {
  const l = C.price(5000, 0.03, 12).linhas;
  assert.deepStrictEqual([l[0].juros, l[0].amort, l[0].saldo], [150, 352.31, 4647.69]);
  assert.deepStrictEqual([l[1].juros, l[1].amort, l[1].saldo], [139.43, 362.88, 4284.81]);
});
t('SAC: amortização constante, parcelas decrescentes, saldo zera', () => {
  const r = C.sac(15000, 0.022, 24);
  assert.strictEqual(r.primeira, 955);
  assert.strictEqual(r.ultima, 638.75);
  assert.strictEqual(r.juros, 4125);
  assert.strictEqual(r.linhas[23].saldo, 0);
  for (let k = 1; k < 24; k++) assert.ok(r.linhas[k].parcela <= r.linhas[k - 1].parcela);
});
t('SAC paga menos juros que Price', () => {
  for (const [pv, i, n] of [[20000, 0.018, 36], [300000, 0.008, 360]]) assert.ok(C.sac(pv, i, n).juros < C.price(pv, i, n).juros);
});

/* ---------- taxa implícita (Newton + bisseção) ---------- */
t('taxa implícita recupera a taxa usada no PMT (vários casos)', () => {
  const casos = [[3000, 0.045, 12], [15000, 0.022, 24], [40000, 0.0149, 48], [1000, 0.0001, 6], [500, 0.8, 10], [100000, 0.009, 420], [1000, 0.2, 1], [2000, 3, 4]];
  for (const [pv, i, n] of casos) {
    const pm = C.pmt(pv, i, n);
    const r = C.taxaImplicita(pv, pm, n, false);
    assert.strictEqual(r.status, 'ok', `status para ${pv}/${i}/${n}`);
    perto(r.i, i, 1e-9, `taxa ${pv}/${i}/${n}`);
  }
});
t('taxa implícita com 1ª parcela no ato (série antecipada)', () => {
  for (const [pv, i, n] of [[1800, 0.03, 12], [2000, 0.05, 10], [999, 0.012, 2]]) {
    const pm = C.pmt(pv, i, n) / (1 + i); // parcela antecipada
    const r = C.taxaImplicita(pv, pm, n, true);
    assert.strictEqual(r.status, 'ok');
    perto(r.i, i, 1e-9);
  }
});
t('3.000 em 12x de 329,00 → 4,50% a.m.', () => assert.strictEqual(C.pct(C.taxaImplicita(3000, 329, 12).i), '4,50%'));
t('celular 1.800 ou 12x 179,90 → 2,91% / no ato 3,49%', () => {
  assert.strictEqual(C.pct(C.taxaImplicita(1800, 179.9, 12, false).i), '2,91%');
  assert.strictEqual(C.pct(C.taxaImplicita(1800, 179.9, 12, true).i), '3,49%');
});
t('taxa implícita: 0%, soma menor, entrada >= valor', () => {
  assert.strictEqual(C.taxaImplicita(1800, 150, 12).status, 'zero');
  assert.strictEqual(C.taxaImplicita(1800, 140, 12).status, 'menor');
  assert.strictEqual(C.taxaImplicita(1000, 1000, 3, true).status, 'invalido');
  assert.strictEqual(C.taxaImplicita(0, 10, 3).status, 'invalido');
});
t('taxa implícita converge com resíduo < 1e-6 do valor', () => {
  const r = C.taxaImplicita(7350, 412.77, 30, false);
  const vp = C.valorPresente(412.77, r.i, 30);
  perto(vp, 7350, 1e-6);
  assert.ok(r.iteracoes < 60, 'iterações demais: ' + r.iteracoes);
});

/* ---------- juros compostos ---------- */
t('compostos = fórmula fechada', () => {
  const [c, a, i, n] = [1000, 300, 0.008, 120];
  const r = C.compostos(c, a, i, n);
  perto(r.final, c * Math.pow(1 + i, n) + a * (Math.pow(1 + i, n) - 1) / i, 1e-6);
  assert.strictEqual(C.brl(r.final), 'R$ 62.666,98');
  assert.strictEqual(C.brl(C.compostos(10000, 0, 0.01, 12).final), 'R$ 11.268,25');
});

/* ---------- leitura e formato pt-BR ---------- */
t('leitura aceita vírgula ou ponto', () => {
  const casos = { '15.000': 15000, '15000': 15000, '15.000,50': 15000.5, '15,000.50': 15000.5, '2,2': 2.2, '2.2': 2.2,
    'R$ 1.234,56': 1234.56, '4,5%': 4.5, '1.5': 1.5, ' 329,00 ': 329, '1.234.567': 1234567, ',5': 0.5 };
  for (const [s, v] of Object.entries(casos)) assert.strictEqual(C.lerNumero(s), v, s);
  assert.strictEqual(C.lerNumero('1.500', true), 1.5, 'taxa com ponto');
  assert.ok(isNaN(C.lerNumero('abc')));
  assert.ok(isNaN(C.lerNumero('')));
  assert.ok(isNaN(C.lerNumero('1,2,3x')));
});
t('formato pt-BR', () => {
  assert.strictEqual(C.brl(1234.56), 'R$ 1.234,56');
  assert.strictEqual(C.brl(1000000), 'R$ 1.000.000,00');
  assert.strictEqual(C.brl(0.005), 'R$ 0,01');
  assert.strictEqual(C.brl(1.005), 'R$ 1,01');
  assert.strictEqual(C.brl(-0.001), 'R$ 0,00');
  assert.strictEqual(C.pct(0.2984), '29,84%');
});

/* ---------- calculadoras (HTML) ---------- */
t('todas as calculadoras: exemplo padrão ok, com aviso', () => {
  const ex = {
    emprestimo: { valor: '15.000', taxa: '2,2', tipo: 'mes', prazo: '24', sistema: 'price' },
    price: { valor: '5.000', taxa: '3', tipo: 'mes', prazo: '12' },
    rapido: { valor: '5.000', taxa: '2,5', tipo: 'mes', prazo: '24' },
    financiamento: { valor: '60.000', entrada: '20.000', taxa: '1,49', tipo: 'mes', prazo: '48' },
    parcelamento: { avista: '1.800', parcela: '179,90', n: '12', ato: 'nao' },
    taxa: { valor: '3.000', parcela: '329,00', n: '12', ato: 'nao' },
    pricesac: { valor: '20.000', taxa: '1,8', tipo: 'mes', prazo: '36' },
    consignado: { renda: '3.000', margem: '35', valor: '10.000', taxa: '1,8', tipo: 'mes', prazo: '48' },
    compostos: { inicial: '1.000', aporte: '300', taxa: '0,8', tipo: 'mes', prazo: '10', unidade: 'anos' },
    cartao: { fatura: '2.000', pago: '500', rotativo: '14', taxaparc: '8', n: '6' }
  };
  for (const [k, v] of Object.entries(ex)) {
    const r = R[k](Object.assign({}, v));
    assert.ok(r.ok, k + ' não ok');
    assert.ok(r.html.includes(AVISO), k + ' sem aviso');
  }
  assert.ok(R.emprestimo(ex.emprestimo).html.includes('R$ 811,15'));
  assert.ok(R.financiamento(ex.financiamento).html.includes('R$ 1.172,49'));
  assert.ok(R.taxa(ex.taxa).html.includes('4,50%'));
  assert.ok(R.cartao(ex.cartao).html.includes('R$ 210,00'));
});
t('taxa ao ano é convertida (24% a.a. → parcela igual a 1,81% a.m.)', () => {
  const a = R.emprestimo({ valor: '10000', taxa: '24', tipo: 'ano', prazo: '12', sistema: 'price' }).html;
  const pm = C.brl(C.r2(C.pmt(10000, C.mensalDeAnual(0.24), 12)));
  assert.ok(a.includes(pm), 'parcela anual');
});
t('erros amigáveis em campos inválidos (com aviso)', () => {
  const casos = [
    R.emprestimo({ valor: 'abc', taxa: '2', tipo: 'mes', prazo: '12' }),
    R.emprestimo({ valor: '1000', taxa: '-1', tipo: 'mes', prazo: '12' }),
    R.emprestimo({ valor: '1000', taxa: '2', tipo: 'mes', prazo: '0' }),
    R.emprestimo({ valor: '1000', taxa: '2', tipo: 'mes', prazo: '12,5' }),
    R.emprestimo({ valor: '1000', taxa: '200', tipo: 'mes', prazo: '12' }),
    R.financiamento({ valor: '1000', entrada: '1000', taxa: '2', tipo: 'mes', prazo: '12' }),
    R.compostos({ inicial: '0', aporte: '0', taxa: '1', tipo: 'mes', prazo: '1', unidade: 'anos' }),
    R.consignado({ renda: '3000', margem: '0', valor: '1000', taxa: '2', tipo: 'mes', prazo: '12' })
  ];
  for (const r of casos) { assert.ok(!r.ok); assert.ok(r.html.includes('res-erro')); assert.ok(r.html.includes(AVISO)); }
  assert.ok(R.taxa({ valor: '1800', parcela: '150', n: '12', ato: 'nao' }).html.includes('0% ao mês'));
  assert.ok(R.taxa({ valor: '1800', parcela: '100', n: '12', ato: 'nao' }).html.includes('menos do que'));
});
t('taxa 0% funciona em todas as contas', () => {
  assert.ok(R.emprestimo({ valor: '1200', taxa: '0', tipo: 'mes', prazo: '12', sistema: 'price' }).html.includes('R$ 100,00'));
  assert.ok(R.emprestimo({ valor: '1200', taxa: '0', tipo: 'mes', prazo: '12', sistema: 'sac' }).ok);
  assert.ok(R.compostos({ inicial: '100', aporte: '10', taxa: '0', tipo: 'mes', prazo: '12', unidade: 'meses' }).html.includes('R$ 220,00'));
});

/* ---------- números fixos citados nos textos/FAQ ---------- */
t('números citados nas FAQs batem com a calculadora', () => {
  const cit = {
    'simulador-emprestimo': [C.brl(C.price(15000, 0.022, 24).parcela), C.pct(C.anualDeMensal(0.022)), C.brl(C.price(15000, 0.022, 24).juros), C.brl(C.sac(15000, 0.022, 24).juros)],
    'simulador-financiamento-carro': [C.brl(C.price(40000, 0.0149, 48).parcela)],
    'simulador-financiamento-moto': [C.brl(C.price(12000, 0.0199, 36).parcela)],
    'emprestimo-consignado': [C.brl(C.price(10000, 0.018, 48).parcela)],
    'juros-parcelamento': [C.pct(C.taxaImplicita(1800, 179.9, 12).i), C.pct(C.taxaImplicita(1800, 179.9, 12, true).i)],
    'descobrir-taxa-de-juros': [C.pct(C.taxaImplicita(3000, 329, 12).i), C.pct(948 / 3000 / 12), C.pct(C.anualDeMensal(0.045))],
    'tabela-price': [C.brl(C.price(5000, 0.03, 12).parcela)],
    'juros-compostos': [C.brl(C.compostos(10000, 0, 0.01, 12).final), C.pct(C.mensalDeAnual(0.12))],
    'juros-cartao-de-credito': [C.brl(1500 * 0.14)]
  };
  for (const p of paginas) {
    const txt = p.faq.map((x) => x[1]).join(' ').replace(/R\$ /g, 'R$ ');
    for (const n of cit[p.slug] || []) assert.ok(txt.includes(n), `${p.slug}: FAQ não contém ${n}`);
  }
});

/* ---------- compliance do texto ---------- */
t('textos sem promessas proibidas nem nomes de bancos/programas', () => {
  const proibidos = [/taxa baixa/i, /cr[ée]dito aprovado/i, /dinheiro r[áa]pido/i, /aprova[çc][ãa]o garantida/i, /\bItaú\b/, /\bBradesco\b/, /\bSantander\b/,
    /\bNubank\b/, /Banco do Brasil/, /Caixa Econ/, /\bINSS\b/, /\bFGTS\b/, /Banco Central/, /\bSerasa\b/, /\bPix\b/, /Desenrola/, /Crédito do Trabalhador/, /\bBMG\b/, /\bC6\b/, /\bPicPay\b/, /Mercado Pago/, /aggregateRating/];
  const fs = require('fs'), path = require('path');
  const raiz = path.resolve(__dirname, '..');
  const arquivos = ['index.html', '404.html'].concat(paginas.map((p) => p.caminho.slice(1) + 'index.html'));
  for (const a of arquivos) {
    const html = fs.readFileSync(path.join(raiz, a), 'utf8');
    for (const re of proibidos) assert.ok(!re.test(html), `${a}: contém ${re}`);
  }
});

console.log(`${ok} testes passaram` + (process.exitCode ? ' (houve falhas)' : ''));
