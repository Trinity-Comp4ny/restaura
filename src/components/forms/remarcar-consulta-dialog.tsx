'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Calendar, Clock, X, RefreshCw } from 'lucide-react'

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

const remarcarConsultaSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário inicial é obrigatório'),
  horario_fim: z.string().min(1, 'Horário final é obrigatório'),
  motivo: z.string().min(1, 'Motivo da remarcação é obrigatório'),
})

type RemarcarConsultaFormData = z.infer<typeof remarcarConsultaSchema>

interface RemarcarConsultaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consulta: any
  procedimentos: any[]
}

export function RemarcarConsultaDialog({
  open,
  onOpenChange,
  consulta,
  procedimentos,
}: RemarcarConsultaDialogProps) {
  const updateConsulta = useUpdateConsulta()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RemarcarConsultaFormData>({
    resolver: zodResolver(remarcarConsultaSchema),
  })

  const selectedTime = watch('time')

  // Calcular horário final baseado no procedimento original
  const calculateEndTime = () => {
    if (!selectedTime) return ''
    
    let duration = 60 // 1 hora default
    if (consulta?.procedimento_id) {
      const procedure = procedimentos.find(p => p.id === consulta.procedimento_id)
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

  // Atualizar horario_fim automaticamente quando horário mudar
  useEffect(() => {
    if (endTime && open) {
      setValue('horario_fim', endTime)
    }
  }, [endTime, setValue, open])

  // Resetar formulário quando a consulta mudar
  useEffect(() => {
    if (consulta && open) {
      reset({
        date: '',
        time: '',
        horario_fim: '',
        motivo: '',
      })
    }
  }, [consulta, open, reset])

  async function onSubmit(data: RemarcarConsultaFormData) {
    if (!consulta?.id) return

    // Combinar data e horários para criar horario_inicio e horario_fim
    const startDateTime = new Date(`${data.date}T${data.time}`)
    const endDateTime = new Date(`${data.date}T${data.horario_fim}`)

    // Adicionar o motivo às observações existentes
    const notasExistentes = consulta.observacoes || ''
    const notaRemarcacao = `\n\n--- REMARCADO EM ${new Date().toLocaleDateString('pt-BR')} ---\nMotivo: ${data.motivo}`
    const novasNotas = notasExistentes + notaRemarcacao

    const agendamentoData = {
      horario_inicio: startDateTime.toISOString(),
      horario_fim: endDateTime.toISOString(),
      status: 'remarcado' as const,
      observacoes: novasNotas,
    }

    try {
      await updateConsulta.mutateAsync({
        id: consulta.id,
        ...agendamentoData,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao remarcar consulta:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Remarcar Consulta
          </DialogTitle>
          <DialogDescription>
            Selecione a nova data e horário para a consulta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Nova Data *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Novo Horário *</Label>
              <Input
                id="time"
                type="time"
                {...register('time')}
              />
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario_fim">Horário Final *</Label>
            <Input
              id="horario_fim"
              type="time"
              value={endTime}
              {...register('horario_fim')}
              readOnly
            />
            {errors.horario_fim && (
              <p className="text-sm text-destructive">{errors.horario_fim.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da Remarcação *</Label>
            <Textarea
              id="motivo"
              {...register('motivo')}
              rows={3}
              placeholder="Informe o motivo da remarcação..."
            />
            {errors.motivo && (
              <p className="text-sm text-destructive">{errors.motivo.message}</p>
            )}
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
              {isSubmitting ? 'Remarcando...' : 'Remarcar Consulta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
