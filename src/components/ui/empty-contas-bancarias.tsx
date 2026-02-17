'use client'

import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyContasBancariasProps {
  tipo: 'cartao' | 'despesa'
}

export function EmptyContasBancarias({ tipo }: EmptyContasBancariasProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Settings className="h-6 w-6 text-gray-500 dark:text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Nenhuma conta bancária cadastrada
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
        {tipo === 'cartao' 
          ? 'Para vincular um cartão, você precisa cadastrar uma conta bancária primeiro.'
          : 'Para registrar despesas, você precisa cadastrar uma conta bancária primeiro.'
        }
      </p>
      
      <Button asChild>
        <Link href="/configuracoes/financeiro/contas">
          <Settings className="mr-2 h-4 w-4" />
          Configurar Contas
        </Link>
      </Button>
    </div>
  )
}
