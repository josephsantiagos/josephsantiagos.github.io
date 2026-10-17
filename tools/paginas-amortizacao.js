// Conteúdo: Tabela Price e Price ou SAC.
'use strict';
const { C, b, p, f, dinheiro, taxa, prazo } = require('./comum.js');

/* =================== Tabela Price =================== */

const tabelaPrice = {
  slug: 'tabela-price',
  caminho: '/tabela-price/',
  title: 'Tabela Price: calculadora e tabela de amortização',
  description: 'Entenda a Tabela Price e monte a sua: parcela fixa, juros, amortização e saldo devedor de cada mês. Fórmula, exemplo resolvido e tabela completa.',
  h1: 'Tabela Price: calculadora e tabela completa',
  trilha: 'Tabela Price',
  appNome: 'Calculadora da Tabela Price',
  link: { titulo: 'Tabela Price', desc: 'Tabela de amortização completa, mês a mês.' },
  lead: 'Informe valor, taxa e prazo para montar a tabela de amortização completa, com juros, amortização e saldo devedor de cada mês.',
  calc: {
    tipo: 'price',
    titulo: 'Monte a sua Tabela Price',
    botao: 'Gerar tabela',
    campos: [dinheiro('valor', 'Valor financiado', '5.000'), taxa('3'), prazo('12')]
  },
  artigo() {
    const t = C.price(5000, 0.03, 12), l = t.linhas;
    return `
<h2>O que é a Tabela Price</h2>
<p>A Tabela Price, também chamada de sistema francês de amortização, é o jeito mais comum de calcular parcelas no Brasil. Empréstimo pessoal, consignado, financiamento de veículos e crediário costumam usá-la. A característica principal é a parcela fixa: do primeiro ao último mês você paga o mesmo valor.</p>
<p>O que muda é a composição da parcela. No começo, a maior parte dela é juros; com o tempo, os juros diminuem e a amortização, a parte que abate a dívida, aumenta. Isso acontece porque os juros de cada mês são calculados sobre o saldo devedor, que vai caindo.</p>

<h2>A fórmula</h2>
<p class="formula"><strong>PMT = PV × i ÷ [1 − (1 + i)<sup>−n</sup>]</strong></p>
<p>PMT é a parcela, PV é o valor financiado, i é a taxa mensal em decimal e n é o número de meses. Depois de achar a parcela, cada linha da tabela é montada assim:</p>
<ol>
<li><strong>Juros do mês</strong> = saldo devedor anterior × i</li>
<li><strong>Amortização</strong> = parcela − juros do mês</li>
<li><strong>Novo saldo</strong> = saldo anterior − amortização</li>
</ol>
<p>Se a taxa estiver ao ano, converta antes para a taxa mensal equivalente: (1 + taxa anual)<sup>1/12</sup> − 1. A calculadora faz isso quando você escolhe “ao ano”.</p>

<h2>Exemplo resolvido: R$ 5.000 a 3% ao mês em 12 meses</h2>
<p>Parcela: 5.000 × 0,03 ÷ [1 − (1,03)<sup>−12</sup>] = <strong>${b(t.parcela)}</strong>.</p>
<ul>
<li>Mês 1: juros = 5.000 × 3% = ${b(l[0].juros)}; amortização = ${b(t.parcela)} − ${b(l[0].juros)} = ${b(l[0].amort)}; saldo = ${b(l[0].saldo)}.</li>
<li>Mês 2: juros = ${f(l[0].saldo)} × 3% = ${b(l[1].juros)}; amortização = ${b(l[1].amort)}; saldo = ${b(l[1].saldo)}.</li>
<li>Mês 12: juros = ${b(l[11].juros)}; amortização = ${b(l[11].amort)}; saldo zerado.</li>
</ul>
<p>No total, você paga ${b(t.total)}, dos quais ${b(t.juros)} são juros. A tabela completa está logo acima, na calculadora; altere os campos para montar a tabela do seu contrato.</p>
<p>Um detalhe: como a parcela é arredondada em centavos, a última linha pode ter alguns centavos de diferença nos juros para zerar o saldo exatamente. Contratos reais fazem o mesmo ajuste.</p>

<h2>Vantagens e desvantagens</h2>
<p><strong>Vantagens:</strong> parcela fixa, fácil de planejar, e primeira parcela menor do que no SAC. <strong>Desvantagens:</strong> a dívida cai devagar no início e o total de juros é maior do que no SAC com a mesma taxa e prazo. Para ver a diferença em reais, use a comparação <a href="/price-ou-sac/">Price ou SAC</a>.</p>

<h2>Antecipar parcelas na Tabela Price</h2>
<p>Ao antecipar parcelas, você paga o valor presente delas, ou seja, sem os juros dos meses que faltam. Antecipar as últimas parcelas dá o maior desconto, porque elas carregam mais meses de juros. No exemplo, logo depois de assinar o contrato, quitar a 12ª parcela custaria cerca de ${b(t.parcela / Math.pow(1.03, 12))}, e não ${b(t.parcela)}. O consumidor tem direito a esse abatimento proporcional dos juros ao quitar ou adiantar parcelas.</p>

<h2>CET e IOF na Tabela Price</h2>
<p>A tabela mostra só juros e amortização. No contrato, o custo final inclui o <strong>IOF</strong>, imposto sobre operações de crédito com uma parte fixa e outra proporcional ao prazo, além de eventuais tarifas e seguros. Tudo isso forma o <strong>Custo Efetivo Total (CET)</strong>, que deve ser informado antes da assinatura. Quando o IOF e as tarifas são financiados, eles são somados ao valor financiado e a tabela é montada sobre o total, o que aumenta a parcela.</p>

<h2>Dicas</h2>
<ul>
<li>Compare propostas pelo CET e pelo total pago, não só pela parcela.</li>
<li>Prazo menor significa menos meses de juros sobre o saldo.</li>
<li>Peça a tabela de amortização do seu contrato e confira com esta calculadora.</li>
<li>Se a proposta não mostrar a taxa, use a calculadora para <a href="/descobrir-taxa-de-juros/">descobrir a taxa de juros</a> pela parcela.</li>
</ul>`;
  },
  faq: [
    ['O que é a Tabela Price?', 'É um sistema de amortização com parcelas iguais. Em cada parcela, os juros são calculados sobre o saldo devedor e o restante abate a dívida. Com o tempo, os juros diminuem e a amortização aumenta.'],
    ['Qual é a fórmula da Tabela Price?', 'PMT = PV × i ÷ [1 − (1 + i)^−n], em que PV é o valor financiado, i é a taxa mensal em decimal e n o número de parcelas. Exemplo: R$ 5.000 a 3% ao mês em 12 meses dá parcela de R$ 502,31.'],
    ['Por que os juros diminuem se a parcela é sempre igual?', 'Porque os juros de cada mês são calculados sobre o saldo devedor, que cai a cada parcela paga. Como a parcela é fixa, a parte que vai para amortização cresce na mesma medida em que os juros diminuem.'],
    ['Onde a Tabela Price é usada?', 'Em empréstimo pessoal, consignado, financiamento de veículos, crediário e parcelamento de fatura, entre outros. No financiamento imobiliário também é comum o SAC.'],
    ['Adiantar parcelas na Price reduz os juros?', 'Sim. Ao antecipar, você paga o valor presente das parcelas, sem os juros dos meses que faltam. Antecipar as últimas parcelas dá o maior desconto.'],
    ['A tabela inclui IOF e tarifas?', 'Não. A calculadora mostra juros e amortização. IOF, tarifas e seguros entram no Custo Efetivo Total (CET), que a instituição deve informar.']
  ]
};

