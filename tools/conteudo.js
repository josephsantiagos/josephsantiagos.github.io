// Grupos e ordem das páginas (usados nos links internos, no rodapé, no início e no sitemap) e conteúdo do início.
'use strict';
const emp = require('./paginas-emprestimo.js');
const jur = require('./paginas-juros.js');
const amo = require('./paginas-amortizacao.js');
const cre = require('./paginas-credito.js');
const tax = require('./paginas-taxas.js');
const val = require('./paginas-valores.js');

// compacto = links curtos (sem descrição) em todo o site, para o bloco não ficar enorme.
const grupos = [
  {
    id: 'emprestimo', nome: 'Empréstimo',
    paginas: [emp.simuladorEmprestimo, emp.quantoFica, cre.comoCalcular, cre.quitar, emp.consignado, cre.pessoalOuConsignado]
  },
  {
    id: 'financiamento', nome: 'Financiamento e amortização',
    paginas: [emp.carro, emp.moto, cre.imovel, amo.tabelaPrice, amo.priceSac]
  },
  {
    id: 'juros', nome: 'Juros e taxas',
    paginas: [jur.descobrirTaxa, tax.cet, tax.converter, jur.parcelamento, tax.crediario, jur.cartao, jur.compostos, tax.simples]
  },
  { id: 'valores', nome: 'Empréstimo por valor', compacto: true, paginas: val.paginas }
];

const paginas = [];
for (const g of grupos) {
  for (const p of g.paginas) {
    p.grupo = g.id;
    paginas.push(p);
  }
}

const PLAY = 'https://play.google.com/store/apps/details?id=com.josephsantiago.calculadoraemprestimos';
const POLITICA = 'https://josephsantiagos.github.io/pilitica-de-privacidade-play-sotre-/';
const EMAIL = 'josephsantiago250@gmail.com';

const hub = {
  title: 'Calculadoras de Empréstimo e Juros grátis | Joseph Santiago',
  description: 'Simuladores grátis de empréstimo, financiamento de carro, moto e imóvel, CET, quitação antecipada, juros simples e compostos. Sem cadastro.',
  h1: 'Calculadoras de empréstimo e juros',
  lead: 'Calculadoras gratuitas e sem cadastro para entender parcelas, juros e o custo real de um crédito antes de assinar qualquer contrato.',
  cta: 'No app você simula em Price ou SAC, compara de 2 a 3 ofertas, descobre a taxa embutida, guarda o histórico e compartilha o resultado.',
  artigo: `
<h2>Por onde começar</h2>
<ul>
<li><strong>Vai pedir um empréstimo?</strong> Veja a parcela no <a href="/simulador-emprestimo/">simulador de empréstimo</a> ou consulte as tabelas de <a href="/quanto-fica-emprestimo/">quanto fica um empréstimo</a>, de R$ 1 mil a R$ 50 mil.</li>
<li><strong>Já tem uma proposta na mão?</strong> Calcule o <a href="/o-que-e-cet/">CET</a> com o valor que vai cair na conta e as parcelas, ou coloque duas ofertas lado a lado em <a href="/emprestimo-pessoal-ou-consignado/">empréstimo pessoal ou consignado</a>.</li>
<li><strong>Quer pagar a dívida antes?</strong> Descubra quanto custa <a href="/quitar-emprestimo-antecipado/">quitar o empréstimo antecipado</a> e quanto de juros você deixa de pagar.</li>
<li><strong>A loja ofereceu carnê ou “sem juros”?</strong> Ache a taxa embutida em <a href="/juros-crediario/">juros do crediário</a> e <a href="/juros-parcelamento/">juros no parcelamento</a>.</li>
<li><strong>A taxa veio ao ano e você quer ao mês?</strong> Use o <a href="/converter-taxa-de-juros/">conversor de taxa de juros</a>.</li>
</ul>

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

module.exports = { paginas, grupos, hub };
