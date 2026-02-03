import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']
type PacienteInsert = Database['public']['Tables']['pacientes']['Insert']
type PacienteUpdate = Partial<PacienteInsert>

const supabase = createClient()

// Mock data for development
const mockPacientes: Paciente[] = [
  {
    id: '1',
    clinica_id: '1',
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    telefone: '(11) 98765-4321',
    data_nascimento: '1985-03-15',
    genero: 'feminino',
    cpf: '123.456.789-00',
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    profissao: null,
    tipo_sanguineo: null,
    fator_rh: null,
    contato_emergencia: null,
    telefone_emergencia: null,
    convenio: null,
    carteira_convenio: null,
    alergias: 'Penicilina',
    doencas_sistemicas: null,
    medicamentos: null,
    condicoes_especiais: null,
    ultima_consulta_odonto: null,
    tratamentos_anteriores: null,
    habitos: null,
    higiene_bucal: null,
    observacoes: 'Paciente com alergia a penicilina',
    url_avatar: null,
    ativo: true,
    criado_em: '2024-01-01T00:00:00Z',
    atualizado_em: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    clinica_id: '1',
    nome: 'Carlos Santos',
    email: 'carlos.santos@email.com',
    telefone: '(11) 97654-3210',
    data_nascimento: '1990-07-22',
    genero: 'masculino',
    cpf: '987.654.321-00',
    endereco: 'Av. Paulista, 456',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
    profissao: null,
    tipo_sanguineo: null,
    fator_rh: null,
    contato_emergencia: null,
    telefone_emergencia: null,
    convenio: null,
    carteira_convenio: null,
    alergias: null,
    doencas_sistemicas: null,
    medicamentos: null,
    condicoes_especiais: null,
    ultima_consulta_odonto: null,
    tratamentos_anteriores: null,
    habitos: null,
    higiene_bucal: null,
    observacoes: '',
    url_avatar: null,
    ativo: true,
    criado_em: '2024-01-02T00:00:00Z',
    atualizado_em: '2024-01-02T00:00:00Z'
  }
]

export function usePacientes() {
  return useQuery({
    queryKey: ['pacientes'],
    queryFn: async () => {
      // Use mock data when Supabase is disabled
      if (!supabase || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return mockPacientes
      }

      const { data, error } = await supabase!
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
      // Use mock data when Supabase is disabled
      if (!supabase || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        const paciente = mockPacientes.find(p => p.id === id)
        if (!paciente) {
          throw new Error('Paciente não encontrado')
        }
        return paciente
      }

      // Primeiro tenta buscar no banco de dados
      const { data, error } = await supabase!
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
      // Return mock response when Supabase is disabled
      if (!supabase || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return {
          id: Date.now().toString(),
          clinica_id: '1',
          ...paciente,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
          ativo: true
        }
      }

      const { data, error } = await supabase!
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
      // Return mock response when Supabase is disabled
      if (!supabase || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return {
          id,
          clinica_id: '1',
          ...paciente,
          atualizado_em: new Date().toISOString(),
        }
      }

      const { data, error } = await (supabase!
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
      // Return mock response when Supabase is disabled
      if (!supabase || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return
      }

      const { error } = await (supabase!
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
