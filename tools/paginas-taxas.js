// Conteúdo: converter taxa, juros simples × compostos, CET e juros do crediário.
'use strict';
const { C, b, p, f, dinheiro, taxa, prazo, parcelas } = require('./comum.js');

/* =================== Converter taxa de juros =================== */

const converter = {
  slug: 'converter-taxa-de-juros',
  caminho: '/converter-taxa-de-juros/',
  title: 'Converter Taxa de Juros: mensal, anual e diária',
  description: 'Converta taxa de juros mensal para anual, anual para mensal e diária para mensal por juros compostos. Tabela de equivalências de 1% a 10% ao mês.',
  h1: 'Converter taxa de juros: mensal, anual e diária',
  trilha: 'Converter taxa de juros',
  appNome: 'Conversor de taxa de juros',
  link: { titulo: 'Converter taxa de juros', desc: 'Mensal ↔ anual e diária ↔ mensal.' },
  lead: 'Digite a taxa e o período em que ela foi informada. O conversor mostra as taxas equivalentes ao dia, ao mês e ao ano, e quanto a conta simples erraria.',
  cta: 'No app você digita a taxa ao mês ou ao ano, compara ofertas e descobre a taxa embutida de qualquer parcela.',
  calc: {
    tipo: 'converter',
    titulo: 'Converta a taxa',
    botao: 'Converter',
    campos: [
      { tipo: 'pct', nome: 'taxa', rotulo: 'Taxa de juros', valor: '2' },
      { tipo: 'select', nome: 'de', rotulo: 'A taxa digitada é', valor: 'mes', opcoes: [['dia', 'ao dia'], ['mes', 'ao mês'], ['ano', 'ao ano']] }
    ]
  },
  artigo() {
    const a2 = C.anualDeMensal(0.02), m12 = C.mensalDeAnual(0.12);
    const linhas = [];
    for (let k = 1; k <= 10; k++) {
      const i = k / 100;
      linhas.push(`<tr><td>${k}% ao mês</td><td>${p(C.anualDeMensal(i))}</td><td>${p(i * 12)}</td><td>${p(C.equivalente(i, 30, 1), 4)}</td></tr>`);
    }
    const err1 = (C.anualDeMensal(0.01) - 0.12) * 100, err10 = (C.anualDeMensal(0.10) - 1.2) * 100;
    const a15 = Math.pow(1.015, 12), m18 = Math.pow(1.18, 1 / 12), d02 = Math.pow(1.002, 30);
    return `
<h2>Por que não dá para multiplicar por 12</h2>
<p>Com juros compostos, os juros de cada mês entram no saldo e passam a render juros no mês seguinte. Por isso uma taxa de 2% ao mês não vira 24% ao ano. No primeiro mês, R$ 100 viram R$ 102; no segundo, os 2% incidem sobre R$ 102 e o saldo vai a R$ 104,04; ao fim de 12 meses, chega a ${b(100 * Math.pow(1.02, 12))}. A taxa anual equivalente é ${p(a2)}, e não 24%.</p>
<p>O contrário também vale: 12% ao ano não são 1% ao mês, e sim ${p(m12, 4)}. A diferença parece pequena, mas em prazos longos, como nos financiamentos, muda bastante o valor da parcela.</p>

<h2>As fórmulas de conversão</h2>
<ul>
<li><strong>Mensal para anual:</strong> taxa anual = (1 + taxa mensal)<sup>12</sup> − 1</li>
<li><strong>Anual para mensal:</strong> taxa mensal = (1 + taxa anual)<sup>1/12</sup> − 1</li>
<li><strong>Diária para mensal:</strong> taxa mensal = (1 + taxa diária)<sup>30</sup> − 1</li>
<li><strong>Mensal para diária:</strong> taxa diária = (1 + taxa mensal)<sup>1/30</sup> − 1</li>
</ul>
<p>A regra geral é <strong>taxa equivalente = (1 + taxa)<sup>período desejado ÷ período da taxa</sup> − 1</strong>, com os dois períodos medidos na mesma unidade. As taxas sempre entram na conta em forma decimal: 2% vira 0,02.</p>

<h2>Tabela de equivalências: de 1% a 10% ao mês</h2>
<p>As taxas mensais mais comuns e as equivalentes ao ano e ao dia, por juros compostos, ao lado da conta simples (taxa × 12) para comparar.</p>
<div class="rolagem"><table class="comparativo"><caption>Taxas equivalentes por juros compostos (mês de 30 dias)</caption>
<thead><tr><th scope="col">Taxa mensal</th><th scope="col">Ao ano (compostos)</th><th scope="col">Ao ano (× 12)</th><th scope="col">Ao dia</th></tr></thead>
<tbody>
${linhas.join('\n')}
</tbody></table></div>
<p>Repare como a distância entre as duas colunas anuais cresce com a taxa: a 1% ao mês, a conta simples erra por ${f(err1)} pontos percentuais no ano; a 10% ao mês, erra por ${f(err10, 0)} pontos.</p>

<h2>Exemplos resolvidos</h2>
<ol>
<li><strong>1,5% ao mês para anual:</strong> 1,015<sup>12</sup> = ${f(a15, 4)}; menos 1 dá ${f(a15 - 1, 4)}, ou ${p(a15 - 1)} ao ano.</li>
<li><strong>18% ao ano para mensal:</strong> 1,18<sup>1/12</sup> = ${f(m18, 6)}; menos 1 dá ${p(m18 - 1, 4)} ao mês, e não 1,5%.</li>
<li><strong>0,2% ao dia para mensal:</strong> 1,002<sup>30</sup> = ${f(d02, 4)}; menos 1 dá ${p(d02 - 1)} ao mês. Taxas diárias parecem pequenas, mas viram uma taxa mensal considerável.</li>
</ol>

<h2>Taxa nominal e taxa efetiva</h2>
<p>Alguns contratos informam uma <strong>taxa nominal</strong>, como “12% ao ano com capitalização mensal”. Isso quer dizer 1% ao mês (12 ÷ 12), aplicado mês a mês. A <strong>taxa efetiva</strong> anual, a que realmente pesa no bolso, é 1,01<sup>12</sup> − 1 = ${p(C.anualDeMensal(0.01))}. É comum ver as duas no contrato de <a href="/financiamento-imobiliario/">financiamento imobiliário</a>. Para comparar propostas, use sempre a efetiva ou, melhor ainda, o <a href="/o-que-e-cet/">CET</a>.</p>

<h2>Dias corridos ou dias úteis?</h2>
<p>Este conversor usa o ano comercial: mês de 30 dias e ano de 360 dias, convenção comum em matemática financeira. Em investimentos é comum contar só os dias úteis, cerca de 252 por ano, e por isso o resultado mostra também a taxa diária nessa base. A base escolhida muda a taxa diária, mas não muda a equivalência entre mês e ano.</p>

<h2>Dicas</h2>
<ul>
<li>Compare taxas sempre no mesmo período: mês com mês, ano com ano.</li>
<li>Anúncios costumam destacar a taxa mensal. Converta para a anual para enxergar o tamanho do custo.</li>
<li>Para usar a taxa convertida, leve-a ao <a href="/simulador-emprestimo/">simulador de empréstimo</a>, que também aceita taxa ao ano.</li>
<li>Se você só sabe a parcela, descubra primeiro a taxa em <a href="/descobrir-taxa-de-juros/">descobrir taxa de juros</a>.</li>
</ul>`;
  },
  faq: [
    ['Como converter taxa de juros mensal para anual?', `Use (1 + taxa mensal)^12 − 1, com a taxa em decimal. Exemplo: 2% ao mês → 1,02^12 − 1 = ${p(C.anualDeMensal(0.02))} ao ano.`],
    ['Como converter taxa anual para mensal?', `Use (1 + taxa anual)^(1/12) − 1. Exemplo: 12% ao ano equivalem a ${p(C.mensalDeAnual(0.12), 4)} ao mês, e não a 1%.`],
    ['Como transformar taxa diária em mensal?', `Use (1 + taxa diária)^30 − 1, considerando o mês de 30 dias. Exemplo: 0,1% ao dia equivalem a ${p(C.equivalente(0.001, 1, 30))} ao mês.`],
    ['Por que não posso multiplicar a taxa mensal por 12?', 'Porque os juros são compostos: os juros de cada mês passam a render juros nos meses seguintes. Multiplicar por 12 é a conta de juros simples e subestima a taxa anual.'],
    ['Qual a diferença entre taxa nominal e taxa efetiva?', `A nominal é uma taxa anual dividida em partes iguais: 12% ao ano capitalizados por mês dão 1% ao mês. A efetiva é a que resulta dessa capitalização: ${p(C.anualDeMensal(0.01))} ao ano no exemplo.`],
    ['Quanto é 3% ao mês ao ano?', `${p(C.anualDeMensal(0.03))} ao ano, por juros compostos: 1,03^12 − 1. Pela conta simples daria 36%.`]
  ]
};

