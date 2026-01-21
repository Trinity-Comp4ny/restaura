import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Tipos simplificados temporariamente
type Consulta = {
  id: string
  clinica_id: string
  paciente_id: string
  dentista_id: string
  procedimento_id: string | null
  horario_inicio: string
  horario_fim: string
  status: string
  observacoes: string | null
  criado_em: string
  atualizado_em: string
}

const supabase = createClient()

export function useConsultas(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['consultas', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('consultas')
        .select(`
          *,
          pacientes (id, nome, telefone, email),
          usuarios!consultas_dentista_id_fkey (id, nome),
          procedimentos (id, nome, cor, duracao_minutos)
        `)
        .order('horario_inicio', { ascending: true })

      if (startDate) {
        query = query.gte('horario_inicio', startDate)
      }
      if (endDate) {
        query = query.lte('horario_inicio', endDate)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data
    },
  })
}

export function useConsulta(id: string) {
  return useQuery({
    queryKey: ['consulta', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          *,
          pacientes (id, nome, telefone, email),
          usuarios!consultas_dentista_id_fkey (id, nome),
          procedimentos (id, nome, cor, duracao_minutos)
        `)
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return data
    },
    enabled: !!id,
  })
}

export function useCreateConsulta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (consulta: any) => {
      const { data, error } = await supabase
        .from('consultas')
        .insert(consulta)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] })
      toast.success('Consulta criada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar consulta:', error)
      toast.error('Erro ao criar consulta')
    },
  })
}

export function useUpdateConsulta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...consulta }: any) => {
      const { data, error } = await (supabase.from('consultas') as any)
        .update(consulta)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] })
      queryClient.invalidateQueries({ queryKey: ['consulta', variables.id] })
      toast.success('Consulta atualizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar consulta:', error)
      toast.error('Erro ao atualizar consulta')
    },
  })
}

export function useHistoricoPaciente(pacienteId: string) {
  return useQuery({
    queryKey: ['historico-paciente', pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          *,
          usuarios!consultas_dentista_id_fkey (id, nome),
          procedimentos (id, nome, cor, duracao_minutos)
        `)
        .eq('paciente_id', pacienteId)
        .in('status', ['concluido', 'confirmado'])
        .order('horario_inicio', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!pacienteId,
  })
}

export function useUltimaVisita(pacienteId: string) {
  return useQuery({
    queryKey: ['ultima-visita', pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          horario_inicio,
          usuarios!consultas_dentista_id_fkey (id, nome),
          procedimentos (id, nome)
        `)
        .eq('paciente_id', pacienteId)
        .eq('status', 'concluido')
        .order('horario_inicio', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }
      return data
    },
    enabled: !!pacienteId,
  })
}

export function useDeleteConsulta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('consultas')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] })
      toast.success('Consulta removida com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao remover consulta:', error)
      toast.error('Erro ao remover consulta')
    },
  })
}
