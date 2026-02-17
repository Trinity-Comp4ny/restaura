'use client'

import { useQuery } from '@tanstack/react-query'
import { METODOS_PAGAMENTO_BASE, type MetodoPagamentoBase } from '@/constants/metodos-pagamento'

export function useMetodosPagamentoBase() {
  return useQuery({
    queryKey: ['metodos_pagamento_base'],
    queryFn: async () => {
      // Retorna os métodos base como array
      return Object.values(METODOS_PAGAMENTO_BASE) as MetodoPagamentoBase[]
    },
    staleTime: Infinity, // Nunca expira, são constantes
  })
}

export function getMetodoPagamentoBase(tipo: string): MetodoPagamentoBase | null {
  const metodo = Object.values(METODOS_PAGAMENTO_BASE).find(m => m.tipo === tipo)
  return metodo || null
}
