import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import type { Database } from '@/types/database.types'

type Usuario = Database['public']['Tables']['usuarios']['Row']

const supabase = createClient()

export function useEquipe(options?: { search?: string }) {
  const { data: user } = useUser()

  const query = useQuery<Usuario[]>({
    queryKey: ['equipe', user?.clinica_id, options?.search],
    queryFn: async () => {
      if (!user?.clinica_id) return []

      let q = supabase
        .from('usuarios')
        .select('*')
        .eq('clinica_id', user.clinica_id)
        .order('nome')

      if (options?.search) {
        const s = options.search.toLowerCase()
        q = q.or(`nome.ilike.%${s}%,email.ilike.%${s}%`)
      }

      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Usuario[]
    },
    enabled: !!user?.clinica_id,
    retry: false,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
