import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface Consulta {
  id: string
  data: string
  horario_inicio: string
  horario_fim?: string
  status: string
  observacoes?: string
  preco?: number
  paciente_id: string
  dentista_id: string
  procedimento_id: string
  clinica_id: string
  pacientes?: {
    id: string
    nome: string
    telefone?: string
    email?: string
    cpf?: string
    data_nascimento?: string
    avatar?: string
    contato_emergencia?: string
  }
  usuarios?: {
    id: string
    nome: string
  }
  procedimentos?: {
    id: string
    nome: string
    preco?: number
  }
}

const supabase = createClient()

export function useConsulta(consultaId?: string, clinicaId?: string) {
  return useQuery({
    queryKey: ['consulta', consultaId, clinicaId],
    queryFn: async () => {
      if (!consultaId || !clinicaId) return null

      const { data, error } = await supabase
        .from('consultas')
        .select(`
          *,
          pacientes!inner(
            id, nome, telefone, email, cpf, data_nascimento, avatar, contato_emergencia
          ),
          usuarios!inner(id, nome),
          procedimentos!inner(id, nome, preco)
        `)
        .eq('id', consultaId)
        .eq('clinica_id', clinicaId)
        .single()

      if (error) throw error
      return data as Consulta
    },
    enabled: !!consultaId && !!clinicaId,
  })
}

export function useHistoricoConsultas(pacienteId?: string, clinicaId?: string) {
  return useQuery({
    queryKey: ['historico-consultas', pacienteId, clinicaId],
    queryFn: async () => {
      if (!pacienteId || !clinicaId) return []

      const { data, error } = await supabase
        .from('consultas')
        .select(`
          id,
          data,
          horario_inicio,
          horario_fim,
          status,
          observacoes,
          preco,
          usuarios!inner(nome),
          procedimentos!inner(nome)
        `)
        .eq('paciente_id', pacienteId)
        .eq('clinica_id', clinicaId)
        .in('status', ['concluido', 'cancelado'])
        .order('data', { ascending: false })
        .order('horario_inicio', { ascending: false })

      if (error) throw error
      return data as Consulta[]
    },
    enabled: !!pacienteId && !!clinicaId,
  })
}
