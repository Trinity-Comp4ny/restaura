import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// @ts-ignore - Supabase RLS typing issues
const supabase = createClient()

export interface ContaBancaria {
  id: string
  clinica_id: string
  nome: string
  banco: string | null
  agencia: string | null
  conta: string | null
  tipo: 'conta_corrente' | 'conta_poupanca' | 'caixa_fisico'
  saldo: number
  is_padrao: boolean
  ativa: boolean
  criado_em: string
  atualizado_em: string
}

export function useContasBancarias() {
  return useQuery({
    queryKey: ['contas-bancarias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contas_bancarias')
        .select('*')
        .eq('ativa', true)
        .order('is_padrao', { ascending: false })
        .order('nome')

      if (error) throw error
      return data as ContaBancaria[]
    },
  })
}

export function useContaBancaria(id: string) {
  return useQuery({
    queryKey: ['conta-bancaria', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contas_bancarias')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as ContaBancaria
    },
    enabled: !!id,
  })
}

export function useCreateContaBancaria() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (conta: Omit<ContaBancaria, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const { data, error } = await supabase
        .from('contas_bancarias')
        // @ts-ignore
        .insert([conta])
        .select()
        .single()

      if (error) throw error
      return data as ContaBancaria
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-bancarias'] })
      toast.success('Conta bancária criada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar conta bancária')
      console.error(error)
    },
  })
}

export function useUpdateContaBancaria() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...conta }: Partial<ContaBancaria> & { id: string }) => {
      const { data, error } = await supabase
        .from('contas_bancarias')
        // @ts-ignore
        .update(conta)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ContaBancaria
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-bancarias'] })
      toast.success('Conta bancária atualizada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar conta bancária')
      console.error(error)
    },
  })
}

export function useDeleteContaBancaria() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contas_bancarias')
        // @ts-ignore
        .update({ ativa: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-bancarias'] })
      toast.success('Conta bancária removida com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao remover conta bancária')
      console.error(error)
    },
  })
}
