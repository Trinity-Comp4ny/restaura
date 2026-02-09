'use client'

import { useState } from 'react'
import { CreditCard, Calendar, AlertTriangle, CheckCircle, TrendingUp, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CartaoCredito, 
  TransacaoParcelada,
  calcularDataVencimentoFatura,
  verificarFaturaDaCompra,
  calcularLimiteDisponivel,
  verificarAprovacaoCompra,
  gerarDatasParcelas,
  gerarResumoFatura,
  formatarValor
} from '@/lib/financeiro-utils'

// Mock de dados para demonstração
const mockCartoes: CartaoCredito[] = [
  {
    id: '1',
    nome: 'Cartão Corporativo Inter',
    banco: 'Banco Inter',
    ultimosDigitos: '4532',
    limite: 10000,
    diaVencimento: 10,
    diaFechamento: 25,
    isCorporativo: true,
    contaFatura: '1',
    isPadrao: true,
    ativo: true
  },
  {
    id: '2',
    nome: 'Cartão Corporativo BB',
    banco: 'Banco do Brasil',
    ultimosDigitos: '7890',
    limite: 5000,
    diaVencimento: 15,
    diaFechamento: 5,
    isCorporativo: true,
    contaFatura: '2',
    isPadrao: false,
    ativo: true
  }
]

const mockTransacoes: TransacaoParcelada[] = [
  {
    id: '1',
    descricao: 'MacBook Pro 14"',
    valorTotal: 12000,
    valorParcela: 2400,
    totalParcelas: 5,
    parcelaAtual: 2,
    dataCompra: new Date('2024-01-10'),
    dataPrimeiraParcela: new Date('2024-02-10'),
    cartaoId: '1',
    status: 'ativa'
  },
  {
    id: '2',
    descricao: 'Cadeira Ergonômica',
    valorTotal: 1500,
    valorParcela: 500,
    totalParcelas: 3,
    parcelaAtual: 1,
    dataCompra: new Date('2024-01-20'),
    dataPrimeiraParcela: new Date('2024-02-20'),
    cartaoId: '1',
    status: 'ativa'
  }
]

