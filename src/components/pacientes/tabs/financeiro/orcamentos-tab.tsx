'use client'

import { useState } from 'react'
import { Plus, FileText, CheckCircle, Clock, XCircle, Eye, Send, Download, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDate, formatCurrency } from '@/lib/utils'

interface OrcamentosTabProps {
  pacienteId: string
}

interface ItemOrcamento {
  id: string
  procedimento: string
  dente: string | null
  quantidade: number
  valorUnitario: number
  desconto: number
  valorFinal: number
}

interface Orcamento {
  id: string
  numero: string
  data: string
  validade: string
  dentista: string
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'expirado'
  itens: ItemOrcamento[]
  valorTotal: number
  descontoTotal: number
  valorFinal: number
  observacoes: string | null
  condicoesPagamento: string | null
}

const mockOrcamentos: Orcamento[] = [
  {
    id: '1',
    numero: 'ORC-2024-001',
    data: '2024-01-10',
    validade: '2024-02-10',
    dentista: 'Dr. Ricardo Almeida',
    status: 'aprovado',
    itens: [
      { id: 'i1', procedimento: 'Consulta de Avaliação', dente: null, quantidade: 1, valorUnitario: 150.00, desconto: 0, valorFinal: 150.00 },
      { id: 'i2', procedimento: 'Tratamento Periodontal', dente: null, quantidade: 4, valorUnitario: 400.00, desconto: 0, valorFinal: 1600.00 },
      { id: 'i3', procedimento: 'Restauração Classe II', dente: '36', quantidade: 1, valorUnitario: 350.00, desconto: 50.00, valorFinal: 300.00 },
      { id: 'i4', procedimento: 'Prótese Parcial Removível', dente: null, quantidade: 1, valorUnitario: 2100.00, desconto: 0, valorFinal: 2100.00 },
    ],
    valorTotal: 4200.00,
    descontoTotal: 50.00,
    valorFinal: 4150.00,
    observacoes: 'Tratamento completo de reabilitação oral superior',
    condicoesPagamento: 'Entrada + 8x sem juros no cartão',
  },
  {
    id: '2',
    numero: 'ORC-2024-005',
    data: '2024-03-20',
    validade: '2024-04-20',
    dentista: 'Dra. Camila Santos',
    status: 'enviado',
    itens: [
      { id: 'i5', procedimento: 'Clareamento a Laser', dente: null, quantidade: 1, valorUnitario: 1200.00, desconto: 200.00, valorFinal: 1000.00 },
      { id: 'i6', procedimento: 'Lente de Contato Dental', dente: '11-16, 21-26', quantidade: 12, valorUnitario: 1500.00, desconto: 0, valorFinal: 18000.00 },
    ],
    valorTotal: 19200.00,
    descontoTotal: 200.00,
    valorFinal: 19000.00,
    observacoes: 'Protocolo estético completo - arcada superior',
    condicoesPagamento: 'Entrada 30% + 12x',
  },
  {
    id: '3',
    numero: 'ORC-2024-008',
    data: '2024-04-01',
    validade: '2024-05-01',
    dentista: 'Dr. Ricardo Almeida',
    status: 'rascunho',
    itens: [
      { id: 'i7', procedimento: 'Implante Dentário', dente: '46', quantidade: 1, valorUnitario: 3500.00, desconto: 0, valorFinal: 3500.00 },
      { id: 'i8', procedimento: 'Coroa sobre Implante', dente: '46', quantidade: 1, valorUnitario: 2000.00, desconto: 0, valorFinal: 2000.00 },
    ],
    valorTotal: 5500.00,
    descontoTotal: 0,
    valorFinal: 5500.00,
    observacoes: null,
    condicoesPagamento: null,
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: FileText },
  enviado: { label: 'Enviado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: Send },
  aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
  recusado: { label: 'Recusado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
  expirado: { label: 'Expirado', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: Clock },
}

export function OrcamentosTab({ pacienteId }: OrcamentosTabProps) {
  const [expandedOrc, setExpandedOrc] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [showNovoOrcamento, setShowNovoOrcamento] = useState(false)

  const filtered = filterStatus === 'todos'
    ? mockOrcamentos
    : mockOrcamentos.filter((o) => o.status === filterStatus)

  const totalAprovado = mockOrcamentos.filter((o) => o.status === 'aprovado').reduce((s, o) => s + o.valorFinal, 0)
  const totalPendente = mockOrcamentos.filter((o) => o.status === 'enviado' || o.status === 'rascunho').reduce((s, o) => s + o.valorFinal, 0)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total de Orçamentos</p>
            <p className="text-2xl font-bold">{mockOrcamentos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Aprovados</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAprovado)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendente)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Taxa de Aprovação</p>
            <p className="text-2xl font-bold text-blue-600">
              {mockOrcamentos.length > 0
                ? Math.round((mockOrcamentos.filter((o) => o.status === 'aprovado').length / mockOrcamentos.length) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro + Ação */}
      <div className="flex items-center justify-between">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunhos</SelectItem>
            <SelectItem value="enviado">Enviados</SelectItem>
            <SelectItem value="aprovado">Aprovados</SelectItem>
            <SelectItem value="recusado">Recusados</SelectItem>
            <SelectItem value="expirado">Expirados</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowNovoOrcamento(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Lista de Orçamentos */}
      <div className="space-y-4">
        {filtered.map((orc) => {
          const isExpanded = expandedOrc === orc.id
          const config = statusConfig[orc.status]
          const Icon = config.icon

          return (
            <Card key={orc.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedOrc(isExpanded ? null : orc.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {orc.numero}
                      <Badge className={config.color}>
                        <Icon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {orc.dentista} • Emitido: {formatDate(orc.data)} • Validade: {formatDate(orc.validade)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {orc.descontoTotal > 0 && (
                        <p className="text-xs text-muted-foreground line-through">{formatCurrency(orc.valorTotal)}</p>
                      )}
                      <p className="text-lg font-bold">{formatCurrency(orc.valorFinal)}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar ao Paciente
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Baixar PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {orc.status === 'enviado' && (
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Aprovado
                          </DropdownMenuItem>
                        )}
                        {(orc.status === 'rascunho' || orc.status === 'enviado') && (
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Procedimento</TableHead>
                        <TableHead>Dente</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-right">Valor Unit.</TableHead>
                        <TableHead className="text-right">Desconto</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orc.itens.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.procedimento}</TableCell>
                          <TableCell>{item.dente || '-'}</TableCell>
                          <TableCell className="text-center">{item.quantidade}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.valorUnitario)}</TableCell>
                          <TableCell className="text-right">
                            {item.desconto > 0 ? (
                              <span className="text-red-600">-{formatCurrency(item.desconto)}</span>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(item.valorFinal)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={4} />
                        <TableCell className="text-right text-sm font-medium">Subtotal</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(orc.valorTotal)}</TableCell>
                      </TableRow>
                      {orc.descontoTotal > 0 && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={4} />
                          <TableCell className="text-right text-sm font-medium text-red-600">Desconto</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">-{formatCurrency(orc.descontoTotal)}</TableCell>
                        </TableRow>
                      )}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} />
                        <TableCell className="text-right text-sm font-bold">Total</TableCell>
                        <TableCell className="text-right text-lg font-bold">{formatCurrency(orc.valorFinal)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  {(orc.observacoes || orc.condicoesPagamento) && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {orc.observacoes && (
                        <div className="rounded-lg border p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Observações</p>
                          <p className="text-sm">{orc.observacoes}</p>
                        </div>
                      )}
                      {orc.condicoesPagamento && (
                        <div className="rounded-lg border p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Condições de Pagamento</p>
                          <p className="text-sm">{orc.condicoesPagamento}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum orçamento encontrado</h3>
              <p className="text-muted-foreground mb-4">Crie um orçamento detalhado para o paciente</p>
              <Button onClick={() => setShowNovoOrcamento(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Orçamento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Novo Orçamento */}
      <Dialog open={showNovoOrcamento} onOpenChange={setShowNovoOrcamento}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
            <DialogDescription>Crie um orçamento detalhado com procedimentos e valores</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Dentista Responsável</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Dr. Ricardo Almeida</SelectItem>
                    <SelectItem value="2">Dra. Camila Santos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Validade (dias)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Procedimentos</Label>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-5 items-end">
                    <div className="md:col-span-2">
                      <Label className="text-xs">Procedimento</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Consulta de Avaliação</SelectItem>
                          <SelectItem value="2">Limpeza</SelectItem>
                          <SelectItem value="3">Restauração</SelectItem>
                          <SelectItem value="4">Clareamento</SelectItem>
                          <SelectItem value="5">Implante</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Dente</Label>
                      <Input placeholder="Ex: 36" />
                    </div>
                    <div>
                      <Label className="text-xs">Valor</Label>
                      <Input type="number" placeholder="0,00" step="0.01" />
                    </div>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Adicione os procedimentos do orçamento acima
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Condições de Pagamento</Label>
                <Input placeholder="Ex: Entrada + 8x sem juros" />
              </div>
              <div>
                <Label>Desconto Global</Label>
                <Input type="number" placeholder="0,00" step="0.01" />
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea placeholder="Observações sobre o orçamento..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovoOrcamento(false)}>Cancelar</Button>
            <Button variant="outline">Salvar Rascunho</Button>
            <Button onClick={() => setShowNovoOrcamento(false)}>Criar e Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
