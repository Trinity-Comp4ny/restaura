'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Stethoscope,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  Activity,
  AlertTriangle,
  FileBarChart,
  PieChart,
  BarChart3,
  LineChart
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface VisaoGeralProps {
  periodo: string
}

const mockKPIs = {
  receitaBruta: 68450.0,
  receitaVariacao: 14.2,
  despesaTotal: 22180.0,
  despesaVariacao: -3.8,
  lucroLiquido: 46270.0,
  lucroVariacao: 22.1,
  margemLiquida: 67.6,
  aReceber: 12350.0,
  aReceberQtd: 8,
  ticketMedio: 485.0,
  ticketVariacao: 6.3,
}

const mockReceitaMensal = [
  { mes: 'Jul', receita: 42000, despesa: 18000 },
  { mes: 'Ago', receita: 48000, despesa: 19500 },
  { mes: 'Set', receita: 51000, despesa: 20000 },
  { mes: 'Out', receita: 55000, despesa: 21000 },
  { mes: 'Nov', receita: 59900, despesa: 23100 },
  { mes: 'Dez', receita: 68450, despesa: 22180 },
]

const mockReceitaPorCategoria = [
  { categoria: 'Procedimentos Gerais', valor: 28500, percentual: 41.6, cor: 'bg-primary' },
  { categoria: 'Ortodontia', valor: 14200, percentual: 20.7, cor: 'bg-blue-500' },
  { categoria: 'Implantes', valor: 11800, percentual: 17.2, cor: 'bg-purple-500' },
  { categoria: 'Estética', valor: 8350, percentual: 12.2, cor: 'bg-pink-500' },
  { categoria: 'Consultas', valor: 3600, percentual: 5.3, cor: 'bg-orange-500' },
  { categoria: 'Outros', valor: 2000, percentual: 2.9, cor: 'bg-gray-400' },
]

const mockDespesasPorCategoria = [
  { categoria: 'Pessoal', valor: 5000.0, percentual: 36.2, cor: 'bg-blue-500' },
  { categoria: 'Infraestrutura', valor: 5180.0, percentual: 37.5, cor: 'bg-orange-500' },
  { categoria: 'Materiais', valor: 1075.0, percentual: 7.8, cor: 'bg-purple-500' },
  { categoria: 'Marketing', valor: 1200.0, percentual: 8.7, cor: 'bg-pink-500' },
  { categoria: 'Serviços', valor: 950.0, percentual: 6.9, cor: 'bg-teal-500' },
  { categoria: 'Outros', valor: 749.0, percentual: 5.4, cor: 'bg-gray-400' },
]

const mockReceitaPorMetodo = [
  { metodo: 'PIX', valor: 22100, percentual: 32.3, icon: QrCode },
  { metodo: 'Cartão de Crédito', valor: 18900, percentual: 27.6, icon: CreditCard },
  { metodo: 'Convênio', valor: 14200, percentual: 20.7, icon: Building2 },
  { metodo: 'Cartão de Débito', valor: 7800, percentual: 11.4, icon: CreditCard },
  { metodo: 'Dinheiro', valor: 5450, percentual: 8.0, icon: Banknote },
]

const mockFluxoResumo = {
  saldoAtual: 28460,
  projecaoSemana: -2400,
  variacaoSaldo: -8.2,
  contasReceberSemana: 18200,
  contasPagarSemana: 15800,
}

const mockFluxoAlertas = [
  { titulo: 'Semana 1 Fev', descricao: 'Saldo previsto -R$ 2.400', risco: 'alto' },
  { titulo: 'Contas a pagar', descricao: 'R$ 15.800 vencem em 7 dias', risco: 'medio' },
]

const mockInadimplenciaResumo = {
  total: 2800,
  pacientes: 5,
  maiorFaixa: '31-60 dias',
  tendencia: -12.4,
  ranking: [
    { nome: 'Roberto Lima', valor: 1400, faixa: '31-60' },
    { nome: 'Marcos Pereira', valor: 950, faixa: '90+' },
  ],
}

const mockRelatorioResumo = {
  receitaLiquida: 66400,
  custoServicos: 8900,
  despesas: 14480,
  lucroLiquido: 37260,
  margemLiquida: 54.5,
}

const unidades = ['Todas as unidades', 'Matriz', 'Savassi', 'Centro']

const agrupamentos = [
  { value: 'mes', label: 'Mensal' },
  { value: 'trimestre', label: 'Trimestral' },
  { value: 'ano', label: 'Anual' },
]

