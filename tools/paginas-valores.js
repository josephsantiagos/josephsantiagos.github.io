// Páginas programáticas por valor (/emprestimo-de-1000-reais/ etc.): tabela gerada no build,
// calculadora pré-preenchida com o valor e texto próprio para cada valor.
'use strict';
const { C, b, p, f, dinheiro, taxa, prazo } = require('./comum.js');

const PRAZOS = [6, 12, 18, 24, 36, 48, 60];
const TAXAS = [0.015, 0.025, 0.035, 0.05];

const nomeValor = (v) => 'R$ ' + C.fmt(v, 0);
const curto = (v) => (v >= 1000 ? 'R$ ' + C.fmt(v / 1000, 0) + ' mil' : 'R$ ' + C.fmt(v, 0));

// atalhos de conta para um valor: P = parcela, T = total, J = juros (taxa padrão 2,5% ao mês)
function contas(v) {
  const r = (n, t) => C.price(v, t == null ? 0.025 : t, n);
  return {
    r,
    P: (n, t) => r(n, t).parcela,
    T: (n, t) => r(n, t).total,
    J: (n, t) => r(n, t).juros
  };
}

function tabela(v) {
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

// menor prazo da tabela cuja parcela (a 2,5% ao mês) cabe num limite
function prazoQueCabe(v, limite) {
  for (const n of PRAZOS) if (C.price(v, 0.025, n).parcela <= limite) return n;
  return null;
}

function pagina(d) {
  const v = d.v, slug = `emprestimo-de-${v}-reais`;
  return {
    slug,
    caminho: `/${slug}/`,
    title: d.title,
    description: d.description(contas(v)),
    h1: d.h1,
    trilha: `Empréstimo de ${nomeValor(v)}`,
    pai: { nome: 'Quanto fica um empréstimo', caminho: '/quanto-fica-emprestimo/' },
    grupoCards: 'emprestimo',
    appNome: `Simulador de empréstimo de ${nomeValor(v)}`,
    link: { titulo: `Empréstimo de ${nomeValor(v)}`, curto: curto(v), desc: `Parcelas de 6 a 60 meses para ${curto(v)}.` },
    lead: d.lead,
    cta: 'No app você também compara de 2 a 3 ofertas para este valor, descobre a taxa embutida e guarda o histórico das simulações.',
    calc: {
      tipo: 'emprestimo',
      titulo: `Simule o empréstimo de ${nomeValor(v)}`,
      campos: [
        dinheiro('valor', 'Valor do empréstimo', C.fmt(v, 0)),
        taxa('2,5'),
        prazo(String(d.prazo)),
        { tipo: 'radio', nome: 'sistema', rotulo: 'Sistema de amortização', valor: 'price', largo: true,
          opcoes: [['price', 'Price — parcelas iguais'], ['sac', 'SAC — parcelas que diminuem']] }
      ]
    },
    artigo() {
      const k = contas(v);
      return `
<h2>${d.tabelaTitulo}</h2>
<p>${d.intro(k)}</p>
${tabela(v)}

<h2>${d.usosTitulo}</h2>
${d.usos(k)}

<h2>${d.jurosTitulo}</h2>
${d.juros(k)}

<h2>${d.prazoTitulo}</h2>
${d.prazoTexto(k)}

<h2>${d.extraTitulo}</h2>
${d.extra(k)}`;
    },
    faq: d.faq(contas(v))
  };
}

/* =================== R$ 1.000 =================== */

const mil = pagina({
  v: 1000, prazo: 12,
  title: 'Empréstimo de 1.000 reais: quanto fica a parcela',
  description: (k) => `Quanto fica um empréstimo de R$ 1.000? A 2,5% ao mês, 12x de ${b(k.P(12))}. Veja a tabela de 6 a 60 meses, com juros de 1,5% a 5% ao mês.`,
  h1: 'Empréstimo de R$ 1.000: quanto fica a parcela',
  lead: 'Parcela e total pago de um empréstimo de mil reais em sete prazos e quatro taxas, com uma calculadora já preenchida para você ajustar à sua proposta.',
  tabelaTitulo: 'Tabela de parcelas para R$ 1.000',
  intro: (k) => `Um empréstimo de R$ 1.000 em 12 meses a 2,5% ao mês fica em <strong>${b(k.P(12))}</strong> por mês, com ${b(k.J(12))} de juros no total. Na tabela abaixo, cada linha é um prazo e cada coluna uma taxa mensal; em cima está a parcela e, embaixo, o total devolvido.`,
  usosTitulo: 'Quando um empréstimo de R$ 1.000 costuma aparecer',
  usos: () => `<p>Mil reais é o tipo de valor que falta numa emergência: o conserto da geladeira, o celular quebrado que é ferramenta de trabalho, um remédio fora do orçamento, a conta de luz atrasada que virou aviso de corte. É pouco dinheiro para um contrato de crédito, e isso tem uma consequência: tarifas cobradas em valor fixo pesam mais em proporção do que pesariam num empréstimo maior. Por isso o CET de empréstimos pequenos pode ficar bem acima da taxa de juros.</p>
<p>Antes de contratar, vale testar saídas sem juros. Muitas empresas parcelam a própria conta atrasada; assistências técnicas costumam aceitar o cartão em poucas vezes; às vezes vender algo parado em casa resolve. Se nada disso der, o empréstimo de R$ 1.000 pode ser a opção mais organizada, desde que você saiba exatamente quanto vai devolver.</p>`,
  jurosTitulo: 'Quanto vira de juros em R$ 1.000',
  juros: (k) => `<p>Em reais, os juros de um empréstimo de R$ 1.000 parecem pequenos, mas em proporção são os mesmos de qualquer valor. A 2,5% ao mês, você paga ${b(k.J(6))} de juros em 6 meses, ${b(k.J(12))} em 12 meses e ${b(k.J(24))} em 24 meses. Se a taxa for de 5% ao mês, comum nas linhas mais caras, os juros em 12 meses chegam a ${b(k.J(12, 0.05))}, ou ${p(k.J(12, 0.05) / 1000, 0)} do valor pedido.</p>
<p>No outro extremo, esticar R$ 1.000 para 60 meses a 5% ao mês faria você devolver ${b(k.T(60, 0.05))}, mais de três vezes o valor emprestado, por uma parcela de ${b(k.P(60, 0.05))}, pouco menor que a de 36 meses (${b(k.P(36, 0.05))}).</p>`,
  prazoTitulo: 'Qual prazo escolher para R$ 1.000',
  prazoTexto: (k) => `<p>Para um valor pequeno, o prazo curto quase sempre vence. A 2,5% ao mês, a parcela de 6 meses é ${b(k.P(6))} e a de 12 meses, ${b(k.P(12))}: uma diferença de ${b(k.P(6) - k.P(12))} por mês, que às vezes cabe no orçamento com algum ajuste. Em troca, os juros caem de ${b(k.J(12))} para ${b(k.J(6))}.</p>
<p>Uma regra útil: se a parcela de 12 meses já cabe, não aceite 24 ou 36 só porque a parcela fica “mais leve”. Com R$ 1.000, a economia mensal de alongar é de poucas dezenas de reais, e o custo extra no fim do contrato é grande perto do valor emprestado.</p>`,
  extraTitulo: 'Cheque especial, cartão ou empréstimo?',
  extra: () => `<p>Para cobrir mil reais por poucos dias, o cheque especial e o rotativo do cartão parecem práticos, porque já estão disponíveis. Mas estão entre as linhas mais caras e, se o buraco durar meses, os juros compostos crescem rápido; veja a simulação em <a href="/juros-cartao-de-credito/">juros do cartão de crédito</a>. Um empréstimo com parcelas fixas costuma ter custo menor e prazo definido.</p>
<p>Se você já está no cheque especial ou no rotativo, um empréstimo pessoal de R$ 1.000 com CET menor pode servir para trocar a dívida cara por uma mais barata. A conta só fecha se você não voltar a usar o limite logo em seguida. Para conferir o custo real da proposta, informe o valor que vai cair na conta e a parcela na calculadora de <a href="/o-que-e-cet/">CET</a>.</p>`,
  faq: (k) => [
    ['Quanto fica a parcela de um empréstimo de R$ 1.000 em 12 vezes?', `A 2,5% ao mês, ${b(k.P(12))} por mês, com total de ${b(k.T(12))}. A 1,5% ao mês, ${b(k.P(12, 0.015))}; a 5% ao mês, ${b(k.P(12, 0.05))}. Os valores não incluem IOF nem tarifas.`],
    ['Quanto pago de juros em um empréstimo de mil reais?', `Depende da taxa e do prazo. Em 6 meses, os juros vão de ${b(k.J(6, 0.015))} (a 1,5% ao mês) a ${b(k.J(6, 0.05))} (a 5% ao mês). Em 24 meses, de ${b(k.J(24, 0.015))} a ${b(k.J(24, 0.05))}.`],
    ['Vale a pena pegar R$ 1.000 em 24 meses?', `Só se a parcela dos prazos menores não couber. A 2,5% ao mês, passar de 12 para 24 meses reduz a parcela em ${b(k.P(12) - k.P(24))}, mas aumenta os juros em ${b(k.J(24) - k.J(12))}.`],
    ['Por que o CET de um empréstimo pequeno pode ser mais alto?', 'Porque tarifas cobradas em valor fixo pesam mais em porcentagem quando o empréstimo é pequeno. Em R$ 1.000, uma mesma tarifa representa dez vezes mais do que em R$ 10.000.'],
    ['Quanto fica R$ 1.000 em 6 vezes?', `A 2,5% ao mês, ${b(k.P(6))} por mês e ${b(k.T(6))} no total. Com um prazo curto assim, a diferença entre as taxas fica pequena em reais: de ${b(k.P(6, 0.015))} a ${b(k.P(6, 0.05))} por mês.`],
    ['Este site empresta R$ 1.000?', 'Não. O site é só uma calculadora gratuita. Não oferecemos nem intermediamos crédito e não temos vínculo com bancos, financeiras ou órgãos públicos.']
  ]
});

/* =================== R$ 2.000 =================== */

const doisMil = pagina({
  v: 2000, prazo: 12,
  title: 'Empréstimo de 2.000 reais: parcelas de 6 a 60 meses',
  description: (k) => `Empréstimo de R$ 2.000: a 2,5% ao mês, ${b(k.P(12))} em 12x ou ${b(k.P(24))} em 24x. Tabela com 7 prazos e 4 taxas e simulador grátis.`,
  h1: 'Empréstimo de R$ 2.000: quanto fica e quanto custa',
  lead: 'Veja quanto fica a parcela de um empréstimo de 2 mil reais em cada prazo e taxa, quanto disso é juros e como escolher o prazo sem pagar a mais.',
  tabelaTitulo: 'Quanto fica um empréstimo de R$ 2.000',
  intro: (k) => `Pegando R$ 2.000 a 2,5% ao mês, a parcela fica em <strong>${b(k.P(12))}</strong> em 12 meses e em ${b(k.P(24))} em 24 meses. A tabela mostra sete prazos, de 6 a 60 meses, em quatro taxas de juros. O número em destaque é a parcela; o de baixo, o total que sai do seu bolso até a última parcela.`,
  usosTitulo: 'Para que as pessoas costumam pedir R$ 2.000',
  usos: () => `<p>Dois mil reais cobrem despesas que não cabem no salário de um mês só: a revisão do carro ou da moto usada para trabalhar, a mudança de casa com a caução do aluguel, o material e o uniforme das crianças no começo do ano, ou a fatura do cartão que fugiu do controle. Em vários desses casos o gasto é previsível, o que abre espaço para uma alternativa sem juros: guardar uma parte por alguns meses antes.</p>
<p>Quando a necessidade é imediata, o empréstimo de R$ 2.000 funciona melhor se tiver um objetivo único e fechado. Dívidas pequenas feitas para cobrir “um pouco de tudo” tendem a se repetir no mês seguinte, e aí o problema deixa de ser o valor e passa a ser o hábito.</p>`,
  jurosTitulo: 'Quanto você devolve além dos R$ 2.000',
  juros: (k) => {
    const dif = k.J(12, 0.05) - k.J(12, 0.015);
    return `<p>A 2,5% ao mês, um ano de prazo custa ${b(k.J(12))} de juros, cerca de ${p(k.J(12) / 2000, 0)} do valor. Em dois anos, ${b(k.J(24))}. A diferença entre pegar a 1,5% e a 5% ao mês, no mesmo prazo de 12 meses, é de ${b(dif)}: o equivalente a ${f(dif / k.P(12, 0.015), 1)} parcelas da opção mais barata.</p>
<p>Para quem está quitando a fatura do cartão, a comparação que importa é outra: quanto a dívida custaria se ficasse onde está. No rotativo, taxas acima de 10% ao mês são comuns; nesse caso, um empréstimo de R$ 2.000 a 2,5% ou 3,5% ao mês, com parcelas fixas, reduz bastante o custo, desde que o cartão não volte a acumular saldo.</p>`;
  },
  prazoTitulo: 'O prazo certo para R$ 2.000',
  prazoTexto: (k) => `<p>Com R$ 2.000, 12 meses costumam ser um bom ponto de equilíbrio. Em 6 meses a parcela a 2,5% ao mês sobe para ${b(k.P(6))}, o que nem sempre cabe; em 18 meses cai para ${b(k.P(18))}, mas os juros já chegam a ${b(k.J(18))}. Acima de 24 meses, a redução da parcela fica pequena: de 36 para 48 meses ela cai só ${b(k.P(36) - k.P(48))}, enquanto os juros aumentam ${b(k.J(48) - k.J(36))}.</p>
<p>Se a sua renda varia, uma estratégia é escolher um prazo um pouco maior por segurança e antecipar parcelas nos meses bons. Antecipar dá desconto dos juros; a calculadora de <a href="/quitar-emprestimo-antecipado/">quitação antecipada</a> mostra quanto.</p>`,
  extraTitulo: 'Antes de assinar',
  extra: () => `<ul>
<li>Pergunte o valor exato que vai cair na conta. Se for menor que R$ 2.000, a diferença é IOF, tarifa ou seguro, e o custo real sobe.</li>
<li>Veja se há seguro prestamista incluído e se ele é opcional.</li>
<li>Confira se a parcela bate com a taxa anunciada no <a href="/simulador-emprestimo/">simulador de empréstimo</a>.</li>
<li>Some a nova parcela às que você já paga e veja se o total cabe com folga no mês.</li>
<li>Leia como funciona a quitação antecipada: o contrato deve explicar como pedir o saldo devedor com desconto dos juros.</li>
<li>Nunca deposite dinheiro para “liberar” o empréstimo: isso é golpe.</li>
</ul>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de R$ 2.000 em 12x?', `A 2,5% ao mês, 12 parcelas de ${b(k.P(12))}, somando ${b(k.T(12))}. A 3,5% ao mês, ${b(k.P(12, 0.035))}; a 5% ao mês, ${b(k.P(12, 0.05))}.`],
    ['E em 24 vezes, quanto fica a parcela de 2 mil?', `A 2,5% ao mês, ${b(k.P(24))}, com ${b(k.J(24))} de juros no total. A 1,5% ao mês, ${b(k.P(24, 0.015))}.`],
    ['Vale a pena trocar a fatura do cartão por um empréstimo de R$ 2.000?', 'Pode valer, se o CET do empréstimo for menor que o custo do rotativo ou do parcelamento da fatura e se você parar de usar o cartão até zerar a dívida.'],
    ['Qual renda é preciso ter para um empréstimo de 2 mil?', `Não há um número único: cada instituição faz a própria análise. Uma referência prática é que todas as parcelas somadas não passem de 30% da renda. A parcela de ${b(k.P(12))} (12 meses a 2,5% ao mês) fica dentro desse limite a partir de uma renda de cerca de ${b(k.P(12) / 0.3)}.`],
    ['Quanto fica um empréstimo de 2 mil em 36 meses?', `A 2,5% ao mês, ${b(k.P(36))} por mês, mas os juros chegam a ${b(k.J(36))}, ${p(k.J(36) / 2000, 0)} do valor emprestado. Em prazos assim, compare com cuidado o total pago.`],
    ['Onde pegar um empréstimo de R$ 2.000?', 'Este site não oferece nem intermedia crédito. Peça propostas em instituições autorizadas, compare o CET e desconfie de quem cobra qualquer valor antecipado.']
  ]
});

/* =================== R$ 3.000 =================== */

const tresMil = pagina({
  v: 3000, prazo: 18,
  title: 'Empréstimo de R$ 3.000: tabela de parcelas e juros',
  description: (k) => `Tabela do empréstimo de R$ 3.000 de 6 a 60 meses: a 2,5% ao mês, 18x de ${b(k.P(18))}. Compare taxas de 1,5% a 5% e simule a sua proposta.`,
  h1: 'Empréstimo de 3.000 reais: parcelas em 6 a 60 meses',
  lead: 'Tabela pronta com a parcela e o total de um empréstimo de R$ 3 mil em sete prazos e quatro taxas, mais uma calculadora para testar a sua proposta.',
  tabelaTitulo: 'Parcelas de um empréstimo de R$ 3.000',
  intro: (k) => `Em 18 meses a 2,5% ao mês, R$ 3.000 viram parcelas de <strong>${b(k.P(18))}</strong> e um total de ${b(k.T(18))}. Para outras combinações, procure na tabela a linha do prazo e a coluna da taxa: o primeiro número é a parcela e o segundo, menor e em cinza, é quanto você terá pago no fim.`,
  usosTitulo: 'Empréstimo de R$ 3.000: consumo ou investimento?',
  usos: () => `<p>Três mil reais estão numa faixa em que o motivo do empréstimo faz muita diferença. Um curso que melhora a sua renda, uma ferramenta de trabalho, um notebook para quem trabalha em casa ou um tratamento de saúde que não pode esperar têm um retorno, financeiro ou não, que ajuda a justificar os juros. Já uma viagem ou um celular novo são consumo: dá para fazer, mas o custo extra precisa ser visto com clareza.</p>
<p>Uma pergunta simples ajuda a decidir: daqui a um ano e meio, quando a última parcela vencer, o que você comprou ainda vai trazer algum benefício? Se a resposta for sim, a dívida tem mais chance de valer a pena.</p>`,
  jurosTitulo: 'O custo de R$ 3.000 em números',
  juros: (k) => `<p>A 2,5% ao mês, os juros de R$ 3.000 vão de ${b(k.J(6))} em 6 meses a ${b(k.J(60))} em 60 meses. Em 18 meses, prazo comum para esse valor, são ${b(k.J(18))}, ou ${p(k.J(18) / 3000, 0)} do que você pegou. Se a proposta vier a 3,5% ao mês, os mesmos 18 meses custam ${b(k.J(18, 0.035))} de juros: ${b(k.J(18, 0.035) - k.J(18))} a mais por um ponto a mais na taxa.</p>
<p>Por isso vale pesquisar. Neste exemplo, um ponto percentual ao mês pesa mais no bolso do que passar de 12 para 18 parcelas, que acrescenta ${b(k.J(18) - k.J(12))} de juros.</p>`,
  prazoTitulo: 'Quanto pedir e em quanto tempo pagar',
  prazoTexto: (k) => `<p>Antes de definir o prazo, reveja o valor. Se você precisa de R$ 2.500 e pede R$ 3.000 “por garantia”, paga juros sobre dinheiro que talvez nem use. Cada R$ 500 a menos, a 2,5% ao mês em 18 meses, economiza ${b(C.price(500, 0.025, 18).juros)} de juros e reduz a parcela em ${b(C.price(500, 0.025, 18).parcela)}.</p>
<p>Quanto ao prazo, entre 12 e 24 meses costuma ser uma faixa equilibrada para R$ 3.000: a parcela fica entre ${b(k.P(24))} e ${b(k.P(12))} a 2,5% ao mês, e os juros não passam de ${b(k.J(24))}. A partir de 36 meses a parcela continua caindo, mas os juros sobem muito mais rápido do que o alívio mensal.</p>
<p>Se a sua renda for variável, simule também a 3,5% ao mês para ter uma margem de segurança: em 18 meses, a parcela seria ${b(k.P(18, 0.035))}, ${b(k.P(18, 0.035) - k.P(18))} a mais por mês do que a 2,5%.</p>`,
  extraTitulo: 'Como comparar propostas de R$ 3.000',
  extra: () => `<p>Quando duas instituições oferecem R$ 3.000, as propostas raramente vêm no mesmo formato: uma destaca a parcela, outra a taxa, outra o prazo. Para comparar de verdade, coloque as duas no mesmo valor e prazo e olhe três números: a parcela, o total pago e o <a href="/o-que-e-cet/">CET</a>. Se uma delas só informa a parcela, descubra a taxa embutida na calculadora de <a href="/descobrir-taxa-de-juros/">taxa de juros</a>.</p>
<p>Na comparação de <a href="/emprestimo-pessoal-ou-consignado/">empréstimo pessoal ou consignado</a> você põe duas ofertas lado a lado e vê, em reais, quanto uma custa a mais que a outra.</p>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de R$ 3.000 em 18 meses?', `A 2,5% ao mês, ${b(k.P(18))} por mês e ${b(k.T(18))} no total. A 1,5% ao mês, ${b(k.P(18, 0.015))}; a 5% ao mês, ${b(k.P(18, 0.05))}.`],
    ['Quanto é a parcela de 3 mil em 12 vezes?', `${b(k.P(12, 0.015))} a 1,5% ao mês, ${b(k.P(12))} a 2,5%, ${b(k.P(12, 0.035))} a 3,5% e ${b(k.P(12, 0.05))} a 5% ao mês, sem IOF e tarifas.`],
    ['Quanto de juros pago em R$ 3.000 em 24 meses?', `A 2,5% ao mês, ${b(k.J(24))}. A 5% ao mês, ${b(k.J(24, 0.05))}, ou ${p(k.J(24, 0.05) / 3000, 0)} do valor emprestado.`],
    ['É melhor pegar R$ 3.000 em 12 ou 24 meses?', `Em 12 meses você paga menos juros (${b(k.J(12))} contra ${b(k.J(24))} a 2,5% ao mês), mas a parcela é maior. Escolha o menor prazo com parcela que caiba com folga.`],
    ['Vale a pena pegar R$ 3.000 para fazer um curso?', 'Pode valer se o curso tiver boa chance de aumentar a sua renda e a parcela couber no orçamento enquanto o retorno não chega. Compare também com o parcelamento direto com a escola, que às vezes não tem juros.'],
    ['A parcela da proposta veio maior que a da tabela. Por quê?', 'A tabela considera só os juros. A proposta inclui IOF e pode ter tarifas e seguros. Informe o valor que vai cair na conta e a parcela na calculadora de CET para ver o custo real.']
  ]
});

