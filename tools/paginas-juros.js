// Conteúdo: juros no parcelamento, descobrir taxa, cartão de crédito e juros compostos.
'use strict';
const { C, b, p, f, dinheiro, taxa, prazo, parcelas, ato } = require('./comum.js');

/* =================== Juros no parcelamento =================== */

const parcelamento = {
  slug: 'juros-parcelamento',
  caminho: '/juros-parcelamento/',
  title: 'Juros no Parcelamento: calcule os juros escondidos',
  description: 'Compare o preço à vista com as parcelas e descubra a taxa de juros escondida no parcelado de celular, TV e eletrodomésticos. Grátis.',
  h1: 'Calculadora de juros no parcelamento',
  trilha: 'Juros no parcelamento',
  appNome: 'Calculadora de juros no parcelamento',
  link: { titulo: 'Juros no parcelamento', desc: 'Descubra o juro escondido no “sem juros”.' },
  lead: 'Celular, TV, geladeira: quando o preço à vista é menor que a soma das parcelas, existe juro embutido. Descubra quanto.',
  calc: {
    tipo: 'parcelamento',
    titulo: 'À vista ou parcelado?',
    campos: [
      dinheiro('avista', 'Preço à vista', '1.800'),
      dinheiro('parcela', 'Valor de cada parcela', '179,90'),
      parcelas('12'),
      ato()
    ]
  },
  artigo() {
    const t = C.taxaImplicita(1800, 179.9, 12, false), ta = C.taxaImplicita(1800, 179.9, 12, true);
    const tv = C.taxaImplicita(2000, 229.9, 10, false);
    const total = 12 * 179.9, dif = total - 1800;
    return `
<h2>O juro escondido no “sem juros”</h2>
<p>Muitas lojas anunciam “12x sem juros”, mas dão um preço menor para quem paga à vista. Se a soma das parcelas é maior que o preço à vista, a diferença é juro, só que embutido no preço, sem aparecer como taxa. Esta calculadora faz a conta inversa: a partir do preço à vista, do valor da parcela e do número de parcelas, ela encontra a taxa mensal que transforma um no outro.</p>

<h2>Exemplo resolvido: celular de R$ 1.800 à vista ou 12x de R$ 179,90</h2>
<ul>
<li>Total parcelado: 12 × R$ 179,90 = ${b(total)}</li>
<li>Diferença para o preço à vista: ${b(dif)} (${p(dif / 1800, 1)} a mais)</li>
<li>Taxa implícita: <strong>${p(t.i)} ao mês</strong>, o equivalente a ${p(t.a)} ao ano</li>
</ul>
<p>Ou seja, parcelar esse celular custa o mesmo que pegar um empréstimo de R$ 1.800 a ${p(t.i)} ao mês. Se a primeira parcela for paga no ato da compra, a taxa sobe para ${p(ta.i)} ao mês, porque você começa a pagar antes e fica menos tempo com o dinheiro “emprestado”.</p>
<p>Repare que não basta dividir a diferença pelo prazo: ${p(dif / 1800, 1)} ÷ 12 daria ${p(dif / 1800 / 12)} ao mês, bem menos que a taxa real. A cada parcela paga você deve menos, então os mesmos ${b(dif)} de juros, cobrados sobre um saldo que diminui, representam uma taxa maior.</p>
<p>Outro exemplo: uma TV de R$ 2.000 à vista ou 10x de R$ 229,90 tem juro embutido de ${p(tv.i)} ao mês (${p(tv.a)} ao ano). Já um produto de R$ 1.800 à vista ou 12x de R$ 150,00 é parcelado sem juros de verdade: as parcelas somam exatamente o preço à vista e a taxa é 0%.</p>

<h2>Como a calculadora encontra a taxa</h2>
<p>Não existe fórmula direta para isolar a taxa quando se conhece a parcela. Calculadoras financeiras resolvem isso por aproximações: testam uma taxa, veem se o valor presente das parcelas ficou acima ou abaixo do preço à vista e corrigem o palpite até a diferença praticamente sumir. Esta usa o método de Newton, com uma rotina de segurança (bisseção), e só para quando a taxa muda menos de um décimo de bilionésimo entre duas tentativas.</p>

<h2>Parcelar ou pagar à vista?</h2>
<p>Se há desconto à vista, compare a taxa encontrada com quanto o seu dinheiro rende guardado. Se a taxa do parcelamento for maior que o rendimento, e quase sempre é, pagar à vista sai mais barato, desde que você não desmonte a reserva de emergência para isso. Se a taxa for 0%, parcelar pode ser vantajoso: o dinheiro continua rendendo e você paga o mesmo preço, contanto que as parcelas caibam no orçamento.</p>
<p>Atenção ao acúmulo: várias compras pequenas parceladas ao mesmo tempo comprometem a renda dos próximos meses e podem empurrar a fatura do cartão para o rotativo, que tem juros muito altos. Veja quanto isso custa em <a href="/juros-cartao-de-credito/">juros do cartão de crédito</a>.</p>

<h2>Crediário, CET e IOF</h2>
<p>No parcelado “sem juros” do cartão, o custo, quando existe, está no preço. Já no crediário da loja ou no parcelamento “com juros”, a compra é uma operação de crédito: há taxa de juros declarada, <strong>IOF</strong> (imposto sobre operações de crédito) e, às vezes, tarifas e seguros. Nesse caso a loja deve informar o <strong>Custo Efetivo Total (CET)</strong>, que reúne tudo isso; a calculadora de <a href="/juros-crediario/">juros do crediário</a> considera também a entrada. Para comparar com a calculadora, use o valor total que você vai pagar, com todos os acréscimos.</p>
<p>Recuse seguros e garantias estendidas que você não pediu: eles entram nas parcelas e aumentam o custo sem que você perceba.</p>

<h2>Dicas para não pagar juros sem perceber</h2>
<ul>
<li>Sempre pergunte o preço à vista antes de escolher o parcelamento.</li>
<li>Calcule a taxa implícita e compare com o rendimento do seu dinheiro.</li>
<li>Quando o parcelado sai mais caro, prefira menos parcelas ou junte o dinheiro antes.</li>
<li>Some todas as parcelas que já tem antes de assumir uma nova.</li>
</ul>`;
  },
  faq: [
    ['Parcelado sem juros tem juros?', 'Pode ter. Se a loja dá desconto para pagamento à vista, o preço parcelado embute juros. Exemplo: R$ 1.800 à vista ou 12x de R$ 179,90 equivale a uma taxa de 2,91% ao mês.'],
    ['Como calcular os juros de uma compra parcelada?', 'Informe o preço à vista, o valor da parcela e o número de parcelas. A calculadora encontra a taxa mensal que iguala o valor presente das parcelas ao preço à vista e mostra também a taxa anual.'],
    ['Pagar a primeira parcela no ato muda a taxa?', 'Muda. Com a primeira parcela paga na hora, a mesma parcela representa uma taxa maior. No exemplo do celular, a taxa sobe de 2,91% para 3,49% ao mês.'],
    ['Vale mais a pena parcelar ou pagar à vista?', 'Se há desconto à vista, compare a taxa implícita com quanto o seu dinheiro rende; quase sempre pagar à vista é mais barato. Se o parcelado é realmente sem juros (taxa 0%), parcelar pode valer a pena, desde que caiba no orçamento.'],
    ['Por que não basta dividir a diferença pelo número de parcelas?', 'Porque a dívida diminui a cada parcela paga. Os juros incidem sobre um saldo cada vez menor, então a taxa real é maior do que a divisão simples sugere.'],
    ['Crediário tem IOF?', 'O crediário é uma operação de crédito, então normalmente tem IOF e pode ter tarifas, tudo incluído no CET. No parcelado sem juros do cartão, em geral não há IOF para quem compra.']
  ]
};

