import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Transacao = Database['public']['Tables']['transacoes']['Row']
type TransacaoInsert = Database['public']['Tables']['transacoes']['Insert']
type TransacaoUpdate = Database['public']['Tables']['transacoes']['Update']

const supabase = createClient()

export function useTransacoes(clinicaId?: string, tipo?: 'receita' | 'despesa') {
  return useQuery({
    queryKey: ['transacoes', clinicaId, tipo],
    queryFn: async () => {
      let query = supabase
        .from('transacoes')
        .select(`
          id,
          clinica_id,
          paciente_id,
          consulta_id,
          tipo,
          categoria,
          descricao,
          valor_bruto,
          valor_liquido,
          valor_taxas,
          metodo_cobranca_id,
          metodo_pagamento_id,
          cartao_id,
          status,
          data_vencimento,
          data_pagamento,
          data_credito_prevista,
          total_parcelas,
          parcela_atual,
          valor_parcela,
          data_primeira_parcela,
          origem_receita,
          tipo_documento,
          numero_documento,
          observacoes,
          criado_por_id,
          criado_em,
          atualizado_em,
          pacientes (id, nome),
          consultas (id),
          parcelas (
            id,
            numero_parcela,
            total_parcelas,
            valor,
            valor_multa,
            valor_juros,
            valor_desconto,
            valor_corrigido,
            dias_atraso,
            status,
            status_calculado,
            data_vencimento,
            data_pagamento,
            data_credito_prevista,
            fatura_cartao_id
          )
        `)
        .order('criado_em', { ascending: false })

      if (clinicaId) {
        query = query.eq('clinica_id', clinicaId)
      }

      if (tipo) {
        query = query.eq('tipo', tipo)
      }

      const { data, error } = await query

      if (error) throw error
      return data as (Transacao & {
        pacientes: { id: string; nome: string } | null
        consultas: { id: string } | null
        parcelas: {
          id: string
          numero_parcela: number
          total_parcelas: number
          valor: number
          data_vencimento: string
          data_pagamento: string | null
          data_credito_prevista: string | null
          status: string
          fatura_cartao_id: string | null
        }[]
      })[]
    },
    enabled: !!clinicaId,
  })
}

export function useTransacao(id: string) {
  return useQuery({
    queryKey: ['transacao', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transacoes')
        .select(`
          *,
          pacientes (id, nome),
          consultas (id)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTransacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transacao: TransacaoInsert) => {
      const { data, error } = await supabase
        .from('transacoes')
        .insert(transacao as unknown as never)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] })
      toast.success('Transação registrada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao registrar transação')
    },
  })
}

export function useUpdateTransacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...transacao }: TransacaoUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('transacoes')
        .update(transacao as unknown as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] })
      queryClient.invalidateQueries({ queryKey: ['transacao', variables.id] })
      toast.success('Transação atualizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar transação')
    },
  })
}

export function useDeleteTransacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] })
      toast.success('Transação removida com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao remover transação')
    },
  })
}