/* =================== R$ 5.000 =================== */

const cincoMil = pagina({
  v: 5000, prazo: 24,
  title: 'Empréstimo de 5 mil reais: quanto fica a parcela?',
  description: (k) => `Empréstimo de 5 mil: a 2,5% ao mês, 24x de ${b(k.P(24))} ou 12x de ${b(k.P(12))}. Veja a tabela de 6 a 60 meses e simule com a sua taxa. Grátis.`,
  h1: 'Empréstimo de R$ 5.000: parcelas, juros e prazos',
  lead: 'Quanto fica um empréstimo de 5 mil reais em 6, 12, 24 ou 60 meses? Veja a tabela com quatro taxas e simule a sua proposta logo abaixo.',
  tabelaTitulo: 'Tabela do empréstimo de R$ 5.000',
  intro: (k) => `Um empréstimo de R$ 5.000 a 2,5% ao mês em 24 meses tem parcela de <strong>${b(k.P(24))}</strong> e custa ${b(k.T(24))} no total. A tabela abaixo mostra o mesmo valor em sete prazos e quatro taxas mensais; o número de cima é a parcela, o de baixo, o total pago.`,
  usosTitulo: 'Usos comuns de um empréstimo de R$ 5.000',
  usos: () => `<p>Cinco mil reais já resolvem problemas maiores: uma pequena reforma, como trocar o piso de um cômodo ou refazer a parte elétrica, a compra de equipamentos para trabalhar por conta própria, um tratamento odontológico ou a reunião de várias dívidas pequenas em uma só. Este último uso, a consolidação de dívidas, é um dos que mais fazem sentido, desde que o novo empréstimo custe menos que as dívidas que ele substitui.</p>
<p>Para consolidar, liste cada dívida com o saldo e a taxa mensal. Se a soma dá perto de R$ 5.000 e boa parte está no rotativo, no cheque especial ou em parcelamentos caros, trocar tudo por uma parcela fixa com taxa menor reduz os juros e simplifica a vida. Se as dívidas atuais já têm taxas parecidas com a do novo empréstimo, a troca só alonga o prazo.</p>`,
  jurosTitulo: 'Quanto R$ 5.000 custam em juros',
  juros: (k) => `<p>Aqui o prazo começa a pesar de verdade. A 2,5% ao mês, os juros são ${b(k.J(12))} em 12 meses, ${b(k.J(24))} em 24 e ${b(k.J(48))} em 48 meses. Em quatro anos, você devolveria ${b(k.T(48))}, ou ${p(k.J(48) / 5000, 0)} a mais do que pegou. A 5% ao mês e 60 meses, os juros chegariam a ${b(k.J(60, 0.05))}, mais que o dobro do valor emprestado.</p>
<p>Em compensação, a parcela não cai na mesma proporção. Passar de 24 para 48 meses reduz a parcela de ${b(k.P(24))} para ${b(k.P(48))}, uma economia de ${b(k.P(24) - k.P(48))} por mês, mas acrescenta ${b(k.J(48) - k.J(24))} de juros ao contrato.</p>`,
  prazoTitulo: 'Como encaixar R$ 5.000 no orçamento',
  prazoTexto: (k) => {
    const n = prazoQueCabe(5000, 400);
    return `<p>Uma referência prática é manter todas as parcelas somadas abaixo de 30% da renda líquida. Com uma renda de R$ 3.000, por exemplo, sobram até R$ 900 para dívidas. Se você já paga R$ 500 de outras parcelas, a nova deveria ficar abaixo de R$ 400, o que, a 2,5% ao mês, pede um prazo de pelo menos ${n} meses para R$ 5.000 (parcela de ${b(k.P(n))}).</p>
<p>Se a parcela de 24 meses cabe com folga, prefira-a às de 36 ou 48. E se no meio do caminho entrar um dinheiro extra, como o 13º ou uma restituição, use-o para antecipar as últimas parcelas: são elas que dão o maior desconto de juros.</p>`;
  },
  extraTitulo: 'Empréstimo ou parcelar a compra?',
  extra: () => `<p>Se os R$ 5.000 são para comprar algo específico, compare o empréstimo com o parcelamento oferecido pela própria loja. Às vezes o parcelado no cartão sem juros sai mais barato; outras vezes há um desconto à vista que, mesmo somado aos juros do empréstimo, ainda compensa. Calcule a taxa embutida no parcelado em <a href="/juros-parcelamento/">juros no parcelamento</a> ou no <a href="/juros-crediario/">crediário</a> e compare com a taxa do empréstimo.</p>
<p>Lembre também que o empréstimo cai na conta antes da compra, e é fácil o dinheiro “sumir” em outras despesas. Se for usá-lo para uma compra, faça-a logo.</p>`,
  faq: (k) => [
    ['Quanto fica a parcela de um empréstimo de 5 mil em 24x?', `A 2,5% ao mês, ${b(k.P(24))}, com total de ${b(k.T(24))}. A 1,5% ao mês, ${b(k.P(24, 0.015))}; a 5% ao mês, ${b(k.P(24, 0.05))}.`],
    ['Quanto fica R$ 5.000 em 12 vezes?', `${b(k.P(12))} por mês a 2,5% ao mês, somando ${b(k.T(12))}. Os valores são só dos juros, sem IOF nem tarifas.`],
    ['Quanto pago de juros em R$ 5.000 em 48 meses?', `A 2,5% ao mês, ${b(k.J(48))}. A 1,5% ao mês, ${b(k.J(48, 0.015))}. Em prazos longos, a taxa pesa muito no custo final.`],
    ['Dá para pagar R$ 5.000 em 60 vezes?', `Algumas linhas permitem, mas o custo sobe muito: a 2,5% ao mês, a parcela seria ${b(k.P(60))} e os juros somariam ${b(k.J(60))}, ${p(k.J(60) / 5000, 0)} do valor emprestado.`],
    ['Vale a pena juntar dívidas em um empréstimo de R$ 5.000?', 'Vale quando o novo empréstimo tem CET menor que o das dívidas atuais e você não volta a usar os limites caros. Se as taxas forem parecidas, a troca só alonga o prazo.'],
    ['Qual renda é preciso ter para um empréstimo de R$ 5.000?', `Cada instituição tem os próprios critérios. Como referência, a parcela de ${b(k.P(24))} (24 meses a 2,5% ao mês) cabe em 30% de uma renda de cerca de ${b(k.P(24) / 0.3)}, se não houver outras dívidas.`]
  ]
});

