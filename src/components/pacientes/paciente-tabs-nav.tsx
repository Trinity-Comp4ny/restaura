'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Calendar, Phone, Mail, User, FileText, Heart, Clock, Stethoscope, Camera, MessageSquare } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { OverviewTab } from '@/components/pacientes/tabs/overview-tab'
import HistoryTab from '@/components/pacientes/tabs/history-tab-minimal'
import { TreatmentsTab } from '@/components/pacientes/tabs/treatments-tab'
import { FinancialTab } from '@/components/pacientes/tabs/financial-tab'
import { DocumentsTab } from '@/components/pacientes/tabs/documents-tab'
import { getInitials, formatPhone, formatDate } from '@/lib/utils'
import { useMockPacientes } from '@/lib/api-mock-client'

interface PacienteTabsNavProps {
  pacienteId: string
  ativoTabId: string
}

export function PacienteTabsNav({ pacienteId, ativoTabId }: PacienteTabsNavProps) {
  const router = useRouter()

  // Buscar dados do paciente via API
  const { data: mockData } = useMockPacientes() as { data?: { data: any[] } }
  const paciente = mockData?.data?.find((p: any) => p.id === pacienteId)

  // Calcular idade
  const calcularIdade = (birthDate: string) => {
    const hoje = new Date()
    const nascimento = new Date(birthDate)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade
  }

  // Funções para comunicação
  const handlePhoneCall = (telefone: string) => {
    if (telefone) {
      window.open(`tel:${telefone}`)
    }
  }

  const handleSendMessage = (telefone: string) => {
    if (telefone) {
      const cleanPhone = telefone.replace(/\D/g, '')
      window.open(`https://wa.me/55${cleanPhone}`)
    }
  }

  // Navegação para as abas
  const tabs = [
    { id: 'geral', label: 'Visão Geral', href: `/pacientes/${pacienteId}/geral`, icon: User, component: OverviewTab },
    { id: 'historico', label: 'Consultas', href: `/pacientes/${pacienteId}/consultas`, icon: Clock, component: HistoryTab },
    { id: 'tratamentos', label: 'Tratamentos', href: `/pacientes/${pacienteId}/tratamentos`, icon: Stethoscope, component: TreatmentsTab },
    { id: 'financeiro', label: 'Financeiro', href: `/pacientes/${pacienteId}/financeiro`, icon: FileText, component: FinancialTab },
    { id: 'documentos', label: 'Documentos', href: `/pacientes/${pacienteId}/documentos`, icon: Camera, component: DocumentsTab }
  ]

  const ativoTab = tabs.find(tab => tab.id === ativoTabId) || tabs[0]
  const ActiveComponent = ativoTab.component

  if (!paciente) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/pacientes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Paciente não encontrado</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Paciente não encontrado ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com informações do paciente */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/pacientes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={paciente.url_avatar || ''} alt={paciente.nome} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(paciente.nome)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{paciente.nome}</h1>
            <p className="text-muted-foreground">
              {paciente.telefone ? formatPhone(paciente.telefone) : 'Sem telefone'} • 
              {paciente.email ? ` ${paciente.email}` : ' Sem e-mail'}
            </p>
          </div>
        </div>
        
        {/* Ações rápidas */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/pacientes/${pacienteId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button onClick={() => router.push(`/agenda/novo?paciente_id=${pacienteId}`)}>
            <Calendar className="mr-2 h-4 w-4" />
            Agendar
          </Button>
        </div>
      </div>

      {/* Card Principal com Foto e Info Básicas */}
      <Card className="overflow-hidden relative">
        {/* Botões de Comunicação - Canto Superior Direito */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex gap-1">
            {paciente.telefone && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handlePhoneCall(paciente.telefone!)}
                  className="h-8 w-8 bg-white/80 hover:bg-white"
                  title="Ligar"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleSendMessage(paciente.telefone!)}
                  className="h-8 w-8 bg-white/80 hover:bg-white"
                  title="Enviar mensagem"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar Grande */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={paciente.url_avatar || ''} alt={paciente.nome} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {getInitials(paciente.nome)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Informações Básicas */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h2 className="text-3xl font-bold">{paciente.nome}</h2>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{paciente.telefone ? formatPhone(paciente.telefone) : 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{paciente.email || 'Não informado'}</span>
                </div>
                {paciente.data_nascimento && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{calcularIdade(paciente.data_nascimento)} anos</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="outline" className="text-xs">
                  {paciente.genero || 'Não informado'}
                </Badge>
                {paciente.profissao && (
                  <Badge variant="outline" className="text-xs">
                    {paciente.profissao}
                  </Badge>
                )}
                {paciente.convenio && (
                  <Badge variant="outline" className="text-xs">
                    {paciente.convenio}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navegação por Abas */}
      <div className="border-b">
        <nav className="flex space-x-1 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = ativoTab.id === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className="min-h-[400px]">
        <ActiveComponent pacienteId={pacienteId} />
      </div>
    </div>
  )
}
