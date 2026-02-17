'use client'

import { useState } from 'react'
import { Plus, CheckCircle, Clock, AlertCircle, AlertTriangle, Send, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useParcelasPaciente } from '@/hooks/use-financeiro-paciente'

interface ParcelasTabProps {
  pacienteId: string
}

const statusParcelaConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pago: { label: 'Pago', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  vencido: { label: 'Vencido', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: AlertCircle },
  a_vencer: { label: 'A Vencer', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: Calendar },
}

const statusPlanoConfig: Record<string, { label: string; color: string }> = {
  ativo: { label: 'Ativo', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  quitado: { label: 'Quitado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  inadimplente: { label: 'Inadimplente', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
}

export function ParcelasTab({ pacienteId }: ParcelasTabProps) {
  const { data: parcelas = [], isLoading } = useParcelasPaciente(pacienteId)
  const [expandedPlano, setExpandedPlano] = useState<string | null>(null)
  const [showNovoPlano, setShowNovoPlano] = useState(false)
  const [filterStatus, setFilterStatus] = useState('todos')

  if (isLoading) {
    return <div>Carregando...</div>
  }

  // Group parcelas by plano
  const planos = parcelas.reduce((acc: any, p: any) => {
    const planoId = p.plano_id || 'sem-plano'
    if (!acc[planoId]) {
      acc[planoId] = {
        id: planoId,
        tratamento: p.tratamento || 'Sem tratamento',
        valorTotal: (acc[planoId]?.valorTotal || 0) + (p.valor || 0),
        entrada: 0,
        numParcelas: 0,
        valorParcela: p.valor || 0,
        dataInicio: p.data_vencimento || '',
        status: 'ativo',
        parcelas: []
      }
    }
    acc[planoId].parcelas.push(p)
    acc[planoId].numParcelas = acc[planoId].parcelas.length
    return acc
  }, {})

  const planosArray = Object.values(planos)

  const totalVencido = planosArray.reduce((sum: number, plano: any) =>
    sum + plano.parcelas.filter((p: any) => p.status === 'vencido').reduce((s: number, p: any) => s + (p.valor || 0), 0), 0)
  const totalPendente = planosArray.reduce((sum: number, plano: any) =>
    sum + plano.parcelas.filter((p: any) => p.status === 'pendente' || p.status === 'a_vencer').reduce((s: number, p: any) => s + (p.valor || 0), 0), 0)
  const totalPago = planosArray.reduce((sum: number, plano: any) =>
    sum + plano.parcelas.filter((p: any) => p.status === 'pago').reduce((s: number, p: any) => s + (p.valor || 0), 0), 0)

  const filteredPlanos = filterStatus === 'todos'
    ? planosArray
    : planosArray.filter((p: any) => p.status === filterStatus)

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {totalVencido > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Existem parcelas vencidas no valor total de {formatCurrency(totalVencido)}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">Considere enviar uma cobrança ao paciente</p>
            </div>
            <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              <Send className="mr-2 h-3 w-3" />
              Enviar Cobrança
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Planos Ativos</p>
            <p className="text-2xl font-bold">{planosArray.filter((p: any) => p.status === 'ativo').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Pago</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">A Receber</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendente)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Vencido</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalVencido)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro + Ação */}
      <div className="flex items-center justify-between">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar planos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Planos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="quitado">Quitados</SelectItem>
            <SelectItem value="inadimplente">Inadimplentes</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowNovoPlano(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {/* Lista de Planos */}
      <div className="space-y-4">
        {filteredPlanos.map((plano: any) => {
          const isExpanded = expandedPlano === plano.id
          const parcelasPagas = plano.parcelas.filter((p: any) => p.status === 'pago').length
          const progressPercent = Math.round((parcelasPagas / plano.parcelas.length) * 100)
          const planoConfig = statusPlanoConfig[plano.status]

          return (
            <Card key={plano.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedPlano(isExpanded ? null : plano.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {plano.tratamento}
                        <Badge className={planoConfig.color}>{planoConfig.label}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatCurrency(plano.valorTotal)} • {plano.parcelas.length} parcelas • Início: {formatDate(plano.dataInicio)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium">{parcelasPagas}/{plano.parcelas.length} pagas</p>
                      <div className="h-2 w-24 rounded-full bg-muted mt-1">
                        <div
                          className="h-2 rounded-full bg-green-500 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parcela</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plano.parcelas.map((parcela: any) => {
                        const config = statusParcelaConfig[parcela.status]
                        const Icon = config.icon
                        return (
                          <TableRow key={parcela.id}>
                            <TableCell className="font-medium">
                              {parcela.numero === 0 ? 'Entrada' : `${parcela.numero}/${plano.numParcelas}`}
                            </TableCell>
                            <TableCell>{formatDate(parcela.dataVencimento)}</TableCell>
                            <TableCell>
                              {parcela.dataPagamento ? formatDate(parcela.dataPagamento) : '-'}
                            </TableCell>
                            <TableCell>{parcela.metodo || '-'}</TableCell>
                            <TableCell>
                              <Badge className={config.color}>
                                <Icon className="mr-1 h-3 w-3" />
                                {config.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(parcela.valor)}
                            </TableCell>
                            <TableCell>
                              {(parcela.status === 'pendente' || parcela.status === 'vencido') && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          )
        })}

        {filteredPlanos.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum plano de parcelamento</h3>
              <p className="text-muted-foreground mb-4">Crie um plano para organizar os pagamentos do paciente</p>
              <Button onClick={() => setShowNovoPlano(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Plano
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Novo Plano */}
      <Dialog open={showNovoPlano} onOpenChange={setShowNovoPlano}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Plano de Parcelamento</DialogTitle>
            <DialogDescription>Configure o parcelamento do tratamento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Tratamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tratamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Reabilitação Oral Superior</SelectItem>
                    <SelectItem value="2">Implante Dentário</SelectItem>
                    <SelectItem value="3">Ortodontia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor Total</Label>
                <Input type="number" placeholder="0,00" step="0.01" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Entrada</Label>
                <Input type="number" placeholder="0,00" step="0.01" />
              </div>
              <div>
                <Label>Nº de Parcelas</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Parcelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data 1ª Parcela</Label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea placeholder="Condições especiais, descontos, etc." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovoPlano(false)}>Cancelar</Button>
            <Button onClick={() => setShowNovoPlano(false)}>Criar Plano</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
