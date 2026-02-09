'use client'

import { useState } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  Calendar, AlertTriangle, CheckCircle, Clock, Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatCurrency } from '@/lib/utils'

interface FluxoCaixaTabProps {
  periodo: string
}

const mockFluxoResumo = {
  saldoAtual: 28460,
  projecaoSemana: -2400,
  variacaoSaldo: -8.2,
  contasReceberSemana: 18200,
  contasPagarSemana: 15800,
}

const mockFluxoAlertas: { titulo: string; descricao: string; risco: 'alto' | 'medio' | 'baixo' }[] = [
  { titulo: 'Semana 1 Fev', descricao: 'Saldo previsto -R$ 2.400', risco: 'alto' },
  { titulo: 'Contas a pagar', descricao: 'R$ 15.800 vencem em 7 dias', risco: 'medio' },
]

const mockFluxoDiario = [
  { data: '2024-01-15', entradas: 4850.00, saidas: 890.00, saldo: 3960.00, saldoAcumulado: 28460.00 },
  { data: '2024-01-14', entradas: 1550.00, saidas: 4500.00, saldo: -2950.00, saldoAcumulado: 24500.00 },
  { data: '2024-01-13', entradas: 2800.00, saidas: 280.00, saldo: 2520.00, saldoAcumulado: 27450.00 },
  { data: '2024-01-12', entradas: 3200.00, saidas: 2200.00, saldo: 1000.00, saldoAcumulado: 24930.00 },
  { data: '2024-01-11', entradas: 950.00, saidas: 680.00, saldo: 270.00, saldoAcumulado: 23930.00 },
  { data: '2024-01-10', entradas: 2100.00, saidas: 1499.00, saldo: 601.00, saldoAcumulado: 23660.00 },
  { data: '2024-01-09', entradas: 1800.00, saidas: 450.00, saldo: 1350.00, saldoAcumulado: 23059.00 },
  { data: '2024-01-08', entradas: 600.00, saidas: 299.00, saldo: 301.00, saldoAcumulado: 21709.00 },
  { data: '2024-01-07', entradas: 0.00, saidas: 185.00, saldo: -185.00, saldoAcumulado: 21408.00 },
  { data: '2024-01-05', entradas: 4500.00, saidas: 950.00, saldo: 3550.00, saldoAcumulado: 21593.00 },
]

const mockFluxoMensal = [
  { periodo: 'Jul/24', entradas: 42000.00, saidas: 18000.00, saldo: 24000.00 },
  { periodo: 'Ago/24', entradas: 48000.00, saidas: 19500.00, saldo: 28500.00 },
  { periodo: 'Set/24', entradas: 51000.00, saidas: 20000.00, saldo: 31000.00 },
  { periodo: 'Out/24', entradas: 55000.00, saidas: 21000.00, saldo: 34000.00 },
  { periodo: 'Nov/24', entradas: 59900.00, saidas: 23100.00, saldo: 36800.00 },
  { periodo: 'Dez/24', entradas: 68450.00, saidas: 22180.00, saldo: 46270.00 },
]

const mockFluxoAnual = [
  { periodo: '2022', entradas: 410000.00, saidas: 255000.00, saldo: 155000.00 },
  { periodo: '2023', entradas: 520000.00, saidas: 315000.00, saldo: 205000.00 },
  { periodo: '2024', entradas: 582000.00, saidas: 332000.00, saldo: 250000.00 },
]

const mockProjecao = [
  { semana: 'Sem 3 (15-21 Jan)', entradasPrevistas: 8200.00, saidasPrevistas: 3500.00, saldoPrevisto: 4700.00 },
  { semana: 'Sem 4 (22-28 Jan)', entradasPrevistas: 7800.00, saidasPrevistas: 5200.00, saldoPrevisto: 2600.00 },
  { semana: 'Sem 1 Fev (29-04)', entradasPrevistas: 6500.00, saidasPrevistas: 8900.00, saldoPrevisto: -2400.00 },
  { semana: 'Sem 2 Fev (05-11)', entradasPrevistas: 9100.00, saidasPrevistas: 4100.00, saldoPrevisto: 5000.00 },
]

