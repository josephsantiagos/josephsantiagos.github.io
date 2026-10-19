// Conteúdo: simulador de empréstimo, quanto fica, consignado, carro e moto.
'use strict';
const { C, b, p, f, dinheiro, taxa, prazo } = require('./comum.js');

/* =================== 1. Simulador de empréstimo =================== */

const simuladorEmprestimo = {
  slug: 'simulador-emprestimo',
  caminho: '/simulador-emprestimo/',
  title: 'Simulador de Empréstimo: parcela, juros e tabela',
  description: 'Simule seu empréstimo grátis: valor, taxa ao mês ou ao ano e prazo. Veja parcela, total pago, juros e a tabela mês a mês (Price ou SAC).',
  h1: 'Simulador de empréstimo',
  trilha: 'Simulador de empréstimo',
  appNome: 'Simulador de empréstimo',
  link: { titulo: 'Simulador de empréstimo', desc: 'Parcela, juros e tabela mês a mês (Price ou SAC).' },
  lead: 'Digite o valor, a taxa de juros e o prazo. O simulador mostra na hora a parcela, o total pago, quanto disso é só juros e a tabela mês a mês.',
  calc: {
    tipo: 'emprestimo',
    titulo: 'Simule seu empréstimo',
    campos: [
      dinheiro('valor', 'Valor do empréstimo', '15.000'),
      taxa('2,2'),
      prazo('24'),
      { tipo: 'radio', nome: 'sistema', rotulo: 'Sistema de amortização', valor: 'price', largo: true,
        opcoes: [['price', 'Price — parcelas iguais'], ['sac', 'SAC — parcelas que diminuem']] }
    ]
  },
  artigo() {
    const e = C.price(15000, 0.022, 24), s = C.sac(15000, 0.022, 24);
    const e12 = C.price(15000, 0.022, 12), e36 = C.price(15000, 0.022, 36);
    const fator = Math.pow(1.022, -24), l1 = e.linhas[0];
    const mil = C.price(1000, 0.022, 24);
    return `
<h2>Como usar o simulador de empréstimo</h2>
<p>Preencha as três informações que aparecem em qualquer proposta de crédito: o <strong>valor</strong> que você quer pegar, a <strong>taxa de juros</strong> e o <strong>prazo</strong> em meses. A taxa pode ser digitada ao mês ou ao ano; basta escolher no seletor ao lado do campo. Pode usar vírgula ou ponto: “2,2” e “2.2” dão o mesmo resultado.</p>
<p>O resultado aparece na hora: a parcela, o total que você vai devolver, quanto desse total é só juros e a tabela mês a mês, que mostra como cada parcela se divide entre juros e abatimento da dívida. Para ver parcelas que diminuem com o tempo, marque a opção SAC.</p>

<h2>Como a parcela é calculada</h2>
<p>A maioria dos empréstimos pessoais, consignados e financiamentos usa a <a href="/tabela-price/">Tabela Price</a>, em que todas as parcelas são iguais. A fórmula é:</p>
<p class="formula"><strong>Parcela = Valor × i ÷ [1 − (1 + i)<sup>−n</sup>]</strong></p>
<p>Nela, <em>i</em> é a taxa mensal em forma decimal (2,2% vira 0,022) e <em>n</em> é o número de parcelas. Se a taxa vier ao ano, ela precisa virar a taxa mensal equivalente: <strong>(1 + taxa anual)<sup>1/12</sup> − 1</strong>. Dividir a taxa anual por 12 dá um número errado, porque os juros são compostos (veja o <a href="/converter-taxa-de-juros/">conversor de taxas</a>). Por exemplo, 24% ao ano equivalem a ${p(C.mensalDeAnual(0.24))} ao mês, e não a 2%.</p>

<h2>Exemplo resolvido: R$ 15.000 em 24 meses a 2,2% ao mês</h2>
<ol>
<li>Taxa mensal: i = 0,022. Prazo: n = 24.</li>
<li>(1,022)<sup>−24</sup> ≈ ${f(fator, 4)}, então 1 − ${f(fator, 4)} = ${f(1 - fator, 4)}.</li>
<li>Parcela = 15.000 × 0,022 ÷ ${f(1 - fator, 4)} ≈ <strong>${b(e.parcela)}</strong>.</li>
<li>Total pago = 24 × ${b(e.parcela)} = <strong>${b(e.total)}</strong>.</li>
<li>Juros = ${b(e.total)} − R$ 15.000,00 = <strong>${b(e.juros)}</strong>, ou ${p(e.juros / 15000)} do valor emprestado.</li>
</ol>
<p>No primeiro mês, os juros são 2,2% sobre a dívida inteira: ${b(l1.juros)}. O resto da parcela, ${b(l1.amort)}, abate o saldo, que cai para ${b(l1.saldo)}. A cada mês os juros diminuem e a amortização aumenta, e é isso que a tabela do simulador mostra linha por linha.</p>
<p>O prazo muda tudo. Com a mesma taxa, em 12 meses a parcela sobe para ${b(e12.parcela)}, mas os juros caem para ${b(e12.juros)}. Em 36 meses a parcela fica em ${b(e36.parcela)}, porém os juros chegam a ${b(e36.juros)}. No SAC, a primeira parcela seria ${b(s.primeira)}, a última ${b(s.ultima)} e os juros totais ${b(s.juros)}. Veja a comparação completa em <a href="/price-ou-sac/">Price ou SAC</a>.</p>

<h2>CET e IOF: o que mais entra no custo</h2>
<p>A taxa de juros não é o único custo. Todo contrato de crédito precisa informar o <strong><a href="/o-que-e-cet/">Custo Efetivo Total (CET)</a></strong>, que junta juros, impostos, tarifas e seguros em uma taxa só. Na hora de comparar propostas, é o CET que conta: duas ofertas com a mesma taxa de juros podem ter CET bem diferentes.</p>
<p>O principal imposto é o <strong>IOF</strong> (Imposto sobre Operações Financeiras). Em empréstimos para pessoa física ele costuma ter uma parte fixa, cobrada uma vez, e uma parte diária, que cresce com o prazo até um limite. Somadas, ficam em poucos pontos percentuais do valor. As alíquotas são definidas pelo governo e podem mudar, então confira o valor exato na proposta. Muitas vezes o IOF é financiado junto com o empréstimo, o que aumenta um pouco a parcela.</p>
<p>Também podem aparecer tarifa de cadastro e seguro prestamista. Se houver seguro, pergunte se ele é opcional: o consumidor não pode ser obrigado a contratá-lo com a seguradora indicada por quem empresta.</p>

<h2>Dicas para pagar menos juros</h2>
<ul>
<li><strong>Compare o CET de pelo menos três propostas</strong> para o mesmo valor e prazo. Use o simulador para ver quanto cada diferença de taxa vale em reais.</li>
<li><strong>Escolha o menor prazo com parcela que caiba com folga</strong> no orçamento. Prazos longos aliviam o mês, mas multiplicam os juros.</li>
<li><strong>Peça só o que precisa.</strong> No exemplo acima, cada R$ 1.000 a menos economiza ${b(mil.juros)} de juros.</li>
<li><strong>Antecipe parcelas quando sobrar dinheiro.</strong> Quem quita ou adianta parcelas tem direito ao abatimento proporcional dos juros; veja quanto em <a href="/quitar-emprestimo-antecipado/">quitar empréstimo antecipado</a>.</li>
<li><strong>Troque dívidas caras por mais baratas</strong>, como o rotativo do cartão por um crédito de CET menor, e não o contrário.</li>
<li><strong>Desconfie de quem pede depósito antecipado</strong> para “liberar” um empréstimo. Instituições sérias não cobram nada antes de liberar o dinheiro.</li>
</ul>`;
  },
  faq: [
    ['Como calcular a parcela de um empréstimo?', 'Use a fórmula da Tabela Price: parcela = valor × i ÷ [1 − (1 + i)^−n], com a taxa mensal em decimal. Exemplo: R$ 15.000 a 2,2% ao mês em 24 meses dá parcela de R$ 811,15. O simulador desta página faz a conta automaticamente.'],
    ['Qual a diferença entre taxa ao mês e taxa ao ano?', 'Os juros são compostos, então a taxa anual não é 12 vezes a mensal. Uma taxa de 2,2% ao mês equivale a 29,84% ao ano. Para converter de anual para mensal, use (1 + taxa anual)^(1/12) − 1.'],
    ['Price ou SAC: qual paga menos juros?', 'Com a mesma taxa e o mesmo prazo, o SAC paga menos juros porque abate a dívida mais rápido, mas começa com parcelas maiores. Para R$ 15.000 a 2,2% ao mês em 24 meses, os juros são R$ 4.467,60 na Price e R$ 4.125,00 no SAC.'],
    ['O resultado inclui IOF e tarifas?', 'Não. O simulador calcula apenas os juros. IOF, tarifas e seguros entram no Custo Efetivo Total (CET), que a instituição deve informar na proposta. Por isso a parcela real pode ser um pouco maior.'],
    ['Posso quitar o empréstimo antes e pagar menos juros?', 'Sim. Ao antecipar parcelas ou quitar o contrato, o consumidor tem direito ao abatimento proporcional dos juros. Peça à instituição o valor atualizado para a quitação.'],
    ['Este site oferece empréstimo?', 'Não. É apenas uma calculadora gratuita. Não oferecemos nem intermediamos crédito e não temos vínculo com bancos, financeiras ou órgãos públicos.']
  ]
};

