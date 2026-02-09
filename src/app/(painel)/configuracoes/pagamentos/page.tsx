'use client'

import { useState } from 'react'
import {
  Plus, Edit, Trash2, CreditCard, Banknote, Building2, Smartphone, QrCode,
  Wallet, Settings, Star, Check, AlertCircle, TrendingUp, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

interface ContaBancaria {
  id: string
  nome: string
  banco: string
  agencia: string
  conta: string
  tipo: 'conta_corrente' | 'poupanca' | 'caixa_fisico'
  saldo: number
  isPadrao: boolean
  ativa: boolean
}

interface MetodoPagamento {
  id: string
  nome: string
  tipo: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'transferencia' | 'boleto'
  taxas: {
    percentual: number
    fixa: number
  }
  prazoDeposito: number
  adquirente?: string
  contaVinculada?: string
  isPadrao: boolean
  ativo: boolean
}

interface CartaoCredito {
  id: string
  nome: string
  banco: string
  ultimosDigitos: string
  limite: number
  diaVencimento: number
  diaFechamento: number
  isCorporativo: boolean
  contaFatura: string
  isPadrao: boolean
  ativo: boolean
}

const mockContas: ContaBancaria[] = [
  {
    id: '1',
    nome: 'Banco Inter PJ - Conta Principal',
    banco: 'Banco Inter',
    agencia: '0001',
    conta: '12345678-9',
    tipo: 'conta_corrente',
    saldo: 28460.00,
    isPadrao: true,
    ativa: true
  },
  {
    id: '2',
    nome: 'Itaú - Conta Secundária',
    banco: 'Itaú Unibanco',
    agencia: '1234-5',
    conta: '98765-4',
    tipo: 'conta_corrente',
    saldo: 8500.00,
    isPadrao: false,
    ativa: true
  },
  {
    id: '3',
    nome: 'Caixa Físico',
    banco: '',
    agencia: '',
    conta: '',
    tipo: 'caixa_fisico',
    saldo: 1250.00,
    isPadrao: false,
    ativa: true
  }
]

const mockMetodos: MetodoPagamento[] = [
  {
    id: '1',
    nome: 'PIX - Banco Inter',
    tipo: 'pix',
    taxas: { percentual: 0, fixa: 0 },
    prazoDeposito: 0,
    contaVinculada: '1',
    isPadrao: true,
    ativo: true
  },
  {
    id: '2',
    nome: 'Cartão de Crédito - Stripe',
    tipo: 'cartao_credito',
    taxas: { percentual: 2.99, fixa: 0.50 },
    prazoDeposito: 30,
    adquirente: 'Stripe',
    contaVinculada: '1',
    isPadrao: false,
    ativo: true
  },
  {
    id: '3',
    nome: 'Cartão de Crédito - Rede',
    tipo: 'cartao_credito',
    taxas: { percentual: 3.49, fixa: 0.80 },
    prazoDeposito: 25,
    adquirente: 'Rede',
    contaVinculada: '2',
    isPadrao: false,
    ativo: true
  }
]

const mockCartoes: CartaoCredito[] = [
  {
    id: '1',
    nome: 'Cartão Corporativo Inter',
    banco: 'Banco Inter',
    ultimosDigitos: '4532',
    limite: 10000.00,
    diaVencimento: 10,
    diaFechamento: 25,
    isCorporativo: true,
    contaFatura: '1',
    isPadrao: true,
    ativo: true
  }
]

export default function PagamentosConfigPage() {
  const [activeTab, setActiveTab] = useState('metodos')
  const [showNewMetodoDialog, setShowNewMetodoDialog] = useState(false)
  const [showNewContaDialog, setShowNewContaDialog] = useState(false)
  const [showNewCartaoDialog, setShowNewCartaoDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const handleNewMetodo = () => {
    setEditingItem(null)
    setShowNewMetodoDialog(true)
  }

  const handleEditMetodo = (metodo: MetodoPagamento) => {
    setEditingItem(metodo)
    setShowNewMetodoDialog(true)
  }

  const getIconByTipo = (tipo: string) => {
    const IconComponent = (() => {
      switch (tipo) {
        case 'pix': return QrCode
        case 'cartao_credito': return CreditCard
        case 'cartao_debito': return CreditCard
        case 'dinheiro': return Banknote
        case 'transferencia': return ArrowUpRight
        default: return Wallet
      }
    })()
    return <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  }

  const totalContas = mockContas.reduce((sum, conta) => sum + conta.saldo, 0)
  const totalTaxasMes = mockMetodos.reduce((sum, metodo) => {
    // Simulação de volume mensal
    const volumeMensal = metodo.tipo === 'cartao_credito' ? 15000 : 8000
    return sum + (volumeMensal * metodo.taxas.percentual / 100) + metodo.taxas.fixa * 100
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formas de Pagamento</h1>
          <p className="text-muted-foreground">
            Configure métodos de pagamento aceitos na sua clínica
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Métodos Ativos</p>
                <p className="text-2xl font-bold">{mockMetodos.filter(m => m.ativo).length}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Média</p>
                <p className="text-2xl font-bold">
                  {(mockMetodos.reduce((sum, m) => sum + m.taxas.percentual, 0) / mockMetodos.length).toFixed(2)}%
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Método Padrão</p>
                <p className="text-2xl font-bold">
                  {mockMetodos.find(m => m.isPadrao)?.nome || 'Não definido'}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-800">★</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Mensal Estimada</p>
                <p className="text-2xl font-bold">R$ {totalTaxasMes.toLocaleString('pt-BR')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Métodos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Métodos de Pagamento</h3>
            <p className="text-sm text-muted-foreground">
              Formas de recebimento configuradas para a clínica
            </p>
          </div>
          <Button onClick={handleNewMetodo}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Método
          </Button>
        </div>

        <div className="grid gap-4">
          {mockMetodos.map((metodo) => (
            <Card key={metodo.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      {getIconByTipo(metodo.tipo)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{metodo.nome}</h4>
                        {metodo.isPadrao && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            <Star className="mr-1 h-3 w-3" />
                            Padrão
                          </Badge>
                        )}
                        {!metodo.ativo && (
                          <Badge variant="outline" className="text-gray-500">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {metodo.tipo === 'pix' && 'Pagamento instantâneo'}
                        {metodo.tipo === 'cartao_credito' && `Taxa: ${metodo.taxas.percentual}% + R$${metodo.taxas.fixa}`}
                        {metodo.tipo === 'cartao_debito' && 'Débito na hora'}
                        {metodo.tipo === 'dinheiro' && 'Pagamento em espécie'}
                        {metodo.tipo === 'transferencia' && `Prazo: ${metodo.prazoDeposito} dias`}
                        {metodo.tipo === 'boleto' && `Prazo: ${metodo.prazoDeposito} dias`}
                      </p>
                      {metodo.adquirente && (
                        <p className="text-sm text-muted-foreground">
                          Adquirente: {metodo.adquirente}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditMetodo(metodo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog Nova Conta */}
      <Dialog open={showNewContaDialog} onOpenChange={setShowNewContaDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
            </DialogTitle>
            <DialogDescription>
              Cadastre contas bancárias para gerenciar o fluxo financeiro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome da Conta</Label>
                <Input placeholder="Ex: Banco Inter PJ - Conta Principal" />
              </div>
              <div>
                <Label>Tipo de Conta</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conta_corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Poupança</SelectItem>
                    <SelectItem value="caixa_fisico">Caixa Físico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Banco</Label>
                <Input placeholder="Ex: Banco Inter" />
              </div>
              <div>
                <Label>Agência</Label>
                <Input placeholder="0001" />
              </div>
              <div>
                <Label>Conta</Label>
                <Input placeholder="12345678-9" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Saldo Inicial</Label>
                <Input type="number" placeholder="0,00" step="0.01" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-sm">Definir como conta padrão?</Label>
                  <p className="text-xs text-muted-foreground">
                    Usada automaticamente em novas transações
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewContaDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowNewContaDialog(false)}>
              {editingItem ? 'Atualizar' : 'Criar'} Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Novo Método */}
      <Dialog open={showNewMetodoDialog} onOpenChange={setShowNewMetodoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento'}
            </DialogTitle>
            <DialogDescription>
              Configure maquininhas, PIX e outras formas de recebimento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome do Método</Label>
                <Input placeholder="Ex: Cartão de Crédito - Stripe" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Adquirente (se aplicável)</Label>
                <Input placeholder="Ex: Stripe, Mercado Pago, Rede" />
              </div>
              <div>
                <Label>Conta Bancária Vinculada</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockContas.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Taxa Percentual (%)</Label>
                <Input type="number" placeholder="2.99" step="0.01" min="0" max="100" />
              </div>
              <div>
                <Label>Taxa Fixa (R$)</Label>
                <Input type="number" placeholder="0.50" step="0.01" min="0" />
              </div>
              <div>
                <Label>Prazo Depósito (dias)</Label>
                <Input type="number" placeholder="30" min="0" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Definir como método padrão?</Label>
                <p className="text-xs text-muted-foreground">
                  Usado automaticamente para novas receitas
                </p>
              </div>
              <Switch />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMetodoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowNewMetodoDialog(false)}>
              {editingItem ? 'Atualizar' : 'Criar'} Método
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Novo Cartão */}
      <Dialog open={showNewCartaoDialog} onOpenChange={setShowNewCartaoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Cartão de Crédito' : 'Novo Cartão de Crédito'}
            </DialogTitle>
            <DialogDescription>
              Cadastre cartões corporativos ou pessoais para despesas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome do Cartão</Label>
                <Input placeholder="Ex: Cartão Corporativo Inter" />
              </div>
              <div>
                <Label>Banco Emissor</Label>
                <Input placeholder="Ex: Banco Inter" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Últimos 4 dígitos</Label>
                <Input placeholder="4532" maxLength={4} />
              </div>
              <div>
                <Label>Limite Total</Label>
                <Input type="number" placeholder="10000.00" step="0.01" />
              </div>
              <div>
                <Label>Conta da Fatura</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockContas.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Dia de Vencimento</Label>
                <Input type="number" placeholder="10" min="1" max="31" />
              </div>
              <div>
                <Label>Dia de Fechamento da Fatura</Label>
                <Input type="number" placeholder="25" min="1" max="31" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Cartão Corporativo?</Label>
                <p className="text-xs text-muted-foreground">
                  Cartão da empresa para despesas operacionais
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Definir como cartão padrão?</Label>
                <p className="text-xs text-muted-foreground">
                  Usado automaticamente para novas despesas
                </p>
              </div>
              <Switch />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCartaoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowNewCartaoDialog(false)}>
              {editingItem ? 'Atualizar' : 'Criar'} Cartão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
