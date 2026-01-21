import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Procedimento = Database['public']['Tables']['procedimentos']['Row']
type ProcedimentoInsert = Database['public']['Tables']['procedimentos']['Insert']
type ProcedimentoUpdate = Database['public']['Tables']['procedimentos']['Update']

const supabase = createClient()

export function useProcedimentos() {
  return useQuery({
    queryKey: ['procedimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('procedimentos')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      return data as Procedimento[]
    },
  })
}

export function useProcedimento(id: string) {
  return useQuery({
    queryKey: ['procedimento', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('procedimentos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Procedimento
    },
    enabled: !!id,
  })
}

export function useCreateProcedimento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (procedimento: ProcedimentoInsert) => {
      const { data, error } = await (supabase
        .from('procedimentos') as any)
        .insert(procedimento)
        .select()
        .single()

      if (error) throw error
      return data as Procedimento
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos'] })
    },
  })
}

export function useUpdateProcedimento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProcedimentoUpdate & { id: string }) => {
      const { data, error } = await (supabase
        .from('procedimentos') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Procedimento
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos'] })
      queryClient.invalidateQueries({ queryKey: ['procedimento', variables.id] })
    },
  })
}

export function useInativarProcedimento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await (supabase
        .from('procedimentos') as any)
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Procedimento
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos'] })
    },
  })
}