/* =================== Price ou SAC =================== */

function cruzamento(pr, sa) {
  for (let k = 0; k < sa.linhas.length; k++) if (sa.linhas[k].parcela < pr.linhas[k].parcela) return k + 1;
  return null;
}

const priceSac = {
  slug: 'price-ou-sac',
  caminho: '/price-ou-sac/',
  title: 'Price ou SAC: qual é melhor? Compare as parcelas',
  description: 'Compare Price e SAC lado a lado: primeira e última parcela, total pago e juros. Veja qual sistema de amortização faz mais sentido para você.',
  h1: 'Price ou SAC: comparação lado a lado',
  trilha: 'Price ou SAC',
  appNome: 'Comparador Price ou SAC',
  link: { titulo: 'Price ou SAC', desc: 'Compare os dois sistemas lado a lado.' },
  lead: 'Informe valor, taxa e prazo e veja, lado a lado, quanto você paga em cada sistema de amortização.',
  calc: {
    tipo: 'pricesac',
    titulo: 'Compare Price e SAC',
    botao: 'Comparar',
    campos: [dinheiro('valor', 'Valor financiado', '20.000'), taxa('1,8'), prazo('36')]
  },
  artigo() {
    const P = C.price(20000, 0.018, 36), S = C.sac(20000, 0.018, 36);
    const k = cruzamento(P, S);
    return `
<h2>A diferença em uma frase</h2>
<p>Na <strong>Price</strong> a parcela é fixa e a dívida cai devagar no começo; no <strong>SAC</strong> (Sistema de Amortização Constante) a dívida cai sempre o mesmo valor por mês, e a parcela começa mais alta e vai diminuindo. Com a mesma taxa e o mesmo prazo, o SAC paga menos juros no total.</p>

<h2>Como cada sistema calcula</h2>
<h3>Price</h3>
<p>A parcela é calculada pela fórmula PMT = PV × i ÷ [1 − (1 + i)<sup>−n</sup>] e fica igual até o fim. Em cada mês, os juros são o saldo devedor vezes a taxa; o que sobra da parcela amortiza a dívida. Veja os detalhes na <a href="/tabela-price/">Tabela Price</a>.</p>
<h3>SAC</h3>
<p>A amortização é o valor financiado dividido pelo número de parcelas, sempre igual. Os juros também são o saldo vezes a taxa, e a parcela é a soma dos dois. Como o saldo cai em ritmo constante, os juros caem todo mês e a parcela também.</p>

<h2>Exemplo: R$ 20.000 a 1,8% ao mês em 36 meses</h2>
<div class="rolagem"><table class="comparativo"><caption>Mesmo valor, taxa e prazo</caption>
<thead><tr><th scope="col"></th><th scope="col">Price</th><th scope="col">SAC</th></tr></thead>
<tbody>
<tr><th scope="row">1ª parcela</th><td>${b(P.primeira)}</td><td>${b(S.primeira)}</td></tr>
<tr><th scope="row">Última parcela</th><td>${b(P.ultima)}</td><td>${b(S.ultima)}</td></tr>
<tr><th scope="row">Total pago</th><td>${b(P.total)}</td><td>${b(S.total)}</td></tr>
<tr><th scope="row">Juros totais</th><td>${b(P.juros)}</td><td>${b(S.juros)}</td></tr>
</tbody></table></div>
<p>No SAC, a amortização mensal é 20.000 ÷ 36 = ${b(20000 / 36)}. Somada aos juros do primeiro mês (20.000 × 1,8% = R$ 360,00), dá a primeira parcela de ${b(S.primeira)}, que é ${b(S.primeira - P.primeira)} maior que a da Price. A parcela do SAC fica menor que a da Price a partir do ${k}º mês. No total, o SAC economiza ${b(P.juros - S.juros)} de juros.</p>

<h2>Quando a Price faz mais sentido</h2>
<ul>
<li>Quando o orçamento está apertado e a primeira parcela do SAC não cabe.</li>
<li>Quando você quer previsibilidade: a mesma parcela do início ao fim.</li>
<li>Quando pretende antecipar parcelas com dinheiro extra. Amortizar por conta própria também reduz os juros.</li>
</ul>

<h2>Quando o SAC faz mais sentido</h2>
<ul>
<li>Quando a primeira parcela cabe com folga e você quer pagar menos juros no total.</li>
<li>Em prazos longos, como no financiamento imobiliário, em que a economia de juros fica grande.</li>
<li>Quando você prefere que o peso das parcelas diminua com o tempo, por exemplo se espera uma queda de renda no futuro.</li>
</ul>

<h2>Por que o SAC paga menos juros?</h2>
<p>Não é uma taxa diferente: no SAC você devolve o dinheiro mais rápido no começo. Com o saldo devedor menor, os juros de cada mês são menores. Na Price, nos primeiros meses a maior parte da parcela vai para juros e o saldo demora a cair. Se na Price você fizer amortizações extras, chega a um custo parecido.</p>

<h2>CET e IOF valem para os dois</h2>
<p>O sistema de amortização muda só a forma de devolver o dinheiro. O <strong>Custo Efetivo Total (CET)</strong>, que soma juros, IOF, tarifas e seguros, deve ser informado em qualquer um deles. O <strong>IOF</strong> é cobrado sobre operações de crédito, com uma parte fixa e outra proporcional ao tempo em que o dinheiro fica emprestado; como no SAC a dívida cai mais rápido, o imposto pode ficar um pouco diferente da Price na mesma proposta. Compare propostas sempre com o mesmo sistema, valor e prazo.</p>

<h2>Dicas</h2>
<ul>
<li>Pergunte à instituição se ela oferece os dois sistemas; nem toda modalidade oferece.</li>
<li>No SAC, garanta que a primeira parcela, a maior de todas, cabe no orçamento.</li>
<li>Na Price, use sobras de dinheiro para amortizar e reduzir os juros.</li>
<li>Veja a tabela completa de cada sistema no <a href="/simulador-emprestimo/">simulador de empréstimo</a>.</li>
</ul>`;
  },
  faq: (() => {
    const P = C.price(20000, 0.018, 36), S = C.sac(20000, 0.018, 36);
    const k = cruzamento(P, S);
    return [
      ['Qual é melhor: Price ou SAC?', 'Depende do orçamento. O SAC paga menos juros no total, mas começa com parcelas maiores. A Price tem parcela fixa e menor no início, com mais juros no total. Se a primeira parcela do SAC cabe com folga, ele costuma sair mais barato.'],
      ['Por que o SAC paga menos juros?', 'Porque a dívida é amortizada mais rápido no começo. Com saldo devedor menor, os juros de cada mês também são menores, mesmo com a mesma taxa.'],
      ['Em que mês a parcela do SAC fica menor que a da Price?', `Depende da taxa e do prazo. No exemplo de R$ 20.000 a 1,8% ao mês em 36 meses, isso acontece a partir do ${k}º mês. A comparação mês a mês da calculadora mostra o ponto exato para os seus valores.`],
      ['Posso escolher entre Price e SAC?', 'Em algumas modalidades, como o financiamento imobiliário, é comum poder escolher. Em empréstimo pessoal, consignado e financiamento de veículos, a Price costuma ser o padrão. Pergunte antes de contratar.'],
      ['Antecipar parcelas na Price deixa o custo igual ao do SAC?', 'Pode chegar perto. Ao amortizar antes, você reduz o saldo devedor e os juros futuros, que é exatamente o que o SAC faz de forma automática.'],
      ['O IOF muda entre Price e SAC?', 'Pode mudar um pouco, porque parte do IOF depende do tempo em que o dinheiro fica emprestado e, no SAC, a dívida cai mais rápido. Confira o CET de cada opção na proposta.']
    ];
  })()
};

module.exports = { tabelaPrice, priceSac };
