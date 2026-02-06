'use client'

import { useState } from 'react'
import {
  Plus, Search, Download, Eye, CheckCircle, Clock, AlertCircle,
  MoreHorizontal, ArrowUpRight, Filter, X, DollarSign
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

interface ReceitasTabProps {
  periodo: string
}

interface Receita {
  id: string
  data: string
  descricao: string
  paciente: string
  dentista: string
  categoria: string
  procedimento: string
  valor: number
  metodo_pagamento: string
  status: 'pago' | 'pendente' | 'cancelado' | 'estornado'
  data_vencimento: string
  pago_em: string | null
  parcela: string | null
  observacoes: string | null
}

const mockReceitas: Receita[] = [
  { id: '1', data: '2024-01-15', descricao: 'Implante Unitário', paciente: 'Maria Silva', dentista: 'Dr. Ricardo Almeida', categoria: 'Implantes', procedimento: 'Implante Unitário', valor: 3500.00, metodo_pagamento: 'Cartão de crédito', status: 'pago', data_vencimento: '2024-01-15', pago_em: '2024-01-15', parcela: '1/3', observacoes: null },
  { id: '2', data: '2024-01-15', descricao: 'Manutenção Ortodôntica', paciente: 'Carlos Santos', dentista: 'Dra. Camila Santos', categoria: 'Ortodontia', procedimento: 'Manutenção Mensal', valor: 150.00, metodo_pagamento: 'PIX', status: 'pago', data_vencimento: '2024-01-15', pago_em: '2024-01-15', parcela: null, observacoes: null },
  { id: '3', data: '2024-01-14', descricao: 'Clareamento a Laser', paciente: 'Ana Oliveira', dentista: 'Dra. Ana Costa', categoria: 'Estética', procedimento: 'Clareamento', valor: 1200.00, metodo_pagamento: 'Convênio', status: 'pago', data_vencimento: '2024-01-14', pago_em: '2024-01-14', parcela: null, observacoes: 'Autorização AUT-2024-0789' },
  { id: '4', data: '2024-01-14', descricao: 'Restauração Classe II', paciente: 'Pedro Costa', dentista: 'Dr. Felipe Oliveira', categoria: 'Procedimentos Gerais', procedimento: 'Restauração', valor: 350.00, metodo_pagamento: 'Dinheiro', status: 'pago', data_vencimento: '2024-01-14', pago_em: '2024-01-14', parcela: null, observacoes: null },
  { id: '5', data: '2024-01-13', descricao: 'Prótese sobre Implante', paciente: 'Lucia Ferreira', dentista: 'Dr. Ricardo Almeida', categoria: 'Implantes', procedimento: 'Prótese', valor: 2800.00, metodo_pagamento: 'Cartão de crédito', status: 'pendente', data_vencimento: '2024-02-13', pago_em: null, parcela: '2/4', observacoes: 'Aguardando vencimento' },
  { id: '6', data: '2024-01-12', descricao: 'Consulta de Avaliação', paciente: 'Roberto Lima', dentista: 'Dr. Ricardo Almeida', categoria: 'Consultas', procedimento: 'Avaliação', valor: 150.00, metodo_pagamento: 'PIX', status: 'pago', data_vencimento: '2024-01-12', pago_em: '2024-01-12', parcela: null, observacoes: null },
  { id: '7', data: '2024-01-11', descricao: 'Tratamento de Canal', paciente: 'Fernanda Souza', dentista: 'Dr. Felipe Oliveira', categoria: 'Procedimentos Gerais', procedimento: 'Endodontia', valor: 800.00, metodo_pagamento: 'Cartão de débito', status: 'pendente', data_vencimento: '2024-01-25', pago_em: null, parcela: null, observacoes: 'Paciente solicitou prazo' },
  { id: '8', data: '2024-01-10', descricao: 'Limpeza / Profilaxia', paciente: 'João Mendes', dentista: 'Dra. Camila Santos', categoria: 'Procedimentos Gerais', procedimento: 'Profilaxia', valor: 120.00, metodo_pagamento: 'Dinheiro', status: 'cancelado', data_vencimento: '2024-01-10', pago_em: null, parcela: null, observacoes: 'Paciente cancelou' },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pago: { label: 'Pago', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: AlertCircle },
  estornado: { label: 'Estornado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', icon: AlertCircle },
}

const categorias = ['Todas', 'Procedimentos Gerais', 'Ortodontia', 'Implantes', 'Estética', 'Consultas']
const metodos = ['Todos', 'PIX', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Convênio', 'Transferência']
const dentistas = ['Todos', 'Dr. Ricardo Almeida', 'Dra. Camila Santos', 'Dr. Felipe Oliveira', 'Dra. Ana Costa']
const centrosReceita = ['Clínica Geral', 'Ortodontia', 'Implantodontia', 'Estética', 'Convênios', 'Outros']
const origensReceita = ['Particular', 'Convênio', 'Reembolso', 'Parceria', 'Outros']

export function ReceitasTab({ periodo }: ReceitasTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [categoriaFilter, setCategoriaFilter] = useState('Todas')
  const [metodoFilter, setMetodoFilter] = useState('Todos')
  const [dentistaFilter, setDentistaFilter] = useState('Todos')
  const [showFilters, setShowFilters] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedReceita, setSelectedReceita] = useState<Receita | null>(null)
  const [novaReceitaParcelada, setNovaReceitaParcelada] = useState(false)
  const [novaReceitaRecorrente, setNovaReceitaRecorrente] = useState(false)
  const [novaReceitaStatus, setNovaReceitaStatus] = useState<'pendente' | 'pago' | 'cancelado' | 'estornado'>('pendente')

  const handleNewReceitaOpenChange = (open: boolean) => {
    setShowNewDialog(open)
    if (!open) {
      setNovaReceitaParcelada(false)
      setNovaReceitaRecorrente(false)
      setNovaReceitaStatus('pendente')
    }
  }

  const filtered = mockReceitas.filter((r) => {
    const matchSearch = r.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.dentista.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'todos' || r.status === statusFilter
    const matchCategoria = categoriaFilter === 'Todas' || r.categoria === categoriaFilter
    const matchMetodo = metodoFilter === 'Todos' || r.metodo_pagamento === metodoFilter
    const matchDentista = dentistaFilter === 'Todos' || r.dentista === dentistaFilter
    return matchSearch && matchStatus && matchCategoria && matchMetodo && matchDentista
  })

  const totalPago = filtered.filter(r => r.status === 'pago').reduce((s, r) => s + r.valor, 0)
  const totalPendente = filtered.filter(r => r.status === 'pendente').reduce((s, r) => s + r.valor, 0)
  const totalGeral = filtered.reduce((s, r) => s + r.valor, 0)

  const hasActiveFilters = categoriaFilter !== 'Todas' || metodoFilter !== 'Todos' || dentistaFilter !== 'Todos'

  const clearFilters = () => {
    setCategoriaFilter('Todas')
    setMetodoFilter('Todos')
    setDentistaFilter('Todos')
    setStatusFilter('todos')
    setSearchTerm('')
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recebido</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalPago)}</p>
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
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Geral</p>
              <p className="text-lg font-bold">{formatCurrency(totalGeral)}</p>
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
              <Input placeholder="Buscar por descrição, paciente ou dentista..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
            <Button variant={showFilters ? 'default' : 'outline'} size="icon" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-col md:flex-row gap-3 pt-2 border-t">
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={metodoFilter} onValueChange={setMetodoFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  {metodos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={dentistaFilter} onValueChange={setDentistaFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Dentista" />
                </SelectTrigger>
                <SelectContent>
                  {dentistas.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-3 w-3" />
                  Limpar
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
                <TableHead>Paciente</TableHead>
                <TableHead>Dentista</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const config = statusConfig[r.status]
                return (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-sm">{formatDate(r.data)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{r.descricao}</p>
                        {r.parcela && <p className="text-xs text-muted-foreground">Parcela {r.parcela}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{r.paciente}</TableCell>
                    <TableCell className="text-sm">{r.dentista}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{r.categoria}</Badge></TableCell>
                    <TableCell className="text-sm">{r.metodo_pagamento}</TableCell>
                    <TableCell><Badge className={config.color}>{config.label}</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-green-600">+{formatCurrency(r.valor)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedReceita(r)}>
                            <Eye className="mr-2 h-4 w-4" />Ver Detalhes
                          </DropdownMenuItem>
                          {r.status === 'pendente' && (
                            <DropdownMenuItem><CheckCircle className="mr-2 h-4 w-4" />Marcar como Pago</DropdownMenuItem>
                          )}
                          {r.status === 'pago' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600"><AlertCircle className="mr-2 h-4 w-4" />Estornar</DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">Nenhuma receita encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Detalhes */}
      <Dialog open={!!selectedReceita} onOpenChange={() => setSelectedReceita(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Receita</DialogTitle>
            <DialogDescription>Informações completas</DialogDescription>
          </DialogHeader>
          {selectedReceita && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label className="text-muted-foreground">Descrição</Label><p className="font-medium">{selectedReceita.descricao}</p></div>
                <div><Label className="text-muted-foreground">Valor</Label><p className="font-medium text-green-600">+{formatCurrency(selectedReceita.valor)}</p></div>
                <div><Label className="text-muted-foreground">Paciente</Label><p className="font-medium">{selectedReceita.paciente}</p></div>
                <div><Label className="text-muted-foreground">Dentista</Label><p className="font-medium">{selectedReceita.dentista}</p></div>
                <div><Label className="text-muted-foreground">Categoria</Label><p className="font-medium">{selectedReceita.categoria}</p></div>
                <div><Label className="text-muted-foreground">Método</Label><p className="font-medium">{selectedReceita.metodo_pagamento}</p></div>
                <div><Label className="text-muted-foreground">Vencimento</Label><p className="font-medium">{formatDate(selectedReceita.data_vencimento)}</p></div>
                <div><Label className="text-muted-foreground">Pago em</Label><p className="font-medium">{selectedReceita.pago_em ? formatDate(selectedReceita.pago_em) : 'Não realizado'}</p></div>
              </div>
              {selectedReceita.observacoes && (
                <div><Label className="text-muted-foreground">Observações</Label><p className="text-sm bg-muted/30 p-3 rounded">{selectedReceita.observacoes}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Receita */}
      <Dialog open={showNewDialog} onOpenChange={handleNewReceitaOpenChange}>
        <DialogContent className="max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Receita</DialogTitle>
            <DialogDescription>Registre uma nova entrada financeira</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <section className="space-y-3">
              <h4 className="text-sm font-semibold">Informações principais</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Descrição</Label><Input placeholder="Ex: Implante Unitário" /></div>
                <div><Label>Procedimento / Serviço</Label><Input placeholder="Ex: Implante com carga imediata" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Categoria</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{categorias.filter(c => c !== 'Todas').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Origem</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{origensReceita.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Centro de Receita</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{centrosReceita.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Paciente</Label><Input placeholder="Nome do paciente" /></div>
                <div>
                  <Label>Dentista Responsável</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{dentistas.filter(d => d !== 'Todos').map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
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
                  <Select value={novaReceitaStatus} onValueChange={(value) => setNovaReceitaStatus(value as typeof novaReceitaStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="estornado">Estornado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Método de Pagamento</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{metodos.filter(m => m !== 'Todos').map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div><Label>Competência</Label><Input type="month" /></div>
                <div><Label>Data de Emissão</Label><Input type="date" /></div>
                <div><Label>Data de Vencimento</Label><Input type="date" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Conta Bancária / Conta Caixa</Label><Input placeholder="Ex: Banco Inter - Conta 123" /></div>
                <div><Label>Nº do Documento / NF</Label><Input placeholder="Ex: NF 2549" /></div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold">Parcelamento e recorrência</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm">Receita parcelada?</Label>
                    <p className="text-xs text-muted-foreground">Controle parcelas e datas individualmente</p>
                  </div>
                  <Switch checked={novaReceitaParcelada} onCheckedChange={setNovaReceitaParcelada} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm">Receita recorrente?</Label>
                    <p className="text-xs text-muted-foreground">Ex.: mensalidades ou planos</p>
                  </div>
                  <Switch checked={novaReceitaRecorrente} onCheckedChange={setNovaReceitaRecorrente} />
                </div>
              </div>
              {novaReceitaParcelada && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div><Label>Qtd. Parcelas</Label><Input type="number" min={1} placeholder="Ex: 6" /></div>
                  <div><Label>Intervalo (dias)</Label><Input type="number" min={0} placeholder="30" /></div>
                  <div><Label>1ª Parcela</Label><Input type="date" /></div>
                </div>
              )}
              {novaReceitaRecorrente && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Periodicidade</Label><Input placeholder="Ex: Mensal" /></div>
                  <div><Label>Vencimento padrão</Label><Input type="number" min={1} max={31} placeholder="Dia do mês" /></div>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold">Observações e comprovantes</h4>
              <Textarea placeholder="Condições comerciais, autorização de convênio, etc." rows={3} />
              <div>
                <Label>Anexos (NF, recibos, contratos)</Label>
                <Input type="file" multiple accept="application/pdf,image/*" />
                <p className="text-xs text-muted-foreground mt-1">Formatos permitidos: PDF, JPG, PNG (máx. 10MB)</p>
              </div>
            </section>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleNewReceitaOpenChange(false)}>Cancelar</Button>
            <Button onClick={() => handleNewReceitaOpenChange(false)}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
