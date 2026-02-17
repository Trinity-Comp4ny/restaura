'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

// Hook simples para buscar clínicas - workaround para problemas de RLS
export function useClinicasSimples() {
  return useQuery({
    queryKey: ['clinicas-simples'],
    queryFn: async () => {
      // Tentar buscar usando a view primeiro
      try {
        const { data: viewData, error: viewError } = await supabase
          .from('vw_clinicas_detalhes')
          .select('*')

        if (!viewError && viewData) {
          return viewData
        }
      } catch (error) {
        console.warn('View não disponível, tentando query direta:', error)
      }

      // Fallback: query direta na tabela
      const { data: clinicasData, error: clinicasError } = await supabase
        .from('clinicas')
        .select('*')

      if (clinicasError) {
        console.error('Erro em todas as tentativas:', clinicasError)
        throw clinicasError
      }

      return clinicasData || []
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
