'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, CreditCard, Briefcase, Users, Building2, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EmptyStateProps {
  type: 'cartoes' | 'fornecedores' | 'equipe' | 'multi-clinicas'
  title?: string
  description?: string
  buttonText?: string
  onAction?: () => void
}

export function EmptyState({ type, title, description, buttonText, onAction }: EmptyStateProps) {
  const router = useRouter()

  const getIcon = () => {
    switch (type) {
      case 'cartoes':
        return <CreditCard className="h-12 w-12 text-muted-foreground" />
      case 'fornecedores':
        return <Briefcase className="h-12 w-12 text-muted-foreground" />
      case 'equipe':
        return <Users className="h-12 w-12 text-muted-foreground" />
      case 'multi-clinicas':
        return <Building2 className="h-12 w-12 text-muted-foreground" />
      default:
        return <Settings className="h-12 w-12 text-muted-foreground" />
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'cartoes':
        return 'Nenhum cartão cadastrado'
      case 'fornecedores':
        return 'Nenhum fornecedor cadastrado'
      case 'equipe':
        return 'Nenhum membro na equipe'
      case 'multi-clinicas':
        return 'Nenhuma clínica encontrada'
      default:
        return 'Nenhum registro encontrado'
    }
  }

  const getDefaultDescription = () => {
    switch (type) {
      case 'cartoes':
        return 'Configure seus cartões corporativos e pessoais para gerenciar pagamentos'
      case 'fornecedores':
        return 'Cadastre fornecedores para organizar compras e pagamentos'
      case 'equipe':
        return 'Convide membros para fazer parte da equipe da sua clínica'
      case 'multi-clinicas':
        return 'Você ainda não possui clínicas cadastradas na sua rede'
      default:
        return 'Comece cadastrando seu primeiro registro'
    }
  }

  const getDefaultButtonText = () => {
    switch (type) {
      case 'cartoes':
        return 'Novo Cartão'
      case 'fornecedores':
        return 'Novo Fornecedor'
      case 'equipe':
        return 'Convidar Membro'
      case 'multi-clinicas':
        return 'Adicionar Clínica'
      default:
        return 'Adicionar Registro'
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">
          {getIcon()}
        </div>
        <h3 className="text-lg font-medium mb-2">
          {title || getDefaultTitle()}
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {description || getDefaultDescription()}
        </p>
        <Button onClick={onAction} className="min-w-[140px]">
          <Plus className="mr-2 h-4 w-4" />
          {buttonText || getDefaultButtonText()}
        </Button>
      </CardContent>
    </Card>
  )
}