/* =================== Juros simples × compostos =================== */

const simples = {
  slug: 'calculadora-juros-simples',
  caminho: '/calculadora-juros-simples/',
  title: 'Calculadora de Juros Simples x Juros Compostos',
  description: 'Calcule juros simples e compare com juros compostos lado a lado: valor final, juros e a diferença mês a mês. Fórmula J = C × i × t e exemplos.',
  h1: 'Calculadora de juros simples e compostos',
  trilha: 'Juros simples',
  appNome: 'Calculadora de juros simples e compostos',
  link: { titulo: 'Juros simples', desc: 'Simples × compostos lado a lado.' },
  lead: 'Informe o valor, a taxa e o prazo para ver os juros simples e os compostos lado a lado, com a diferença entre eles mês a mês.',
  cta: 'No app você também compara ofertas, descobre a taxa embutida e vê a tabela de amortização das suas simulações.',
  calc: {
    tipo: 'simples',
    titulo: 'Juros simples × compostos',
    campos: [
      dinheiro('capital', 'Valor inicial (capital)', '10.000'),
      taxa('2'),
      prazo('24', { un: null, unidades: { nome: 'unidade', valor: 'meses', opcoes: [['meses', 'meses'], ['anos', 'anos']] } })
    ]
  },
  artigo() {
    const ms = C.montanteSimples(10000, 0.02, 24), mc = C.montanteComposto(10000, 0.02, 24);
    const js = ms - 10000, jc = mc - 10000;
    const linhas = [6, 12, 24, 60, 120].map((n) => {
      const a = C.montanteSimples(10000, 0.02, n), c = C.montanteComposto(10000, 0.02, n);
      return `<tr><td>${n} meses</td><td>${b(a)}</td><td>${b(c)}</td><td>${b(c - a)}</td></tr>`;
    }).join('\n');
    const j120s = C.montanteSimples(10000, 0.02, 120) - 10000, j120c = C.montanteComposto(10000, 0.02, 120) - 10000;
    return `
<h2>O que são juros simples</h2>
<p>Nos juros simples, os juros de cada período são calculados sempre sobre o valor inicial, o capital. Eles não entram no saldo para render novos juros, por isso crescem em linha reta: se R$ 10.000 rendem R$ 200 no primeiro mês a 2%, rendem os mesmos R$ 200 no segundo, no terceiro e em todos os outros.</p>
<p class="formula"><strong>J = C × i × t</strong> e <strong>M = C × (1 + i × t)</strong></p>
<p>C é o capital, i é a taxa por período em decimal, t é o número de períodos e M é o montante, o valor final. A taxa e o prazo precisam estar no mesmo período: taxa ao mês com prazo em meses, taxa ao ano com prazo em anos. Se estiverem diferentes, converta o prazo (6 meses = 0,5 ano), como a calculadora faz.</p>

<h2>Exemplo resolvido: R$ 10.000 a 2% ao mês por 24 meses</h2>
<ul>
<li><strong>Juros simples:</strong> J = 10.000 × 0,02 × 24 = ${b(js)}. Montante: ${b(ms)}.</li>
<li><strong>Juros compostos:</strong> M = 10.000 × 1,02<sup>24</sup> = ${b(mc)}. Juros: ${b(jc)}.</li>
<li><strong>Diferença:</strong> ${b(mc - ms)}, ou ${p((jc - js) / js, 1)} a mais de juros nos compostos.</li>
</ul>

<h2>A diferença cresce com o tempo</h2>
<p>No primeiro mês, juros simples e compostos dão exatamente o mesmo. A partir do segundo, os compostos passam a cobrar juros sobre os juros anteriores, e a distância só aumenta:</p>
<div class="rolagem"><table class="comparativo"><caption>R$ 10.000 a 2% ao mês: valor final</caption>
<thead><tr><th scope="col">Prazo</th><th scope="col">Simples</th><th scope="col">Compostos</th><th scope="col">Diferença</th></tr></thead>
<tbody>
${linhas}
</tbody></table></div>
<p>Em 10 anos, os juros compostos chegam a ${f(j120c / j120s, 1)} vezes os juros simples. É esse efeito que faz uma dívida esquecida crescer tão rápido e uma aplicação de longo prazo render tanto. Veja mais na <a href="/juros-compostos/">calculadora de juros compostos</a>.</p>

<h2>Em menos de um período, o simples é maior</h2>
<p>Quando o prazo é menor que o período da taxa, a ordem se inverte. Com 10% ao ano por 6 meses, os juros simples dão 10% × 0,5 = 5%, enquanto os compostos dão 1,1<sup>0,5</sup> − 1 = ${p(Math.sqrt(1.1) - 1)}. Pelo mesmo motivo, a taxa mensal equivalente a uma taxa anual é sempre um pouco menor que a anual dividida por 12, como mostra o <a href="/converter-taxa-de-juros/">conversor de taxas</a>.</p>

<h2>Onde os juros simples aparecem</h2>
<p>Empréstimos, financiamentos, cartão de crédito e investimentos usam juros compostos. Os juros simples aparecem principalmente em <strong>atrasos de contas e boletos</strong>: é comum o contrato prever uma multa fixa e juros de mora proporcionais aos dias de atraso. Por exemplo, juros de mora de 1% ao mês sobre uma conta de R$ 500 paga com 15 dias de atraso somam 500 × 0,01 × 15 ÷ 30 = R$ 2,50, além da multa.</p>
<p>Outra situação comum é a <strong>conta simplificada</strong> em propostas: dividir os juros totais pelo valor e pelo prazo para chegar a uma “taxa ao mês”. Essa conta trata o empréstimo como se fossem juros simples sobre a dívida inteira e chega a uma taxa menor que a real, porque a dívida cai a cada parcela. Para achar a taxa verdadeira, use <a href="/descobrir-taxa-de-juros/">descobrir taxa de juros</a>.</p>

<h2>Dicas</h2>
<ul>
<li>Use juros simples só para estimativas rápidas ou quando o contrato disser expressamente que são simples.</li>
<li>Em dívidas e aplicações de longo prazo, pense sempre em juros compostos.</li>
<li>Confira se a taxa e o prazo estão no mesmo período antes de fazer a conta.</li>
</ul>`;
  },
  faq: [
    ['Qual é a fórmula dos juros simples?', 'J = C × i × t, em que C é o capital, i a taxa por período em decimal e t o número de períodos. O montante é M = C × (1 + i × t).'],
    ['Quanto rendem R$ 10.000 a 2% ao mês em 24 meses?', `Nos juros simples, J = 10.000 × 0,02 × 24 = ${b(4800)} e o montante fica em ${b(14800)}. Nos juros compostos, o mesmo caso chega a ${b(C.montanteComposto(10000, 0.02, 24))}.`],
    ['Qual a diferença entre juros simples e compostos?', 'Nos simples, os juros são sempre calculados sobre o valor inicial. Nos compostos, os juros de cada período entram no saldo e também rendem juros, e por isso a diferença cresce com o prazo.'],
    ['Empréstimos usam juros simples?', 'Não. Empréstimos e financiamentos usam juros compostos sobre o saldo devedor. Os juros simples aparecem mais em juros de mora de contas em atraso.'],
    ['Juros simples dão mais que compostos em algum caso?', `Sim, quando o prazo é menor que o período da taxa. Com 10% ao ano por 6 meses, os simples dão 5% e os compostos dão ${p(Math.sqrt(1.1) - 1)}.`],
    ['Como calcular juros simples por dia de atraso?', 'Divida a taxa mensal por 30 e multiplique pelos dias de atraso e pelo valor. Juros de 1% ao mês sobre R$ 500 por 15 dias dão R$ 2,50.']
  ]
};

