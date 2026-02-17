export const METODOS_PAGAMENTO_BASE = {
  pix: {
    nome: 'PIX',
    tipo: 'pix',
    taxas_percentual: 0,
    taxas_fixa: 0,
    prazo_deposito: 0,
    descricao: 'Transferência instantânea via PIX'
  },
  boleto: {
    nome: 'Boleto Bancário',
    tipo: 'boleto',
    taxas_percentual: 2.5,
    taxas_fixa: 2.5,
    prazo_deposito: 3,
    descricao: 'Boleto com vencimento em 3 dias úteis'
  },
  dinheiro: {
    nome: 'Dinheiro',
    tipo: 'dinheiro',
    taxas_percentual: 0,
    taxas_fixa: 0,
    prazo_deposito: 0,
    descricao: 'Pagamento em espécie'
  },
  transferencia: {
    nome: 'Transferência Bancária',
    tipo: 'transferencia',
    taxas_percentual: 0,
    taxas_fixa: 5.0,
    prazo_deposito: 1,
    descricao: 'TED/DOC com 1 dia útil'
  },
  debito: {
    nome: 'Cartão de Débito',
    tipo: 'cartao_debito',
    taxas_percentual: 1.5,
    taxas_fixa: 0,
    prazo_deposito: 0,
    descricao: 'Débito na hora'
  }
} as const

export type MetodoPagamentoBase = typeof METODOS_PAGAMENTO_BASE[keyof typeof METODOS_PAGAMENTO_BASE]
