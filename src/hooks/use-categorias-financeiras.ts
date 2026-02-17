'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export interface CategoriaFinanceira {
  id: string
  nome: string
  descricao: string
  cor: string
  tipo: 'receita' | 'despesa'
  is_padrao: boolean
  ativa: boolean
  clinica_id: string
  criado_em: string
  atualizado_em: string
}

// Hook para buscar categorias de receita
export function useCategoriasReceita(clinicaId?: string) {
  return useQuery({
    queryKey: ['categorias', 'receita', clinicaId],
    queryFn: async () => {
      if (!clinicaId) return []
      
      const { data, error } = await supabase
        .from('categorias_receita')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativa', true)
        .order('is_padrao', { ascending: false })
        .order('nome')

      if (error) throw error
      return data as CategoriaFinanceira[]
    },
    enabled: !!clinicaId
  })
}

// Hook para buscar categorias de despesa
export function useCategoriasDespesa(clinicaId?: string) {
  return useQuery({
    queryKey: ['categorias', 'despesa', clinicaId],
    queryFn: async () => {
      if (!clinicaId) return []
      
      const { data, error } = await supabase
        .from('categorias_despesa')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativa', true)
        .order('is_padrao', { ascending: false })
        .order('nome')

      if (error) throw error
      return data as CategoriaFinanceira[]
    },
    enabled: !!clinicaId
  })
}

// Hook para criar categoria
export function useCreateCategoria() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (categoria: Omit<CategoriaFinanceira, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const tableName = categoria.tipo === 'receita' ? 'categorias_receita' : 'categorias_despesa'
      
      const { data, error } = await supabase
        .from(tableName)
        .insert([{
          clinica_id: categoria.clinica_id,
          nome: categoria.nome,
          descricao: categoria.descricao || null,
          cor: categoria.cor,
          is_padrao: categoria.is_padrao,
          ativa: categoria.ativa
        }] as any)
        .select()
        .single()

      if (error) throw error
      return data as CategoriaFinanceira
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria criada com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao criar categoria:', error)
      toast.error(`Erro ao criar categoria: ${error.message || 'Erro desconhecido'}`)
    }
  })
}

// Hook para atualizar categoria
export function useUpdateCategoria() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...categoria }: Partial<CategoriaFinanceira> & { id: string }) => {
      // Primeiro, buscar a categoria atual para saber qual tabela usar
      // Tentar categorias_receita primeiro
      const { data: receitaData } = await supabase
        .from('categorias_receita')
        .select('*')
        .eq('id', id)
        .single()
      
      const tableName = receitaData ? 'categorias_receita' : 'categorias_despesa'
      
      const { data, error } = await (supabase
        .from(tableName) as any)
        .update({
          nome: categoria.nome,
          descricao: categoria.descricao || null,
          cor: categoria.cor,
          is_padrao: categoria.is_padrao,
          ativa: categoria.ativa
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as CategoriaFinanceira
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria atualizada com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao atualizar categoria:', error)
      toast.error(`Erro ao atualizar categoria: ${error.message || 'Erro desconhecido'}`)
    }
  })
}

// Hook para deletar categoria (soft delete)
export function useDeleteCategoria() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Primeiro, buscar a categoria atual para saber qual tabela usar
      const { data: receitaData } = await supabase
        .from('categorias_receita')
        .select('*')
        .eq('id', id)
        .single()
      
      const tableName = receitaData ? 'categorias_receita' : 'categorias_despesa'
      
      const { data, error } = await (supabase
        .from(tableName) as any)
        .update({ ativa: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as CategoriaFinanceira
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoria desativada com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao desativar categoria:', error)
      toast.error(`Erro ao desativar categoria: ${error.message || 'Erro desconhecido'}`)
    }
  })
}
