'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, User, Phone, MessageSquare, ChevronLeft, ChevronRight, ChevronDown, MoreVertical, List } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useDocumentTitle } from '@/hooks/use-document-title'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import { APPOINTMENT_STATUS_CONFIG, APPOINTMENT_STATUS } from '@/constants/appointment-status'


// Gerar agendamentos para o mês atual
const generateAppointmentsForCurrentMonth = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  
  const appointments = []
  
  // Adicionar alguns agendamentos nos primeiros dias do mês
  for (let day = 1; day <= 15; day++) {
    if (day % 3 === 0) { // A cada 3 dias
      appointments.push({
        id: `${day}-1`,
        time: '09:00',
        endTime: '09:30',
        title: `Paciente ${day}A`,
        description: 'Limpeza e profilaxia',
        patient: { nome: `Paciente ${day}A`, avatar: null, telefone: `(11) 9876${day}432`, id: `paciente-${day}a` },
        dentist: 'Dra. Paula',
        procedure: 'Limpeza',
        status: 'confirmado',
        color: '#3b82f6',
        date: new Date(currentYear, currentMonth, day),
      })
    }
    
    if (day % 4 === 0) { // A cada 4 dias
      appointments.push({
        id: `${day}-2`,
        time: '10:30',
        endTime: '11:30',
        title: `Paciente ${day}B`,
        description: 'Avaliação ortodôntica',
        patient: { nome: `Paciente ${day}B`, avatar: null, telefone: `(11) 9765${day}210`, id: `paciente-${day}b` },
        dentist: 'Dr. João',
        procedure: 'Ortodontia',
        status: 'confirmado',
        color: '#10b981',
        date: new Date(currentYear, currentMonth, day),
      })
    }
    
    if (day % 5 === 0) { // A cada 5 dias
      appointments.push({
        id: `${day}-3`,
        time: '14:00',
        endTime: '15:00',
        title: `Paciente ${day}C`,
        description: 'Clareamento dental',
        patient: { nome: `Paciente ${day}C`, avatar: null, telefone: `(11) 9123${day}567`, id: `paciente-${day}c` },
        dentist: 'Dra. Paula',
        procedure: 'Estética',
        status: 'confirmado',
        color: '#8b5cf6',
        date: new Date(currentYear, currentMonth, day),
      })
    }
  }
  
  // Adicionar agendamentos para hoje especificamente
  const today = now.getDate()
  appointments.push(
    {
      id: 'today-1',
      time: '08:00',
      endTime: '08:30',
      title: 'Maria Silva',
      description: 'Limpeza e profilaxia',
      patient: { nome: 'Maria Silva', avatar: null, telefone: '(11) 98765-4321', id: 'paciente-maria' },
      dentist: 'Dra. Paula',
      procedure: 'Limpeza',
      status: 'confirmado',
      color: '#3b82f6',
      date: new Date(currentYear, currentMonth, today),
    },
    {
      id: 'today-2',
      time: '10:00',
      endTime: '10:45',
      title: 'Carlos Santos',
      description: 'Avaliação ortodôntica',
      patient: { nome: 'Carlos Santos', avatar: null, telefone: '(11) 97654-3210', id: 'paciente-carlos' },
      dentist: 'Dr. João',
      procedure: 'Ortodontia',
      status: 'confirmado',
      color: '#3b82f6',
      date: new Date(currentYear, currentMonth, today),
    },
    {
      id: 'today-3',
      time: '14:30',
      endTime: '15:30',
      title: 'Ana Oliveira',
      description: 'Restauração composta',
      patient: { nome: 'Ana Oliveira', avatar: null, telefone: '(11) 91234-5678', id: 'paciente-ana' },
      dentist: 'Dra. Paula',
      procedure: 'Restauração',
      status: 'esperando',
      color: '#f59e0b',
      date: new Date(currentYear, currentMonth, today),
    },
    {
      id: 'today-4',
      time: '16:00',
      endTime: '17:00',
      title: 'Pedro Costa',
      description: 'Clareamento dental',
      patient: { nome: 'Pedro Costa', avatar: null, telefone: '(11) 99876-5432', id: 'paciente-pedro' },
      dentist: 'Dr. João',
      procedure: 'Clareamento',
      status: 'em_andamento',
      color: '#3b82f6',
      date: new Date(currentYear, currentMonth, today),
    }
  )
  
  return appointments
}

