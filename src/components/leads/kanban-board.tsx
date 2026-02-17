'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Phone, Mail, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPhone, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal'
import ConvertToPatientModal from '@/components/ui/convert-to-patient-modal'

interface Lead {
  id: string
  nome: string
  email?: string
  telefone?: string
  source: string
  status: string
  value?: number
  created_at?: string
  updated_at?: string
  observacoes?: string
  isPatient?: boolean // Nova propriedade para identificar pacientes
}

interface KanbanColumn {
  id: string
  title: string
  status: string
  color: string
  bgColor: string
  borderColor: string
}

interface KanbanBoardProps {
  leads: Lead[]
  onLeadClick?: (lead: Lead) => void
  onStatusChange?: (leadId: string, newStatus: string) => void
  onLeadReorder?: (leadId: string, newOrder: number) => void
  onConvertToPatient?: (leadId: string) => void
}

const columns: KanbanColumn[] = [
  {
    id: 'novo',
    title: 'Novo',
    status: 'novo',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  {
    id: 'em_contato',
    title: 'Em Contato',
    status: 'em_contato',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'proposta_enviada',
    title: 'Proposta Enviada',
    status: 'proposta_enviada',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  {
    id: 'em_negociacao',
    title: 'Em Negociação',
    status: 'em_negociacao',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    id: 'ganho',
    title: 'Ganho',
    status: 'ganho',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'perdido',
    title: 'Perdido',
    status: 'perdido',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
]

const sourceColors: Record<string, string> = {
  'Google': 'bg-blue-100 text-blue-800',
  'Facebook': 'bg-indigo-100 text-indigo-800',
  'Instagram': 'bg-pink-100 text-pink-800',
  'Marketing': 'bg-purple-100 text-purple-800',
  'Indicação': 'bg-green-100 text-green-800',
  'Telefone': 'bg-yellow-100 text-yellow-800',
  'Presencial': 'bg-orange-100 text-orange-800',
  'Site': 'bg-gray-100 text-gray-800',
  'Outros': 'bg-gray-100 text-gray-800'
}

export default function KanbanBoard({ leads, onLeadClick, onStatusChange, onLeadReorder, onConvertToPatient }: KanbanBoardProps) {
  const router = useRouter()
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null)

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status)
  }

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', lead.id)
    
    // Adicionar estilo visual ao arrastar
    const target = e.target as HTMLElement
    target.style.opacity = '0.5'
  }

  const handleDragOver = (e: React.DragEvent, status: string, index?: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStatus(status)
    if (index !== undefined) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverStatus(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, newStatus: string, dropIndex?: number) => {
    e.preventDefault()
    
    if (draggedLead) {
      // Se mudou de coluna
      if (draggedLead.status !== newStatus && onStatusChange) {
        onStatusChange(draggedLead.id, newStatus)
        
        // Se moveu para "ganho", mostrar modal de conversão
        if (newStatus === 'ganho' && !draggedLead.isPatient) {
          setLeadToConvert(draggedLead)
          setShowConvertModal(true)
        }
      }
      
      // Se reordenou na mesma coluna
      if (draggedLead.status === newStatus && dropIndex !== undefined && onLeadReorder) {
        const columnLeads = getLeadsByStatus(newStatus)
        const currentIndex = columnLeads.findIndex(lead => lead.id === draggedLead.id)
        
        if (currentIndex !== dropIndex && currentIndex !== -1) {
          onLeadReorder(draggedLead.id, dropIndex)
        }
      }
    }
    
    setDraggedLead(null)
    setDragOverStatus(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedLead(null)
    setDragOverStatus(null)
    setDragOverIndex(null)
    
    // Remover estilo visual
    const target = e.target as HTMLElement
    target.style.opacity = '1'
  }

  const handleDelete = (lead: Lead) => {
    setLeadToDelete(lead)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (leadToDelete) {
      console.log('Excluindo lead:', leadToDelete.id)
      // TODO: Implementar exclusão no banco de dados
      // await deleteLead(leadToDelete.id)
      setShowDeleteModal(false)
      setLeadToDelete(null)
    }
  }

  const confirmConvertToPatient = () => {
    if (leadToConvert) {
      console.log('Convertendo lead para paciente:', leadToConvert.id)
      // TODO: Implementar conversão no banco de dados
      // await convertLeadToPatient(leadToConvert.id)
      if (onConvertToPatient) {
        onConvertToPatient(leadToConvert.id)
      }
      setShowConvertModal(false)
      setLeadToConvert(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">No pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.length > 0 
                ? Math.round((getLeadsByStatus('ganho').length / leads.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Ganhos / Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Pipeline</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {leads
                .filter(lead => lead.status !== 'perdido')
                .reduce((sum, lead) => sum + (lead.value || 0), 0)
                .toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Potencial ativo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos Mês</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getLeadsByStatus('ganho').length}</div>
            <p className="text-xs text-muted-foreground">Convertidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 h-[calc(100vh-280px)] md:h-[calc(100vh-240px)] lg:h-[calc(100vh-200px)] overflow-x-auto">
        {columns.map((column) => {
          const columnLeads = getLeadsByStatus(column.status)
          const displayLeads = columnLeads.slice(0, 5)
          const hasMore = columnLeads.length > 5
          
          return (
            <div
              key={column.id}
              className={`flex-shrink-0 w-72 md:w-80 lg:w-96 ${column.bgColor} rounded-lg p-3 transition-all duration-200 ${
                dragOverStatus === column.status 
                  ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-lg' 
                  : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${column.color.replace('text', 'bg')}`} />
                  <h3 className={`font-semibold text-sm ${column.color}`}>
                    {column.title}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${column.bgColor} ${column.color} ${column.borderColor} border`}>
                    {columnLeads.length}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-200">
                  <span className="text-gray-400">⋯</span>
                </Button>
              </div>
              
              {/* Cards Container */}
              <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] md:max-h-[calc(100vh-340px)] lg:max-h-[calc(100vh-300px)]">
                {displayLeads.map((lead, index) => (
                  <div
                    key={lead.id}
                    className={`relative ${
                      dragOverStatus === column.status && dragOverIndex === index
                        ? 'pt-8 border-t-2 border-blue-400 -mt-6'
                        : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, column.status, index)}
                    onDrop={(e) => handleDrop(e, column.status, index)}
                  >
                    <Card
                      className={`cursor-move hover:shadow-lg hover:cursor-pointer transition-all duration-200 bg-white border-gray-200 ${
                        draggedLead?.id === lead.id ? 'opacity-50 rotate-1 shadow-lg' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/leads/${lead.id}`)
                      }}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm text-gray-900 truncate flex-1">
                            {lead.nome}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 hover:bg-gray-100 flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/leads/${lead.id}`)
                              }}>
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/leads/${lead.id}/edit`)
                              }}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(lead)
                                }}
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          <span>{lead.telefone ? formatPhone(lead.telefone) : ''}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                          <span className="text-xs font-semibold text-green-600">
                            R$ {(lead.value || 0).toLocaleString('pt-BR')}
                          </span>
                          <div className="flex items-center gap-1">
                            {lead.isPatient && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                                Paciente
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              {lead.source}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Indicador de posição para drop */}
                    {dragOverStatus === column.status && dragOverIndex === index && (
                      <div className="absolute top-0 left-0 right-0 h-2 bg-blue-400 rounded-full opacity-50" />
                    )}
                  </div>
                ))}
                
                {hasMore && (
                  <div className="text-center py-2 px-3 bg-gray-100 rounded-lg border border-gray-200">
                    <span className="text-xs text-gray-600 font-medium">
                      +{columnLeads.length - 5} mais
                    </span>
                  </div>
                )}
                
                {columnLeads.length === 0 && (
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
                    dragOverStatus === column.status 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50/50'
                  }`}>
                    <div className="text-gray-400 text-sm">
                      {dragOverStatus === column.status 
                        ? 'Solte o lead aqui' 
                        : 'Sem leads'
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={confirmDelete}
        title="Excluir Lead"
        description="Esta ação não pode ser desfeita e todos os dados do lead serão permanentemente removidos."
        itemName={leadToDelete?.nome}
      />

      {/* Modal de Conversão para Paciente */}
      <ConvertToPatientModal
        open={showConvertModal}
        onOpenChange={setShowConvertModal}
        onConfirm={confirmConvertToPatient}
        leadName={leadToConvert?.nome}
        leadEmail={leadToConvert?.email}
        leadPhone={leadToConvert?.telefone}
        leadValue={leadToConvert?.value}
      />
    </div>
  )
}
