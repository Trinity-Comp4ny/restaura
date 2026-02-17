/**
 * Utilitários para lógica financeira de cartões e parcelas
 */

export interface CartaoCredito {
  id: string
  nome: string
  banco: string
  ultimosDigitos: string
  limite: number
  diaVencimento: number
  diaFechamento: number
  isCorporativo: boolean
  contaFatura: string
  isPadrao: boolean
  ativo: boolean
}

export interface TransacaoParcelada {
  id: string
  descricao: string
  valorTotal: number
  valorParcela: number
  totalParcelas: number
  parcelaAtual: number
  dataCompra: Date
  dataPrimeiraParcela: Date
  cartaoId: string
  status: 'ativa' | 'concluida' | 'cancelada'
}

export interface Fatura {
  id: string
  cartaoId: string
  mes: string // '2024-01'
  dataAbertura: Date
  dataFechamento: Date
  dataVencimento: Date
  valorTotal: number
  valorAberto: number
  transacoes: TransacaoParcelada[]
}

/**
 * Calcula data de vencimento da fatura baseado na data da compra
 */
export function calcularDataVencimentoFatura(
  cartao: CartaoCredito,
  dataCompra: Date
): Date {
  const diaCompra = dataCompra.getDate()
  const mes = dataCompra.getMonth()
  const ano = dataCompra.getFullYear()
  
  // Se compra for depois do fechamento, vai para a próxima fatura
  if (diaCompra > cartao.diaFechamento) {
    // Próximo mês
    return new Date(ano, mes + 1, cartao.diaVencimento)
  } else {
    // Mesma fatura
    return new Date(ano, mes, cartao.diaVencimento)
  }
}

/**
 * Calcula período da fatura (abertura e fechamento)
 */
export function calcularPeriodoFatura(
  cartao: CartaoCredito,
  mesAno: string // '2024-01'
): { abertura: Date; fechamento: Date; vencimento: Date } {
  const [ano, mes] = mesAno.split('-').map(Number)
  
  const abertura = new Date(ano, mes - 1, cartao.diaFechamento + 1)
  const fechamento = new Date(ano, mes, cartao.diaFechamento)
  const vencimento = new Date(ano, mes, cartao.diaVencimento)
  
  // Ajuste para meses com menos dias
  if (fechamento.getDate() !== cartao.diaFechamento) {
    fechamento.setDate(0) // Último dia do mês
  }
  
  if (vencimento.getDate() !== cartao.diaVencimento) {
    vencimento.setDate(0) // Último dia do mês
  }
  
  return { abertura, fechamento, vencimento }
}

/**
 * Verifica se uma compra entra na fatura atual ou próxima
 */
export function verificarFaturaDaCompra(
  cartao: CartaoCredito,
  dataCompra: Date
): { faturaMes: string; isProximaFatura: boolean } {
  const diaCompra = dataCompra.getDate()
  const mes = dataCompra.getMonth()
  const ano = dataCompra.getFullYear()
  
  if (diaCompra > cartao.diaFechamento) {
    // Próxima fatura
    const proximoMes = mes + 1 === 12 ? 0 : mes + 1
    const proximoAno = mes + 1 === 12 ? ano + 1 : ano
    return {
      faturaMes: `${proximoAno}-${String(proximoMes + 1).padStart(2, '0')}`,
      isProximaFatura: true
    }
  } else {
    // Fatura atual
    return {
      faturaMes: `${ano}-${String(mes + 1).padStart(2, '0')}`,
      isProximaFatura: false
    }
  }
}

/**
 * Calcula limite disponível do cartão
 */
export function calcularLimiteDisponivel(
  cartao: CartaoCredito,
  faturaAtual: number,
  parcelasFuturas: number
): {
  limiteTotal: number
  limiteUtilizado: number
  limiteDisponivel: number
  percentualUtilizado: number
} {
  const limiteUtilizado = faturaAtual + parcelasFuturas
  const limiteDisponivel = cartao.limite - limiteUtilizado
  const percentualUtilizado = (limiteUtilizado / cartao.limite) * 100
  
  return {
    limiteTotal: cartao.limite,
    limiteUtilizado,
    limiteDisponivel,
    percentualUtilizado
  }
}

/**
 * Gera datas das parcelas
 */
