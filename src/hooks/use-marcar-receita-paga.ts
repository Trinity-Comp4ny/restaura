/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export function useMarcarReceitaPaga() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ transacaoId, dataPagamento }: { transacaoId: string; dataPagamento: string }) => {
      // 1. Atualizar status da transação
      const { error: errorTransacao } = await (supabase
        .from('transacoes') as any)
        .update({ 
          status: 'pago',
          data_pagamento: dataPagamento
        })
        .eq('id', transacaoId)

      if (errorTransacao) throw errorTransacao

      // 2. Marcar todas as parcelas como pagas
      const { error: errorParcelas } = await (supabase
        .from('parcelas') as any)
        .update({ 
          status: 'pago',
          data_pagamento: dataPagamento
        })
        .eq('transacao_id', transacaoId)

      if (errorParcelas) throw errorParcelas

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] })
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
      toast.success('Receita marcada como paga com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao marcar receita como paga')
      console.error(error)
    },
  })
}
