// Ordem das páginas (usada nos links internos, no rodapé e no sitemap) e conteúdo do início.
'use strict';
const emp = require('./paginas-emprestimo.js');
const jur = require('./paginas-juros.js');
const amo = require('./paginas-amortizacao.js');

const paginas = [
  emp.simuladorEmprestimo,
  emp.quantoFica,
  emp.carro,
  emp.moto,
  emp.consignado,
  jur.parcelamento,
  jur.descobrirTaxa,
  jur.cartao,
  amo.tabelaPrice,
  amo.priceSac,
  jur.compostos
];

const PLAY = 'https://play.google.com/store/apps/details?id=com.josephsantiago.calculadoraemprestimos';
const POLITICA = 'https://josephsantiagos.github.io/pilitica-de-privacidade-play-sotre-/';
const EMAIL = 'josephsantiago250@gmail.com';

const hub = {
  title: 'Calculadoras de Empréstimo e Juros grátis | Joseph Santiago',
  description: 'Simuladores gratuitos de empréstimo, financiamento de carro e moto, consignado, juros do cartão, Tabela Price e juros compostos. Sem cadastro.',
  h1: 'Calculadoras de empréstimo e juros',
  lead: 'Calculadoras gratuitas e sem cadastro para entender parcelas, juros e o custo real de um crédito antes de assinar qualquer contrato.',
  artigo: `
<h2>Para que servem estas calculadoras</h2>
<p>Elas foram feitas para quem quer entender uma proposta antes de assinar: quanto fica a parcela, quanto você paga de juros, qual é a taxa real de uma compra “sem juros” e quanto custa deixar a fatura do cartão para depois. Todas funcionam no celular, não pedem cadastro e fazem as contas no seu próprio aparelho.</p>
<p>Os resultados são simulações ilustrativas. O custo real de um contrato aparece no Custo Efetivo Total (CET), que soma juros, IOF, tarifas e seguros e deve ser informado pela instituição antes da contratação.</p>

<h2>Apps de Joseph Santiago</h2>
<p>Joseph Santiago é desenvolvedor de apps Android. O app <a href="${PLAY}">Calculadora Empréstimo e Juros</a> está disponível gratuitamente na Google Play.</p>
<p><a href="${POLITICA}">Política de privacidade</a> · Contato: <a href="mailto:${EMAIL}">${EMAIL}</a></p>`,
  faq: [
    ['As calculadoras são gratuitas?', 'Sim. Todas as calculadoras do site são gratuitas e não pedem cadastro.'],
    ['Vocês oferecem empréstimo?', 'Não. O site e o app são apenas calculadoras. Não oferecemos nem intermediamos crédito e não temos vínculo com bancos, financeiras ou órgãos públicos.'],
    ['Os valores que eu digito ficam salvos?', 'Não. As contas são feitas no próprio navegador e os valores digitados não são enviados para nenhum servidor.'],
    ['Os resultados são exatos?', 'As contas de juros seguem as fórmulas usadas no mercado, mas a proposta real pode incluir IOF, tarifas e seguros. Antes de contratar, confira o CET informado pela instituição.']
  ]
};

module.exports = { paginas, hub };
