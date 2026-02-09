'use client'

import { useState } from 'react'
import {
  AlertTriangle, Send, Phone, MessageSquare, Clock, AlertCircle,
  CheckCircle, Users, DollarSign, Calendar, ChevronDown, ChevronUp, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatCurrency } from '@/lib/utils'

interface InadimplenciaTabProps {
  periodo: string
}

interface PacienteInadimplente {
  id: string
  nome: string
  telefone: string
  email: string
  totalDevido: number
  parcelasVencidas: number
  diasAtraso: number
  ultimoPagamento: string | null
  faixa: '1-30' | '31-60' | '61-90' | '90+'
  parcelas: {
    id: string
    descricao: string
    valor: number
    vencimento: string
    diasAtraso: number
  }[]
}

const mockInadimplentes: PacienteInadimplente[] = [
  {
    id: '1', nome: 'Roberto Lima', telefone: '(31) 99876-5432', email: 'roberto@email.com',
    totalDevido: 2800.00, parcelasVencidas: 2, diasAtraso: 45, ultimoPagamento: '2023-11-20', faixa: '31-60',
    parcelas: [
      { id: 'p1', descricao: 'Implante - Parcela 3/6', valor: 1400.00, vencimento: '2023-12-15', diasAtraso: 45 },
      { id: 'p2', descricao: 'Implante - Parcela 4/6', valor: 1400.00, vencimento: '2024-01-15', diasAtraso: 15 },
    ]
  },
  {
    id: '2', nome: 'Fernanda Souza', telefone: '(31) 98765-4321', email: 'fernanda@email.com',
    totalDevido: 800.00, parcelasVencidas: 1, diasAtraso: 5, ultimoPagamento: '2024-01-10', faixa: '1-30',
    parcelas: [
      { id: 'p3', descricao: 'Tratamento de Canal', valor: 800.00, vencimento: '2024-01-25', diasAtraso: 5 },
    ]
  },
  {
    id: '3', nome: 'Marcos Pereira', telefone: '(31) 97654-3210', email: 'marcos@email.com',
    totalDevido: 4200.00, parcelasVencidas: 3, diasAtraso: 92, ultimoPagamento: '2023-10-05', faixa: '90+',
    parcelas: [
      { id: 'p4', descricao: 'Prótese Total - Parcela 2/5', valor: 1400.00, vencimento: '2023-11-05', diasAtraso: 92 },
      { id: 'p5', descricao: 'Prótese Total - Parcela 3/5', valor: 1400.00, vencimento: '2023-12-05', diasAtraso: 62 },
      { id: 'p6', descricao: 'Prótese Total - Parcela 4/5', valor: 1400.00, vencimento: '2024-01-05', diasAtraso: 25 },
    ]
  },
  {
    id: '4', nome: 'Juliana Martins', telefone: '(31) 96543-2109', email: 'juliana@email.com',
    totalDevido: 1500.00, parcelasVencidas: 1, diasAtraso: 72, ultimoPagamento: '2023-11-01', faixa: '61-90',
    parcelas: [
      { id: 'p7', descricao: 'Ortodontia - Mensalidade Nov', valor: 500.00, vencimento: '2023-11-15', diasAtraso: 72 },
      { id: 'p8', descricao: 'Ortodontia - Mensalidade Dez', valor: 500.00, vencimento: '2023-12-15', diasAtraso: 42 },
      { id: 'p9', descricao: 'Ortodontia - Mensalidade Jan', valor: 500.00, vencimento: '2024-01-15', diasAtraso: 15 },
    ]
  },
  {
    id: '5', nome: 'Ana Paula Ribeiro', telefone: '(31) 95432-1098', email: 'anapaula@email.com',
    totalDevido: 350.00, parcelasVencidas: 1, diasAtraso: 10, ultimoPagamento: '2024-01-05', faixa: '1-30',
    parcelas: [
      { id: 'p10', descricao: 'Restauração Classe II', valor: 350.00, vencimento: '2024-01-20', diasAtraso: 10 },
    ]
  },
]

const faixaConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  '1-30': { label: '1-30 dias', color: 'text-yellow-700', bgColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  '31-60': { label: '31-60 dias', color: 'text-orange-700', bgColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  '61-90': { label: '61-90 dias', color: 'text-red-600', bgColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  '90+': { label: '90+ dias', color: 'text-red-800', bgColor: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200' },
}

export function InadimplenciaTab({ periodo }: InadimplenciaTabProps) {
  const [expandedPaciente, setExpandedPaciente] = useState<string | null>(null)
  const [faixaFilter, setFaixaFilter] = useState('todas')
  const [mostrarInsights, setMostrarInsights] = useState(true)

  const filtered = faixaFilter === 'todas'
    ? mockInadimplentes
    : mockInadimplentes.filter(p => p.faixa === faixaFilter)

  const totalInadimplencia = mockInadimplentes.reduce((s, p) => s + p.totalDevido, 0)
  const totalPacientes = mockInadimplentes.length
  const totalParcelas = mockInadimplentes.reduce((s, p) => s + p.parcelasVencidas, 0)
  const pacientesCriticos = mockInadimplentes.filter((p) => p.faixa === '90+').length
  const pacientesReativados = 2 // mock: poderia vir do backend
  const contatosPendentes = mockInadimplentes.filter((p) => p.diasAtraso >= 30).length

  const aging = {
    '1-30': mockInadimplentes.filter(p => p.faixa === '1-30').reduce((s, p) => s + p.totalDevido, 0),
    '31-60': mockInadimplentes.filter(p => p.faixa === '31-60').reduce((s, p) => s + p.totalDevido, 0),
    '61-90': mockInadimplentes.filter(p => p.faixa === '61-90').reduce((s, p) => s + p.totalDevido, 0),
    '90+': mockInadimplentes.filter(p => p.faixa === '90+').reduce((s, p) => s + p.totalDevido, 0),
  }

  const agingTotal = Object.values(aging).reduce((s, v) => s + v, 0)

  return (
    <div className="space-y-6">
      {/* Alerta */}
      {totalInadimplencia > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {totalPacientes} pacientes com {totalParcelas} parcelas vencidas totalizando {formatCurrency(totalInadimplencia)}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">Envie cobranças para reduzir a inadimplência</p>
              </div>
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              <Send className="mr-2 h-3 w-3" />
              Cobrança em Massa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Inadimplente</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalInadimplencia)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pacientes</p>
            <p className="text-2xl font-bold">{totalPacientes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Parcelas Vencidas</p>
            <p className="text-2xl font-bold">{totalParcelas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Média por Paciente</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPacientes > 0 ? totalInadimplencia / totalPacientes : 0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Insights operacionais</h3>
        <Button variant="ghost" size="sm" onClick={() => setMostrarInsights((prev) => !prev)}>
          {mostrarInsights ? 'Ocultar' : 'Mostrar'} análises
        </Button>
      </div>

      {mostrarInsights && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Fila de cobrança</CardTitle>
              <CardDescription>Contatos prioritários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Contatos pendentes</span>
                <Badge variant="outline" className="text-orange-600 border-orange-200">{contatosPendentes}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Pacientes 90+ dias</span>
                <Badge variant="outline" className="text-red-600 border-red-200">{pacientesCriticos}</Badge>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                {pacientesCriticos > 0 ? 'Priorize acordos para evitar perda total.' : 'Nenhum paciente acima de 90 dias.'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Performances recentes</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Valores recuperados</span>
                <span className="font-semibold text-green-600">{formatCurrency(6200)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pacientes reativados</span>
                <Badge variant="outline" className="text-green-600 border-green-200">{pacientesReativados}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Média de recuperação: {formatCurrency(6200 / Math.max(pacientesReativados, 1))}/paciente
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Próximas ações</CardTitle>
              <CardDescription>Sugestões automatizadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Enviar lote WhatsApp</span>
                <Badge variant="outline" className="text-primary border-primary/30">Hoje</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Negociações agendadas</span>
                <span className="font-medium">4 pacientes</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Configurar lembretes automáticos
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aging List Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aging List — Faixas de Atraso</CardTitle>
          <CardDescription>Distribuição da inadimplência por tempo de atraso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-6 w-full rounded-full overflow-hidden mb-4">
            {agingTotal > 0 && (
              <>
                <div className="bg-yellow-400 transition-all" style={{ width: `${(aging['1-30'] / agingTotal) * 100}%` }} />
                <div className="bg-orange-400 transition-all" style={{ width: `${(aging['31-60'] / agingTotal) * 100}%` }} />
                <div className="bg-red-400 transition-all" style={{ width: `${(aging['61-90'] / agingTotal) * 100}%` }} />
                <div className="bg-red-700 transition-all" style={{ width: `${(aging['90+'] / agingTotal) * 100}%` }} />
              </>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(aging).map(([faixa, valor]) => {
              const config = faixaConfig[faixa]
              const count = mockInadimplentes.filter(p => p.faixa === faixa).length
              return (
                <div key={faixa} className="flex items-center gap-3 rounded-lg border p-3">
                  <div>
                    <Badge className={config.bgColor}>{config.label}</Badge>
                    <p className="text-lg font-bold mt-1">{formatCurrency(valor)}</p>
                    <p className="text-xs text-muted-foreground">{count} paciente{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filtro */}
      <div className="flex items-center justify-between">
        <Select value={faixaFilter} onValueChange={setFaixaFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filtrar faixa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as Faixas</SelectItem>
            <SelectItem value="1-30">1-30 dias</SelectItem>
            <SelectItem value="31-60">31-60 dias</SelectItem>
            <SelectItem value="61-90">61-90 dias</SelectItem>
            <SelectItem value="90+">90+ dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Inadimplentes */}
      <div className="space-y-3">
        {filtered.map((paciente) => {
          const isExpanded = expandedPaciente === paciente.id
          const config = faixaConfig[paciente.faixa]

          return (
            <Card key={paciente.id}>
              <CardHeader className="cursor-pointer py-4" onClick={() => setExpandedPaciente(isExpanded ? null : paciente.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                      <Users className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {paciente.nome}
                        <Badge className={config.bgColor}>{config.label}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {paciente.parcelasVencidas} parcela{paciente.parcelasVencidas !== 1 ? 's' : ''} vencida{paciente.parcelasVencidas !== 1 ? 's' : ''} •
                        Último pgto: {paciente.ultimoPagamento ? formatDate(paciente.ultimoPagamento) : 'Nunca'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{formatCurrency(paciente.totalDevido)}</p>
                      <p className="text-xs text-muted-foreground">{paciente.diasAtraso} dias de atraso</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); window.open(`tel:${paciente.telefone}`) }} title="Ligar">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/55${paciente.telefone.replace(/\D/g, '')}`) }} title="WhatsApp">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
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
                        <TableHead>Descrição</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Dias em Atraso</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-24" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paciente.parcelas.map((parcela) => (
                        <TableRow key={parcela.id}>
                          <TableCell className="font-medium text-sm">{parcela.descricao}</TableCell>
                          <TableCell className="text-sm">{formatDate(parcela.vencimento)}</TableCell>
                          <TableCell>
                            <Badge className={parcela.diasAtraso > 60 ? 'bg-red-100 text-red-800' : parcela.diasAtraso > 30 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}>
                              {parcela.diasAtraso} dias
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-600">{formatCurrency(parcela.valor)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-7 text-xs"><CheckCircle className="mr-1 h-3 w-3" />Baixar</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm">
                      <Send className="mr-2 h-3 w-3" />
                      Enviar Cobrança
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="mr-2 h-3 w-3" />
                      Negociar
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum inadimplente nesta faixa</h3>
              <p className="text-muted-foreground">Todos os pagamentos estão em dia para este filtro</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
