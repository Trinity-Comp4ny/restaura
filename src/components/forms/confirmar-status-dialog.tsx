'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, AlertTriangle } from 'lucide-react'

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
import { Textarea } from '@/components/ui/textarea'
import { useUpdateConsulta } from '@/hooks/use-consultas'
import { toast } from 'sonner'
import { APPOINTMENT_STATUS_CONFIG } from '@/constants/appointment-status'

const confirmarStatusSchema = z.object({
  observacoes: z.string().optional(),
})

type ConfirmarStatusFormData = z.infer<typeof confirmarStatusSchema>

interface ConfirmarStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consulta: any
  novoStatus: string
}

export function ConfirmarStatusDialog({
  open,
  onOpenChange,
  consulta,
  novoStatus,
}: ConfirmarStatusDialogProps) {
  const updateConsulta = useUpdateConsulta()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmarStatusFormData>({
    resolver: zodResolver(confirmarStatusSchema),
  })

  // Resetar formulário quando o diálogo fechar
  React.useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  async function onSubmit(data: ConfirmarStatusFormData) {
    if (!consulta?.id) return

    // Adicionar informações de mudança de status às observações
    const notasExistentes = consulta.observacoes || ''
    const statusConfig = APPOINTMENT_STATUS_CONFIG[novoStatus as keyof typeof APPOINTMENT_STATUS_CONFIG]
    const notaStatus = `\n\n--- STATUS ALTERADO EM ${new Date().toLocaleDateString('pt-BR')} ---\nNovo Status: ${statusConfig?.label}${data.observacoes ? `\nObservações: ${data.observacoes}` : ''}`
    const novasNotas = notasExistentes + notaStatus

    const agendamentoData = {
      status: novoStatus as 'agendado' | 'confirmado' | 'esperando' | 'chamado' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado_paciente' | 'cancelado_clinica' | 'nao_compareceu' | 'remarcado',
      observacoes: novasNotas,
    }

    try {
      await updateConsulta.mutateAsync({
        id: consulta.id,
        ...agendamentoData,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const statusConfig = APPOINTMENT_STATUS_CONFIG[novoStatus as keyof typeof APPOINTMENT_STATUS_CONFIG]
  const isCancelamento = novoStatus.includes('cancelado') || novoStatus === 'nao_compareceu'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isCancelamento ? 'text-red-600' : ''}`}>
            {isCancelamento ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            Confirmar Alteração de Status
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja alterar o status para "{statusConfig?.label}"?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isCancelamento && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Atenção:</p>
                  <p>Esta alteração será registrada no histórico do paciente.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              rows={3}
              placeholder="Adicione informações sobre esta alteração de status..."
            />
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={isCancelamento ? 'destructive' : 'default'}
              disabled={isSubmitting}
              className="sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                'Confirmar Alteração'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
