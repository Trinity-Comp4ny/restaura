'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

// Hook temporário que usa API route para contornar RLS
export function useClinicasTemp() {
  return useQuery({
    queryKey: ['clinicas-temp'],
    queryFn: async () => {
      try {
        // Usar API route que tem service role key
        const response = await fetch('/api/test-clinicas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Incluir cookies de autenticação
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao buscar clínicas')
        }

        const data = await response.json()
        return data.clinicas || []
      } catch (error) {
        console.error('Erro no useClinicasTemp:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  })
}
