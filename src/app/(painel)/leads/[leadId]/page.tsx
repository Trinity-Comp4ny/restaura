'use client'

import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Phone, Mail, DollarSign, Building, MessageSquare, Edit, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal'
import { formatPhone, formatDate, formatCurrency } from '@/lib/utils'
import { useState } from 'react'

interface Lead {
  id: string
  nome: string
  email: string
  telefone: string
  source: string
  status: string
  value: number
  createdAt: string
  lastContact: string
  observacoes: string
}

const mockLeads: Lead[] = [
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
  },
]

const statusColors: Record<string, string> = {
  novo: 'bg-gray-100 text-gray-800',
  em_contato: 'bg-blue-100 text-blue-800',
  proposta_enviada: 'bg-amber-100 text-amber-800',
  em_negociacao: 'bg-purple-100 text-purple-800',
  ganho: 'bg-green-100 text-green-800',
  perdido: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  novo: 'Novo',
  em_contato: 'Em Contato',
  proposta_enviada: 'Proposta Enviada',
  em_negociacao: 'Em Negociação',
  ganho: 'Ganho',
  perdido: 'Perdido',
}

export default function LeadDetalhePage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const lead = mockLeads.find(l => l.id === leadId)

  const handleDelete = () => {
    console.log('Excluindo lead:', leadId)
    // TODO: Implementar exclusão no banco de dados
    // await deleteLead(leadId)
    setShowDeleteModal(false)
    router.push('/leads')
  }

  if (!lead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/leads')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lead não encontrado</h1>
            <p className="text-muted-foreground">
              O lead solicitado não existe ou foi removido.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/leads')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lead.nome}</h1>
            <p className="text-muted-foreground">
              Detalhes do lead e histórico de interações
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/leads/${lead.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações do Lead
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Telefone</span>
                </div>
                <div className="font-medium">{formatPhone(lead.telefone)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>E-mail</span>
                </div>
                <div className="font-medium">{lead.email}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>Origem</span>
                </div>
                <Badge variant="outline">{lead.source}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Valor Potencial</span>
                </div>
                <div className="font-medium text-green-600">
                  {formatCurrency(lead.value)}
                </div>
              </div>
            </div>
            
            {lead.observacoes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>Observações</span>
                </div>
                <div className="text-sm bg-gray-50 p-3 rounded-lg">
                  {lead.observacoes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge className={`w-full justify-center py-2 ${statusColors[lead.status]}`}>
              {statusLabels[lead.status]}
            </Badge>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Cadastro</span>
                <span>{formatDate(lead.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último Contato</span>
                <span>{formatDate(lead.lastContact)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Ações comuns para este lead
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Phone className="mr-2 h-4 w-4" />
              Ligar Agora
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Enviar E-mail
            </Button>
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
          <CardDescription>
            Registro de todas as interações com este lead
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Lead cadastrado</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(lead.createdAt)} - Sistema
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Contato realizado</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(lead.lastContact)} -Telefone
                </div>
              </div>
            </div>
            
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma outra atividade registrada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Excluir Lead"
        description="Esta ação não pode ser desfeita e todos os dados do lead serão permanentemente removidos."
        itemName={lead.nome}
      />
    </div>
  )
}
