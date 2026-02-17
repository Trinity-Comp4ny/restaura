'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Download, Eye, CheckCircle, AlertCircle, Clock, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useTransacoesPaciente } from '@/hooks/use-financeiro-paciente'

interface TransacoesTabProps {
  pacienteId: string
}

interface Transacao {
  id: string
  data: string
  descricao: string
  categoria?: string
  valor: number
  tipo: 'receita' | 'despesa'
  metodo_pagamento: string
  status: string
  data_vencimento: string
  pago_em: string | null
  tratamento?: string
  observacoes?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pago: { label: 'Pago', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: AlertCircle },
  estornado: { label: 'Estornado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', icon: AlertCircle },
}

export function TransacoesTab({ pacienteId }: TransacoesTabProps) {
  const { data: transacoes = [], isLoading } = useTransacoesPaciente(pacienteId)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedTransacao, setSelectedTransacao] = useState<any>(null)

  if (isLoading) {
    return <div>Carregando...</div>
  }

  const filtered = transacoes.filter((t: any) => {
    const matchSearch =
      t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'todos' || t.status === statusFilter
    const matchTipo = tipoFilter === 'todos' || t.tipo === tipoFilter
    return matchSearch && matchStatus && matchTipo
  })

  const totalReceitas = filtered.filter((t: any) => t.tipo === 'receita' && t.status === 'pago').reduce((s: number, t: any) => s + (t.valor || 0), 0)
  const totalPendente = filtered.filter((t: any) => t.status === 'pendente').reduce((s: number, t: any) => s + (t.valor || 0), 0)

  return (
    <div className="space-y-4">
      {/* Resumo rápido */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receitas Pagas</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalPendente)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Filter className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transações</p>
              <p className="text-lg font-bold">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="pago">Pagos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
                <SelectItem value="estornado">Estornados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Tipos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t: any) => {
                const config = statusConfig[t.status]
                return (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(t.data)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{t.descricao}</p>
                        {t.tratamento && (
                          <p className="text-xs text-muted-foreground">{t.tratamento}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.categoria}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{t.metodo_pagamento}</TableCell>
                    <TableCell>
                      <Badge className={config.color}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedTransacao(t)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {t.status === 'pendente' && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Pago
                            </DropdownMenuItem>
                          )}
                          {t.status === 'pago' && (
                            <DropdownMenuItem className="text-red-600">
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Estornar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Detalhes */}
      <Dialog open={!!selectedTransacao} onOpenChange={() => setSelectedTransacao(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
            <DialogDescription>Informações completas da transação</DialogDescription>
          </DialogHeader>
          {selectedTransacao && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{selectedTransacao.descricao}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor</Label>
                  <p className={`font-medium ${selectedTransacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(selectedTransacao.valor)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Categoria</Label>
                  <p className="font-medium">{selectedTransacao.categoria || 'Geral'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Método</Label>
                  <p className="font-medium">{selectedTransacao.metodo_pagamento}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vencimento</Label>
                  <p className="font-medium">{formatDate(selectedTransacao.data_vencimento)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Pago em</Label>
                  <p className="font-medium">{selectedTransacao.pago_em ? formatDate(selectedTransacao.pago_em) : 'Não realizado'}</p>
                </div>
              </div>
              {selectedTransacao.tratamento && (
                <div>
                  <Label className="text-muted-foreground">Tratamento</Label>
                  <p className="font-medium">{selectedTransacao.tratamento}</p>
                </div>
              )}
              {selectedTransacao.observacoes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="text-sm bg-muted/30 p-3 rounded">{selectedTransacao.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Transação */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>Registre uma nova transação financeira para o paciente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Descrição</Label>
                <Input placeholder="Ex: Consulta de avaliação" />
              </div>
              <div>
                <Label>Valor</Label>
                <Input type="number" placeholder="0,00" step="0.01" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="procedimento">Procedimento</SelectItem>
                    <SelectItem value="estetica">Estética</SelectItem>
                    <SelectItem value="protese">Prótese</SelectItem>
                    <SelectItem value="ortodontia">Ortodontia</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Método de Pagamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="credit_card">Cartão de crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de débito</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="insurance">Convênio</SelectItem>
                    <SelectItem value="bank_transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Data de Vencimento</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Tratamento Relacionado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Reabilitação Oral Superior</SelectItem>
                    <SelectItem value="2">Manutenção Ortodôntica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea placeholder="Observações sobre a transação..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
            <Button onClick={() => setShowNewDialog(false)}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
