'use client'

import Link from 'next/link'
import { Plus, Search, Filter, MoreHorizontal, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useTransacoes } from '@/hooks/use-transacoes'

export default function TransacoesPage() {
  const { data: transacoes, isLoading } = useTransacoes()

  const transacoesMock = [
    {
      id: '1',
      type: 'receita',
      category: 'Consulta',
      description: 'Consulta ortodontia - Maria Silva',
      amount: 250.00,
      patient: 'Maria Silva',
      status: 'pago',
      date: '2024-01-15',
      payment_method: 'Cartão de Crédito',
    },
    {
      id: '2',
      type: 'despesa',
      category: 'Material',
      description: 'Compra de resina composta',
      amount: 89.90,
      patient: null,
      status: 'pago',
      date: '2024-01-14',
      payment_method: 'Transferência',
    },
    {
      id: '3',
      type: 'receita',
      category: 'Tratamento',
      description: 'Clareamento - Carlos Santos',
      amount: 800.00,
      patient: 'Carlos Santos',
      status: 'pendente',
      date: '2024-01-13',
      payment_method: null,
    },
  ]

  const statusColors: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-800',
    pago: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
    estornado: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie receitas e despesas da clínica.
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(15420)}</div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(8750)}</div>
            <p className="text-xs text-muted-foreground">+5% vs mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(6670)}</div>
            <p className="text-xs text-muted-foreground">Lucro do mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(1250)}</div>
            <p className="text-xs text-muted-foreground">A receber</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Todas as movimentações financeiras.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" placeholder="Buscar transação..." className="pl-9" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div>Data</div>
              <div>Descrição</div>
              <div>Categoria</div>
              <div>Paciente</div>
              <div>Valor</div>
              <div>Status</div>
              <div className="w-10"></div>
            </div>
            <div className="divide-y">
              {transacoesMock.map((transacao) => (
                <div
                  key={transacao.id}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="text-sm">{formatDate(transacao.date)}</div>
                  <div>
                    <div className="font-medium">{transacao.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {transacao.payment_method || 'Sem método'}
                    </div>
                  </div>
                  <div>
                    <Badge variant="outline">{transacao.category}</Badge>
                  </div>
                  <div className="text-sm">{transacao.patient || '-'}</div>
                  <div className="text-sm font-medium">
                    <span className={transacao.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                      {transacao.type === 'receita' ? '+' : '-'}{formatCurrency(transacao.amount)}
                    </span>
                  </div>
                  <div>
                    <Badge className={statusColors[transacao.status]}>
                      {transacao.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      {transacao.status === 'pendente' && (
                        <DropdownMenuItem>Marcar como Pago</DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
