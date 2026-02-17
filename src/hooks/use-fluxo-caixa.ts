import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getLocalISODate } from '@/lib/utils'

interface FluxoCaixaResumo {
  saldo_atual: number
  entradas_periodo: number
  saidas_periodo: number
  total_a_receber: number
  total_a_pagar: number
}

interface FluxoDiario {
  data: string
  entradas: number
  saidas: number
  entradas_previstas?: number
  saidas_previstas?: number
  saldo_acumulado?: number
  saldo: number
}

interface ContaPagar {
  id: string
  descricao: string
  valor: number
  vencimento: string
  categoria: string
  status: 'a_vencer' | 'vencido' | 'pago'
}

interface ContaReceber {
  id: string
  descricao: string
  valor: number
  vencimento: string
  paciente: string
  status: 'a_vencer' | 'vencido' | 'pago'
}

interface ProjecaoSemanal {
  semana: string
  entradas_previstas: number
  saidas_previstas: number
  saldo_previsto: number
}

interface FluxoAgrupado {
  label: string
  entradas: number
  saidas: number
  entradas_previstas?: number
  saidas_previstas?: number
  saldo: number
}

type FluxoMensal = Record<string, FluxoAgrupado>

const supabase = createClient()

export function useFluxoCaixaResumo(
  clinicaId: string,
  periodo?: { inicio: string; fim: string }
) {
  const aplicarFiltro = !!periodo?.inicio && !!periodo?.fim

  return useQuery({
    queryKey: ['fluxo-caixa-resumo', clinicaId, periodo],
    queryFn: async () => {
      // Buscar todas as transações com parcelas
      const { data: transacoes, error } = await supabase
        .from('transacoes')
        .select(`
          id,
          tipo,
          valor_liquido,
          valor_bruto,
          status,
          parcelas!inner(
            id,
            valor,
            data_vencimento,
            data_pagamento,
            status,
            status_calculado,
            dias_atraso
          )
        `)
        .eq('clinica_id', clinicaId)

      if (error) throw error

      const resultado: FluxoCaixaResumo = {
        saldo_atual: 0,
        entradas_periodo: 0,
        saidas_periodo: 0,
        total_a_receber: 0,
        total_a_pagar: 0
      }

      // Processar transações e parcelas
      ;(transacoes as any[])?.forEach(transacao => {
        const parcelas = transacao.parcelas || []

        parcelas.forEach((parcela: any) => {
          const valor = parcela.valor || 0
          const estaPaga = parcela.data_pagamento !== null

          if (aplicarFiltro) {
            const dentroPagamento =
              estaPaga &&
              parcela.data_pagamento >= periodo!.inicio &&
              parcela.data_pagamento <= periodo!.fim

            const dentroVencimento =
              !estaPaga &&
              parcela.data_vencimento >= periodo!.inicio &&
              parcela.data_vencimento <= periodo!.fim

            if (!dentroPagamento && !dentroVencimento) return
          }

          if (transacao.tipo === 'receita') {
            if (estaPaga) {
              resultado.saldo_atual += valor
              resultado.entradas_periodo += valor
            } else {
              resultado.total_a_receber += valor
            }
          } else if (transacao.tipo === 'despesa') {
            if (estaPaga) {
              resultado.saldo_atual -= valor
              resultado.saidas_periodo += valor
            } else {
              resultado.total_a_pagar += valor
            }
          }
        })
      })

      return resultado
    },
    enabled: !!clinicaId,
  })
}

