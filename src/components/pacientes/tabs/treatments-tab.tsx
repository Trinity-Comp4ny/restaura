'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useHistoricoPaciente } from '@/hooks/use-consultas'

interface TreatmentsTabProps {
  pacienteId: string
}

export function TreatmentsTab({ pacienteId }: TreatmentsTabProps) {
  const [showNewTreatmentDialog, setShowNewTreatmentDialog] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null)

  // Buscar histórico de consultas do paciente como base para tratamentos
  const { data: historico } = useHistoricoPaciente(pacienteId)

  const [treatments, setTreatments] = useState<any[]>([])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', color: 'bg-yellow-500', icon: Clock }
      case 'in_progress':
        return { label: 'Em Andamento', color: 'bg-blue-500', icon: AlertCircle }
      case 'completed':
        return { label: 'Concluído', color: 'bg-green-500', icon: CheckCircle }
      default:
        return { label: 'Desconhecido', color: 'bg-gray-500', icon: Clock }
    }
  }

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high':
        return { label: 'Alta', color: 'bg-red-500' }
      case 'medium':
        return { label: 'Média', color: 'bg-yellow-500' }
      case 'low':
        return { label: 'Baixa', color: 'bg-green-500' }
      default:
        return { label: 'Normal', color: 'bg-gray-500' }
    }
  }

  const calculateProgress = (procedures: any[]) => {
    const completed = procedures.filter(p => p.status === 'concluido').length
    return (completed / procedures.length) * 100
  }

  const handleAddTreatment = (data: any) => {
    // Aqui viria a lógica para adicionar tratamento
    console.log('Adicionar tratamento:', data)
    setShowNewTreatmentDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planos de Tratamento</h1>
          <p className="text-muted-foreground">Gerenciamento de tratamentos em andamento e planejados</p>
        </div>
        <Button onClick={() => setShowNewTreatmentDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {/* Resumo dos Tratamentos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {treatments.filter(t => t.status === 'in_progress').length}
                </div>
                <div className="text-sm text-muted-foreground">Em Andamento</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {treatments.filter(t => t.status === 'concluido').length}
                </div>
                <div className="text-sm text-muted-foreground">Concluídos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    treatments.reduce((sum, t) => sum + (t.total_value - t.paid_value), 0)
                  )}
                </div>
                <div className="text-sm text-muted-foreground">A Pagar</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {treatments.filter(t => t.priority === 'high' && t.status !== 'concluido').length}
                </div>
                <div className="text-sm text-muted-foreground">Alta Prioridade</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planos de Tratamento */}
      <div className="space-y-6">
        {treatments.map((treatment) => {
          const statusInfo = getStatusInfo(treatment.status)
          const priorityInfo = getPriorityInfo(treatment.priority)
          const progress = calculateProgress(treatment.procedures)
          const StatusIcon = statusInfo.icon

          return (
            <Card key={treatment.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
                    <div>
                      <CardTitle className="text-lg">{treatment.nome}</CardTitle>
                      <CardDescription>
                        Criado em {formatDate(treatment.created_date)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${priorityInfo.color} text-white`}>
                      Prioridade {priorityInfo.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progresso e Financeiro */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progresso do Tratamento</span>
                        <span className="text-sm text-muted-foreground">
                          {treatment.procedures.filter((p: { status: string }) => p.status === 'concluido').length}/{treatment.procedures.length} procedimentos
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progresso Financeiro</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(treatment.paid_value)} / {formatCurrency(treatment.total_value)}
                        </span>
                      </div>
                      <Progress value={(treatment.paid_value / treatment.total_value) * 100} className="h-2" />
                    </div>
                  </div>

                  {/* Observações */}
                  {treatment.observations && (
                    <div>
                      <h4 className="font-medium mb-2">Observações</h4>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                        {treatment.observations}
                      </p>
                    </div>
                  )}

                  {/* Lista de Procedimentos */}
                  <div>
                    <h4 className="font-medium mb-3">Procedimentos</h4>
                    <div className="space-y-2">
                      {treatment.procedures.map((procedure: {
                        id: string
                        status: string
                        nome: string
                        date?: string | null
                        professional: string
                        value: number
                      }, index: number) => {
                        const procedureStatusInfo = getStatusInfo(procedure.status)
                        const ProcedureStatusIcon = procedureStatusInfo.icon

                        return (
                          <div key={procedure.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                <div className={`w-2 h-2 rounded-full ${procedureStatusInfo.color}`}></div>
                              </div>
                              <div>
                                <div className="font-medium">{procedure.nome}</div>
                                <div className="text-sm text-muted-foreground">
                                  {procedure.date ? (
                                    <>
                                      {formatDate(procedure.date)} • {procedure.professional}
                                    </>
                                  ) : (
                                    'Não agendado'
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatCurrency(procedure.value)}</span>
                              <Badge variant="outline" className="text-xs">
                                <ProcedureStatusIcon className="h-3 w-3 mr-1" />
                                {procedureStatusInfo.label}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Plano
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar Próximo
                    </Button>
                    {treatment.status !== 'concluido' && (
                      <Button variant="outline" size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {treatments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="h-12 w-12 mx-auto mb-4 opacity-50 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum plano de tratamento</h3>
              <p className="text-muted-foreground mb-4">
                Este paciente ainda não possui planos de tratamento registrados
              </p>
              <Button onClick={() => setShowNewTreatmentDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Plano
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Novo Tratamento */}
      <Dialog open={showNewTreatmentDialog} onOpenChange={setShowNewTreatmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Plano de Tratamento</DialogTitle>
            <DialogDescription>
              Crie um plano de tratamento completo para o paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Plano</Label>
              <Input placeholder="Ex: Reabilitação Oral Superior" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Prioridade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data Prevista de Conclusão</Label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea 
                placeholder="Descreva detalhes importantes do plano..."
                rows={3}
              />
            </div>
            <div>
              <Label>Procedimentos (um por linha)</Label>
              <Textarea 
                placeholder="Exame e planejamento&#10;Clareamento dental&#10;Facetas em porcelana"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTreatmentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => handleAddTreatment({})}>
              Criar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
