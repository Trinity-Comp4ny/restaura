'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PacienteForm } from '@/components/forms/paciente-form'
import { usePaciente } from '@/hooks/use-pacientes'
import type { Database } from '@/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']

export default function EditarPacientePage() {
  const params = useParams()
  const router = useRouter()
  const pacienteId = params.pacienteId as string

  const { data: paciente, isLoading } = usePaciente(pacienteId)

  function onSuccess() {
    router.push(`/pacientes/${pacienteId}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Paciente</h1>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Paciente não encontrado</h1>
            <p className="text-muted-foreground">Paciente não encontrado ou foi removido.</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Não foi possível encontrar o paciente solicitado.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Paciente</h1>
          <p className="text-muted-foreground">Atualize as informações do paciente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Paciente</CardTitle>
          <CardDescription>
            Edite os dados cadastrais e informações clínicas do paciente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PacienteForm paciente={paciente} onSuccess={onSuccess} />
        </CardContent>
      </Card>
    </div>
  )
}
