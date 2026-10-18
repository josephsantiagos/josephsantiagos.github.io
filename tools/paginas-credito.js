// Conteúdo: quitação antecipada, como calcular juros, financiamento imobiliário e pessoal × consignado.
'use strict';
const { C, b, p, f, dinheiro, taxa, prazo } = require('./comum.js');

const CTA_OFERTAS = 'No app você também compara ofertas e descobre a taxa embutida, com histórico das simulações e tabela de amortização no seu Android.';

/* =================== Quitar empréstimo antecipado =================== */

const quitar = {
  slug: 'quitar-emprestimo-antecipado',
  caminho: '/quitar-emprestimo-antecipado/',
  title: 'Quitar Empréstimo Antecipado: calcule o desconto',
  description: 'Calcule quanto pagar para quitar o empréstimo antes do prazo: valor presente das parcelas que faltam, desconto dos juros e antecipação das últimas.',
  h1: 'Quanto pagar para quitar o empréstimo antes',
  trilha: 'Quitar empréstimo antecipado',
  appNome: 'Calculadora de quitação antecipada de empréstimo',
  link: { titulo: 'Quitar empréstimo antecipado', desc: 'Quanto pagar hoje e o desconto dos juros.' },
  lead: 'Informe a parcela, a taxa do contrato e quantas parcelas faltam. A calculadora mostra quanto custa quitar hoje e quanto de juros você deixa de pagar.',
  cta: CTA_OFERTAS,
  calc: {
    tipo: 'quitacao',
    titulo: 'Quanto custa quitar hoje',
    campos: [
      dinheiro('parcela', 'Valor da parcela', '650,00'),
      taxa('2,5', { rotulo: 'Taxa de juros do contrato' }),
      { tipo: 'inteiro', nome: 'restantes', rotulo: 'Parcelas que faltam', valor: '18', un: 'parcelas' }
    ]
  },
  artigo() {
    const n = 18, pm = 650, i = 0.025;
    const soma = pm * n, hoje = C.r2(C.valorPresente(pm, i, n)), desc = C.r2(soma - hoje);
    const fator = Math.pow(1 + i, -n);
    const h6 = C.r2(C.valorPresente(pm, i, 6)), h36 = C.r2(C.valorPresente(pm, i, 36));
    const ult = C.r2(C.anteciparUltimas(pm, i, n, 1)), prox = C.r2(pm / (1 + i));
    return `
<h2>Por que quitar antes sai mais barato</h2>
<p>Cada parcela de um empréstimo carrega juros pelo tempo em que o dinheiro fica com você. A parcela que vence daqui a um mês tem um mês de juros embutido; a que vence daqui a dois anos tem dois anos. Quando você paga tudo hoje, os juros dos meses que ainda não passaram deixam de existir. Por isso o valor para quitar é sempre menor que a soma das parcelas que faltam, e a diferença é maior quanto mais longo for o prazo restante e mais alta for a taxa.</p>
<p>Em linguagem financeira, o valor de quitação é o <strong>valor presente</strong> das parcelas restantes, calculado com a taxa de juros do contrato. É exatamente isso que a calculadora acima mostra.</p>

<h2>O direito ao desconto dos juros</h2>
<p>O Código de Defesa do Consumidor garante a quem tem um contrato de crédito a possibilidade de liquidar a dívida antes do prazo, no todo ou em parte, com redução proporcional dos juros e demais acréscimos. Isso vale para empréstimo pessoal, consignado, financiamento de veículo ou de imóvel e crediário. Em contratos com taxa prefixada, o desconto costuma ser calculado com a própria taxa do contrato, como nesta calculadora.</p>
<p>Na prática, basta pedir à instituição o <strong>saldo devedor para quitação</strong>, ou o valor para antecipar parcelas. Ela informa o valor atualizado, válido até uma data. O desconto incide sobre os juros que ainda iam correr; impostos e tarifas cobrados na contratação seguem as regras do contrato.</p>

<h2>A fórmula da quitação antecipada</h2>
<p class="formula"><strong>Valor para quitar = Parcela × [1 − (1 + i)<sup>−n</sup>] ÷ i</strong></p>
<p>Aqui <em>i</em> é a taxa mensal do contrato em decimal e <em>n</em> é o número de parcelas que ainda faltam. A conta supõe que a próxima parcela vence daqui a um mês. Se a taxa do contrato estiver ao ano, converta antes para a mensal equivalente; o <a href="/converter-taxa-de-juros/">conversor de taxa de juros</a> faz isso.</p>

<h2>Exemplo resolvido: 18 parcelas de R$ 650 a 2,5% ao mês</h2>
<ol>
<li>Soma do que falta: 18 × R$ 650,00 = ${b(soma)}.</li>
<li>(1,025)<sup>−18</sup> ≈ ${f(fator, 4)}; 1 − ${f(fator, 4)} = ${f(1 - fator, 4)}.</li>
<li>Valor para quitar = 650 × ${f(1 - fator, 4)} ÷ 0,025 ≈ <strong>${b(hoje)}</strong>.</li>
<li>Desconto: ${b(soma)} − ${b(hoje)} = <strong>${b(desc)}</strong>, ou ${p(desc / soma, 1)} do que faltava pagar.</li>
</ol>
<p>Se faltassem só 6 parcelas, quitar custaria ${b(h6)} e o desconto cairia para ${b(6 * pm - h6)}. Com 36 parcelas restantes, o desconto subiria para ${b(36 * pm - h36)}. Quanto mais longe o fim do contrato, maior a economia.</p>

<h2>Antecipar só as últimas parcelas</h2>
<p>Nem sempre dá para quitar tudo de uma vez. Antecipar parcelas também dá desconto, e a ordem importa: as <strong>últimas parcelas</strong> são as que têm mais meses de juros embutidos. No exemplo, a 18ª parcela de R$ 650,00 sai hoje por ${b(ult)}, um desconto de ${b(pm - ult)}. Já antecipar a próxima parcela, que vence em um mês, rende um desconto de só ${b(pm - prox)}.</p>
<p>Ao antecipar as últimas, a parcela mensal continua igual e o contrato termina antes. Algumas instituições também permitem usar o valor para reduzir as parcelas e manter o prazo. Pergunte quais opções existem; a tabela do resultado mostra quanto custa antecipar as últimas 1, 3, 6 ou 12 parcelas.</p>

<h2>Quitar ou investir o dinheiro?</h2>
<p>Quitar uma dívida equivale a “ganhar” a taxa do contrato, sem risco. Se o empréstimo cobra 2,5% ao mês (${p(C.anualDeMensal(i))} ao ano), dificilmente uma aplicação comum rende isso, ainda mais depois do imposto. Por isso quitar costuma compensar em dívidas caras. Em dívidas mais baratas, como um financiamento com taxa abaixo do que o seu dinheiro rende guardado, a conta pode se inverter.</p>
<p>Antes de usar todo o dinheiro, mantenha uma reserva para emergências. Quitar uma dívida e, um mês depois, precisar de outro empréstimo ou entrar no cheque especial anula a vantagem.</p>

<h2>Passo a passo para pedir a quitação</h2>
<ol>
<li>Peça à instituição, pelos canais oficiais, o saldo devedor para quitação total ou o valor para antecipar parcelas.</li>
<li>Compare o valor informado com o desta calculadora. Diferenças de poucos reais são normais por causa das datas; diferenças grandes merecem explicação por escrito.</li>
<li>Pague só pelo boleto ou meio indicado nos canais oficiais e guarde o comprovante.</li>
<li>Peça o termo de quitação. No financiamento de veículo, confira a baixa da alienação; no consignado, confirme que os descontos em folha ou no benefício pararam.</li>
</ol>
<p>Desconfie de mensagens que oferecem “desconto especial para quitar” e pedem pagamento em conta de terceiros: é um golpe comum.</p>`;
  },
  faq: (() => {
    const hoje = C.r2(C.valorPresente(650, 0.025, 18)), ult = C.r2(C.anteciparUltimas(650, 0.025, 18, 1));
    return [
      ['Como calcular o valor para quitar um empréstimo antecipado?', `Traga as parcelas restantes a valor presente pela taxa do contrato: valor = parcela × [1 − (1 + i)^−n] ÷ i. Exemplo: 18 parcelas de R$ 650,00 a 2,5% ao mês dão ${b(hoje)} para quitar hoje, em vez de ${b(650 * 18)}.`],
      ['Tenho direito a desconto ao quitar o empréstimo antes?', 'Sim. O Código de Defesa do Consumidor assegura a liquidação antecipada, total ou parcial, com redução proporcional dos juros e demais acréscimos. Peça à instituição o saldo devedor atualizado.'],
      ['É melhor antecipar as primeiras ou as últimas parcelas?', `As últimas. Elas têm mais meses de juros embutidos e por isso recebem o maior desconto. No exemplo da página, a última de 18 parcelas de R$ 650,00 sai hoje por ${b(ult)}.`],
      ['Por que o valor da instituição é diferente do da calculadora?', 'A calculadora supõe a próxima parcela em exatamente um mês. A instituição usa os dias até cada vencimento e a data de pagamento do boleto, o que pode mudar o valor em alguns reais. Diferenças grandes devem ser explicadas por escrito.'],
      ['Vale a pena quitar ou é melhor investir o dinheiro?', 'Compare a taxa do contrato com o rendimento líquido do seu dinheiro. Se a dívida cobra mais do que a aplicação rende, quitar costuma compensar, desde que você mantenha uma reserva para emergências.'],
      ['Posso quitar o consignado antes do prazo?', 'Sim, com o mesmo direito ao desconto proporcional dos juros. Depois de pagar, confirme que os descontos em folha ou no benefício foram encerrados.']
    ];
  })()
};