/* =================== R$ 10.000 =================== */

const dezMil = pagina({
  v: 10000, prazo: 24,
  title: 'Empréstimo de 10 mil reais: parcelas e juros totais',
  description: (k) => `Quanto fica um empréstimo de 10 mil? A 2,5% ao mês, 24x de ${b(k.P(24))} e ${b(k.J(24))} de juros. Tabela de 6 a 60 meses e simulador.`,
  h1: 'Empréstimo de R$ 10.000: quanto fica a parcela',
  lead: 'Simule um empréstimo de 10 mil reais e veja na tabela a parcela e o total em sete prazos, com juros de 1,5% a 5% ao mês.',
  tabelaTitulo: 'Parcelas e total de R$ 10.000',
  intro: (k) => `A 2,5% ao mês, um empréstimo de R$ 10.000 em 24 meses fica em <strong>${b(k.P(24))}</strong> por mês, e o total pago chega a ${b(k.T(24))}. Use a tabela para comparar prazos (linhas) e taxas (colunas). Em cada célula, a parcela vem primeiro e o total devolvido logo abaixo.`,
  usosTitulo: 'O que se faz com R$ 10.000',
  usos: () => `<p>Dez mil reais costumam ir para planos de médio porte: a reforma de um banheiro ou de uma cozinha, a entrada de um carro, o estoque ou os equipamentos de um pequeno negócio, a quitação de um conjunto de dívidas maiores ou uma despesa de saúde. Nesse valor, a modalidade de crédito escolhida faz tanta diferença quanto o prazo.</p>
<p>Se o dinheiro é para comprar um carro, o financiamento de veículo, que usa o próprio carro como garantia, costuma ter taxas menores que o empréstimo pessoal; veja o <a href="/simulador-financiamento-carro/">simulador de financiamento de carro</a>. Para quem tem desconto em folha ou no benefício, o consignado também tende a custar menos. O empréstimo pessoal sem garantia é o mais flexível, mas normalmente o mais caro dos três.</p>`,
  jurosTitulo: 'A taxa decide o custo de R$ 10.000',
  juros: (k) => {
    const dif = k.J(24, 0.05) - k.J(24, 0.015);
    return `<p>Com R$ 10.000, cada ponto de taxa vira centenas ou milhares de reais. Em 24 meses, os juros são ${b(k.J(24, 0.015))} a 1,5% ao mês, ${b(k.J(24))} a 2,5%, ${b(k.J(24, 0.035))} a 3,5% e ${b(k.J(24, 0.05))} a 5% ao mês. Entre a menor e a maior taxa da tabela, a diferença é de ${b(dif)}, ou ${p(dif / 10000, 0)} do valor emprestado.</p>
<p>Esse é o principal motivo para pedir mais de uma proposta antes de fechar. Uma diferença de taxa que parece pequena no papel, como 2,5% contra 3,5% ao mês, representa ${b(k.J(24, 0.035) - k.J(24))} a mais em 24 meses.</p>`;
  },
  prazoTitulo: 'Qual prazo escolher para R$ 10.000',
  prazoTexto: (k) => `<p>Prazos de 24 a 36 meses são os mais procurados para esse valor. A 2,5% ao mês, a parcela cai de ${b(k.P(24))} para ${b(k.P(36))} ao passar de 24 para 36 meses, e os juros sobem de ${b(k.J(24))} para ${b(k.J(36))}. Em 60 meses a parcela vai a ${b(k.P(60))}, mas os juros se aproximam do próprio valor emprestado: ${b(k.J(60))}.</p>
<p>Em 48 meses, prazo que também aparece bastante, a parcela a 2,5% ao mês é ${b(k.P(48))} e os juros, ${b(k.J(48))}. Comparado com 24 meses, você paga ${b(k.J(48) - k.J(24))} a mais para reduzir a parcela em ${b(k.P(24) - k.P(48))}.</p>
<p>Uma boa prática é simular o prazo mais curto que cabe no orçamento e depois um prazo um pouco maior, para ter margem. Se escolher o maior, combine com você mesmo antecipar parcelas quando sobrar dinheiro. Na Price, antecipar as últimas parcelas dá o maior desconto; no simulador acima você também pode ver como o SAC reduz os juros.</p>`,
  extraTitulo: 'Checklist para uma proposta de R$ 10.000',
  extra: () => `<ul>
<li><strong>Valor líquido:</strong> quanto vai cair na conta depois de IOF, tarifas e seguros?</li>
<li><strong>CET anual:</strong> é o número que permite comparar com outras ofertas.</li>
<li><strong>Seguro:</strong> está incluído? É opcional? Quanto encarece a parcela?</li>
<li><strong>Quitação antecipada:</strong> como pedir o saldo devedor? O desconto dos juros é um direito seu.</li>
<li><strong>Parcela no orçamento:</strong> somada às outras dívidas, continua abaixo de 30% da renda?</li>
</ul>
<p>Se tiver duas propostas na mão, compare-as lado a lado em <a href="/emprestimo-pessoal-ou-consignado/">empréstimo pessoal ou consignado</a>.</p>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de R$ 10.000 em 24 meses?', `A 2,5% ao mês, ${b(k.P(24))} por mês e ${b(k.T(24))} no total. A 1,5% ao mês, ${b(k.P(24, 0.015))}; a 5% ao mês, ${b(k.P(24, 0.05))}.`],
    ['Qual a parcela de 10 mil em 36 vezes?', `${b(k.P(36, 0.015))} a 1,5% ao mês, ${b(k.P(36))} a 2,5%, ${b(k.P(36, 0.035))} a 3,5% e ${b(k.P(36, 0.05))} a 5% ao mês.`],
    ['Quanto de juros pago em um empréstimo de 10 mil em 60 meses?', `A 2,5% ao mês, ${b(k.J(60))}. A 5% ao mês, ${b(k.J(60, 0.05))}, mais que o dobro do valor emprestado.`],
    ['Qual a parcela de R$ 10.000 em 48 meses?', `${b(k.P(48, 0.015))} a 1,5% ao mês, ${b(k.P(48))} a 2,5%, ${b(k.P(48, 0.035))} a 3,5% e ${b(k.P(48, 0.05))} a 5% ao mês, sem IOF e tarifas.`],
    ['É melhor financiar o carro ou pegar um empréstimo de R$ 10.000?', 'Para comprar um carro, o financiamento de veículo costuma ter taxa menor, porque o carro fica como garantia. Compare o CET das duas opções para o mesmo valor e prazo.'],
    ['Como saber se a taxa da proposta de R$ 10.000 está certa?', 'Informe o valor, a parcela e o prazo na calculadora de descobrir taxa de juros. Se a taxa encontrada for maior que a anunciada, há IOF, tarifas ou seguros embutidos.']
  ]
});

/* =================== R$ 15.000 =================== */

const quinzeMil = pagina({
  v: 15000, prazo: 36,
  title: 'Empréstimo de 15 mil reais: tabela de parcelas',
  description: (k) => `Empréstimo de R$ 15.000: a 2,5% ao mês, 36x de ${b(k.P(36))}. Tabela com parcela e total de 6 a 60 meses, taxas de 1,5% a 5% e simulador.`,
  h1: 'Empréstimo de R$ 15.000: parcelas e custo total',
  lead: 'Veja quanto fica a parcela de um empréstimo de 15 mil reais em 6 a 60 meses, quanto disso é juros e como reduzir o custo do contrato.',
  tabelaTitulo: 'Quanto fica um empréstimo de R$ 15.000',
  intro: (k) => `A 2,5% ao mês e em 36 meses, R$ 15.000 resultam em parcelas de <strong>${b(k.P(36))}</strong> e em um total de ${b(k.T(36))}. Na tabela, escolha a linha do prazo e a coluna da taxa da sua proposta: em cima, a parcela; embaixo, tudo o que você terá pago.`,
  usosTitulo: 'Quando faz sentido um empréstimo de R$ 15.000',
  usos: () => `<p>R$ 15.000 é um valor que geralmente tem destino definido: a reforma de vários cômodos, a compra de um carro usado mais simples, a festa de casamento, um curso de especialização ou a quitação de uma dívida grande e cara. Como o contrato tende a durar dois a três anos, a pergunta mais importante é se a sua renda vai continuar igual durante todo esse tempo.</p>
<p>Planos com data marcada, como um casamento ou uma reforma, às vezes permitem uma combinação: juntar parte do valor nos meses anteriores e financiar só o restante. Pegar R$ 10.000 em vez de R$ 15.000, na mesma taxa de 2,5% ao mês e 36 meses, economiza ${b(C.price(15000, 0.025, 36).juros - C.price(10000, 0.025, 36).juros)} de juros.</p>`,
  jurosTitulo: 'Juros de R$ 15.000 por prazo',
  juros: (k) => {
    const l1 = k.r(36).linhas[0];
    return `<p>A 2,5% ao mês, os juros de R$ 15.000 somam ${b(k.J(12))} em 12 meses, ${b(k.J(24))} em 24, ${b(k.J(36))} em 36 e ${b(k.J(48))} em 48 meses. Em três anos você paga, só de juros, ${p(k.J(36) / 15000, 0)} do valor recebido. A 1,5% ao mês, os mesmos 36 meses custariam ${b(k.J(36, 0.015))}, ${b(k.J(36) - k.J(36, 0.015))} a menos.</p>
<p>O peso dos juros dentro da parcela também muda com o tempo. No primeiro mês, a 2,5%, ${b(l1.juros)} da parcela de ${b(k.P(36))} são juros, e só ${b(l1.amort)} abatem a dívida. É por isso que, no começo do contrato, o saldo devedor cai tão devagar.</p>`;
  },
  prazoTitulo: 'Prazo para R$ 15.000: 24, 36 ou 48 meses?',
  prazoTexto: (k) => `<p>A 2,5% ao mês, a parcela é ${b(k.P(24))} em 24 meses, ${b(k.P(36))} em 36 e ${b(k.P(48))} em 48. Do primeiro para o último prazo, a parcela cai ${b(k.P(24) - k.P(48))}, e os juros aumentam ${b(k.J(48) - k.J(24))}. Cada real de alívio mensal sai caro: em 48 meses, os juros chegam a ${p(k.J(48) / 15000, 0)} do valor emprestado.</p>
<p>Se a dúvida é entre 36 e 48 meses, uma alternativa é ficar com 36 e se programar para antecipar parcelas com o 13º ou outras entradas extras. Você mantém uma parcela que cabe e ainda reduz os juros. A conta do desconto está em <a href="/quitar-emprestimo-antecipado/">quitar empréstimo antecipado</a>.</p>`,
  extraTitulo: 'Crédito com garantia e outras alternativas',
  extra: () => `<p>A partir de valores como R$ 15.000, algumas pessoas consideram o empréstimo com garantia, em que um veículo ou imóvel quitado fica alienado até o fim do contrato. A taxa costuma ser menor que a do empréstimo pessoal, mas o risco também muda: se as parcelas não forem pagas, o bem pode ser tomado. Só faz sentido para quem tem segurança da renda.</p>
<p>Para quem não tem pressa, outra alternativa é o consórcio, que não cobra juros, mas tem taxa de administração e não tem data certa para liberar o crédito. Seja qual for a escolha, compare sempre o custo total e o <a href="/o-que-e-cet/">CET</a>.</p>
<p>Se a ideia for trocar dívidas caras por uma só, liste o saldo e a taxa de cada uma antes. Se a maior parte estiver no rotativo ou no cheque especial, um empréstimo de R$ 15.000 com CET menor pode reduzir bastante o custo, desde que os limites não voltem a ser usados.</p>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de R$ 15.000 em 36 meses?', `A 2,5% ao mês, ${b(k.P(36))} por mês e ${b(k.T(36))} no total. A 1,5% ao mês, ${b(k.P(36, 0.015))}; a 5% ao mês, ${b(k.P(36, 0.05))}.`],
    ['Qual a parcela de 15 mil em 24 vezes?', `A 2,5% ao mês, ${b(k.P(24))}. A 3,5% ao mês, ${b(k.P(24, 0.035))}. Os valores não incluem IOF nem tarifas.`],
    ['Quanto pago de juros em 15 mil em 48 meses?', `${b(k.J(48))} a 2,5% ao mês, ou ${b(k.J(48, 0.05))} a 5% ao mês.`],
    ['Quanto fica R$ 15.000 em 60 meses?', `A 2,5% ao mês, ${b(k.P(60))} por mês, com ${b(k.J(60))} de juros, ${p(k.J(60) / 15000, 0)} do valor emprestado. A 1,5% ao mês, a parcela seria ${b(k.P(60, 0.015))}.`],
    ['Empréstimo com garantia é mais barato?', 'Costuma ter taxa menor, porque o bem dado em garantia reduz o risco para quem empresta. Em compensação, você pode perder o bem se não pagar. Compare o CET e avalie a estabilidade da sua renda.'],
    ['Posso quitar o empréstimo de R$ 15.000 antes?', 'Sim. Ao quitar ou antecipar parcelas, você tem direito ao desconto proporcional dos juros. Peça o saldo devedor atualizado à instituição.']
  ]
});

