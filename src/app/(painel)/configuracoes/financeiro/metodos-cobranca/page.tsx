'use client'

import { useState } from 'react'
import { 
  Plus, Edit, Trash2, CreditCard, Banknote, Building2, Smartphone, QrCode,
  Wallet, Settings, Star, Check, AlertCircle, TrendingDown, ArrowUpDown, ArrowDownRight, Loader2, Info, ArrowLeft
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
import { useMetodosCobranca, useCreateMetodoCobranca, useUpdateMetodoCobranca, useDeleteMetodoCobranca, useSetMetodoCobrancaPadrao, MetodoCobranca } from '@/hooks/use-metodos-cobranca'
import { useContasBancarias, useCreateContaBancaria, useUpdateContaBancaria, useDeleteContaBancaria, ContaBancaria } from '@/hooks/use-contas-bancarias'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { EmptyDropdown } from '@/components/ui/empty-dropdown'
import { useRouter } from 'next/navigation'

export default function PagamentosConfigPage() {
  const [activeTab, setActiveTab] = useState('metodos')
  const { data: user } = useUser()
  const clinicaId = user?.clinica_id
  const router = useRouter()
  
  const { data: metodos = [], isLoading: isLoadingMetodos } = useMetodosCobranca(clinicaId)
  const { data: contas = [], isLoading: isLoadingContas } = useContasBancarias()
  
  const createMetodo = useCreateMetodoCobranca()
  const updateMetodo = useUpdateMetodoCobranca()
  const deleteMetodo = useDeleteMetodoCobranca()
  const setPadrao = useSetMetodoCobrancaPadrao()
  
  const [showNewMetodoDialog, setShowNewMetodoDialog] = useState(false)
  const [showNewContaDialog, setShowNewContaDialog] = useState(false)
  const [showNewCartaoDialog, setShowNewCartaoDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // Estado para o formulário
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    contexto: '',
    adquirente: '',
    conta_vinculada: '',
    taxaPercentual: '',
    taxaFixa: '',
    prazo_deposito: '',
    forma_pagamento: '',
    fornecedor_padrao: '',
    is_padrao: false
  })

  const handleNewMetodoReceita = () => {
    setEditingItem(null)
    setFormData({
      nome: '',
      tipo: '',
      contexto: 'receita',
      adquirente: '',
      conta_vinculada: '',
      taxaPercentual: '',
      taxaFixa: '',
      prazo_deposito: '',
      forma_pagamento: '',
      fornecedor_padrao: '',
      is_padrao: false
    })
    setShowNewMetodoDialog(true)
  }

  const handleDeleteMetodo = (id: string) => {
    deleteMetodo.mutate(id)
  }

  const handleEditMetodo = (metodo: any) => {
    setEditingItem(metodo)
    setFormData({
      nome: metodo.nome || '',
      tipo: metodo.tipo || '',
      contexto: 'receita',
      adquirente: metodo.adquirente || '',
      conta_vinculada: metodo.conta_vinculada_id || '',
      taxaPercentual: metodo.taxas_percentual?.toString() || '',
      taxaFixa: metodo.taxas_fixa?.toString() || '',
      prazo_deposito: metodo.prazo_deposito?.toString() || '',
      forma_pagamento: metodo.forma_pagamento || '',
      fornecedor_padrao: metodo.fornecedor_padrao || '',
      is_padrao: metodo.is_padrao || false
    })
    setShowNewMetodoDialog(true)
  }

  const handleSaveMetodo = () => {
    if (!clinicaId) {
      toast.error('Erro: Usuário não vinculado a uma clínica')
      return
    }

    if (!formData.nome || !formData.tipo) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    const metodoData = {
      clinica_id: clinicaId,
      nome: formData.nome,
      tipo: formData.tipo as any,
      taxas_percentual: parseFloat(formData.taxaPercentual) || 0,
      taxas_fixa: parseFloat(formData.taxaFixa) || 0,
      prazo_deposito: parseInt(formData.prazo_deposito) || 0,
      adquirente: formData.adquirente || null,
      conta_vinculada_id: formData.conta_vinculada || null,
      is_padrao: formData.is_padrao,
      ativo: true
    }

    if (editingItem) {
      updateMetodo.mutate({
        id: editingItem.id,
        ...metodoData
      } as any)
    } else {
      createMetodo.mutate(metodoData as any)
    }

    setShowNewMetodoDialog(false)
    setEditingItem(null)
    setFormData({
      nome: '',
      tipo: '',
      contexto: '',
      adquirente: '',
      conta_vinculada: '',
      taxaPercentual: '',
      taxaFixa: '',
      prazo_deposito: '',
      forma_pagamento: '',
      fornecedor_padrao: '',
      is_padrao: false
    })
  }

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'pix': return <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case 'cartao_credito': return <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case 'cartao_debito': return <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case 'dinheiro': return <Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case 'transferencia': return <ArrowUpDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      default: return <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const totalContas = contas.reduce((sum: number, conta: any) => sum + (conta.saldo || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Métodos de Cobrança</h1>
            <p className="text-muted-foreground">
              Configure métodos de cobrança para receber dos clientes com taxas personalizadas
            </p>
          </div>
        </div>
      </div>


      {/* Lista de Métodos */}
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={handleNewMetodoReceita} data-onboarding="novo-metodo-cobranca">
            <Plus className="mr-2 h-4 w-4" />
            Novo Método
          </Button>
        </div>

        <div className="grid gap-4">
          {metodos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900">
                    <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Nenhum método de cobrança configurado
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Configure métodos de cobrança para receber dos clientes com taxas personalizadas. 
                      Adicione PIX, cartões de crédito e outras métodos de cobrança.
                    </p>
                  </div>
                  <Button onClick={handleNewMetodoReceita}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Método
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            metodos.map((metodo: any) => (
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
                          {metodo.is_padrao && (
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
                          {metodo.tipo === 'cartao_credito' && `Taxa: ${metodo.taxas_percentual}% + R$${metodo.taxas_fixa}`}
                          {metodo.tipo === 'cartao_debito' && `Taxa: ${metodo.taxas_percentual}%`}
                          {metodo.tipo === 'dinheiro' && 'Pagamento em espécie'}
                          {metodo.tipo === 'transferencia' && `Prazo: ${metodo.prazo_deposito} dias`}
                          {metodo.tipo === 'boleto' && `Taxa: ${metodo.taxas_percentual}% + R$${metodo.taxas_fixa}`}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMetodo(metodo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
              {editingItem ? 'Editar Método de Cobrança' : 'Novo Método de Cobrança'}
            </DialogTitle>
            <DialogDescription>
              Configure maquininhas, PIX e outras formas de cobrar clientes com taxas personalizadas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome do Método</Label>
                <Input 
                  placeholder="Ex: Cartão de Crédito Pessoal" 
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo de Pagamento</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                    <SelectItem value="boleto">Boleto Bancário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Adquirente (se aplicável)</Label>
                  <Input 
                    placeholder="Ex: Stripe, Mercado Pago, Rede" 
                    value={formData.adquirente}
                    onChange={(e) => setFormData({ ...formData, adquirente: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Conta Bancária Vinculada</Label>
                  <Select value={formData.conta_vinculada} onValueChange={(value) => setFormData({ ...formData, conta_vinculada: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {contas.map((conta: any) => (
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
                  <Input 
                    type="number" 
                    placeholder="2.99" 
                    step="0.01" 
                    min="0" 
                    max="100"
                    value={formData.taxaPercentual}
                    onChange={(e) => setFormData({ ...formData, taxaPercentual: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Taxa Fixa (R$)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.50" 
                    step="0.01" 
                    min="0"
                    value={formData.taxaFixa}
                    onChange={(e) => setFormData({ ...formData, taxaFixa: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Prazo Depósito (dias)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    min="0" 
                    max="30"
                    value={formData.prazo_deposito}
                    onChange={(e) => setFormData({ ...formData, prazo_deposito: e.target.value })}
                  />
                </div>
              </div>
            </>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Definir como método padrão?</Label>
                <p className="text-xs text-muted-foreground">
                  Usado automaticamente para novas receitas
                </p>
              </div>
              <Switch 
                checked={formData.is_padrao}
                onCheckedChange={(checked) => setFormData({ ...formData, is_padrao: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMetodoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMetodo}>
              {editingItem ? 'Atualizar Método' : 'Criar Método'}
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
                    {contas.map((conta: any) => (
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
