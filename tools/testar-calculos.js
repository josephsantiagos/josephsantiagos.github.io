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
    cartao: { fatura: '2.000', pago: '500', rotativo: '14', taxaparc: '8', n: '6' },
    quitacao: { parcela: '650,00', taxa: '2,5', tipo: 'mes', restantes: '18' },
    converter: { taxa: '2', de: 'mes' },
    simples: { capital: '10.000', taxa: '2', tipo: 'mes', prazo: '24', unidade: 'meses' },
    cet: { liberado: '10.000', parcela: '595,00', n: '24', anunciada: '2,5' },
    iof: { valor: '10.000', taxa: '2,5', tipo: 'mes', prazo: '24', modo: 'financiado' },
    passos: { valor: '8.000', taxa: '3', tipo: 'mes', prazo: '12' },
    imovel: { valor: '400.000', entrada: '100.000', taxa: '11', tipo: 'ano', prazo: '360', sistema: 'sac' },
    crediario: { avista: '2.400', entrada: '300', parcela: '259,90', n: '10' },
    comparar: { valor: '10.000', taxaa: '3,5', prazoa: '24', taxab: '1,8', prazob: '36' }
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

// compara textos ignorando a diferença entre espaço comum e o espaço fixo usado em "R$ 1,00"
const tem = (h, x) => h.replace(/\u00a0/g, ' ').includes(String(x).replace(/\u00a0/g, ' '));

/* ---------- quitação antecipada ---------- */
t('quitação: valor presente das parcelas restantes', () => {
  // 18 × 650 a 2,5% a.m. → 650 × (1 − 1,025^−18) / 0,025
  perto(C.valorPresente(650, 0.025, 18), 650 * (1 - Math.pow(1.025, -18)) / 0.025, 1e-9);
  const h = R.quitacao({ parcela: '650,00', taxa: '2,5', tipo: 'mes', restantes: '18' }).html;
  assert.ok(tem(h, 'R$ 9.329,69'), 'valor para quitar');
  assert.ok(tem(h, 'R$ 2.370,31'), 'desconto');
  assert.ok(tem(h, '416,76'), 'última parcela antecipada');
});
t('quitação: antecipar todas = quitar; última parcela tem o maior desconto', () => {
  for (const [pm, i, n] of [[650, 0.025, 18], [1172.49, 0.0149, 48], [99.9, 0.08, 7]]) {
    perto(C.anteciparUltimas(pm, i, n, n), C.valorPresente(pm, i, n), 1e-6);
    const ultima = C.anteciparUltimas(pm, i, n, 1), proxima = pm / (1 + i);
    assert.ok(ultima < proxima, 'a última deve sair mais barata que a próxima');
    perto(ultima, pm / Math.pow(1 + i, n), 1e-9);
  }
});
t('quitação: taxa zero não dá desconto; taxa ao ano é convertida; erros', () => {
  assert.ok(R.quitacao({ parcela: '100', taxa: '0', tipo: 'mes', restantes: '12' }).html.replace(/\u00a0/g, ' ').includes('R$ 1.200,00'));
  const anual = R.quitacao({ parcela: '500', taxa: '24', tipo: 'ano', restantes: '12' }).html;
  assert.ok(tem(anual, C.brl(C.r2(C.valorPresente(500, C.mensalDeAnual(0.24), 12)))));
  assert.ok(!R.quitacao({ parcela: '500', taxa: '2', tipo: 'mes', restantes: '421' }).ok);
  assert.ok(!R.quitacao({ parcela: '', taxa: '2', tipo: 'mes', restantes: '10' }).ok);
});

/* ---------- conversão de taxa ---------- */
t('conversão: mensal ↔ anual ↔ diária por juros compostos', () => {
  perto(C.equivalente(0.02, 30, 360), Math.pow(1.02, 12) - 1, 1e-12);
  perto(C.equivalente(0.12, 360, 30), C.mensalDeAnual(0.12), 1e-12);
  perto(C.equivalente(C.equivalente(0.035, 30, 1), 1, 30), 0.035, 1e-12);
  assert.strictEqual(C.pct(C.equivalente(0.001, 1, 30)), '3,04%');
  assert.strictEqual(C.pct(C.mensalDeAnual(0.12), 4), '0,9489%');
  assert.strictEqual(C.pct(C.anualDeMensal(0.01)), '12,68%');
});
t('conversão: calculadora (mês, ano, dia) e erros', () => {
  const m = R.converter({ taxa: '2', de: 'mes' }).html;
  assert.ok(tem(m, '26,82% ao ano') && tem(m, '24,00%'), 'mensal → anual e proporcional');
  assert.ok(R.converter({ taxa: '12', de: 'ano' }).html.replace(/\u00a0/g, ' ').includes('0,9489%'), 'anual → mensal');
  assert.ok(R.converter({ taxa: '0,1', de: 'dia' }).html.replace(/\u00a0/g, ' ').includes('3,04% ao mês'), 'diária → mensal');
  assert.ok(!R.converter({ taxa: '-1', de: 'mes' }).ok);
  assert.ok(!R.converter({ taxa: 'x', de: 'mes' }).ok);
  assert.ok(!R.converter({ taxa: '5', de: 'dia' }).ok, 'taxa diária absurda');
});

