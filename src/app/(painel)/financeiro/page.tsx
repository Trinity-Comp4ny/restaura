import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Wallet,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TRANSACTION_STATUS_LABELS } from '@/constants'

export const metadata = {
  title: 'Financeiro',
}

const stats = [
  {
    title: 'Receita do Mês',
    value: 45680,
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    iconBg: 'bg-green-100 dark:bg-green-900',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    title: 'Despesas do Mês',
    value: 12450,
    change: '-3.2%',
    changeType: 'negative' as const,
    icon: TrendingDown,
    iconBg: 'bg-red-100 dark:bg-red-900',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  {
    title: 'Lucro Líquido',
    value: 33230,
    change: '+18.7%',
    changeType: 'positive' as const,
    icon: DollarSign,
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'A Receber',
    value: 8750,
    change: '5 pendentes',
    changeType: 'neutral' as const,
    icon: Wallet,
    iconBg: 'bg-yellow-100 dark:bg-yellow-900',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
]

const recentTransactions = [
  {
    id: '1',
    description: 'Limpeza - Maria Silva',
    amount: 150,
    type: 'income',
    status: 'pago',
    date: '2024-01-15',
    method: 'pix',
  },
  {
    id: '2',
    description: 'Restauração - Carlos Santos',
    amount: 450,
    type: 'income',
    status: 'pago',
    date: '2024-01-15',
    method: 'credit_card',
  },
  {
    id: '3',
    description: 'Material Odontológico',
    amount: 1200,
    type: 'expense',
    status: 'pago',
    date: '2024-01-14',
    method: 'bank_transfer',
  },
  {
    id: '4',
    description: 'Clareamento - Ana Oliveira',
    amount: 800,
    type: 'income',
    status: 'pendente',
    date: '2024-01-14',
    method: 'credit_card',
  },
  {
    id: '5',
    description: 'Ortodontia - Pedro Costa',
    amount: 350,
    type: 'income',
    status: 'pago',
    date: '2024-01-13',
    method: 'cash',
  },
]

const methodIcons: Record<string, typeof CreditCard> = {
  pix: Wallet,
  credit_card: CreditCard,
  cash: Banknote,
  bank_transfer: DollarSign,
}

const statusColors: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  pago: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  estornado: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

export default function FinancialPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe as finanças da sua clínica.
          </p>
        </div>
        <Link href="/financeiro/transacoes/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.iconBg}`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stat.value)}</div>
              <p className="mt-1 flex items-center text-xs text-muted-foreground">
                {stat.changeType === 'positive' && stat.change.startsWith('+') && (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                )}
                {stat.changeType === 'negative' && stat.change.startsWith('-') && (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                )}
                <span
                  className={
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : ''
                  }
                >
                  {stat.change}
                </span>
                {stat.changeType !== 'neutral' && (
                  <span className="ml-1">vs. mês anterior</span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas movimentações financeiras.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => {
                const MethodIcon = methodIcons[transaction.method] || DollarSign
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          transaction.type === 'income'
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-red-100 dark:bg-red-900'
                        }`}
                      >
                        <MethodIcon
                          className={`h-4 w-4 ${
                            transaction.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[transaction.status as keyof typeof statusColors]}>
                        {TRANSACTION_STATUS_LABELS[transaction.status as keyof typeof TRANSACTION_STATUS_LABELS]}
                      </Badge>
                      <span
                        className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo por Categoria</CardTitle>
            <CardDescription>Distribuição de receitas e despesas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Procedimentos</span>
                  <span className="font-medium">{formatCurrency(32500)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-[75%] rounded-full bg-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Ortodontia</span>
                  <span className="font-medium">{formatCurrency(8500)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-[45%] rounded-full bg-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Estética</span>
                  <span className="font-medium">{formatCurrency(4680)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-[25%] rounded-full bg-purple-500" />
                </div>
              </div>
              <div className="mt-6 border-t pt-4">
                <h4 className="mb-3 font-medium">Despesas</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Materiais</span>
                    <span className="font-medium text-red-600">-{formatCurrency(6200)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Equipe</span>
                    <span className="font-medium text-red-600">-{formatCurrency(4500)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Operacional</span>
                    <span className="font-medium text-red-600">-{formatCurrency(1750)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
