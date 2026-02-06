'use client'

import { useState } from 'react'
import {
  LayoutDashboard, ArrowUpRight, ArrowDownRight, Repeat,
  AlertTriangle, FileBarChart, Plus, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VisaoGeral } from '@/components/financeiro/visao-geral'
import { ReceitasTab } from '@/components/financeiro/receitas-tab'
import { DespesasTab } from '@/components/financeiro/despesas-tab'
import { FluxoCaixaTab } from '@/components/financeiro/fluxo-caixa-tab'
import { InadimplenciaTab } from '@/components/financeiro/inadimplencia-tab'
import { RelatoriosTab } from '@/components/financeiro/relatorios-tab'

const periodos = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'mes_atual', label: 'Mês Atual' },
  { value: 'mes_anterior', label: 'Mês Anterior' },
  { value: 'trimestre', label: 'Trimestre' },
  { value: 'semestre', label: 'Semestre' },
  { value: 'ano', label: 'Ano' },
]

export function FinanceiroContent() {
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [periodo, setPeriodo] = useState('mes_atual')

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
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-44">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodos.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            value="inadimplencia"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Inadimplência
          </TabsTrigger>
          <TabsTrigger
            value="relatorios"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <FileBarChart className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="mt-6">
          <VisaoGeral periodo={periodo} />
        </TabsContent>

        <TabsContent value="receitas" className="mt-6">
          <ReceitasTab periodo={periodo} />
        </TabsContent>

        <TabsContent value="despesas" className="mt-6">
          <DespesasTab periodo={periodo} />
        </TabsContent>

        <TabsContent value="fluxo-caixa" className="mt-6">
          <FluxoCaixaTab periodo={periodo} />
        </TabsContent>

        <TabsContent value="inadimplencia" className="mt-6">
          <InadimplenciaTab periodo={periodo} />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6">
          <RelatoriosTab periodo={periodo} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
