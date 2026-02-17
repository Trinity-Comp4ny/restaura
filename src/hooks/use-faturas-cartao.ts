'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export interface FaturaCartao {
  id: string
  cartao_id: string
  conta_bancaria_id: string
  mes_referencia: string
  data_vencimento: string
  data_fechamento: string
  valor_aberto: number
  valor_pago: number
  status: 'aberta' | 'fechada' | 'paga'
  criado_em: string
  atualizado_em: string
}

// Hook para buscar faturas de cartão
export function useFaturasCartao(clinicaId?: string, cartaoId?: string) {
  return useQuery({
    queryKey: ['faturas_cartao', clinicaId, cartaoId],
    queryFn: async () => {
      let query = supabase
        .from('faturas_cartao')
        .select(`
          *,
          cartoes (id, nome, banco, ultimos_digitos),
          contas_bancarias (id, nome, banco)
        `)
        .order('mes_referencia', { ascending: false })

      if (clinicaId) {
        query = query.eq('cartoes.clinica_id', clinicaId)
      }
      
      if (cartaoId) {
        query = query.eq('cartao_id', cartaoId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as (FaturaCartao & {
        cartoes: { id: string; nome: string; banco: string; ultimos_digitos: string }
        contas_bancarias: { id: string; nome: string; banco: string }
      })[]
    },
    enabled: !!clinicaId
  })
}

// Hook para criar fatura de cartão
export function useCreateFaturaCartao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (fatura: Omit<FaturaCartao, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const { data, error } = await (supabase
        .from('faturas_cartao') as any)
        .insert([{
          ...fatura,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturas_cartao'] })
      toast.success('Fatura criada com sucesso!')
    },
    onError: (error: any) => {
      toast.error('Erro ao criar fatura: ' + error.message)
    }
  })
}

// Hook para pagar fatura (descontar da conta bancária)
export function usePagarFaturaCartao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      faturaId, 
      contaBancariaId, 
      valorPago 
    }: { 
      faturaId: string
      contaBancariaId: string
      valorPago: number
    }) => {
      // 1. Atualizar fatura como paga
      const { error: faturaError } = await (supabase
        .from('faturas_cartao') as any)
        .update({
          status: 'paga',
          valor_pago: valorPago,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', faturaId)

      if (faturaError) throw faturaError

      // 2. Descontar do saldo da conta bancária
      const { error: contaError } = await (supabase as any)
        .rpc('debitar_saldo', {
          p_conta_id: contaBancariaId,
          p_valor: valorPago
        })

      if (contaError) throw contaError

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturas_cartao'] })
      queryClient.invalidateQueries({ queryKey: ['contas_bancarias'] })
      toast.success('Fatura paga com sucesso! Saldo da conta atualizado.')
    },
    onError: (error: any) => {
      toast.error('Erro ao pagar fatura: ' + error.message)
    }
  })
}

// Função para gerar faturas mensais automaticamente
export async function gerarFaturasMensais(clinicaId: string) {
  const supabase = createClient()
  
  // Buscar cartões ativos
  const { data: cartoes, error: cartoesError } = await supabase
    .from('cartoes')
    .select('*')
    .eq('clinica_id', clinicaId)
    .eq('ativo', true)

  if (cartoesError) throw cartoesError

  const mesAtual = new Date()
  const mesReferencia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)
  
  for (const cartao of (cartoes || []) as any[]) {
    // Verificar se fatura já existe
    const { data: faturaExistente } = await supabase
      .from('faturas_cartao')
      .select('*')
      .eq('cartao_id', cartao.id)
      .eq('mes_referencia', mesReferencia.toISOString())
      .single()

    if (!faturaExistente) {
      // Criar nova fatura
      const dataVencimento = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), cartao.dia_vencimento || 10)
      const dataFechamento = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), cartao.dia_fechamento || 25)
      
      await (supabase
        .from('faturas_cartao') as any)
        .insert({
          cartao_id: cartao.id,
          conta_bancaria_id: cartao.conta_fatura_id,
          mes_referencia: mesReferencia.toISOString(),
          data_vencimento: dataVencimento.toISOString(),
          data_fechamento: dataFechamento.toISOString(),
          valor_aberto: 0,
          valor_pago: 0,
          status: 'aberta'
        })
    }
  }
}