/* =================== R$ 20.000 =================== */

const vinteMil = pagina({
  v: 20000, prazo: 36,
  title: 'Empréstimo de 20 mil: quanto fica a parcela',
  description: (k) => `Empréstimo de R$ 20.000 a 2,5% ao mês: 36x de ${b(k.P(36))} ou 48x de ${b(k.P(48))}. Tabela de 6 a 60 meses com 4 taxas e simulador grátis.`,
  h1: 'Empréstimo de R$ 20.000: tabela de parcelas e juros',
  lead: 'Quanto custa um empréstimo de 20 mil reais? Compare prazos de 6 a 60 meses e taxas de 1,5% a 5% ao mês e simule a sua proposta.',
  tabelaTitulo: 'Tabela de parcelas para R$ 20.000',
  intro: (k) => `Com R$ 20.000 a 2,5% ao mês, a parcela fica em <strong>${b(k.P(36))}</strong> em 36 meses e em ${b(k.P(48))} em 48 meses. Cada célula da tabela traz a parcela em destaque e, abaixo, o total que você terá desembolsado até o fim do contrato.`,
  usosTitulo: 'R$ 20.000 para um negócio, uma reforma ou um carro',
  usos: (k) => `<p>Com vinte mil reais muita gente pensa em investir no próprio trabalho: comprar uma máquina, montar um ponto de venda, reformar o espaço de atendimento ou reforçar o estoque. Nesses casos, o teste é financeiro: o que o dinheiro vai gerar por mês precisa pagar a parcela e ainda sobrar. Se o investimento aumenta o lucro em R$ 1.500 por mês, uma parcela de ${b(k.P(36))} é sustentável; se o retorno é incerto, o risco fica todo com você.</p>
<p>Para uso pessoal, R$ 20.000 aparecem em reformas maiores, na compra de um carro ou na quitação de um financiamento mais caro. No caso do carro, simule também o <a href="/simulador-financiamento-carro/">financiamento de veículo</a>, que tem o próprio bem como garantia e costuma ter taxa menor que o empréstimo pessoal.</p>`,
  jurosTitulo: 'Os juros de R$ 20.000',
  juros: (k) => {
    const L = k.r(36).linhas.slice(0, 12);
    const j12 = L.reduce((s, l) => s + l.juros, 0), a12 = L.reduce((s, l) => s + l.amort, 0);
    return `<p>A 2,5% ao mês, os juros de R$ 20.000 são ${b(k.J(24))} em 24 meses, ${b(k.J(36))} em 36 e ${b(k.J(48))} em 48 meses. Em 60 meses, ${b(k.J(60))}: perto do valor emprestado de novo. Na taxa de 5% ao mês, o mesmo prazo de 60 meses levaria os juros a ${b(k.J(60, 0.05))}, mais que o dobro do valor original.</p>
<p>Vale olhar o primeiro ano com atenção. Nos 12 primeiros meses de um contrato de 36 meses a 2,5%, ${j12 > a12 ? 'a maior parte' : 'boa parte'} do que você paga é juros: ${b(j12)} de juros contra ${b(a12)} de amortização. Quem pensa em quitar antes economiza mais se fizer isso cedo.</p>`;
  },
  prazoTitulo: 'Escolhendo o prazo para R$ 20.000',
  prazoTexto: (k) => {
    const n700 = prazoQueCabe(20000, 700);
    return `<p>Uma forma prática de decidir é partir da parcela que cabe. Se você tem R$ 1.000 por mês disponíveis com folga, a 2,5% ao mês a parcela de 24 meses (${b(k.P(24))}) passa do limite e a de 36 meses (${b(k.P(36))}) encaixa. Com R$ 700, seria preciso ir a ${n700} meses (${b(k.P(n700))}), e talvez seja o caso de pedir um valor menor.</p>
<p>Se o contrato oferecer a opção, compare também o SAC no simulador acima: a primeira parcela é maior, mas a dívida cai mais rápido e os juros totais diminuem. Para R$ 20.000 em 36 meses a 2,5% ao mês, a economia de juros do SAC seria de ${b(k.J(36) - C.sac(20000, 0.025, 36).juros)}.</p>`;
  },
  extraTitulo: 'Cuidados com valores mais altos',
  extra: () => `<ul>
<li>Desconfie de ofertas que chegam por mensagem ou ligação com condições muito melhores que as do mercado, principalmente se pedirem pagamento antecipado.</li>
<li>Leia o contrato inteiro: multa por atraso, seguros incluídos, regras de quitação antecipada.</li>
<li>Confirme o CET anual e compare com pelo menos outras duas propostas.</li>
<li>Se o dinheiro for para um negócio, faça uma projeção simples de quanto ele vai gerar por mês antes de assinar.</li>
<li>Se for para quitar outra dívida, peça antes o saldo devedor dela com desconto dos juros; talvez você precise de menos do que imagina.</li>
<li>Guarde as propostas e o contrato assinado; você vai precisar deles para pedir a quitação ou contestar cobranças.</li>
</ul>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de 20 mil em 36 vezes?', `A 2,5% ao mês, ${b(k.P(36))} por mês, somando ${b(k.T(36))}. A 1,5% ao mês, ${b(k.P(36, 0.015))}; a 5% ao mês, ${b(k.P(36, 0.05))}.`],
    ['Quanto fica R$ 20.000 em 48 meses?', `${b(k.P(48))} a 2,5% ao mês, com ${b(k.J(48))} de juros. A 3,5% ao mês, ${b(k.P(48, 0.035))}.`],
    ['Quanto pago de juros em R$ 20.000 em 60 meses?', `${b(k.J(60))} a 2,5% ao mês e ${b(k.J(60, 0.015))} a 1,5% ao mês. Prazos longos aumentam muito o custo.`],
    ['Qual renda é preciso ter para um empréstimo de R$ 20.000?', `Cada instituição usa os próprios critérios. Como referência, para a parcela de ${b(k.P(36))} (36 meses a 2,5% ao mês) ocupar até 30% da renda, a renda líquida seria de cerca de ${b(k.P(36) / 0.3)}.`],
    ['Vale a pena pegar R$ 20.000 para investir no negócio?', 'Só se o retorno mensal esperado for maior que a parcela, com margem para imprevistos. As parcelas vencem mesmo que o negócio demore a dar resultado.'],
    ['SAC ou Price em um empréstimo de 20 mil?', `O SAC tem parcelas maiores no início e menos juros no total; a Price tem parcela fixa. Em 36 meses a 2,5% ao mês, o SAC economizaria ${b(k.J(36) - C.sac(20000, 0.025, 36).juros)} de juros. Nem toda instituição oferece SAC em empréstimo pessoal.`]
  ]
});

/* =================== R$ 30.000 =================== */

const trintaMil = pagina({
  v: 30000, prazo: 48,
  title: 'Empréstimo de 30 mil reais: parcelas e juros',
  description: (k) => `Empréstimo de 30 mil reais: a 2,5% ao mês, 48x de ${b(k.P(48))} e ${b(k.J(48))} de juros. Compare 7 prazos e 4 taxas na tabela e simule.`,
  h1: 'Empréstimo de R$ 30.000: quanto fica a parcela',
  lead: 'Parcelas e total pago de um empréstimo de 30 mil reais em sete prazos e quatro taxas, com exemplos e dicas para não pagar juros demais.',
  tabelaTitulo: 'Parcelas de um empréstimo de R$ 30.000',
  intro: (k) => `Pegando R$ 30.000 a 2,5% ao mês em 48 meses, a parcela é de <strong>${b(k.P(48))}</strong> e o total devolvido, ${b(k.T(48))}. Em cada linha da tabela está um prazo; em cada coluna, uma taxa mensal. O valor em negrito é a parcela, e o de baixo, o total pago.`,
  usosTitulo: 'Para que servem R$ 30.000',
  usos: () => `<p>Trinta mil reais costumam financiar mudanças grandes: a compra de um carro, a reforma completa de um apartamento, a ampliação de uma casa, a reorganização de várias dívidas de uma vez ou o capital inicial de um negócio. São projetos que mexem com a vida por quatro ou cinco anos, o tempo típico desse contrato.</p>
<p>Nesse valor, vale sempre perguntar se existe uma linha de crédito específica para o objetivo: para um carro, o financiamento de veículo; para uma reforma com imóvel próprio, o crédito com garantia do imóvel; para quem tem desconto em folha, o consignado. Linhas específicas ou com garantia costumam custar menos que o empréstimo pessoal sem garantia, e em R$ 30.000 a diferença chega fácil a alguns milhares de reais.</p>`,
  jurosTitulo: 'Os juros de R$ 30.000 em quatro anos',
  juros: (k) => {
    const dif = k.J(48, 0.035) - k.J(48, 0.015);
    return `<p>Em 48 meses a 2,5% ao mês, os juros somam ${b(k.J(48))}, ou ${p(k.J(48) / 30000, 0)} do valor emprestado. A 1,5% ao mês, seriam ${b(k.J(48, 0.015))}; a 3,5%, ${b(k.J(48, 0.035))}. A diferença entre essas duas taxas, no mesmo prazo, é de ${b(dif)}, o equivalente a ${p(dif / 30000, 0)} do valor que você pegou.</p>
<p>Por isso, em valores como este, negociar a taxa vale mais do que qualquer ajuste de prazo. Leve as propostas que já tem para a instituição em que você é cliente e pergunte se ela consegue oferecer um custo menor.</p>`;
  },
  prazoTitulo: '36, 48 ou 60 meses?',
  prazoTexto: (k) => `<p>A 2,5% ao mês, R$ 30.000 dão parcelas de ${b(k.P(36))} em 36 meses, ${b(k.P(48))} em 48 e ${b(k.P(60))} em 60 meses. Ir de 36 para 60 meses alivia ${b(k.P(36) - k.P(60))} por mês, mas soma ${b(k.J(60) - k.J(36))} de juros ao contrato. Se o orçamento só fecha com 60 meses, considere pedir um valor menor ou adiar parte do projeto.</p>
<p>Em contratos longos, pense nos imprevistos: mudança de emprego, um filho, uma doença. Uma parcela que hoje ocupa 25% da renda pode pesar muito mais daqui a dois anos. Deixe folga e mantenha uma reserva de emergência separada do dinheiro do empréstimo.</p>`,
  extraTitulo: 'Simule o pior cenário antes de assinar',
  extra: () => `<p>Antes de fechar um contrato de R$ 30.000, simule três situações no <a href="/simulador-emprestimo/">simulador de empréstimo</a>: a proposta que você recebeu, a mesma proposta com taxa um ponto maior, caso o custo real seja mais alto do que parece, e o prazo que você realmente gostaria de ter. Se a parcela do pior cenário ainda couber, você tem margem.</p>
<p>Depois, confira o custo efetivo informando o valor líquido e a parcela na calculadora de <a href="/o-que-e-cet/">CET</a>. Em contratos desse tamanho, um seguro embutido pode somar centenas ou milhares de reais ao custo final.</p>
<p>Se o projeto puder ser dividido em etapas, como uma reforma feita cômodo por cômodo, pegar o crédito em partes menores pode reduzir os juros, porque você só paga juros sobre o dinheiro que realmente está usando.</p>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de 30 mil em 48 meses?', `A 2,5% ao mês, ${b(k.P(48))} por mês e ${b(k.T(48))} no total. A 1,5% ao mês, ${b(k.P(48, 0.015))}; a 5% ao mês, ${b(k.P(48, 0.05))}.`],
    ['Qual a parcela de R$ 30.000 em 60 vezes?', `${b(k.P(60, 0.015))} a 1,5% ao mês, ${b(k.P(60))} a 2,5%, ${b(k.P(60, 0.035))} a 3,5% e ${b(k.P(60, 0.05))} a 5% ao mês.`],
    ['Quanto pago de juros em 30 mil em 36 meses?', `A 2,5% ao mês, ${b(k.J(36))}. A 1,5% ao mês, ${b(k.J(36, 0.015))}.`],
    ['Quanto fica R$ 30.000 em 24 meses?', `A 2,5% ao mês, ${b(k.P(24))} por mês e ${b(k.J(24))} de juros, ${p(k.J(24) / k.J(48), 0)} dos juros que você pagaria em 48 meses (${b(k.J(48))}).`],
    ['Qual renda é preciso ter para um empréstimo de R$ 30.000?', `Depende dos critérios de cada instituição. Como referência, para a parcela de ${b(k.P(48))} (48 meses a 2,5% ao mês) ficar em 30% da renda, a renda líquida seria de cerca de ${b(k.P(48) / 0.3)}, sem outras dívidas.`],
    ['Empréstimo de 30 mil: pessoal ou com garantia?', 'O crédito com garantia de veículo ou imóvel costuma ter taxa menor, mas o bem pode ser perdido se as parcelas não forem pagas. O pessoal é mais caro e não envolve garantia. Compare o CET das duas opções.']
  ]
});

