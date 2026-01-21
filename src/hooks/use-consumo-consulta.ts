import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

const supabase = createClient()

type MaterialSelecionado = {
  product_id: string
  batch_id: string | null
  quantity: number
  incluir: boolean
}

type RegistrarConsumoParams = {
  clinica_id: string
  appointment_id: string
  paciente_id: string
  consumed_by: string
  materiais: MaterialSelecionado[]
}

type ConsumoMaterial = Database['public']['Tables']['consumo_materiais']['Insert']
type ConsultaUpdate = Database['public']['Tables']['consultas']['Update']

// Helper type para insert de consumo_materiais
type ConsumoInsert = Omit<ConsumoMaterial, 'id' | 'criado_em'>

export function useConsumoConsulta() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    appointmentId: string
    newStatus: string
    procedureId: string
    procedureName: string
    patientName: string
  } | null>(null)

  // Mutation para registrar consumo
  const registrarConsumo = useMutation({
    mutationFn: async (params: RegistrarConsumoParams) => {
      const consumosParaInserir = params.materiais
        .filter(m => m.incluir)
        .map(mat => ({
          clinica_id: params.clinica_id,
          consulta_id: params.appointment_id,
          paciente_id: params.paciente_id,
          produto_id: mat.product_id,
          lote_id: mat.batch_id,
          quantidade: mat.quantity,
          consumido_por_id: params.consumed_by,
        }))

      if (consumosParaInserir.length === 0) {
        return { success: true, count: 0 }
      }

      const { data, error } = await (supabase
        .from('consumo_materiais') as any)
        .insert(consumosParaInserir)
        .select()

      if (error) throw error
      return { success: true, count: consumosParaInserir.length, data }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      queryClient.invalidateQueries({ queryKey: ['lotes'] })
      if (result.count > 0) {
        toast.success(`${result.count} material(is) registrado(s) no consumo!`)
      }
    },
    onError: (error) => {
      toast.error('Erro ao registrar consumo de materiais')
      // Log error para debugging em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao registrar consumo:', error)
      }
    },
  })

  // Mutation para atualizar status do agendamento
  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await (supabase
        .from('consultas') as any)
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] })
      queryClient.invalidateQueries({ queryKey: ['consulta'] })
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status')
      // Log error para debugging em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao atualizar status:', error)
      }
    },
  })

  // Função principal: iniciar mudança de status
  const iniciarMudancaStatus = (params: {
    appointmentId: string
    newStatus: string
    procedureId: string
    procedureName: string
    patientName: string
  }) => {
    // Se o novo status é "em_andamento", abrir modal de materiais
    if (params.newStatus === 'em_andamento') {
      setPendingStatusChange(params)
      setIsModalOpen(true)
    } else {
      // Para outros status, atualizar direto
      atualizarStatus.mutate({ id: params.appointmentId, status: params.newStatus })
    }
  }

  // Função: confirmar consumo e atualizar status
  const confirmarConsumoEStatus = async (
    materiais: MaterialSelecionado[],
    clinicId: string,
    patientId: string,
    consumedBy: string
  ) => {
    if (!pendingStatusChange) return

    try {
      // 1. Registrar consumo de materiais
      await registrarConsumo.mutateAsync({
        clinica_id: clinicId,
        appointment_id: pendingStatusChange.appointmentId,
        paciente_id: patientId,
        consumed_by: consumedBy,
        materiais,
      })

      // 2. Atualizar status do agendamento
      await atualizarStatus.mutateAsync({
        id: pendingStatusChange.appointmentId,
        status: pendingStatusChange.newStatus,
      })

      toast.success('Procedimento iniciado com sucesso!')
      setIsModalOpen(false)
      setPendingStatusChange(null)
    } catch (error) {
      // Log error para debugging em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao confirmar consumo:', error)
      }
    }
  }

  // Função: pular consumo e só atualizar status
  const pularConsumo = async () => {
    if (!pendingStatusChange) return

    await atualizarStatus.mutateAsync({
      id: pendingStatusChange.appointmentId,
      status: pendingStatusChange.newStatus,
    })

    toast.success('Procedimento iniciado!')
    setIsModalOpen(false)
    setPendingStatusChange(null)
  }

  // Função: cancelar
  const cancelar = () => {
    setIsModalOpen(false)
    setPendingStatusChange(null)
  }

  return {
    isModalOpen,
    setIsModalOpen,
    pendingStatusChange,
    iniciarMudancaStatus,
    confirmarConsumoEStatus,
    pularConsumo,
    cancelar,
    isLoading: registrarConsumo.isPending || atualizarStatus.isPending,
  }
}
