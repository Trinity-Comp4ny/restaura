'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { WelcomeHeader } from './components/welcome-header'
import { QuickActions } from './components/quick-actions'
import { NextAppointments } from './components/next-appointments'
import { useHomeDataReal } from '@/hooks/use-home-data-real'
import { useUser } from '@/hooks/use-user'

// Quick actions estáticos para fallback
const quickActions = [
  {
    id: 'novo-paciente',
    title: 'Novo Paciente',
    description: 'Cadastrar novo paciente',
    icon: 'Users',
    href: '/pacientes/novo',
    color: 'blue',
    disabled: true
  },
  {
    id: 'nova-consulta',
    title: 'Nova Consulta',
    description: 'Agendar consulta',
    icon: 'Calendar',
    href: '/agenda/novo',
    color: 'green',
    disabled: true
  },
  {
    id: 'financeiro',
    title: 'Visualizar Financeiro',
    description: 'Ver financeiro',
    icon: 'DollarSign',
    href: '/financeiro',
    color: 'yellow'
  }
]

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-1">
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: user } = useUser()
  const { data, isLoading: loading, error } = useHomeDataReal(user?.clinica_id)
  
  // Função para obter nome de exibição do usuário
  const getDisplayName = (user: any) => {
    if (user?.nome) return user.nome
    if (user?.email) return user.email.split('@')[0]
    return 'Usuário'
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span>{error instanceof Error ? error.message : 'Erro ao carregar dados'}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        {/* Cabeçalho de boas-vindas */}
        <WelcomeHeader userName={getDisplayName(user)} />

        {/* Ações rápidas - sempre mostrar */}
        <QuickActions actions={quickActions} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho de boas-vindas */}
      <WelcomeHeader userName={getDisplayName(user)} />

      {/* Ações rápidas */}
      <QuickActions actions={data.quickActions} />

      {/* Próximas consultas */}
      <NextAppointments appointments={data.nextAppointments} />
    </div>
  )
}
