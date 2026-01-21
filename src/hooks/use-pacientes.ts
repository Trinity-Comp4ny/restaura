import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']
type PacienteInsert = Database['public']['Tables']['pacientes']['Insert']
type PacienteUpdate = Partial<PacienteInsert>

const supabase = createClient()

// Removido PacienteUpdate não utilizado

export function usePacientes() {
  return useQuery({
    queryKey: ['pacientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      return data as Paciente[]
    },
  })
}

export function usePaciente(id: string) {
  return useQuery({
    queryKey: ['paciente', id],
    queryFn: async () => {
      // Primeiro tenta buscar no banco de dados
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) {
        throw new Error('Paciente não encontrado')
      }
      return data as Paciente
    },
    enabled: !!id,
  })
}

export function useCreatePaciente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paciente: any) => {
      const { data, error } = await supabase
        .from('pacientes')
        .insert(paciente)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
      toast.success('Paciente cadastrado com sucesso!')
    },
    onError: (error) => {
      // Log error para debugging em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao cadastrar paciente:', error)
      }
      toast.error('Erro ao cadastrar paciente')
    },
  })
}

export function useUpdatePaciente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...paciente }: any) => {
      const { data, error } = await (supabase
        .from('pacientes') as any)
        .update(paciente)
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
    onError: (error) => {
      // Log error para debugging em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao atualizar paciente:', error)
      }
      toast.error('Erro ao atualizar paciente')
    },
  })
}

export function useDeletePaciente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('pacientes') as any)
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
      toast.success('Paciente removido com sucesso!')
    },
    onError: (error) => {
      // Log error para debugging em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao remover paciente:', error)
      }
      toast.error('Erro ao remover paciente')
    },
  })
}