/* =================== 2. Quanto fica um empréstimo (tabelas) =================== */

const VALORES = [500, 1000, 2000, 3000, 4000, 5000, 8000, 10000, 15000, 20000, 30000, 50000, 100000];
const PRAZOS = [6, 12, 18, 24, 36, 48];
const TAXAS = [0.015, 0.025, 0.035, 0.05];
// prazo usado na frase de exemplo de cada valor (varia para cobrir buscas diferentes)
const PRAZO_FRASE = { 500: 6, 1000: 12, 2000: 12, 3000: 18, 4000: 12, 5000: 24, 8000: 24, 10000: 24, 15000: 36, 20000: 36, 30000: 48, 50000: 48, 100000: 48 };

const nomeValor = (v) => 'R$ ' + C.fmt(v, 0);
const curto = (v) => (v >= 1000 ? C.fmt(v / 1000, 0) + ' mil' : 'R$ ' + C.fmt(v, 0));

function tabelaValor(v) {
  const cab = TAXAS.map((t) => `<th scope="col">${f(t * 100, 1)}%</th>`).join('');
  const linhas = PRAZOS.map((n) => {
    const cel = TAXAS.map((t) => {
      const r = C.price(v, t, n);
      return `<td><b>${f(r.parcela)}</b><small>${f(r.total)}</small></td>`;
    }).join('');
    return `<tr><th scope="row">${n}x</th>${cel}</tr>`;
  }).join('\n');
  return `<div class="rolagem"><table class="tabela-pronta"><caption>Empréstimo de ${nomeValor(v)} — taxa ao mês nas colunas; parcela (em cima) e total pago (embaixo), em R$</caption>
<thead><tr><th scope="col">Prazo</th>${cab}</tr></thead>
<tbody>
${linhas}
</tbody></table></div>`;
}

