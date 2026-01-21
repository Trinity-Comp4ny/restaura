export interface Procedimento {
  id: string
  nome: string
  duracao_minutos: number
  ativo: boolean
}

export const PROCEDURE_CATEGORIES = [
  'Consulta',
  'Prevenção', 
  'Restauração',
  'Cirurgia',
  'Ortodontia',
  'Estética',
  'Outros'
] as const

export type ProcedureCategory = typeof PROCEDURE_CATEGORIES[number]

// Função para obter procedimentos ativos (para uso em selects)
export const getActiveProcedures = (procedures: Procedimento[]) => {
  return procedures.filter((p) => p.ativo).sort((a, b) => a.nome.localeCompare(b.nome))
}

// Função para encontrar procedimento por ID
export const getProcedureById = (id: string, procedures: Procedimento[]) => {
  return procedures.find((p) => p.id === id)
}

// Função para formatar duração
export const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h${remainingMinutes}min`
}
