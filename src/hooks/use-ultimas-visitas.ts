import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useUltimasVisitas(pacienteIds: string[]) {
  const stableIds = useMemo(() => {
    if (!pacienteIds || !pacienteIds.length) return []
    return [...pacienteIds].sort()
  }, [pacienteIds])

  return useQuery({
    queryKey: ['ultimas-visitas', stableIds],
    queryFn: async () => {
      if (!stableIds.length) return {}

      const { data, error } = await supabase
        .from('consultas')
        .select('paciente_id, horario_inicio')
        .in('paciente_id', stableIds)
        .eq('status', 'concluido')
        .order('horario_inicio', { ascending: false })

      if (error) throw error

      const map: Record<string, string> = {}
      for (const row of (data ?? []) as { paciente_id: string; horario_inicio: string }[]) {
        if (!map[row.paciente_id]) {
          map[row.paciente_id] = row.horario_inicio
        }
      }
      return map
    },
    enabled: stableIds.length > 0,
  })
}
