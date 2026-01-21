'use client'

import { useRouter } from 'next/navigation'
import { PacienteForm } from '@/components/forms/paciente-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewPacientePage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pacientes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Paciente</h1>
          <p className="text-muted-foreground">Cadastre um novo paciente no sistema</p>
        </div>
      </div>

      <PacienteForm onSuccess={() => router.push('/pacientes')} />
    </div>
  )
}
