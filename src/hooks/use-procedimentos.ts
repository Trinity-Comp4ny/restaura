/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Procedimento = Database['public']['Tables']['procedimentos']['Row']
type ProcedimentoInsert = Database['public']['Tables']['procedimentos']['Insert']
type ProcedimentoUpdate = Database['public']['Tables']['procedimentos']['Update']

const supabase = createClient()

export function useProcedimentos(clinicaId?: string) {
  return useQuery({
    queryKey: ['procedimentos', clinicaId],
    queryFn: async () => {
      let query = supabase
        .from('procedimentos')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (clinicaId) {
        query = query.eq('clinica_id', clinicaId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Procedimento[]
    },
    enabled: !!clinicaId,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('procedimentos')
        .insert([procedimento])
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('procedimentos')
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('procedimentos')
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
