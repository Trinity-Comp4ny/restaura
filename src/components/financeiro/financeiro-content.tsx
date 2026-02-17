'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  LayoutDashboard, ArrowUpRight, ArrowDownRight, Repeat,
  FileBarChart, Plus, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPeriodoLabel } from '@/lib/date-filters'

const TabSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-wrap gap-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-9 w-32" />
      ))}
    </div>
    <Skeleton className="h-64 w-full" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  </div>
)

const VisaoGeral = dynamic(() => import('@/components/financeiro/visao-geral').then(mod => ({ default: mod.VisaoGeral })), {
  loading: () => <TabSkeleton />
})
const ReceitasTab = dynamic(() => import('@/components/financeiro/receitas-tab').then(mod => ({ default: mod.ReceitasTab })), {
  loading: () => <TabSkeleton />
})
const DespesasTab = dynamic(() => import('@/components/financeiro/despesas-tab').then(mod => ({ default: mod.DespesasTab })), {
  loading: () => <TabSkeleton />
})
const FluxoCaixaTab = dynamic(() => import('@/components/financeiro/fluxo-caixa-tab').then(mod => ({ default: mod.FluxoCaixaTab })), {
  loading: () => <TabSkeleton />
})
const RelatoriosTab = dynamic(() => import('@/components/financeiro/relatorios-tab').then(mod => ({ default: mod.RelatoriosTab })), {
  loading: () => <TabSkeleton />
})

const periodos = [
  'hoje',
  'semana_atual',
  'mes_atual',
  'mes_anterior',
  'ano',
  'personalizado',
] as const

export function FinanceiroContent() {
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [periodo, setPeriodo] = useState('mes_atual')
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')

  const customRange = periodo === 'personalizado' && customStart && customEnd
    ? { startDate: customStart, endDate: customEnd }
    : undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Gestão financeira completa da sua clínica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={periodo}
            onValueChange={(value) => {
              setPeriodo(value)
              if (value !== 'personalizado') {
                setCustomStart('')
                setCustomEnd('')
              }
            }}
          >
            <SelectTrigger className="w-44">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="truncate text-left">{formatPeriodoLabel(periodo)}</span>
            </SelectTrigger>
            <SelectContent>
              {periodos.map((p) => (
                <SelectItem key={p} value={p}>{formatPeriodoLabel(p)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {periodo === 'personalizado' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-muted-foreground text-sm">até</span>
              <input
                type="date"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sub-abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0 border-b rounded-none">
          <TabsTrigger
            value="visao-geral"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="receitas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Receitas
          </TabsTrigger>
          <TabsTrigger
            value="despesas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <ArrowDownRight className="mr-2 h-4 w-4" />
            Despesas
          </TabsTrigger>
          <TabsTrigger
            value="fluxo-caixa"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <Repeat className="mr-2 h-4 w-4" />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger
            value="relatorios"
            disabled
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2 opacity-50 cursor-not-allowed"
          >
            <FileBarChart className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="mt-6">
          <VisaoGeral periodo={periodo} customRange={customRange} />
        </TabsContent>

        <TabsContent value="receitas" className="mt-6">
          <ReceitasTab periodo={periodo} customRange={customRange} />
        </TabsContent>

        <TabsContent value="despesas" className="mt-6">
          <DespesasTab periodo={periodo} customRange={customRange} />
        </TabsContent>

        <TabsContent value="fluxo-caixa" className="mt-6">
          <FluxoCaixaTab periodo={periodo} customRange={customRange} />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6">
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            A aba de relatórios está temporariamente indisponível.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