const mockContasAPagar = [
  { id: '1', descricao: 'Aluguel - Fevereiro', valor: 4500.00, vencimento: '2024-02-10', categoria: 'Infraestrutura', status: 'a_vencer' },
  { id: '2', descricao: 'Salário - Recepcionista', valor: 2800.00, vencimento: '2024-02-05', categoria: 'Pessoal', status: 'a_vencer' },
  { id: '3', descricao: 'Salário - Auxiliar', valor: 2200.00, vencimento: '2024-02-05', categoria: 'Pessoal', status: 'a_vencer' },
  { id: '4', descricao: 'Contador - Honorários', valor: 950.00, vencimento: '2024-02-05', categoria: 'Serviços', status: 'a_vencer' },
  { id: '5', descricao: 'Manutenção Autoclave', valor: 450.00, vencimento: '2024-01-25', categoria: 'Equipamentos', status: 'proximo' },
]

const mockContasAReceber = [
  { id: '1', descricao: 'Implante - Maria Silva (2/3)', valor: 3500.00, vencimento: '2024-02-15', paciente: 'Maria Silva', status: 'a_vencer' },
  { id: '2', descricao: 'Prótese - Lucia Ferreira (2/4)', valor: 2800.00, vencimento: '2024-02-13', paciente: 'Lucia Ferreira', status: 'a_vencer' },
  { id: '3', descricao: 'Canal - Fernanda Souza', valor: 800.00, vencimento: '2024-01-25', paciente: 'Fernanda Souza', status: 'proximo' },
  { id: '4', descricao: 'Ortodontia - Carlos Santos', valor: 150.00, vencimento: '2024-02-15', paciente: 'Carlos Santos', status: 'a_vencer' },
]

const visaoConfigs = {
  diario: {
    titulo: 'Fluxo de Caixa Diário',
    descricao: 'Entradas e saídas por dia',
    data: mockFluxoDiario.map((item) => ({
      label: formatDate(item.data),
      entradas: item.entradas,
      saidas: item.saidas,
      saldo: item.saldo,
    })),
  },
  semanal: {
    titulo: 'Fluxo de Caixa Semanal',
    descricao: 'Projeção das próximas semanas',
    data: mockProjecao.map((item) => ({
      label: item.semana,
      entradas: item.entradasPrevistas,
      saidas: item.saidasPrevistas,
      saldo: item.saldoPrevisto,
    })),
  },
  mensal: {
    titulo: 'Fluxo de Caixa Mensal',
    descricao: 'Entradas e saídas consolidadas por mês',
    data: mockFluxoMensal.map((item) => ({
      label: item.periodo,
      entradas: item.entradas,
      saidas: item.saidas,
      saldo: item.saldo,
    })),
  },
  anual: {
    titulo: 'Fluxo de Caixa Anual',
    descricao: 'Visão macro por ano fiscal',
    data: mockFluxoAnual.map((item) => ({
      label: item.periodo,
      entradas: item.entradas,
      saidas: item.saidas,
      saldo: item.saldo,
    })),
  },
} as const

