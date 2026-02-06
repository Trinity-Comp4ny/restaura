'use client'

import { useState } from 'react'
import {
  Download, FileText, TrendingUp, TrendingDown, DollarSign,
  BarChart3, PieChart, Users, Stethoscope, Calendar, Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

interface RelatoriosTabProps {
  periodo: string
}

const mockDRE = {
  receitaBruta: 68450.00,
  deducoes: 2050.00,
  receitaLiquida: 66400.00,
  custoServicos: 8900.00,
  lucroBruto: 57500.00,
  despesasOperacionais: {
    pessoal: 5000.00,
    infraestrutura: 5180.00,
    marketing: 1200.00,
    tecnologia: 299.00,
    servicos: 950.00,
    materiais: 1075.00,
    equipamentos: 450.00,
    outros: 326.00,
    total: 14480.00,
  },
  lucroOperacional: 43020.00,
  despesasFinanceiras: 680.00,
  lucroAntesTributos: 42340.00,
  impostos: 5080.00,
  lucroLiquido: 37260.00,
}

const mockPorDentista = [
  { nome: 'Dr. Ricardo Almeida', especialidade: 'Implantodontia', receita: 24500, despesa: 3200, lucro: 21300, consultas: 52, ticketMedio: 471.15, margemLucro: 86.9 },
  { nome: 'Dra. Camila Santos', especialidade: 'Ortodontia', receita: 19800, despesa: 2800, lucro: 17000, consultas: 48, ticketMedio: 412.50, margemLucro: 85.9 },
  { nome: 'Dr. Felipe Oliveira', especialidade: 'Endodontia', receita: 14200, despesa: 1900, lucro: 12300, consultas: 45, ticketMedio: 315.56, margemLucro: 86.6 },
  { nome: 'Dra. Ana Costa', especialidade: 'Estética', receita: 9950, despesa: 1000, lucro: 8950, consultas: 41, ticketMedio: 242.68, margemLucro: 89.9 },
]

const mockPorProcedimento = [
  { procedimento: 'Implante Unitário', categoria: 'Implantes', quantidade: 18, receita: 11800, custoMedio: 180, custoTotal: 3240, lucro: 8560, margemLucro: 72.5 },
  { procedimento: 'Manutenção Ortodôntica', categoria: 'Ortodontia', quantidade: 62, receita: 9300, custoMedio: 20, custoTotal: 1240, lucro: 8060, margemLucro: 86.7 },
  { procedimento: 'Clareamento a Laser', categoria: 'Estética', quantidade: 14, receita: 8400, custoMedio: 45, custoTotal: 630, lucro: 7770, margemLucro: 92.5 },
  { procedimento: 'Restauração Classe II', categoria: 'Procedimentos Gerais', quantidade: 45, receita: 6750, custoMedio: 25, custoTotal: 1125, lucro: 5625, margemLucro: 83.3 },
  { procedimento: 'Limpeza / Profilaxia', categoria: 'Procedimentos Gerais', quantidade: 72, receita: 5400, custoMedio: 10, custoTotal: 720, lucro: 4680, margemLucro: 86.7 },
  { procedimento: 'Tratamento de Canal', categoria: 'Endodontia', quantidade: 12, receita: 9600, custoMedio: 80, custoTotal: 960, lucro: 8640, margemLucro: 90.0 },
  { procedimento: 'Prótese sobre Implante', categoria: 'Implantes', quantidade: 8, receita: 8800, custoMedio: 350, custoTotal: 2800, lucro: 6000, margemLucro: 68.2 },
  { procedimento: 'Extração Simples', categoria: 'Cirurgia', quantidade: 22, receita: 4400, custoMedio: 15, custoTotal: 330, lucro: 4070, margemLucro: 92.5 },
]

const mockComparativoMensal = [
  { mes: 'Jul/24', receita: 42000, despesa: 18000, lucro: 24000, margem: 57.1 },
  { mes: 'Ago/24', receita: 48000, despesa: 19500, lucro: 28500, margem: 59.4 },
  { mes: 'Set/24', receita: 51000, despesa: 20000, lucro: 31000, margem: 60.8 },
  { mes: 'Out/24', receita: 55000, despesa: 21000, lucro: 34000, margem: 61.8 },
  { mes: 'Nov/24', receita: 59900, despesa: 23100, lucro: 36800, margem: 61.4 },
  { mes: 'Dez/24', receita: 68450, despesa: 22180, lucro: 46270, margem: 67.6 },
]

export function RelatoriosTab({ periodo }: RelatoriosTabProps) {
  const [subTab, setSubTab] = useState('dre')

  const margemBruta = ((mockDRE.lucroBruto / mockDRE.receitaBruta) * 100).toFixed(1)
  const margemOperacional = ((mockDRE.lucroOperacional / mockDRE.receitaBruta) * 100).toFixed(1)
  const margemLiquida = ((mockDRE.lucroLiquido / mockDRE.receitaBruta) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Ações */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Sub-tabs de relatórios */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="dre">
            <BarChart3 className="mr-2 h-4 w-4" />DRE
          </TabsTrigger>
          <TabsTrigger value="dentista">
            <Users className="mr-2 h-4 w-4" />Por Dentista
          </TabsTrigger>
          <TabsTrigger value="procedimento">
            <Stethoscope className="mr-2 h-4 w-4" />Por Procedimento
          </TabsTrigger>
          <TabsTrigger value="comparativo">
            <Calendar className="mr-2 h-4 w-4" />Comparativo
          </TabsTrigger>
        </TabsList>

        {/* DRE */}
        <TabsContent value="dre" className="mt-4 space-y-4">
          {/* Indicadores de margem */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Margem Bruta</p>
                <p className="text-3xl font-bold text-green-600">{margemBruta}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Margem Operacional</p>
                <p className="text-3xl font-bold text-blue-600">{margemOperacional}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Margem Líquida</p>
                <p className="text-3xl font-bold text-purple-600">{margemLiquida}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela DRE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Demonstrativo de Resultado do Exercício</CardTitle>
              <CardDescription>Período: {periodo}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  <TableRow className="bg-muted/30 font-semibold">
                    <TableCell>RECEITA BRUTA</TableCell>
                    <TableCell className="text-right">{formatCurrency(mockDRE.receitaBruta)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Deduções / Descontos</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.deducoes)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/20 font-medium">
                    <TableCell>= RECEITA LÍQUIDA</TableCell>
                    <TableCell className="text-right">{formatCurrency(mockDRE.receitaLiquida)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Custo dos Serviços Prestados</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.custoServicos)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-green-50 dark:bg-green-950 font-semibold">
                    <TableCell>= LUCRO BRUTO</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(mockDRE.lucroBruto)}</TableCell>
                  </TableRow>

                  <TableRow className="bg-muted/30 font-medium">
                    <TableCell>DESPESAS OPERACIONAIS</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.despesasOperacionais.total)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Pessoal</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.despesasOperacionais.pessoal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Infraestrutura</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.despesasOperacionais.infraestrutura)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Marketing</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.despesasOperacionais.marketing)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Materiais</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.despesasOperacionais.materiais)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Serviços</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.despesasOperacionais.servicos)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Tecnologia</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.despesasOperacionais.tecnologia)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Equipamentos</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.despesasOperacionais.equipamentos)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Outros</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.despesasOperacionais.outros)}</TableCell>
                  </TableRow>

                  <TableRow className="bg-blue-50 dark:bg-blue-950 font-semibold">
                    <TableCell>= LUCRO OPERACIONAL</TableCell>
                    <TableCell className="text-right text-blue-600">{formatCurrency(mockDRE.lucroOperacional)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Despesas Financeiras</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.despesasFinanceiras)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/20 font-medium">
                    <TableCell>= LUCRO ANTES DOS TRIBUTOS</TableCell>
                    <TableCell className="text-right">{formatCurrency(mockDRE.lucroAntesTributos)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">(-) Impostos</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockDRE.impostos)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-purple-50 dark:bg-purple-950 font-bold text-lg">
                    <TableCell>= LUCRO LÍQUIDO</TableCell>
                    <TableCell className="text-right text-purple-600">{formatCurrency(mockDRE.lucroLiquido)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Por Dentista */}
        <TabsContent value="dentista" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance por Profissional</CardTitle>
              <CardDescription>Receita, despesa e lucratividade por dentista</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead className="text-right">Consultas</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Despesa</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">Ticket Médio</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPorDentista.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{d.nome}</TableCell>
                      <TableCell><Badge variant="outline">{d.especialidade}</Badge></TableCell>
                      <TableCell className="text-right">{d.consultas}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(d.receita)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCurrency(d.despesa)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(d.lucro)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(d.ticketMedio)}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={d.margemLucro >= 85 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {d.margemLucro}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/30 font-bold">
                    <TableCell colSpan={2}>TOTAL</TableCell>
                    <TableCell className="text-right">{mockPorDentista.reduce((s, d) => s + d.consultas, 0)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(mockPorDentista.reduce((s, d) => s + d.receita, 0))}</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockPorDentista.reduce((s, d) => s + d.despesa, 0))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(mockPorDentista.reduce((s, d) => s + d.lucro, 0))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(mockPorDentista.reduce((s, d) => s + d.receita, 0) / mockPorDentista.reduce((s, d) => s + d.consultas, 0))}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Visual ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ranking de Receita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockPorDentista.map((d, i) => {
                const maxReceita = mockPorDentista[0].receita
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {i + 1}º
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{d.nome}</span>
                        <span className="font-semibold">{formatCurrency(d.receita)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${(d.receita / maxReceita) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Por Procedimento */}
        <TabsContent value="procedimento" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Análise por Procedimento</CardTitle>
              <CardDescription>Receita, custo e margem de lucro por tipo de procedimento</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Custo Médio</TableHead>
                    <TableHead className="text-right">Custo Total</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPorProcedimento.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.procedimento}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{p.categoria}</Badge></TableCell>
                      <TableCell className="text-right">{p.quantidade}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(p.receita)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(p.custoMedio)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCurrency(p.custoTotal)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(p.lucro)}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={p.margemLucro >= 85 ? 'bg-green-100 text-green-800' : p.margemLucro >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                          {p.margemLucro}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/30 font-bold">
                    <TableCell colSpan={2}>TOTAL</TableCell>
                    <TableCell className="text-right">{mockPorProcedimento.reduce((s, p) => s + p.quantidade, 0)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(mockPorProcedimento.reduce((s, p) => s + p.receita, 0))}</TableCell>
                    <TableCell />
                    <TableCell className="text-right text-red-600">-{formatCurrency(mockPorProcedimento.reduce((s, p) => s + p.custoTotal, 0))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(mockPorProcedimento.reduce((s, p) => s + p.lucro, 0))}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparativo Mensal */}
        <TabsContent value="comparativo" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução Mensal</CardTitle>
              <CardDescription>Comparativo de receita, despesa e lucro nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Visual bars */}
              <div className="space-y-4 mb-6">
                {mockComparativoMensal.map((m, i) => {
                  const maxVal = Math.max(...mockComparativoMensal.map(x => x.receita))
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-16 shrink-0">{m.mes}</span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-3 bg-green-500 rounded transition-all" style={{ width: `${(m.receita / maxVal) * 100}%` }} />
                          <span className="text-xs text-green-600 shrink-0">{formatCurrency(m.receita)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 bg-red-400 rounded transition-all" style={{ width: `${(m.despesa / maxVal) * 100}%` }} />
                          <span className="text-xs text-red-600 shrink-0">{formatCurrency(m.despesa)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 w-28">
                        <p className="text-sm font-semibold">{formatCurrency(m.lucro)}</p>
                        <p className="text-xs text-muted-foreground">Margem: {m.margem}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tabela */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Despesa</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockComparativoMensal.map((m, i) => {
                    const prev = i > 0 ? mockComparativoMensal[i - 1] : null
                    const variacao = prev ? (((m.lucro - prev.lucro) / prev.lucro) * 100).toFixed(1) : '-'
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{m.mes}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(m.receita)}</TableCell>
                        <TableCell className="text-right text-red-600">-{formatCurrency(m.despesa)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(m.lucro)}</TableCell>
                        <TableCell className="text-right">{m.margem}%</TableCell>
                        <TableCell className="text-right">
                          {variacao !== '-' ? (
                            <span className={Number(variacao) >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {Number(variacao) >= 0 ? '+' : ''}{variacao}%
                            </span>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
