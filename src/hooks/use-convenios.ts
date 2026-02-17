'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface Convenio {
  id: string
  nome: string
  cnpj?: string
  ans?: string
  telefone?: string
  email?: string
  plano?: string
  taxa?: number
  prazo_pagamento?: number
  valor_minimo_consulta?: number
  valor_maximo_consulta?: number
  is_padrao?: boolean
  ativo: boolean
  clinica_id: string
  criado_em: string
  atualizado_em: string
}

export function useConvenios() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['convenios'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('convenios') as any)
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (error) throw error
      return data as Convenio[]
    }
  })
}

export function useCreateConvenio() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (convenio: Omit<Convenio, 'id' | 'clinica_id' | 'criado_em' | 'atualizado_em'>) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user?.id) throw new Error('Usuário não autenticado')

      // Get clinica_id from usuarios table
      const { data: usuario } = await (supabase
        .from('usuarios') as any)
        .select('clinica_id')
        .eq('auth_usuario_id', user.user.id)
        .single()

      if (!usuario?.clinica_id) throw new Error('Clínica não encontrada')

      const { data, error } = await (supabase
        .from('convenios') as any)
        .insert({
          ...convenio,
          clinica_id: usuario.clinica_id
        })
        .select()
        .single()

      if (error) throw error
      return data as Convenio
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] })
    }
  })
}

export function useUpdateConvenio() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...convenio }: Partial<Convenio> & { id: string }) => {
      const { data, error } = await (supabase
        .from('convenios') as any)
        .update(convenio)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Convenio
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] })
    }
  })
}

export function useDeleteConvenio() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await (supabase
        .from('convenios') as any)
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Convenio
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] })
    }
  })
}
