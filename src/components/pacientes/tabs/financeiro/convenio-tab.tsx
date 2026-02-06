'use client'

import { useState } from 'react'
import { CreditCard, Shield, AlertTriangle, CheckCircle, Clock, Edit, Plus, FileText, RefreshCw, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatCurrency } from '@/lib/utils'

interface ConvenioTabProps {
  pacienteId: string
}

const mockConvenio = {
  ativo: true,
  nome: 'Unimed',
  plano: 'Dental Premium',
  numero_carteira: '0012345678-9',
  titular: 'Maria da Silva',
  parentesco: 'Titular',
  validade: '2025-12-31',
  cobertura_percentual: 80,
  limite_mensal: 500.00,
  limite_utilizado: 320.00,
  limite_anual: 6000.00,
  limite_anual_utilizado: 2800.00,
  carencia_restante: null,
  procedimentos_cobertos: [
    { procedimento: 'Consulta de Avaliação', cobertura: 100, limite: null, observacao: null },
    { procedimento: 'Limpeza / Profilaxia', cobertura: 100, limite: '2x por ano', observacao: null },
    { procedimento: 'Restauração Classe I/II', cobertura: 80, limite: null, observacao: 'Amálgama ou resina' },
    { procedimento: 'Tratamento Periodontal', cobertura: 70, limite: '4 sessões/ano', observacao: 'Necessita autorização prévia' },
    { procedimento: 'Exodontia Simples', cobertura: 100, limite: null, observacao: null },
    { procedimento: 'Radiografia Periapical', cobertura: 100, limite: '8x por ano', observacao: null },
    { procedimento: 'Radiografia Panorâmica', cobertura: 100, limite: '1x por ano', observacao: null },
    { procedimento: 'Endodontia (Canal)', cobertura: 60, limite: null, observacao: 'Autorização prévia obrigatória' },
    { procedimento: 'Prótese Fixa', cobertura: 0, limite: null, observacao: 'Não coberto neste plano' },
    { procedimento: 'Implante', cobertura: 0, limite: null, observacao: 'Não coberto neste plano' },
    { procedimento: 'Clareamento', cobertura: 0, limite: null, observacao: 'Procedimento estético - não coberto' },
    { procedimento: 'Ortodontia', cobertura: 50, limite: 'Até R$ 2.000/ano', observacao: 'Apenas aparelho fixo metálico' },
  ],
  historico_autorizacoes: [
    { id: '1', data: '2024-01-15', procedimento: 'Consulta de Avaliação', codigo: 'AUT-2024-0123', status: 'aprovada', valor_autorizado: 150.00 },
    { id: '2', data: '2024-02-10', procedimento: 'Tratamento Periodontal (4 sessões)', codigo: 'AUT-2024-0456', status: 'aprovada', valor_autorizado: 1120.00 },
    { id: '3', data: '2024-03-20', procedimento: 'Endodontia Dente 36', codigo: 'AUT-2024-0789', status: 'em_analise', valor_autorizado: null },
    { id: '4', data: '2024-04-01', procedimento: 'Prótese Parcial Removível', codigo: 'AUT-2024-0901', status: 'negada', valor_autorizado: null },
  ],
}

const statusAutConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  aprovada: { label: 'Aprovada', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
  em_analise: { label: 'Em Análise', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  negada: { label: 'Negada', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: AlertTriangle },
}

export function ConvenioTab({ pacienteId }: ConvenioTabProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showNovaAutorizacao, setShowNovaAutorizacao] = useState(false)
  const [editConvenio, setEditConvenio] = useState('unimed')
  const [editParentesco, setEditParentesco] = useState('titular')
  const data = mockConvenio

  const limMensalPercent = (data.limite_utilizado / data.limite_mensal) * 100
  const limAnualPercent = (data.limite_anual_utilizado / data.limite_anual) * 100
  const limMensalCritico = limMensalPercent > 80
  const limAnualCritico = limAnualPercent > 80

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {limMensalCritico && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Limite mensal do convênio está em {Math.round(limMensalPercent)}%
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Restam {formatCurrency(data.limite_mensal - data.limite_utilizado)} para uso neste mês
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados do Convênio */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              {data.nome} - {data.plano}
              {data.ativo ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Ativo</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Inativo</Badge>
              )}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-2 h-3 w-3" />
              Editar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nº Carteira</Label>
              <p className="font-medium font-mono">{data.numero_carteira}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Titular</Label>
              <p className="font-medium">{data.titular}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Parentesco</Label>
              <p className="font-medium">{data.parentesco}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Validade</Label>
              <p className="font-medium">{formatDate(data.validade)}</p>
            </div>
          </div>

          {/* Limites */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Limite Mensal</span>
                <span className={`text-sm ${limMensalCritico ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}`}>
                  {formatCurrency(data.limite_utilizado)} / {formatCurrency(data.limite_mensal)}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    limMensalCritico ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(limMensalPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Disponível: {formatCurrency(data.limite_mensal - data.limite_utilizado)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Limite Anual</span>
                <span className={`text-sm ${limAnualCritico ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}`}>
                  {formatCurrency(data.limite_anual_utilizado)} / {formatCurrency(data.limite_anual)}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    limAnualCritico ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(limAnualPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Disponível: {formatCurrency(data.limite_anual - data.limite_anual_utilizado)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Cobertura */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tabela de Cobertura
          </CardTitle>
          <CardDescription>Procedimentos e percentuais cobertos pelo plano</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedimento</TableHead>
                <TableHead className="text-center">Cobertura</TableHead>
                <TableHead>Limite</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.procedimentos_cobertos.map((proc, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{proc.procedimento}</TableCell>
                  <TableCell className="text-center">
                    {proc.cobertura === 100 ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">100%</Badge>
                    ) : proc.cobertura === 0 ? (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Não coberto</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{proc.cobertura}%</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{proc.limite || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{proc.observacao || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Histórico de Autorizações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Autorizações
              </CardTitle>
              <CardDescription>Histórico de autorizações solicitadas ao convênio</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowNovaAutorizacao(true)}>
              <Plus className="mr-2 h-3 w-3" />
              Nova Autorização
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Procedimento</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor Autorizado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.historico_autorizacoes.map((aut) => {
                const config = statusAutConfig[aut.status]
                const Icon = config.icon
                return (
                  <TableRow key={aut.id}>
                    <TableCell>{formatDate(aut.data)}</TableCell>
                    <TableCell className="font-medium">{aut.procedimento}</TableCell>
                    <TableCell className="font-mono text-sm">{aut.codigo}</TableCell>
                    <TableCell>
                      <Badge className={config.color}>
                        <Icon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {aut.valor_autorizado ? formatCurrency(aut.valor_autorizado) : '-'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Editar Convênio */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Dados do Convênio</DialogTitle>
            <DialogDescription>Atualize as informações do convênio do paciente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Convênio</Label>
                <Select value={editConvenio} onValueChange={setEditConvenio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unimed">Unimed</SelectItem>
                    <SelectItem value="amil">Amil</SelectItem>
                    <SelectItem value="bradesco">Bradesco Dental</SelectItem>
                    <SelectItem value="sulamerica">SulAmérica</SelectItem>
                    <SelectItem value="odontoprev">OdontoPrev</SelectItem>
                    <SelectItem value="metlife">MetLife</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plano</Label>
                <Input defaultValue={data.plano} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nº Carteira</Label>
                <Input defaultValue={data.numero_carteira} />
              </div>
              <div>
                <Label>Validade</Label>
                <Input type="date" defaultValue={data.validade} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Titular</Label>
                <Input defaultValue={data.titular} />
              </div>
              <div>
                <Label>Parentesco</Label>
                <Select value={editParentesco} onValueChange={setEditParentesco}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="titular">Titular</SelectItem>
                    <SelectItem value="dependente">Dependente</SelectItem>
                    <SelectItem value="conjuge">Cônjuge</SelectItem>
                    <SelectItem value="filho">Filho(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Limite Mensal (R$)</Label>
                <Input type="number" defaultValue={data.limite_mensal} step="0.01" />
              </div>
              <div>
                <Label>Limite Anual (R$)</Label>
                <Input type="number" defaultValue={data.limite_anual} step="0.01" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={() => setShowEditDialog(false)}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Autorização */}
      <Dialog open={showNovaAutorizacao} onOpenChange={setShowNovaAutorizacao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Autorização</DialogTitle>
            <DialogDescription>Registre uma solicitação de autorização ao convênio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Procedimento</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o procedimento" />
                </SelectTrigger>
                <SelectContent>
                  {data.procedimentos_cobertos
                    .filter((p) => p.cobertura > 0)
                    .map((p, i) => (
                      <SelectItem key={i} value={String(i)}>{p.procedimento}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Código de Autorização</Label>
              <Input placeholder="Ex: AUT-2024-XXXX" />
            </div>
            <div>
              <Label>Valor Estimado</Label>
              <Input type="number" placeholder="0,00" step="0.01" />
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Após registrar, acompanhe o status da autorização diretamente com o convênio e atualize aqui quando houver resposta.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaAutorizacao(false)}>Cancelar</Button>
            <Button onClick={() => setShowNovaAutorizacao(false)}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