export function gerarDatasParcelas(
  dataPrimeiraParcela: Date,
  totalParcelas: number
): Date[] {
  const datas: Date[] = []
  
  for (let i = 0; i < totalParcelas; i++) {
    const dataParcela = new Date(dataPrimeiraParcela)
    dataParcela.setMonth(dataParcela.getMonth() + i)
    datas.push(dataParcela)
  }
  
  return datas
}

/**
 * Verifica se compra pode ser aprovada baseado no limite
 */
export function verificarAprovacaoCompra(
  cartao: CartaoCredito,
  valorCompra: number,
  faturaAtual: number,
  parcelasFuturas: number
): {
  aprovada: boolean
  motivo?: string
  limiteDisponivel: number
} {
  const { limiteDisponivel } = calcularLimiteDisponivel(
    cartao,
    faturaAtual,
    parcelasFuturas
  )
  
  if (limiteDisponivel < valorCompra) {
    return {
      aprovada: false,
      motivo: `Limite indisponível. Disponível: R$ ${limiteDisponivel.toFixed(2)}`,
      limiteDisponivel
    }
  }
  
  // Alerta se utilizar mais de 80% do limite
  const novoLimiteUtilizado = (faturaAtual + parcelasFuturas + valorCompra)
  const percentualAposCompra = (novoLimiteUtilizado / cartao.limite) * 100
  
  if (percentualAposCompra > 80) {
    return {
      aprovada: true,
      motivo: `Atenção: Esta compra utilizará ${percentualAposCompra.toFixed(1)}% do seu limite`,
      limiteDisponivel
    }
  }
  
  return {
    aprovada: true,
    limiteDisponivel
  }
}

/**
 * Formata valor para exibição
 */
export function formatarValor(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

/**
 * Calcula total de parcelas futuras (exceto fatura atual)
 */
export function calcularParcelasFuturas(
  transacoes: TransacaoParcelada[],
  _mesAnoAtual: string
): number {
  return transacoes
    .filter(t => t.status === 'ativa')
    .filter(t => {
      // Verifica se ainda tem parcelas futuras além do mês atual
      const parcelasRestantes = t.totalParcelas - t.parcelaAtual
      return parcelasRestantes > 0
    })
    .reduce((total, t) => {
      const parcelasRestantes = t.totalParcelas - t.parcelaAtual
      return total + (t.valorParcela * parcelasRestantes)
    }, 0)
}

/**
 * Calcula valor da fatura atual
 */
export function calcularValorFaturaAtual(
  transacoes: TransacaoParcelada[],
  cartao: CartaoCredito,
  mesAno: string
): number {
  const { abertura, fechamento } = calcularPeriodoFatura(cartao, mesAno)
  
  return transacoes
    .filter(t => t.status === 'ativa')
    .filter(t => {
      // Verifica se a compra cai nesta fatura
      const dataCompra = new Date(t.dataCompra)
      return dataCompra >= abertura && dataCompra <= fechamento
    })
    .reduce((total, t) => total + t.valorParcela, 0)
}

/**
 * Gera resumo da fatura para exibição
 */
export function gerarResumoFatura(
  cartao: CartaoCredito,
  mesAno: string,
  transacoes: TransacaoParcelada[]
): {
  periodo: string
  vencimento: Date
  valorTotal: number
  numeroTransacoes: number
  status: 'aberta' | 'fechada' | 'vencida'
} {
  const { abertura, fechamento, vencimento } = calcularPeriodoFatura(cartao, mesAno)
  const hoje = new Date()
  
  const valorTotal = calcularValorFaturaAtual(transacoes, cartao, mesAno)
  const numeroTransacoes = transacoes.filter(t => {
    const dataCompra = new Date(t.dataCompra)
    return dataCompra >= abertura && dataCompra <= fechamento
  }).length
  
  let status: 'aberta' | 'fechada' | 'vencida' = 'aberta'
  
  if (hoje > vencimento) {
    status = 'vencida'
  } else if (hoje > fechamento) {
    status = 'fechada'
  }
  
  return {
    periodo: `${abertura.toLocaleDateString('pt-BR')} a ${fechamento.toLocaleDateString('pt-BR')}`,
    vencimento,
    valorTotal,
    numeroTransacoes,
    status
  }
}
