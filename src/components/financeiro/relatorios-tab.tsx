'use client'

import { useState } from 'react'
import { Download, FileText, Calendar, Printer, Share2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface RelatoriosTabProps {
  periodo: string
}

const reportOptions = [
  { id: 'dre', label: 'DRE Completo', descricao: 'Receita, custos e despesas consolidadas.' },
  { id: 'dentista', label: 'Resultado por Profissional', descricao: 'Receita, custo e margem por dentista.' },
  { id: 'procedimento', label: 'Resultado por Procedimento', descricao: 'Volume, ticket médio e margem por tratamento.' },
  { id: 'fluxo', label: 'Fluxo de Caixa', descricao: 'Entradas, saídas e projeções.' },
  { id: 'inadimplencia', label: 'Relatório de Cobranças', descricao: 'Parcelas vencidas e histórico de contato.' },
]

const formatos = ['PDF', 'Excel', 'CSV'] as const

const mockHistorico = [
  { id: 1, data: '05/02/2026', relatorio: 'DRE Completo', formato: 'PDF' },
  { id: 2, data: '29/01/2026', relatorio: 'Resultado por Profissional', formato: 'Excel' },
  { id: 3, data: '22/01/2026', relatorio: 'Fluxo de Caixa', formato: 'CSV' },
]

export function RelatoriosTab({ periodo }: RelatoriosTabProps) {
  const [selectedReport, setSelectedReport] = useState(reportOptions[0].id)
  const [selectedFormat, setSelectedFormat] = useState<(typeof formatos)[number]>('PDF')
  const [emailDestino, setEmailDestino] = useState('')
  const report = reportOptions.find((item) => item.id === selectedReport) ?? reportOptions[0]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Exportar relatório
          </CardTitle>
          <CardDescription>Selecione o relatório e o formato para gerar o arquivo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tipo de relatório</p>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {reportOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">{report.descricao}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Formato</p>
              <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as (typeof formatos)[number])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatos.map((formato) => (
                    <SelectItem key={formato} value={formato}>
                      {formato}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full md:w-auto" onClick={() => console.log('Exportar relatório')}><Download className="h-4 w-4 mr-2" /> Exportar</Button>
        </CardContent>
      </Card>
    </div>
  )
}
