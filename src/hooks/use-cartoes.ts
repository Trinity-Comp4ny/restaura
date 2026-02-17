'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface Cartao {
  id: string
  nome: string
  banco: string
  ultimos_digitos: string
  limite: number
  dia_vencimento: number | null
  dia_fechamento: number | null
  is_corporativo: boolean
  conta_fatura_id: string | null
  is_padrao: boolean
  ativo: boolean
  tipo_cartao: 'credito' | 'debito'
  clinica_id: string
  criado_em: string
  atualizado_em: string
}

// Hook para buscar cartões
export function useCartoes(clinicaId?: string) {
  return useQuery({
    queryKey: ['cartoes', clinicaId],
    queryFn: async () => {
      if (!clinicaId) return []
      
      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('clinica_id', clinicaId)
        .order('is_padrao', { ascending: false })
        .order('nome')

      if (error) throw error
      return data as Cartao[]
    },
    enabled: !!clinicaId
  })
}

// Hook para criar cartão
export function useCreateCartao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (cartao: Omit<Cartao, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const { data, error } = await (supabase
        .from('cartoes') as any)
        .insert([cartao])
        .select()
        .single()

      if (error) throw error
      return data as Cartao
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartoes'] })
      toast.success('Cartão criado com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao criar cartão:', error)
      toast.error('Erro ao criar cartão')
    }
  })
}

// Hook para atualizar cartão
export function useUpdateCartao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...cartao }: Partial<Cartao> & { id: string }) => {
      const { data, error } = await (supabase
        .from('cartoes') as any)
        .update(cartao)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Cartao
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartoes'] })
      toast.success('Cartão atualizado com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao atualizar cartão:', error)
      toast.error('Erro ao atualizar cartão')
    }
  })
}

// Hook para deletar cartão (soft delete)
export function useDeleteCartao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await (supabase
        .from('cartoes') as any)
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Cartao
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartoes'] })
      toast.success('Cartão desativado com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao desativar cartão:', error)
      toast.error('Erro ao desativar cartão')
    }
  })
}

// Hook para definir cartão padrão
export function useDefinirCartaoPadrao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ clinicaId, cartaoId }: { clinicaId: string; cartaoId: string }) => {
      await (supabase
        .from('cartoes') as any)
        .update({ is_padrao: false })
        .eq('clinica_id', clinicaId)

      const { data, error } = await (supabase
        .from('cartoes') as any)
        .update({ is_padrao: true })
        .eq('id', cartaoId)
        .select()
        .single()

      if (error) throw error
      return data as Cartao
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartoes'] })
      toast.success('Cartão padrão definido com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao definir cartão padrão:', error)
      toast.error('Erro ao definir cartão padrão')
    }
  })
}
