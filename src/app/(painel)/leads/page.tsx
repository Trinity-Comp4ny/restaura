'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, LayoutGrid, Table } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import KanbanBoard from '@/components/leads/kanban-board'
import { formatPhone, formatDate } from '@/lib/utils'

export default function LeadsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [searchTerm, setSearchTerm] = useState('')
  const [leads, setLeads] = useState([
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      telefone: '11999887766',
      source: 'Google',
      status: 'novo',
      value: 1500,
      createdAt: '2024-01-15',
      lastContact: '2024-01-16',
      observacoes: 'Interessado em clareamento dental',
      isPatient: false,
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria.santos@email.com',
      telefone: '11988776655',
      source: 'Indicação',
      status: 'em_contato',
      value: 800,
      createdAt: '2024-01-14',
      lastContact: '2024-01-15',
      observacoes: 'Buscando ortodontia',
      isPatient: false,
    },
    {
      id: '3',
      nome: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      telefone: '11977665544',
      source: 'Facebook',
      status: 'proposta_enviada',
      value: 2500,
      createdAt: '2024-01-13',
      lastContact: '2024-01-14',
      observacoes: 'Precisa de implantes',
      isPatient: false,
    },
    {
      id: '4',
      nome: 'Ana Costa',
      email: 'ana.costa@email.com',
      telefone: '11966554433',
      source: 'Instagram',
      status: 'em_negociacao',
      value: 1200,
      createdAt: '2024-01-12',
      lastContact: '2024-01-13',
      observacoes: 'Interessada em clareamento',
      isPatient: false,
    },
    {
      id: '5',
      nome: 'Pedro Souza',
      email: 'pedro.souza@email.com',
      telefone: '11955443322',
      source: 'Telefone',
      status: 'ganho',
      value: 1800,
      createdAt: '2024-01-10',
      lastContact: '2024-01-12',
      observacoes: 'Já é paciente',
      isPatient: true,
    },
    {
      id: '6',
      nome: 'Luciana Ferreira',
      email: 'luciana.ferreira@email.com',
      telefone: '11944332211',
      source: 'Presencial',
      status: 'perdido',
      value: 900,
      createdAt: '2024-01-08',
      lastContact: '2024-01-09',
      observacoes: 'Não retornou contato',
      isPatient: false,
    },
  ])

  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.source.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStatusChange = (leadId: string, newStatus: string) => {
    console.log(`Lead ${leadId} movido para ${newStatus}`)
    
    // Atualizar estado local
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: newStatus, lastContact: new Date().toISOString().split('T')[0] }
          : lead
      )
    )
    
    // TODO: Implementar atualização no banco de dados
    // await updateLeadStatus(leadId, newStatus)
  }

  const handleLeadClick = (lead: any) => {
    console.log('Lead clicado:', lead)
    // Implementar navegação para detalhes do lead
  }

  const handleLeadReorder = (leadId: string, newOrder: number) => {
    console.log(`Lead ${leadId} movido para posição ${newOrder}`)
    
    // Implementar reordenação local
    setLeads(prevLeads => {
      const leadToMove = prevLeads.find(lead => lead.id === leadId)
      if (!leadToMove) return prevLeads
      
      const otherLeads = prevLeads.filter(lead => lead.id !== leadId && lead.status === leadToMove.status)
      const leadsInSameStatus = [leadToMove, ...otherLeads].sort((a, b) => {
        // Manter ordem atual para outros leads
        const aIndex = prevLeads.findIndex(l => l.id === a.id)
        const bIndex = prevLeads.findIndex(l => l.id === b.id)
        return aIndex - bIndex
      })
      
      // Mover lead para nova posição
      const currentIndex = leadsInSameStatus.findIndex(l => l.id === leadId)
      if (currentIndex !== -1) {
        const [removed] = leadsInSameStatus.splice(currentIndex, 1)
        leadsInSameStatus.splice(newOrder, 0, removed)
      }
      
      // Reconstruir array completo mantendo ordem das outras colunas
      const otherStatusLeads = prevLeads.filter(lead => lead.status !== leadToMove.status)
      return [...otherStatusLeads, ...leadsInSameStatus]
    })
    
    // TODO: Implementar atualização no banco de dados
    // await updateLeadOrder(leadId, newOrder)
  }

  const handleConvertToPatient = (leadId: string) => {
    console.log(`Convertendo lead ${leadId} para paciente`)
    
    // Implementar conversão local
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId 
          ? { ...lead, isPatient: true }
          : lead
      )
    )
    
    // TODO: Implementar conversão no banco de dados e criar registro de paciente
    // await convertLeadToPatient(leadId)
    // await createPatientFromLead(leadId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Gerencie o pipeline de conversão de pacientes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar lead..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/leads/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </Link>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard
          leads={filteredLeads}
          onLeadClick={handleLeadClick}
          onStatusChange={handleStatusChange}
          onLeadReorder={handleLeadReorder}
          onConvertToPatient={handleConvertToPatient}
        />
      ) : (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Lista de Leads</CardTitle>
              <CardDescription>
                Acompanhe o processo de conversão.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <Card 
                  key={lead.id}
                  className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                              {lead.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{lead.nome}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <span className="text-xs">📧</span>
                                <span className="truncate max-w-[150px]">{lead.email}</span>
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="flex items-center gap-1">
                                <span className="text-xs">📱</span>
                                {formatPhone(lead.telefone)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {lead.source}
                          </Badge>
                          <Badge className={`text-xs ${
                            lead.status === 'novo' ? 'bg-gray-100 text-gray-800' :
                            lead.status === 'em_contato' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'proposta_enviada' ? 'bg-amber-100 text-amber-800' :
                            lead.status === 'em_negociacao' ? 'bg-purple-100 text-purple-800' :
                            lead.status === 'ganho' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {lead.status === 'novo' ? 'Novo' :
                             lead.status === 'em_contato' ? 'Em Contato' :
                             lead.status === 'proposta_enviada' ? 'Proposta Enviada' :
                             lead.status === 'em_negociacao' ? 'Em Negociação' :
                             lead.status === 'ganho' ? 'Ganho' :
                             'Perdido'}
                          </Badge>
                          {lead.isPatient && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                              Paciente
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            R$ {lead.value.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(lead.lastContact)}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-gray-400">⋯</span>
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
                                console.log('Excluir lead', lead.id)
                              }}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