/* =================== Como calcular juros de empréstimo =================== */

const comoCalcular = {
  slug: 'como-calcular-juros-de-emprestimo',
  caminho: '/como-calcular-juros-de-emprestimo/',
  title: 'Como Calcular Juros de Empréstimo: passo a passo',
  description: 'Aprenda a calcular os juros de um empréstimo pela Tabela Price, passo a passo, com fórmula, exemplo resolvido e uma calculadora que mostra cada conta.',
  h1: 'Como calcular os juros de um empréstimo',
  trilha: 'Como calcular juros de empréstimo',
  appNome: 'Calculadora passo a passo de juros de empréstimo',
  link: { titulo: 'Como calcular juros de empréstimo', desc: 'A fórmula da Price passo a passo, com os seus números.' },
  lead: 'Digite o valor, a taxa e o prazo: a calculadora resolve a fórmula da Tabela Price passo a passo, com os seus números, do jeito que você faria no papel.',
  cta: CTA_OFERTAS,
  calc: {
    tipo: 'passos',
    titulo: 'Calcule passo a passo',
    campos: [dinheiro('valor', 'Valor do empréstimo', '8.000'), taxa('3'), prazo('12')]
  },
  artigo() {
    const e = C.price(8000, 0.03, 12), s = C.sac(8000, 0.03, 12), l = e.linhas;
    const pot = Math.pow(1.03, 12), inv = 1 / pot, fat = 1 - inv;
    return `
<h2>O que você precisa ter em mãos</h2>
<p>Para calcular os juros de um empréstimo bastam três números: o <strong>valor</strong> emprestado, a <strong>taxa de juros</strong> mensal e o <strong>prazo</strong> em meses. Eles aparecem em qualquer proposta ou contrato. Se a taxa estiver ao ano, converta para a taxa mensal equivalente com (1 + taxa anual)<sup>1/12</sup> − 1, porque dividir por 12 dá um número errado. A conversão está explicada em <a href="/converter-taxa-de-juros/">converter taxa de juros</a>.</p>
<p>Quase todo empréstimo pessoal, consignado e financiamento de veículo usa a <a href="/tabela-price/">Tabela Price</a>, com parcelas iguais. O passo a passo abaixo é o dela; mais adiante há também a conta do SAC.</p>

<h2>Passo a passo com exemplo: R$ 8.000 a 3% ao mês em 12 meses</h2>
<ol>
<li><strong>Transforme a taxa em decimal.</strong> 3 ÷ 100 = 0,03. Esse é o <em>i</em>.</li>
<li><strong>Eleve (1 + i) ao prazo.</strong> 1,03<sup>12</sup> = ${f(pot, 6)}.</li>
<li><strong>Inverta o resultado.</strong> 1 ÷ ${f(pot, 6)} = ${f(inv, 6)}. Esse é o (1 + i)<sup>−n</sup>.</li>
<li><strong>Subtraia de 1.</strong> 1 − ${f(inv, 6)} = ${f(fat, 6)}.</li>
<li><strong>Aplique a fórmula da parcela.</strong> Parcela = 8.000 × 0,03 ÷ ${f(fat, 6)} = <strong>${b(e.parcela)}</strong>.</li>
<li><strong>Calcule o total e os juros.</strong> Total = 12 × ${b(e.parcela)} = ${b(e.total)}. Juros = ${b(e.total)} − R$ 8.000,00 = <strong>${b(e.juros)}</strong>.</li>
</ol>
<p>Os juros desse empréstimo somam ${p(e.juros / 8000, 1)} do valor emprestado. A fórmula completa, em uma linha, é:</p>
<p class="formula"><strong>Parcela = Valor × i ÷ [1 − (1 + i)<sup>−n</sup>]</strong></p>

<h2>Como os juros se dividem mês a mês</h2>
<p>A parcela é sempre a mesma, mas a parte dela que é juros muda. No 1º mês, os juros são 3% sobre a dívida inteira: 8.000 × 0,03 = ${b(l[0].juros)}. O restante, ${b(l[0].amort)}, abate a dívida, que cai para ${b(l[0].saldo)}. No 2º mês, os juros são 3% sobre esse saldo menor: ${b(l[1].juros)}. Na última parcela, sobram só ${b(l[11].juros)} de juros. A calculadora acima monta essa tabela completa para os seus números.</p>

<h2>Como fazer a conta na calculadora do celular</h2>
<p>Gire o celular na horizontal para abrir a calculadora científica, que tem a tecla de potência (x<sup>y</sup>). Digite 1,03, toque na potência, digite 12 e confirme: aparece ${f(pot, 6)}. Depois calcule 1 ÷ esse número, subtraia o resultado de 1 e divida 8.000 × 0,03 pelo que sobrou. São poucos toques a mais do que uma conta comum.</p>

<h2>Como fazer a conta na planilha</h2>
<p>Em planilhas em português, a função <strong>PGTO</strong> calcula a parcela: =PGTO(3%;12;-8000) devolve ${b(e.parcela)}. O valor entra negativo porque, para a planilha, é dinheiro que sai de um lado e entra do outro. Para descobrir a taxa a partir da parcela, use =TAXA(12;-803,70;8000). Em planilhas configuradas em inglês, as funções se chamam PMT e RATE, e o separador costuma ser a vírgula.</p>

<h2>E no sistema SAC?</h2>
<p>No SAC a conta é ainda mais simples, porque a amortização é fixa: valor ÷ prazo. Com R$ 8.000 em 12 meses, a amortização é ${b(8000 / 12)} por mês. Os juros de cada mês são a taxa vezes o saldo devedor, e a parcela é a soma dos dois. A primeira parcela seria ${b(s.primeira)} e a última ${b(s.ultima)}, com ${b(s.juros)} de juros no total, ${b(e.juros - s.juros)} a menos que na Price. Veja a comparação em <a href="/price-ou-sac/">Price ou SAC</a>.</p>

<h2>Erros comuns ao calcular juros de empréstimo</h2>
<ul>
<li><strong>Dividir a taxa anual por 12.</strong> Com juros compostos, 36% ao ano equivalem a ${p(C.mensalDeAnual(0.36))} ao mês, e não a 3%.</li>
<li><strong>Usar juros simples.</strong> 8.000 × 3% × 12 = R$ 2.880,00 seria a conta de juros simples sobre a dívida inteira, mas a dívida cai a cada mês. Os juros reais são ${b(e.juros)}.</li>
<li><strong>Esquecer IOF, tarifas e seguros.</strong> A fórmula calcula só os juros. O custo completo é o <a href="/o-que-e-cet/">CET</a>.</li>
<li><strong>Comparar só a parcela.</strong> Parcela menor com prazo maior quase sempre significa mais juros no total.</li>
</ul>`;
  },
  faq: (() => {
    const e = C.price(8000, 0.03, 12);
    return [
      ['Como calcular os juros de um empréstimo?', `Calcule a parcela pela fórmula da Tabela Price, parcela = valor × i ÷ [1 − (1 + i)^−n], multiplique pelo número de parcelas e subtraia o valor emprestado. Exemplo: R$ 8.000 a 3% ao mês em 12 meses dá parcela de ${b(e.parcela)} e ${b(e.juros)} de juros.`],
      ['Qual é a fórmula dos juros de empréstimo?', 'Na Tabela Price, a parcela é valor × i ÷ [1 − (1 + i)^−n], com i a taxa mensal em decimal e n o número de meses. Os juros totais são a soma das parcelas menos o valor emprestado.'],
      ['Posso calcular os juros de empréstimo com juros simples?', 'Não. Em empréstimos com parcelas, os juros são calculados sobre o saldo devedor, que cai a cada mês. A conta simples (valor × taxa × prazo) dá um número bem diferente do real.'],
      ['Como calcular os juros com a taxa ao ano?', `Converta para a taxa mensal equivalente: (1 + taxa anual)^(1/12) − 1. Por exemplo, 36% ao ano equivalem a ${p(C.mensalDeAnual(0.36))} ao mês. Depois use a fórmula normalmente.`],
      ['Qual função da planilha calcula a parcela?', 'Em planilhas em português, a função PGTO: =PGTO(taxa;prazo;-valor). Para achar a taxa a partir da parcela, use a função TAXA.'],
      ['Os juros calculados incluem IOF?', 'Não. A fórmula considera só os juros. IOF, tarifas e seguros entram no Custo Efetivo Total (CET), que a instituição deve informar.']
    ];
  })()
};