const appointments = generateAppointmentsForCurrentMonth()

const getAgendamentosForDay = (day: Date) => {
  return appointments.filter(apt => 
    apt.date.getDate() === day.getDate() &&
    apt.date.getMonth() === day.getMonth() &&
    apt.date.getFullYear() === day.getFullYear()
  )
}

const formattedDate = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).replace(/^\w/, (c) => c.toUpperCase()).replace(/,\s\d+\sde\s(\w+)/, (match, month) => match.replace(month, month.charAt(0).toUpperCase() + month.slice(1)))

export default function AppointmentsPage() {
  useDocumentTitle('Agenda')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const dayAppointments = getAgendamentosForDay(currentDate)
  const router = useRouter()

  const handleStatusChange = async (_appointmentId: string, _newStatus: typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]) => {
    // TODO: Implementar atualização do status no banco de dados
  }

  const handlePhoneCall = (telefone: string) => {
    window.open(`tel:${telefone}`)
  }

  const handleSendMessage = (telefone: string) => {
    const cleanPhone = telefone.replace(/\D/g, '')
    window.open(`https://wa.me/55${cleanPhone}`)
  }

  const handleCallPatient = (telefone: string) => {
    const cleanPhone = telefone.replace(/\D/g, '')
    window.open(`https://wa.me/55${cleanPhone}`)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Ajustar para começar na segunda-feira (1 = domingo, 2 = segunda, ..., 0 = sábado)
    let startingDayOfWeek = firstDay.getDay()
    // Converter para começar na segunda-feira: domingo(1) -> 6, segunda(2) -> 0, ..., sábado(0) -> 5
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

    const days = []
    
    // Adicionar dias vazios antes do primeiro dia do mês
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Adicionar todos os dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1)
      } else {
        newDate.setDate(prev.getDate() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground capitalize">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border bg-background">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/agenda/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Consulta
            </Button>
          </Link>
        </div>
      </div>

      {viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Consultas do Dia</CardTitle>
                <CardDescription>
                  {dayAppointments.length} consultas agendadas
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium min-w-[150px] text-center">
                  {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })
                    .replace(/^\w/, (c) => c.toUpperCase())
                    .replace(/,\s\d+\sde\s(\w+)/, (match, month) => match.replace(month, month.charAt(0).toUpperCase() + month.slice(1)))
                  }
                </span>
                <Button 
                  variant="outline" 
                  onClick={goToToday}
                  title="Voltar para hoje"
                >
                  Hoje
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateDay('prev')}
                  title="Dia anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateDay('next')}
                  title="Próximo dia"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dayAppointments.map((appointment) => (
                <Link 
                  key={appointment.id}
                  href={`/agenda/${appointment.id}`}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50 hover:shadow-sm hover:border-primary/30"
                >
                  <div
                    className="h-full w-1 self-stretch rounded-full"
                    style={{ backgroundColor: appointment.color }}
                  />
                  <div className="flex min-w-[100px] flex-col">
                    <span className="text-lg font-bold text-primary">{appointment.time}</span>
                    <span className="text-sm text-muted-foreground">{appointment.endTime}</span>
                  </div>
                  <div className="flex flex-1 items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(appointment.patient.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{appointment.patient.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.procedure} • {appointment.dentist}
                      </div>
                    </div>
                  </div>
                  {appointment.status === 'esperando' && (
                    <Button 
                      size="sm" 
                      className="h-8 px-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCallPatient(appointment.patient.telefone)
                      }}
                    >
                      <User className="h-4 w-4 mr-1" />
                      Chamar
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          appointment.status === 'agendado' || appointment.status === 'confirmado' 
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'esperando' || appointment.status === 'chamado' || appointment.status === 'em_andamento'
                            ? 'bg-yellow-100 text-yellow-800'
                            : appointment.status === 'concluido'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        } hover:opacity-80 transition-opacity cursor-pointer`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {appointment.status === 'agendado' ? 'Agendado' :
                         appointment.status === 'confirmado' ? 'Confirmado' :
                         appointment.status === 'esperando' ? 'Esperando' :
                         appointment.status === 'chamado' ? 'Chamado' :
                         appointment.status === 'em_andamento' ? 'Em Andamento' :
                         appointment.status === 'pausado' ? 'Pausado' :
                         appointment.status === 'concluido' ? 'Concluido' :
                         appointment.status === 'cancelado_paciente' ? 'Cancelado' :
                         appointment.status === 'cancelado_clinica' ? 'Cancelado' :
                         appointment.status === 'nao_compareceu' ? 'Não Compareceu' :
                         appointment.status === 'remarcado' ? 'Remarcado' : appointment.status}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {Object.entries(APPOINTMENT_STATUS_CONFIG).map(([statusKey, statusConfig]) => {
                        const statusKeyTyped = statusKey as typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]
                        const currentStatusKey = appointment.status as typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]
                        const isSelected = statusKeyTyped === currentStatusKey
                        
                        return (
                          <DropdownMenuItem
                            key={statusKey}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(appointment.id, statusKeyTyped)
                            }}
                            className={`flex items-center gap-2 cursor-pointer ${
                              isSelected 
                                ? `${statusConfig.bgColor} ${statusConfig.textColor} font-medium` 
                                : `${statusConfig.bgColor} ${statusConfig.textColor} opacity-50 hover:opacity-70`
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-current' : 'bg-transparent border-current border'
                            }`} />
                            {statusConfig.label}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {appointment.patient.telefone && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            title="Mais opções"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePhoneCall(appointment.patient.telefone)}>
                            <Phone className="h-4 w-4 mr-2" />
                            Ligar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendMessage(appointment.patient.telefone)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Enviar mensagem
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {format(currentDate, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())}
                </h2>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Dias da semana */}
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              
              {/* Dias do mês */}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="p-2" />
                }

                const dayAgendamentos = getAgendamentosForDay(day)
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors
                      ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      hover:bg-gray-50
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayAgendamentos.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className={`text-xs p-1 rounded truncate ${
                          apt.status === 'agendado' || apt.status === 'confirmado' 
                            ? 'bg-blue-100 text-blue-800'
                            : apt.status === 'esperando' || apt.status === 'chamado' || apt.status === 'em_andamento'
                            ? 'bg-yellow-100 text-yellow-800'
                            : apt.status === 'concluido'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                        >
                          <Link 
                            href={`/agenda/${apt.id}`}
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {apt.time} - {apt.title.split(' - ')[0]}
                          </Link>
                        </div>
                      ))}
                      {dayAgendamentos.length > 3 && (
                        <div 
                          className="text-xs text-muted-foreground cursor-pointer hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDate(day)
                          }}
                        >
                          +{dayAgendamentos.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'calendar' && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Consultas - {format(selectedDate, "d 'de' MMMM", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase()).replace(/,\s\d+\sde\s(\w+)/, (match, month) => match.replace(month, month.charAt(0).toUpperCase() + month.slice(1)))}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="lg"
                    onClick={() => setSelectedDate(null)}
                    className="text-2xl leading-none hover:bg-gray-100"
                  >
                    ×
                  </Button>
                </div>
                <CardDescription>
                  {getAgendamentosForDay(selectedDate).length} agendamentos neste dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getAgendamentosForDay(selectedDate).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50 hover:shadow-sm hover:border-primary/30 cursor-pointer"
                      onClick={() => router.push(`/agenda/${apt.id}`)}
                    >
                      <div
                        className="h-full w-1 self-stretch rounded-full"
                        style={{ backgroundColor: apt.color }}
                      />
                      <div className="flex min-w-[100px] flex-col">
                        <span className="text-lg font-bold text-primary">{apt.time}</span>
                        <span className="text-sm text-muted-foreground">{apt.endTime}</span>
                      </div>
                      <div className="flex flex-1 items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(apt.title.split(' - ')[0])}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <span 
                            className="font-medium hover:text-primary transition-colors inline-block cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`/pacientes/${apt.patient.id}`, '_blank')
                            }}
                          >
                            {apt.title}
                          </span>
                          <div className="text-sm text-muted-foreground">
                            {apt.procedure} • {apt.dentist}
                          </div>
                        </div>
                      </div>
                      {apt.status === 'esperando' && (
                        <Button 
                          size="sm" 
                          className="h-8 px-3"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCallPatient(apt.patient.telefone)
                          }}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Chamar
                        </Button>
                      )}
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {apt.patient.telefone && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                title="Mais opções"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePhoneCall(apt.patient.telefone)}>
                                <Phone className="h-4 w-4 mr-2" />
                                Ligar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendMessage(apt.patient.telefone)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Enviar mensagem
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {getAgendamentosForDay(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento para este dia
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