export function useFluxoCaixaDiario(
  clinicaId: string,
  periodo: { inicio: string; fim: string }
) {
  return useQuery({
    queryKey: ['fluxo-caixa-diario', clinicaId, periodo],
    queryFn: async () => {
      // Buscar parcelas pagas de receitas no período
      const { data: parcelasReceitas, error: errorReceitas } = await supabase
        .from('parcelas')
        .select('valor, data_pagamento')
        .eq('clinica_id', clinicaId)
        .not('data_pagamento', 'is', null)
        .gte('data_pagamento', periodo.inicio)
        .lte('data_pagamento', periodo.fim)
        .order('data_pagamento')

      // Buscar parcelas pagas de despesas no período
      const { data: parcelasDespesas, error: errorDespesas } = await supabase
        .from('parcelas')
        .select('valor, data_pagamento')
        .eq('clinica_id', clinicaId)
        .not('data_pagamento', 'is', null)
        .gte('data_pagamento', periodo.inicio)
        .lte('data_pagamento', periodo.fim)
        .order('data_pagamento')

      // Buscar transações para diferenciar receitas de despesas
      const { data: transacoes } = await supabase
        .from('transacoes')
        .select('id, tipo')
        .eq('clinica_id', clinicaId)

      if (errorReceitas || errorDespesas) throw errorReceitas || errorDespesas

      // Agrupar por dia
      const fluxoDiario: Record<string, FluxoDiario> = {}
      
      // Mapa de transações para identificar tipo
      const transacoesMap = (transacoes as any[])?.reduce((map, t) => {
        map[t.id] = t.tipo
        return map
      }, {} as Record<string, string>)

      // Buscar parcelas com transação para identificar tipo
      const { data: parcelasComTransacao } = await supabase
        .from('parcelas')
        .select('id, transacao_id, valor, data_pagamento')
        .eq('clinica_id', clinicaId)
        .not('data_pagamento', 'is', null)
        .gte('data_pagamento', periodo.inicio)
        .lte('data_pagamento', periodo.fim)
        .order('data_pagamento')

      const { data: pendentes } = await supabase
        .from('parcelas')
        .select('id, transacao_id, valor, data_vencimento')
        .eq('clinica_id', clinicaId)
        .is('data_pagamento', null)
        .gte('data_vencimento', periodo.inicio)
        .lte('data_vencimento', periodo.fim)
        .order('data_vencimento')

      const parcelasPendentes = (pendentes as any[]) || []

      // Processar parcelas pagas
      ;(parcelasComTransacao as any[])?.forEach(parcela => {
        const data = parcela.data_pagamento!
        const tipoTransacao = transacoesMap[parcela.transacao_id]
        
        if (!fluxoDiario[data]) {
          fluxoDiario[data] = { data, entradas: 0, saidas: 0, saldo: 0, entradas_previstas: 0, saidas_previstas: 0 }
        }
        
        if (tipoTransacao === 'receita') {
          fluxoDiario[data].entradas += parcela.valor || 0
        } else if (tipoTransacao === 'despesa') {
          fluxoDiario[data].saidas += parcela.valor || 0
        }
      })

      // Incluir previstas (pendentes) pelo vencimento
      parcelasPendentes.forEach(parcela => {
        const data = parcela.data_vencimento!
        const tipoTransacao = transacoesMap[parcela.transacao_id]

        if (!fluxoDiario[data]) {
          fluxoDiario[data] = { data, entradas: 0, saidas: 0, saldo: 0, entradas_previstas: 0, saidas_previstas: 0 }
        }

        if (tipoTransacao === 'receita') {
          fluxoDiario[data].entradas_previstas = (fluxoDiario[data].entradas_previstas || 0) + (parcela.valor || 0)
        } else if (tipoTransacao === 'despesa') {
          fluxoDiario[data].saidas_previstas = (fluxoDiario[data].saidas_previstas || 0) + (parcela.valor || 0)
        }
      })

      // Calcular saldo acumulado
      const resultado = Object.values(fluxoDiario)
        .sort((a, b) => a.data.localeCompare(b.data))

      // Preencher dias faltantes dentro do período com zeros
      // IMPORTANT: `new Date('YYYY-MM-DD')` is parsed as UTC by JS and can shift 1 day in BR time.
      // Use local midnight instead.
      const dataInicio = new Date(periodo.inicio + 'T00:00:00')
      const dataFim = new Date(periodo.fim + 'T00:00:00')
      const preenchido: FluxoDiario[] = []
      let cursor = new Date(dataInicio)
      let saldoAcumulado = 0

      while (cursor <= dataFim) {
        const diaStr = getLocalISODate(cursor)
        const existente = fluxoDiario[diaStr]
        const item = existente || { data: diaStr, entradas: 0, saidas: 0, saldo: 0 }
        item.saldo = item.entradas - item.saidas
        saldoAcumulado += item.saldo
        ;(item as any).saldo_acumulado = saldoAcumulado
        preenchido.push(item)
        cursor.setDate(cursor.getDate() + 1)
      }

      return preenchido
    },
    enabled: !!clinicaId && !!periodo,
  })
}

