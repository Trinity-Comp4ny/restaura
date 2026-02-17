import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Usuario = Database['public']['Tables']['usuarios']['Row']

const supabase = createClient()

export function useDentistas(clinicaId?: string) {
  return useQuery({
    queryKey: ['dentistas', clinicaId],
    queryFn: async () => {
      let query = supabase
        .from('usuarios')
        .select('*')
        .eq('papel', 'dentista')
        .order('nome', { ascending: true })

      if (clinicaId) {
        query = query.eq('clinica_id', clinicaId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Usuario[]
    },
    enabled: !!clinicaId,
  })
}

export function useDentista(id: string) {
  return useQuery({
    queryKey: ['dentista', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .eq('papel', 'dentista')
        .single()

      if (error) throw error
      return data as Usuario
    },
    enabled: !!id,
  })
}
