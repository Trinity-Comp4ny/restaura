'use client'

import { useState } from 'react'
import {
  Plus, Search, Download, Eye, CheckCircle, Clock, AlertCircle,
  MoreHorizontal, ArrowDownRight, Filter, X, DollarSign, Trash2, Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

interface DespesasTabProps {
  periodo: string
}

interface Despesa {
  id: string
  data: string
  descricao: string
  categoria: string
  subcategoria: string
  fornecedor: string | null
  valor: number
  metodo_pagamento: string
  status: 'pago' | 'pendente' | 'cancelado'
  data_vencimento: string
  pago_em: string | null
  recorrente: boolean
  centro_custo: string
  observacoes: string | null
}

const mockDespesas: Despesa[] = [
  { id: '1', data: '2024-01-15', descricao: 'Resina Composta Z350 3M', categoria: 'Materiais', subcategoria: 'Restauração', fornecedor: 'Dental Cremer', valor: 890.00, metodo_pagamento: 'Transferência', status: 'pago', data_vencimento: '2024-01-15', pago_em: '2024-01-15', recorrente: false, centro_custo: 'Insumos', observacoes: null },
  { id: '2', data: '2024-01-14', descricao: 'Aluguel do consultório', categoria: 'Infraestrutura', subcategoria: 'Aluguel', fornecedor: 'Imobiliária Central', valor: 4500.00, metodo_pagamento: 'Transferência', status: 'pago', data_vencimento: '2024-01-10', pago_em: '2024-01-10', recorrente: true, centro_custo: 'Fixo', observacoes: null },
  { id: '3', data: '2024-01-13', descricao: 'Salário - Recepcionista', categoria: 'Pessoal', subcategoria: 'Salários', fornecedor: null, valor: 2800.00, metodo_pagamento: 'Transferência', status: 'pago', data_vencimento: '2024-01-05', pago_em: '2024-01-05', recorrente: true, centro_custo: 'Pessoal', observacoes: null },
  { id: '4', data: '2024-01-12', descricao: 'Salário - Auxiliar', categoria: 'Pessoal', subcategoria: 'Salários', fornecedor: null, valor: 2200.00, metodo_pagamento: 'Transferência', status: 'pago', data_vencimento: '2024-01-05', pago_em: '2024-01-05', recorrente: true, centro_custo: 'Pessoal', observacoes: null },
  { id: '5', data: '2024-01-11', descricao: 'Conta de Energia', categoria: 'Infraestrutura', subcategoria: 'Utilidades', fornecedor: 'CEMIG', valor: 680.00, metodo_pagamento: 'Débito automático', status: 'pago', data_vencimento: '2024-01-15', pago_em: '2024-01-14', recorrente: true, centro_custo: 'Fixo', observacoes: null },
  { id: '6', data: '2024-01-10', descricao: 'Google Ads - Campanha Janeiro', categoria: 'Marketing', subcategoria: 'Publicidade', fornecedor: 'Google', valor: 1200.00, metodo_pagamento: 'Cartão de crédito', status: 'pago', data_vencimento: '2024-01-10', pago_em: '2024-01-10', recorrente: true, centro_custo: 'Marketing', observacoes: 'Campanha de captação de leads' },
  { id: '7', data: '2024-01-09', descricao: 'Manutenção Autoclave', categoria: 'Equipamentos', subcategoria: 'Manutenção', fornecedor: 'TechDental', valor: 450.00, metodo_pagamento: 'PIX', status: 'pendente', data_vencimento: '2024-01-25', pago_em: null, recorrente: false, centro_custo: 'Equipamentos', observacoes: 'Manutenção preventiva semestral' },
  { id: '8', data: '2024-01-08', descricao: 'Software de gestão - Mensalidade', categoria: 'Tecnologia', subcategoria: 'Software', fornecedor: 'Restaura', valor: 299.00, metodo_pagamento: 'Cartão de crédito', status: 'pago', data_vencimento: '2024-01-08', pago_em: '2024-01-08', recorrente: true, centro_custo: 'Tecnologia', observacoes: null },
  { id: '9', data: '2024-01-07', descricao: 'Luvas descartáveis (cx 100)', categoria: 'Materiais', subcategoria: 'Descartáveis', fornecedor: 'Dental Cremer', valor: 185.00, metodo_pagamento: 'PIX', status: 'pago', data_vencimento: '2024-01-07', pago_em: '2024-01-07', recorrente: false, centro_custo: 'Insumos', observacoes: null },
  { id: '10', data: '2024-01-05', descricao: 'Contador - Honorários', categoria: 'Serviços', subcategoria: 'Contabilidade', fornecedor: 'Escritório Contábil ABC', valor: 950.00, metodo_pagamento: 'Transferência', status: 'pendente', data_vencimento: '2024-02-05', pago_em: null, recorrente: true, centro_custo: 'Administrativo', observacoes: null },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  pago: { label: 'Pago', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
}

const categoriasDespesa = ['Todas', 'Materiais', 'Infraestrutura', 'Pessoal', 'Marketing', 'Equipamentos', 'Tecnologia', 'Serviços']
const centrosCusto = ['Todos', 'Insumos', 'Fixo', 'Pessoal', 'Marketing', 'Equipamentos', 'Tecnologia', 'Administrativo']
const tiposDocumento = ['NF-e', 'Recibo', 'Contrato', 'Boleto', 'Outros']
const contasPagamento = ['Caixa Físico', 'Banco Inter PJ', 'Banco do Brasil PJ', 'Cartão Corporativo']

const mockResumoCategoria = [
  { categoria: 'Pessoal', valor: 5000.00, percentual: 36.2, cor: 'bg-blue-500' },
  { categoria: 'Infraestrutura', valor: 5180.00, percentual: 37.5, cor: 'bg-orange-500' },
  { categoria: 'Materiais', valor: 1075.00, percentual: 7.8, cor: 'bg-purple-500' },
  { categoria: 'Marketing', valor: 1200.00, percentual: 8.7, cor: 'bg-pink-500' },
  { categoria: 'Serviços', valor: 950.00, percentual: 6.9, cor: 'bg-teal-500' },
  { categoria: 'Outros', valor: 749.00, percentual: 5.4, cor: 'bg-gray-400' },
]

export function DespesasTab({ periodo }: DespesasTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [categoriaFilter, setCategoriaFilter] = useState('Todas')
  const [centroFilter, setCentroFilter] = useState('Todos')
  const [showFilters, setShowFilters] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null)
  const [novaDespesaParcelada, setNovaDespesaParcelada] = useState(false)
  const [novaDespesaRecorrente, setNovaDespesaRecorrente] = useState(false)
  const [novaDespesaStatus, setNovaDespesaStatus] = useState<'pago' | 'pendente' | 'cancelado'>('pendente')

  const handleNewDespesaOpenChange = (open: boolean) => {
    setShowNewDialog(open)
    if (!open) {
      setNovaDespesaParcelada(false)
      setNovaDespesaRecorrente(false)
      setNovaDespesaStatus('pendente')
    }
  }

  const filtered = mockDespesas.filter((d) => {
    const matchSearch = d.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchStatus = statusFilter === 'todos' || d.status === statusFilter
    const matchCategoria = categoriaFilter === 'Todas' || d.categoria === categoriaFilter
    const matchCentro = centroFilter === 'Todos' || d.centro_custo === centroFilter
    return matchSearch && matchStatus && matchCategoria && matchCentro
  })

  const totalPago = filtered.filter(d => d.status === 'pago').reduce((s, d) => s + d.valor, 0)
  const totalPendente = filtered.filter(d => d.status === 'pendente').reduce((s, d) => s + d.valor, 0)
  const totalRecorrente = filtered.filter(d => d.recorrente).reduce((s, d) => s + d.valor, 0)
  const hasActiveFilters = categoriaFilter !== 'Todas' || centroFilter !== 'Todos'

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pago</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalPago)}</p>
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
              <p className="text-xs text-muted-foreground">Recorrentes</p>
              <p className="text-lg font-bold">{formatCurrency(totalRecorrente)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{formatCurrency(totalPago + totalPendente)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por descrição ou fornecedor..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="pago">Pagos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            <Button variant={showFilters ? 'default' : 'outline'} size="icon" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />Nova Despesa
            </Button>
          </div>
          {showFilters && (
            <div className="flex flex-col md:flex-row gap-3 pt-2 border-t">
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>{categoriasDespesa.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={centroFilter} onValueChange={setCentroFilter}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Centro de Custo" /></SelectTrigger>
                <SelectContent>{centrosCusto.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={() => { setCategoriaFilter('Todas'); setCentroFilter('Todos') }}>
                  <X className="mr-1 h-3 w-3" />Limpar
                </Button>
              )}
            </div>
          )}
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
                <TableHead>Fornecedor</TableHead>
                <TableHead>Centro de Custo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => {
                const config = statusConfig[d.status]
                return (
                  <TableRow key={d.id}>
                    <TableCell className="whitespace-nowrap text-sm">{formatDate(d.data)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{d.descricao}</p>
                        {d.recorrente && <Badge variant="outline" className="text-xs mt-0.5">Recorrente</Badge>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{d.categoria}</Badge></TableCell>
                    <TableCell className="text-sm">{d.fornecedor || '-'}</TableCell>
                    <TableCell className="text-sm">{d.centro_custo}</TableCell>
                    <TableCell><Badge className={config.color}>{config.label}</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-red-600">-{formatCurrency(d.valor)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedDespesa(d)}><Eye className="mr-2 h-4 w-4" />Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                          {d.status === 'pendente' && (
                            <DropdownMenuItem><CheckCircle className="mr-2 h-4 w-4" />Marcar como Pago</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">Nenhuma despesa encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Detalhes */}
      <Dialog open={!!selectedDespesa} onOpenChange={() => setSelectedDespesa(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes da Despesa</DialogTitle></DialogHeader>
          {selectedDespesa && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label className="text-muted-foreground">Descrição</Label><p className="font-medium">{selectedDespesa.descricao}</p></div>
                <div><Label className="text-muted-foreground">Valor</Label><p className="font-medium text-red-600">-{formatCurrency(selectedDespesa.valor)}</p></div>
                <div><Label className="text-muted-foreground">Categoria</Label><p className="font-medium">{selectedDespesa.categoria} / {selectedDespesa.subcategoria}</p></div>
                <div><Label className="text-muted-foreground">Fornecedor</Label><p className="font-medium">{selectedDespesa.fornecedor || '-'}</p></div>
                <div><Label className="text-muted-foreground">Centro de Custo</Label><p className="font-medium">{selectedDespesa.centro_custo}</p></div>
                <div><Label className="text-muted-foreground">Método</Label><p className="font-medium">{selectedDespesa.metodo_pagamento}</p></div>
                <div><Label className="text-muted-foreground">Vencimento</Label><p className="font-medium">{formatDate(selectedDespesa.data_vencimento)}</p></div>
                <div><Label className="text-muted-foreground">Pago em</Label><p className="font-medium">{selectedDespesa.pago_em ? formatDate(selectedDespesa.pago_em) : 'Não realizado'}</p></div>
              </div>
              {selectedDespesa.observacoes && (
                <div><Label className="text-muted-foreground">Observações</Label><p className="text-sm bg-muted/30 p-3 rounded">{selectedDespesa.observacoes}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Despesa */}
      <Dialog open={showNewDialog} onOpenChange={handleNewDespesaOpenChange}>
        <DialogContent className="max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
            <DialogDescription>Registre uma nova saída financeira</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <section className="space-y-3">
              <h4 className="text-sm font-semibold">Informações principais</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Descrição</Label><Input placeholder="Ex: Resina Composta Z350" /></div>
                <div><Label>Categoria / Subcategoria</Label><Input placeholder="Ex: Materiais / Restauração" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Categoria</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{categoriasDespesa.filter(c => c !== 'Todas').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Centro de Custo</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{centrosCusto.filter(c => c !== 'Todos').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Conta de Pagamento</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{contasPagamento.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold">Detalhes financeiros</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div><Label>Valor (R$)</Label><Input type="number" placeholder="0,00" step="0.01" /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={novaDespesaStatus} onValueChange={(value) => setNovaDespesaStatus(value as typeof novaDespesaStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Método de Pagamento</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de crédito</SelectItem>
                      <SelectItem value="debito_auto">Débito automático</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div><Label>Competência</Label><Input type="month" /></div>
                <div><Label>Data de Emissão</Label><Input type="date" /></div>
                <div><Label>Data de Vencimento</Label><Input type="date" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Fornecedor</Label><Input placeholder="Nome do fornecedor" /></div>
                <div><Label>Nº do Documento / NF</Label><Input placeholder="Ex: NF 4502" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Tipo de Documento</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{tiposDocumento.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Data de Pagamento</Label><Input type="date" /></div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold">Parcelamento e recorrência</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm">Despesa parcelada?</Label>
                    <p className="text-xs text-muted-foreground">Ex.: compras com várias parcelas</p>
                  </div>
                  <Switch checked={novaDespesaParcelada} onCheckedChange={setNovaDespesaParcelada} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm">Despesa recorrente?</Label>
                    <p className="text-xs text-muted-foreground">Ex.: aluguel, software, folha</p>
                  </div>
                  <Switch checked={novaDespesaRecorrente} onCheckedChange={setNovaDespesaRecorrente} />
                </div>
              </div>
              {novaDespesaParcelada && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div><Label>Qtd. Parcelas</Label><Input type="number" min={1} placeholder="Ex: 6" /></div>
                  <div><Label>Intervalo (dias)</Label><Input type="number" min={0} placeholder="30" /></div>
                  <div><Label>Primeiro Pagamento</Label><Input type="date" /></div>
                </div>
              )}
              {novaDespesaRecorrente && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Periodicidade</Label><Input placeholder="Mensal, Trimestral..." /></div>
                  <div><Label>Vencimento padrão</Label><Input type="number" min={1} max={31} placeholder="Dia do mês" /></div>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold">Observações e comprovantes</h4>
              <Textarea placeholder="Instruções internas, contratos, etc." rows={3} />
              <div>
                <Label>Anexos (NF, comprovantes, contratos)</Label>
                <Input type="file" multiple accept="application/pdf,image/*" />
                <p className="text-xs text-muted-foreground mt-1">Formatos permitidos: PDF, JPG, PNG (máx. 10MB)</p>
              </div>
            </section>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleNewDespesaOpenChange(false)}>Cancelar</Button>
            <Button onClick={() => handleNewDespesaOpenChange(false)}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
