/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getLocalISODate } from '@/lib/utils'
import { toast } from 'sonner'

const supabase = createClient()

export interface Parcela {
  id: string
  clinica_id: string
  transacao_id: string
  numero_parcela: number
  total_parcelas: number
  valor: number
  data_vencimento: string
  data_pagamento: string | null
  data_credito_prevista: string | null
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
  fatura_cartao_id: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string
}

// Buscar parcelas de uma transação
export function useParcelasTransacao(transacaoId?: string) {
  return useQuery({
    queryKey: ['parcelas', 'transacao', transacaoId],
    queryFn: async () => {
      if (!transacaoId) return []

      const { data, error } = await supabase
        .from('parcelas')
        .select('*')
        .eq('transacao_id', transacaoId)
        .order('numero_parcela')

      if (error) throw error
      return data as Parcela[]
    },
    enabled: !!transacaoId,
  })
}

// Buscar todas as parcelas da clínica (com filtros opcionais)
export function useParcelas(clinicaId?: string, filtros?: {
  status?: string
  dataInicio?: string
  dataFim?: string
  tipo?: 'receita' | 'despesa'
}) {
  return useQuery({
    queryKey: ['parcelas', clinicaId, filtros],
    queryFn: async () => {
      if (!clinicaId) return []

      let query = supabase
        .from('parcelas')
        .select(`
          *,
          transacoes!inner (
            id,
            tipo,
            descricao,
            valor_bruto,
            valor_liquido,
            valor_taxas,
            categoria,
            metodo_cobranca_id,
            total_parcelas,
            paciente_id,
            pacientes (id, nome)
          )
        `)
        .eq('clinica_id', clinicaId)
        .order('data_vencimento')

      if (filtros?.status && filtros.status !== 'todos') {
        query = query.eq('status', filtros.status)
      }

      if (filtros?.dataInicio) {
        query = query.gte('data_vencimento', filtros.dataInicio)
      }

      if (filtros?.dataFim) {
        query = query.lte('data_vencimento', filtros.dataFim)
      }

      if (filtros?.tipo) {
        query = query.eq('transacoes.tipo', filtros.tipo)
      }

      const { data, error } = await query

      if (error) throw error
      return data as (Parcela & {
        transacoes: {
          id: string
          tipo: string
          descricao: string
          valor_bruto: number
          valor_liquido: number
          valor_taxas: number
          categoria: string
          metodo_cobranca_id: string | null
          total_parcelas: number
          paciente_id: string | null
          pacientes: { id: string; nome: string } | null
        }
      })[]
    },
    enabled: !!clinicaId,
  })
}

// Buscar parcelas por fatura de cartão
export function useParcelasFatura(faturaId?: string) {
  return useQuery({
    queryKey: ['parcelas', 'fatura', faturaId],
    queryFn: async () => {
      if (!faturaId) return []

      const { data, error } = await supabase
        .from('parcelas')
        .select(`
          *,
          transacoes (
            id,
            tipo,
            descricao,
            categoria,
            metodo_cobranca_id
          )
        `)
        .eq('fatura_cartao_id', faturaId)
        .order('data_vencimento')

      if (error) throw error
      return data
    },
    enabled: !!faturaId,
  })
}

// Marcar parcela como paga
export function useMarcarParcelaPaga() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ parcelaId, dataPagamento }: { parcelaId: string; dataPagamento?: string }) => {
      // 1. Marcar parcela como paga
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: parcela, error: errorParcela } = await (supabase as any)
        .from('parcelas')
        .update({
          status: 'pago',
          data_pagamento: dataPagamento || getLocalISODate(),
        })
        .eq('id', parcelaId)
        .select()
        .single()

      if (errorParcela) throw errorParcela

      // 2. Buscar outras parcelas da mesma transação
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: parcelas, error: errorBusca } = await (supabase as any)
        .from('parcelas')
        .select('*')
        .eq('transacao_id', parcela.transacao_id)

      if (errorBusca) throw errorBusca

      // 3. Verificar se todas as parcelas estão pagas
      const todasPagas = parcelas?.every((p: any) => p.data_pagamento !== null)
      const todasCanceladas = parcelas?.every((p: any) => p.status === 'cancelado')

      // 4. Atualizar status da transação
      let novoStatus = 'pendente'
      let dataPagamentoTransacao = null
      if (todasPagas) {
        novoStatus = 'pago'
        // Data de pagamento da transação = data da última parcela paga
        const ultimaParcela = parcelas
          .filter((p: any) => p.data_pagamento !== null)
          .sort((a: any, b: any) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime())[0]
        dataPagamentoTransacao = ultimaParcela?.data_pagamento || getLocalISODate()
      } else if (todasCanceladas) {
        novoStatus = 'cancelado'
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('transacoes')
        .update({ 
          status: novoStatus,
          data_pagamento: dataPagamentoTransacao
        })
        .eq('id', parcela.transacao_id)

      return parcela
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
      queryClient.invalidateQueries({ queryKey: ['transacoes'] })
      toast.success('Parcela marcada como paga!')
    },
    onError: () => {
      toast.error('Erro ao marcar parcela como paga')
    },
  })
}

// Cancelar parcela
export function useCancelarParcela() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (parcelaId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('parcelas')
        .update({ status: 'cancelado' })
        .eq('id', parcelaId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
      queryClient.invalidateQueries({ queryKey: ['transacoes'] })
      toast.success('Parcela cancelada!')
    },
    onError: () => {
      toast.error('Erro ao cancelar parcela')
    },
  })
}
