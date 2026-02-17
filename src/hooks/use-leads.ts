import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface Lead {
  id: string
  nome: string
  email?: string
  telefone?: string
  source: string
  value?: string
  observacoes?: string
  status: string
  created_at?: string
  updated_at?: string
}

const supabase = createClient()

export function useLeads(clinicaId?: string) {
  return useQuery({
    queryKey: ['leads', clinicaId],
    queryFn: async () => {
      if (!clinicaId) return []

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('clinica_id', clinicaId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Lead[]
    },
    enabled: !!clinicaId,
  })
}

export function useLead(leadId?: string, clinicaId?: string) {
  return useQuery({
    queryKey: ['lead', leadId, clinicaId],
    queryFn: async () => {
      if (!leadId || !clinicaId) return null

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('clinica_id', clinicaId)
        .single()

      if (error) throw error
      return data as Lead
    },
    enabled: !!leadId && !!clinicaId,
  })
}