export function useContasPagar(clinicaId: string, dias: number = 30) {
  return useQuery({
    queryKey: ['contas-pagar', clinicaId, dias],
    queryFn: async () => {
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() + dias)

      // Buscar parcelas de despesas pendentes nos próximos X dias
      const { data, error } = await supabase
        .from('parcelas')
        .select(`
          id,
          valor,
          data_vencimento,
          data_pagamento,
          status,
          status_calculado,
          numero_parcela,
          total_parcelas,
          transacoes!inner(
            id,
            descricao,
            valor_bruto,
            data_vencimento,
            categoria,
            clinica_id,
            tipo
          )
        `)
        .eq('clinica_id', clinicaId)
        .eq('transacoes.tipo', 'despesa')
        .lte('data_vencimento', getLocalISODate(dataLimite))
        .is('data_pagamento', null)
        .in('status_calculado', ['pendente', 'vencido', 'vence_hoje'])
        .order('data_vencimento')

      if (error) throw error

      // Buscar nomes das categorias separadamente
      const categoriaIds = [...new Set((data as any[])?.map(p => p.transacoes.categoria))]
      const { data: categoriasData } = await supabase
        .from('categorias_despesa')
        .select('id, nome')
        .in('id', categoriaIds)
      
      const categoriasMap = (categoriasData as any[])?.reduce((map, cat) => {
        map[cat.id] = cat.nome
        return map
      }, {} as Record<string, string>)

      return (data as any[]).map(parcela => {
        const transacao = parcela.transacoes

        // Recalcular status efetivo da parcela para garantir exibição correta
        const hoje = getLocalISODate()
        const estaPaga = parcela.data_pagamento !== null
        let statusCalculado = parcela.status_calculado

        if (!estaPaga) {
          if (parcela.data_vencimento < hoje) {
            statusCalculado = 'vencido'
          } else if (parcela.data_vencimento === hoje) {
            statusCalculado = 'vence_hoje'
          } else if (!statusCalculado) {
            statusCalculado = 'a_vencer'
          }
        } else {
          statusCalculado = 'pago'
        }

        return {
          id: parcela.id,
          descricao: transacao.descricao,
          valor: parcela.valor,
          vencimento: parcela.data_vencimento,
          numero_parcela: parcela.numero_parcela,
          total_parcelas: parcela.total_parcelas,
          categoria: categoriasMap[transacao.categoria] || transacao.categoria,
          status: statusCalculado,
          transacao_id: transacao.id
        }
      })
    },
    enabled: !!clinicaId,
  })
}

