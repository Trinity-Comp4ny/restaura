'use client'

import React, { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Calendar, User, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateConsulta } from '@/hooks/use-consultas'
import { useUser } from '@/hooks/use-user'
import { getActiveProcedures } from '@/constants/procedures'
import { useMockSelects } from '@/lib/api-mock-client'
import Link from 'next/link'

const agendamentoSchema = z.object({
  paciente_id: z.string().min(1, 'Paciente é obrigatório'),
  dentista_id: z.string().min(1, 'Dentista é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  procedimento_id: z.string().min(1, 'Procedimento é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário inicial é obrigatório'),
  horario_fim: z.string().min(1, 'Horário final é obrigatório'),
  status: z.string().min(1, 'Status é obrigatório'),
  observacoes: z.string().optional(),
})

type AgendamentoFormData = z.infer<typeof agendamentoSchema>

const statusOptions = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'esperando', label: 'Esperando' },
  { value: 'chamado', label: 'Chamado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado_paciente', label: 'Cancelado pelo Paciente' },
  { value: 'cancelado_clinica', label: 'Cancelado pela Clínica' },
  { value: 'nao_compareceu', label: 'Não Compareceu' },
  { value: 'remarcado', label: 'Remarcado' },
]

const pacientesMock = [
  { id: '1', nome: 'Maria Silva', telefone: '(11) 99999-9999' },
  { id: '2', nome: 'Carlos Santos', telefone: '(11) 88888-8888' },
  { id: '3', nome: 'Ana Oliveira', telefone: '(11) 77777-7777' },
  { id: '4', nome: 'Pedro Costa', telefone: '(11) 66666-6666' },
]

const dentistasMock = [
  { id: '1', nome: 'Dr. João Silva', cro: '12345-SP' },
  { id: '2', nome: 'Dra. Paula Santos', cro: '54321-SP' },
  { id: '3', nome: 'Dr. Pedro Oliveira', cro: '98765-SP' },
]

// Nível 1 - Tipos de Consulta (ordem alfabética)
const tiposConsulta = [
  { id: 'avaliacao', label: 'Avaliação' },
  { id: 'emergencia', label: 'Emergência' },
  { id: 'manutencao', label: 'Manutenção' },
  { id: 'nova_consulta', label: 'Nova Consulta' },
  { id: 'retorno', label: 'Retorno' },
]

function NovoAgendamentoPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: procedimentosData } = useMockSelects('procedimentos') as { data?: any[] }
  const procedimentosMock = getActiveProcedures(procedimentosData || [])
  const pacienteIdParam = searchParams.get('paciente_id')
  const { data: user } = useUser()
  const createConsulta = useCreateConsulta()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      type: 'nova_consulta',
      status: 'agendado',
      paciente_id: pacienteIdParam || '',
      horario_fim: '',
    },
  })

  const selectedProcedure = watch('procedimento_id')
  const selectedPatient = watch('paciente_id')
  const selectedTime = watch('time')

  // Calcular horário final baseado no procedimento
  const calculateEndTime = () => {
    if (!selectedTime) return ''
    
    let duration = 60 // 1 hora default
    if (selectedProcedure) {
      const procedure = procedimentosMock.find(p => p.id === selectedProcedure)
      if (procedure) {
        duration = procedure.duracao_minutos
      }
    }
    
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  const endTime = calculateEndTime()

  // Atualizar horario_fim automaticamente quando procedimento ou horário mudar
  useEffect(() => {
    if (endTime) {
      setValue('horario_fim', endTime)
    }
  }, [endTime, setValue])

  async function onSubmit(data: AgendamentoFormData) {
    if (!user?.clinica_id) return

    // Combinar data e horários para criar horario_inicio e horario_fim
    const startDateTime = new Date(`${data.date}T${data.time}`)
    const endDateTime = new Date(`${data.date}T${data.horario_fim}`)

    const agendamentoData = {
      ...data,
      horario_inicio: startDateTime.toISOString(),
      horario_fim: endDateTime.toISOString(),
      clinica_id: user.clinica_id,
      criado_por_id: user.id,
      status: data.status as 'agendado' | 'confirmado' | 'esperando' | 'chamado' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado_paciente' | 'cancelado_clinica' | 'nao_compareceu' | 'remarcado',
      procedimento_id: data.procedimento_id || null,
      observacoes: data.observacoes || null,
    }

    await createConsulta.mutateAsync(agendamentoData)
    router.push('/agenda')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/agenda">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Consulta</h1>
            <p className="text-muted-foreground">
              Agende uma nova consulta para o paciente
            </p>
          </div>
        </div>
        <Link 
          href="/procedimentos" 
          className="text-sm text-primary hover:underline"
        >
          Gerenciar procedimentos
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações da Consulta
            </CardTitle>
            <CardDescription>
              Preencha os dados básicos da consulta.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* Primeira linha: Paciente e dentista (2 colunas) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paciente_id">Paciente *</Label>
                <select
                  id="paciente_id"
                  {...register('paciente_id')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {pacientesMock.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome} - {paciente.telefone}
                    </option>
                  ))}
                </select>
                {errors.paciente_id && (
                  <p className="text-sm text-destructive">{errors.paciente_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dentista_id">Dentista *</Label>
                <select
                  id="dentista_id"
                  {...register('dentista_id')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {dentistasMock.map((dentista) => (
                    <option key={dentista.id} value={dentista.id}>
                      {dentista.nome} - {dentista.cro}
                    </option>
                  ))}
                </select>
                {errors.dentista_id && (
                  <p className="text-sm text-destructive">{errors.dentista_id.message}</p>
                )}
              </div>
            </div>

            {/* Segunda linha: Tipo, Procedimento e Status (3 colunas) */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Consulta *</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {tiposConsulta.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="procedimento_id">Procedimento *</Label>
                <select
                  id="procedimento_id"
                  {...register('procedimento_id')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {procedimentosMock.map((procedimento) => (
                    <option key={procedimento.id} value={procedimento.id}>
                      {procedimento.nome} - {procedimento.duracao_minutos}min
                    </option>
                  ))}
                </select>
                {errors.procedimento_id && (
                  <p className="text-sm text-destructive">{errors.procedimento_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Terceira linha: Data, Horário inicial e horário final (3 colunas) */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário Inicial *</Label>
                <Input
                  id="time"
                  type="time"
                  {...register('time')}
                />
                {errors.time && (
                  <p className="text-sm text-destructive">{errors.time.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario_fim">Horário Final *</Label>
                <Input
                  id="horario_fim"
                  type="time"
                  value={endTime}
                  {...register('horario_fim')}
                />
                {errors.horario_fim && (
                  <p className="text-sm text-destructive">{errors.horario_fim.message}</p>
                )}
              </div>
            </div>

            {/* Quarta linha: Observações (1 coluna) */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                {...register('observacoes')}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Observações sobre o agendamento..."
              />
            </div>
          </CardContent>
        </Card>

        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Paciente
              </CardTitle>
              <CardDescription>
                Dados do paciente selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium">Paciente</h4>
                  <p className="text-sm text-muted-foreground">
                    {pacientesMock.find(p => p.id === selectedPatient)?.nome}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Telefone</h4>
                  <p className="text-sm text-muted-foreground">
                    {pacientesMock.find(p => p.id === selectedPatient)?.telefone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedProcedure && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Detalhes do Procedimento
              </CardTitle>
              <CardDescription>
                Informações do procedimento selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Procedimento</h4>
                  <p className="text-sm text-muted-foreground">
                    {procedimentosMock.find(p => p.id === selectedProcedure)?.nome}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Duração</h4>
                  <p className="text-sm text-muted-foreground">
                    {procedimentosMock.find(p => p.id === selectedProcedure)?.duracao_minutos} minutos
                  </p>
                </div>
              </div>
              {selectedTime && endTime && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-medium">Horário Início</h4>
                    <p className="text-sm text-muted-foreground">{selectedTime}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Horário Fim</h4>
                    <p className="text-sm text-muted-foreground">{endTime}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Agendando...' : 'Criar Consulta'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function NovoAgendamentoPage() {
  return (
    <Suspense fallback={null}>
      <NovoAgendamentoPageInner />
    </Suspense>
  )
}