/* =================== R$ 50.000 =================== */

const cinquentaMil = pagina({
  v: 50000, prazo: 60,
  title: 'Empréstimo de 50 mil reais: quanto fica a parcela',
  description: (k) => `Empréstimo de R$ 50.000: a 2,5% ao mês, 60x de ${b(k.P(60))}. Veja parcelas e total de 6 a 60 meses, compare taxas e conheça alternativas.`,
  h1: 'Empréstimo de R$ 50.000: parcelas, juros e alternativas',
  lead: 'Veja a parcela e o total de um empréstimo de 50 mil reais em 6 a 60 meses e entenda quando outra modalidade pode custar menos.',
  tabelaTitulo: 'Tabela do empréstimo de R$ 50.000',
  intro: (k) => `A 2,5% ao mês em 60 meses, um empréstimo de R$ 50.000 tem parcela de <strong>${b(k.P(60))}</strong> e total de ${b(k.T(60))}. A tabela traz as combinações de sete prazos e quatro taxas mensais; o número de cima é a parcela e o de baixo, o total pago.`,
  usosTitulo: 'R$ 50.000: um valor que pede planejamento',
  usos: () => `<p>Cinquenta mil reais é dinheiro de projeto grande: a compra de um carro novo, a construção de um cômodo, a quitação de um financiamento caro, a abertura ou expansão de uma empresa. Também aparece como complemento para a entrada de um imóvel, e aí é preciso cuidado: somar a parcela de um empréstimo à de um financiamento imobiliário pode comprometer o orçamento por muitos anos. Veja o <a href="/financiamento-imobiliario/">simulador de financiamento imobiliário</a> antes de decidir.</p>
<p>Em valores desse porte, o empréstimo pessoal sem garantia raramente é a linha mais barata. Financiamento específico do bem, crédito com garantia de imóvel ou veículo e consignado costumam ter custo menor. Peça propostas em mais de uma modalidade e compare pelo <a href="/o-que-e-cet/">CET</a>.</p>
<p>Antes de pedir, escreva o orçamento do projeto em detalhes. Em obras e negócios é comum o custo final passar do previsto; contar com uma folga no planejamento evita ter de pegar um segundo empréstimo no meio do caminho, quase sempre em condições piores.</p>`,
  jurosTitulo: 'Quanto custam R$ 50.000 em juros',
  juros: (k) => {
    const dif = k.J(60, 0.05) - k.J(60, 0.015);
    return `<p>Em 60 meses a 2,5% ao mês, os juros chegam a ${b(k.J(60))}, perto do valor emprestado. A 5% ao mês, no mesmo prazo, seriam ${b(k.J(60, 0.05))}: você devolveria ${b(k.T(60, 0.05))}, ${f(k.T(60, 0.05) / 50000, 1)} vezes o que recebeu. Já a 1,5% ao mês, os juros ficariam em ${b(k.J(60, 0.015))}. Entre a menor e a maior taxa da tabela, a diferença passa de R$ ${C.fmt(Math.floor(dif / 10000) * 10, 0)} mil em cinco anos.</p>
<p>Um custo desse tamanho justifica tempo de pesquisa. Reduzir a taxa de 2,5% para 2% ao mês, por exemplo, economizaria ${b(k.J(60) - k.J(60, 0.02))} em 60 meses.</p>`;
  },
  prazoTitulo: 'O prazo de um empréstimo de R$ 50.000',
  prazoTexto: (k) => `<p>Muita gente escolhe 60 meses porque é a parcela que cabe: ${b(k.P(60))} a 2,5% ao mês, contra ${b(k.P(36))} em 36 meses e ${b(k.P(24))} em 24. Se o orçamento permite 48 meses (${b(k.P(48))}), a economia em relação a 60 meses é de ${b(k.J(60) - k.J(48))} de juros.</p>
<p>Uma estratégia comum em contratos grandes é escolher um prazo confortável e amortizar sempre que entrar dinheiro extra. Cada antecipação reduz o saldo e corta os juros dos meses seguintes. Para saber quanto custa antecipar as últimas parcelas, use a calculadora de <a href="/quitar-emprestimo-antecipado/">quitação antecipada</a>.</p>
<p>Se a instituição oferecer SAC, compare no simulador acima: em 60 meses a 2,5% ao mês, a 1ª parcela do SAC seria ${b(C.sac(50000, 0.025, 60).primeira)}, bem acima da parcela da Price, mas os juros totais cairiam para ${b(C.sac(50000, 0.025, 60).juros)}.</p>`,
  extraTitulo: 'Alternativas ao empréstimo de R$ 50.000',
  extra: () => `<ul>
<li><strong>Financiamento do bem:</strong> para carro, moto ou imóvel, o financiamento específico costuma ter taxa menor. Compare no <a href="/simulador-financiamento-carro/">simulador de carro</a>.</li>
<li><strong>Crédito com garantia:</strong> taxa menor em troca de deixar um imóvel ou veículo como garantia, com o risco de perdê-lo se não pagar.</li>
<li><strong>Consórcio:</strong> sem juros, com taxa de administração e sem data certa para receber o crédito.</li>
<li><strong>Juntar parte do valor:</strong> pegar R$ 30.000 em vez de R$ 50.000, na mesma taxa de 2,5% ao mês e 60 meses, economiza ${b(C.price(50000, 0.025, 60).juros - C.price(30000, 0.025, 60).juros)} de juros.</li>
</ul>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de 50 mil em 60 meses?', `A 2,5% ao mês, ${b(k.P(60))} por mês e ${b(k.T(60))} no total. A 1,5% ao mês, ${b(k.P(60, 0.015))}; a 5% ao mês, ${b(k.P(60, 0.05))}.`],
    ['Qual a parcela de R$ 50.000 em 48 vezes?', `${b(k.P(48, 0.015))} a 1,5% ao mês, ${b(k.P(48))} a 2,5%, ${b(k.P(48, 0.035))} a 3,5% e ${b(k.P(48, 0.05))} a 5% ao mês.`],
    ['Quanto pago de juros em 50 mil em 36 meses?', `A 2,5% ao mês, ${b(k.J(36))}; a 1,5% ao mês, ${b(k.J(36, 0.015))}.`],
    ['Qual renda é preciso ter para um empréstimo de 50 mil?', `Depende da análise de cada instituição. Como referência, a parcela de ${b(k.P(60))} (60 meses a 2,5% ao mês) caberia em 30% de uma renda líquida de cerca de ${b(k.P(60) / 0.3)}, sem outras dívidas.`],
    ['Empréstimo ou financiamento para R$ 50.000?', 'Se o dinheiro é para comprar um bem, o financiamento específico costuma ter taxa menor que o empréstimo pessoal. Compare o CET das duas propostas para o mesmo prazo.'],
    ['Posso amortizar um empréstimo de R$ 50.000?', 'Sim. Antecipar parcelas ou amortizar o saldo dá direito ao desconto proporcional dos juros. Em contratos longos, isso pode economizar milhares de reais.']
  ]
});

/* =================== R$ 500 =================== */

const quinhentos = pagina({
  v: 500, prazo: 6,
  title: 'Empréstimo de 500 reais: quanto fica a parcela',
  description: (k) => `Empréstimo de R$ 500: a 2,5% ao mês, 6x de ${b(k.P(6))} ou 12x de ${b(k.P(12))}. Tabela de 6 a 60 meses, juros de 1,5% a 5% e saídas sem juros.`,
  h1: 'Empréstimo de R$ 500: parcelas e quanto você devolve',
  lead: 'Quanto fica um empréstimo de 500 reais em 6 ou 12 vezes? Veja a tabela pronta, quanto disso é juros e as saídas mais baratas para um valor tão pequeno.',
  tabelaTitulo: 'Tabela de parcelas para R$ 500',
  intro: (k) => `Pegando R$ 500 a 2,5% ao mês em 6 meses, a parcela fica em <strong>${b(k.P(6))}</strong> e o total devolvido, em ${b(k.T(6))}. Na tabela, cada linha é um prazo e cada coluna uma taxa mensal; o número de cima é a parcela e o de baixo, o total pago. Os prazos acima de 12 meses aparecem só para comparação: para um valor desse tamanho, quase nunca valem a pena.`,
  usosTitulo: 'Quando R$ 500 fazem falta',
  usos: () => `<p>Quinhentos reais costumam faltar no fim do mês: a conta de luz ou de água que venceu, o botijão de gás, um remédio, o conserto da bicicleta ou da moto de quem trabalha com entregas. São gastos urgentes, mas pequenos, e é aí que mora o risco: as linhas mais fáceis de contratar para valores baixos estão entre as mais caras do mercado, e a pressa leva a aceitar a primeira oferta.</p>
<p>Para R$ 500, vale esgotar as saídas sem juros antes de pegar crédito: negociar o parcelamento direto com a empresa da conta atrasada, pagar o conserto no cartão em duas ou três vezes sem juros, vender algo parado em casa ou pedir um adiantamento a quem paga o seu salário. Se nada disso resolver, o empréstimo pode ser a saída, desde que o prazo seja curto e você saiba exatamente quanto vai devolver.</p>`,
  jurosTitulo: 'Quanto custam R$ 500 em juros',
  juros: (k) => `<p>Em reais, os juros de R$ 500 parecem pouco: a 2,5% ao mês, ${b(k.J(6))} em 6 meses e ${b(k.J(12))} em 12 meses. Mas a proporção é a mesma de qualquer empréstimo. Numa linha cara, de 5% ao mês, os mesmos 12 meses custam ${b(k.J(12, 0.05))}, ou ${p(k.J(12, 0.05) / 500, 0)} do valor que você pegou.</p>
<p>O problema maior dos valores pequenos são as tarifas. Uma tarifa fixa de R$ 50, por exemplo, é 10% de um empréstimo de R$ 500, mas só 1% de um de R$ 5.000. Por isso o custo real de empréstimos pequenos costuma ficar bem acima da taxa de juros anunciada. Pergunte quanto vai cair na conta e confira o custo na calculadora de <a href="/o-que-e-cet/">CET</a>.</p>`,
  prazoTitulo: 'Qual prazo escolher para R$ 500',
  prazoTexto: (k) => `<p>Com R$ 500, a regra é simples: o menor prazo cuja parcela caiba no orçamento. A 2,5% ao mês, a parcela de 6 meses é ${b(k.P(6))} e a de 12 meses, ${b(k.P(12))}. Esticar para 12 meses alivia ${b(k.P(6) - k.P(12))} por mês, mas soma ${b(k.J(12) - k.J(6))} de juros ao contrato.</p>
<p>Acima de 12 meses, a parcela quase não cai: em 24 meses seria ${b(k.P(24))}, só ${b(k.P(12) - k.P(24))} a menos que em 12, enquanto os juros chegariam a ${b(k.J(24))}. Se sobrar dinheiro antes do fim, antecipe as últimas parcelas para ganhar o desconto dos juros; a calculadora de <a href="/quitar-emprestimo-antecipado/">quitação antecipada</a> mostra quanto.</p>`,
  extraTitulo: 'Cheque especial, rotativo ou empréstimo?',
  extra: () => `<p>Para cobrir R$ 500 por poucos dias, o cheque especial e o rotativo do cartão estão à mão, mas são das linhas mais caras que existem. Se o buraco durar meses, os juros compostos crescem rápido; veja a simulação em <a href="/juros-cartao-de-credito/">juros do cartão de crédito</a>. Um empréstimo com parcelas fixas tem data para acabar e custo conhecido desde o começo.</p>
<p>Desconfie de ofertas de crédito fácil que chegam por mensagem ou rede social, principalmente as que pedem um depósito para “liberar” o dinheiro: isso é golpe. Instituições autorizadas descontam tarifas do valor liberado ou as incluem no contrato; nunca pedem pagamento antecipado.</p>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de R$ 500 em 6 vezes?', `A 2,5% ao mês, 6 parcelas de ${b(k.P(6))}, somando ${b(k.T(6))}. A 1,5% ao mês, ${b(k.P(6, 0.015))}; a 5% ao mês, ${b(k.P(6, 0.05))}. Os valores não incluem IOF nem tarifas.`],
    ['E em 12 vezes, quanto fica a parcela de 500 reais?', `A 2,5% ao mês, ${b(k.P(12))} por mês e ${b(k.J(12))} de juros no total. A 5% ao mês, a parcela sobe para ${b(k.P(12, 0.05))}.`],
    ['Quanto pago de juros em um empréstimo de 500 reais?', `Depende da taxa e do prazo. Em 6 meses, de ${b(k.J(6, 0.015))} (a 1,5% ao mês) a ${b(k.J(6, 0.05))} (a 5% ao mês). Em 12 meses, de ${b(k.J(12, 0.015))} a ${b(k.J(12, 0.05))}.`],
    ['Vale a pena pegar R$ 500 em 24 meses?', `Quase nunca. A 2,5% ao mês, a parcela cairia de ${b(k.P(12))} (12 meses) para ${b(k.P(24))}, só ${b(k.P(12) - k.P(24))} a menos por mês, e os juros subiriam de ${b(k.J(12))} para ${b(k.J(24))}.`],
    ['Por que o custo real de um empréstimo pequeno é mais alto?', 'Porque tarifas e seguros cobrados em valor fixo pesam mais em porcentagem quando o valor emprestado é pequeno. Compare sempre pelo CET, que soma juros, IOF, tarifas e seguros.'],
    ['Este site empresta R$ 500?', 'Não. O site é só uma calculadora gratuita. Não oferecemos nem intermediamos crédito e não temos vínculo com bancos, financeiras ou órgãos públicos.']
  ]
});

