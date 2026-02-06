'use client'

import { useState } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight,
  Users, Stethoscope, Calendar, CreditCard, Banknote, QrCode, Building2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

interface VisaoGeralProps {
  periodo: string
}

const mockKPIs = {
  receitaBruta: 68450.00,
  receitaVariacao: 14.2,
  despesaTotal: 22180.00,
  despesaVariacao: -3.8,
  lucroLiquido: 46270.00,
  lucroVariacao: 22.1,
  margemLiquida: 67.6,
  aReceber: 12350.00,
  aReceberQtd: 8,
  ticketMedio: 485.00,
  ticketVariacao: 6.3,
  totalPacientesAtendidos: 141,
  pacientesVariacao: 8.5,
  totalConsultas: 186,
  consultasVariacao: 11.2,
  taxaConversao: 78,
}

const mockReceitaMensal = [
  { mes: 'Jul', receita: 42000, despesa: 18000 },
  { mes: 'Ago', receita: 48000, despesa: 19500 },
  { mes: 'Set', receita: 51000, despesa: 20000 },
  { mes: 'Out', receita: 55000, despesa: 21000 },
  { mes: 'Nov', receita: 59900, despesa: 23100 },
  { mes: 'Dez', receita: 68450, despesa: 22180 },
]

const mockReceitaPorCategoria = [
  { categoria: 'Procedimentos Gerais', valor: 28500, percentual: 41.6, cor: 'bg-primary' },
  { categoria: 'Ortodontia', valor: 14200, percentual: 20.7, cor: 'bg-blue-500' },
  { categoria: 'Implantes', valor: 11800, percentual: 17.2, cor: 'bg-purple-500' },
  { categoria: 'Estética', valor: 8350, percentual: 12.2, cor: 'bg-pink-500' },
  { categoria: 'Consultas', valor: 3600, percentual: 5.3, cor: 'bg-orange-500' },
  { categoria: 'Outros', valor: 2000, percentual: 2.9, cor: 'bg-gray-400' },
]

const mockDespesasPorCategoria = [
  { categoria: 'Pessoal', valor: 5000.00, percentual: 36.2, cor: 'bg-blue-500' },
  { categoria: 'Infraestrutura', valor: 5180.00, percentual: 37.5, cor: 'bg-orange-500' },
  { categoria: 'Materiais', valor: 1075.00, percentual: 7.8, cor: 'bg-purple-500' },
  { categoria: 'Marketing', valor: 1200.00, percentual: 8.7, cor: 'bg-pink-500' },
  { categoria: 'Serviços', valor: 950.00, percentual: 6.9, cor: 'bg-teal-500' },
  { categoria: 'Outros', valor: 749.00, percentual: 5.4, cor: 'bg-gray-400' },
]

const mockReceitaPorMetodo = [
  { metodo: 'PIX', valor: 22100, percentual: 32.3, icon: QrCode },
  { metodo: 'Cartão de Crédito', valor: 18900, percentual: 27.6, icon: CreditCard },
  { metodo: 'Convênio', valor: 14200, percentual: 20.7, icon: Building2 },
  { metodo: 'Cartão de Débito', valor: 7800, percentual: 11.4, icon: CreditCard },
  { metodo: 'Dinheiro', valor: 5450, percentual: 8.0, icon: Banknote },
]

const mockTopDentistas = [
  { nome: 'Dr. Ricardo Almeida', especialidade: 'Implantodontia', receita: 24500, consultas: 52 },
  { nome: 'Dra. Camila Santos', especialidade: 'Ortodontia', receita: 19800, consultas: 48 },
  { nome: 'Dr. Felipe Oliveira', especialidade: 'Endodontia', receita: 14200, consultas: 45 },
  { nome: 'Dra. Ana Costa', especialidade: 'Estética', receita: 9950, consultas: 41 },
]