function fraseValor(v) {
  const n = PRAZO_FRASE[v];
  const meio = C.price(v, 0.025, n), baixo = C.price(v, 0.015, n), alto = C.price(v, 0.05, n);
  return `Um empréstimo de ${nomeValor(v)} em ${n} meses a 2,5% ao mês fica em <strong>${b(meio.parcela)}</strong> por mês, com total de ${b(meio.total)} (${b(meio.juros)} de juros). A 1,5% ao mês, a parcela cai para ${b(baixo.parcela)}; a 5% ao mês, sobe para ${b(alto.parcela)}.`;
}

const quantoFica = {
  slug: 'quanto-fica-emprestimo',
  caminho: '/quanto-fica-emprestimo/',
  title: 'Quanto Fica um Empréstimo? Tabela de parcelas',
  description: 'Tabelas prontas: quanto fica um empréstimo de R$ 500 a R$ 100 mil em 6 a 48 meses, com juros de 1,5% a 5% ao mês. Parcela e total pago.',
  h1: 'Quanto fica um empréstimo: tabela de parcelas',
  trilha: 'Quanto fica um empréstimo',
  appNome: 'Calculadora de quanto fica um empréstimo',
  link: { titulo: 'Quanto fica um empréstimo', desc: 'Tabelas prontas de parcelas de R$ 500 a R$ 100 mil.' },
  lead: 'Consulte nas tabelas a parcela e o total pago para os valores mais procurados, ou faça a conta exata na calculadora logo abaixo.',
  calc: {
    tipo: 'rapido',
    titulo: 'Calcule um valor específico',
    campos: [dinheiro('valor', 'Valor do empréstimo', '5.000'), taxa('2,5'), prazo('24')]
  },
  artigo() {
    const indice = VALORES.map((v) => `<li><a href="#r-${v}">${curto(v)}</a></li>`).join('');
    const secoes = VALORES.map((v) => `<h2 id="r-${v}">Quanto fica um empréstimo de ${nomeValor(v)}?</h2>
<p>${fraseValor(v)}</p>
${tabelaValor(v)}
<p>Até 60 meses: <a href="/emprestimo-de-${v}-reais/">empréstimo de ${nomeValor(v)}</a>.</p>`).join('\n\n');
    return `
<h2>Como ler as tabelas</h2>
<p>Cada tabela abaixo corresponde a um valor de empréstimo. As linhas são os prazos, de 6 a 48 meses, e as colunas são as taxas de juros mensais: 1,5%, 2,5%, 3,5% e 5% ao mês. Em cada célula, o número de cima é a <strong>parcela mensal</strong> e o de baixo, em cinza, é o <strong>total pago</strong> até o fim do contrato. Todos os valores estão em reais e foram calculados pela Tabela Price, com parcelas fixas.</p>
<p>Ir direto para o valor:</p>
<ul class="indice">${indice}</ul>

${secoes}

<h2>Como os valores foram calculados</h2>
<p>A parcela segue a fórmula da Tabela Price: <strong>parcela = valor × i ÷ [1 − (1 + i)<sup>−n</sup>]</strong>, em que <em>i</em> é a taxa mensal em decimal e <em>n</em> é o número de meses. O resultado é arredondado em centavos e o total pago é a parcela multiplicada pelo número de meses. Para outros valores, prazos ou taxas, use a calculadora no topo da página ou o <a href="/simulador-emprestimo/">simulador de empréstimo</a> completo, que também mostra a tabela mês a mês.</p>
<p>Repare em dois padrões. Primeiro, o prazo pesa muito: a parcela cai quando o prazo aumenta, mas o total pago sobe. Segundo, a taxa pesa ainda mais em prazos longos: em 48 meses, a diferença entre 1,5% e 5% ao mês pode mais que dobrar o total pago.</p>

<h2>Por que a proposta real pode ser diferente</h2>
<p>As tabelas consideram só os juros. Uma proposta de verdade inclui o <strong>IOF</strong>, imposto cobrado nas operações de crédito, com uma parte fixa e outra que cresce com o prazo, e pode ter tarifas e seguros. Tudo isso entra no <strong>Custo Efetivo Total (CET)</strong>, que a instituição precisa informar antes da contratação. Se a parcela oferecida for maior que a da tabela para a mesma taxa, a diferença costuma estar nesses itens. Para descobrir a taxa real de uma proposta a partir da parcela, use a calculadora para <a href="/descobrir-taxa-de-juros/">descobrir a taxa de juros</a>.</p>

<h2>Dicas para usar as tabelas</h2>
<ul>
<li>Antes de pedir propostas, veja aqui qual parcela cabe no seu orçamento e em quanto tempo.</li>
<li>Compare propostas pelo total pago e pelo CET, não só pela parcela.</li>
<li>Se a parcela de 12 meses cabe, evite esticar para 36 ou 48 só para sobrar mais no mês: os juros crescem muito.</li>
<li>Desconfie de ofertas que pedem pagamento antecipado para liberar o dinheiro.</li>
</ul>`;
  },
  faq: (() => {
    const c = (v, t, n) => C.price(v, t, n);
    const q1 = [c(5000, 0.015, 12), c(5000, 0.025, 12), c(5000, 0.05, 12)];
    const q2 = [c(10000, 0.015, 24), c(10000, 0.025, 24), c(10000, 0.05, 24)];
    const q3 = [c(1000, 0.015, 12), c(1000, 0.05, 12)];
    return [
      ['Quanto fica um empréstimo de R$ 5.000 em 12 vezes?', `A 2,5% ao mês, a parcela fica em ${b(q1[1].parcela)} (total de ${b(q1[1].total)}). A 1,5% ao mês, ${b(q1[0].parcela)}; a 5% ao mês, ${b(q1[2].parcela)}. Os valores não incluem IOF nem tarifas.`],
      ['Quanto fica um empréstimo de R$ 10.000 em 24 vezes?', `A 2,5% ao mês, a parcela fica em ${b(q2[1].parcela)}, com total de ${b(q2[1].total)}. A 1,5% ao mês, ${b(q2[0].parcela)}; a 5% ao mês, ${b(q2[2].parcela)}.`],
      ['Quanto fica um empréstimo de R$ 1.000?', `Em 12 vezes, a parcela vai de ${b(q3[0].parcela)} (a 1,5% ao mês) até ${b(q3[1].parcela)} (a 5% ao mês). Veja a tabela de R$ 1.000 para outros prazos.`],
      ['Por que a parcela da proposta é diferente da tabela?', 'Porque a proposta real inclui IOF, tarifas e, às vezes, seguros, que formam o Custo Efetivo Total (CET). As tabelas mostram apenas o efeito dos juros.'],
      ['Qual taxa devo usar para consultar a tabela?', 'Use a taxa mensal informada na proposta. Se você só tem o valor da parcela, descubra a taxa com a calculadora de taxa de juros e depois compare aqui.']
    ];
  })()
};