const mockTopDentistas = [
  { nome: 'Dr. Ricardo Almeida', especialidade: 'Implantodontia', receita: 24500, consultas: 52 },
  { nome: 'Dra. Camila Santos', especialidade: 'Ortodontia', receita: 19800, consultas: 48 },
  { nome: 'Dr. Felipe Oliveira', especialidade: 'Endodontia', receita: 14200, consultas: 45 },
  { nome: 'Dra. Ana Costa', especialidade: 'Estética', receita: 9950, consultas: 41 },
]

const mockTopProcedimentos = [
  { procedimento: 'Implante Unitário', quantidade: 18, receita: 11800, ticketMedio: 655.56 },
  { procedimento: 'Manutenção Ortodôntica', quantidade: 62, receita: 9300, ticketMedio: 150.00 },
  { procedimento: 'Clareamento a Laser', quantidade: 14, receita: 8400, ticketMedio: 600.00 },
  { procedimento: 'Restauração Classe II', quantidade: 45, receita: 6750, ticketMedio: 150.00 },
  { procedimento: 'Limpeza / Profilaxia', quantidade: 72, receita: 5400, ticketMedio: 75.00 },
]

export function VisaoGeral({ periodo }: VisaoGeralProps) {
  const maxReceita = Math.max(...mockReceitaMensal.map((m) => m.receita))
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(unidades[0])
  const [agrupamentoSelecionado, setAgrupamentoSelecionado] = useState(agrupamentos[0].value)
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Visão Geral Financeira</h1>
          <p className="text-muted-foreground">Panorama consolidado de todas as análises do período ({periodo}).</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={unidadeSelecionada} onValueChange={setUnidadeSelecionada}>
            <SelectTrigger className="w-full sm:w-48">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unidades.map((unidade) => (
                <SelectItem key={unidade} value={unidade}>
                  {unidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={agrupamentoSelecionado} onValueChange={setAgrupamentoSelecionado}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Agrupar por" />
            </SelectTrigger>
            <SelectContent>
              {agrupamentos.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Bruta</CardTitle>
            <div className="rounded-full p-2 bg-green-100 dark:bg-green-900">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockKPIs.receitaBruta)}</div>
            <p className="mt-1 flex items-center text-xs">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{mockKPIs.receitaVariacao}%</span>
              <span className="ml-1 text-muted-foreground">vs. mês anterior</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            <div className="rounded-full p-2 bg-red-100 dark:bg-red-900">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockKPIs.despesaTotal)}</div>
            <p className="mt-1 flex items-center text-xs">
              <ArrowDownRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">{mockKPIs.despesaVariacao}%</span>
              <span className="ml-1 text-muted-foreground">vs. mês anterior</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockKPIs.lucroLiquido)}</div>
            <p className="mt-1 flex items-center text-xs">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{mockKPIs.lucroVariacao}%</span>
              <span className="ml-1 text-muted-foreground">Margem: {mockKPIs.margemLiquida}%</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber</CardTitle>
            <div className="rounded-full p-2 bg-yellow-100 dark:bg-yellow-900">
              <Wallet className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockKPIs.aReceber)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{mockKPIs.aReceberQtd} parcelas pendentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Receita vs Despesa</CardTitle>
            <CardDescription>Evolução {agrupamentoSelecionado === 'mes' ? 'mensal' : 'consolidada'} dos últimos 6 períodos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-52">
              {mockReceitaMensal.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end justify-center" style={{ height: '180px' }}>
                    <div
                      className="flex-1 max-w-6 bg-green-500 rounded-t transition-all"
                      style={{ height: `${(item.receita / maxReceita) * 160}px` }}
                      title={`Receita: ${formatCurrency(item.receita)}`}
                    />
                    <div
                      className="flex-1 max-w-6 bg-red-400 rounded-t transition-all"
                      style={{ height: `${(item.despesa / maxReceita) * 160}px` }}
                      title={`Despesa: ${formatCurrency(item.despesa)}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.mes}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-green-500" />
                <span className="text-muted-foreground">Receita</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-red-400" />
                <span className="text-muted-foreground">Despesa</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas por Centro de Custo</CardTitle>
            <CardDescription>Distribuição do período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockDespesasPorCategoria.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${cat.cor}`} />
                    <span>{cat.categoria}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(cat.valor)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div className={`h-1.5 rounded-full ${cat.cor} transition-all`} style={{ width: `${cat.percentual}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita por Categoria</CardTitle>
            <CardDescription>Mix de faturamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockReceitaPorCategoria.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${cat.cor}`} />
                    <span>{cat.categoria}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(cat.valor)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div className={`h-1.5 rounded-full ${cat.cor} transition-all`} style={{ width: `${cat.percentual}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita por Método de Pagamento</CardTitle>
            <CardDescription>Comportamento de cobrança</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockReceitaPorMetodo.map((item, i) => {
              const Icon = item.icon
              const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-gray-500']
              return (
                <div key={item.metodo} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{item.metodo}</span>
                      <span>{formatCurrency(item.valor)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className={`h-1.5 rounded-full ${colors[i]} transition-all`} style={{ width: `${item.percentual}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{item.percentual}%</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita por Profissional</CardTitle>
            <CardDescription>Ranking de faturamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockTopDentistas.map((dentista, i) => (
              <div key={dentista.nome} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {i + 1}º
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{dentista.nome}</p>
                  <p className="text-xs text-muted-foreground">{dentista.especialidade} • {dentista.consultas} consultas</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(dentista.receita)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Procedimentos por Receita</CardTitle>
            <CardDescription>Procedimentos que mais geram faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTopProcedimentos.map((proc, i) => {
                const maxVal = mockTopProcedimentos[0].receita
                return (
                  <div key={proc.procedimento} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{proc.procedimento}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">{proc.quantidade}x</span>
                          <span className="text-xs text-muted-foreground">Ticket: {formatCurrency(proc.ticketMedio)}</span>
                          <span className="font-semibold">{formatCurrency(proc.receita)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${(proc.receita / maxVal) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Fluxo de Caixa
            </CardTitle>
            <CardDescription>Saldo atual e projeções</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Saldo Atual</p>
              <p className="text-2xl font-bold">{formatCurrency(mockFluxoResumo.saldoAtual)}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Próxima semana</span>
              <Badge variant="outline" className={mockFluxoResumo.projecaoSemana < 0 ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}>
                {formatCurrency(mockFluxoResumo.projecaoSemana)}
              </Badge>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span>Entradas previstas</span>
                <strong>{formatCurrency(mockFluxoResumo.contasReceberSemana)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Saídas previstas</span>
                <strong className="text-red-600">-{formatCurrency(mockFluxoResumo.contasPagarSemana)}</strong>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {mockFluxoAlertas.map((alerta) => (
                <div key={alerta.titulo} className="flex items-center justify-between rounded-md border p-2 text-muted-foreground">
                  <span>{alerta.titulo}</span>
                  <span className={alerta.risco === 'alto' ? 'text-red-600 font-medium' : alerta.risco === 'medio' ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                    {alerta.descricao}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" /> Inadimplência
            </CardTitle>
            <CardDescription>Monitoramento das cobranças</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Total em aberto</p>
              <p className="text-2xl font-bold">{formatCurrency(mockInadimplenciaResumo.total)}</p>
              <p className="text-xs text-muted-foreground">{mockInadimplenciaResumo.pacientes} pacientes • tendência {mockInadimplenciaResumo.tendencia}%</p>
            </div>
            <div className="space-y-2 text-sm">
              {mockInadimplenciaResumo.ranking.map((paciente) => (
                <div key={paciente.nome} className="flex items-center justify-between rounded-md border p-2">
                  <div>
                    <p className="font-medium">{paciente.nome}</p>
                    <p className="text-xs text-muted-foreground">Faixa {paciente.faixa}</p>
                  </div>
                  <span className="font-semibold text-red-600">{formatCurrency(paciente.valor)}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Iniciar cobranças inteligentes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileBarChart className="h-4 w-4 text-primary" /> Relatórios & DRE
            </CardTitle>
            <CardDescription>Resumo contábil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Receita líquida</span>
              <strong>{formatCurrency(mockRelatorioResumo.receitaLiquida)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Custo dos serviços</span>
              <strong className="text-red-600">-{formatCurrency(mockRelatorioResumo.custoServicos)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Despesas operacionais</span>
              <strong className="text-red-600">-{formatCurrency(mockRelatorioResumo.despesas)}</strong>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span>Lucro líquido</span>
              <strong>{formatCurrency(mockRelatorioResumo.lucroLiquido)}</strong>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Margem líquida {mockRelatorioResumo.margemLiquida}% • Exportações prontas em PDF/Excel
            </div>
            <Button variant="ghost" size="sm" className="px-0">
              Baixar DRE completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
