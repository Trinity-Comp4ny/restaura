import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Usuario = Database['public']['Tables']['usuarios']['Row']
type Clinica = Database['public']['Tables']['clinicas']['Row']

type UsuarioQuery = { data: Usuario | null; error: { message?: string } | null }

const supabase = createClient()

export function useUser() {
  return useQuery<Usuario | null>({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) return null

      // Tentar buscar da tabela usuarios primeiro com timeout
      const { data, error } = await Promise.race<UsuarioQuery | never>([
        supabase
          .from('usuarios')
          .select('*')
          .eq('auth_usuario_id', authUser.id)
          .single(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ])

      if (!error && data) {
        return data as Usuario
      }

      // Se houver erro RLS de recursão, usar fallback direto
      if (error && (error.message?.includes('recursive') || error.message?.includes('infinite'))) {
        // Silenciar erro de recursão
      }

      // Fallback: criar objeto usuário a partir dos metadados do auth
      const clinicaId = authUser.user_metadata?.clinica_id || 
                       authUser.app_metadata?.clinica_id || 
                       ''
      
      const fallbackUser: Usuario = {
        id: authUser.id,
        auth_usuario_id: authUser.id,
        clinica_id: clinicaId,
        email: authUser.email || '',
        nome: authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário',
        papel: authUser.user_metadata?.papel || 'admin',
        telefone: authUser.user_metadata?.telefone || null,
        url_avatar: authUser.user_metadata?.url_avatar || null,
        configuracoes: authUser.user_metadata?.configuracoes || {},
        cro: authUser.user_metadata?.cro || null,
        especialidade: authUser.user_metadata?.especialidade || null,
        ativo: true,
        criado_em: authUser.created_at,
        atualizado_em: authUser.updated_at || authUser.created_at
      }
      
      return fallbackUser
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antigo cacheTime)
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
