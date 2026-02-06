'use client'

import { useState } from 'react'
import { DollarSign, Receipt, CreditCard, FileText, Shield, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResumoFinanceiro } from '@/components/pacientes/tabs/financeiro/resumo-financeiro'
import { TransacoesTab } from '@/components/pacientes/tabs/financeiro/transacoes-tab'
import { ParcelasTab } from '@/components/pacientes/tabs/financeiro/parcelas-tab'
import { OrcamentosTab } from '@/components/pacientes/tabs/financeiro/orcamentos-tab'
import { ConvenioTab } from '@/components/pacientes/tabs/financeiro/convenio-tab'

interface FinancialTabProps {
  pacienteId: string
}

export function FinancialTab({ pacienteId }: FinancialTabProps) {
  const [activeTab, setActiveTab] = useState('resumo')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Gestão financeira completa do paciente</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Extrato Completo
        </Button>
      </div>

      {/* Sub-abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0 border-b rounded-none">
          <TabsTrigger
            value="resumo"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="transacoes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <Receipt className="mr-2 h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger
            value="parcelas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Parcelas
          </TabsTrigger>
          <TabsTrigger
            value="orcamentos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <FileText className="mr-2 h-4 w-4" />
            Orçamentos
          </TabsTrigger>
          <TabsTrigger
            value="convenio"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
          >
            <Shield className="mr-2 h-4 w-4" />
            Convênio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-6">
          <ResumoFinanceiro pacienteId={pacienteId} />
        </TabsContent>

        <TabsContent value="transacoes" className="mt-6">
          <TransacoesTab pacienteId={pacienteId} />
        </TabsContent>

        <TabsContent value="parcelas" className="mt-6">
          <ParcelasTab pacienteId={pacienteId} />
        </TabsContent>

        <TabsContent value="orcamentos" className="mt-6">
          <OrcamentosTab pacienteId={pacienteId} />
        </TabsContent>

        <TabsContent value="convenio" className="mt-6">
          <ConvenioTab pacienteId={pacienteId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