/* ---------- juros simples ---------- */
t('juros simples: J = C·i·t e comparação com compostos', () => {
  perto(C.montanteSimples(10000, 0.02, 24), 14800, 1e-9);
  perto(C.montanteComposto(10000, 0.02, 24), 10000 * Math.pow(1.02, 24), 1e-9);
  const h = R.simples({ capital: '10.000', taxa: '2', tipo: 'mes', prazo: '24', unidade: 'meses' }).html;
  assert.ok(tem(h, 'R$ 4.800,00') && tem(h, 'R$ 16.084,37') && tem(h, 'R$ 1.284,37'));
  // em 1 período os dois regimes coincidem; em menos de 1 período o simples é maior
  assert.ok(R.simples({ capital: '1000', taxa: '2', tipo: 'mes', prazo: '1', unidade: 'meses' }).html.replace(/\u00a0/g, ' ').includes('mesmo resultado'));
  const meio = R.simples({ capital: '1000', taxa: '10', tipo: 'ano', prazo: '6', unidade: 'meses' }).html;
  assert.ok(tem(meio, 'R$ 1.050,00') && tem(meio, C.brl(1000 * Math.sqrt(1.1))), '10% a.a. por 6 meses');
  assert.ok(R.simples({ capital: '1000', taxa: '12', tipo: 'ano', prazo: '2', unidade: 'anos' }).html.replace(/\u00a0/g, ' ').includes('R$ 1.240,00'));
});

/* ---------- IOF ---------- */
t('IOF: 0,38% + 0,0082% ao dia até 365 dias, financiado e descontado', () => {
  perto(C.aliquotaIof(0.03, 1, 'price').total, 0.0038 + 30 * 0.000082, 1e-12, '1 parcela');
  perto(C.aliquotaIof(0, 2, 'price').total, 0.0038 + (30 + 60) / 2 * 0.000082, 1e-12, 'taxa zero');
  perto(C.aliquotaIof(0.02, 2, 'sac').total, 0.0038 + (30 + 60) / 2 * 0.000082, 1e-12, 'SAC');
  for (const n of [1, 6, 12, 13, 24, 60, 120, 420]) {
    const a = C.aliquotaIof(0.025, n, 'price').total;
    assert.ok(a > 0.0038 && a <= 0.0038 + 365 * 0.000082 + 1e-12, 'teto ' + n);
    if (n > 1) assert.ok(a > C.aliquotaIof(0.025, n - 1, 'price').total - 1e-12, 'cresce com o prazo ' + n);
  }
  for (const [v, i, n] of [[10000, 0.025, 24], [1000, 0.08, 10], [250000, 0.012, 420], [500, 0, 3]]) {
    const f = C.iof(v, i, n, 'price', true), d = C.iof(v, i, n, 'price', false);
    perto(f.contrato - f.total, v, 0.005, 'financiado: recebe o valor pedido');
    perto(f.fixo + f.diario, f.total, 0.005, 'financiado: partes somam');
    perto(d.liquido + d.total, v, 0.005, 'descontado: líquido + IOF');
    perto(f.total, f.contrato * f.aliquota, 0.02, 'financiado: IOF do contrato');
  }
  const x = C.iof(10000, 0.025, 24, 'price', true);
  assert.ok(tem(C.brl(x.total), 'R$ 289,05') && tem(C.brl(x.contrato), 'R$ 10.289,05'), 'exemplo do texto');
  assert.ok(tem(C.brl(C.iof(1000, 0.05, 1, 'price', false).total), 'R$ 6,26'), '1 mês');
  const h = R.iof({ valor: '10.000', taxa: '2,5', tipo: 'mes', prazo: '24', modo: 'descontado' }).html;
  assert.ok(tem(h, 'R$ 280,93') && tem(h, 'R$ 9.719,07'), 'descontado no HTML');
  assert.ok(!R.iof({ valor: '0', taxa: '2', tipo: 'mes', prazo: '12' }).ok, 'valor zero');
});