/* =================== 3. Financiamento de carro =================== */

const carro = {
  slug: 'simulador-financiamento-carro',
  caminho: '/simulador-financiamento-carro/',
  title: 'Simulador de Financiamento de Carro: parcela e juros',
  description: 'Calcule a parcela do financiamento de carro com entrada, taxa e prazo. Veja os juros, o custo final do carro e a tabela mês a mês. Grátis.',
  h1: 'Simulador de financiamento de carro',
  trilha: 'Financiamento de carro',
  appNome: 'Simulador de financiamento de carro',
  link: { titulo: 'Financiamento de carro', desc: 'Entrada, parcela e custo total do carro.' },
  lead: 'Informe o preço do carro, a entrada, a taxa de juros e o prazo. O simulador mostra a parcela, os juros e quanto o carro vai custar no total.',
  calc: {
    tipo: 'financiamento',
    titulo: 'Simule o financiamento do carro',
    campos: [
      dinheiro('valor', 'Preço do carro', '60.000'),
      dinheiro('entrada', 'Entrada', '20.000'),
      taxa('1,49'),
      prazo('48')
    ]
  },
  artigo() {
    const c48 = C.price(40000, 0.0149, 48), c36 = C.price(40000, 0.0149, 36), c60 = C.price(40000, 0.0149, 60);
    const c30 = C.price(30000, 0.0149, 48);
    const custo = 20000 + c48.total;
    const pvUltima = c48.parcela / Math.pow(1.0149, 48);
    return `
<h2>Como funciona o financiamento de carro</h2>
<p>No financiamento de veículo, a instituição paga o carro ao vendedor e você devolve o dinheiro em parcelas mensais com juros. Na maioria dos contratos as parcelas são fixas, calculadas pela <a href="/tabela-price/">Tabela Price</a>. Até a última parcela o carro fica alienado à instituição: ele é a garantia da dívida e só fica livre no documento depois da quitação.</p>
<p>Por ter o veículo como garantia, essa modalidade costuma custar menos que um empréstimo pessoal sem garantia. Mesmo assim, em prazos longos os juros pesam bastante, e é isso que o simulador ajuda a enxergar antes de você assinar.</p>

<h2>Exemplo resolvido: carro de R$ 60.000 com R$ 20.000 de entrada</h2>
<p>Com R$ 20.000 de entrada (${p(20000 / 60000, 1)} do preço), sobram R$ 40.000 para financiar. Com taxa de 1,49% ao mês (${p(C.anualDeMensal(0.0149))} ao ano) em 48 meses:</p>
<ul>
<li>Parcela: <strong>${b(c48.parcela)}</strong></li>
<li>Total das parcelas: 48 × ${b(c48.parcela)} = ${b(c48.total)}</li>
<li>Juros: ${b(c48.juros)}</li>
<li>Custo total do carro: R$ 20.000 + ${b(c48.total)} = <strong>${b(custo)}</strong>, ou ${p((custo - 60000) / 60000, 1)} acima do preço à vista.</li>
</ul>
<p>Veja como o prazo mexe na conta, mantendo a mesma taxa e os mesmos R$ 40.000 financiados:</p>
<div class="rolagem"><table><caption>R$ 40.000 a 1,49% ao mês</caption>
<thead><tr><th scope="col">Prazo</th><th scope="col">Parcela</th><th scope="col">Juros totais</th></tr></thead>
<tbody>
<tr><td>36 meses</td><td>${b(c36.parcela)}</td><td>${b(c36.juros)}</td></tr>
<tr><td>48 meses</td><td>${b(c48.parcela)}</td><td>${b(c48.juros)}</td></tr>
<tr><td>60 meses</td><td>${b(c60.parcela)}</td><td>${b(c60.juros)}</td></tr>
</tbody></table></div>
<p>Se a entrada subir para R$ 30.000, o valor financiado cai para R$ 30.000 e a parcela em 48 meses vai para ${b(c30.parcela)}, com ${b(c30.juros)} de juros: ${b(c48.juros - c30.juros)} a menos do que com R$ 20.000 de entrada.</p>

<h2>Quanto dar de entrada?</h2>
<p>Quanto maior a entrada, menor o valor financiado e menos juros você paga. Muitas instituições pedem uma entrada mínima, que varia conforme o carro, o ano do modelo e o seu perfil. Teste no simulador entradas diferentes e veja quanto cada R$ 1.000 a mais economiza. Lembre também que ter um carro tem outros custos mensais, como seguro, combustível, manutenção, IPVA e licenciamento, que precisam caber no orçamento junto com a parcela.</p>

<h2>CET, IOF e tarifas do financiamento</h2>
<p>A taxa de juros anunciada não mostra o custo completo. O contrato deve informar o <strong>Custo Efetivo Total (CET)</strong>, que soma juros, <strong>IOF</strong>, tarifas e seguros. No financiamento de veículos é comum aparecerem tarifa de cadastro, registro do contrato e, às vezes, avaliação do bem. O IOF é um imposto sobre operações de crédito, com uma parte fixa e outra proporcional ao prazo, e normalmente é incluído no valor financiado. Compare propostas sempre pelo CET, para o mesmo valor e prazo.</p>
<p>Leia com atenção ofertas de “taxa zero”: em geral exigem entrada alta e prazo curto, e às vezes o preço do carro é maior do que o pago à vista. Para achar o juro embutido, use a calculadora para <a href="/descobrir-taxa-de-juros/">descobrir a taxa de juros</a> com o preço à vista, a parcela e o número de parcelas.</p>

<h2>Dicas para pagar menos juros no financiamento</h2>
<ul>
<li>Peça simulações em mais de uma instituição e compare o CET, não só a parcela.</li>
<li>Aumente a entrada sempre que possível, nem que seja adiando a compra por alguns meses.</li>
<li>Escolha o menor prazo com parcela confortável. Uma regra prática comum é não comprometer mais de 30% da renda com todas as dívidas somadas.</li>
<li>Antecipe parcelas quando sobrar dinheiro, de preferência as últimas: você paga o valor delas descontado dos juros (calcule em <a href="/quitar-emprestimo-antecipado/">quitar empréstimo antecipado</a>). Logo depois de assinar, a 48ª parcela do exemplo sairia por cerca de ${b(pvUltima)}, em vez de ${b(c48.parcela)}.</li>
<li>Leia o contrato antes de assinar e recuse itens que você não pediu, como seguros ou serviços extras.</li>
</ul>`;
  },
  faq: [
    ['Como calcular a parcela do financiamento de carro?', 'Desconte a entrada do preço do carro e aplique a fórmula da Tabela Price sobre o valor financiado. Exemplo: carro de R$ 60.000 com R$ 20.000 de entrada, taxa de 1,49% ao mês e 48 meses dá parcela de R$ 1.172,49.'],
    ['Quanto de entrada é preciso dar?', 'Depende da instituição, do veículo e do seu perfil. Quanto maior a entrada, menor o valor financiado e menos juros você paga ao longo do contrato.'],
    ['Financiamento com taxa zero existe?', 'Existem campanhas com essa condição, mas normalmente exigem entrada alta e prazo curto. Compare o preço à vista com o total pago e confira o CET para saber se há custo embutido.'],
    ['O que é CET no financiamento de veículo?', 'É o Custo Efetivo Total: a taxa que junta juros, IOF, tarifas e seguros do contrato. É o número certo para comparar propostas diferentes.'],
    ['Posso quitar o financiamento antes do prazo?', 'Sim. Ao adiantar parcelas ou quitar o contrato, você tem direito ao abatimento proporcional dos juros. Depois da quitação, a alienação do veículo deve ser baixada.'],
    ['O simulador serve para carro usado?', 'Sim. A conta é a mesma para carro novo ou usado; o que costuma mudar é a taxa oferecida e a entrada mínima exigida.']
  ]
};

