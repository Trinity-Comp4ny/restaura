'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Calendar, Phone, Mail, MapPin, User, FileText, Heart, Smile, Clock, Stethoscope, MessageSquare } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePaciente } from '@/hooks/use-pacientes'
import { useHistoricoPaciente } from '@/hooks/use-consultas'
import { getInitials, formatPhone, formatDate, formatTime } from '@/lib/utils'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/constants'
import type { Database } from '@/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']

export default function PacientePerfilPage() {
  const params = useParams()
  const router = useRouter()
  const pacienteId = (params?.pacienteId as string) || ''

  const { data: paciente, isLoading } = usePaciente(pacienteId)
  
  // Buscar histórico de consultas
  const { data: historico, isLoading: isLoadingHistorico } = useHistoricoPaciente(pacienteId)

  // Página principal redireciona para /geral
  useEffect(() => {
    router.push(`/pacientes/${pacienteId}/geral`)
  }, [pacienteId, router])

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
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
      {/* Header com informações básicas do paciente */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
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
      <Card className="overflow-hidden">
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
                <Badge variant={paciente.ativo ? 'success' : 'secondary'} className="w-fit">
                  {paciente.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
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

      {/* Resumo Rápido */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Saúde */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-700">
              <Heart className="h-5 w-5" />
              Saúde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Alergias</span>
                <span className="font-medium text-sm text-red-600">
                  {paciente.alergias || 'Nenhuma'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Doenças</span>
                <span className="font-medium text-sm text-red-600">
                  {paciente.doencas_sistemicas || 'Nenhuma'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Medicamentos</span>
                <span className="font-medium text-sm text-red-600">
                  {paciente.medicamentos || 'Nenhum'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Últimas Consultas */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <Calendar className="h-5 w-5" />
              Últimas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Última Visita</span>
                <span className="font-medium text-sm">
                  {paciente.ultima_consulta_odonto ? formatDate(paciente.ultima_consulta_odonto) : 'Não informada'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Consultas</span>
                <span className="font-medium text-sm">{historico?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Próxima Consulta</span>
                <span className="font-medium text-sm">Agendar</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financeiro */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-700">
              <FileText className="h-5 w-5" />
              Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Convênio</span>
                <span className="font-medium text-sm">
                  {paciente.convenio || 'Particular'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Débitos</span>
                <span className="font-medium text-sm text-red-600">R$ 450,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Último Pagto</span>
                <span className="font-medium text-sm">15/01/2024</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações Importantes */}
      {paciente.observacoes && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <FileText className="h-5 w-5" />
              Observações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="whitespace-pre-wrap text-sm">{paciente.observacoes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
