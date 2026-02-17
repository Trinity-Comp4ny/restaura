'use client'

import { useMemo, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowDownRight,
  Loader2,
  Receipt,
  PiggyBank,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, getLocalISODate } from '@/lib/utils'
import { getDateFilterForPeriod } from '@/lib/date-filters'
import { useTransacoes } from '@/hooks/use-transacoes'
import { useCategoriasReceita, useCategoriasDespesa } from '@/hooks/use-categorias-financeiras'
import { useMetodosCobranca } from '@/hooks/use-metodos-cobranca'
import { useMetodosPagamento } from '@/hooks/use-metodos-pagamento'
import { useUser } from '@/hooks/use-user'
import { useFluxoCaixaDiario, useProjecaoSemanal, useFluxoCaixaMensal, useFluxoCaixaAnual } from '@/hooks/use-fluxo-caixa'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
  PieChart, Pie, Cell,
} from 'recharts'

interface VisaoGeralProps {
  periodo: string
  customRange?: { startDate: string; endDate: string }
}

type Visao = 'diario' | 'semanal' | 'mensal' | 'anual'

const visaoTitulos: Record<Visao, { titulo: string; descricao: string }> = {
  diario: { titulo: 'Fluxo de Caixa Diário', descricao: 'Entradas e saídas por dia' },
  semanal: { titulo: 'Fluxo de Caixa Semanal', descricao: 'Entradas e saídas por semana' },
  mensal: { titulo: 'Fluxo de Caixa Mensal', descricao: 'Entradas e saídas consolidadas por mês' },
  anual: { titulo: 'Fluxo de Caixa Anual', descricao: 'Visão macro por ano fiscal' },
}

const VISAO_LABELS: Record<Visao, string> = {
  diario: 'Diário',
  semanal: 'Semanal',
  mensal: 'Mensal',
  anual: 'Anual',
}

function getSmartDefaultVisao(periodo: string): Visao {
  switch (periodo) {
    case 'hoje':
    case '7d':
    case '30d':
    case 'mes_atual':
    case 'mes_anterior':
    case 'personalizado':
      return 'diario'
    case 'trimestre':
      return 'semanal'
    case 'semestre':
    case 'ano':
      return 'mensal'
    default:
      return 'diario'
  }
}

const getVisaoLabel = (visao: Visao) => VISAO_LABELS[visao] || visao

function getAvailableVisoes(periodo: string): { value: Visao; label: string }[] {
  switch (periodo) {
    case 'hoje':
      return [{ value: 'diario', label: 'Diário' }]
    case '7d':
      return [
        { value: 'diario', label: 'Diário' },
      ]
    case '30d':
      return [
        { value: 'diario', label: 'Diário' },
        { value: 'semanal', label: 'Semanal' },
      ]
    case 'mes_atual':
    case 'mes_anterior':
      return [
        { value: 'diario', label: 'Diário' },
        { value: 'mensal', label: 'Mensal' },
      ]
    case 'trimestre':
      return [
        { value: 'semanal', label: 'Semanal' },
        { value: 'mensal', label: 'Mensal' },
      ]
    case 'semestre':
      return [{ value: 'mensal', label: 'Mensal' }]
    case 'ano':
      return [
        { value: 'mensal', label: 'Mensal' },
        { value: 'anual', label: 'Anual' },
      ]
    case 'personalizado':
      return [
        { value: 'diario', label: 'Diário' },
        { value: 'mensal', label: 'Mensal' },
      ]
    default:
      return [{ value: 'diario', label: 'Diário' }]
  }
}

