'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

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

  const days = getDaysInMonth(currentDate)
  
  // Dados mock de agendamentos
  const agendamentos = [
    {
      id: '1',
      date: new Date(2024, 0, 15), // 15 de Janeiro
      title: 'Maria Silva - Limpeza',
      time: '09:00',
      status: 'confirmado',
    },
    {
      id: '2',
      date: new Date(2024, 0, 15), // 15 de Janeiro
      title: 'Carlos Santos - Ajuste',
      time: '10:30',
      status: 'agendado',
    },
    {
      id: '3',
      date: new Date(2024, 0, 20), // 20 de Janeiro
      title: 'Ana Oliveira - Clareamento',
      time: '14:00',
      status: 'confirmado',
    },
  ]

  const getAgendamentosForDay = (day: Date) => {
    return agendamentos.filter(apt => 
      apt.date.getDate() === day.getDate() &&
      apt.date.getMonth() === day.getMonth() &&
      apt.date.getFullYear() === day.getFullYear()
    )
  }

  const statusColors: Record<string, string> = {
    agendado: 'bg-blue-100 text-blue-800',
    confirmado: 'bg-green-100 text-green-800',
    em_andamento: 'bg-yellow-100 text-yellow-800',
    concluído: 'bg-gray-100 text-gray-800',
    cancelado: 'bg-red-100 text-red-800',
    nao_compareceu: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os agendamentos.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

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
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Hoje
              </Button>
              <Button variant="outline" size="sm">
                Semana
              </Button>
              <Button variant="outline" size="sm">
                Mês
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Dias da semana */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
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
                        className={`text-xs p-1 rounded truncate ${statusColors[apt.status]}`}
                      >
                        {apt.time} - {apt.title.split(' - ')[0]}
                      </div>
                    ))}
                    {dayAgendamentos.length > 3 && (
                      <div className="text-xs text-muted-foreground">
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

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Agendamentos - {format(selectedDate, 'dd/MM/yyyy')}
            </CardTitle>
            <CardDescription>
              {getAgendamentosForDay(selectedDate).length} agendamentos neste dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getAgendamentosForDay(selectedDate).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{apt.time}</div>
                    <div>
                      <div className="font-medium">{apt.title}</div>
                      <Badge className={statusColors[apt.status]}>
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
              {getAgendamentosForDay(selectedDate).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento para este dia
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