/* =================== Financiamento imobiliário =================== */

const IM = C.mensalDeAnual(0.11);

const imovel = {
  slug: 'financiamento-imobiliario',
  caminho: '/financiamento-imobiliario/',
  title: 'Simulador de Financiamento Imobiliário: SAC e Price',
  description: 'Simule o financiamento do imóvel com entrada, taxa ao ano e prazo de até 420 meses. Compare SAC e Price: 1ª parcela, juros e renda necessária.',
  h1: 'Simulador de financiamento imobiliário',
  trilha: 'Financiamento imobiliário',
  appNome: 'Simulador de financiamento imobiliário',
  link: { titulo: 'Financiamento imobiliário', desc: 'Casa ou apartamento em SAC ou Price, até 420 meses.' },
  lead: 'Informe o valor do imóvel, a entrada, a taxa e o prazo. O simulador mostra a parcela em SAC ou Price, os juros, o custo total e a renda de referência.',
  cta: 'No app você também simula em SAC ou Price, compara ofertas, descobre a taxa embutida e guarda a tabela de amortização.',
  calc: {
    tipo: 'imovel',
    titulo: 'Simule o financiamento do imóvel',
    campos: [
      dinheiro('valor', 'Valor do imóvel', '400.000'),
      dinheiro('entrada', 'Entrada', '100.000'),
      taxa('11', { periodo: 'ano' }),
      prazo('360', { dica: 'Até 420 meses (35 anos).' }),
      { tipo: 'radio', nome: 'sistema', rotulo: 'Sistema de amortização', valor: 'sac', largo: true,
        opcoes: [['sac', 'SAC — parcelas que diminuem'], ['price', 'Price — parcelas iguais']] }
    ]
  },
  artigo() {
    const s = C.sac(300000, IM, 360), pr = C.price(300000, IM, 360);
    const s2 = C.sac(280000, IM, 360);
    const linhas = [240, 360, 420].map((n) => {
      const a = C.sac(300000, IM, n), c = C.price(300000, IM, n);
      return `<tr><td>${n} meses (${n / 12} anos)</td><td>${b(a.primeira)}</td><td>${b(a.juros)}</td><td>${b(c.parcela)}</td><td>${b(c.juros)}</td></tr>`;
    }).join('\n');
    const s20 = C.sac(300000, IM, 240), s35 = C.sac(300000, IM, 420);
    return `
<h2>Como funciona o financiamento imobiliário</h2>
<p>No financiamento de imóvel você paga uma parte do preço com recursos próprios, a <strong>entrada</strong>, e a instituição financia o restante, que é devolvido em parcelas mensais por muitos anos. Até a quitação, o imóvel fica como garantia da dívida, o que se chama alienação fiduciária. Por ser uma dívida longa e com garantia, a taxa costuma ser informada <strong>ao ano</strong> e é menor do que a de um empréstimo sem garantia.</p>
<p>Os dois sistemas de amortização mais usados são o <strong>SAC</strong>, em que a parcela começa mais alta e cai todo mês, e a <strong>Tabela Price</strong>, com parcela fixa. No crédito imobiliário o SAC é muito comum. O simulador calcula os dois e mostra a diferença em reais.</p>

<h2>Exemplo resolvido: imóvel de R$ 400.000 com R$ 100.000 de entrada</h2>
<p>Valor financiado: R$ 300.000. Taxa de 11% ao ano, que equivale a ${p(IM)} ao mês. Prazo de 360 meses (30 anos).</p>
<ul>
<li><strong>SAC:</strong> amortização fixa de 300.000 ÷ 360 = ${b(300000 / 360)}. A 1ª parcela soma os juros do mês, ${b(s.linhas[0].juros)}, e fica em <strong>${b(s.primeira)}</strong>. A última é ${b(s.ultima)}. Juros totais: ${b(s.juros)}.</li>
<li><strong>Price:</strong> parcela fixa de <strong>${b(pr.parcela)}</strong> do início ao fim. Juros totais: ${b(pr.juros)}, ou ${b(pr.juros - s.juros)} a mais que no SAC.</li>
</ul>
<p>Repare no tamanho dos juros: em 30 anos, mesmo no SAC eles passam do valor financiado. É o efeito do prazo longo, e é por isso que cada ano a menos no contrato faz tanta diferença.</p>

<h2>Prazo: 20, 30 ou 35 anos</h2>
<div class="rolagem"><table class="comparativo"><caption>R$ 300.000 financiados a 11% ao ano</caption>
<thead><tr><th scope="col">Prazo</th><th scope="col">1ª parcela SAC</th><th scope="col">Juros SAC</th><th scope="col">Parcela Price</th><th scope="col">Juros Price</th></tr></thead>
<tbody>
${linhas}
</tbody></table></div>
<p>Esticar de 20 para 35 anos baixa a 1ª parcela do SAC em só ${b(s20.primeira - s35.primeira)}, mas acrescenta ${b(s35.juros - s20.juros)} de juros. O prazo máximo depende da instituição e da idade de quem financia, porque o contrato costuma ter de terminar antes de uma idade-limite.</p>

<h2>Quanto dar de entrada</h2>
<p>Em geral a instituição financia só uma parte do valor do imóvel, então a entrada é necessária, e o percentual mínimo varia conforme a instituição, o tipo de imóvel e a modalidade. Quanto maior a entrada, menor a dívida e os juros. No exemplo, com R$ 120.000 de entrada (30%), o valor financiado cai para R$ 280.000, a 1ª parcela do SAC para ${b(s2.primeira)} e os juros totais diminuem ${b(s.juros - s2.juros)}.</p>

<h2>Renda: quanto a parcela pode pesar</h2>
<p>Uma referência prática é não comprometer mais de 30% da renda familiar com a parcela da casa. No SAC, o teste é feito com a 1ª parcela, a maior de todas: ${b(s.primeira)} pedem renda de cerca de ${b(s.primeira / 0.3)}. Na Price, ${b(pr.parcela)} pedem cerca de ${b(pr.parcela / 0.3)}. Essa diferença costuma levar muita gente a escolher a Price, mesmo pagando mais juros. Cada instituição tem os próprios critérios de análise de renda.</p>

<h2>Custos além da parcela</h2>
<ul>
<li><strong>Seguros obrigatórios</strong> do crédito imobiliário, que cobrem morte e invalidez de quem financia e danos físicos ao imóvel, entram todo mês junto com a parcela.</li>
<li><strong>Tarifas</strong>, como a de avaliação do imóvel, podem ser cobradas na contratação.</li>
<li><strong>Correção do saldo:</strong> alguns contratos atualizam o saldo devedor por um índice, além dos juros. Confira no contrato.</li>
<li><strong>Impostos e cartório:</strong> o imposto municipal de transmissão (ITBI) e o registro do imóvel costumam ser pagos à parte.</li>
</ul>
<p>Os custos do financiamento entram no <a href="/o-que-e-cet/">Custo Efetivo Total (CET)</a>, que deve constar na proposta. Compare propostas pelo CET, com o mesmo valor, prazo e sistema.</p>

<h2>Amortizar para pagar menos juros</h2>
<p>Usar dinheiro extra, como o 13º salário, para amortizar o saldo reduz bastante os juros, porque cada real abatido deixa de gerar juros por todos os meses que faltam. Normalmente você escolhe entre reduzir o prazo ou reduzir a parcela; reduzir o prazo economiza mais. Veja como o desconto funciona em <a href="/quitar-emprestimo-antecipado/">quitar empréstimo antecipado</a> e a diferença entre os sistemas em <a href="/price-ou-sac/">Price ou SAC</a>.</p>`;
  },
  faq: (() => {
    const s = C.sac(300000, IM, 360), pr = C.price(300000, IM, 360);
    return [
      ['Como calcular a parcela do financiamento imobiliário?', `Desconte a entrada do valor do imóvel, converta a taxa anual para mensal e aplique o SAC ou a Price. Exemplo: R$ 300.000 financiados a 11% ao ano em 360 meses dão 1ª parcela de ${b(s.primeira)} no SAC ou parcela fixa de ${b(pr.parcela)} na Price.`],
      ['SAC ou Price: qual é melhor para comprar imóvel?', `O SAC paga menos juros no total, mas começa com parcela maior. A Price tem parcela fixa e menor no início, com mais juros. No exemplo da página, a diferença de juros é de ${b(pr.juros - s.juros)} em 30 anos.`],
      ['Qual é o prazo máximo do financiamento imobiliário?', 'Depende da instituição e da modalidade. Prazos de até 420 meses (35 anos) existem, e a idade de quem financia também limita o prazo. O simulador aceita até 420 meses.'],
      ['Quanto preciso de renda para financiar um imóvel?', 'Uma referência prática é a parcela não passar de 30% da renda familiar. O simulador mostra a renda aproximada para a 1ª parcela caber nesse limite, mas cada instituição tem os próprios critérios.'],
      ['O simulador inclui seguros e correção do saldo?', 'Não. Ele calcula juros e amortização. Seguros obrigatórios, tarifas e eventual correção do saldo por índice entram no CET da proposta.'],
      ['Vale a pena amortizar o financiamento do imóvel?', 'Em geral sim: cada real abatido deixa de gerar juros nos meses que faltam. Reduzir o prazo costuma economizar mais do que reduzir a parcela.']
    ];
  })()
};

