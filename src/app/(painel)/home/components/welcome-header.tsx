'use client'

import { Calendar } from 'lucide-react'

interface WelcomeHeaderProps {
  userName?: string
}

export function WelcomeHeader({ userName = 'Dr. Silva' }: WelcomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const formatDate = () => {
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }
    return date.toLocaleDateString('pt-BR', options)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-muted-foreground flex items-center gap-2 mt-1">
          <Calendar className="h-4 w-4" />
          {formatDate()}
        </p>
      </div>
    </div>
  )
}
