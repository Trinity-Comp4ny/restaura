'use client'

import { useState, useMemo } from 'react'
import {
  TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatCurrency, getLocalISODate } from '@/lib/utils'
import { useUser } from '@/hooks/use-user'
import {
  useFluxoCaixaResumo,
  useFluxoCaixaDiario,
  useContasPagar,
  useContasReceber,
  useProjecaoSemanal,
  useFluxoCaixaMensal,
  useFluxoCaixaAnual
} from '@/hooks/use-fluxo-caixa'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'

interface FluxoCaixaTabProps {
  periodo: string
  customRange?: { startDate: string; endDate: string }
}

type Visao = 'diario' | 'semanal' | 'mensal' | 'anual'

const VISAO_LABELS: Record<Visao, string> = {
  diario: 'Diário',
  semanal: 'Semanal',
  mensal: 'Mensal',
  anual: 'Anual',
}

function getPeriodoRange(periodo: string, customRange?: { startDate: string; endDate: string }) {
  const hoje = new Date()
  let inicio = new Date(hoje)
  let fim = new Date(hoje)

  switch (periodo) {
    case 'hoje':
      break
    case 'semana_atual': {
      const day = inicio.getDay()
      const diff = day === 0 ? 6 : day - 1
      inicio.setDate(inicio.getDate() - diff)
      fim = new Date(inicio)
      fim.setDate(inicio.getDate() + 6)
      break
    }
    case 'mes_atual': {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      break
    }
    case 'mes_anterior': {
      const ano = hoje.getMonth() === 0 ? hoje.getFullYear() - 1 : hoje.getFullYear()
      const mes = hoje.getMonth() === 0 ? 11 : hoje.getMonth() - 1
      inicio = new Date(ano, mes, 1)
      fim = new Date(ano, mes + 1, 0)
      break
    }
    case 'ano': {
      inicio = new Date(hoje.getFullYear(), 0, 1)
      fim = new Date(hoje.getFullYear(), 11, 31)
      break
    }
    case 'personalizado': {
      if (customRange?.startDate && customRange?.endDate) {
        inicio = new Date(customRange.startDate + 'T00:00:00')
        fim = new Date(customRange.endDate + 'T00:00:00')
      }
      break
    }
    default:
      // fallback
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      break
  }

  return {
    inicio: getLocalISODate(inicio),
    fim: getLocalISODate(fim)
  }
}

function getSmartDefaultVisao(periodo: string): Visao {
  switch (periodo) {
    case 'hoje': return 'diario'
    case 'semana_atual': return 'diario'
    case 'mes_atual': return 'diario'
    case 'mes_anterior': return 'diario'
    case 'ano': return 'mensal'
    case 'personalizado': return 'diario'
    default: return 'diario'
  }
}

