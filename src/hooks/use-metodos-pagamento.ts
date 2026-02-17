/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export interface MetodoPagamento {
  id: string
  nome: string
  tipo: 'pix' | 'transferencia' | 'boleto' | 'debito_automatico' | 'dinheiro' | 'cartao_credito' | 'cartao_debito'
  taxas_percentual: number
  taxas_fixa: number
  prazo_deposito: number
  adquirente?: string
  conta_vinculada_id?: string
  cartao_id?: string
  is_padrao: boolean
  ativo: boolean
  clinica_id: string
  criado_em: string
  atualizado_em: string
}

// Hook para buscar métodos de pagamento (para despesas)
export function useMetodosPagamento(clinicaId?: string) {
  return useQuery({
    queryKey: ['metodos_pagamento', clinicaId],
    queryFn: async () => {
      if (!clinicaId) return []
      
      const { data, error } = await supabase
        .from('metodos_pagamento')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativo', true)
        .order('is_padrao', { ascending: false })
        .order('nome')
      
      if (error) throw error
      return data as MetodoPagamento[]
    },
    enabled: !!clinicaId
  })
}

// Hook para criar método de pagamento
export function useCreateMetodoPagamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (metodo: any) => {
      const { data, error } = await (supabase as any)
        .from('metodos_pagamento')
        .insert(metodo)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metodos_pagamento'] })
      toast.success('Método de pagamento criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar método de pagamento')
    },
  })
}

// Hook para atualizar método de pagamento
export function useUpdateMetodoPagamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...metodo }: any) => {
      const { data, error } = await (supabase as any)
        .from('metodos_pagamento')
        .update(metodo)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['metodos_pagamento'] })
      queryClient.invalidateQueries({ queryKey: ['metodo_pagamento', variables.id] })
      toast.success('Método de pagamento atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar método de pagamento')
    },
  })
}

// Hook para deletar método de pagamento
export function useDeleteMetodoPagamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('metodos_pagamento')
        .update({ ativo: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metodos_pagamento'] })
      toast.success('Método de pagamento removido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao remover método de pagamento')
    },
  })
}
