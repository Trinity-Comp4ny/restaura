import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { prepararDadosParaExportacao, RelatorioConsolidado } from '@/lib/export-utils'

const supabase = createClient()

type PeriodoPresets = '7d' | '30d' | '90d' | 'mes' | 'ano' | 'todos'

function construirIntervalo(periodo?: PeriodoPresets, startDate?: string, endDate?: string) {
  if (startDate || endDate) {
    const inicio = startDate ? new Date(startDate) : undefined
    const fim = endDate ? new Date(endDate) : undefined

    if (fim) {
      fim.setHours(23, 59, 59, 999)
    }

    return { inicio, fim }
  }

  if (!periodo || periodo === 'todos') return { inicio: undefined, fim: undefined }

  const hoje = new Date()
  let inicio: Date
  let fim: Date

  switch (periodo) {
    case '7d':
      inicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
      fim = hoje
      break
    case '30d':
      inicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
      fim = hoje
      break
    case '90d':
      inicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000)
      fim = hoje
      break
    case 'mes':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999)
      break
    case 'ano':
      inicio = new Date(hoje.getFullYear(), 0, 1)
      fim = new Date(hoje.getFullYear(), 11, 31, 23, 59, 59, 999)
      break
    default:
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      fim = hoje
  }

  return { inicio, fim }
}

function filtrarTransacoesPorPeriodo(
  transacoes: any[],
  periodo?: PeriodoPresets,
  startDate?: string,
  endDate?: string
) {
  const { inicio, fim } = construirIntervalo(periodo, startDate, endDate)
  if (!inicio && !fim) return transacoes

  return transacoes.filter((transacao) => {
    const dataRef = transacao.data_vencimento || transacao.data_pagamento || transacao.criado_em
    if (!dataRef) return false
    const data = new Date(dataRef)
    if (Number.isNaN(data.getTime())) return false
    if (inicio && data < inicio) return false
    if (fim && data > fim) return false
    return true
  })
}

// Hook para buscar dados de receitas para exportação
export function useDadosReceitasExportacao(clinicaId: string, periodo?: PeriodoPresets, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['receitas-exportacao', clinicaId, periodo, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('transacoes')
        .select(`
          id,
          descricao,
          valor_bruto,
          valor_liquido,
          valor_taxas,
          status,
          data_vencimento,
          data_pagamento,
          criado_em,
          categoria,
          pacientes (id, nome),
          metodos_cobranca (id, nome),
          categorias (id, nome)
        `)
        .eq('clinica_id', clinicaId)
        .eq('tipo', 'receita')
        .order('data_vencimento', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      const filtrados = filtrarTransacoesPorPeriodo(data || [], periodo, startDate, endDate)
      return prepararDadosParaExportacao(filtrados, 'receita')
    },
    enabled: !!clinicaId,
  })
}

// Hook para buscar dados de despesas para exportação
export function useDadosDespesasExportacao(clinicaId: string, periodo?: PeriodoPresets, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['despesas-exportacao', clinicaId, periodo, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('transacoes')
        .select(`
          id,
          descricao,
          valor_bruto,
          valor_liquido,
          valor_taxas,
          status,
          data_vencimento,
          data_pagamento,
          criado_em,
          categoria,
          pacientes (id, nome),
          metodos_pagamento (id, nome),
          categorias (id, nome)
        `)
        .eq('clinica_id', clinicaId)
        .eq('tipo', 'despesa')
        .order('data_vencimento', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      const filtrados = filtrarTransacoesPorPeriodo(data || [], periodo, startDate, endDate)
      return prepararDadosParaExportacao(filtrados, 'despesa')
    },
    enabled: !!clinicaId,
  })
}

// Hook para buscar dados consolidados para exportação
export function useDadosConsolidadosExportacao(clinicaId: string, periodo?: PeriodoPresets, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['consolidado-exportacao', clinicaId, periodo, startDate, endDate],
    queryFn: async () => {
      // Buscar receitas
      let receitasQuery = supabase
        .from('transacoes')
        .select(`
          id,
          descricao,
          valor_bruto,
          valor_liquido,
          valor_taxas,
          status,
          data_vencimento,
          data_pagamento,
          criado_em,
          categoria,
          pacientes (id, nome),
          metodos_cobranca (id, nome),
          categorias (id, nome)
        `)
        .eq('clinica_id', clinicaId)
        .eq('tipo', 'receita')

      // Buscar despesas
      let despesasQuery = supabase
        .from('transacoes')
        .select(`
          id,
          descricao,
          valor_bruto,
          valor_liquido,
          valor_taxas,
          status,
          data_vencimento,
          data_pagamento,
          criado_em,
          categoria,
          pacientes (id, nome),
          metodos_pagamento (id, nome),
          categorias (id, nome)
        `)
        .eq('clinica_id', clinicaId)
        .eq('tipo', 'despesa')

      // Executar ambas as queries
      const [receitasResult, despesasResult] = await Promise.all([
        receitasQuery.order('data_vencimento', { ascending: false }),
        despesasQuery.order('data_vencimento', { ascending: false })
      ])

      if (receitasResult.error) throw receitasResult.error
      if (despesasResult.error) throw despesasResult.error

      const receitasFiltradas = filtrarTransacoesPorPeriodo(receitasResult.data || [], periodo, startDate, endDate)
      const despesasFiltradas = filtrarTransacoesPorPeriodo(despesasResult.data || [], periodo, startDate, endDate)

      const receitas = prepararDadosParaExportacao(receitasFiltradas, 'receita')
      const despesas = prepararDadosParaExportacao(despesasFiltradas, 'despesa')

      // Calcular totais
      const totalReceitas = receitas.reduce((sum, r) => sum + r.valor_liquido, 0)
      const totalDespesas = despesas.reduce((sum, d) => sum + d.valor_liquido, 0)
      const totalTaxas = receitas.reduce((sum, r) => sum + r.valor_taxas, 0)

      const consolidado: RelatorioConsolidado = {
        receitas,
        despesas,
        totais: {
          total_receitas: totalReceitas,
          total_despesas: totalDespesas,
          saldo_liquido: totalReceitas - totalDespesas,
          total_taxas: totalTaxas,
        }
      }

      return consolidado
    },
    enabled: !!clinicaId,
  })
}