/* =================== Empréstimo pessoal ou consignado =================== */

const pessoalOuConsignado = {
  slug: 'emprestimo-pessoal-ou-consignado',
  caminho: '/emprestimo-pessoal-ou-consignado/',
  title: 'Empréstimo Pessoal ou Consignado? Compare ofertas',
  description: 'Compare empréstimo pessoal e consignado: diferenças, prós e contras e uma calculadora para pôr duas ofertas lado a lado e ver qual custa menos.',
  h1: 'Empréstimo pessoal ou consignado: qual compensa?',
  trilha: 'Pessoal ou consignado',
  appNome: 'Comparador de ofertas de empréstimo',
  link: { titulo: 'Pessoal ou consignado', desc: 'Duas ofertas lado a lado: qual custa menos.' },
  lead: 'Coloque duas ofertas de empréstimo lado a lado, com taxas e prazos diferentes, e veja qual custa menos no total e qual tem a menor parcela.',
  cta: 'No app você compara de 2 a 3 ofertas lado a lado, descobre a taxa embutida e guarda o histórico das simulações.',
  calc: {
    tipo: 'comparar',
    titulo: 'Compare duas ofertas',
    botao: 'Comparar',
    campos: [
      dinheiro('valor', 'Valor do empréstimo', '10.000', { largo: true }),
      taxa('3,5', { nome: 'taxaa', rotulo: 'Taxa da oferta A', periodo: null, dica: 'Ex.: empréstimo pessoal.' }),
      prazo('24', { nome: 'prazoa', rotulo: 'Prazo da oferta A' }),
      taxa('1,8', { nome: 'taxab', rotulo: 'Taxa da oferta B', periodo: null, dica: 'Ex.: consignado.' }),
      prazo('36', { nome: 'prazob', rotulo: 'Prazo da oferta B' })
    ]
  },
  artigo() {
    const A = C.price(10000, 0.035, 24), B = C.price(10000, 0.018, 36), B84 = C.price(10000, 0.018, 84);
    return `
<h2>A diferença principal: como a parcela é paga</h2>
<p>No <strong>empréstimo pessoal</strong>, você paga a parcela por boleto ou débito em conta, e quem empresta não tem nenhuma garantia além do seu compromisso de pagar. No <strong>consignado</strong>, a parcela é descontada direto do salário, da aposentadoria ou da pensão, antes de o dinheiro chegar até você. Esse desconto automático reduz o risco de atraso para quem empresta, e é por isso que o consignado costuma ter juros menores.</p>
<p>A contrapartida é a flexibilidade. No consignado você compromete parte da renda por um prazo longo, sem poder adiar uma parcela, e só pode contratar se tiver margem consignável disponível. No pessoal, as condições dependem mais da análise do seu perfil, e a taxa costuma ser maior.</p>
<div class="rolagem"><table class="comparativo"><caption>Diferenças gerais entre as modalidades</caption>
<thead><tr><th scope="col"></th><th scope="col">Consignado</th><th scope="col">Pessoal</th></tr></thead>
<tbody>
<tr><th scope="row">Pagamento</th><td>Desconto em folha ou no benefício</td><td>Boleto, débito ou carnê</td></tr>
<tr><th scope="row">Quem pode</th><td>Quem tem vínculo que permite o desconto e margem livre</td><td>Quem passa na análise da instituição</td></tr>
<tr><th scope="row">Juros</th><td>Costumam ser menores</td><td>Costumam ser maiores</td></tr>
<tr><th scope="row">Prazo</th><td>Costuma ser longo</td><td>Costuma ser mais curto</td></tr>
<tr><th scope="row">Flexibilidade</th><td>Menor: o desconto é automático</td><td>Maior, mas o atraso gera multa e juros</td></tr>
</tbody></table></div>

<h2>Exemplo: duas ofertas de R$ 10.000</h2>
<p>A calculadora acima já vem com um exemplo ilustrativo: oferta A a 3,5% ao mês em 24 meses, como poderia ser um empréstimo pessoal, e oferta B a 1,8% ao mês em 36 meses, como poderia ser um consignado.</p>
<ul>
<li>Oferta A: parcela de ${b(A.parcela)}, total de ${b(A.total)}, juros de ${b(A.juros)}.</li>
<li>Oferta B: parcela de ${b(B.parcela)}, total de ${b(B.total)}, juros de ${b(B.juros)}.</li>
</ul>
<p>Mesmo com um ano a mais de prazo, a oferta B custa ${b(A.juros - B.juros)} a menos. Mas nem sempre é assim: se a oferta B fosse em 84 meses na mesma taxa, os juros subiriam para ${b(B84.juros)}, ${B84.juros > A.juros ? 'mais do que na oferta A' : 'ainda menos do que na oferta A'}. Por isso compare o total pago, e não só a taxa ou a parcela.</p>

<h2>Quando o empréstimo pessoal pode fazer mais sentido</h2>
<ul>
<li>Quando você não tem margem consignável disponível ou não tem um vínculo que permita o desconto em folha.</li>
<li>Quando precisa de um valor pequeno por pouco tempo e pretende quitar rápido.</li>
<li>Quando a sua renda varia e você prefere não ter um desconto fixo no contracheque.</li>
</ul>

<h2>Quando o consignado pode fazer mais sentido</h2>
<ul>
<li>Para trocar dívidas mais caras, como o rotativo do cartão ou o cheque especial, por uma de custo menor.</li>
<li>Quando a parcela cabe com folga na margem e no orçamento, sem apertar as contas do mês.</li>
<li>Quando a renda é estável. Em caso de desligamento do emprego, as regras de cobrança do saldo dependem do contrato.</li>
</ul>

<h2>Como comparar duas propostas do jeito certo</h2>
<ol>
<li>Peça as duas para o <strong>mesmo valor</strong> e, se possível, o mesmo prazo.</li>
<li>Compare o <a href="/o-que-e-cet/">CET</a>, que inclui juros, IOF, tarifas e seguros. Duas ofertas com a mesma taxa podem ter CET diferente.</li>
<li>Olhe o <strong>total pago</strong>, não só a parcela. Prazo longo esconde juros.</li>
<li>Se só souber a parcela, descubra a taxa na calculadora de <a href="/descobrir-taxa-de-juros/">taxa de juros</a>.</li>
<li>Veja se a parcela cabe no orçamento com folga, somando as outras dívidas.</li>
</ol>
<p>Para simular o consignado com a sua margem, use o <a href="/emprestimo-consignado/">simulador de consignado</a>.</p>

<h2>Cuidados com ofertas de crédito</h2>
<ul>
<li>Não pague nada antecipado para “liberar” um empréstimo: é golpe.</li>
<li>Não passe senhas nem códigos recebidos por mensagem.</li>
<li>Recuse seguros e serviços que você não pediu; eles encarecem o CET.</li>
<li>No consignado, você pode levar a dívida para outra instituição com custo menor, a portabilidade.</li>
</ul>`;
  },
  faq: [
    ['Qual é a diferença entre empréstimo pessoal e consignado?', 'No consignado a parcela é descontada direto do salário ou do benefício, o que reduz o risco para quem empresta e costuma reduzir os juros. No pessoal você paga por boleto ou débito, com mais flexibilidade e, em geral, juros maiores.'],
    ['O consignado é sempre mais barato?', 'Costuma ter taxa menor, mas o custo total depende também do prazo, do IOF, das tarifas e dos seguros. Compare o CET e o total pago das duas propostas.'],
    ['Como comparar duas ofertas de empréstimo?', 'Use o mesmo valor nas duas, compare o CET e o total pago e veja se a parcela cabe no orçamento. A calculadora desta página coloca duas ofertas lado a lado.'],
    ['Posso ter empréstimo pessoal e consignado ao mesmo tempo?', 'Pode, desde que as parcelas caibam na renda e o consignado respeite a margem disponível. Some todas as parcelas antes de contratar mais um crédito.'],
    ['Vale a pena trocar um empréstimo pessoal por um consignado?', 'Pode valer, se o CET do consignado for menor e o prazo não for esticado demais. Compare usando o saldo que falta pagar como valor das duas ofertas.'],
    ['Este site oferece empréstimo?', 'Não. É apenas uma calculadora gratuita. Não oferecemos nem intermediamos crédito e não temos vínculo com bancos, financeiras ou órgãos públicos.']
  ]
};

module.exports = { quitar, comoCalcular, imovel, pessoalOuConsignado };
