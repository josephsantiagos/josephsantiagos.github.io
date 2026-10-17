/*! Calculadora Empréstimo e Juros — calculadoras do site.
 * JavaScript puro, sem dependências. O mesmo arquivo roda no navegador e no
 * Node (o gerador do site usa os mesmos cálculos para pré-renderizar o resultado).
 */
(function (root) {
  'use strict';

  var AVISO = 'Simulação ilustrativa. Não oferecemos nem intermediamos crédito e não temos vínculo com bancos, financeiras ou órgãos públicos. Antes de contratar, confira o Custo Efetivo Total (CET) informado pela instituição.';

  /* =========================================================
   * Números: leitura (aceita vírgula ou ponto) e formato pt-BR
   * ========================================================= */

  // Converte texto digitado em número. Aceita "15.000", "15000", "15.000,50",
  // "15,000.50", "2,2", "2.2", "R$ 1.234,56", "4,5%".
  // Em campos de taxa (decimalComPonto = true) um ponto sozinho é sempre decimal.
  function lerNumero(v, decimalComPonto) {
    if (typeof v === 'number') return v;
    if (v == null) return NaN;
    var s = String(v).replace(/R\$/gi, '').replace(/[\s %]/g, '');
    if (!s) return NaN;
    var virgula = s.lastIndexOf(','), ponto = s.lastIndexOf('.');
    if (virgula > -1 && ponto > -1) {
      // o separador que aparece por último é o decimal
      if (virgula > ponto) s = s.replace(/\./g, '').replace(',', '.');
      else s = s.replace(/,/g, '');
    } else if (virgula > -1) {
      if ((s.match(/,/g) || []).length > 1) s = s.replace(/,/g, '');
      else s = s.replace(',', '.');
    } else if (ponto > -1 && !decimalComPonto) {
      if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    }
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return parseFloat(s);
  }

  // Arredonda para centavos (meio centavo para cima, sem erro de ponto flutuante).
  function r2(x) {
    var sinal = x < 0 ? -1 : 1;
    return sinal * Math.round(Math.abs(x) * 100 + 1e-7) / 100;
  }

  function fmt(x, casas) {
    if (casas == null) casas = 2;
    var f = Math.pow(10, casas);
    var v = Math.round(Math.abs(x) * f + 1e-7) / f;
    var neg = x < 0 && v !== 0;
    var p = v.toFixed(casas).split('.');
    return (neg ? '-' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (casas ? ',' + p[1] : '');
  }
  function brl(x) { return 'R$ ' + fmt(x, 2); }
  function pct(fracao, casas) { return fmt(fracao * 100, casas == null ? 2 : casas) + '%'; }

  /* =========================================================
   * Matemática financeira
   * ========================================================= */

  function mensalDeAnual(a) { return Math.pow(1 + a, 1 / 12) - 1; }
  function anualDeMensal(i) { return Math.pow(1 + i, 12) - 1; }

  // Parcela da Tabela Price: PMT = PV·i / (1 − (1+i)^−n)
  function pmt(pv, i, n) {
    if (i === 0) return pv / n;
    return pv * i / (1 - Math.pow(1 + i, -n));
  }
  // Valor presente de n parcelas iguais (quanto dá para pegar com uma parcela).
  function valorPresente(parcela, i, n) {
    if (i === 0) return parcela * n;
    return parcela * (1 - Math.pow(1 + i, -n)) / i;
  }

  // Tabela Price com parcela arredondada em centavos (como no contrato):
  // todas as parcelas iguais; a última linha absorve o resíduo (centavos) dos arredondamentos.
  // Em combinações extremas de taxa e prazo esse resíduo cresce com os juros compostos;
  // nesses casos a tabela usa a parcela exata (sem arredondar) para não distorcer as linhas.
  function price(pv, i, n) {
    var exata = pmt(pv, i, n);
    var p = r2(exata);
    var tol = Math.max(1, 0.01 * p);
    var saldo = pv, linhas = [], total = 0, ruim = false;
    for (var k = 1; k <= n; k++) {
      var j, a, pk;
      if (k < n) {
        j = r2(saldo * i); a = r2(p - j); pk = p;
        if (a < 0 || saldo - a < 0) { ruim = true; break; }
      } else {
        a = r2(saldo);
        var jNat = r2(saldo * i);
        if (p - a >= 0 && Math.abs((p - a) - jNat) <= tol) { j = r2(p - a); pk = p; }
        else { j = jNat; pk = r2(a + j); }
        if (Math.abs(pk - p) > tol) ruim = true;
      }
      saldo = r2(saldo - a);
      if (Math.abs(saldo) < 0.005) saldo = 0;
      total += pk;
      linhas.push({ mes: k, parcela: pk, juros: j, amort: a, saldo: saldo });
    }
    if (ruim) return priceExata(pv, i, n, exata);
    total = r2(total);
    return { sistema: 'price', parcela: p, primeira: linhas[0].parcela, ultima: linhas[n - 1].parcela,
      total: total, juros: r2(total - pv), linhas: linhas };
  }

  // Tabela Price sem arredondar no meio do caminho (valores arredondados só na exibição).
  function priceExata(pv, i, n, exata) {
    var saldo = pv, linhas = [];
    for (var k = 1; k <= n; k++) {
      var j = saldo * i, a = exata - j;
      if (k === n) a = saldo;
      saldo = saldo - a;
      linhas.push({ mes: k, parcela: exata, juros: j, amort: a, saldo: Math.abs(saldo) < 0.005 ? 0 : saldo });
    }
    var total = r2(exata * n);
    return { sistema: 'price', parcela: exata, primeira: exata, ultima: exata,
      total: total, juros: r2(total - pv), linhas: linhas };
  }

  // SAC: amortização constante, juros sobre o saldo, parcela decrescente.
  function sac(pv, i, n) {
    var a0 = r2(pv / n), saldo = pv, linhas = [], total = 0;
    for (var k = 1; k <= n; k++) {
      var a = k < n ? a0 : r2(saldo);
      var j = r2(saldo * i);
      var pk = r2(a + j);
      saldo = r2(saldo - a);
      if (Math.abs(saldo) < 0.005) saldo = 0;
      total += pk;
      linhas.push({ mes: k, parcela: pk, juros: j, amort: a, saldo: saldo });
    }
    total = r2(total);
    return { sistema: 'sac', parcela: linhas[0].parcela, primeira: linhas[0].parcela, ultima: linhas[n - 1].parcela,
      total: total, juros: r2(total - pv), linhas: linhas };
  }

  // Taxa mensal implícita: acha i tal que valor presente das parcelas = valor recebido.
  // antecipada = true quando a 1ª parcela é paga no ato (série antecipada).
  // Newton-Raphson com queda para bisseção; tolerância 1e-10.
  // status: 'ok' | 'zero' (sem juros) | 'menor' (parcelas somam menos que o valor) | 'invalido'
  function taxaImplicita(pv, parcela, n, antecipada) {
    var soma = parcela * n;
    var d = antecipada ? 1 : 0;
    if (!(pv > 0) || !(parcela > 0) || !(n >= 1)) return { status: 'invalido', soma: soma };
    if (Math.abs(soma - pv) < 0.005) return { status: 'zero', i: 0, a: 0, soma: soma, iteracoes: 0 };
    if (soma < pv) return { status: 'menor', soma: soma };
    if (d && parcela >= pv) return { status: 'invalido', soma: soma, motivo: 'entrada' };

    // f(i) = parcela·Σ (1+i)^−(k−d) − pv  (decrescente em i) e sua derivada
    function f(i) {
      var v = 1 / (1 + i), vp = 0, dv = 0;
      for (var k = 1; k <= n; k++) {
        var t = k - d;
        var pk = Math.pow(v, t);
        vp += pk;
        dv -= t * pk * v;
      }
      return [parcela * vp - pv, parcela * dv];
    }

    var lo = 0, hi = 1;
    while (f(hi)[0] > 0 && hi < 1e6) { lo = hi; hi *= 2; }
    if (f(hi)[0] > 0) return { status: 'invalido', soma: soma };

    // chute inicial: aproximação por juros simples, dentro do intervalo
    var i = 2 * (soma - pv) / (pv * (n + 1));
    if (!(i > lo && i < hi)) i = (lo + hi) / 2;
    var it = 0;
    for (; it < 300; it++) {
      var r = f(i);
      if (r[0] === 0) break;
      if (r[0] > 0) lo = i; else hi = i;
      var novo = i - r[0] / r[1];
      if (!isFinite(novo) || novo <= lo || novo >= hi) novo = (lo + hi) / 2; // bisseção
      if (Math.abs(novo - i) < 1e-10) { i = novo; break; }
      i = novo;
      if (hi - lo < 1e-10) { i = (lo + hi) / 2; break; }
    }
    return { status: 'ok', i: i, a: anualDeMensal(i), soma: soma, iteracoes: it + 1 };
  }

  // Juros compostos com aporte inicial e aportes mensais (no fim de cada mês).
  function compostos(inicial, aporte, i, n) {
    var saldo = inicial, linhas = [];
    for (var k = 1; k <= n; k++) {
      saldo = saldo * (1 + i) + aporte;
      var investido = inicial + aporte * k;
      linhas.push({ mes: k, investido: investido, juros: saldo - investido, saldo: saldo });
    }
    var inv = inicial + aporte * n;
    return { final: saldo, investido: inv, juros: saldo - inv, linhas: linhas };
  }

  var C = {
    lerNumero: lerNumero, r2: r2, fmt: fmt, brl: brl, pct: pct,
    mensalDeAnual: mensalDeAnual, anualDeMensal: anualDeMensal,
    pmt: pmt, valorPresente: valorPresente, price: price, sac: sac,
    taxaImplicita: taxaImplicita, compostos: compostos
  };

  /* =========================================================
   * Validação dos campos
   * ========================================================= */

  function ErroCampo(msg) { this.message = msg; this.usuario = true; }

  function dinheiro(v, nome, opc) {
    opc = opc || {};
    var x = lerNumero(v);
    if (isNaN(x)) throw new ErroCampo('Informe ' + nome + ' (ex.: ' + (opc.exemplo || '10.000') + ').');
    if (x < 0) throw new ErroCampo('O campo ' + nome + ' não pode ser negativo.');
    if (!opc.zero && x === 0) throw new ErroCampo('Informe ' + nome + ' maior que zero.');
    if (x > 100000000) throw new ErroCampo('Valor muito alto em ' + nome + '. Use até R$ 100.000.000.');
    return x;
  }

  function taxa(v, tipo, nome) {
    var x = lerNumero(v, true);
    nome = nome || 'a taxa de juros';
    if (isNaN(x)) throw new ErroCampo('Informe ' + nome + ' em % (ex.: 2,5).');
    if (x < 0) throw new ErroCampo('A taxa não pode ser negativa.');
    var anual = tipo === 'ano';
    var frac = x / 100;
    var i = anual ? mensalDeAnual(frac) : frac;
    if (i > 1) throw new ErroCampo('Taxa muito alta. Confira se digitou a taxa em % ' + (anual ? 'ao ano' : 'ao mês') + '.');
    return { i: i, a: anual ? frac : anualDeMensal(frac), tipo: anual ? 'ano' : 'mes', digitada: frac };
  }

  function inteiro(v, nome, min, max) {
    var x = lerNumero(v);
    if (isNaN(x)) throw new ErroCampo('Informe ' + nome + '.');
    if (Math.floor(x) !== x) throw new ErroCampo('Use um número inteiro em ' + nome + '.');
    if (x < min || x > max) throw new ErroCampo('Use ' + nome + ' entre ' + min + ' e ' + max + '.');
    return x;
  }

  // Evita combinações absurdas (ex.: 20% ao mês por 15 anos), em que os números
  // passam de trilhões e a conta perde o sentido.
  function checarCrescimento(i, n) {
    if (Math.pow(1 + i, n) > 1e12) throw new ErroCampo('Essa combinação de taxa e prazo é alta demais para simular. Reduza a taxa ou o prazo.');
  }

  /* =========================================================
   * Pedaços de HTML do resultado
   * ========================================================= */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function aviso() { return '<p class="aviso">' + AVISO + '</p>'; }
  function destaque(rotulo, valor, sub) {
    return '<div class="res-destaque"><span class="res-rotulo">' + rotulo + '</span>' +
      '<strong class="res-valor">' + valor + '</strong>' +
      (sub ? '<span class="res-sub">' + sub + '</span>' : '') + '</div>';
  }
  function grade(itens) {
    var h = '<dl class="res-grade">';
    for (var k = 0; k < itens.length; k++) {
      if (itens[k]) h += '<div><dt>' + itens[k][0] + '</dt><dd>' + itens[k][1] + '</dd></div>';
    }
    return h + '</dl>';
  }
  function frase(t, classe) { return '<p class="' + (classe || 'res-frase') + '">' + t + '</p>'; }
  function taxaTexto(t) {
    return t.tipo === 'ano'
      ? pct(t.a) + ' ao ano = ' + pct(t.i) + ' ao mês'
      : pct(t.i) + ' ao mês = ' + pct(t.a) + ' ao ano';
  }
  function parcelasTexto(n) { return n === 1 ? '1 parcela' : n + ' parcelas'; }

  function tabelaAmortizacao(r, n, aberta) {
    var h = '<details class="tabela"' + (aberta ? ' open' : '') + '><summary>' +
      (aberta ? 'Tabela mês a mês' : 'Ver tabela mês a mês') + ' (' + parcelasTexto(n) + ')</summary>' +
      '<div class="rolagem" tabindex="0" role="region" aria-label="Tabela de amortização"><table>' +
      '<caption>Valores em R$ — sistema ' + (r.sistema === 'sac' ? 'SAC' : 'Price') + '</caption>' +
      '<thead><tr><th scope="col">Mês</th><th scope="col">Parcela</th><th scope="col">Juros</th>' +
      '<th scope="col">Amortização</th><th scope="col">Saldo</th></tr></thead><tbody>';
    var tj = 0, ta = 0;
    for (var k = 0; k < r.linhas.length; k++) {
      var l = r.linhas[k];
      tj += l.juros; ta += l.amort;
      h += '<tr><td>' + l.mes + '</td><td>' + fmt(l.parcela) + '</td><td>' + fmt(l.juros) + '</td><td>' +
        fmt(l.amort) + '</td><td>' + fmt(l.saldo) + '</td></tr>';
    }
    h += '</tbody><tfoot><tr><th scope="row">Total</th><td>' + fmt(r.total) + '</td><td>' + fmt(tj) +
      '</td><td>' + fmt(ta) + '</td><td></td></tr></tfoot></table></div></details>';
    return h;
  }

  function guard(fn) {
    try {
      return { ok: true, html: fn() + aviso() };
    } catch (e) {
      if (e && e.usuario) return { ok: false, html: '<p class="res-erro" role="alert">' + esc(e.message) + '</p>' + aviso() };
      throw e;
    }
  }

  /* =========================================================
   * Calculadoras (cada uma recebe os campos do formulário)
   * ========================================================= */

  var R = {};

  // Simulador de empréstimo (Price ou SAC)
  R.emprestimo = function (v, opc) {
    opc = opc || {};
    return guard(function () {
      var pv = dinheiro(v.valor, 'o valor do empréstimo', { exemplo: '15.000' });
      var t = taxa(v.taxa, v.tipo);
      var n = inteiro(v.prazo, 'o prazo em meses', 1, 420);
      checarCrescimento(t.i, n);
      var usaSac = v.sistema === 'sac';
      var r = usaSac ? sac(pv, t.i, n) : price(pv, t.i, n);
      var h = usaSac
        ? destaque('1ª parcela (SAC)', brl(r.primeira), 'Última parcela: ' + brl(r.ultima) + '. No SAC a parcela diminui todo mês.')
        : destaque('Parcela mensal (Price)', brl(r.parcela), parcelasTexto(n) + ' fixas');
      h += grade([
        ['Total pago', brl(r.total)],
        ['Juros totais', brl(r.juros)],
        ['Juros sobre o valor emprestado', pct(r.juros / pv)],
        ['Taxa', taxaTexto(t)]
      ]);
      if (r.total > 0) h += frase('De cada R$ 100 que você paga, <strong>' + brl(100 * r.juros / r.total) + '</strong> são juros.');
      h += tabelaAmortizacao(r, n, opc.tabelaAberta);
      return h;
    });
  };

  // Tabela Price com a tabela completa aberta
  R.price = function (v) { v.sistema = 'price'; return R.emprestimo(v, { tabelaAberta: true }); };

  // Resultado rápido (sem tabela), com link para o simulador completo
  R.rapido = function (v) {
    return guard(function () {
      var pv = dinheiro(v.valor, 'o valor do empréstimo', { exemplo: '5.000' });
      var t = taxa(v.taxa, v.tipo);
      var n = inteiro(v.prazo, 'o prazo em meses', 1, 420);
      checarCrescimento(t.i, n);
      var r = price(pv, t.i, n);
      var h = destaque('Parcela mensal', brl(r.parcela), parcelasTexto(n) + ' fixas (Tabela Price)');
      h += grade([['Total pago', brl(r.total)], ['Juros totais', brl(r.juros)], ['Taxa', taxaTexto(t)]]);
      var q = 'valor=' + encodeURIComponent(fmt(pv)) + '&amp;taxa=' + encodeURIComponent(fmt(t.digitada * 100)) +
        '&amp;tipo=' + t.tipo + '&amp;prazo=' + n;
      h += frase('<a href="/simulador-emprestimo/?' + q + '">Ver a tabela mês a mês deste empréstimo</a>');
      return h;
    });
  };

  // Financiamento de veículo (carro ou moto): valor do bem, entrada, taxa, prazo
  R.financiamento = function (v) {
    return guard(function () {
      var bem = dinheiro(v.valor, 'o valor do veículo', { exemplo: '60.000' });
      var entrada = dinheiro(v.entrada, 'o valor da entrada', { zero: true, exemplo: '10.000' });
      if (entrada >= bem) throw new ErroCampo('A entrada precisa ser menor que o valor do veículo.');
      var t = taxa(v.taxa, v.tipo);
      var n = inteiro(v.prazo, 'o prazo em meses', 1, 120);
      checarCrescimento(t.i, n);
      var pv = r2(bem - entrada);
      var r = price(pv, t.i, n);
      var custo = r2(entrada + r.total);
      var h = destaque('Parcela mensal', brl(r.parcela), parcelasTexto(n) + ' fixas sobre ' + brl(pv) + ' financiados');
      h += grade([
        ['Entrada', brl(entrada) + ' (' + pct(entrada / bem, 1) + ')'],
        ['Valor financiado', brl(pv)],
        ['Total das parcelas', brl(r.total)],
        ['Juros totais', brl(r.juros)],
        ['Custo total (entrada + parcelas)', brl(custo)],
        ['Taxa', taxaTexto(t)]
      ]);
      h += frase('No fim, o veículo sai <strong>' + pct((custo - bem) / bem, 1) + ' mais caro</strong> do que o preço à vista de ' + brl(bem) + '.');
      h += tabelaAmortizacao(r, n, false);
      return h;
    });
  };

  // Mensagens comuns da taxa implícita
  function msgTaxaEspecial(res, alvo) {
    if (res.status === 'zero') {
      return destaque('Taxa de juros', '0% ao mês', 'A soma das parcelas é igual ao ' + alvo + '.') +
        frase('Não há juros embutidos: as parcelas somam exatamente o ' + alvo + ' (' + brl(res.soma) + ').');
    }
    if (res.status === 'menor') {
      return '<p class="res-erro" role="alert">As parcelas somam ' + brl(res.soma) + ', menos do que o ' + alvo +
        '. Isso não é juros (seria um desconto). Confira se o valor da parcela e o número de parcelas estão certos.</p>';
    }
    if (res.motivo === 'entrada') {
      return '<p class="res-erro" role="alert">Com a 1ª parcela paga no ato, ela não pode ser igual ou maior que o ' + alvo + '. Confira os valores.</p>';
    }
    return '<p class="res-erro" role="alert">Não foi possível encontrar uma taxa para esses valores. Confira os campos.</p>';
  }

  // Juros escondidos no parcelamento (preço à vista × parcelas)
  R.parcelamento = function (v) {
    return guard(function () {
      var avista = dinheiro(v.avista, 'o preço à vista', { exemplo: '1.800' });
      var parcela = dinheiro(v.parcela, 'o valor da parcela', { exemplo: '179,90' });
      var n = inteiro(v.n, 'o número de parcelas', 1, 120);
      var ato = v.ato === 'sim';
      var res = taxaImplicita(avista, parcela, n, ato);
      if (res.status !== 'ok') return msgTaxaEspecial(res, 'preço à vista');
      var dif = r2(res.soma - avista);
      var h = destaque('Juros escondidos no parcelado', pct(res.i) + ' ao mês', 'equivale a ' + pct(res.a) + ' ao ano');
      h += grade([
        ['Total parcelado', n + ' × ' + brl(parcela) + ' = ' + brl(res.soma)],
        ['Preço à vista', brl(avista)],
        ['Você paga a mais', brl(dif)],
        ['Diferença sobre o preço à vista', pct(dif / avista, 1)]
      ]);
      h += frase('Mesmo anunciado como "sem juros", parcelar aqui custa como um empréstimo de ' + pct(res.i) +
        ' ao mês' + (ato ? ' (com a 1ª parcela paga no ato)' : '') + '.');
      return h;
    });
  };

  // Descobrir taxa de juros pela parcela
  R.taxa = function (v) {
    return guard(function () {
      var pv = dinheiro(v.valor, 'o valor recebido', { exemplo: '3.000' });
      var parcela = dinheiro(v.parcela, 'o valor da parcela', { exemplo: '329,00' });
      var n = inteiro(v.n, 'o número de parcelas', 1, 420);
      var ato = v.ato === 'sim';
      var res = taxaImplicita(pv, parcela, n, ato);
      if (res.status !== 'ok') return msgTaxaEspecial(res, 'valor recebido');
      var juros = r2(res.soma - pv);
      var h = destaque('Taxa de juros mensal', pct(res.i), 'equivale a ' + pct(res.a) + ' ao ano');
      h += grade([
        ['Total pago', n + ' × ' + brl(parcela) + ' = ' + brl(res.soma)],
        ['Juros totais', brl(juros)],
        ['Juros sobre o valor', pct(juros / pv, 1)],
        ['Taxa com mais casas', fmt(res.i * 100, 4) + '% ao mês']
      ]);
      h += frase('Conferindo: ' + brl(pv) + ' a ' + pct(res.i) + ' ao mês em ' + parcelasTexto(n) +
        (ato ? ' (1ª no ato)' : '') + ' resultam em parcelas de ' + brl(parcela) + '.');
      return h;
    });
  };

  // Price × SAC lado a lado
  R.pricesac = function (v) {
    return guard(function () {
      var pv = dinheiro(v.valor, 'o valor', { exemplo: '20.000' });
      var t = taxa(v.taxa, v.tipo);
      var n = inteiro(v.prazo, 'o prazo em meses', 1, 420);
      checarCrescimento(t.i, n);
      var p = price(pv, t.i, n), s = sac(pv, t.i, n);
      var eco = r2(p.juros - s.juros);
      var h = '<div class="rolagem"><table class="comparativo"><caption>Comparação para ' + brl(pv) + ' em ' +
        parcelasTexto(n) + ' a ' + taxaTexto(t) + '</caption>' +
        '<thead><tr><th scope="col"></th><th scope="col">Price</th><th scope="col">SAC</th></tr></thead><tbody>' +
        '<tr><th scope="row">1ª parcela</th><td>' + brl(p.primeira) + '</td><td>' + brl(s.primeira) + '</td></tr>' +
        '<tr><th scope="row">Última parcela</th><td>' + brl(p.ultima) + '</td><td>' + brl(s.ultima) + '</td></tr>' +
        '<tr><th scope="row">Total pago</th><td>' + brl(p.total) + '</td><td>' + brl(s.total) + '</td></tr>' +
        '<tr><th scope="row">Juros totais</th><td>' + brl(p.juros) + '</td><td>' + brl(s.juros) + '</td></tr>' +
        '</tbody></table></div>';
      if (eco > 0) {
        h += frase('No SAC você paga <strong>' + brl(eco) + ' a menos de juros</strong>, mas a 1ª parcela é ' +
          brl(r2(s.primeira - p.primeira)) + ' maior que a da Price.');
      } else {
        h += frase('Com esses valores, Price e SAC custam praticamente o mesmo.');
      }
      var tb = '<details class="tabela"><summary>Ver parcelas mês a mês (' + parcelasTexto(n) + ')</summary>' +
        '<div class="rolagem" tabindex="0" role="region" aria-label="Parcelas Price e SAC"><table><caption>Valores em R$</caption>' +
        '<thead><tr><th scope="col">Mês</th><th scope="col">Price</th><th scope="col">SAC</th><th scope="col">Diferença</th></tr></thead><tbody>';
      for (var k = 0; k < n; k++) {
        var a = p.linhas[k].parcela, b = s.linhas[k].parcela;
        tb += '<tr><td>' + (k + 1) + '</td><td>' + fmt(a) + '</td><td>' + fmt(b) + '</td><td>' + fmt(b - a) + '</td></tr>';
      }
      tb += '</tbody><tfoot><tr><th scope="row">Total</th><td>' + fmt(p.total) + '</td><td>' + fmt(s.total) +
        '</td><td>' + fmt(s.total - p.total) + '</td></tr></tfoot></table></div></details>';
      return h + tb;
    });
  };

  // Consignado: renda, margem, valor desejado, taxa e prazo
  R.consignado = function (v) {
    return guard(function () {
      var renda = dinheiro(v.renda, 'a renda líquida (salário ou benefício)', { exemplo: '3.000' });
      var margemPct = lerNumero(v.margem, true);
      if (isNaN(margemPct) || margemPct <= 0 || margemPct > 100) throw new ErroCampo('Informe a margem consignável em % (ex.: 35).');
      var pv = dinheiro(v.valor, 'o valor desejado', { exemplo: '10.000' });
      var t = taxa(v.taxa, v.tipo);
      var n = inteiro(v.prazo, 'o prazo em meses', 1, 120);
      checarCrescimento(t.i, n);
      var r = price(pv, t.i, n);
      var margem = r2(renda * margemPct / 100);
      var maximo = valorPresente(margem, t.i, n);
      var cabe = r.parcela <= margem + 0.004;
      var h = destaque('Parcela do consignado', brl(r.parcela), parcelasTexto(n) + ' descontadas em folha ou no benefício');
      h += grade([
        ['Margem disponível (' + fmt(margemPct, margemPct % 1 ? 2 : 0) + '% da renda)', brl(margem)],
        ['Parcela cabe na margem?', cabe ? 'Sim — usa ' + pct(r.parcela / margem, 0) + ' da margem' : 'Não — passa ' + brl(r2(r.parcela - margem))],
        ['Parte da renda comprometida', pct(r.parcela / renda, 1)],
        ['Total pago', brl(r.total)],
        ['Juros totais', brl(r.juros)],
        ['Taxa', taxaTexto(t)]
      ]);
      h += frase('Com a margem inteira (' + brl(margem) + ' por mês), nessa taxa e prazo, o valor máximo seria de cerca de <strong>' +
        brl(r2(maximo)) + '</strong>.');
      h += tabelaAmortizacao(r, n, false);
      return h;
    });
  };

  // Juros compostos com aportes
  R.compostos = function (v) {
    return guard(function () {
      var ini = dinheiro(v.inicial, 'o valor inicial', { zero: true, exemplo: '1.000' });
      var ap = dinheiro(v.aporte, 'o aporte mensal', { zero: true, exemplo: '300' });
      if (ini === 0 && ap === 0) throw new ErroCampo('Informe um valor inicial ou um aporte mensal.');
      var t = taxa(v.taxa, v.tipo);
      var anos = v.unidade !== 'meses';
      var prazo = inteiro(v.prazo, anos ? 'o prazo em anos' : 'o prazo em meses', 1, anos ? 50 : 600);
      var n = anos ? prazo * 12 : prazo;
      checarCrescimento(t.i, n);
      var r = compostos(ini, ap, t.i, n);
      var h = destaque('Valor acumulado', brl(r.final), 'depois de ' + (anos ? prazo + (prazo === 1 ? ' ano' : ' anos') : (n === 1 ? '1 mês' : n + ' meses')));
      h += grade([
        ['Total investido', brl(r.investido)],
        ['Juros ganhos', brl(r.juros)],
        ['Parte que veio dos juros', pct(r.final > 0 ? r.juros / r.final : 0, 1)],
        ['Taxa', taxaTexto(t)]
      ]);
      h += frase('Sem descontar impostos, taxas e inflação. A rentabilidade real varia conforme o investimento.');
      var porMes = n <= 24;
      var tb = '<details class="tabela"><summary>Ver evolução ' + (porMes ? 'mês a mês' : 'ano a ano') + '</summary>' +
        '<div class="rolagem" tabindex="0" role="region" aria-label="Evolução do saldo"><table><caption>Valores em R$</caption>' +
        '<thead><tr><th scope="col">' + (porMes ? 'Mês' : 'Ano') + '</th><th scope="col">Investido</th><th scope="col">Juros</th><th scope="col">Saldo</th></tr></thead><tbody>';
      for (var k = 0; k < r.linhas.length; k++) {
        var l = r.linhas[k];
        var mostra = porMes || l.mes % 12 === 0 || l.mes === n;
        if (!mostra) continue;
        var rot = porMes ? l.mes : (l.mes % 12 === 0 ? l.mes / 12 : fmt(l.mes / 12, 1));
        tb += '<tr><td>' + rot + '</td><td>' + fmt(l.investido) + '</td><td>' + fmt(l.juros) + '</td><td>' + fmt(l.saldo) + '</td></tr>';
      }
      tb += '</tbody></table></div></details>';
      return h + tb;
    });
  };

  // Cartão de crédito: rotativo × parcelamento da fatura
  R.cartao = function (v) {
    return guard(function () {
      var fatura = dinheiro(v.fatura, 'o valor da fatura', { exemplo: '2.000' });
      var pago = dinheiro(v.pago, 'quanto você vai pagar agora', { zero: true, exemplo: '500' });
      var tr = taxa(v.rotativo, 'mes', 'a taxa do rotativo');
      var tp = taxa(v.taxaparc, 'mes', 'a taxa do parcelamento');
      var n = inteiro(v.n, 'o número de parcelas', 1, 48);
      checarCrescimento(tp.i, n);
      if (pago >= fatura) {
        return destaque('Juros do rotativo', brl(0), 'Pagando a fatura inteira, não há juros de rotativo.') +
          frase('Pagar o valor total até o vencimento é o único jeito de usar o cartão sem pagar juros.');
      }
      var saldo = r2(fatura - pago);
      var juros1 = r2(saldo * tr.i);
      var p = price(saldo, tp.i, n);
      var doze = saldo * Math.pow(1 + tr.i, 12);
      var h = destaque('Juros do rotativo em 1 mês', brl(juros1), 'sobre ' + brl(saldo) + ' que ficaram sem pagar');
      h += '<div class="rolagem"><table class="comparativo"><caption>O que fazer com os ' + brl(saldo) + ' que faltam</caption>' +
        '<thead><tr><th scope="col"></th><th scope="col">Rotativo (1 mês)</th><th scope="col">Parcelar em ' + n + 'x</th></tr></thead><tbody>' +
        '<tr><th scope="row">Taxa mensal</th><td>' + pct(tr.i) + '</td><td>' + pct(tp.i) + '</td></tr>' +
        '<tr><th scope="row">Equivale ao ano</th><td>' + pct(tr.a, 0) + '</td><td>' + pct(tp.a, 0) + '</td></tr>' +
        '<tr><th scope="row">Parcela</th><td>—</td><td>' + brl(p.parcela) + '</td></tr>' +
        '<tr><th scope="row">Dívida / total a pagar</th><td>' + brl(r2(saldo + juros1)) + ' no mês seguinte</td><td>' + brl(p.total) + '</td></tr>' +
        '<tr><th scope="row">Juros</th><td>' + brl(juros1) + ' em 1 mês</td><td>' + brl(p.juros) + ' no total</td></tr>' +
        '</tbody></table></div>';
      var teto = 2 * saldo;
      if (doze > teto) {
        h += frase('Se ninguém pagasse nada por 12 meses, os juros compostos de ' + pct(tr.i) + ' ao mês levariam a dívida a ' +
          brl(doze) + '. Pela regra em vigor desde 2024, juros e encargos do rotativo e do parcelamento da fatura não podem passar de 100% da dívida original — aqui, no máximo ' +
          brl(saldo) + ' de encargos, ou ' + brl(teto) + ' no total.');
      } else {
        h += frase('Se ninguém pagasse nada por 12 meses, a dívida chegaria a ' + brl(doze) + ' só com os juros compostos do rotativo.');
      }
      h += frase('IOF e outros encargos não estão incluídos. Confira o CET na fatura.', 'res-nota');
      return h;
    });
  };

  /* =========================================================
   * Navegador: liga os formulários
   * ========================================================= */

  function lerForm(form) {
    var v = {}, els = form.elements;
    for (var k = 0; k < els.length; k++) {
      var el = els[k];
      if (!el.name) continue;
      if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) continue;
      v[el.name] = el.value;
    }
    return v;
  }

  // Permite links como /simulador-emprestimo/?valor=5000&taxa=3&prazo=12
  function aplicarUrl(form) {
    if (!root.location || !root.location.search) return;
    var q = root.location.search.slice(1).split('&');
    for (var k = 0; k < q.length; k++) {
      var par = q[k].split('=');
      if (par.length !== 2) continue;
      var nome, valor;
      try { nome = decodeURIComponent(par[0]); valor = decodeURIComponent(par[1].replace(/\+/g, ' ')); } catch (e) { continue; }
      if (!/^[a-z]+$/.test(nome) || valor.length > 20) continue;
      var els = form.querySelectorAll('[name="' + nome + '"]');
      for (var m = 0; m < els.length; m++) {
        var el = els[m];
        if (el.type === 'radio') el.checked = el.value === valor;
        else if (el.tagName === 'SELECT') { for (var o = 0; o < el.options.length; o++) if (el.options[o].value === valor) el.value = valor; }
        else el.value = valor;
      }
    }
  }

  function iniciar() {
    var forms = document.querySelectorAll('form[data-calc]');
    for (var k = 0; k < forms.length; k++) ligar(forms[k]);
  }

  function ligar(form) {
    var tipo = form.getAttribute('data-calc');
    var saida = document.getElementById(form.getAttribute('data-saida'));
    if (!R[tipo] || !saida) return;
    var anuncio = document.getElementById(form.getAttribute('data-anuncio'));
    var timer = null;
    function calcular(avisar) {
      // mantém a tabela aberta se a pessoa já tinha aberto
      var aberta = saida.querySelector('details.tabela[open]') !== null;
      var r = R[tipo](lerForm(form));
      saida.innerHTML = r.html;
      if (aberta) { var d = saida.querySelector('details.tabela'); if (d) d.open = true; }
      // leitores de tela ouvem só o resumo, não a tabela inteira
      if (avisar && anuncio) {
        var alvo = saida.querySelector('.res-erro') || saida.querySelector('.res-destaque') || saida.querySelector('.res-frase');
        var partes = [];
        if (alvo && alvo.className === 'res-destaque') {
          for (var k = 0; k < alvo.children.length; k++) partes.push(alvo.children[k].textContent);
        } else if (alvo) {
          partes.push(alvo.textContent);
        }
        anuncio.textContent = partes.join(', ').replace(/\s+/g, ' ');
      }
    }
    function suave() {
      return !(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      calcular(true);
      if (saida.scrollIntoView) {
        try { saida.scrollIntoView({ behavior: suave() ? 'smooth' : 'auto', block: 'start' }); } catch (x) { saida.scrollIntoView(true); }
      }
    });
    form.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { calcular(true); }, 400); });
    form.addEventListener('change', function () { clearTimeout(timer); calcular(true); });
    aplicarUrl(form);
    calcular(false);
  }

  var API = { C: C, R: R, AVISO: AVISO };
  if (typeof module === 'object' && module.exports) {
    module.exports = API;
  } else {
    root.Calculadora = API;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
  }
})(typeof window !== 'undefined' ? window : this);