/* ---------- CET ---------- */
t('CET: taxa efetiva pelo valor liberado e efeito dos encargos', () => {
  const r = C.taxaImplicita(10000, 595, 24, false);
  perto(C.valorPresente(595, r.i, 24), 10000, 1e-6);
  const h = R.cet({ liberado: '10.000', parcela: '595,00', n: '24', anunciada: '2,5' }).html;
  assert.ok(tem(h, '3,07% ao mês') && tem(h, '43,76% ao ano'), 'CET mensal/anual');
  assert.ok(tem(h, 'R$ 10.641,57') && tem(h, 'R$ 641,57'), 'contrato bruto e encargos');
  const sem = R.cet({ liberado: '10.000', parcela: '595,00', n: '24', anunciada: '' });
  assert.ok(sem.ok && !sem.html.replace(/\u00a0/g, ' ').includes('anunciada de'), 'taxa anunciada é opcional');
  assert.ok(R.cet({ liberado: '10.000', parcela: '400', n: '24', anunciada: '' }).html.replace(/\u00a0/g, ' ').includes('menos do que'), 'parcelas somam menos');
  assert.ok(R.cet({ liberado: '10.000', parcela: '595', n: '24', anunciada: '4' }).html.replace(/\u00a0/g, ' ').includes('res-erro'), 'anunciada maior que o CET');
});

/* ---------- financiamento com entrada (veículo e imóvel) ---------- */
t('financiamento: entrada sai do valor financiado (carro e imóvel)', () => {
  const car = R.financiamento({ valor: '60.000', entrada: '20.000', taxa: '1,49', tipo: 'mes', prazo: '48' }).html;
  assert.ok(tem(car, C.brl(C.price(40000, 0.0149, 48).parcela)));
  const i = C.mensalDeAnual(0.11);
  const sac = C.sac(300000, i, 360), pr = C.price(300000, i, 360);
  assert.strictEqual(sac.primeira, C.r2(300000 / 360) + C.r2(300000 * i));
  const h = R.imovel({ valor: '400.000', entrada: '100.000', taxa: '11', tipo: 'ano', prazo: '360', sistema: 'sac' }).html;
  assert.ok(tem(h, 'R$ 3.453,71') && tem(h, 'R$ 300.000,00') && tem(h, '(25,0%)'), 'SAC com entrada');
  assert.ok(tem(h, C.brl(pr.parcela)) && tem(h, C.brl(C.r2(pr.juros - sac.juros))), 'comparação com a Price');
  assert.ok(tem(h, C.brl(C.r2(sac.primeira / 0.3))), 'renda de referência');
  const hp = R.imovel({ valor: '400.000', entrada: '100.000', taxa: '11', tipo: 'ano', prazo: '360', sistema: 'price' }).html;
  assert.ok(tem(hp, 'Parcela mensal (Price)') && tem(hp, 'R$ 2.740,07'));
  assert.ok(R.imovel({ valor: '400.000', entrada: '0', taxa: '0,9', tipo: 'mes', prazo: '420', sistema: 'price' }).ok, '420 meses sem entrada');
  assert.ok(!R.imovel({ valor: '400.000', entrada: '0', taxa: '0,9', tipo: 'mes', prazo: '421', sistema: 'sac' }).ok, 'prazo > 420');
  assert.ok(!R.imovel({ valor: '400.000', entrada: '400.000', taxa: '11', tipo: 'ano', prazo: '360', sistema: 'sac' }).ok, 'entrada = valor');
  // custo total = entrada + parcelas
  assert.ok(tem(h, C.brl(C.r2(100000 + sac.total))));
});

/* ---------- crediário, comparação e passo a passo ---------- */
t('crediário: taxa sobre o saldo (preço à vista − entrada)', () => {
  const h = R.crediario({ avista: '2.400', entrada: '300', parcela: '259,90', n: '10' }).html;
  assert.ok(tem(h, C.pct(C.taxaImplicita(2100, 259.9, 10).i) + ' ao mês') && tem(h, 'R$ 499,00'));
  assert.strictEqual(C.pct(C.taxaImplicita(2100, 259.9, 10).i), '4,08%');
  assert.ok(R.crediario({ avista: '1.000', entrada: '0', parcela: '100', n: '10' }).html.replace(/\u00a0/g, ' ').includes('0% ao mês'));
  assert.ok(!R.crediario({ avista: '1.000', entrada: '1.000', parcela: '100', n: '10' }).ok);
});
t('comparar ofertas: escolhe a de menor custo total', () => {
  const h = R.comparar({ valor: '10.000', taxaa: '3,5', prazoa: '24', taxab: '1,8', prazob: '36' }).html;
  assert.ok(tem(h, 'oferta B') && tem(h, 'R$ 1.271,28') && tem(h, 'R$ 622,73') && tem(h, 'R$ 379,84'));
  const h2 = R.comparar({ valor: '10.000', taxaa: '2', prazoa: '12', taxab: '2', prazob: '48' }).html;
  assert.ok(tem(h2, 'oferta A') && tem(h2, 'parcela é'), 'prazo curto: mais barata, parcela maior');
});
t('passo a passo: mostra as contas da fórmula', () => {
  const h = R.passos({ valor: '8.000', taxa: '3', tipo: 'mes', prazo: '12' }).html;
  for (const x of ['1,425761', '0,701380', '0,298620', 'R$ 803,70', 'R$ 1.644,40', 'R$ 240,00', 'R$ 563,70']) assert.ok(tem(h, x), x);
  assert.ok(R.passos({ valor: '1.200', taxa: '0', tipo: 'mes', prazo: '12' }).html.replace(/\u00a0/g, ' ').includes('R$ 100,00'));
  assert.ok(R.passos({ valor: '10.000', taxa: '24', tipo: 'ano', prazo: '12' }).html.replace(/\u00a0/g, ' ').includes('(1 + 0,2400)'));
});