const mockTopProcedimentos = [
  { procedimento: 'Implante Unitário', quantidade: 18, receita: 11800, ticketMedio: 655.56 },
  { procedimento: 'Manutenção Ortodôntica', quantidade: 62, receita: 9300, ticketMedio: 150.00 },
  { procedimento: 'Clareamento a Laser', quantidade: 14, receita: 8400, ticketMedio: 600.00 },
  { procedimento: 'Restauração Classe II', quantidade: 45, receita: 6750, ticketMedio: 150.00 },
  { procedimento: 'Limpeza / Profilaxia', quantidade: 72, receita: 5400, ticketMedio: 75.00 },
]

export function VisaoGeral({ periodo }: VisaoGeralProps) {
  const maxReceita = Math.max(...mockReceitaMensal.map(m => m.receita))

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Bruta</CardTitle>
            <div className="rounded-full p-2 bg-green-100 dark:bg-green-900">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockKPIs.receitaBruta)}</div>
            <p className="mt-1 flex items-center text-xs">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{mockKPIs.receitaVariacao}%</span>
              <span className="ml-1 text-muted-foreground">vs. mês anterior</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            <div className="rounded-full p-2 bg-red-100 dark:bg-red-900">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockKPIs.despesaTotal)}</div>
            <p className="mt-1 flex items-center text-xs">
              <ArrowDownRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">{mockKPIs.despesaVariacao}%</span>
              <span className="ml-1 text-muted-foreground">vs. mês anterior</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockKPIs.lucroLiquido)}</div>
            <p className="mt-1 flex items-center text-xs">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{mockKPIs.lucroVariacao}%</span>
              <span className="ml-1 text-muted-foreground">Margem: {mockKPIs.margemLiquida}%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber</CardTitle>
            <div className="rounded-full p-2 bg-yellow-100 dark:bg-yellow-900">
              <Wallet className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockKPIs.aReceber)}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {mockKPIs.aReceberQtd} parcelas pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Receita x Despesa + Receita por Categoria */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Receita vs Despesa</CardTitle>
            <CardDescription>Evolução mensal dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-52">
              {mockReceitaMensal.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end justify-center" style={{ height: '180px' }}>
                    <div
                      className="flex-1 max-w-6 bg-green-500 rounded-t transition-all"
                      style={{ height: `${(item.receita / maxReceita) * 160}px` }}
                      title={`Receita: ${formatCurrency(item.receita)}`}
                    />
                    <div
                      className="flex-1 max-w-6 bg-red-400 rounded-t transition-all"
                      style={{ height: `${(item.despesa / maxReceita) * 160}px` }}
                      title={`Despesa: ${formatCurrency(item.despesa)}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.mes}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-green-500" />
                <span className="text-muted-foreground">Receita</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-red-400" />
                <span className="text-muted-foreground">Despesa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita por Categoria</CardTitle>
            <CardDescription>Distribuição no período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockReceitaPorCategoria.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${cat.cor}`} />
                    <span>{cat.categoria}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(cat.valor)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div className={`h-1.5 rounded-full ${cat.cor} transition-all`} style={{ width: `${cat.percentual}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Método de Pagamento + Top Dentistas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita por Método de Pagamento</CardTitle>
            <CardDescription>Como seus pacientes pagam</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockReceitaPorMetodo.map((item, i) => {
              const Icon = item.icon
              const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-gray-500']
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{item.metodo}</span>
                      <span>{formatCurrency(item.valor)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className={`h-1.5 rounded-full ${colors[i]} transition-all`} style={{ width: `${item.percentual}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{item.percentual}%</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita por Profissional</CardTitle>
            <CardDescription>Ranking de faturamento no período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockTopDentistas.map((dentista, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {i + 1}º
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{dentista.nome}</p>
                  <p className="text-xs text-muted-foreground">{dentista.especialidade} • {dentista.consultas} consultas</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(dentista.receita)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Procedimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Procedimentos por Receita</CardTitle>
          <CardDescription>Procedimentos que mais geram faturamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTopProcedimentos.map((proc, i) => {
              const maxVal = mockTopProcedimentos[0].receita
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{proc.procedimento}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">{proc.quantidade}x</span>
                        <span className="text-xs text-muted-foreground">Ticket: {formatCurrency(proc.ticketMedio)}</span>
                        <span className="font-semibold">{formatCurrency(proc.receita)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${(proc.receita / maxVal) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
