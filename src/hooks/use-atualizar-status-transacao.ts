import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export function useAtualizarStatusTransacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ transacaoId }: { transacaoId: string }) => {
      // 1. Buscar todas as parcelas da transação
      const { data: parcelas, error: errorParcelas } = await (supabase
        .from('parcelas') as any)
        .select('*')
        .eq('transacao_id', transacaoId)

      if (errorParcelas) throw errorParcelas

      // 2. Calcular status baseado nas parcelas
      let novoStatus = 'pendente'
      
      if (parcelas && parcelas.length > 0) {
        const todasPagas = parcelas.every((p: any) => p.data_pagamento !== null)
        const todasCanceladas = parcelas.every((p: any) => p.status === 'cancelado')
        
        if (todasPagas) {
          novoStatus = 'pago'
        } else if (todasCanceladas) {
          novoStatus = 'cancelado'
        }
      }

      // 3. Atualizar status da transação
      const { error: errorUpdate } = await (supabase
        .from('transacoes') as any)
        .update({ status: novoStatus })
        .eq('id', transacaoId)

      if (errorUpdate) throw errorUpdate

      return { status: novoStatus }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] })
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
    },
    onError: (error) => {
      console.error('Erro ao atualizar status da transação:', error)
    },
  })
}
