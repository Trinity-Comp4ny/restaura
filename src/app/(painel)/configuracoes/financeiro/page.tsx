'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CreditCard, Building2, Wallet, Users, FileText, Settings,
  TrendingUp, ArrowUpRight, ArrowDownRight, PieChart,
  Calculator, DollarSign, Target, Briefcase, ArrowLeft
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/navigation-breadcrumb'

const financeiroSections = [
  {
    title: 'Categorias',
    description: 'Configure categorias para receitas e despesas',
    href: '/configuracoes/financeiro/categorias',
    icon: Target,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    items: ['Receitas', 'Despesas']
  },
  {
    title: 'Formas de Pagamento',
    description: 'Configure métodos de pagamento aceitos',
    href: '/configuracoes/pagamentos',
    icon: CreditCard,
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    items: ['PIX', 'Cartões', 'Transferência']
  },
  {
    title: 'Centros de Custo',
    description: 'Gerencie centros de custo para controle financeiro',
    href: '/configuracoes/financeiro/centros-custo',
    icon: PieChart,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    items: ['Fixo', 'Variável', 'Investimento']
  },
  {
    title: 'Convênios',
    description: 'Configure planos de convênio aceitos',
    href: '/configuracoes/financeiro/convenios',
    icon: Users,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    items: ['Planos', 'Taxas', 'Prazos']
  },
  {
    title: 'Fornecedores',
    description: 'Cadastre e gerencie seus fornecedores',
    href: '/configuracoes/financeiro/fornecedores',
    icon: Briefcase,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    items: ['Cadastro', 'Contato', 'Condições']
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
    title: 'Cartões',
    description: 'Configure cartões de crédito e débito',
    href: '/configuracoes/financeiro/cartoes',
    icon: Wallet,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    items: ['Crédito', 'Débito', 'Limites']
  }
]

const quickStats = [
  { label: 'Categorias Ativas', value: '16', change: '+2' },
  { label: 'Métodos Configurados', value: '6', change: '0' },
  { label: 'Fornecedores', value: '24', change: '+4' },
  { label: 'Contas Bancárias', value: '3', change: '0' }
]

export default function FinanceiroConfigPage() {
  const [activeSection, setActiveSection] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações Financeiras</h1>
          <p className="text-muted-foreground">
            Configure categorias, métodos de pagamento e contas da sua clínica.
          </p>
        </div>
        <BackButton href="/configuracoes" label="Voltar para Configurações" />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                {stat.change && (
                  <Badge variant="outline" className="text-xs">
                    {stat.change}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Configurações mais acessadas e atalhos rápidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              asChild
            >
              <Link href="/configuracoes/financeiro/categorias">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Categorias</div>
                    <div className="text-sm text-muted-foreground">
                      Organize receitas e despesas
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              asChild
            >
              <Link href="/configuracoes/pagamentos">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-pink-600" />
                  <div className="text-left">
                    <div className="font-medium">Formas de Pagamento</div>
                    <div className="text-sm text-muted-foreground">
                      Configure PIX, cartões e outras formas
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              asChild
            >
              <Link href="/configuracoes/financeiro/fornecedores">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-8 w-8 text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium">Fornecedores</div>
                    <div className="text-sm text-muted-foreground">
                      Cadastre seus fornecedores
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              asChild
            >
              <Link href="/configuracoes/financeiro/contas">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-indigo-600" />
                  <div className="text-left">
                    <div className="font-medium">Contas Bancárias</div>
                    <div className="text-sm text-muted-foreground">
                      Configure contas e caixa
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {financeiroSections.map((section, index) => (
          <Link key={index} href={section.href}>
            <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.color}`}>
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
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
          </Link>
        ))}
      </div>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Guia de Configuração
          </CardTitle>
          <CardDescription>
            Siga este passo a passo para configurar o financeiro da sua clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Categorias</h4>
                  <p className="text-sm text-muted-foreground">
                    Organize suas receitas e despesas por categorias
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-pink-600 text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Formas de Pagamento</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure PIX, cartões e outras formas de recebimento
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Contas Bancárias</h4>
                  <p className="text-sm text-muted-foreground">
                    Adicione suas contas bancárias e configure caixa físico
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Fornecedores</h4>
                  <p className="text-sm text-muted-foreground">
                    Cadastre seus principais fornecedores
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Após configurar, você já poderá registrar receitas e despesas no módulo Financeiro</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
