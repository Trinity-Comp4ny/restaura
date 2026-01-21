'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, AlertTriangle, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

const cancelarConsultaSchema = z.object({
  motivo_cancelamento: z.string().min(1, 'Motivo do cancelamento é obrigatório'),
  tipo_cancelamento: z.enum(['cancelado_paciente', 'cancelado_clinica']),
  observacoes: z.string().optional(),
})

type CancelarConsultaFormData = z.infer<typeof cancelarConsultaSchema>

interface CancelarConsultaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consulta: any
}

export function CancelarConsultaDialog({
  open,
  onOpenChange,
  consulta,
}: CancelarConsultaDialogProps) {
  const updateConsulta = useUpdateConsulta()
  const [selectedReason, setSelectedReason] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CancelarConsultaFormData>({
    resolver: zodResolver(cancelarConsultaSchema),
  })

  const motivosPaciente = [
    { value: 'paciente_desistiu', label: 'Paciente desistiu' },
    { value: 'paciente_nao_compareceu', label: 'Paciente não compareceu' },
    { value: 'paciente_solicitou', label: 'Paciente solicitou cancelamento' },
    { value: 'paciente_doente', label: 'Paciente doente' },
    { value: 'paciente_viagem', label: 'Paciente viajando' },
    { value: 'outro_paciente', label: 'Outro motivo (paciente)' },
  ]

  const motivosClinica = [
    { value: 'profissional_indisponivel', label: 'Profissional indisponível' },
    { value: 'emergencia', label: 'Emergência na clínica' },
    { value: 'manutencao_equipamento', label: 'Manutenção de equipamento' },
    { value: 'falta_material', label: 'Falta de material' },
    { value: 'conflito_agenda', label: 'Conflito de agenda' },
    { value: 'outro_clinica', label: 'Outro motivo (clínica)' },
  ]

  // Resetar formulário quando o diálogo fechar
  React.useEffect(() => {
    if (!open) {
      reset()
      setSelectedReason('')
    }
  }, [open, reset])

  async function onSubmit(data: CancelarConsultaFormData) {
    if (!consulta?.id) return

    // Adicionar informações de cancelamento às observações
    const notasExistentes = consulta.observacoes || ''
    const notaCancelamento = `\n\n--- CANCELADO EM ${new Date().toLocaleDateString('pt-BR')} ---\nTipo: ${data.tipo_cancelamento === 'cancelado_paciente' ? 'Cancelado pelo Paciente' : 'Cancelado pela Clínica'}\nMotivo: ${data.motivo_cancelamento}${data.observacoes ? `\nObservações: ${data.observacoes}` : ''}`
    const novasNotas = notasExistentes + notaCancelamento

    const agendamentoData = {
      status: data.tipo_cancelamento as 'cancelado_paciente' | 'cancelado_clinica',
      observacoes: novasNotas,
    }

    try {
      await updateConsulta.mutateAsync({
        id: consulta.id,
        ...agendamentoData,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancelar Consulta
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Atenção:</p>
                <p>O cancelamento será registrado no histórico do paciente e a consulta não poderá ser recuperada.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quem está cancelando? *</Label>
            <Select
              value={watch('tipo_cancelamento')}
              onValueChange={(value: string) => {
                setValue('tipo_cancelamento', value as 'cancelado_paciente' | 'cancelado_clinica')
                setSelectedReason('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cancelado_paciente">Cancelado pelo Paciente</SelectItem>
                <SelectItem value="cancelado_clinica">Cancelado pela Clínica</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_cancelamento && (
              <p className="text-sm text-destructive">{errors.tipo_cancelamento.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo_cancelamento">Motivo do Cancelamento *</Label>
            <Select
              value={selectedReason}
              onValueChange={(value: string) => {
                setSelectedReason(value)
                setValue('motivo_cancelamento', value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo..." />
              </SelectTrigger>
              <SelectContent>
                {(watch('tipo_cancelamento') === 'cancelado_paciente' ? motivosPaciente : motivosClinica).map((motivo) => (
                  <SelectItem key={motivo.value} value={motivo.value}>
                    {motivo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.motivo_cancelamento && (
              <p className="text-sm text-destructive">{errors.motivo_cancelamento.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Adicionais</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              rows={3}
              placeholder="Adicione informações adicionais sobre o cancelamento..."
            />
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="sm:order-1"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting}
              className="sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirmar Cancelamento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
