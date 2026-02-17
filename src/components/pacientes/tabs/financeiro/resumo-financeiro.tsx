'use client'

import { TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle, Clock, CreditCard, Wallet } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useResumoFinanceiroPaciente, useTransacoesPaciente } from '@/hooks/use-financeiro-paciente'

interface ResumoFinanceiroProps {
  pacienteId: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pago: { label: 'Pago', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  vencido: { label: 'Vencido', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: AlertCircle },
}

export function ResumoFinanceiro({ pacienteId }: ResumoFinanceiroProps) {
  const { data: resumo, isLoading } = useResumoFinanceiroPaciente(pacienteId)
  const { data: transacoes } = useTransacoesPaciente(pacienteId)
  
  if (isLoading || !resumo) {
    return <div>Carregando...</div>
  }
  
  const percentualPago = Math.round((resumo.total_pago / resumo.total_geral) * 100)

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo.total_pago)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(resumo.total_pendente)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Vencido</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(resumo.total_vencido)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Total Geral</p>
                <p className="text-2xl font-bold">{formatCurrency(resumo.total_geral)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso de Pagamento + Info Rápida */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Progresso de Pagamento</CardTitle>
            <CardDescription>Acompanhamento do valor total do tratamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(resumo.total_pago)} de {formatCurrency(resumo.total_geral)}
              </span>
              <span className="font-medium">{percentualPago}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${percentualPago}%` }}
              />
            </div>

            {/* Barra visual mensal */}
            <div className="pt-4">
              <p className="text-sm font-medium mb-3">Histórico de Transações</p>
              <div className="flex items-end gap-2">
                {transacoes?.slice(0, 6).map((item: any, i: number) => (
                  <div key={i} className="flex-1 text-center">
                    <div className="relative mx-auto mb-1">
                      <div
                        className={`mx-auto w-full rounded-t transition-colors ${
                          item.status === 'pago'
                            ? 'bg-green-500'
                            : item.status === 'vencido'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ height: `${Math.max((item.valor / 500) * 60, 12)}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.data).toLocaleDateString('pt-BR', { month: 'short' })}
                    </span>
                    <p className="text-xs font-medium">{formatCurrency(item.valor)}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ticket Médio</span>
                <span className="text-sm font-medium">{formatCurrency(resumo.ticket_medio)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Último Pagamento</span>
                <span className="text-sm font-medium">{resumo.ultimo_pagamento ? formatDate(resumo.ultimo_pagamento) : 'N/A'}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Próximo Vencimento</span>
                <span className="text-sm font-medium text-yellow-600">{resumo.proximo_vencimento ? formatDate(resumo.proximo_vencimento) : 'N/A'}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Orçamentos</span>
                <span className="text-sm font-medium">{formatCurrency(resumo.total_orcamentos)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Aprovados</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(resumo.orcamentos_aprovados)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Movimentações + Distribuição */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimas Movimentações</CardTitle>
            <CardDescription>Movimentações financeiras recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transacoes?.slice(0, 5).map((mov: any) => {
                const config = statusConfig[mov.status]
                return (
                  <div key={mov.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        mov.status === 'pago' ? 'bg-green-100 dark:bg-green-900' :
                        mov.status === 'pendente' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-red-100 dark:bg-red-900'
                      }`}>
                        <config.icon className={`h-4 w-4 ${
                          mov.status === 'pago' ? 'text-green-600' :
                          mov.status === 'pendente' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{mov.descricao}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(mov.data)} • {mov.metodo_pagamento}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge className={config.color}>{config.label}</Badge>
                      <span className="text-sm font-semibold">{formatCurrency(mov.valor)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Método</CardTitle>
            <CardDescription>Como o paciente costuma pagar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                // Calculate distribution from real transactions
                const distribution = transacoes?.reduce((acc: any, trans: any) => {
                  const method = trans.metodo_pagamento || 'Outros'
                  if (!acc[method]) {
                    acc[method] = { valor: 0, count: 0 }
                  }
                  acc[method].valor += trans.valor || 0
                  acc[method].count += 1
                  return acc
                }, {}) || {}

                const total = (Object.values(distribution) as any[]).reduce((sum: number, item: any) => sum + item.valor, 0)
                
                return Object.entries(distribution).map(([metodo, data]: [string, any], i: number) => ({
                  metodo,
                  valor: data.valor,
                  percentual: total > 0 ? Math.round((data.valor / total) * 100) : 0
                }))
              })().map((item, i) => {
                const colors = ['bg-primary', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500']
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${colors[i % colors.length]}`} />
                        <span>{item.metodo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.percentual}%</span>
                        <span className="font-medium">{formatCurrency(item.valor)}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${colors[i % colors.length]} transition-all`}
                        style={{ width: `${item.percentual}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
