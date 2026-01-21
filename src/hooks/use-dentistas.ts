import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Usuario = Database['public']['Tables']['usuarios']['Row']

const supabase = createClient()

export function useDentistas() {
  return useQuery({
    queryKey: ['dentistas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('papel', 'dentista')
        .order('nome', { ascending: true })

      if (error) throw error
      return data as Usuario[]
    },
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
