import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface ResumoFinanceiro {
  total_geral: number
  total_pago: number
  total_pendente: number
  total_vencido: number
  total_orcamentos: number
  orcamentos_aprovados: number
  ticket_medio: number
  ultimo_pagamento: string | null
  proximo_vencimento: string | null
}

interface Transacao {
  id: string
  paciente_id: string
  descricao: string
  valor: number
  data: string
  status: 'pago' | 'pendente' | 'vencido'
  metodo_pagamento: string
  tipo: 'receita' | 'despesa'
  created_at: string
}

interface Parcela {
  id: string
  paciente_id: string
  valor: number
  data_vencimento: string
  status: 'paga' | 'pendente' | 'vencida'
  data_pagamento: string | null
  numero_parcela: number
  total_parcelas: number
  transacao_id: string
}

interface Orcamento {
  id: string
  paciente_id: string
  valor_total: number
  status: 'aprovado' | 'pendente' | 'rejeitado'
  data_aprovacao: string | null
  validade: string
  procedimentos: any[]
  created_at: string
}

export function useResumoFinanceiroPaciente(pacienteId: string) {
  return useQuery({
    queryKey: ['resumo-financeiro-paciente', pacienteId],
    queryFn: async (): Promise<ResumoFinanceiro> => {
      // Buscar transações do paciente
      const { data: transacoes, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('tipo', 'receita')

      if (transacoesError) throw transacoesError

      // Buscar parcelas do paciente
      const { data: parcelas, error: parcelasError } = await supabase
        .from('parcelas')
        .select('*')
        .eq('paciente_id', pacienteId)

      if (parcelasError) throw parcelasError

      // Buscar orçamentos do paciente
      const { data: orcamentos, error: orcamentosError } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('paciente_id', pacienteId)

      if (orcamentosError) throw orcamentosError

      // Calcular resumo
      const totalTransacoes = (transacoes as any || []).reduce((sum: number, t: any) => sum + (t.valor || 0), 0)
      const totalPago = (transacoes as any || []).filter((t: any) => t.status === 'pago').reduce((sum: number, t: any) => sum + (t.valor || 0), 0)
      const totalPendente = (transacoes as any || []).filter((t: any) => t.status === 'pendente').reduce((sum: number, t: any) => sum + (t.valor || 0), 0)
      const totalVencido = (transacoes as any || []).filter((t: any) => t.status === 'vencido').reduce((sum: number, t: any) => sum + (t.valor || 0), 0)

      const totalOrcamentos = (orcamentos as any || []).reduce((sum: number, o: any) => sum + (o.valor_total || 0), 0)
      const orcamentosAprovados = (orcamentos as any || []).filter((o: any) => o.status === 'aprovado').reduce((sum: number, o: any) => sum + (o.valor_total || 0), 0)

      const ticketMedio = totalTransacoes > 0 ? totalTransacoes / (transacoes as any || []).length : 0

      const ultimoPagamento = (transacoes as any || [])
        .filter((t: any) => t.status === 'pago')
        .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]?.data || null

      const proximoVencimento = (parcelas as any || [])
        .filter((p: any) => p.status === 'pendente')
        .sort((a: any, b: any) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())[0]?.data_vencimento || null

      return {
        total_geral: totalTransacoes,
        total_pago: totalPago,
        total_pendente: totalPendente,
        total_vencido: totalVencido,
        total_orcamentos: totalOrcamentos,
        orcamentos_aprovados: orcamentosAprovados,
        ticket_medio: ticketMedio,
        ultimo_pagamento: ultimoPagamento,
        proximo_vencimento: proximoVencimento,
      }
    },
    enabled: !!pacienteId,
  })
}

export function useTransacoesPaciente(pacienteId: string) {
  return useQuery({
    queryKey: ['transacoes-paciente', pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('tipo', 'receita')
        .order('data', { ascending: false })

      if (error) throw error
      return data as Transacao[]
    },
    enabled: !!pacienteId,
  })
}

export function useParcelasPaciente(pacienteId: string) {
  return useQuery({
    queryKey: ['parcelas-paciente', pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parcelas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data_vencimento', { ascending: true })

      if (error) throw error
      return data as Parcela[]
    },
    enabled: !!pacienteId,
  })
}

export function useOrcamentosPaciente(pacienteId: string) {
  return useQuery({
    queryKey: ['orcamentos-paciente', pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Orcamento[]
    },
    enabled: !!pacienteId,
  })
}
