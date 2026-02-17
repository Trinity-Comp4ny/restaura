'use client'

import { useState } from 'react'
import { Heart, Smile, Plus, Edit, Save, X, AlertTriangle, FileText, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePaciente } from '@/hooks/use-pacientes'
import { formatDate } from '@/lib/utils'

interface ClinicalTabProps {
  pacienteId: string
}

export function ClinicalTab({ pacienteId }: ClinicalTabProps) {
  const { data: paciente } = usePaciente(pacienteId)
  const [isEditing, setIsEditing] = useState(false)
  const [showAnamneseDialog, setShowAnamneseDialog] = useState(false)
  
  // Estado para edição dos campos clínicos
  const [clinicalData, setClinicalData] = useState({
    alergias: paciente?.alergias || '',
    doencas_sistemicas: paciente?.doencas_sistemicas || '',
    medicamentos: paciente?.medicamentos || '',
    condicoes_especiais: paciente?.condicoes_especiais || '',
    ultima_consulta_odonto: paciente?.ultima_consulta_odonto || '',
    higiene_bucal: paciente?.higiene_bucal || '',
    tratamentos_anteriores: paciente?.tratamentos_anteriores || '',
    habitos: paciente?.habitos || '',
    observacoes: paciente?.observacoes || ''
  })

  // Mock de anamnese detalhada
  const [anamnese, setAnamnese] = useState([
    {
      id: '1',
      date: '2024-01-15',
      type: 'Queixa Principal',
      content: 'Paciente relata sensibilidade ao frio no dente 21',
      dentist: 'Dr. Carlos Silva'
    },
    {
      id: '2',
      date: '2024-01-15',
      type: 'História da Doença Atual',
      content: 'Sensibilidade iniciada há 2 meses após clareamento. Negativa dor espontânea',
      dentist: 'Dr. Carlos Silva'
    }
  ])

  // Mock de exames clínicos
  const [examesClinicos, setExamesClinicos] = useState([
    {
      id: '1',
      date: '2024-01-15',
      type: 'Exame Físico',
      content: 'ATM: Sem limitação de movimento, sem ruídos. Músculos mastigatórios sem dor à palpação',
      dentist: 'Dr. Carlos Silva'
    },
    {
      id: '2',
      date: '2024-01-15',
      type: 'Exame Intra-oral',
      content: 'Mucosas normocoradas, hídritas. Sem lesões visíveis. Dente 21 com sensibilidade ao frio',
      dentist: 'Dr. Carlos Silva'
    }
  ])

  const handleSave = () => {
    // Aqui viria a lógica para salvar no banco
    console.log('Salvar dados clínicos:', clinicalData)
    setIsEditing(false)
  }

  const handleAddAnamnese = (data: any) => {
    // Aqui viria a lógica para adicionar anamnese
    console.log('Adicionar anamnese:', data)
    setShowAnamneseDialog(false)
  }

  if (!paciente) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Paciente não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prontuário Clínico</h1>
          <p className="text-muted-foreground">Registro completo do histórico médico e odontológico</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showAnamneseDialog} onOpenChange={setShowAnamneseDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nova Anamnese
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Anamnese</DialogTitle>
                <DialogDescription>
                  Registre uma nova anamnese do paciente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Anamnese</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="queixa">Queixa Principal</SelectItem>
                      <SelectItem value="historia">História da Doença Atual</SelectItem>
                      <SelectItem value="revisao">Revisão de Sistemas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea 
                    placeholder="Descreva detalhadamente..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAnamneseDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleAddAnamnese({})}>
                  Salvar Anamnese
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant={isEditing ? "default" : "outline"} 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Histórico Médico */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Heart className="h-5 w-5" />
            Histórico Médico
          </CardTitle>
          <CardDescription>
            Informações médicas importantes para o tratamento odontológico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Alergias</Label>
              {isEditing ? (
                <Input
                  value={clinicalData.alergias}
                  onChange={(e) => setClinicalData({...clinicalData, alergias: e.target.value})}
                  placeholder="Nenhuma"
                />
              ) : (
                <div className="p-2 bg-red-50 rounded border border-red-100">
                  <span className="text-sm">{clinicalData.alergias || 'Nenhuma'}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Doenças Sistêmicas</Label>
              {isEditing ? (
                <Input
                  value={clinicalData.doencas_sistemicas}
                  onChange={(e) => setClinicalData({...clinicalData, doencas_sistemicas: e.target.value})}
                  placeholder="Nenhuma"
                />
              ) : (
                <div className="p-2 bg-red-50 rounded border border-red-100">
                  <span className="text-sm">{clinicalData.doencas_sistemicas || 'Nenhuma'}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Medicamentos em Uso</Label>
              {isEditing ? (
                <Input
                  value={clinicalData.medicamentos}
                  onChange={(e) => setClinicalData({...clinicalData, medicamentos: e.target.value})}
                  placeholder="Nenhum"
                />
              ) : (
                <div className="p-2 bg-red-50 rounded border border-red-100">
                  <span className="text-sm">{clinicalData.medicamentos || 'Nenhum'}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Condições Especiais</Label>
              {isEditing ? (
                <Input
                  value={clinicalData.condicoes_especiais}
                  onChange={(e) => setClinicalData({...clinicalData, condicoes_especiais: e.target.value})}
                  placeholder="Nenhuma"
                />
              ) : (
                <div className="p-2 bg-red-50 rounded border border-red-100">
                  <span className="text-sm">{clinicalData.condicoes_especiais || 'Nenhuma'}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico Odontológico */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Smile className="h-5 w-5" />
            Histórico Odontológico
          </CardTitle>
          <CardDescription>
            Informações específicas do tratamento odontológico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Última Visita Odontológica</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={clinicalData.ultima_consulta_odonto}
                  onChange={(e) => setClinicalData({...clinicalData, ultima_consulta_odonto: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-blue-50 rounded border border-blue-100">
                  <span className="text-sm">
                    {clinicalData.ultima_consulta_odonto ? formatDate(clinicalData.ultima_consulta_odonto) : 'Não informada'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Higiene Bucal</Label>
              {isEditing ? (
                <Input
                  value={clinicalData.higiene_bucal}
                  onChange={(e) => setClinicalData({...clinicalData, higiene_bucal: e.target.value})}
                  placeholder="Não informada"
                />
              ) : (
                <div className="p-2 bg-blue-50 rounded border border-blue-100">
                  <span className="text-sm">{clinicalData.higiene_bucal || 'Não informada'}</span>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-medium">Tratamentos Anteriores</Label>
              {isEditing ? (
                <Textarea
                  value={clinicalData.tratamentos_anteriores}
                  onChange={(e) => setClinicalData({...clinicalData, tratamentos_anteriores: e.target.value})}
                  placeholder="Nenhum informado"
                  rows={2}
                />
              ) : (
                <div className="p-2 bg-blue-50 rounded border border-blue-100">
                  <span className="text-sm">{clinicalData.tratamentos_anteriores || 'Nenhum informado'}</span>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-medium">Hábitos</Label>
              {isEditing ? (
                <Textarea
                  value={clinicalData.habitos}
                  onChange={(e) => setClinicalData({...clinicalData, habitos: e.target.value})}
                  placeholder="Nenhum informado"
                  rows={2}
                />
              ) : (
                <div className="p-2 bg-blue-50 rounded border border-blue-100">
                  <span className="text-sm">{clinicalData.habitos || 'Nenhum informado'}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anamnese Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Anamnese Detalhada
          </CardTitle>
          <CardDescription>
            Registros detalhados das consultas e evoluções
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anamnese.map((item) => (
              <div key={item.id} className="border-l-4 border-l-primary pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{item.dentist}</span>
                </div>
                <p className="text-sm">{item.content}</p>
              </div>
            ))}
            
            {anamnese.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma anamnese registrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exames Clínicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Exames Clínicos
          </CardTitle>
          <CardDescription>
            Registros de exames físicos e avaliações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {examesClinicos.map((exame) => (
              <div key={exame.id} className="border-l-4 border-l-green-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-700">{exame.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(exame.date)}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{exame.dentist}</span>
                </div>
                <p className="text-sm">{exame.content}</p>
              </div>
            ))}
            
            {examesClinicos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum exame clínico registrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