export function FluxoCaixaTab({ periodo }: FluxoCaixaTabProps) {
  const [visao, setVisao] = useState<keyof typeof visaoConfigs>('diario')
  const [mostrarInsights, setMostrarInsights] = useState(true)

  const saldoAtual = mockFluxoDiario[0].saldoAcumulado
  const totalEntradas = mockFluxoDiario.reduce((s, d) => s + d.entradas, 0)
  const totalSaidas = mockFluxoDiario.reduce((s, d) => s + d.saidas, 0)
  const totalAPagar = mockContasAPagar.reduce((s, c) => s + c.valor, 0)
  const totalAReceber = mockContasAReceber.reduce((s, c) => s + c.valor, 0)
  const visaoAtual = visaoConfigs[visao]
  const maxVal = Math.max(
    ...visaoAtual.data.map((d) => Math.max(d.entradas, d.saidas)),
    1
  )

  return (
    <div className="space-y-6">
      {/* Alerta de projeção negativa */}
      {mockProjecao.some(p => p.saldoPrevisto < 0) && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Atenção: projeção de saldo negativo na semana de {mockProjecao.find(p => p.saldoPrevisto < 0)?.semana}
              </p>
              <p className="text-xs text-yellow-600">Considere antecipar recebimentos ou postergar pagamentos</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saldo Atual</p>
            <p className="text-2xl font-bold">{formatCurrency(saldoAtual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Entradas (período)</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saídas (período)</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">A Receber</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAReceber)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">A Pagar</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalAPagar)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Insights rápidos</h3>
        <Button variant="ghost" size="sm" onClick={() => setMostrarInsights((prev) => !prev)}>
          {mostrarInsights ? 'Ocultar' : 'Mostrar'} análises
        </Button>
      </div>

      {mostrarInsights && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resultado projetado</CardTitle>
              <CardDescription>Próximas 2 semanas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Entradas previstas</span>
                <strong>{formatCurrency(mockFluxoResumo.contasReceberSemana)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Saídas previstas</span>
                <strong className="text-red-600">-{formatCurrency(mockFluxoResumo.contasPagarSemana)}</strong>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                Última variação semanal: {mockFluxoResumo.variacaoSaldo}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Alertas críticos</CardTitle>
              <CardDescription>Observe o planejamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {mockFluxoAlertas.map((alerta) => (
                <div key={alerta.titulo} className="flex items-center justify-between rounded-md border p-2">
                  <div>
                    <p className="font-medium">{alerta.titulo}</p>
                    <p className="text-xs text-muted-foreground">{alerta.descricao}</p>
                  </div>
                  <Badge variant="outline" className={alerta.risco === 'alto' ? 'text-red-600 border-red-200' : alerta.risco === 'medio' ? 'text-orange-600 border-orange-200' : 'text-green-600 border-green-200'}>
                    {alerta.risco}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico Fluxo Diário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{visaoAtual.titulo}</CardTitle>
              <CardDescription>{visaoAtual.descricao}</CardDescription>
            </div>
            <Select value={visao} onValueChange={(value) => setVisao(value as keyof typeof visaoConfigs)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diário</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {visaoAtual.data.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 shrink-0">{item.label}</span>
                <div className="flex-1 flex items-center gap-1 h-6">
                  <div className="flex-1 flex justify-end">
                    <div
                      className="h-5 bg-green-500 rounded-l transition-all"
                      style={{ width: `${(item.entradas / maxVal) * 100}%` }}
                      title={`Entradas: ${formatCurrency(item.entradas)}`}
                    />
                  </div>
                  <div className="w-px h-6 bg-border shrink-0" />
                  <div className="flex-1">
                    <div
                      className="h-5 bg-red-400 rounded-r transition-all"
                      style={{ width: `${(item.saidas / maxVal) * 100}%` }}
                      title={`Saídas: ${formatCurrency(item.saidas)}`}
                    />
                  </div>
                </div>
                <span className={`text-xs font-medium w-24 text-right ${item.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.saldo >= 0 ? '+' : ''}{formatCurrency(item.saldo)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-green-500" />
              <span className="text-muted-foreground">Entradas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-red-400" />
              <span className="text-muted-foreground">Saídas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projeção + Contas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Projeção */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Projeção Semanal
            </CardTitle>
            <CardDescription>Previsão baseada em parcelas e recorrências</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semana</TableHead>
                  <TableHead className="text-right">Entradas</TableHead>
                  <TableHead className="text-right">Saídas</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProjecao.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium">{p.semana}</TableCell>
                    <TableCell className="text-right text-sm text-green-600">{formatCurrency(p.entradasPrevistas)}</TableCell>
                    <TableCell className="text-right text-sm text-red-600">{formatCurrency(p.saidasPrevistas)}</TableCell>
                    <TableCell className={`text-right text-sm font-semibold ${p.saldoPrevisto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {p.saldoPrevisto >= 0 ? '+' : ''}{formatCurrency(p.saldoPrevisto)}
                      {p.saldoPrevisto < 0 && <AlertTriangle className="inline ml-1 h-3 w-3" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Contas a Pagar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              Próximas Contas a Pagar
            </CardTitle>
            <CardDescription>Vencimentos próximos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockContasAPagar.map((conta) => (
              <div key={conta.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{conta.descricao}</p>
                  <p className="text-xs text-muted-foreground">{conta.categoria} • Venc: {formatDate(conta.vencimento)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {conta.status === 'proximo' && <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Próximo</Badge>}
                  <span className="text-sm font-semibold text-red-600">-{formatCurrency(conta.valor)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Contas a Receber */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            Próximas Contas a Receber
          </CardTitle>
          <CardDescription>Parcelas e pagamentos esperados</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockContasAReceber.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium text-sm">{conta.descricao}</TableCell>
                  <TableCell className="text-sm">{conta.paciente}</TableCell>
                  <TableCell className="text-sm">{formatDate(conta.vencimento)}</TableCell>
                  <TableCell>
                    {conta.status === 'proximo'
                      ? <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Próximo</Badge>
                      : <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">A Vencer</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">+{formatCurrency(conta.valor)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