export function CartaoParcelasDemo() {
  const [cartaoSelecionado, setCartaoSelecionado] = useState<string>('1')
  const [valorCompra, setValorCompra] = useState<number>(0)
  const [parcelas, setParcelas] = useState<number>(1)
  const [dataCompra, setDataCompra] = useState<string>(new Date().toISOString().split('T')[0])
  
  const cartao = mockCartoes.find(c => c.id === cartaoSelecionado)!
  
  // Calcular valores atuais
  const mesAnoAtual = '2024-02'
  const valorFaturaAtual = mockTransacoes
    .filter(t => t.cartaoId === cartaoSelecionado && t.status === 'ativa')
    .reduce((total, t) => total + t.valorParcela, 0)
  
  const valorParcelasFuturas = mockTransacoes
    .filter(t => t.cartaoId === cartaoSelecionado && t.status === 'ativa')
    .reduce((total, t) => {
      const parcelasRestantes = t.totalParcelas - t.parcelaAtual
      return total + (t.valorParcela * parcelasRestantes)
    }, 0)
  
  const { limiteTotal, limiteUtilizado, limiteDisponivel, percentualUtilizado } = 
    calcularLimiteDisponivel(cartao, valorFaturaAtual, valorParcelasFuturas)
  
  // Simular nova compra
  const dataCompraObj = new Date(dataCompra)
  const { faturaMes, isProximaFatura } = verificarFaturaDaCompra(cartao, dataCompraObj)
  const dataVencimento = calcularDataVencimentoFatura(cartao, dataCompraObj)
  const valorParcela = valorCompra / parcelas
  const datasParcelas = gerarDatasParcelas(dataCompraObj, parcelas)
  
  const { aprovada, motivo } = verificarAprovacaoCompra(
    cartao,
    valorCompra,
    valorFaturaAtual,
    valorParcelasFuturas
  )
  
  // Resumo da fatura
  const resumoFatura = gerarResumoFatura(cartao, mesAnoAtual, mockTransacoes)
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cartão Selecionado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cartão Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Cartão</Label>
              <Select value={cartaoSelecionado} onValueChange={setCartaoSelecionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockCartoes.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome} **** {c.ultimosDigitos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Limite Total</span>
                <span className="font-medium">{formatarValor(cartao.limite)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Utilizado</span>
                <span className="font-medium text-red-600">{formatarValor(limiteUtilizado)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Disponível</span>
                <span className="font-medium text-green-600">{formatarValor(limiteDisponivel)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    percentualUtilizado > 80 ? 'bg-red-500' : 
                    percentualUtilizado > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentualUtilizado, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {percentualUtilizado.toFixed(1)}% do limite utilizado
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Vencimento:</span>
                <span>Todo dia {cartao.diaVencimento}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fechamento:</span>
                <span>Todo dia {cartao.diaFechamento}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Simulação de Compra */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Simular Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Valor da Compra</Label>
              <Input 
                type="number" 
                placeholder="0,00" 
                step="0.01"
                value={valorCompra}
                onChange={(e) => setValorCompra(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label>Parcelas</Label>
              <Select value={parcelas.toString()} onValueChange={(v) => setParcelas(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 10, 12].map(p => (
                    <SelectItem key={p} value={p.toString()}>
                      {p}x de {formatarValor(valorCompra / p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Data da Compra</Label>
              <Input 
                type="date" 
                value={dataCompra}
                onChange={(e) => setDataCompra(e.target.value)}
              />
            </div>
            
            {valorCompra > 0 && (
              <div className={`p-3 rounded-lg ${
                aprovada ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {aprovada ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    aprovada ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {aprovada ? 'Compra Aprovada' : 'Compra Não Aprovada'}
                  </span>
                </div>
                {motivo && (
                  <p className={`text-xs mt-1 ${
                    aprovada ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {motivo}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Detalhes da Compra */}
      {valorCompra > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalhes da Compra Parcelada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Informações da Fatura</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fatura:</span>
                    <span>{faturaMes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vencimento:</span>
                    <span>{dataVencimento.toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período:</span>
                    <span>
                      {isProximaFatura ? 'Próxima fatura' : 'Fatura atual'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Resumo das Parcelas</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Total:</span>
                    <span className="font-medium">{formatarValor(valorCompra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor da Parcela:</span>
                    <span className="font-medium">{formatarValor(valorParcela)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de Parcelas:</span>
                    <span>{parcelas}x</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Calendário de Parcelas */}
            <div>
              <h4 className="font-semibold mb-2">Calendário de Vencimentos</h4>
              <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
                {datasParcelas.map((data, index) => (
                  <div key={index} className="p-2 border rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Parcela {index + 1}</div>
                    <div className="text-sm font-medium">
                      {data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatarValor(valorParcela)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Resumo da Fatura Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo da Fatura Atual
          </CardTitle>
          <CardDescription>
            {resumoFatura.periodo} - Vence em {resumoFatura.vencimento.toLocaleDateString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatarValor(resumoFatura.valorTotal)}</div>
              <div className="text-sm text-muted-foreground">Valor Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{resumoFatura.numeroTransacoes}</div>
              <div className="text-sm text-muted-foreground">Transações</div>
            </div>
            <div className="text-center">
              <Badge className={
                resumoFatura.status === 'aberta' ? 'bg-green-100 text-green-800' :
                resumoFatura.status === 'fechada' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {resumoFatura.status === 'aberta' ? 'Aberta' :
                 resumoFatura.status === 'fechada' ? 'Fechada' : 'Vencida'}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Status</div>
            </div>
          </div>
          
          {/* Transações da Fatura */}
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Transações na Fatura</h4>
            <div className="space-y-2">
              {mockTransacoes
                .filter(t => t.cartaoId === cartaoSelecionado)
                .map(transacao => (
                  <div key={transacao.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{transacao.descricao}</div>
                      <div className="text-sm text-muted-foreground">
                        {transacao.parcelaAtual}/{transacao.totalParcelas} parcelas
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatarValor(transacao.valorParcela)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transacao.dataPrimeiraParcela).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