export function useContasReceber(clinicaId: string, dias: number = 30) {
  return useQuery({
    queryKey: ['contas-receber', clinicaId, dias],
    queryFn: async () => {
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() + dias)

      // Buscar parcelas de receitas pendentes nos próximos X dias
      const { data, error } = await supabase
        .from('parcelas')
        .select(`
          id,
          valor,
          data_vencimento,
          data_pagamento,
          status,
          status_calculado,
          numero_parcela,
          total_parcelas,
          transacoes!inner(
            id,
            descricao,
            valor_bruto,
            data_vencimento,
            categoria,
            paciente_id,
            clinica_id,
            tipo
          )
        `)
        .eq('clinica_id', clinicaId)
        .eq('transacoes.tipo', 'receita')
        .lte('data_vencimento', getLocalISODate(dataLimite))
        .is('data_pagamento', null)
        .in('status_calculado', ['pendente', 'vencido', 'vence_hoje'])
        .order('data_vencimento')

      if (error) throw error

      // Buscar nomes das categorias separadamente
      const categoriaIds = [...new Set((data as any[])?.map(p => p.transacoes.categoria))]
      const { data: categoriasData } = await supabase
        .from('categorias_receita')
        .select('id, nome')
        .in('id', categoriaIds)
      
      const categoriasMap = (categoriasData as any[])?.reduce((map, cat) => {
        map[cat.id] = cat.nome
        return map
      }, {} as Record<string, string>)

      return (data as any[]).map(parcela => {
        const transacao = parcela.transacoes
        return {
          id: parcela.id,
          descricao: transacao.descricao,
          valor: parcela.valor,
          vencimento: parcela.data_vencimento,
          categoria: categoriasMap[transacao.categoria] || transacao.categoria,
          numero_parcela: parcela.numero_parcela,
          total_parcelas: parcela.total_parcelas,
          paciente: null, // Receitas podem não ter paciente associado
          status: parcela.status_calculado === 'vencido' ? 'vencido' : 
                  parcela.status_calculado === 'vence_hoje' ? 'a_vencer' : 'a_vencer',
          transacao_id: transacao.id
        }
      })
    },
    enabled: !!clinicaId,
  })
}

export function useProjecaoSemanal(
  clinicaId: string,
  semanas: number = 4,
  periodo?: { inicio: string; fim: string }
) {
  return useQuery({
    queryKey: ['projecao-semanal', clinicaId, semanas, periodo],
    queryFn: async () => {
      const hoje = new Date()
      const inicioRange = periodo ? new Date(periodo.inicio) : new Date(hoje)
      const fimRange = periodo ? new Date(periodo.fim) : new Date(hoje)

      if (!periodo) {
        fimRange.setDate(hoje.getDate() + (semanas * 7))
      }

      // Buscar parcelas pagas no intervalo
      const { data: parcelasPagas } = await supabase
        .from('parcelas')
        .select('valor, transacao_id, data_pagamento')
        .eq('clinica_id', clinicaId)
        .not('data_pagamento', 'is', null)
        .gte('data_pagamento', getLocalISODate(inicioRange))
        .lte('data_pagamento', getLocalISODate(fimRange))

      const transacaoIds = [...new Set((parcelasPagas as any[])?.map(p => p.transacao_id))]
      const { data: transacoesTipos } = await supabase
        .from('transacoes')
        .select('id, tipo')
        .eq('clinica_id', clinicaId)
        .in('id', transacaoIds)

      const tiposMap = (transacoesTipos as any[])?.reduce((map, t) => {
        map[t.id] = t.tipo
        return map
      }, {} as Record<string, string>)

      const semanasList: ProjecaoSemanal[] = []
      let cursor = new Date(inicioRange)
      let idx = 0
      while (cursor <= fimRange) {
        const inicioSem = new Date(cursor)
        const fimSem = new Date(cursor)
        fimSem.setDate(fimSem.getDate() + 6)
        if (fimSem > fimRange) fimSem.setTime(fimRange.getTime())

        let entradas = 0
        let saidas = 0

        ;(parcelasPagas as any[])?.forEach(parcela => {
          const dataPag = new Date(parcela.data_pagamento)
          if (dataPag >= inicioSem && dataPag <= fimSem) {
            const tipo = tiposMap[parcela.transacao_id]
            if (tipo === 'receita') entradas += parcela.valor || 0
            else if (tipo === 'despesa') saidas += parcela.valor || 0
          }
        })

        semanasList.push({
          semana: `Sem ${++idx} (${inicioSem.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}-${fimSem.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })})`,
          entradas_previstas: entradas,
          saidas_previstas: saidas,
          saldo_previsto: entradas - saidas
        })

        cursor.setDate(cursor.getDate() + 7)
      }

      return semanasList
    },
    enabled: !!clinicaId,
  })
}