/* =================== 4. Financiamento de moto =================== */

const moto = {
  slug: 'simulador-financiamento-moto',
  caminho: '/simulador-financiamento-moto/',
  title: 'Simulador de Financiamento de Moto: parcela e juros',
  description: 'Simule o financiamento de moto: preço, entrada, taxa e prazo. Veja a parcela, os juros e o custo total da moto, com tabela mês a mês. Grátis.',
  h1: 'Simulador de financiamento de moto',
  trilha: 'Financiamento de moto',
  appNome: 'Simulador de financiamento de moto',
  link: { titulo: 'Financiamento de moto', desc: 'Quanto fica a parcela da moto e o custo final.' },
  lead: 'Descubra quanto fica a parcela da moto antes de ir à loja: informe o preço, a entrada, a taxa de juros e o prazo.',
  calc: {
    tipo: 'financiamento',
    titulo: 'Simule o financiamento da moto',
    campos: [
      dinheiro('valor', 'Preço da moto', '15.000'),
      dinheiro('entrada', 'Entrada', '3.000'),
      taxa('1,99'),
      prazo('36')
    ]
  },
  artigo() {
    const m24 = C.price(12000, 0.0199, 24), m36 = C.price(12000, 0.0199, 36), m48 = C.price(12000, 0.0199, 48);
    const custo = 3000 + m36.total;
    return `
<h2>Como funciona o financiamento de moto</h2>
<p>O financiamento de moto segue a mesma lógica do financiamento de carro: você dá uma entrada (ou não, quando a instituição aceita), financia o restante e paga parcelas fixas com juros, calculadas pela <a href="/tabela-price/">Tabela Price</a>. A moto fica alienada à instituição até a quitação, servindo de garantia. Para quem usa a moto para trabalhar, seja em entregas, transporte ou para chegar ao emprego, a parcela vira um custo fixo do mês. Por isso vale simular com calma.</p>

<h2>Exemplo resolvido: moto de R$ 15.000 com R$ 3.000 de entrada</h2>
<p>Valor financiado: R$ 12.000. Taxa de 1,99% ao mês (${p(C.anualDeMensal(0.0199))} ao ano), em 36 meses:</p>
<ul>
<li>Parcela: <strong>${b(m36.parcela)}</strong></li>
<li>Total das parcelas: 36 × ${b(m36.parcela)} = ${b(m36.total)}</li>
<li>Juros: ${b(m36.juros)}</li>
<li>Custo total da moto (entrada + parcelas): <strong>${b(custo)}</strong>, ${p((custo - 15000) / 15000, 1)} acima do preço à vista.</li>
</ul>
<div class="rolagem"><table><caption>R$ 12.000 a 1,99% ao mês</caption>
<thead><tr><th scope="col">Prazo</th><th scope="col">Parcela</th><th scope="col">Juros totais</th></tr></thead>
<tbody>
<tr><td>24 meses</td><td>${b(m24.parcela)}</td><td>${b(m24.juros)}</td></tr>
<tr><td>36 meses</td><td>${b(m36.parcela)}</td><td>${b(m36.juros)}</td></tr>
<tr><td>48 meses</td><td>${b(m48.parcela)}</td><td>${b(m48.juros)}</td></tr>
</tbody></table></div>
<p>Esticar de 24 para 48 meses reduz a parcela em ${b(m24.parcela - m48.parcela)}, mas mais que dobra os juros: de ${b(m24.juros)} para ${b(m48.juros)}.</p>

<h2>Financiar, juntar dinheiro ou consórcio?</h2>
<p>Se a moto não é urgente, compare com a opção de guardar dinheiro. Guardando os mesmos ${b(m36.parcela)} por mês, você juntaria os R$ 12.000 em cerca de ${Math.ceil(12000 / m36.parcela)} meses, sem contar o rendimento, em vez de pagar 36 parcelas.</p>
<p>O consórcio não cobra juros, mas tem taxa de administração e outros encargos, e a moto só vem quando você é contemplado por sorteio ou lance, sem data certa. Pode servir para quem tem disciplina e não tem pressa. Para quem precisa da moto agora, o financiamento costuma ser o caminho, desde que a parcela caiba no orçamento.</p>

<h2>CET, IOF e outros custos</h2>
<p>Além dos juros, o financiamento tem <strong>IOF</strong>, imposto cobrado em operações de crédito, com uma parte fixa e outra que cresce com o prazo, e pode ter tarifas de cadastro e de registro do contrato. Tudo isso entra no <strong>Custo Efetivo Total (CET)</strong>, que deve estar na proposta. Compare o CET, não só a taxa ou a parcela; para achar o custo efetivo a partir do valor financiado e da parcela, use a calculadora de <a href="/o-que-e-cet/">CET</a>. E lembre dos custos de manter a moto: seguro, manutenção, combustível, licenciamento e equipamentos de segurança.</p>

<h2>Dicas para pagar menos juros</h2>
<ul>
<li>Dê a maior entrada que conseguir sem zerar a sua reserva para emergências.</li>
<li>Prefira prazos curtos: no exemplo, 24 meses custam ${b(m48.juros - m24.juros)} a menos de juros do que 48.</li>
<li>Peça propostas em mais de uma instituição e compare o CET.</li>
<li>Se a loja anuncia “parcelado sem juros”, pergunte o preço à vista. Se ele for menor, há juros embutidos; a calculadora de <a href="/juros-parcelamento/">juros no parcelamento</a> mostra quanto.</li>
<li>Antecipe parcelas quando puder, de preferência as últimas, que têm o maior desconto de juros. Veja quanto custa em <a href="/quitar-emprestimo-antecipado/">quitar empréstimo antecipado</a>.</li>
</ul>`;
  },
  faq: [
    ['Como calcular a parcela da moto?', 'Desconte a entrada do preço da moto e aplique a fórmula da Tabela Price sobre o restante. Exemplo: moto de R$ 15.000 com R$ 3.000 de entrada, a 1,99% ao mês em 36 meses, dá parcela de R$ 470,04.'],
    ['Dá para financiar moto sem entrada?', 'Algumas instituições aceitam financiar o valor total, dependendo do perfil e da moto. Sem entrada, o valor financiado e os juros totais ficam maiores. Simule com e sem entrada para comparar.'],
    ['Vale mais a pena financiar ou fazer consórcio?', 'O consórcio não tem juros, mas tem taxa de administração e não tem data certa para a moto chegar. O financiamento entrega a moto na hora, com juros. A escolha depende da urgência e do orçamento.'],
    ['Qual é o prazo do financiamento de moto?', 'Varia conforme a instituição e a moto; prazos entre 12 e 48 meses são comuns. Quanto maior o prazo, menor a parcela e maior o total de juros.'],
    ['O que é o CET?', 'É o Custo Efetivo Total: a taxa que inclui juros, IOF, tarifas e seguros. É o melhor número para comparar propostas de financiamento.'],
    ['O resultado é igual ao da loja?', 'Pode haver diferenças, porque a proposta real inclui IOF, tarifas e às vezes seguros. Use o simulador como referência e confira o CET informado na proposta.']
  ]
};

