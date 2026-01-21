import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Usuario = Database['public']['Tables']['usuarios']['Row']
type Clinica = Database['public']['Tables']['clinicas']['Row']

const supabase = createClient()

export function useUser() {
  return useQuery<Usuario | null>({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) return null

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_usuario_id', authUser.id)
        .single()

      if (error) throw error
      return data as Usuario
    },
  })
}

export function useClinica() {
  const { data: user } = useUser()

  return useQuery<Clinica | null>({
    queryKey: ['clinica', user?.clinica_id],
    queryFn: async () => {
      if (!user?.clinica_id) return null

      const { data, error } = await supabase
        .from('clinicas')
        .select('*')
        .eq('id', user.clinica_id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user?.clinica_id,
  })
}
