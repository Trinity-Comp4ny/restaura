/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']
type PacienteInsert = Database['public']['Tables']['pacientes']['Insert']
type PacienteUpdate = Database['public']['Tables']['pacientes']['Update']

const supabase = createClient()

export function usePacientes(clinicaId?: string) {
  return useQuery({
    queryKey: ['pacientes', clinicaId],
    queryFn: async () => {
      let query = supabase
        .from('pacientes')
        .select('*')
        .order('nome', { ascending: true })

      if (clinicaId) {
        query = query.eq('clinica_id', clinicaId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Paciente[]
    },
    enabled: !!clinicaId,
  })
}

export function usePaciente(id: string) {
  return useQuery({
    queryKey: ['paciente', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Paciente
    },
    enabled: !!id,
  })
}

export function useCreatePaciente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paciente: PacienteInsert) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('pacientes')
        .insert([paciente])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
      toast.success('Paciente cadastrado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao cadastrar paciente')
    },
  })
}

export function useUpdatePaciente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...paciente }: { id: string } & Partial<PacienteInsert>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('pacientes')
        .update(paciente as PacienteUpdate)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
      queryClient.invalidateQueries({ queryKey: ['paciente', variables.id] })
      toast.success('Paciente atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar paciente')
    },
  })
}

export function useDeletePaciente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
      toast.success('Paciente removido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao remover paciente')
    },
  })
}