/* =================== 5. Consignado =================== */

const consignado = {
  slug: 'emprestimo-consignado',
  caminho: '/emprestimo-consignado/',
  title: 'Simulador de Empréstimo Consignado: parcela e margem',
  description: 'Simule o consignado para CLT, aposentado ou servidor: veja a parcela, se ela cabe na margem consignável, os juros e o valor máximo.',
  h1: 'Simulador de empréstimo consignado',
  trilha: 'Empréstimo consignado',
  appNome: 'Simulador de empréstimo consignado',
  link: { titulo: 'Empréstimo consignado', desc: 'Parcela, margem consignável e juros.' },
  lead: 'Para trabalhadores CLT, aposentados, pensionistas e servidores: veja a parcela, se ela cabe na sua margem e quanto vai pagar de juros.',
  calc: {
    tipo: 'consignado',
    titulo: 'Simule o consignado',
    campos: [
      dinheiro('renda', 'Renda líquida (salário ou benefício)', '3.000'),
      { tipo: 'pct', nome: 'margem', rotulo: 'Margem consignável', valor: '35', dica: 'Percentual da renda que pode ser descontado. Confira no contracheque ou no extrato do benefício.' },
      dinheiro('valor', 'Valor desejado', '10.000'),
      taxa('1,8'),
      prazo('48')
    ]
  },
  artigo() {
    const c48 = C.price(10000, 0.018, 48), c84 = C.price(10000, 0.018, 84);
    const max = C.valorPresente(1050, 0.018, 48);
    return `
<h2>Como funciona o empréstimo consignado</h2>
<p>No consignado, a parcela é descontada direto do salário, da aposentadoria ou da pensão, antes de o dinheiro chegar à sua conta. Como o pagamento é automático, o risco de atraso para quem empresta é menor, e isso costuma aparecer em taxas menores do que as do empréstimo pessoal sem garantia. Em troca, você compromete parte da renda por meses ou anos, sem poder “pular” uma parcela.</p>
<p>Há três públicos principais, cada um com regras próprias:</p>
<ul>
<li><strong>Trabalhadores com carteira assinada (CLT):</strong> o desconto é feito na folha de pagamento da empresa.</li>
<li><strong>Aposentados e pensionistas:</strong> o desconto é feito no benefício, e existe um teto para a taxa de juros, definido pelo governo e revisto de tempos em tempos.</li>
<li><strong>Servidores públicos:</strong> o desconto é feito no contracheque, conforme as regras de cada órgão.</li>
</ul>

<h2>O que é a margem consignável</h2>
<p>É o percentual máximo da renda líquida que pode ser comprometido com parcelas descontadas em folha ou no benefício. O limite é definido em lei e nas normas de cada tipo de vínculo, e parte dele pode ficar reservada para cartão consignado ou cartão de benefício. Como as regras mudam, confira a margem disponível no contracheque, no extrato do benefício ou com o setor de pessoal. No simulador, digite o percentual que vale para você; os 35% que aparecem preenchidos são só um exemplo.</p>

<h2>Exemplo resolvido</h2>
<p>Renda líquida de R$ 3.000 e margem de 35%: dá para comprometer até ${b(1050)} por mês. Pegando R$ 10.000 a 1,8% ao mês (${p(C.anualDeMensal(0.018))} ao ano) em 48 meses:</p>
<ul>
<li>Parcela: <strong>${b(c48.parcela)}</strong>. Cabe na margem, usando ${p(c48.parcela / 1050, 0)} dela e ${p(c48.parcela / 3000, 1)} da renda.</li>
<li>Total pago: ${b(c48.total)}</li>
<li>Juros: ${b(c48.juros)}</li>
</ul>
<p>Com a margem inteira de R$ 1.050 por mês, na mesma taxa e prazo, o valor máximo seria de cerca de ${b(max)}. Mas usar a margem toda deixa você sem espaço para imprevistos, e a parcela sai da renda todo mês, sem negociação.</p>

<h2>Prazo longo: parcela menor, juros maiores</h2>
<p>O consignado permite prazos longos, o que deixa a parcela pequena. Só que o custo cresce rápido: os mesmos R$ 10.000 a 1,8% ao mês em 84 meses têm parcela de ${b(c84.parcela)}, mas os juros chegam a ${b(c84.juros)}, quase o valor emprestado e ${b(c84.juros - c48.juros)} a mais do que em 48 meses.</p>

<h2>CET, IOF e outros custos</h2>
<p>Como em qualquer crédito, o consignado tem <strong>IOF</strong>, imposto sobre operações de crédito, com uma parte fixa e outra que cresce com o prazo, e pode ter tarifas e seguros. Tudo isso entra no <strong>Custo Efetivo Total (CET)</strong>, que deve aparecer na proposta. Compare o CET entre instituições: mesmo quando existe teto de juros, as propostas podem ser bem diferentes.</p>

<h2>Cuidados e dicas</h2>
<ul>
<li><strong>Nunca pague nada antes</strong> para “liberar” um consignado. Pedido de depósito antecipado é golpe.</li>
<li><strong>Não passe senhas nem códigos</strong> recebidos por mensagem para quem ligar oferecendo crédito.</li>
<li><strong>Se cair na conta um empréstimo que você não pediu</strong>, não use o dinheiro: procure a instituição para devolver e cancelar.</li>
<li><strong>Considere a portabilidade:</strong> você pode levar o consignado para outra instituição que ofereça CET menor.</li>
<li><strong>Quite ou antecipe parcelas quando puder:</strong> o abatimento proporcional dos juros é um direito seu.</li>
<li><strong>Use o consignado para trocar dívidas caras</strong>, como o rotativo do cartão, e não para criar dívidas novas. Para comparar com outra proposta, veja <a href="/emprestimo-pessoal-ou-consignado/">empréstimo pessoal ou consignado</a>.</li>
</ul>`;
  },
  faq: [
    ['Como calcular a parcela do consignado?', 'Use a fórmula da Tabela Price com o valor, a taxa mensal e o prazo. Exemplo: R$ 10.000 a 1,8% ao mês em 48 meses dá parcela de R$ 312,89. Depois, confira se a parcela cabe na sua margem consignável.'],
    ['O que é margem consignável?', 'É o percentual máximo da renda líquida que pode ser descontado em folha ou no benefício para pagar parcelas. O limite depende do tipo de vínculo e das regras em vigor; confira o seu no contracheque ou no extrato do benefício.'],
    ['Qual é a taxa de juros do consignado?', 'Varia conforme a instituição, o tipo de consignado e o prazo. Para aposentados e pensionistas existe um teto definido pelo governo, que muda de tempos em tempos. Use a taxa da sua proposta no simulador e compare sempre o CET.'],
    ['Qual é o prazo máximo do consignado?', 'Depende do tipo de vínculo e das regras em vigor. Prazos mais longos reduzem a parcela, mas aumentam muito os juros totais.'],
    ['Posso quitar o consignado antes do prazo?', 'Sim. Na quitação antecipada ou no adiantamento de parcelas, você tem direito ao abatimento proporcional dos juros. Peça o saldo devedor atualizado à instituição.'],
    ['Este site faz empréstimo consignado?', 'Não. É apenas uma calculadora. Não oferecemos nem intermediamos crédito e não temos vínculo com bancos, financeiras ou órgãos públicos.']
  ]
};

module.exports = { simuladorEmprestimo, quantoFica, carro, moto, consignado };
