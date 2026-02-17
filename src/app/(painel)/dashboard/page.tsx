'use client'

import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react'

import { useDocumentTitle } from '@/hooks/use-document-title'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useDashboardStats } from '@/hooks/use-dashboard'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }> = {
  scheduled: { label: 'Agendado', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'success' },
  in_progress: { label: 'Em Andamento', variant: 'warning' },
  completed: { label: 'Concluído', variant: 'default' },
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { data: dashboardData, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está um resumo da sua clínica.
          </p>
        </div>
        <div>Carregando...</div>
      </div>
    )
  }

  const { stats, todayAppointments, alerts } = dashboardData || {
    stats: [],
    todayAppointments: [],
    alerts: []
  }

  const getIcon = (title: string) => {
    switch (title) {
      case 'Total de Pacientes': return Users
      case 'Consultas Hoje': return Calendar
      case 'Receita do Mês': return DollarSign
      case 'Taxa de Ocupação': return TrendingUp
      default: return TrendingUp
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertCircle
      case 'info': return DollarSign
      case 'success': return Users
      default: return AlertCircle
    }
  }

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-900 dark:bg-gray-950'
    }
  }

  const getAlertTextColors = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600 text-yellow-800 dark:text-yellow-200 text-yellow-700 dark:text-yellow-300'
      case 'info':
        return 'text-blue-600 text-blue-800 dark:text-blue-200 text-blue-700 dark:text-blue-300'
      case 'success':
        return 'text-green-600 text-green-800 dark:text-green-200 text-green-700 dark:text-green-300'
      default:
        return 'text-gray-600 text-gray-800 dark:text-gray-200 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está um resumo da sua clínica.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = getIcon(stat.title)
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {stat.change}
                  </span>{' '}
                  em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Consultas de Hoje
            </CardTitle>
            <CardDescription>
              Você tem {todayAppointments.length} consultas agendadas para hoje.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {appointment.time}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{appointment.patient}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.procedure} • {appointment.dentist}
                      </div>
                    </div>
                  </div>
                  <Badge variant={statusLabels[appointment.status]?.variant || 'secondary'}>
                    {statusLabels[appointment.status]?.label || 'Agendado'}
                  </Badge>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma consulta agendada para hoje.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas e Pendências
            </CardTitle>
            <CardDescription>Itens que precisam de sua atenção.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => {
                  const Icon = getAlertIcon(alert.type)
                  const colors = getAlertColors(alert.type)
                  const textColors = getAlertTextColors(alert.type)
                  const [iconColor, titleColor, descColor] = textColors.split(' ')
                  
                  return (
                    <div key={index} className={`flex items-start gap-3 rounded-lg border p-3 ${colors}`}>
                      <Icon className={`mt-0.5 h-4 w-4 ${iconColor}`} />
                      <div>
                        <div className={`font-medium ${titleColor}`}>
                          {alert.title}
                        </div>
                        <div className={`text-sm ${descColor}`}>
                          {alert.description}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma pendência no momento.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