/* =================== R$ 4.000 =================== */

const quatroMil = pagina({
  v: 4000, prazo: 12,
  title: 'Empréstimo de 4 mil reais: parcelas e juros',
  description: (k) => `Empréstimo de R$ 4.000: a 2,5% ao mês, 12x de ${b(k.P(12))} ou 24x de ${b(k.P(24))}. Tabela de 6 a 60 meses com 4 taxas e simulador grátis, sem cadastro.`,
  h1: 'Empréstimo de R$ 4.000: quanto fica e quanto custa',
  lead: 'Quanto fica a parcela de um empréstimo de 4 mil reais em cada prazo, quanto você devolve no total e como comparar propostas para esse valor.',
  tabelaTitulo: 'Quanto fica um empréstimo de R$ 4.000',
  intro: (k) => `R$ 4.000 em 12 meses a 2,5% ao mês dão parcelas de <strong>${b(k.P(12))}</strong> e um total de ${b(k.T(12))}. Na tabela, procure a linha do prazo e a coluna da taxa mensal: o número de cima é a parcela e o de baixo, o total pago até a última parcela.`,
  usosTitulo: 'Para que serve um empréstimo de R$ 4.000',
  usos: () => `<p>Quatro mil reais ficam entre a emergência e o projeto. Pagam o conserto mais caro do carro, a troca da geladeira e do fogão de uma vez, a caução e a mudança para uma casa nova, o enxoval de um bebê ou a quitação de uma fatura de cartão que saiu do controle. Também é um valor comum para quem quer começar um pequeno negócio em casa, como comprar uma máquina de costura profissional ou equipamentos de cozinha para vender comida.</p>
<p>No caso do negócio, faça uma conta antes: quanto ele precisa render por mês para pagar a parcela? Se a resposta depender de vendas que ainda não existem, comece com um valor menor ou com um prazo que deixe folga nos primeiros meses.</p>`,
  jurosTitulo: 'Quanto de juros em R$ 4.000',
  juros: (k) => `<p>A 2,5% ao mês, os juros de R$ 4.000 são ${b(k.J(12))} em 12 meses, ${b(k.J(24))} em 24 e ${b(k.J(36))} em 36 meses: em três anos, você devolveria ${p(k.J(36) / 4000, 0)} a mais do que pegou. A taxa pesa tanto quanto o prazo. Em 12 meses, passar de 2,5% para 3,5% ao mês acrescenta ${b(k.J(12, 0.035) - k.J(12))} de juros; de 3,5% para 5%, mais ${b(k.J(12, 0.05) - k.J(12, 0.035))}.</p>
<p>Para quem vai usar o dinheiro para quitar a fatura do cartão, a conta que importa é o custo de deixar a dívida onde está. No rotativo, taxas acima de 10% ao mês são comuns; trocar por um empréstimo a 2,5% ou 3,5% ao mês, com parcelas fixas, reduz bastante os juros, desde que o cartão não volte a acumular saldo.</p>`,
  prazoTitulo: 'Qual prazo escolher para R$ 4.000',
  prazoTexto: (k) => {
    const n = prazoQueCabe(4000, 300);
    return `<p>Para R$ 4.000, prazos entre 12 e 24 meses costumam equilibrar parcela e custo. A 2,5% ao mês, a parcela vai de ${b(k.P(12))} em 12 meses a ${b(k.P(24))} em 24, e os juros, de ${b(k.J(12))} a ${b(k.J(24))}. Acima disso, o alívio mensal diminui: passar de 36 para 48 meses reduz a parcela em só ${b(k.P(36) - k.P(48))}, mas acrescenta ${b(k.J(48) - k.J(36))} de juros.</p>
<p>Se o orçamento só aguenta uma parcela de até R$ 300, a 2,5% ao mês o menor prazo que cabe é de ${n} meses (parcela de ${b(k.P(n))}). Nesse caso, considere pedir um valor menor ou juntar parte do dinheiro antes, em vez de alongar ainda mais o contrato.</p>`;
  },
  extraTitulo: 'Como comparar duas propostas de R$ 4.000',
  extra: () => `<p>As propostas raramente vêm no mesmo formato: uma destaca a parcela, outra a taxa, outra o prazo. Para comparar, coloque as duas no mesmo valor e prazo e olhe a parcela, o total pago e o <a href="/o-que-e-cet/">CET</a>. Se uma oferta só informa a parcela, descubra a taxa embutida em <a href="/descobrir-taxa-de-juros/">descobrir a taxa de juros</a>.</p>
<ul>
<li>Pergunte quanto vai cair na conta. Se for menos de R$ 4.000, a diferença é IOF, tarifa ou seguro.</li>
<li>Veja se o seguro prestamista é opcional.</li>
<li>Some a nova parcela às que você já paga e confira se o total cabe com folga.</li>
<li>Nunca pague nada antecipado para “liberar” o crédito: isso é golpe.</li>
</ul>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de R$ 4.000 em 12x?', `A 2,5% ao mês, ${b(k.P(12))} por mês e ${b(k.T(12))} no total. A 1,5% ao mês, ${b(k.P(12, 0.015))}; a 5% ao mês, ${b(k.P(12, 0.05))}.`],
    ['Quanto é a parcela de 4 mil em 24 vezes?', `${b(k.P(24, 0.015))} a 1,5% ao mês, ${b(k.P(24))} a 2,5%, ${b(k.P(24, 0.035))} a 3,5% e ${b(k.P(24, 0.05))} a 5% ao mês, sem IOF e tarifas.`],
    ['Quanto pago de juros em R$ 4.000 em 18 meses?', `A 2,5% ao mês, ${b(k.J(18))}. A 5% ao mês, ${b(k.J(18, 0.05))}.`],
    ['É melhor pegar R$ 4.000 em 12 ou 24 meses?', `Em 12 meses você paga ${b(k.J(12))} de juros a 2,5% ao mês; em 24, ${b(k.J(24))}. Escolha o menor prazo com parcela que caiba com folga.`],
    ['Qual renda é preciso ter para um empréstimo de 4 mil?', `Cada instituição tem os próprios critérios. Como referência, a parcela de ${b(k.P(12))} (12 meses a 2,5% ao mês) cabe em 30% de uma renda de cerca de ${b(k.P(12) / 0.3)}, sem outras dívidas.`],
    ['Este site empresta R$ 4.000?', 'Não. O site é só uma calculadora gratuita. Não oferecemos nem intermediamos crédito e não temos vínculo com bancos, financeiras ou órgãos públicos.']
  ]
});

/* =================== R$ 8.000 =================== */

const oitoMil = pagina({
  v: 8000, prazo: 36,
  title: 'Empréstimo de 8 mil reais: tabela de parcelas',
  description: (k) => `Empréstimo de R$ 8.000: a 2,5% ao mês, 36x de ${b(k.P(36))} ou 24x de ${b(k.P(24))}. Veja parcelas e juros de 6 a 60 meses e simule a sua proposta grátis.`,
  h1: 'Empréstimo de R$ 8.000: parcelas, juros e prazos',
  lead: 'Tabela pronta com a parcela e o total de um empréstimo de 8 mil reais em sete prazos e quatro taxas, mais uma calculadora para testar a sua proposta.',
  tabelaTitulo: 'Parcelas de um empréstimo de R$ 8.000',
  intro: (k) => `Em 36 meses a 2,5% ao mês, R$ 8.000 viram parcelas de <strong>${b(k.P(36))}</strong> e um total de ${b(k.T(36))}. A tabela mostra o mesmo valor em sete prazos e quatro taxas: em cima, a parcela; embaixo, o total que você terá pago no fim.`,
  usosTitulo: 'O que costuma caber em R$ 8.000',
  usos: () => `<p>Oito mil reais pagam uma reforma de banheiro ou de cozinha, a entrada de uma moto, móveis planejados simples, uma cirurgia ou um tratamento dentário maior, ou a reunião de várias dívidas espalhadas em cartões e crediários. Para obras, orce com folga: é comum o custo final passar do previsto, e pegar um segundo empréstimo no meio do caminho quase sempre sai mais caro.</p>
<p>Se a ideia é juntar dívidas, liste cada uma com o saldo e a taxa mensal. A troca só compensa se o novo empréstimo tiver CET menor que o das dívidas atuais e se você não voltar a usar os limites que acabou de zerar.</p>`,
  jurosTitulo: 'Quanto R$ 8.000 custam em juros',
  juros: (k) => `<p>A 2,5% ao mês, os juros são ${b(k.J(12))} em 12 meses, ${b(k.J(24))} em 24 e ${b(k.J(36))} em 36 meses. Em 48 meses chegam a ${b(k.J(48))}, ${p(k.J(48) / 8000, 0)} do valor emprestado. A 5% ao mês, os mesmos 36 meses custariam ${b(k.J(36, 0.05))}: você devolveria ${b(k.T(36, 0.05))} por R$ 8.000.</p>
<p>Em valores assim, cada ponto de taxa conta. Em 36 meses, conseguir 2,5% em vez de 3,5% ao mês economiza ${b(k.J(36, 0.035) - k.J(36))} de juros, ou ${b(k.P(36, 0.035) - k.P(36))} a menos em cada parcela.</p>`,
  prazoTitulo: 'O prazo certo para R$ 8.000',
  prazoTexto: (k) => `<p>Em 36 meses, a parcela a 2,5% ao mês fica em ${b(k.P(36))}. Se o orçamento permitir 24 meses, ela sobe para ${b(k.P(24))}, mas os juros caem ${b(k.J(36) - k.J(24))}. Acima de 48 meses, a parcela quase não cai: de 48 para 60 meses, são só ${b(k.P(48) - k.P(60))} a menos por mês, com ${b(k.J(60) - k.J(48))} a mais de juros.</p>
<p>Uma estratégia comum é escolher um prazo confortável e antecipar parcelas sempre que entrar um dinheiro extra, como o 13º ou as férias. Cada antecipação dá desconto dos juros; a calculadora de <a href="/quitar-emprestimo-antecipado/">quitação antecipada</a> mostra quanto você economiza.</p>`,
  extraTitulo: 'Empréstimo, financiamento ou crediário?',
  extra: () => `<p>Se os R$ 8.000 são para comprar um bem específico, compare o empréstimo com o financiamento ou o crediário da própria loja. Para moto, o financiamento costuma ter taxa menor; veja o <a href="/simulador-financiamento-moto/">simulador de financiamento de moto</a>. Para móveis e eletrodomésticos, calcule a taxa embutida do carnê em <a href="/juros-crediario/">juros do crediário</a> e compare com a do empréstimo.</p>
<p>Pergunte também o preço à vista. Um desconto de 10% numa compra de R$ 8.000 são R$ 800, e às vezes esse desconto paga boa parte dos juros de um empréstimo curto.</p>
<p>Por fim, antes de assinar, peça o valor exato que vai cair na conta e confira se a parcela da proposta bate com a taxa anunciada no <a href="/simulador-emprestimo/">simulador de empréstimo</a>. Se a parcela vier maior, a diferença é IOF, tarifa ou seguro, e o custo real do contrato sobe.</p>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de 8 mil em 36 meses?', `A 2,5% ao mês, ${b(k.P(36))} por mês e ${b(k.T(36))} no total. A 1,5% ao mês, ${b(k.P(36, 0.015))}; a 5% ao mês, ${b(k.P(36, 0.05))}.`],
    ['Qual a parcela de R$ 8.000 em 24 vezes?', `${b(k.P(24, 0.015))} a 1,5% ao mês, ${b(k.P(24))} a 2,5%, ${b(k.P(24, 0.035))} a 3,5% e ${b(k.P(24, 0.05))} a 5% ao mês.`],
    ['Quanto pago de juros em 8 mil em 48 meses?', `A 2,5% ao mês, ${b(k.J(48))}; a 1,5% ao mês, ${b(k.J(48, 0.015))}.`],
    ['Quanto fica R$ 8.000 em 12 vezes?', `A 2,5% ao mês, ${b(k.P(12))} por mês, com ${b(k.J(12))} de juros no total. A 5% ao mês, ${b(k.P(12, 0.05))}.`],
    ['Qual renda é preciso ter para um empréstimo de R$ 8.000?', `Cada instituição tem os próprios critérios. Como referência, a parcela de ${b(k.P(36))} (36 meses a 2,5% ao mês) cabe em 30% de uma renda líquida de cerca de ${b(k.P(36) / 0.3)}, sem outras dívidas.`],
    ['Vale a pena juntar dívidas em um empréstimo de R$ 8.000?', 'Vale quando o CET do novo empréstimo é menor que o das dívidas atuais e você para de usar os limites caros. Se as taxas forem parecidas, a troca só alonga o prazo.']
  ]
});

