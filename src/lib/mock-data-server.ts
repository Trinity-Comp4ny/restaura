// Mock data server-side - apenas para uso em API routes
// NÃO importar em componentes client!

import type { Database } from '@/types/database.types'

import consultasJson from '@/mocks/consultas.json'
import pacientesJson from '@/mocks/pacientes.json'
import procedimentosJson from '@/mocks/procedimentos.json'
import tratamentosJson from '@/mocks/tratamentos.json'
import usuariosJson from '@/mocks/usuarios.json'

type Paciente = Database['public']['Tables']['pacientes']['Row']
type Consulta = Database['public']['Tables']['consultas']['Row']
type Procedimento = Database['public']['Tables']['procedimentos']['Row']
type Usuario = Database['public']['Tables']['usuarios']['Row']

type ConsultaExpandida = Consulta & {
  pacientes: Pick<Paciente, 'id' | 'nome' | 'telefone' | 'email'>
  usuarios: Pick<Usuario, 'id' | 'nome'>
  procedimentos: Pick<Procedimento, 'id' | 'nome' | 'cor' | 'duracao_minutos'> | null
}

export const mockPacientes = pacientesJson as unknown as Paciente[]
export const mockConsultas = consultasJson as unknown as Consulta[]
export const mockProcedimentos = procedimentosJson as unknown as Procedimento[]
export const mockTratamentos = tratamentosJson as unknown as unknown[]
export const mockUsuarios = usuariosJson as unknown as Usuario[]

export const mockConsultasExpandidas: ConsultaExpandida[] = mockConsultas.map((consulta) => {
  const paciente = mockPacientes.find((p) => p.id === consulta.paciente_id)
  const usuario = mockUsuarios.find((u) => u.id === consulta.dentista_id)
  const procedimento = consulta.procedimento_id
    ? mockProcedimentos.find((p) => p.id === consulta.procedimento_id)
    : null

  return {
    ...consulta,
    pacientes: {
      id: consulta.paciente_id,
      nome: paciente?.nome ?? 'Não informado',
      telefone: paciente?.telefone ?? null,
      email: paciente?.email ?? null,
    },
    usuarios: {
      id: consulta.dentista_id,
      nome: usuario?.nome ?? 'Não informado',
    },
    procedimentos: procedimento
      ? {
          id: procedimento.id,
          nome: procedimento.nome,
          cor: procedimento.cor ?? null,
          duracao_minutos: procedimento.duracao_minutos,
        }
      : null,
  }
})
