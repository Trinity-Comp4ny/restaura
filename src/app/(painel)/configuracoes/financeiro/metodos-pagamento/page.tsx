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
import { useMetodosPagamento, useCreateMetodoPagamento, useUpdateMetodoPagamento, useDeleteMetodoPagamento } from '@/hooks/use-metodos-pagamento'
import { useContasBancarias } from '@/hooks/use-contas-bancarias'
import { useCartoes } from '@/hooks/use-cartoes'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { EmptyDropdown } from '@/components/ui/empty-dropdown'
import { useRouter } from 'next/navigation'

export default function MetodosPagamentoConfigPage() {
  const { data: user } = useUser()
  const clinicaId = user?.clinica_id
  const router = useRouter()
  
  const { data: metodos = [], isLoading: isLoadingMetodos } = useMetodosPagamento(clinicaId)
  const { data: contas = [], isLoading: isLoadingContas } = useContasBancarias()
  const { data: cartoes = [] } = useCartoes(clinicaId)
  
  const cartoesAtivos = cartoes.filter((c: any) => c.ativo)
  
  const createMetodo = useCreateMetodoPagamento()
  const updateMetodo = useUpdateMetodoPagamento()
  const deleteMetodo = useDeleteMetodoPagamento()
  
  const [showNewMetodoDialog, setShowNewMetodoDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // Estado para o formulário
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    adquirente: '',
    conta_vinculada: '',
    cartao_id: '',
    is_padrao: false
  })

  // Tipos que precisam de conta bancária
  const tiposComConta = ['pix', 'transferencia', 'boleto', 'debito_automatico']
  // Tipos que precisam de cartão
  const tiposComCartao = ['cartao_credito', 'cartao_debito']
  // Tipo sem vínculo
  const tiposSemVinculo = ['dinheiro']

  const handleNewMetodo = () => {
    setEditingItem(null)
    setFormData({
      nome: '',
      tipo: '',
      adquirente: '',
      conta_vinculada: '',
      cartao_id: '',
      is_padrao: false
    })
    setShowNewMetodoDialog(true)
  }

  const handleEditMetodo = (metodo: any) => {
    setEditingItem(metodo)
    setFormData({
      nome: metodo.nome || '',
      tipo: metodo.tipo || '',
      adquirente: metodo.adquirente || '',
      conta_vinculada: metodo.conta_vinculada_id || '',
      cartao_id: metodo.cartao_id || '',
      is_padrao: metodo.is_padrao || false
    })
    setShowNewMetodoDialog(true)
  }

  const handleSaveMetodo = () => {
    if (!clinicaId || clinicaId === '' || clinicaId === 'undefined') {
      toast.error('Erro: Usuário não vinculado a uma clínica. Faça login novamente.')
      return
    }

    if (!formData.nome || !formData.tipo) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    // Se é cartão, buscar a conta vinculada do cartão selecionado
    let contaVinculadaId = formData.conta_vinculada || null
    if (tiposComCartao.includes(formData.tipo) && formData.cartao_id) {
      const cartaoSelecionado = cartoesAtivos.find((c: any) => c.id === formData.cartao_id)
      if (cartaoSelecionado) {
        contaVinculadaId = cartaoSelecionado.conta_fatura_id || null
      }
    }

    const metodoData = {
      clinica_id: clinicaId,
      nome: formData.nome,
      tipo: formData.tipo as any,
      taxas_percentual: 0,
      taxas_fixa: 0,
      prazo_deposito: 0,
      adquirente: formData.adquirente || null,
      conta_vinculada_id: contaVinculadaId,
      cartao_id: tiposComCartao.includes(formData.tipo) ? (formData.cartao_id || null) : null,
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
      adquirente: '',
      conta_vinculada: '',
      cartao_id: '',
      is_padrao: false
    })
  }

  const handleDelete = (id: string) => {
    deleteMetodo.mutate(id)
  }

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'pix': return <QrCode className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'transferencia': return <ArrowUpDown className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'boleto': return <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'debito_automatico': return <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'cartao_credito': return <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case 'cartao_debito': return <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'dinheiro': return <Banknote className="h-5 w-5 text-green-600 dark:text-green-400" />
      default: return <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
    }
  }

  const getDescricaoTipo = (tipo: string) => {
    switch (tipo) {
      case 'pix': return 'Pagamento instantâneo'
      case 'transferencia': return 'Transferência bancária'
      case 'boleto': return 'Boleto bancário'
      case 'debito_automatico': return 'Débito automático'
      case 'cartao_credito': return 'Cartão de crédito'
      case 'cartao_debito': return 'Cartão de débito'
      case 'dinheiro': return 'Pagamento em espécie'
      default: return tipo
    }
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Métodos de Pagamento</h1>
            <p className="text-muted-foreground">
              Configure métodos de pagamento para despesas e pagamentos a fornecedores
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Métodos */}
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={handleNewMetodo} data-onboarding="novo-metodo-pagamento">
            <Plus className="mr-2 h-4 w-4" />
            Novo Método
          </Button>
        </div>

        <div className="grid gap-4">
          {metodos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-green-100 dark:bg-green-900">
                    <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Nenhum método de pagamento configurado
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Configure métodos de pagamento para despesas e pagamentos a fornecedores. 
                      Adicione transferências, boletos, débito automático e outros métodos.
                    </p>
                  </div>
                  <Button onClick={handleNewMetodo}>
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
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
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
                          {getDescricaoTipo(metodo.tipo)}
                        </p>
                        {metodo.cartao_id && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            Cartão: {cartoesAtivos.find((c: any) => c.id === metodo.cartao_id)?.nome || 'Não encontrado'}
                          </p>
                        )}
                        {metodo.conta_vinculada_id && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Conta: {contas.find((c: any) => c.id === metodo.conta_vinculada_id)?.nome || 'Não encontrada'}
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
                        onClick={() => handleDelete(metodo.id)}
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

      {/* Dialog Novo Método */}
      <Dialog open={showNewMetodoDialog} onOpenChange={setShowNewMetodoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento'}
            </DialogTitle>
            <DialogDescription>
              Configure métodos para pagar fornecedores. As taxas já estão inclusas no valor das despesas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Passo 1: Tipo de Pagamento */}
            <div>
              <Label>Tipo de Pagamento *</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => {
                  // Ao trocar o tipo, limpar campos condicionais e auto-preencher nome
                  const nomesTipo: Record<string, string> = {
                    pix: 'PIX',
                    transferencia: 'Transferência Bancária',
                    boleto: 'Boleto Bancário',
                    debito_automatico: 'Débito Automático',
                    cartao_credito: '',
                    cartao_debito: '',
                    dinheiro: 'Dinheiro'
                  }
                  setFormData({ 
                    ...formData, 
                    tipo: value, 
                    nome: editingItem ? formData.nome : nomesTipo[value] || '',
                    cartao_id: '',
                    conta_vinculada: '',
                    adquirente: ''
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-green-600" />
                      PIX
                    </div>
                  </SelectItem>
                  <SelectItem value="transferencia">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-blue-600" />
                      Transferência Bancária
                    </div>
                  </SelectItem>
                  <SelectItem value="boleto">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                      Boleto Bancário
                    </div>
                  </SelectItem>
                  <SelectItem value="debito_automatico">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      Débito Automático
                    </div>
                  </SelectItem>
                  <SelectItem value="cartao_credito">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      Cartão de Crédito
                    </div>
                  </SelectItem>
                  <SelectItem value="cartao_debito">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      Cartão de Débito
                    </div>
                  </SelectItem>
                  <SelectItem value="dinheiro">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-green-600" />
                      Dinheiro
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Passo 2: Campos condicionais baseados no tipo */}
            {tiposComCartao.includes(formData.tipo) && (
              <>
                {/* CARTÃO: Selecionar cartão já cadastrado */}
                <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                    <CreditCard className="h-4 w-4" />
                    Vincular a um cartão cadastrado
                  </div>
                  {cartoesAtivos.filter((c: any) => 
                    formData.tipo === 'cartao_credito' ? c.tipo_cartao === 'credito' : c.tipo_cartao === 'debito'
                  ).length > 0 ? (
                    <Select 
                      value={formData.cartao_id} 
                      onValueChange={(value) => {
                        const cartao = cartoesAtivos.find((c: any) => c.id === value)
                        if (cartao) {
                          const contaVinculada = contas.find((c: any) => c.id === cartao.conta_fatura_id)
                          setFormData({ 
                            ...formData, 
                            cartao_id: value,
                            nome: cartao.nome,
                            adquirente: cartao.banco || '',
                            conta_vinculada: cartao.conta_fatura_id || ''
                          })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cartão">
                          {formData.cartao_id ? (() => {
                            const cartao = cartoesAtivos.find((c: any) => c.id === formData.cartao_id)
                            return cartao ? `${cartao.nome} (**** ${cartao.ultimos_digitos})` : ''
                          })() : ''}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {cartoesAtivos
                          .filter((c: any) => formData.tipo === 'cartao_credito' ? c.tipo_cartao === 'credito' : c.tipo_cartao === 'debito')
                          .map((cartao: any) => {
                            const contaNome = contas.find((c: any) => c.id === cartao.conta_fatura_id)?.nome
                            return (
                              <SelectItem key={cartao.id} value={cartao.id}>
                                {cartao.nome} (**** {cartao.ultimos_digitos})
                              </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-3 rounded-md border border-dashed p-3 bg-background">
                      <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Nenhum cartão de {formData.tipo === 'cartao_credito' ? 'crédito' : 'débito'} cadastrado
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/configuracoes/financeiro/cartoes')}
                      >
                        Cadastrar Cartão
                      </Button>
                    </div>
                  )}
                  {formData.cartao_id && (() => {
                    const cartao = cartoesAtivos.find((c: any) => c.id === formData.cartao_id)
                    const conta = contas.find((c: any) => c.id === cartao?.conta_fatura_id)
                    return conta ? (
                      <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 mt-2">
                        <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">
                          Conta Bancária Vinculada
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-300">
                          <div className="font-medium">{conta.nome}</div>
                          {conta.banco && <div className="text-xs">{conta.banco}</div>}
                          {(conta.agencia || conta.conta) && (
                            <div className="text-xs mt-1">
                              {conta.agencia && `Agência: ${conta.agencia}`}
                              {conta.agencia && conta.conta && ' • '}
                              {conta.conta && `Conta: ${conta.conta}`}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-600" />
                        Conta bancária vinculada automaticamente via cartão
                      </div>
                    )
                  })()}
                </div>
              </>
            )}

            {tiposComConta.includes(formData.tipo) && (
              <>
                {/* PIX/TRANSFERÊNCIA/BOLETO/DÉBITO: Selecionar conta bancária */}
                <div className="rounded-lg border bg-green-50/50 dark:bg-green-950/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                    <Building2 className="h-4 w-4" />
                    Vincular a uma conta bancária
                  </div>
                  {contas.length > 0 ? (
                    <Select 
                      value={formData.conta_vinculada} 
                      onValueChange={(value) => {
                        const conta = contas.find((c: any) => c.id === value)
                        if (conta) {
                          const tipoLabel = formData.tipo === 'pix' ? 'PIX' 
                            : formData.tipo === 'transferencia' ? 'Transferência'
                            : formData.tipo === 'boleto' ? 'Boleto'
                            : 'Débito Automático'
                          setFormData({ 
                            ...formData, 
                            conta_vinculada: value,
                            nome: `${tipoLabel} - ${conta.nome}`,
                            adquirente: conta.banco || ''
                          })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta bancária" />
                      </SelectTrigger>
                      <SelectContent>
                        {contas.map((conta: any) => (
                          <SelectItem key={conta.id} value={conta.id}>
                            <div className="flex flex-col">
                              <span>{conta.nome}</span>
                              {conta.banco && (
                                <span className="text-xs text-muted-foreground">{conta.banco}{conta.agencia ? ` • Ag: ${conta.agencia}` : ''}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-3 rounded-md border border-dashed p-3 bg-background">
                      <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Nenhuma conta bancária cadastrada
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/configuracoes/financeiro/contas')}
                      >
                        Cadastrar Conta
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {formData.tipo === 'dinheiro' && (
              <div className="rounded-lg border bg-yellow-50/50 dark:bg-yellow-950/20 p-4">
                <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
                  <Banknote className="h-4 w-4" />
                  Pagamento em espécie — sem vínculo com conta bancária ou cartão
                </div>
              </div>
            )}

            {/* Nome do Método (editável, mas auto-preenchido) */}
            {formData.tipo && (
              <>
                <div>
                  <Label>Nome do Método *</Label>
                  <Input 
                    placeholder="Nome será preenchido automaticamente" 
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Preenchido automaticamente, mas você pode personalizar
                  </p>
                </div>

                                
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm">Definir como método padrão?</Label>
                    <p className="text-xs text-muted-foreground">
                      Usado automaticamente para novas despesas
                    </p>
                  </div>
                  <Switch 
                    checked={formData.is_padrao}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_padrao: checked })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMetodoDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveMetodo}
              disabled={!formData.tipo || !formData.nome || 
                (tiposComCartao.includes(formData.tipo) && !formData.cartao_id) ||
                (tiposComConta.includes(formData.tipo) && !formData.conta_vinculada)
              }
            >
              {editingItem ? 'Atualizar Método' : 'Criar Método'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