/* =================== R$ 100.000 =================== */

const cemMil = pagina({
  v: 100000, prazo: 60,
  title: 'Empréstimo de 100 mil reais: parcelas e alternativas',
  description: (k) => `Empréstimo de R$ 100 mil: a 2,5% ao mês, 60x de ${b(k.P(60))}. Parcelas e juros de 6 a 60 meses e quando a garantia ou o financiamento custam menos.`,
  h1: 'Empréstimo de R$ 100.000: parcelas, juros e alternativas',
  lead: 'Veja a parcela e o total de um empréstimo de 100 mil reais em 6 a 60 meses e compare com as modalidades que costumam ter juros menores para esse valor.',
  tabelaTitulo: 'Tabela do empréstimo de R$ 100.000',
  intro: (k) => `A 2,5% ao mês em 60 meses, R$ 100.000 viram parcelas de <strong>${b(k.P(60))}</strong> e um total de ${b(k.T(60))}. A tabela traz sete prazos e quatro taxas mensais; o número de cima é a parcela e o de baixo, o total pago. Nas linhas com garantia, as taxas costumam ser menores e os prazos, mais longos: teste essas condições na calculadora acima.`,
  usosTitulo: 'Cem mil reais: para que e de onde',
  usos: () => `<p>Cem mil reais é dinheiro de decisão grande: construir ou terminar uma casa, comprar um carro zero, quitar um financiamento caro, abrir ou expandir uma empresa, ou completar a entrada de um imóvel. Nesse tamanho, o empréstimo pessoal sem garantia raramente é a opção mais barata, e muitas instituições nem oferecem esse valor sem garantia.</p>
<p>As modalidades mais comuns para R$ 100 mil são o crédito com garantia de imóvel, o crédito com garantia de veículo, o financiamento específico do bem e, para empresas, as linhas de capital de giro. Cada uma tem prazo e custo diferentes. Peça propostas em mais de uma e compare pelo <a href="/o-que-e-cet/">CET</a>, sempre no mesmo prazo.</p>`,
  jurosTitulo: 'Quanto custam R$ 100.000 em juros',
  juros: (k) => {
    const g120 = C.price(100000, 0.012, 120), g60 = C.price(100000, 0.012, 60);
    return `<p>Em 60 meses a 2,5% ao mês, os juros somam ${b(k.J(60))}: você devolveria ${b(k.T(60))}, ${f(k.T(60) / 100000, 1)} vezes o valor recebido. A 1,5% ao mês, no mesmo prazo, os juros cairiam para ${b(k.J(60, 0.015))}. Meio ponto de taxa vale muito dinheiro: de 2% para 1,5% ao mês, em 60 meses, a economia é de ${b(k.J(60, 0.02) - k.J(60, 0.015))}.</p>
<p>Com garantia de imóvel, prazos de 120 meses ou mais são comuns. Eles reduzem a parcela, mas multiplicam os juros. Por exemplo, a 1,2% ao mês, R$ 100.000 em 120 meses dão parcelas de ${b(g120.parcela)} e ${b(g120.juros)} de juros; em 60 meses, na mesma taxa, a parcela seria ${b(g60.parcela)} e os juros, ${b(g60.juros)}.</p>`;
  },
  prazoTitulo: 'Price ou SAC em R$ 100.000',
  prazoTexto: (k) => {
    const s = C.sac(100000, 0.025, 60);
    return `<p>Em contratos grandes, o sistema de amortização faz diferença. Na Price as parcelas são iguais; no SAC começam mais altas e diminuem todo mês. A 2,5% ao mês em 60 meses, a 1ª parcela do SAC seria ${b(s.primeira)}, contra ${b(k.P(60))} da Price, mas os juros totais cairiam de ${b(k.J(60))} para ${b(s.juros)}. Compare os dois sistemas no simulador acima ou em <a href="/price-ou-sac/">Price ou SAC</a>.</p>
<p>Em qualquer sistema, amortizar quando entra dinheiro extra corta os juros dos meses seguintes. Em valores desse porte, uma única antecipação pode economizar milhares de reais; simule em <a href="/quitar-emprestimo-antecipado/">quitação antecipada</a>.</p>`;
  },
  extraTitulo: 'Antes de pegar R$ 100.000',
  extra: () => `<ul>
<li><strong>Garantia é risco:</strong> no crédito com garantia de imóvel ou veículo, o bem pode ser perdido se as parcelas não forem pagas. Só use a garantia se a parcela couber com folga, mesmo num mês ruim.</li>
<li><strong>Financiamento do bem:</strong> para comprar imóvel, carro ou moto, o financiamento específico costuma ter taxa menor. Veja o <a href="/financiamento-imobiliario/">simulador de financiamento imobiliário</a> e o <a href="/simulador-financiamento-carro/">de carro</a>.</li>
<li><strong>Consórcio:</strong> sem juros, com taxa de administração e sem data certa para receber o crédito.</li>
<li><strong>Valor menor:</strong> pegar R$ 70.000 em vez de R$ 100.000, a 2,5% ao mês em 60 meses, economiza ${b(C.price(100000, 0.025, 60).juros - C.price(70000, 0.025, 60).juros)} de juros.</li>
<li><strong>Custos extras:</strong> com garantia de imóvel há avaliação do bem, registro em cartório e seguros. Inclua tudo no CET antes de comparar.</li>
</ul>`,
  faq: (k) => [
    ['Quanto fica um empréstimo de 100 mil em 60 meses?', `A 2,5% ao mês, ${b(k.P(60))} por mês e ${b(k.T(60))} no total. A 1,5% ao mês, ${b(k.P(60, 0.015))}; a 5% ao mês, ${b(k.P(60, 0.05))}.`],
    ['Qual a parcela de R$ 100.000 em 48 vezes?', `${b(k.P(48, 0.015))} a 1,5% ao mês, ${b(k.P(48))} a 2,5%, ${b(k.P(48, 0.035))} a 3,5% e ${b(k.P(48, 0.05))} a 5% ao mês.`],
    ['Quanto pago de juros em 100 mil em 36 meses?', `A 2,5% ao mês, ${b(k.J(36))}; a 1,5% ao mês, ${b(k.J(36, 0.015))}.`],
    ['Qual renda é preciso ter para um empréstimo de 100 mil?', `Depende da análise de cada instituição. Como referência, a parcela de ${b(k.P(60))} (60 meses a 2,5% ao mês) caberia em 30% de uma renda líquida de cerca de ${b(k.P(60) / 0.3)}, sem outras dívidas.`],
    ['Dá para pegar R$ 100.000 sem garantia?', 'Algumas instituições oferecem para quem tem renda alta e bom histórico, mas a taxa tende a ser maior. Com garantia de imóvel ou veículo a taxa costuma cair, em troca do risco de perder o bem.'],
    ['Este site empresta R$ 100.000?', 'Não. O site é só uma calculadora gratuita. Não oferecemos nem intermediamos crédito e não temos vínculo com bancos, financeiras ou órgãos públicos.']
  ]
});

const paginas = [quinhentos, mil, doisMil, tresMil, quatroMil, cincoMil, oitoMil, dezMil, quinzeMil, vinteMil, trintaMil, cinquentaMil, cemMil];

module.exports = { paginas, VALORES: paginas.map((x) => Number(x.slug.match(/\d+/)[0])) };