/* =================== Descobrir taxa de juros =================== */

const descobrirTaxa = {
  slug: 'descobrir-taxa-de-juros',
  caminho: '/descobrir-taxa-de-juros/',
  title: 'Descobrir Taxa de Juros pela Parcela | Calculadora',
  description: 'Descubra a taxa de juros real de um empréstimo ou compra a partir do valor recebido, da parcela e do número de parcelas. Taxa mensal e anual.',
  h1: 'Descobrir taxa de juros pela parcela',
  trilha: 'Descobrir taxa de juros',
  appNome: 'Calculadora para descobrir taxa de juros',
  link: { titulo: 'Descobrir a taxa de juros', desc: 'A taxa real a partir do valor da parcela.' },
  lead: 'Você sabe quanto recebeu e quanto vai pagar por mês, mas não sabe a taxa? Informe os valores e veja a taxa mensal e anual.',
  calc: {
    tipo: 'taxa',
    titulo: 'Qual é a taxa?',
    campos: [
      dinheiro('valor', 'Valor recebido ou preço à vista', '3.000'),
      dinheiro('parcela', 'Valor da parcela', '329,00'),
      parcelas('12'),
      ato()
    ]
  },
  artigo() {
    const t = C.taxaImplicita(3000, 329, 12, false), t2 = C.taxaImplicita(10000, 500, 24, false);
    return `
<h2>Para que serve</h2>
<p>Propostas de crédito costumam destacar a parcela e deixar a taxa em letras miúdas. Com esta calculadora você faz o caminho inverso: informa quanto recebeu (ou o preço à vista de uma compra), o valor da parcela e quantas parcelas são, e descobre a taxa de juros mensal e anual embutida. Ela funciona para empréstimo pessoal, consignado, financiamento, crediário e qualquer compra parcelada com parcelas iguais.</p>

<h2>Exemplo resolvido: R$ 3.000 pagos em 12 parcelas de R$ 329,00</h2>
<ul>
<li>Total pago: 12 × R$ 329,00 = R$ 3.948,00</li>
<li>Juros: R$ 948,00 (${p(948 / 3000, 1)} do valor recebido)</li>
<li>Taxa encontrada: <strong>${p(t.i)} ao mês</strong> = ${p(t.a)} ao ano</li>
</ul>
<p>Conferindo pela fórmula da Tabela Price: 3.000 × 0,045 ÷ [1 − (1,045)<sup>−12</sup>] ≈ ${b(C.pmt(3000, 0.045, 12))}. A conta fecha.</p>

<h2>Por que dividir os juros pelo prazo dá errado</h2>
<p>Uma conta comum é pegar os juros (R$ 948), dividir pelo valor (${p(948 / 3000, 1)}) e depois pelo número de meses: ${p(948 / 3000, 1)} ÷ 12 = ${p(948 / 3000 / 12)} ao mês. Parece razoável, mas fica bem abaixo da taxa real de ${p(t.i)}. O motivo: você não fica devendo os R$ 3.000 o tempo todo. A cada parcela, parte da dívida é paga, e os juros incidem sobre um saldo cada vez menor. Para gerar R$ 948 de juros sobre um saldo que diminui, a taxa precisa ser bem mais alta.</p>
<p>Outro exemplo: R$ 10.000 em 24 parcelas de R$ 500. Os juros somam R$ 2.000 e a conta simples daria ${p(2000 / 10000 / 24)} ao mês; a taxa real é ${p(t2.i)} ao mês (${p(t2.a)} ao ano).</p>

<h2>Como a calculadora encontra a taxa</h2>
<p>Não existe fórmula fechada para isolar a taxa na equação da Price. A calculadora usa o método de Newton-Raphson: parte de uma estimativa e corrige o valor a cada passo. Se um passo sair do intervalo seguro, ela usa bisseção, que é mais lenta mas nunca falha. O cálculo termina quando a diferença entre duas tentativas fica menor que 0,0000000001. Casos especiais também são tratados: se as parcelas somam exatamente o valor recebido, a taxa é 0%; se somam menos, não há juros a calcular.</p>
<p>Você pode indicar se a primeira parcela vence em 30 dias, o normal em empréstimos, ou se é paga no ato, comum no comércio. Pagar a primeira na hora aumenta a taxa efetiva.</p>

<h2>A taxa encontrada é o CET?</h2>
<p>Depende do que você digitar. O <strong>Custo Efetivo Total (CET)</strong> junta juros, IOF, tarifas e seguros. Se você informar o valor que realmente caiu na sua conta e a parcela que realmente vai pagar, a taxa encontrada mostra o custo efetivo mensal da operação, bem próximo do CET. Se informar o valor bruto do contrato, antes dos descontos, o resultado fica mais perto da taxa de juros nominal. Veja mais em <a href="/o-que-e-cet/">o que é CET</a>. A diferença entre as duas mostra quanto pesam o <strong>IOF</strong>, imposto sobre operações de crédito com uma parte fixa e outra que cresce com o prazo, e as tarifas.</p>

<h2>Como converter taxa mensal em anual</h2>
<p>Use (1 + taxa mensal)<sup>12</sup> − 1. Com 4,5% ao mês: 1,045<sup>12</sup> − 1 = ${p(C.anualDeMensal(0.045))} ao ano, bem mais que 4,5 × 12 = 54%. É por isso que taxas mensais que parecem pequenas viram números grandes no ano. O <a href="/converter-taxa-de-juros/">conversor de taxa de juros</a> faz essa conta para qualquer taxa.</p>

<h2>Dicas</h2>
<ul>
<li>Antes de assinar, peça o CET por escrito e compare com a taxa que você calculou aqui.</li>
<li>Use a taxa, e não a parcela, para comparar propostas com valores e prazos diferentes.</li>
<li>Se a taxa encontrada for muito maior que a informada pelo vendedor, pergunte o que está incluído: seguro, tarifa, garantia estendida.</li>
<li>Depois de descobrir a taxa, teste prazos menores no <a href="/simulador-emprestimo/">simulador de empréstimo</a>.</li>
</ul>`;
  },
  faq: [
    ['Como descobrir a taxa de juros de um empréstimo?', 'Informe o valor recebido, a parcela e o número de parcelas. A calculadora encontra a taxa que iguala o valor presente das parcelas ao valor recebido. Exemplo: R$ 3.000 em 12 parcelas de R$ 329,00 dá 4,50% ao mês.'],
    ['Por que dividir os juros pelo número de parcelas dá errado?', 'Porque o saldo devedor cai a cada parcela. Os juros são cobrados sobre um saldo cada vez menor, então a taxa real é maior que a divisão simples. No exemplo de R$ 3.000 em 12x de R$ 329,00, a conta simples dá 2,63% e a taxa real é 4,50% ao mês.'],
    ['A taxa encontrada é o CET?', 'Se você usar o valor que realmente recebeu e a parcela que realmente paga, o resultado fica muito próximo do custo efetivo mensal, que é a base do CET. Com o valor bruto do contrato, o resultado se aproxima da taxa de juros nominal.'],
    ['Como transformar taxa mensal em anual?', 'Calcule (1 + taxa mensal)^12 − 1. Por exemplo, 4,5% ao mês equivalem a 69,59% ao ano, e não a 54%.'],
    ['E se as parcelas somarem menos que o valor recebido?', 'Então não há juros: seria um desconto. Confira se digitou corretamente a parcela e o número de parcelas.'],
    ['Serve para compras parceladas?', 'Sim. Use o preço à vista no lugar do valor recebido. Se a primeira parcela for paga no ato da compra, marque essa opção para a taxa sair correta.']
  ]
};

