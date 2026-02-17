'use client'

import { Button } from '@/components/ui/button'
import { SelectContent, SelectItem } from '@/components/ui/select'
import { Plus, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EmptyDropdownProps {
  type: 'categoria' | 'metodo' | 'paciente' | 'conta'
  tipo?: 'receita' | 'despesa'
}

export function EmptyDropdown({ type, tipo }: EmptyDropdownProps) {
  const router = useRouter()
  
  const handleConfigRedirect = () => {
    if (type === 'categoria') {
      router.push('/configuracoes/financeiro/categorias')
    } else if (type === 'metodo') {
      router.push('/configuracoes/financeiro/metodos-pagamento')
    } else if (type === 'paciente') {
      router.push('/pacientes')
    } else if (type === 'conta') {
      router.push('/configuracoes/financeiro/contas')
    }
  }

  const getMessage = () => {
    if (type === 'categoria') {
      return tipo === 'despesa' 
        ? 'Nenhuma categoria de despesa cadastrada'
        : 'Nenhuma categoria de receita cadastrada'
    } else if (type === 'metodo') {
      return 'Nenhum método de pagamento cadastrado'
    } else if (type === 'paciente') {
      return 'Nenhum paciente cadastrado'
    } else if (type === 'conta') {
      return 'Nenhuma conta bancária cadastrada'
    }
    return ''
  }

  const getSubMessage = () => {
    if (type === 'categoria') {
      return 'Cadastre categorias para organizar melhor suas finanças'
    } else if (type === 'metodo') {
      return 'Cadastre métodos para controlar suas formas de pagamento'
    } else if (type === 'paciente') {
      return 'Cadastre pacientes para vincular às receitas'
    } else if (type === 'conta') {
      return 'Cadastre contas bancárias para vincular aos métodos'
    }
    return ''
  }

  return (
    <div className="p-4 text-center">
      <div className="mb-3">
        <Settings className="h-8 w-8 mx-auto text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">
        {getMessage()}
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        {getSubMessage()}
      </p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleConfigRedirect}
        className="text-xs"
      >
        <Plus className="mr-1 h-3 w-3" />
        {type === 'categoria' ? 'Configurar Categorias' : 
         type === 'metodo' ? 'Configurar Métodos' : 
         type === 'conta' ? 'Configurar Contas' :
         'Cadastrar Pacientes'}
      </Button>
    </div>
  )
}