/* ---------- páginas por valor ---------- */
t('páginas por valor: tabela 7 prazos × 4 taxas, calculadora com o valor e FAQ correta', () => {
  const fs = require('fs'), path = require('path');
  const raiz = path.resolve(__dirname, '..');
  const valores = paginas.filter((p) => /^emprestimo-de-\d+-reais$/.test(p.slug));
  assert.strictEqual(valores.length, 13);
  for (const p of valores) {
    const v = Number(p.slug.match(/\d+/)[0]);
    const html = fs.readFileSync(path.join(raiz, p.caminho.slice(1), 'index.html'), 'utf8');
    const tab = html.match(/<table class="tabela-pronta">[\s\S]*?<\/table>/)[0];
    assert.strictEqual((tab.match(/<td>/g) || []).length, 28, p.slug + ': células');
    for (const n of [6, 12, 18, 24, 36, 48, 60]) {
      for (const tx of [0.015, 0.025, 0.035, 0.05]) assert.ok(tab.includes(C.fmt(C.price(v, tx, n).parcela)), `${p.slug} ${n}x ${tx}`);
    }
    assert.ok(tem(html, `id="emprestimo-valor" name="valor" type="text" inputmode="decimal" autocomplete="off" value="${C.fmt(v, 0)}"`), p.slug + ': valor pré-preenchido');
    const prazo = p.calc.campos.find((x) => x.nome === 'prazo').valor;
    assert.ok(tem(html, C.brl(C.price(v, 0.025, Number(prazo)).parcela)), p.slug + ': resultado pré-calculado');
    assert.ok(p.faq.length >= 5);
  }
  const qf = fs.readFileSync(path.join(raiz, 'quanto-fica-emprestimo/index.html'), 'utf8');
  for (const p of valores) assert.ok(qf.includes(`href="${p.caminho}"`), 'quanto-fica sem link para ' + p.caminho);
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
    'juros-cartao-de-credito': [C.brl(1500 * 0.14)],
    'quitar-emprestimo-antecipado': ['R$ 9.329,69', 'R$ 11.700,00', 'R$ 416,76'],
    'converter-taxa-de-juros': ['26,82%', '0,9489%', '3,04%', '12,68%', '42,58%'],
    'calculadora-juros-simples': ['R$ 4.800,00', 'R$ 14.800,00', 'R$ 16.084,37', '4,88%'],
    'o-que-e-cet': ['3,07%', '43,76%'],
    'calculadora-iof-emprestimo': ['R$ 289,05', 'R$ 209,42', '3,37%', 'R$ 6,26'],
    'como-calcular-juros-de-emprestimo': ['R$ 803,70', 'R$ 1.644,40', '2,60%'],
    'financiamento-imobiliario': ['R$ 3.453,71', 'R$ 2.740,07', 'R$ 213.445,05'],
    'juros-crediario': ['4,08%'],
    'emprestimo-de-1000-reais': [C.brl(C.price(1000, 0.025, 12).parcela)],
    'emprestimo-de-5000-reais': [C.brl(C.price(5000, 0.025, 24).parcela)],
    'emprestimo-de-10000-reais': [C.brl(C.price(10000, 0.025, 24).parcela)],
    'emprestimo-de-50000-reais': [C.brl(C.price(50000, 0.025, 60).parcela)]
  };
  for (const p of paginas) {
    const txt = p.faq.map((x) => x[1]).join(' ');
    for (const n of cit[p.slug] || []) assert.ok(tem(txt, n), `${p.slug}: FAQ não contém ${n}`);
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
