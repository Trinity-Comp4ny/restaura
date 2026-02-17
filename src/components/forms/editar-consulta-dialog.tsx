'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Calendar, Clock, User, Package, X, Edit } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateConsulta } from '@/hooks/use-consultas'
import { toast } from 'sonner'
import { differenceInMinutes } from 'date-fns'
import { getLocalISODate } from '@/lib/utils'

const editarConsultaSchema = z.object({
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

type EditarConsultaFormData = z.infer<typeof editarConsultaSchema>

interface EditarConsultaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consulta: any
  pacientes: any[]
  dentistas: any[]
  procedimentos: any[]
}

export function EditarConsultaDialog({
  open,
  onOpenChange,
  consulta,
  pacientes,
  dentistas,
  procedimentos,
}: EditarConsultaDialogProps) {
  const updateConsulta = useUpdateConsulta()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditarConsultaFormData>({
    resolver: zodResolver(editarConsultaSchema),
  })

  const selectedProcedure = watch('procedimento_id')
  const selectedTime = watch('time')

  // Calcular horário final baseado no procedimento
  const calculateEndTime = () => {
    if (!selectedTime) return ''
    
    let duration = 60 // 1 hora default
    if (selectedProcedure) {
      const procedure = procedimentos.find(p => p.id === selectedProcedure)
      if (procedure) {
        duration = procedure.duration || 60
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
    if (endTime && open) {
      setValue('horario_fim', endTime)
    }
  }, [endTime, setValue, open])

  // Resetar formulário quando a consulta mudar
  useEffect(() => {
    if (consulta && open && consulta.horario_inicio && consulta.horario_fim) {
      try {
        const date = new Date(consulta.horario_inicio)
        const startTime = date.toTimeString().slice(0, 5)
        const endTime = new Date(consulta.horario_fim).toTimeString().slice(0, 5)
        
        reset({
          paciente_id: consulta.paciente_id || '',
          dentista_id: consulta.dentista_id || '',
          type: consulta.type || 'nova_consulta',
          procedimento_id: consulta.procedimento_id || '',
          date: getLocalISODate(date),
          time: startTime,
          horario_fim: endTime,
          status: consulta.status || 'agendado',
          observacoes: consulta.observacoes || '',
        })
      } catch (error) {
        console.error('Erro ao processar datas da consulta:', error)
      }
    }
  }, [consulta, open, reset])

  async function onSubmit(data: EditarConsultaFormData) {
    if (!consulta?.id) return

    // Combinar data e horários para criar horario_inicio e horario_fim
    const startDateTime = new Date(`${data.date}T${data.time}`)
    const endDateTime = new Date(`${data.date}T${data.horario_fim}`)

    const agendamentoData = {
      ...data,
      horario_inicio: startDateTime.toISOString(),
      horario_fim: endDateTime.toISOString(),
      procedimento_id: data.procedimento_id || null,
      observacoes: data.observacoes || null,
      type: data.type,
      status: data.status as 'agendado' | 'confirmado' | 'esperando' | 'chamado' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado_paciente' | 'cancelado_clinica' | 'nao_compareceu' | 'remarcado',
    }

    try {
      await updateConsulta.mutateAsync({
        id: consulta.id,
        ...agendamentoData,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Consulta
          </DialogTitle>
          <DialogDescription>
            Altere as informações da consulta conforme necessário.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paciente_id">Paciente *</Label>
              <Select
                value={watch('paciente_id')}
                onValueChange={(value: string) => setValue('paciente_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paciente_id && (
                <p className="text-sm text-destructive">{errors.paciente_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dentista_id">Dentista *</Label>
              <Select
                value={watch('dentista_id')}
                onValueChange={(value: string) => setValue('dentista_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {dentistas.map((dentista) => (
                    <SelectItem key={dentista.id} value={dentista.id}>
                      {dentista.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dentista_id && (
                <p className="text-sm text-destructive">{errors.dentista_id.message}</p>
              )}
            </div>
          </div>

          {/* Segunda linha: Tipo, Procedimento e Status (3 colunas) */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Consulta *</Label>
              <Select
                value={watch('type')}
                onValueChange={(value: string) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avaliacao">Avaliação</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="nova_consulta">Nova Consulta</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedimento_id">Procedimento *</Label>
              <Select
                value={watch('procedimento_id')}
                onValueChange={(value: string) => setValue('procedimento_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {procedimentos.map((procedimento) => (
                    <SelectItem key={procedimento.id} value={procedimento.id}>
                      {procedimento.nome} - {procedimento.duration || 60}min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.procedimento_id && (
                <p className="text-sm text-destructive">{errors.procedimento_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value: string) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="esperando">Esperando</SelectItem>
                  <SelectItem value="chamado">Chamado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado_paciente">Cancelado pelo Paciente</SelectItem>
                  <SelectItem value="cancelado_clinica">Cancelado pela Clínica</SelectItem>
                  <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
                  <SelectItem value="remarcado">Remarcado</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              rows={3}
              placeholder="Observações sobre o agendamento..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