export function useFluxoCaixaMensal(
  clinicaId: string,
  mesesPassados: number = 12,
  mesesFuturos: number = 6,
  periodoRange?: { inicio: string; fim: string }
) {
  return useQuery({
    queryKey: ['fluxo-caixa-mensal', clinicaId, mesesPassados, mesesFuturos, periodoRange],
    queryFn: async () => {
      let inicio: Date
      let fim: Date

      if (periodoRange) {
        inicio = new Date(periodoRange.inicio + 'T00:00:00')
        fim = new Date(periodoRange.fim + 'T00:00:00')
      } else {
        const hoje = new Date()
        inicio = new Date(hoje)
        inicio.setMonth(hoje.getMonth() - (mesesPassados - 1))
        inicio.setDate(1)
        fim = new Date(hoje)
        fim.setMonth(hoje.getMonth() + mesesFuturos)
        fim.setDate(new Date(fim.getFullYear(), fim.getMonth() + 1, 0).getDate())
      }

      const { data: parcelas } = await supabase
        .from('parcelas')
        .select('valor, data_pagamento, data_vencimento, transacao_id')
        .eq('clinica_id', clinicaId)
        .or(
          `and(data_pagamento.gte.${getLocalISODate(inicio)},data_pagamento.lte.${getLocalISODate(fim)}),` +
          `and(data_pagamento.is.null,data_vencimento.gte.${getLocalISODate(inicio)},data_vencimento.lte.${getLocalISODate(fim)})`
        )

      const transacaoIds = [...new Set((parcelas as any[])?.map(p => p.transacao_id))]
      const { data: transacoesTipos } = await supabase
        .from('transacoes')
        .select('id, tipo')
        .eq('clinica_id', clinicaId)
        .in('id', transacaoIds)

      const tiposMap = (transacoesTipos as any[])?.reduce((map, t) => {
        map[t.id] = t.tipo
        return map
      }, {} as Record<string, string>)

      const fluxoMensal: FluxoMensal = {}

      ;(parcelas as any[])?.forEach(parcela => {
        // Respeitar o mesmo filtro do resumo: pagos pelo pagamento; pendentes pelo vencimento
        const estaPaga = parcela.data_pagamento !== null
        const dataRef = estaPaga ? parcela.data_pagamento : parcela.data_vencimento
        if (!dataRef) return
        const data = new Date(dataRef + 'T00:00:00')
        const mes = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`
        if (!fluxoMensal[mes]) {
          fluxoMensal[mes] = { label: mes, entradas: 0, saidas: 0, saldo: 0, entradas_previstas: 0, saidas_previstas: 0 }
        }

        const tipo = tiposMap[parcela.transacao_id]
        if (tipo === 'receita') {
          if (estaPaga) {
            fluxoMensal[mes].entradas += parcela.valor || 0
          } else {
            ;(fluxoMensal[mes].entradas_previstas as number) += parcela.valor || 0
          }
        } else if (tipo === 'despesa') {
          if (estaPaga) {
            fluxoMensal[mes].saidas += parcela.valor || 0
          } else {
            ;(fluxoMensal[mes].saidas_previstas as number) += parcela.valor || 0
          }
        }
      })

      // Garantir meses do intervalo mesmo que zerados
      const mesesLabels: string[] = []
      const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
      const fimMes = new Date(fim.getFullYear(), fim.getMonth(), 1)
      while (cursor <= fimMes) {
        mesesLabels.push(`${String(cursor.getMonth() + 1).padStart(2, '0')}/${cursor.getFullYear()}`)
        cursor.setMonth(cursor.getMonth() + 1)
      }

      const resultado = mesesLabels.map(label => {
        const item = fluxoMensal[label] || { label, entradas: 0, saidas: 0, saldo: 0, entradas_previstas: 0, saidas_previstas: 0 }
        return { ...item, saldo: (item.entradas + (item.entradas_previstas || 0)) - (item.saidas + (item.saidas_previstas || 0)) }
      })

      return resultado
    },
    enabled: !!clinicaId,
  })
}

export function useFluxoCaixaAnual(
  clinicaId: string,
  anosPassados: number = 1,
  anosFuturos: number = 1,
  periodoRange?: { inicio: string; fim: string },
  includeFuturos: boolean = false,
) {
  return useQuery({
    queryKey: ['fluxo-caixa-anual', clinicaId, anosPassados, anosFuturos, periodoRange, includeFuturos],
    queryFn: async () => {
      let inicio: Date
      let fim: Date

      if (periodoRange) {
        inicio = new Date(periodoRange.inicio + 'T00:00:00')
        fim = new Date(periodoRange.fim + 'T00:00:00')
      } else {
        const hoje = new Date()
        inicio = new Date(hoje)
        inicio.setFullYear(hoje.getFullYear() - anosPassados)
        fim = new Date(hoje)
        fim.setFullYear(hoje.getFullYear() + anosFuturos)
        fim.setMonth(11)
        fim.setDate(31)
      }

      const { data: parcelas } = await supabase
        .from('parcelas')
        .select('valor, data_pagamento, data_vencimento, transacao_id')
        .eq('clinica_id', clinicaId)
        .or(
          `and(data_pagamento.gte.${getLocalISODate(inicio)},data_pagamento.lte.${getLocalISODate(fim)}),` +
          `and(data_pagamento.is.null,data_vencimento.gte.${getLocalISODate(inicio)},data_vencimento.lte.${getLocalISODate(fim)})`
        )

      const transacaoIds = [...new Set((parcelas as any[])?.map(p => p.transacao_id))]
      const { data: transacoesTipos } = await supabase
        .from('transacoes')
        .select('id, tipo')
        .eq('clinica_id', clinicaId)
        .in('id', transacaoIds)

      const tiposMap = (transacoesTipos as any[])?.reduce((map, t) => {
        map[t.id] = t.tipo
        return map
      }, {} as Record<string, string>)

      const agrupado: Record<string, FluxoAgrupado> = {}

      ;(parcelas as any[])?.forEach(parcela => {
        const estaPaga = parcela.data_pagamento !== null
        if (!estaPaga && !includeFuturos && !periodoRange) return

        const dataRef = estaPaga ? parcela.data_pagamento : parcela.data_vencimento
        if (!dataRef) return
        const data = new Date(dataRef + 'T00:00:00')
        const label = `${data.getFullYear()}`
        if (!agrupado[label]) {
          agrupado[label] = { label, entradas: 0, saidas: 0, saldo: 0, entradas_previstas: 0, saidas_previstas: 0 }
        }

        const tipo = tiposMap[parcela.transacao_id]
        if (tipo === 'receita') {
          if (estaPaga) agrupado[label].entradas += parcela.valor || 0
          else agrupado[label].entradas_previstas = (agrupado[label].entradas_previstas || 0) + (parcela.valor || 0)
        } else if (tipo === 'despesa') {
          if (estaPaga) agrupado[label].saidas += parcela.valor || 0
          else agrupado[label].saidas_previstas = (agrupado[label].saidas_previstas || 0) + (parcela.valor || 0)
        }
      })

      const anoInicio = inicio.getFullYear()
      const anoFim = fim.getFullYear()
      const anosLabels: string[] = []
      for (let y = anoInicio; y <= anoFim; y++) {
        anosLabels.push(`${y}`)
      }

      const resultado = anosLabels.map(label => {
        const item = agrupado[label] || { label, entradas: 0, saidas: 0, saldo: 0, entradas_previstas: 0, saidas_previstas: 0 }
        return {
          ...item,
          saldo: (item.entradas + (item.entradas_previstas || 0)) - (item.saidas + (item.saidas_previstas || 0)),
        }
      })

      return resultado
    },
    enabled: !!clinicaId,
  })
}
