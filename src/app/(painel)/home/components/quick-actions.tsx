'use client'

import Link from 'next/link'
import { Users, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QuickAction } from '../hooks/use-home-data'

interface QuickActionsProps {
  actions: QuickAction[]
}

const iconMap = {
  Users,
  Calendar,
  DollarSign,
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>
          Acessar as funcionalidades mais usadas do dia a dia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {actions.map((action) => {
            const IconComponent = iconMap[action.icon as keyof typeof iconMap]
            
            return (
              <Link key={action.id} href={action.href}>
                <Button
                  variant="outline"
                  className="h-24 w-full flex flex-col items-center justify-center gap-2 hover:bg-accent transition-colors group"
                >
                  <div className="p-3 rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
