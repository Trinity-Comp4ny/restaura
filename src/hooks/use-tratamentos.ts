import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export function useTratamentos(pacienteId?: string) {
  return useQuery({
    queryKey: ['tratamentos', pacienteId],
    queryFn: async () => {
      let query = supabase
        .from('tratamentos')
        .select(`
          *,
          pacientes (id, nome),
          tratamento_procedimentos (
            id,
            nome,
            status,
            value,
            scheduled_date,
            completion_date,
            professional_id,
            usuarios (id, nome)
          )
        `)
        .order('created_date', { ascending: false })

      if (pacienteId) {
        query = query.eq('paciente_id', pacienteId)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Erro ao buscar tratamentos:', error)
        return []
      }

      return data
    },
    enabled: true,
  })
}

export function useTratamento(id: string) {
  return useQuery({
    queryKey: ['tratamento', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tratamentos')
        .select(`
          *,
          pacientes (id, nome),
          tratamento_procedimentos (
            id,
            nome,
            status,
            value,
            scheduled_date,
            completion_date,
            professional_id,
            observacoes,
            usuarios (id, nome)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTratamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tratamento: any) => {
      const { data, error } = await supabase
        .from('tratamentos')
        .insert(tratamento as unknown as never)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tratamentos'] })
      toast.success('Tratamento criado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar tratamento:', error)
      toast.error('Erro ao criar tratamento')
    },
  })
}

export function useUpdateTratamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...tratamento }: any) => {
      const { data, error } = await supabase
        .from('tratamentos')
        .update(tratamento as unknown as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tratamentos'] })
      queryClient.invalidateQueries({ queryKey: ['tratamento', variables.id] })
      toast.success('Tratamento atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar tratamento:', error)
      toast.error('Erro ao atualizar tratamento')
    },
  })
}

export function useDeleteTratamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tratamentos')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tratamentos'] })
      toast.success('Tratamento removido com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao remover tratamento:', error)
      toast.error('Erro ao remover tratamento')
    },
  })
}

// Hooks para procedimentos do tratamento
export function useCreateTratamentoProcedimento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (procedimento: any) => {
      const { data, error } = await supabase
        .from('tratamento_procedimentos')
        .insert(procedimento as unknown as never)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tratamentos'] })
      toast.success('Procedimento adicionado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao adicionar procedimento:', error)
      toast.error('Erro ao adicionar procedimento')
    },
  })
}

export function useUpdateTratamentoProcedimento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...procedimento }: any) => {
      const { data, error } = await supabase
        .from('tratamento_procedimentos')
        .update(procedimento as unknown as never)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tratamentos'] })
      toast.success('Procedimento atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar procedimento:', error)
      toast.error('Erro ao atualizar procedimento')
    },
  })
}

export function useDeleteTratamentoProcedimento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tratamento_procedimentos')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tratamentos'] })
      toast.success('Procedimento removido com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao remover procedimento:', error)
      toast.error('Erro ao remover procedimento')
    },
  })
}
