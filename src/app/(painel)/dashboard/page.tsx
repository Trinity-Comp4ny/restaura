import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export const metadata = {
  title: 'Dashboard',
}

const stats = [
  {
    title: 'Total de Pacientes',
    value: '1.284',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Consultas Hoje',
    value: '24',
    change: '+4',
    changeType: 'positive' as const,
    icon: Calendar,
  },
  {
    title: 'Receita do Mês',
    value: formatCurrency(45680),
    change: '+8.2%',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
  {
    title: 'Taxa de Ocupação',
    value: '87%',
    change: '+5%',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
]

const todayAppointments = [
  {
    id: 1,
    time: '08:00',
    patient: 'Maria Silva',
    procedure: 'Limpeza',
    status: 'confirmed',
    dentist: 'Dr. João',
  },
  {
    id: 2,
    time: '09:00',
    patient: 'Carlos Santos',
    procedure: 'Restauração',
    status: 'in_progress',
    dentist: 'Dr. João',
  },
  {
    id: 3,
    time: '10:30',
    patient: 'Ana Oliveira',
    procedure: 'Ortodontia',
    status: 'scheduled',
    dentist: 'Dra. Paula',
  },
  {
    id: 4,
    time: '11:00',
    patient: 'Pedro Costa',
    procedure: 'Extração',
    status: 'scheduled',
    dentist: 'Dr. João',
  },
  {
    id: 5,
    time: '14:00',
    patient: 'Lucia Ferreira',
    procedure: 'Clareamento',
    status: 'scheduled',
    dentist: 'Dra. Paula',
  },
]

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }> = {
  scheduled: { label: 'Agendado', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'success' },
  in_progress: { label: 'Em Andamento', variant: 'warning' },
  completed: { label: 'Concluído', variant: 'default' },
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está um resumo da sua clínica.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
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
        ))}
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
              {todayAppointments.map((appointment) => (
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
                  <Badge variant={statusLabels[appointment.status].variant}>
                    {statusLabels[appointment.status].label}
                  </Badge>
                </div>
              ))}
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
              <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
                <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">
                    3 pacientes não confirmaram
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    Consultas de amanhã aguardando confirmação
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                <DollarSign className="mt-0.5 h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    5 pagamentos pendentes
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Total: {formatCurrency(2450)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                <Users className="mt-0.5 h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">
                    12 novos pacientes
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Cadastrados este mês
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