/* =================== Cartão de crédito =================== */

const cartao = {
  slug: 'juros-cartao-de-credito',
  caminho: '/juros-cartao-de-credito/',
  title: 'Juros do Cartão de Crédito: rotativo e parcelamento',
  description: 'Calcule quanto custa deixar a fatura no rotativo ou parcelar o saldo do cartão de crédito. Veja juros do mês, parcela, total e taxa ao ano.',
  h1: 'Calculadora de juros do cartão de crédito',
  trilha: 'Juros do cartão de crédito',
  appNome: 'Calculadora de juros do cartão de crédito',
  link: { titulo: 'Juros do cartão de crédito', desc: 'Rotativo ou parcelamento da fatura: quanto custa.' },
  lead: 'Não vai conseguir pagar a fatura inteira? Veja quanto custa o rotativo, quanto fica o parcelamento da fatura e qual sai mais barato.',
  calc: {
    tipo: 'cartao',
    titulo: 'Quanto custa não pagar a fatura toda',
    campos: [
      dinheiro('fatura', 'Valor da fatura', '2.000'),
      dinheiro('pago', 'Quanto você vai pagar agora', '500'),
      taxa('14', { nome: 'rotativo', rotulo: 'Juros do rotativo', periodo: null, dica: 'Veja na fatura ou no app do cartão. Os valores preenchidos são só exemplos.' }),
      taxa('8', { nome: 'taxaparc', rotulo: 'Juros do parcelamento da fatura', periodo: null }),
      parcelas('6', { rotulo: 'Parcelar a fatura em', un: 'vezes' })
    ]
  },
  artigo() {
    const cp = C.price(1500, 0.08, 6);
    const doze = 1500 * Math.pow(1.14, 12);
    return `
<h2>Como funciona o rotativo</h2>
<p>Quando você paga menos que o total da fatura, mas pelo menos o valor mínimo, o saldo que sobra entra no <strong>crédito rotativo</strong>. Sobre ele incidem juros, IOF e encargos, que aparecem na fatura seguinte. É uma das formas de crédito mais caras que existem. Pelas regras atuais, o saldo só pode ficar no rotativo até o vencimento da fatura seguinte; depois disso, a instituição precisa oferecer outra forma de pagamento, normalmente o parcelamento da fatura, em geral com juros menores.</p>

<h2>Parcelamento da fatura</h2>
<p>No parcelamento da fatura, o saldo devedor é dividido em parcelas fixas com juros, calculadas como em um empréstimo pela <a href="/tabela-price/">Tabela Price</a>. As parcelas entram nas faturas seguintes e ocupam o limite do cartão. Não confunda com o “parcelado sem juros” das lojas: ali o custo, quando existe, está no preço do produto (veja <a href="/juros-parcelamento/">juros no parcelamento</a>).</p>

<h2>Exemplo resolvido</h2>
<p>Fatura de R$ 2.000. Você paga R$ 500 e ficam R$ 1.500 em aberto.</p>
<ul>
<li><strong>Rotativo a 14% ao mês:</strong> juros de ${b(210)} em um mês, e a dívida vai para ${b(1710)}. Essa taxa equivale a ${p(C.anualDeMensal(0.14), 0)} ao ano.</li>
<li><strong>Parcelamento em 6x a 8% ao mês:</strong> parcelas de ${b(cp.parcela)}, total de ${b(cp.total)} e ${b(cp.juros)} de juros. Taxa equivalente a ${p(C.anualDeMensal(0.08), 0)} ao ano.</li>
</ul>
<p>Se nada fosse pago por 12 meses a 14% ao mês, os juros compostos levariam os R$ 1.500 a ${b(doze)}. Isso não chega a acontecer porque existe um teto: desde 2024, juros e encargos do rotativo e do parcelamento da fatura não podem passar de 100% do valor original da dívida. No exemplo, o máximo de encargos seria R$ 1.500, o que ainda dobraria a dívida.</p>
<p>As taxas do exemplo são ilustrativas. Use as da sua fatura: elas aparecem no demonstrativo, junto com o CET.</p>

<h2>Pagamento mínimo: por que é uma armadilha</h2>
<p>Pagar só o mínimo evita a inadimplência, mas deixa quase toda a fatura no rotativo. Na fatura seguinte os juros se somam às compras novas, e a conta cresce rápido. Se em algum mês não der para pagar tudo, compare o rotativo com o parcelamento da fatura e também com um empréstimo de custo menor para quitar o cartão de uma vez.</p>

<h2>IOF e CET no cartão</h2>
<p>Sobre o saldo financiado no rotativo ou no parcelamento também incide <strong>IOF</strong>, o imposto sobre operações de crédito, com uma parte fixa e outra diária. Juros, IOF e encargos formam o <strong>Custo Efetivo Total (CET)</strong>, que a fatura deve informar para o rotativo e para o parcelamento. Esta calculadora considera só os juros, então o custo real pode ser um pouco maior.</p>

<h2>Como sair dos juros do cartão</h2>
<ul>
<li><strong>Pague a fatura inteira sempre que puder.</strong> É a única forma de usar o cartão sem pagar juros.</li>
<li><strong>Se não der, não fique no rotativo:</strong> compare o parcelamento da fatura com outras opções.</li>
<li><strong>Troque dívida cara por dívida mais barata:</strong> um empréstimo com CET menor pode quitar o cartão. Simule no <a href="/simulador-emprestimo/">simulador de empréstimo</a>.</li>
<li><strong>Reduza o uso do cartão</strong> até zerar a dívida, para não somar compras novas aos juros.</li>
<li><strong>Negocie:</strong> peça a proposta de renegociação por escrito, com o CET, antes de aceitar.</li>
</ul>`;
  },
  faq: [
    ['Como calcular os juros do rotativo do cartão?', 'Multiplique o saldo que ficou sem pagar pela taxa mensal do rotativo. Exemplo: R$ 1.500 a 14% ao mês geram R$ 210,00 de juros em um mês, sem contar IOF e encargos.'],
    ['Rotativo ou parcelamento da fatura: o que é melhor?', 'Em geral, o parcelamento da fatura tem taxa menor que o rotativo e parcelas previsíveis. Compare o total a pagar e o CET de cada opção, e veja se um empréstimo de custo menor não resolve melhor.'],
    ['Existe limite para os juros do cartão?', 'Sim. Desde 2024, a soma de juros e encargos do rotativo e do parcelamento da fatura não pode ultrapassar 100% do valor original da dívida.'],
    ['O que acontece se eu pagar só o mínimo?', 'O restante da fatura entra no rotativo, com juros altos, IOF e encargos. Na fatura seguinte esses valores se somam às compras novas. Pagar o mínimo deve ser exceção, nunca rotina.'],
    ['Tem IOF no rotativo do cartão?', 'Sim. O saldo financiado no rotativo ou no parcelamento da fatura é uma operação de crédito e tem IOF, além dos juros. Tudo isso compõe o CET informado na fatura.'],
    ['Parcelado sem juros da loja é o mesmo que parcelar a fatura?', 'Não. No parcelado da loja, a compra é dividida sem juros declarados (o custo, se houver, está no preço). No parcelamento da fatura, você financia o saldo devedor com juros.']
  ]
};