const RECEITA_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#059669', '#047857']
const DESPESA_COLORS = ['#ef4444', '#f87171', '#fca5a5', '#fecdd3', '#fee2e2', '#dc2626', '#b91c1c']
const METODO_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#14b8a6']

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-medium mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  const values = (payload as any[]).reduce(
    (acc, entry) => {
      acc[entry.dataKey] = entry.value
      return acc
    },
    {} as Record<string, number>
  )

  const entradas = (values.entradasPagas || 0) + (values.entradasPrev || 0)
  const saidas = (values.saidasPagas || 0) + (values.saidasPrev || 0)
  const saldo = entradas - saidas

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-medium mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
      {payload.length >= 2 && (
        <div className="mt-1.5 pt-1.5 border-t flex items-center gap-2">
          <span className="text-muted-foreground">Saldo:</span>
          <span className={`font-semibold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(saldo)}
          </span>
        </div>
      )}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.payload.fill }} />
        <span className="font-medium">{item.name}</span>
      </div>
      <p className="mt-1">{formatCurrency(item.value)} ({item.payload.percentual?.toFixed(1)}%)</p>
    </div>
  )
}

function getTimeGrouping(periodo: string): 'dia' | 'semana' | 'mes' {
  switch (periodo) {
    case 'hoje':
    case '7d':
    case 'mes_atual':
    case 'mes_anterior':
      return 'dia'
    case '30d':
    case 'trimestre':
      return 'semana'
    case 'semestre':
    case 'ano':
      return 'mes'
    default:
      return 'dia'
  }
}

export function VisaoGeral({ periodo, customRange }: VisaoGeralProps) {
  const { data: user } = useUser()
  const clinicaId = user?.clinica_id || ''

  const { data: todasTransacoes, isLoading: isLoadingTransacoes } = useTransacoes(clinicaId)
  const { data: categoriasReceita } = useCategoriasReceita(clinicaId)
  const { data: categoriasDespesa } = useCategoriasDespesa(clinicaId)
  const { data: metodosCobranca } = useMetodosCobranca(clinicaId)
  const { data: metodosPagamentoDespesa } = useMetodosPagamento(clinicaId)

  const { startDate, endDate } = useMemo(() => getDateFilterForPeriod(periodo, customRange), [periodo, customRange])
  const periodoRange = useMemo(() => ({ inicio: startDate, fim: endDate }), [startDate, endDate])
  const smartDefault = useMemo(() => getSmartDefaultVisao(periodo), [periodo])
  const [visaoManual, setVisaoManual] = useState<Visao | null>(null)
  const availableVisoes = useMemo(() => getAvailableVisoes(periodo), [periodo])
  const visao: Visao = useMemo(() => {
    if (visaoManual && availableVisoes.some((v) => v.value === visaoManual)) return visaoManual
    return smartDefault
  }, [visaoManual, smartDefault, availableVisoes])

  // Fluxo de caixa hooks
  const { data: fluxoDiario, isLoading: isLoadingDiario } = useFluxoCaixaDiario(clinicaId, periodoRange)
  const { data: projecao, isLoading: isLoadingProjecao } = useProjecaoSemanal(clinicaId, 4, periodoRange)
  const { data: fluxoMensal, isLoading: isLoadingMensal } = useFluxoCaixaMensal(clinicaId, 3, 9, periodoRange)
  const { data: fluxoAnual, isLoading: isLoadingAnual } = useFluxoCaixaAnual(clinicaId, 1, 1, periodoRange)

  const timeGrouping = getTimeGrouping(periodo)

  const stats = useMemo(() => {
    const items = todasTransacoes ?? []

    const isWithinRange = (date?: string | null) => {
      return !!date && date >= startDate && date <= endDate
    }

    const receitas = items.filter(t => t.tipo === 'receita')
    const despesas = items.filter(t => t.tipo === 'despesa')

    // Basear KPIs em parcelas, alinhado ao fluxo de caixa (pagas por data_pagamento, abertas por data_vencimento)
    const receitaLiquida = receitas.reduce((sum: number, r: any) => {
      const parcelas = r.parcelas || []
      return (
        sum +
        parcelas
          .filter((p: any) => isWithinRange(p.data_pagamento))
          .reduce((s: number, p: any) => s + (p.valor || 0), 0)
      )
    }, 0)

    const despesaLiquida = despesas.reduce((sum: number, d: any) => {
      const parcelas = d.parcelas || []
      return (
        sum +
        parcelas
          .filter((p: any) => isWithinRange(p.data_pagamento))
          .reduce((s: number, p: any) => s + (p.valor || 0), 0)
      )
    }, 0)

    const aReceber = receitas.reduce((sum: number, r: any) => {
      const parcelas = r.parcelas || []
      return (
        sum +
        parcelas
          .filter((p: any) => !p.data_pagamento && isWithinRange(p.data_vencimento))
          .reduce((s: number, p: any) => s + (p.valor || 0), 0)
      )
    }, 0)

    const aPagar = despesas.reduce((sum: number, d: any) => {
      const parcelas = d.parcelas || []
      return (
        sum +
        parcelas
          .filter((p: any) => !p.data_pagamento && isWithinRange(p.data_vencimento))
          .reduce((s: number, p: any) => s + (p.valor || 0), 0)
      )
    }, 0)

    const itemsFiltrados = items.filter((t: any) => isWithinRange(t.criado_em || t.data_vencimento))

    const receitaBruta = receitas.reduce((s, t: any) => s + (t.valor_bruto || 0), 0)
    const despesaTotal = despesas.reduce((s, t: any) => s + (t.valor_bruto || 0), 0)

    const lucroLiquido = receitaLiquida - despesaLiquida
    const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0

    const ticketMedio = receitas.length > 0 ? receitaLiquida / receitas.length : 0

    // Group by categoria
    const receitaPorCategoria = receitas.reduce((acc, t: any) => {
      const parcelas = t.parcelas || []
      const pagasNoPeriodo = parcelas.filter((p: any) => isWithinRange(p.data_pagamento))

      if (pagasNoPeriodo.length === 0) return acc

      const categoria = categoriasReceita?.find((c: any) => c.id === t.categoria)
      const nomeCat = categoria?.nome || 'Outros'
      const totalCat = pagasNoPeriodo.reduce((s: number, p: any) => s + (p.valor || 0), 0)
      acc[nomeCat] = (acc[nomeCat] || 0) + totalCat
      return acc
    }, {} as Record<string, number>)

    const despesaPorCategoria = despesas.reduce((acc, t: any) => {
      const parcelas = t.parcelas || []
      const pagasNoPeriodo = parcelas.filter((p: any) => isWithinRange(p.data_pagamento))

      if (pagasNoPeriodo.length === 0) return acc

      const categoria = categoriasDespesa?.find((c: any) => c.id === t.categoria)
      const nomeCat = categoria?.nome || 'Outros'
      const totalCat = pagasNoPeriodo.reduce((s: number, p: any) => s + (p.valor || 0), 0)
      acc[nomeCat] = (acc[nomeCat] || 0) + totalCat
      return acc
    }, {} as Record<string, number>)

    // Group by metodo
    const receitaPorMetodo = receitas.reduce((acc, t: any) => {
      const parcelas = t.parcelas || []
      const pagasNoPeriodo = parcelas.filter((p: any) => isWithinRange(p.data_pagamento))

      if (pagasNoPeriodo.length === 0) return acc

      let nomeMetodo = 'Não informado'
      if (t.metodo_cobranca_id) {
        const metodo = metodosCobranca?.find((m: any) => m.id === t.metodo_cobranca_id)
        nomeMetodo = metodo?.nome || 'Não informado'
      }

      const totalMetodo = pagasNoPeriodo.reduce((s: number, p: any) => s + (p.valor || 0), 0)
      acc[nomeMetodo] = (acc[nomeMetodo] || 0) + totalMetodo
      return acc
    }, {} as Record<string, number>)

    const despesaPorMetodo = despesas.reduce((acc, t: any) => {
      let nomeMetodo = 'Não informado'
      if (t.metodo_pagamento_id) {
        const metodo = metodosPagamentoDespesa?.find((m: any) => m.id === t.metodo_pagamento_id)
        nomeMetodo = metodo?.nome || 'Não informado'
      }
      acc[nomeMetodo] = (acc[nomeMetodo] || 0) + (t.valor_bruto || 0)
      return acc
    }, {} as Record<string, number>)

    // Ticket médio por origem
    const origemReceitaMap = receitas.reduce((acc, t: any) => {
      const origem = t.origem_receita || 'Outros'
      if (!acc[origem]) acc[origem] = { valor: 0, count: 0 }
      acc[origem].valor += t.valor_liquido || t.valor_bruto || 0
      acc[origem].count += 1
      return acc
    }, {} as Record<string, { valor: number; count: number }>)

    // Conversão de cobranças (parcelas receitas)
    const hojeISO = getLocalISODate(new Date())
    const cutoff = endDate < hojeISO ? endDate : hojeISO
    const parcelasReceita = receitas.flatMap((r: any) => r.parcelas || [])
    const cobrancaStatus = parcelasReceita.reduce((acc, p: any) => {
      const venc = p.data_vencimento
      if (p.data_pagamento) {
        acc.pag = (acc.pag || 0) + 1
      } else if (venc && venc < cutoff) {
        acc.atraso = (acc.atraso || 0) + 1
      } else {
        acc.aberto = (acc.aberto || 0) + 1
      }
      return acc
    }, { pag: 0, aberto: 0, atraso: 0 } as Record<string, number>)
    const totalCobrancas = cobrancaStatus.pag + cobrancaStatus.aberto + cobrancaStatus.atraso
    const cobrancaPagoPct = totalCobrancas > 0 ? (cobrancaStatus.pag / totalCobrancas) * 100 : 0

    // Time series data for area chart
    const timeSeriesMap: Record<string, { receitas: number; despesas: number }> = {}

    const getTimeKey = (dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00')
      if (timeGrouping === 'dia') {
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      } else if (timeGrouping === 'semana') {
        const weekStart = new Date(d)
        weekStart.setDate(d.getDate() - d.getDay())
        return weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      } else {
        return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      }
    }

    const getTimeSortKey = (dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00')
      if (timeGrouping === 'semana') {
        const weekStart = new Date(d)
        weekStart.setDate(d.getDate() - d.getDay())
        return getLocalISODate(weekStart)
      }
      return dateStr
    }

    // Build time buckets from the period range
    const bucketStart = new Date(startDate + 'T00:00:00')
    const bucketEnd = new Date(endDate + 'T00:00:00')
    const cursor = new Date(bucketStart)

    if (timeGrouping === 'dia') {
      while (cursor <= bucketEnd) {
        const key = getTimeKey(getLocalISODate(cursor))
        timeSeriesMap[key] = { receitas: 0, despesas: 0 }
        cursor.setDate(cursor.getDate() + 1)
      }
    } else if (timeGrouping === 'semana') {
      const weekCursor = new Date(bucketStart)
      weekCursor.setDate(weekCursor.getDate() - weekCursor.getDay())
      while (weekCursor <= bucketEnd) {
        const key = getTimeKey(getLocalISODate(weekCursor))
        timeSeriesMap[key] = { receitas: 0, despesas: 0 }
        weekCursor.setDate(weekCursor.getDate() + 7)
      }
    } else {
      const monthCursor = new Date(bucketStart.getFullYear(), bucketStart.getMonth(), 1)
      while (monthCursor <= bucketEnd) {
        const key = getTimeKey(getLocalISODate(monthCursor))
        timeSeriesMap[key] = { receitas: 0, despesas: 0 }
        monthCursor.setMonth(monthCursor.getMonth() + 1)
      }
    }

    // Fill with actual data
    itemsFiltrados.forEach((t: any) => {
      const dataRef = t.criado_em || t.data_vencimento
      if (!dataRef) return
      const key = getTimeKey(dataRef)
      if (!timeSeriesMap[key]) timeSeriesMap[key] = { receitas: 0, despesas: 0 }
      if (t.tipo === 'receita') {
        timeSeriesMap[key].receitas += t.valor_liquido || t.valor_bruto || 0
      } else {
        timeSeriesMap[key].despesas += t.valor_bruto || 0
      }
    })

    const timeSeries = Object.entries(timeSeriesMap).map(([label, vals]) => ({
      label,
      receitas: vals.receitas,
      despesas: vals.despesas,
      saldo: vals.receitas - vals.despesas,
    }))

    return {
      receitaBruta,
      despesaTotal,
      receitaLiquida,
      despesaLiquida,
      lucroLiquido,
      margemLiquida,
      aReceber,
      aPagar,
      ticketMedio,
      receitaPorCategoria,
      despesaPorCategoria,
      receitaPorMetodo,
      despesaPorMetodo,
      origemReceitaMap,
      cobrancaStatus,
      cobrancaPagoPct,
      totalCobrancas,
      totalReceitas: receitas.length,
      totalDespesas: despesas.length,
      timeSeries,
    }
  }, [todasTransacoes, categoriasReceita, categoriasDespesa, metodosCobranca, metodosPagamentoDespesa, startDate, endDate, timeGrouping])

  const chartData = useMemo(() => {
    const normalize = (items: any[]) =>
      items.map((item: any) => {
        const label = item.label || item.semana || (item.data ? new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '')
        const entradasPagas = item.entradas || 0
        const saidasPagas = item.saidas || 0
        const entradasPrev = item.entradas_previstas || 0
        const saidasPrev = item.saidas_previstas || 0
        return {
          label,
          entradasPagas,
          saidasPagas,
          entradasPrev,
          saidasPrev,
          saldo: entradasPagas + entradasPrev - (saidasPagas + saidasPrev),
        }
      })

    switch (visao) {
      case 'diario':
        return normalize(fluxoDiario || [])
      case 'semanal':
        return normalize(projecao || [])
      case 'mensal':
        return normalize(fluxoMensal || [])
      case 'anual':
        return normalize(fluxoAnual || [])
      default:
        return []
    }
  }, [visao, fluxoDiario, projecao, fluxoMensal, fluxoAnual])

  const isLoading = isLoadingTransacoes || isLoadingDiario || isLoadingProjecao || isLoadingMensal || isLoadingAnual

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalReceitaCategorias = Object.values(stats.receitaPorCategoria).reduce((s, v) => s + v, 0)
  const totalDespesaCategorias = Object.values(stats.despesaPorCategoria).reduce((s, v) => s + v, 0)

  const receitaCategorias = Object.entries(stats.receitaPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      percentual: totalReceitaCategorias > 0 ? (value / totalReceitaCategorias) * 100 : 0,
      fill: RECEITA_COLORS[i % RECEITA_COLORS.length],
    }))

  const despesaCategorias = Object.entries(stats.despesaPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      percentual: totalDespesaCategorias > 0 ? (value / totalDespesaCategorias) * 100 : 0,
      fill: DESPESA_COLORS[i % DESPESA_COLORS.length],
    }))

  // Receita deve usar paleta verde e despesas paleta vermelha para evitar inversão de cores
  const metodoData = Object.entries(stats.receitaPorMetodo)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      percentual: stats.receitaLiquida > 0 ? (value / stats.receitaLiquida) * 100 : 0,
      fill: RECEITA_COLORS[i % RECEITA_COLORS.length],
    }))

  const metodoDespesaData = Object.entries(stats.despesaPorMetodo)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      percentual: stats.despesaTotal > 0 ? (value / stats.despesaTotal) * 100 : 0,
      fill: DESPESA_COLORS[i % DESPESA_COLORS.length],
    }))

  const origemTicketData = Object.entries(stats.origemReceitaMap)
    .sort((a, b) => b[1].valor - a[1].valor)
    .map(([origem, info], i) => ({
      origem,
      valor: info.valor,
      count: info.count,
      ticket: info.count > 0 ? info.valor / info.count : 0,
      fill: METODO_COLORS[i % METODO_COLORS.length],
    }))

  const cobrancaDonut = [
    { name: 'Pagas', value: stats.cobrancaStatus.pag, fill: '#10b981' },
    { name: 'Em aberto', value: stats.cobrancaStatus.aberto, fill: '#f59e0b' },
    { name: 'Atrasadas', value: stats.cobrancaStatus.atraso, fill: '#ef4444' },
  ]

  const isEmpty = stats.totalReceitas === 0 && stats.totalDespesas === 0

  const receitaBarData = receitaCategorias.slice(0, 6)
  const despesaBarData = despesaCategorias.slice(0, 6)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Visão Geral Financeira</h1>
        <p className="text-muted-foreground">Panorama consolidado de todas as transações.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Líquida</CardTitle>
            <div className="rounded-full p-2 bg-green-100 dark:bg-green-900">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.receitaLiquida)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">À Receber</CardTitle>
            <div className="rounded-full p-2 bg-yellow-100 dark:bg-yellow-900">
              <Wallet className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.aReceber)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas Pagas</CardTitle>
            <div className="rounded-full p-2 bg-red-100 dark:bg-red-900">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.despesaLiquida)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">À Pagar</CardTitle>
            <div className="rounded-full p-2 bg-orange-100 dark:bg-orange-900">
              <ArrowDownRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.aPagar)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            <div className={`rounded-full p-2 ${stats.lucroLiquido >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <DollarSign className={`h-4 w-4 ${stats.lucroLiquido >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.lucroLiquido)}
            </div>
          </CardContent>
        </Card>
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma transação registrada</h3>
            <p className="text-muted-foreground mt-1">
              Comece registrando receitas e despesas nas abas correspondentes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Receitas vs Despesas over time */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-base">Fluxo de Caixa</CardTitle>
                  <CardDescription>{visaoTitulos[visao].descricao}</CardDescription>
                </div>
                <Select value={visao} onValueChange={(v) => setVisaoManual(v as Visao)}>
                  <SelectTrigger className="w-36">
                    <span className="truncate text-left">{getVisaoLabel(visao)}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {availableVisoes.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado no período.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11 }}
                        className="text-muted-foreground"
                        interval={chartData.length > 15 ? Math.floor(chartData.length / 10) : 0}
                        angle={chartData.length > 10 ? -45 : 0}
                        textAnchor={chartData.length > 10 ? 'end' : 'middle'}
                        height={chartData.length > 10 ? 60 : 30}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        className="text-muted-foreground"
                        tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString())}
                        width={50}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
                      />
                      <Line type="monotone" dataKey="entradasPagas" name="Receitas" stroke="#16a34a" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="entradasPrev" name="À Receber" stroke="#facc15" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="saidasPagas" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="saidasPrev" name="À Pagar" stroke="#fb923c" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category breakdowns with Recharts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Receita por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-green-600" />
                  Receita por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {receitaCategorias.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma receita registrada.</p>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center justify-center w-full sm:w-44 shrink-0">
                      <div className="h-36 w-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={receitaCategorias}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={65}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {receitaCategorias.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {receitaCategorias.map((cat) => (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.fill }} />
                              <span className="truncate">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="font-medium">{formatCurrency(cat.value)}</span>
                              <span className="text-xs text-muted-foreground">({cat.percentual.toFixed(0)}%)</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${cat.percentual}%`, backgroundColor: cat.fill }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Despesas por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-red-600" />
                  Despesas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {despesaCategorias.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma despesa registrada.</p>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center justify-center w-full sm:w-44 shrink-0">
                      <div className="h-36 w-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={despesaCategorias}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={65}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {despesaCategorias.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {despesaCategorias.map((cat) => (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.fill }} />
                              <span className="truncate">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="font-medium">{formatCurrency(cat.value)}</span>
                              <span className="text-xs text-muted-foreground">({cat.percentual.toFixed(0)}%)</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${cat.percentual}%`, backgroundColor: cat.fill }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment methods */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Receita por Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                {metodoData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center justify-center w-full sm:w-44 shrink-0">
                      <div className="h-36 w-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={metodoData}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={65}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {metodoData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {metodoData.map((item) => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                              <span className="truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="font-medium">{formatCurrency(item.value)}</span>
                              <span className="text-xs text-muted-foreground">({item.percentual.toFixed(0)}%)</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${item.percentual}%`, backgroundColor: item.fill }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Despesas por Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                {metodoDespesaData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center justify-center w-full sm:w-44 shrink-0">
                      <div className="h-36 w-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={metodoDespesaData}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={65}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {metodoDespesaData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {metodoDespesaData.map((item) => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                              <span className="truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="font-medium">{formatCurrency(item.value)}</span>
                              <span className="text-xs text-muted-foreground">({item.percentual.toFixed(0)}%)</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${item.percentual}%`, backgroundColor: item.fill }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
