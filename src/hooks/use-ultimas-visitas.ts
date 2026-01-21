import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMockUltimasVisitas } from '@/lib/api-mock-client'

export function useUltimasVisitas(pacienteIds: string[]) {
  // Memoizar pacienteIds para evitar queryKey instável
  const stableIds = useMemo(() => {
    if (!pacienteIds || !pacienteIds.length) return []
    // Ordenar para garantir estabilidade
    return [...pacienteIds].sort()
  }, [pacienteIds])

  return useMockUltimasVisitas(stableIds)
}
