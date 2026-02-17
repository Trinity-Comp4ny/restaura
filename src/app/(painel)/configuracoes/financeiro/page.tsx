'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CreditCard,
  DollarSign,
  Target,
  Users,
  Wallet,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const financeiroSections = [
  {
    title: 'Cartões',
    description: 'Configure cartões de crédito e débito',
    href: '/configuracoes/financeiro/cartoes',
    icon: Wallet,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    items: ['Crédito', 'Débito', 'Limites']
  },
  {
    title: 'Categorias',
    description: 'Configure categorias para receitas e despesas',
    href: '/configuracoes/financeiro/categorias',
    icon: Target,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    items: ['Receitas', 'Despesas']
  },
  {
    title: 'Contas Bancárias',
    description: 'Gerencie suas contas bancárias e caixa físico',
    href: '/configuracoes/financeiro/contas',
    icon: Building2,
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    items: ['Bancos', 'Caixa', 'Saldos']
  },
  {
    title: 'Convênios',
    description: 'Configure planos de convênio aceitos',
    href: '/configuracoes/financeiro/convenios',
    icon: Users,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    items: ['Planos', 'Taxas', 'Prazos'],
    disabled: true,
  },
  {
    title: 'Fornecedores',
    description: 'Cadastre e gerencie seus fornecedores',
    href: '/configuracoes/financeiro/fornecedores',
    icon: Briefcase,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    items: ['Cadastro', 'Contato', 'Condições'],
    disabled: true,
  },
  {
    title: 'Métodos de Cobrança',
    description: 'Configure métodos de cobrança aceitos',
    href: '/configuracoes/financeiro/metodos-cobranca',
    icon: CreditCard,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    items: ['PIX', 'Cartões', 'Transferência']
  },
  {
    title: 'Métodos de Pagamento',
    description: 'Configure métodos para pagar fornecedores',
    href: '/configuracoes/financeiro/metodos-pagamento',
    icon: Wallet,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    items: ['Transferência', 'Boleto', 'Débito']
  }
]

export default function FinanceiroConfigPage() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/configuracoes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Configurações Financeiras</h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Centralize categorias, métodos e contas em um só lugar para manter o caixa organizado.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {financeiroSections.map((section, index) => {
          const card = (
            <Card
              className={`h-full transition-all ${
                section.disabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 hover:shadow-md'
              }`}
            >
              <CardHeader className="flex flex-row items-start gap-3">
                <div className={`rounded-lg p-2 ${section.color}`}>
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {section.title}
                    {section.disabled && <Badge variant="outline">Em breve</Badge>}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
                {!section.disabled && <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {section.items.map((item, itemIndex) => (
                    <Badge
                      key={itemIndex}
                      variant="outline"
                      className="text-xs"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )

          if (section.disabled) {
            return (
              <div key={index} className="h-full">
                {card}
              </div>
            )
          }

          return (
            <Link key={index} href={section.href}>
              {card}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
