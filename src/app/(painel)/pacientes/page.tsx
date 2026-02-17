'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react'
import { useMemo } from 'react'

import { useDocumentTitle } from '@/hooks/use-document-title'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials, formatPhone, formatDate } from '@/lib/utils'
import { usePacientes, useDeletePaciente } from '@/hooks/use-pacientes'
import { useUltimasVisitas } from '@/hooks/use-ultimas-visitas'
import { Skeleton } from '@/components/ui/skeleton'
import type { Database } from '@/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']

export default function PatientsPage() {
  useDocumentTitle('Pacientes')
  const router = useRouter()
  const { data: patients, isLoading } = usePacientes()
  const deletePaciente = useDeletePaciente()
  const displayPatients = patients || []
  
  // Buscar últimas visitas de todos os pacientes (memoizado)
  const pacienteIds = useMemo(() => displayPatients.map((p: any) => p.id), [displayPatients])
  const { data: ultimasVisitas } = useUltimasVisitas(pacienteIds) as { data: Record<string, any> }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const hasPatients = displayPatients.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            {displayPatients?.length || 0} pacientes cadastrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Buscar paciente..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Link href="/pacientes/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 border-b bg-muted/50 px-6 py-3 text-sm font-medium text-muted-foreground">
          <div>Paciente</div>
          <div>Contato</div>
          <div>Convênio</div>
          <div>Última Visita</div>
          <div className="w-10"></div>
        </div>
        {hasPatients ? (
          <div className="divide-y">
          {displayPatients?.map((patient: any) => {
            const ultimaVisita = ultimasVisitas?.[patient.id]
            return (
              <div
                key={patient.id}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => router.push(`/pacientes/${patient.id}`)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" alt={patient.nome} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(patient.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{patient.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {patient.profissao || '-'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm">{patient.email || '-'}</div>
                  <div className="text-sm text-muted-foreground">
                    {patient.telefone ? formatPhone(patient.telefone) : '-'}
                  </div>
                </div>
                <div className="text-sm">
                  {patient.convenio || '-'}
                </div>
                <div className="text-sm">
                  {ultimaVisita ? (
                    <div>
                      <div className="font-medium">
                        {formatDate(ultimaVisita.horario_inicio)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ultimaVisita.procedure_nome} com {ultimaVisita.dentist_nome}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sem visitas</span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/pacientes/${patient.id}`)
                    }}>
                      Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/pacientes/${patient.id}/edit`)
                    }}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/agenda/novo?paciente_id=${patient.id}`)
                    }}>
                      Agendar Consulta
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Tem certeza que deseja excluir este paciente?')) {
                          deletePaciente.mutate(patient.id)
                        }
                      }}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <p className="text-lg font-semibold">Nenhum paciente cadastrado ainda</p>
            <p className="text-sm text-muted-foreground">
              Comece cadastrando pacientes ou importando sua base para visualizar informações por aqui.
            </p>
            <Link href="/pacientes/novo">
              <Button className="mt-2">Cadastrar primeiro paciente</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
