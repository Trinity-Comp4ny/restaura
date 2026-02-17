'use client'

import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { Download, FileText, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUser } from '@/hooks/use-user'
import { useDadosReceitasExportacao, useDadosDespesasExportacao, useDadosConsolidadosExportacao } from '@/hooks/use-exportacao-dados'
import { 
  exportarReceitasPDF, 
  exportarDespesasPDF, 
  exportarConsolidadoPDF,
  exportarReceitasCSV,
  exportarDespesasCSV,
  exportarConsolidadoCSV
} from '@/lib/export-utils'
import { toast } from 'sonner'

interface RelatoriosTabProps {
  periodo: string
}

const reportOptions = [
  { id: 'receitas', label: 'Receitas', descricao: 'Relatório detalhado de todas as receitas.' },
  { id: 'despesas', label: 'Despesas', descricao: 'Relatório detalhado de todas as despesas.' },
  { id: 'consolidado', label: 'Consolidado', descricao: 'Receitas e despesas consolidadas em um único relatório.' },
]

const formatos = ['PDF', 'CSV'] as const

export function RelatoriosTab({ periodo }: RelatoriosTabProps) {
  const { data: user } = useUser()
  const clinicaId = user?.clinica_id
  const [periodoRelatorio, setPeriodoRelatorio] = useState<'7d' | '30d' | '90d' | 'mes' | 'ano' | 'todos'>(
    (['7d', '30d', '90d', 'mes', 'ano', 'todos'].includes(periodo) ? (periodo as any) : 'todos')
  )
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedReport, setSelectedReport] = useState(reportOptions[0].id)
  const [selectedFormat, setSelectedFormat] = useState<(typeof formatos)[number]>('PDF')
  const [emailDestino, setEmailDestino] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [pendingPreview, setPendingPreview] = useState(false)
  const report = reportOptions.find((item) => item.id === selectedReport) ?? reportOptions[0]

  // Hooks para buscar dados de exportação
  const { data: dadosReceitas, isLoading: loadingReceitas } = useDadosReceitasExportacao(clinicaId!, periodoRelatorio, startDate || undefined, endDate || undefined)
  const { data: dadosDespesas, isLoading: loadingDespesas } = useDadosDespesasExportacao(clinicaId!, periodoRelatorio, startDate || undefined, endDate || undefined)
  const { data: dadosConsolidados, isLoading: loadingConsolidado } = useDadosConsolidadosExportacao(clinicaId!, periodoRelatorio, startDate || undefined, endDate || undefined)

  const handleExport = async () => {
    if (!clinicaId) {
      toast.error('Clínica não encontrada')
      return
    }

    setIsExporting(true)

    try {
      switch (selectedReport) {
        case 'receitas':
          if (!dadosReceitas || dadosReceitas.length === 0) {
            toast.error('Nenhuma receita encontrada para o período selecionado')
            return
          }
          
          if (selectedFormat === 'PDF') {
            exportarReceitasPDF(dadosReceitas, periodoRelatorio)
          } else if (selectedFormat === 'CSV') {
            exportarReceitasCSV(dadosReceitas)
          }
          toast.success(`Relatório de receitas exportado em ${selectedFormat}!`)
          break

        case 'despesas':
          if (!dadosDespesas || dadosDespesas.length === 0) {
            toast.error('Nenhuma despesa encontrada para o período selecionado')
            return
          }
          
          if (selectedFormat === 'PDF') {
            exportarDespesasPDF(dadosDespesas, periodoRelatorio)
          } else if (selectedFormat === 'CSV') {
            exportarDespesasCSV(dadosDespesas)
          }
          toast.success(`Relatório de despesas exportado em ${selectedFormat}!`)
          break

        case 'consolidado':
          if (!dadosConsolidados || (!dadosConsolidados.receitas.length && !dadosConsolidados.despesas.length)) {
            toast.error('Nenhuma transação encontrada para o período selecionado')
            return
          }
          
          if (selectedFormat === 'PDF') {
            exportarConsolidadoPDF(dadosConsolidados, periodoRelatorio)
          } else if (selectedFormat === 'CSV') {
            exportarConsolidadoCSV(dadosConsolidados)
          }
          toast.success(`Relatório consolidado exportado em ${selectedFormat}!`)
          break

        default:
          toast.error('Este tipo de relatório ainda não está disponível')
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      toast.error('Erro ao exportar relatório. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  const isLoading = loadingReceitas || loadingDespesas || loadingConsolidado

  const generatePreview = () => {
    setPreviewError(null)
    setIsPreviewing(true)

    try {
      switch (selectedReport) {
        case 'receitas':
          setPreviewData(dadosReceitas || [])
          if (!dadosReceitas || dadosReceitas.length === 0) {
            setPreviewError('Nenhuma receita encontrada para o período selecionado')
          }
          break
        case 'despesas':
          setPreviewData(dadosDespesas || [])
          if (!dadosDespesas || dadosDespesas.length === 0) {
            setPreviewError('Nenhuma despesa encontrada para o período selecionado')
          }
          break
        case 'consolidado':
          if (!dadosConsolidados || (!dadosConsolidados.receitas.length && !dadosConsolidados.despesas.length)) {
            setPreviewData([])
            setPreviewError('Nenhuma transação encontrada para o período selecionado')
          } else {
            setPreviewData([
              ...dadosConsolidados.receitas.map((r) => ({ ...r, tipo: 'Receita' })),
              ...dadosConsolidados.despesas.map((d) => ({ ...d, tipo: 'Despesa' })),
            ])
          }
          break
        default:
          setPreviewData([])
          setPreviewError('Este tipo de relatório ainda não está disponível')
      }
    } finally {
      setIsPreviewing(false)
    }
  }

  const handlePreview = () => {
    if (!clinicaId) {
      toast.error('Clínica não encontrada')
      return
    }

    // Se ainda estiver carregando, agenda a pré-visualização para quando terminar
    if (isLoading) {
      setPendingPreview(true)
      setPreviewError('Carregando dados... assim que terminar, mostraremos a pré-visualização.')
      return
    }

    generatePreview()
  }

  useEffect(() => {
    if (pendingPreview && !isLoading) {
      generatePreview()
      setPendingPreview(false)
    }
  }, [pendingPreview, isLoading, selectedReport, dadosReceitas, dadosDespesas, dadosConsolidados])

  useEffect(() => {
    if (['7d', '30d', '90d', 'mes', 'ano', 'todos'].includes(periodo)) {
      setPeriodoRelatorio(periodo as typeof periodoRelatorio)
    }
  }, [periodo])

  // Requer nova pré-visualização quando filtros mudam
  useEffect(() => {
    if (!clinicaId) return
    setPendingPreview(true)
  }, [clinicaId, selectedReport, periodoRelatorio, startDate, endDate])

  const previewHeaders = useMemo(() => {
    if (selectedReport === 'consolidado') {
      return ['Tipo', 'Data', 'Descrição', 'Paciente', 'Categoria', 'Valor Bruto', 'Valor Líquido', 'Status']
    }
    return ['Data', 'Descrição', 'Paciente', 'Categoria', 'Valor Bruto', 'Valor Líquido', 'Status']
  }, [selectedReport])

  return (
    <div className="grid gap-4 md:grid-cols-[380px,1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Configurar relatório
          </CardTitle>
          <CardDescription>Escolha o tipo, intervalo de datas e formato. Pré-visualize antes de exportar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
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
              <p className="text-xs text-muted-foreground mb-1">Período do relatório</p>
              <Select value={periodoRelatorio} onValueChange={(value) => setPeriodoRelatorio(value as typeof periodoRelatorio)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="mes">Mês atual</SelectItem>
                  <SelectItem value="ano">Ano atual</SelectItem>
                  <SelectItem value="todos">Todos (sem filtro)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">Você pode usar datas personalizadas abaixo para sobrepor o período.</p>
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
            <div className="grid grid-cols-1 gap-2">
              <p className="text-xs text-muted-foreground mb-1">Datas personalizadas (opcional)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Início</p>
                  <Input type="date" value={startDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Fim</p>
                  <Input type="date" value={endDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>Quando preencher datas, o período acima é ignorado.</span>
                {(startDate || endDate) && (
                  <Button variant="ghost" size="sm" className="h-8" onClick={() => { setStartDate(''); setEndDate('') }}>
                    Limpar datas
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Button 
              variant="secondary"
              onClick={handlePreview}
              disabled={isLoading || isPreviewing || !clinicaId}
            >
              {isPreviewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando pré-visualização...
                </>
              ) : (
                'Pré-visualizar dados'
              )}
            </Button>
            <Button 
              className="w-full md:w-auto" 
              onClick={handleExport}
              disabled={isExporting || isLoading || !clinicaId}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Pré-visualização
          </CardTitle>
          <CardDescription>Veja os dados filtrados antes de exportar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {previewError && (
            <p className="text-sm text-red-600">{previewError}</p>
          )}
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando dados...
            </div>
          ) : previewData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado para exibir. Ajuste o filtro e clique em pré-visualizar.</p>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewHeaders.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((item, idx) => (
                    <TableRow key={item.id || idx}>
                      {selectedReport === 'consolidado' && <TableCell>{item.tipo}</TableCell>}
                      <TableCell>{item.data_vencimento ? item.data_vencimento : '-'}</TableCell>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell>{item.paciente_nome || 'N/A'}</TableCell>
                      <TableCell>{item.categoria || '-'}</TableCell>
                      <TableCell className="text-right">{item.valor_bruto ?? '-'}</TableCell>
                      <TableCell className="text-right">{item.valor_liquido ?? '-'}</TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
