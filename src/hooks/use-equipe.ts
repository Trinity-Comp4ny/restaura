import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { useMockEquipe } from '@/lib/api-mock-client'
import type { Database } from '@/types/database.types'

type Usuario = Database['public']['Tables']['usuarios']['Row']

const useMock = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export function useEquipe(options?: { search?: string }) {
  const { data: user } = useUser()

  const supabaseQuery = useQuery<Usuario[]>({
    queryKey: ['equipe', user?.clinica_id, options?.search],
    queryFn: async () => {
      if (!user?.clinica_id) return []

      let query = supabase
        .from('usuarios')
        .select('*')
        .eq('clinica_id', user.clinica_id)
        .order('nome')

      if (options?.search) {
        const q = options.search.toLowerCase()
        query = query.or(`nome.ilike.%${q}%,email.ilike.%${q}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as Usuario[]
    },
    enabled: !!user?.clinica_id && !useMock,
    retry: false,
  })

  const mockQuery = useMockEquipe(options)

  if (useMock) {
    return {
      data: (mockQuery.data?.data ?? []) as Usuario[],
      isLoading: mockQuery.isLoading,
      error: mockQuery.error,
      refetch: mockQuery.refetch,
    }
  }

  return {
    data: supabaseQuery.data ?? [],
    isLoading: supabaseQuery.isLoading,
    error: supabaseQuery.error,
    refetch: supabaseQuery.refetch,
  }
}
