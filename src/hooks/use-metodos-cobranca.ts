/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export interface MetodoCobranca {
  id: string
  nome: string
  tipo: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'transferencia' | 'boleto'
  taxas_percentual: number
  taxas_fixa: number
  prazo_deposito: number
  adquirente?: string
  conta_vinculada_id?: string
  cartao_id?: string // Adicionado para vincular com cartões
  is_padrao: boolean
  ativo: boolean
  clinica_id: string
  criado_em: string
  atualizado_em: string
}

// Hook para buscar métodos de cobrança (para receitas)
export function useMetodosCobranca(clinicaId?: string) {
  return useQuery({
    queryKey: ['metodos_cobranca', clinicaId],
    queryFn: async () => {
      if (!clinicaId) return []
      
      const { data, error } = await supabase
        .from('metodos_cobranca')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativo', true)
        .order('is_padrao', { ascending: false })
        .order('nome')
      
      if (error) throw error
      return data as MetodoCobranca[]
    },
    enabled: !!clinicaId
  })
}

// Hook para buscar método de cobrança padrão
export function useMetodoCobrancaPadrao(clinicaId?: string) {
  return useQuery({
    queryKey: ['metodo_cobranca_padrao', clinicaId],
    queryFn: async () => {
      if (!clinicaId) return null
      
      const { data, error } = await supabase
        .from('metodos_cobranca')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativo', true)
        .eq('is_padrao', true)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data as MetodoCobranca | null
    },
    enabled: !!clinicaId
  })
}

// Hook para criar método de cobrança
export function useCreateMetodoCobranca() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (metodo: Omit<MetodoCobranca, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const { data, error } = await (supabase
        .from('metodos_cobranca') as any)
        .insert([{
          ...metodo,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metodos_cobranca'] })
      queryClient.invalidateQueries({ queryKey: ['metodo_cobranca_padrao'] })
      toast.success('Método de cobrança criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error('Erro ao criar método de cobrança: ' + error.message)
    }
  })
}

// Hook para atualizar método de cobrança
export function useUpdateMetodoCobranca() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...metodo }: Partial<MetodoCobranca> & { id: string }) => {
      const { data, error } = await (supabase
        .from('metodos_cobranca') as any)
        .update({
          ...metodo,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metodos_cobranca'] })
      queryClient.invalidateQueries({ queryKey: ['metodo_cobranca_padrao'] })
      toast.success('Método de cobrança atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar método de cobrança: ' + error.message)
    }
  })
}

// Hook para desativar método de cobrança
export function useDeleteMetodoCobranca() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await (supabase
        .from('metodos_cobranca') as any)
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metodos_cobranca'] })
      queryClient.invalidateQueries({ queryKey: ['metodo_cobranca_padrao'] })
      toast.success('Método de cobrança desativado com sucesso!')
    },
    onError: (error: any) => {
      toast.error('Erro ao desativar método de cobrança: ' + error.message)
    }
  })
}

// Hook para definir método de cobrança padrão
export function useSetMetodoCobrancaPadrao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ clinicaId, metodoId }: { clinicaId: string; metodoId: string }) => {
      // Primeiro, remove o padrão de todos os métodos da clínica
      await (supabase
        .from('metodos_cobranca') as any)
        .update({ is_padrao: false })
        .eq('clinica_id', clinicaId)
      
      // Depois, define o novo padrão
      const { data, error } = await (supabase
        .from('metodos_cobranca') as any)
        .update({ is_padrao: true })
        .eq('id', metodoId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metodos_cobranca'] })
      queryClient.invalidateQueries({ queryKey: ['metodo_cobranca_padrao'] })
      toast.success('Método de cobrança padrão definido com sucesso!')
    },
    onError: (error: any) => {
      toast.error('Erro ao definir método padrão: ' + error.message)
    }
  })
}
