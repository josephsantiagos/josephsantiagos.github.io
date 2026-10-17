// Ajudantes usados pelos arquivos de conteúdo (todos os números dos textos
// saem das mesmas funções da calculadora, para não haver conta errada no texto).
'use strict';
const { C } = require('../assets/calc.js');

const b = C.brl;                       // R$ 1.234,56
const p = (x, casas) => C.pct(x, casas); // 12,34%
const f = (x, casas) => C.fmt(x, casas == null ? 2 : casas);

const dinheiro = (nome, rotulo, valor, extra) => Object.assign({ tipo: 'dinheiro', nome, rotulo, valor }, extra || {});
const taxa = (valor, extra) => Object.assign({ tipo: 'taxa', nome: 'taxa', rotulo: 'Taxa de juros', valor, periodo: 'mes' }, extra || {});
const prazo = (valor, extra) => Object.assign({ tipo: 'inteiro', nome: 'prazo', rotulo: 'Prazo', valor, un: 'meses' }, extra || {});
const parcelas = (valor, extra) => Object.assign({ tipo: 'inteiro', nome: 'n', rotulo: 'Número de parcelas', valor, un: 'parcelas' }, extra || {});
const ato = (rotulo) => ({
  tipo: 'select', nome: 'ato', rotulo: rotulo || 'Primeira parcela', valor: 'nao',
  opcoes: [['nao', 'Daqui a 30 dias'], ['sim', 'No ato da compra (entrada)']]
});

module.exports = { C, b, p, f, dinheiro, taxa, prazo, parcelas, ato };
