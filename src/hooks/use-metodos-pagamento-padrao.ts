/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
'use client'

import { useQuery } from '@tanstack/react-query'

export interface MetodoPagamentoPadrao {
  id: string
  nome: string
  tipo: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'transferencia' | 'boleto' | 'debito_automatico'
  icone: string
}

// Métodos de pagamento padrão para despesas (fixos)
const METODOS_PAGAMENTO_PADRAO: MetodoPagamentoPadrao[] = [
  {
    id: 'padrao-pix',
    nome: 'PIX',
    tipo: 'pix',
    icone: 'QrCode'
  },
  {
    id: 'padrao-cartao-credito',
    nome: 'Cartão de Crédito',
    tipo: 'cartao_credito',
    icone: 'CreditCard'
  },
  {
    id: 'padrao-cartao-debito',
    nome: 'Cartão de Débito',
    tipo: 'cartao_debito',
    icone: 'CreditCard'
  },
  {
    id: 'padrao-dinheiro',
    nome: 'Dinheiro',
    tipo: 'dinheiro',
    icone: 'Banknote'
  },
  {
    id: 'padrao-transferencia',
    nome: 'Transferência Bancária',
    tipo: 'transferencia',
    icone: 'ArrowUpRight'
  },
  {
    id: 'padrao-debito-automatico',
    nome: 'Débito Automático',
    tipo: 'debito_automatico',
    icone: 'ArrowDownRight'
  }
]

// Hook para buscar métodos de pagamento padrão (para despesas)
export function useMetodosPagamentoPadrao() {
  return useQuery({
    queryKey: ['metodos_pagamento_padrao'],
    queryFn: async () => {
      // Retorna os métodos fixos para despesas
      return METODOS_PAGAMENTO_PADRAO
    },
    staleTime: Infinity // Nunca expira, pois são métodos fixos
  })
}

// Hook para buscar método de pagamento padrão por ID
export function useMetodoPagamentoPadrao(id?: string) {
  return useQuery({
    queryKey: ['metodo_pagamento_padrao', id],
    queryFn: async () => {
      if (!id) return null
      return METODOS_PAGAMENTO_PADRAO.find(m => m.id === id) || null
    },
    enabled: !!id,
    staleTime: Infinity
  })
}

// Função auxiliar para obter todos os métodos padrão
export function getMetodosPagamentoPadrao(): MetodoPagamentoPadrao[] {
  return METODOS_PAGAMENTO_PADRAO
}

// Função auxiliar para obter método por tipo
export function getMetodoPagamentoPorTipo(tipo: string): MetodoPagamentoPadrao | undefined {
  return METODOS_PAGAMENTO_PADRAO.find(m => m.tipo === tipo)
}