/* =================== Juros compostos =================== */

const compostos = {
  slug: 'juros-compostos',
  caminho: '/juros-compostos/',
  title: 'Calculadora de Juros Compostos com aporte mensal',
  description: 'Calcule juros compostos com valor inicial, aporte mensal, taxa ao mês ou ao ano e prazo. Veja o valor final, os juros e a evolução ano a ano.',
  h1: 'Calculadora de juros compostos',
  trilha: 'Juros compostos',
  appNome: 'Calculadora de juros compostos',
  link: { titulo: 'Juros compostos', desc: 'Quanto o dinheiro cresce com aportes mensais.' },
  lead: 'Veja quanto um valor inicial e aportes mensais acumulam com juros sobre juros, e entenda por que o mesmo efeito pesa tanto nas dívidas.',
  calc: {
    tipo: 'compostos',
    titulo: 'Simule os juros compostos',
    campos: [
      dinheiro('inicial', 'Valor inicial', '1.000'),
      dinheiro('aporte', 'Aporte mensal', '300'),
      taxa('0,8'),
      prazo('10', { un: null, unidades: { nome: 'unidade', valor: 'anos', opcoes: [['anos', 'anos'], ['meses', 'meses']] } })
    ]
  },
  artigo() {
    const jc = C.compostos(1000, 300, 0.008, 120), jc20 = C.compostos(1000, 300, 0.008, 240);
    const jc2 = C.compostos(10000, 0, 0.01, 12);
    return `
<h2>O que são juros compostos</h2>
<p>Juros compostos são “juros sobre juros”: os juros de cada mês são somados ao saldo e passam a render também. No começo a diferença para os juros simples é pequena, mas ela cresce com o tempo, porque a base de cálculo aumenta todo mês.</p>
<p>Um exemplo curto: R$ 10.000 a 1% ao mês por 12 meses. Com juros simples, você teria R$ 11.200,00. Com juros compostos, ${b(jc2.final)}. Compare os dois regimes lado a lado na <a href="/calculadora-juros-simples/">calculadora de juros simples</a>. Em prazos longos essa diferença fica enorme, a seu favor quando você investe e contra você quando deve.</p>

<h2>A fórmula</h2>
<p class="formula"><strong>Valor final = C × (1 + i)<sup>n</sup> + A × [(1 + i)<sup>n</sup> − 1] ÷ i</strong></p>
<p>C é o valor inicial, A é o aporte mensal (considerado no fim de cada mês), i é a taxa mensal em decimal e n é o número de meses. Se a taxa estiver ao ano, converta: taxa mensal = (1 + taxa anual)<sup>1/12</sup> − 1. A calculadora faz isso sozinha quando você escolhe “ao ano”, e o <a href="/converter-taxa-de-juros/">conversor de taxas</a> mostra outras equivalências.</p>

<h2>Exemplo resolvido</h2>
<p>R$ 1.000 iniciais mais R$ 300 por mês, a 0,8% ao mês (${p(C.anualDeMensal(0.008))} ao ano), durante 10 anos (120 meses):</p>
<ul>
<li>Total investido: R$ 1.000 + 120 × R$ 300 = ${b(jc.investido)}</li>
<li>Valor final: <strong>${b(jc.final)}</strong></li>
<li>Juros ganhos: ${b(jc.juros)}; ${p(jc.juros / jc.final, 1)} do valor final veio dos juros.</li>
</ul>
<p>Se o prazo dobrar para 20 anos, com tudo igual, o valor final vai para ${b(jc20.final)}, dos quais ${b(jc20.juros)} são juros. O investido só dobrou, mas os juros se multiplicaram por ${f(jc20.juros / jc.juros, 1)}: é o tempo trabalhando.</p>
<p>A taxa usada é só ilustrativa. Rendimentos reais variam conforme o investimento e o momento, e não são garantidos.</p>

<h2>Regra dos 72: em quanto tempo o dinheiro dobra</h2>
<p>Uma aproximação útil: divida 72 pela taxa anual em %. A 10% ao ano, o dinheiro dobra em cerca de 7,2 anos (a conta exata dá ${f(Math.log(2) / Math.log(1.1), 1)} anos). A regra também vale para dívidas: uma dívida a 72% ao ano dobra em cerca de um ano se nada for pago.</p>

<h2>Juros compostos nas dívidas</h2>
<p>O mesmo mecanismo que faz um investimento crescer faz uma dívida disparar. Linhas caras, como o rotativo do cartão, podem ter taxas acima de 10% ao mês; 14% ao mês, por exemplo, equivalem a ${p(C.anualDeMensal(0.14), 0)} ao ano. Veja a simulação na calculadora de <a href="/juros-cartao-de-credito/">juros do cartão de crédito</a>.</p>
<p>No crédito, além dos juros, o custo completo aparece no <strong>Custo Efetivo Total (CET)</strong>, que inclui o <strong>IOF</strong> (imposto sobre operações de crédito), tarifas e seguros. Antes de contratar, compare sempre o CET.</p>

<h2>Impostos, IOF e inflação nos investimentos</h2>
<p>A calculadora mostra o valor bruto. Na prática, muitos investimentos de renda fixa pagam Imposto de Renda sobre o rendimento, com alíquota que diminui com o tempo, e têm IOF sobre resgates feitos nos primeiros 30 dias. Alguns produtos são isentos para pessoa física. Também vale descontar a inflação: se o dinheiro rende 10% ao ano e os preços sobem 5%, o ganho real é de cerca de ${p(1.10 / 1.05 - 1, 1)}, pela conta (1,10 ÷ 1,05) − 1.</p>

<h2>Dicas</h2>
<ul>
<li>Comece cedo: o tempo pesa mais do que o tamanho dos aportes.</li>
<li>Mantenha aportes regulares, mesmo que pequenos.</li>
<li>Antes de investir, quite dívidas caras: nenhum investimento comum rende o que o rotativo cobra.</li>
<li>Compare taxas sempre no mesmo período: mês com mês, ano com ano.</li>
</ul>`;
  },
  faq: [
    ['Como calcular juros compostos?', 'Use valor final = C × (1 + i)^n, em que C é o valor inicial, i a taxa por período e n o número de períodos. Com aportes mensais, some A × [(1 + i)^n − 1] ÷ i. A calculadora faz as duas contas juntas.'],
    ['Qual a diferença entre juros simples e compostos?', 'Nos juros simples, os juros são sempre calculados sobre o valor inicial. Nos compostos, os juros de cada período entram no saldo e também rendem. R$ 10.000 a 1% ao mês por 12 meses viram R$ 11.200,00 nos simples e R$ 11.268,25 nos compostos.'],
    ['Como converter taxa anual em mensal?', 'Calcule (1 + taxa anual)^(1/12) − 1. Por exemplo, 12% ao ano equivalem a 0,95% ao mês, e não a 1%.'],
    ['A calculadora desconta impostos?', 'Não. O resultado é bruto, sem Imposto de Renda, IOF, taxas ou inflação. Use-o como referência e confira as regras de cada investimento.'],
    ['Em quanto tempo meu dinheiro dobra?', 'Pela regra dos 72, divida 72 pela taxa anual em %. A 8% ao ano, o dinheiro dobra em cerca de 9 anos; a 12% ao ano, em cerca de 6 anos.'],
    ['Por que os juros compostos pesam tanto nas dívidas?', 'Porque os juros não pagos entram no saldo e passam a gerar juros também. Em taxas altas, como as do rotativo do cartão, a dívida cresce muito rápido.']
  ]
};

module.exports = { parcelamento, descobrirTaxa, cartao, compostos };
