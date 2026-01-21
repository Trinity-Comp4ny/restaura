import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Simplified types to avoid complex type inference issues
type TransacaoInsert = {
  clinica_id: string
  paciente_id?: string | null
  appointment_id?: string | null
  type: 'receita' | 'despesa'
  category: string
  description: string
  amount: number
  payment_method?: string | null
  status?: 'pendente' | 'pago' | 'cancelado' | 'estornado'
  due_date?: string | null
  paid_at?: string | null
  criado_por_id?: string | null
}

type TransacaoUpdate = Partial<TransacaoInsert> & { id: string }

const supabase = createClient()

export function useTransacoes(type?: 'receita' | 'despesa') {
  return useQuery({
    queryKey: ['transacoes', type],
    queryFn: async () => {
      let query = supabase
        .from('transacoes')
        .select(`
          *,
          pacientes (id, nome),
          consultas (id, horario_inicio)
        `)
        .order('criado_em', { ascending: false })

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
  })
}

export function useTransacao(id: string) {
  return useQuery({
    queryKey: ['transacao', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transacoes')
        .select(`
          *,
          pacientes (id, nome),
          consultas (id, horario_inicio)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTransacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transacao: TransacaoInsert) => {
      const { data, error } = await supabase
        .from('transacoes')
        .insert(transacao as unknown as never)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] })
      toast.success('Transação registrada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao registrar transação')
      console.error(error)
    },
  })
}

export function useUpdateTransacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...transacao }: TransacaoUpdate) => {
      const { data, error } = await supabase
        .from('transacoes')
        .update(transacao as unknown as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] })
      queryClient.invalidateQueries({ queryKey: ['transacao', variables.id] })
      toast.success('Transação atualizada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar transação')
      console.error(error)
    },
  })
}

export function useDeleteTransacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] })
      toast.success('Transação removida com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao remover transação')
      console.error(error)
    },
  })
}