/* =================== O que é CET =================== */

const cet = {
  slug: 'o-que-e-cet',
  caminho: '/o-que-e-cet/',
  title: 'O que é CET? Custo Efetivo Total e calculadora',
  description: 'Entenda o que é o CET (Custo Efetivo Total) e calcule a taxa real do empréstimo com o valor que caiu na conta e as parcelas. Juros, IOF e tarifas.',
  h1: 'O que é CET (Custo Efetivo Total)',
  trilha: 'O que é CET',
  appNome: 'Calculadora de CET (Custo Efetivo Total)',
  link: { titulo: 'O que é CET', desc: 'O custo real com IOF, tarifas e seguros.' },
  lead: 'O CET mostra quanto um crédito custa de verdade. Informe o valor que caiu na conta e as parcelas para calcular o custo efetivo mensal e anual.',
  cta: 'No app você também compara ofertas e descobre a taxa embutida de qualquer parcela, com histórico das simulações.',
  calc: {
    tipo: 'cet',
    titulo: 'Calcule o custo efetivo',
    campos: [
      dinheiro('liberado', 'Valor que caiu na conta', '10.000', { dica: 'O valor líquido, depois de IOF, tarifas e seguros.' }),
      dinheiro('parcela', 'Valor da parcela', '595,00'),
      parcelas('24'),
      taxa('2,5', { nome: 'anunciada', rotulo: 'Taxa de juros anunciada (opcional)', periodo: null, dica: 'Deixe em branco se não souber.' })
    ]
  },
  artigo() {
    const r = C.taxaImplicita(10000, 595, 24, false);
    const bruto = C.r2(C.valorPresente(595, 0.025, 24)), a25 = C.anualDeMensal(0.025);
    return `
<h2>O que é o CET</h2>
<p>O <strong>Custo Efetivo Total (CET)</strong> é a taxa que mostra quanto um crédito custa de verdade, somando tudo o que você paga além do valor recebido. Ele junta em um único percentual:</p>
<ul>
<li>os <strong>juros</strong> do contrato;</li>
<li>o <strong>IOF</strong>, imposto sobre operações de crédito;</li>
<li><strong>tarifas</strong>, como a de cadastro ou a de avaliação de bem;</li>
<li><strong>seguros</strong>, como o prestamista, quando contratados;</li>
<li>outros encargos cobrados na operação.</li>
</ul>
<p>As instituições financeiras devem informar o CET antes da contratação, normalmente como taxa anual, e ele também precisa constar no contrato. Nas propostas, costuma aparecer perto da taxa de juros, em letras menores.</p>

<h2>Por que o CET é maior que a taxa de juros</h2>
<p>A taxa de juros é calculada sobre o valor do contrato. Só que IOF, tarifas e seguros costumam ser descontados do valor liberado ou somados à dívida. Você paga parcelas sobre um valor maior do que o que realmente recebeu, e isso aumenta o custo efetivo. Duas propostas com a mesma taxa de juros podem ter CET bem diferentes, e é por isso que o CET é o número certo para comparar.</p>

<h2>Exemplo resolvido</h2>
<p>Uma proposta anuncia juros de 2,5% ao mês, em 24 parcelas de R$ 595,00. Mas na sua conta caem R$ 10.000,00.</p>
<ol>
<li>Na taxa anunciada, 24 parcelas de R$ 595,00 correspondem a um contrato de ${b(bruto)}: é o valor presente das parcelas a 2,5% ao mês.</li>
<li>A diferença para o que caiu na conta, ${b(bruto - 10000)}, foi para IOF, tarifas e seguros.</li>
<li>Considerando só o que você recebeu, as mesmas parcelas equivalem a uma taxa de <strong>${p(r.i)} ao mês</strong>, ou ${p(r.a)} ao ano. Esse é o custo efetivo.</li>
<li>A taxa anunciada, 2,5% ao mês, equivale a ${p(a25)} ao ano. Os encargos acrescentaram ${f((r.a - a25) * 100, 1)} pontos percentuais por ano ao custo.</li>
</ol>

<h2>Como a calculadora encontra o CET</h2>
<p>O CET é a taxa que faz o valor presente de todas as parcelas ficar igual ao valor que você recebeu, o que em finanças se chama taxa interna de retorno. Não existe fórmula direta para isolar essa taxa, então a calculadora testa valores e corrige o palpite pelo método de Newton, com bisseção de segurança, até a diferença sumir. A taxa mensal encontrada vira anual por (1 + taxa mensal)<sup>12</sup> − 1.</p>
<p>O CET oficial usa as datas exatas da liberação e de cada vencimento, por isso o número da proposta pode diferir um pouco do daqui. Se a diferença for grande, confira se você digitou o valor líquido e a parcela final, com seguros incluídos.</p>

<h2>Como usar o CET para comparar propostas</h2>
<ul>
<li>Peça propostas para o mesmo valor e o mesmo prazo e compare o CET anual de cada uma.</li>
<li>Pergunte o que está incluído. Seguros e serviços opcionais podem ser recusados, e o CET cai.</li>
<li>Desconfie quando a parcela não bate com a taxa anunciada. Use esta calculadora com o valor líquido para ver o custo real.</li>
<li>Para ver a diferença em reais, coloque duas ofertas lado a lado em <a href="/emprestimo-pessoal-ou-consignado/">empréstimo pessoal ou consignado</a>.</li>
</ul>

<h2>CET em compras parceladas e no cartão</h2>
<p>O CET também vale para crediário, financiamento de veículos e imóveis, cheque especial e parcelamento da fatura do cartão. No crediário, ele mostra o custo do carnê em relação ao preço à vista; a calculadora de <a href="/juros-crediario/">juros do crediário</a> faz essa conta. Na fatura do cartão, o CET do rotativo e do parcelamento aparece no demonstrativo; veja a simulação em <a href="/juros-cartao-de-credito/">juros do cartão de crédito</a>.</p>`;
  },
  faq: (() => {
    const r = C.taxaImplicita(10000, 595, 24, false);
    return [
      ['O que é CET?', 'É o Custo Efetivo Total: a taxa que reúne juros, IOF, tarifas, seguros e outros encargos de um crédito. Mostra o custo real da operação e deve ser informado antes da contratação.'],
      ['Como calcular o CET de um empréstimo?', `Encontre a taxa que iguala o valor presente das parcelas ao valor que você realmente recebeu. Exemplo: R$ 10.000,00 recebidos e 24 parcelas de R$ 595,00 dão um custo efetivo de cerca de ${p(r.i)} ao mês (${p(r.a)} ao ano).`],
      ['Por que o CET é maior que a taxa de juros?', 'Porque inclui IOF, tarifas e seguros, que reduzem o valor liberado ou aumentam a dívida. Você paga parcelas sobre um valor maior do que o recebido.'],
      ['O CET é ao mês ou ao ano?', 'Normalmente é informado ao ano, mas também pode aparecer ao mês. Para converter, use (1 + CET mensal)^12 − 1.'],
      ['Entre duas propostas, qual CET escolher?', 'Para o mesmo valor e prazo, a proposta com menor CET é a mais barata. Confira também se a parcela cabe no orçamento.'],
      ['O CET inclui seguro?', 'Sim, quando o seguro é cobrado na operação. Se o seguro for opcional e você recusar, o CET diminui.']
    ];
  })()
};