function getAvailableVisoes(periodo: string): { value: Visao; label: string }[] {
  switch (periodo) {
    case 'hoje':
      return [{ value: 'diario', label: 'Diário' }]
    case 'semana_atual':
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

const visaoTitulos: Record<Visao, { titulo: string; descricao: string }> = {
  diario: { titulo: 'Fluxo de Caixa Diário', descricao: 'Entradas e saídas por dia' },
  semanal: { titulo: 'Fluxo de Caixa Semanal', descricao: 'Entradas e saídas por semana' },
  mensal: { titulo: 'Fluxo de Caixa Mensal', descricao: 'Entradas e saídas consolidadas por mês' },
  anual: { titulo: 'Fluxo de Caixa Anual', descricao: 'Visão macro por ano fiscal' },
}

const getVisaoLabel = (visao: Visao) => VISAO_LABELS[visao] || visao

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

export function FluxoCaixaTab({ periodo, customRange }: FluxoCaixaTabProps) {
  const { data: user } = useUser()
  const clinicaId = user?.clinica_id || ''

  const smartDefault = useMemo(() => getSmartDefaultVisao(periodo), [periodo])
  const [visaoManual, setVisaoManual] = useState<Visao | null>(null)

  const availableVisoes = useMemo(() => getAvailableVisoes(periodo), [periodo])
  const visao: Visao = useMemo(() => {
    if (visaoManual && availableVisoes.some(v => v.value === visaoManual)) {
      return visaoManual
    }
    return smartDefault
  }, [visaoManual, smartDefault, availableVisoes])

  const periodoRange = useMemo(() => getPeriodoRange(periodo, customRange), [periodo, customRange])

  // Hooks - all use the global period range
  const { data: resumo, isLoading: isLoadingResumo } = useFluxoCaixaResumo(clinicaId, periodoRange)
  const { data: fluxoDiario, isLoading: isLoadingDiario } = useFluxoCaixaDiario(clinicaId, periodoRange)
  const { data: contasPagar, isLoading: isLoadingPagar } = useContasPagar(clinicaId, 30)
  const { data: contasReceber, isLoading: isLoadingReceber } = useContasReceber(clinicaId, 30)
  const { data: projecao, isLoading: isLoadingProjecao } = useProjecaoSemanal(clinicaId, 4, periodoRange)
  const { data: fluxoMensal, isLoading: isLoadingMensal } = useFluxoCaixaMensal(clinicaId, 3, 9, periodoRange)
  const { data: fluxoAnual, isLoading: isLoadingAnual } = useFluxoCaixaAnual(clinicaId, 1, 1, periodoRange)

  const isLoading = isLoadingResumo || isLoadingDiario || isLoadingPagar || isLoadingReceber || isLoadingProjecao || isLoadingMensal || isLoadingAnual

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
          saldo: (entradasPagas + entradasPrev) - (saidasPagas + saidasPrev),
        }
      })

    switch (visao) {
      case 'diario': return normalize(fluxoDiario || [])
      case 'semanal': return normalize(projecao || [])
      case 'mensal': return normalize(fluxoMensal || [])
      case 'anual': return normalize(fluxoAnual || [])
      default: return []
    }
  }, [visao, fluxoDiario, projecao, fluxoMensal, fluxoAnual])

  const saldoReferencia = resumo?.saldo_atual || 0
  const info = visaoTitulos[visao]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-20 mb-2 animate-pulse" />
                <div className="h-8 bg-muted rounded w-28 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-72 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Saldo Atual</p>
                <p className="text-2xl font-bold">{formatCurrency(saldoReferencia)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">A Receber</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo?.total_a_receber || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">A Pagar</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(resumo?.total_a_pagar || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between space-y-0 pb-2">
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">{info.titulo}</p>
            <p className="text-sm text-muted-foreground">{info.descricao}</p>
          </div>
          <div className="flex items-center gap-3 sm:ml-auto">
            <Select value={visao} onValueChange={(v) => setVisaoManual(v as Visao)}>
              <SelectTrigger className="w-36">
                <span className="truncate text-left">{getVisaoLabel(visao)}</span>
              </SelectTrigger>
              <SelectContent>
                {availableVisoes.map((v) => (
                  <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum dado para o período selecionado.</p>
            </div>
          ) : (
            <div className="h-80">
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
                    tickFormatter={(v: number) => {
                      if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
                      return v.toString()
                    }}
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

      {/* Contas a Pagar e Receber */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              Próximas Contas a Receber
            </CardTitle>
            <CardDescription>Parcelas e pagamentos esperados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contasReceber?.slice(0, 5).map((conta) => (
              <div key={conta.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{conta.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {conta.paciente ? `${conta.paciente} • ` : ''}Parcela {conta.numero_parcela}/{conta.total_parcelas} • Venc: {formatDate(conta.vencimento)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {conta.status === 'vencido' && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Vencido</Badge>
                  )}
                  <span className="text-sm font-semibold text-green-600">+{formatCurrency(conta.valor)}</span>
                </div>
              </div>
            ))}
            {(!contasReceber || contasReceber.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma conta a receber nos próximos 30 dias</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              Próximas Contas a Pagar
            </CardTitle>
            <CardDescription>Vencimentos próximos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contasPagar?.slice(0, 5).map((conta) => (
              <div key={conta.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{conta.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {conta.categoria} • Parcela {conta.numero_parcela}/{conta.total_parcelas} • Venc: {formatDate(conta.vencimento)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {conta.status === 'vencido' && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Vencido</Badge>
                  )}
                  <span className="text-sm font-semibold text-red-600">-{formatCurrency(conta.valor)}</span>
                </div>
              </div>
            ))}
            {(!contasPagar || contasPagar.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma conta a pagar nos próximos 30 dias</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
