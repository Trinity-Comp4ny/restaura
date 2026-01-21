'use client'

import { Phone, MessageSquare, CheckCircle, Clock, User, ChevronDown, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { APPOINTMENT_STATUS_CONFIG, APPOINTMENT_STATUS, APPOINTMENT_STATUS_FLOW } from '@/constants/appointment-status'
import { NextAppointment } from '../hooks/use-home-data'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'

interface NextAppointmentsProps {
  appointments: NextAppointment[]
}

export function NextAppointments({ appointments }: NextAppointmentsProps) {
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

  const handleStatusChange = async (appointmentId: string, newStatus: typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Mudando status:', appointmentId, 'para:', newStatus)
    }
    // TODO: Implementar atualização do status no banco de dados
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Próximas Consultas
        </CardTitle>
        <CardDescription>
          As próximas {appointments.length} consultas do dia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {appointments.map((appointment: NextAppointment) => {
            const status = APPOINTMENT_STATUS_CONFIG[appointment.status]
            
            return (
              <Link 
                key={appointment.id}
                href={`/agenda/${appointment.id}`}
                className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50 hover:shadow-sm hover:border-primary/30"
              >
                <div
                  className="h-full w-1 self-stretch rounded-full"
                  style={{ backgroundColor: '#3b82f6' }}
                />
                <div className="flex min-w-[100px] flex-col">
                  <span className="text-lg font-bold text-primary">{appointment.time}</span>
                  <span className="text-sm text-muted-foreground">--:--</span>
                </div>
                <div className="flex flex-1 items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(appointment.patient)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{appointment.patient}</div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.procedure} • {appointment.dentist}
                    </div>
                  </div>
                </div>
                {appointment.status === APPOINTMENT_STATUS.ESPERANDO && (
                  <Button 
                    size="sm" 
                    className="h-8 px-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCallPatient(appointment.telefone!)
                    }}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Chamar
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bgColor} ${status.textColor} hover:opacity-80 transition-opacity cursor-pointer`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {status.label}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {Object.entries(APPOINTMENT_STATUS_CONFIG).map(([statusKey, statusConfig]) => {
                      const statusKeyTyped = statusKey as typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]
                      const isSelected = statusKeyTyped === appointment.status
                      
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
                  {appointment.telefone && (
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
                        <DropdownMenuItem onClick={() => handlePhoneCall(appointment.telefone!)}>
                          <Phone className="h-4 w-4 mr-2" />
                          Ligar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendMessage(appointment.telefone!)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Enviar mensagem
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
