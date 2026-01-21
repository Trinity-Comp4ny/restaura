'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

import { WelcomeHeader } from './components/welcome-header'
import { QuickActions } from './components/quick-actions'
import { NextAppointments } from './components/next-appointments'
import { useHomeData } from './hooks/use-home-data'

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
  const { data, loading, error } = useHomeData()

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="border-muted-200 bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Nenhum dado disponível no momento.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho de boas-vindas */}
      <WelcomeHeader />

      {/* Ações rápidas */}
      <QuickActions actions={data.quickActions} />

      {/* Próximas consultas */}
      <NextAppointments appointments={data.nextAppointments} />
    </div>
  )
}