/* =================== Juros do crediário =================== */

const crediario = {
  slug: 'juros-crediario',
  caminho: '/juros-crediario/',
  title: 'Juros do Crediário: calcule a taxa do carnê',
  description: 'Descubra os juros do crediário ou carnê: informe o preço à vista, a entrada e as parcelas e veja a taxa mensal, a anual e quanto você paga a mais.',
  h1: 'Calculadora de juros do crediário',
  trilha: 'Juros do crediário',
  appNome: 'Calculadora de juros do crediário',
  link: { titulo: 'Juros do crediário', desc: 'A taxa escondida no carnê da loja.' },
  lead: 'Carnê da loja com entrada e parcelas? Informe o preço à vista e as condições do crediário para descobrir a taxa de juros embutida.',
  cta: 'No app você descobre a taxa embutida de qualquer parcelamento e compara ofertas lado a lado.',
  calc: {
    tipo: 'crediario',
    titulo: 'Qual é a taxa do carnê?',
    campos: [
      dinheiro('avista', 'Preço à vista', '2.400'),
      dinheiro('entrada', 'Entrada', '300', { dica: 'Use 0 se não houver entrada.' }),
      dinheiro('parcela', 'Valor de cada parcela', '259,90'),
      parcelas('10')
    ]
  },
  artigo() {
    const t = C.taxaImplicita(2100, 259.9, 10, false), t2 = C.taxaImplicita(2400, 289.9, 10, false);
    const total = 300 + 10 * 259.9, dif = total - 2400;
    return `
<h2>Como funciona o crediário</h2>
<p>No crediário, ou carnê, a própria loja ou uma financeira parceira dela financia a compra. Você leva o produto e paga em parcelas mensais, por carnê, boleto ou débito. Diferente do “parcelado sem juros” no cartão, o crediário é uma operação de crédito: tem taxa de juros, costuma ter <strong>IOF</strong> e pode ter tarifas e seguros. Tudo isso deve aparecer no <a href="/o-que-e-cet/">Custo Efetivo Total (CET)</a> informado antes da compra.</p>
<p>O problema é que, no balcão, o que aparece em destaque é o valor da parcela. Esta calculadora faz a conta ao contrário: com o preço à vista, a entrada, a parcela e o número de parcelas, ela encontra a taxa de juros mensal embutida no carnê.</p>

<h2>Exemplo resolvido: geladeira de R$ 2.400</h2>
<p>À vista, R$ 2.400. No crediário, R$ 300 de entrada e 10 parcelas de R$ 259,90.</p>
<ul>
<li>Total no crediário: R$ 300,00 + 10 × R$ 259,90 = ${b(total)}.</li>
<li>Você paga ${b(dif)} a mais que à vista (${p(dif / 2400, 1)}).</li>
<li>Saldo financiado: R$ 2.400 − R$ 300 = R$ 2.100,00.</li>
<li>Taxa embutida: <strong>${p(t.i)} ao mês</strong>, ou ${p(t.a)} ao ano.</li>
</ul>
<p>É o mesmo que pegar R$ 2.100,00 emprestados a ${p(t.i)} ao mês. Agora compare com outra oferta da mesma loja: sem entrada, 10 parcelas de R$ 289,90. O total é idêntico, ${b(10 * 289.9)}, mas a taxa é ${p(t2.i)} ao mês. A oferta com entrada é ${t.i > t2.i ? 'mais cara' : 'mais barata'}, porque cobra os mesmos ${b(dif)} de acréscimo sobre um saldo financiado menor.</p>

<h2>A entrada muda a taxa?</h2>
<p>Muda o valor financiado, e por isso muda a conta. A entrada não tem juros: ela abate a dívida na hora. O que importa é quanto você paga a mais sobre o saldo que ficou financiado e por quanto tempo. Duas ofertas com o mesmo total podem ter taxas bem diferentes, como no exemplo. Por isso compare sempre a taxa, e não só o total ou a parcela.</p>

<h2>Crediário, cartão ou juntar o dinheiro?</h2>
<ul>
<li><strong>Parcelado sem juros no cartão:</strong> se o preço parcelado for igual ao à vista, não há juros, e costuma ser melhor que o crediário. Se houver desconto à vista, calcule a taxa em <a href="/juros-parcelamento/">juros no parcelamento</a>.</li>
<li><strong>Crediário:</strong> pode ser a saída para quem não tem limite no cartão, mas as taxas de crédito ao consumidor somam muito ao longo do ano.</li>
<li><strong>Juntar o dinheiro:</strong> guardando R$ 259,90 por mês, você teria os R$ 2.100,00 em cerca de ${Math.ceil(2100 / 259.9)} meses e ainda poderia negociar desconto à vista.</li>
</ul>

<h2>Cuidado com o atraso no carnê</h2>
<p>Parcela de carnê paga depois do vencimento costuma ter multa e juros de mora, além dos juros do próprio crediário. Atrasos frequentes também podem dificultar crédito no futuro. Se perceber que uma parcela não vai caber, procure a loja antes do vencimento para negociar. E, se sobrar dinheiro, antecipar parcelas dá desconto dos juros; veja quanto em <a href="/quitar-emprestimo-antecipado/">quitar empréstimo antecipado</a>.</p>

<h2>O que conferir antes de assinar o carnê</h2>
<ul>
<li>O preço à vista do mesmo produto, na mesma loja.</li>
<li>A taxa de juros mensal e o CET anual, que a loja deve informar.</li>
<li>Se há seguro, garantia estendida ou outro serviço incluído nas parcelas. Eles são opcionais e encarecem o carnê.</li>
<li>O valor total a pagar, somando entrada e todas as parcelas.</li>
<li>Se a parcela cabe no orçamento junto com as outras que você já tem.</li>
</ul>`;
  },
  faq: (() => {
    const t = C.taxaImplicita(2100, 259.9, 10, false);
    return [
      ['Como calcular os juros do crediário?', `Desconte a entrada do preço à vista e encontre a taxa que iguala as parcelas a esse saldo. Exemplo: R$ 2.400 à vista ou R$ 300 de entrada + 10 × R$ 259,90 dá ${p(t.i)} ao mês.`],
      ['Crediário tem IOF?', 'Normalmente sim, porque é uma operação de crédito. O IOF, os juros e eventuais tarifas e seguros entram no CET que a loja deve informar.'],
      ['Crediário ou cartão de crédito: qual é melhor?', 'Se o cartão parcela sem juros pelo mesmo preço à vista, costuma ser melhor. O crediário tem juros; compare a taxa e o total pago e cuidado para não acumular parcelas no cartão.'],
      ['Por que a parcela parece pequena e a taxa é alta?', 'Porque a parcela dilui o custo ao longo dos meses. Somando tudo e comparando com o preço à vista, a diferença aparece, e a taxa mensal mostra esse custo de forma comparável.'],
      ['Posso quitar o carnê antes e pagar menos?', 'Sim. Ao antecipar parcelas ou quitar o crediário, você tem direito ao abatimento proporcional dos juros.'],
      ['Seguro no crediário é obrigatório?', 'Seguros e garantias estendidas oferecidos no crediário são produtos opcionais. Se não quiser, peça para retirar e confira se a parcela diminuiu.']
    ];
  })()
};

module.exports = { converter, simples, cet, crediario };
