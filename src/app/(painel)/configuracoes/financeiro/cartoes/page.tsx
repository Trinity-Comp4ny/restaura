'use client'

import { useState } from 'react'
import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, CreditCard, Edit, Trash2, Loader2, Search as SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCartoes, useCreateCartao, useUpdateCartao, useDeleteCartao } from '@/hooks/use-cartoes'
import { useUser, useClinica } from '@/hooks/use-user'
import { useContasBancarias } from '@/hooks/use-contas-bancarias'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/empty-state'
import { EmptyContasBancarias } from '@/components/ui/empty-contas-bancarias'

const bandeiras = [
  { value: 'visa', label: 'Visa', cor: 'bg-blue-600' },
  { value: 'mastercard', label: 'Mastercard', cor: 'bg-orange-600' },
  { value: 'elo', label: 'Elo', cor: 'bg-purple-600' },
  { value: 'hipercard', label: 'Hipercard', cor: 'bg-red-600' },
  { value: 'amex', label: 'Amex', cor: 'bg-green-600' }
]

export default function CartoesConfigPage() {
  const { data: user } = useUser()
  const { data: clinica } = useClinica()
  const router = useRouter()
  const clinicaId = user?.clinica_id

  const { data: cartoes, isLoading } = useCartoes(clinicaId)
  const { data: contasBancarias } = useContasBancarias()
  const createCartao = useCreateCartao()
  const updateCartao = useUpdateCartao()
  const deleteCartao = useDeleteCartao()

  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingCartao, setEditingCartao] = useState<any>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [novoCartao, setNovoCartao] = useState({
    nome: '',
    banco: '',
    ultimos_digitos: '',
    limite: '',
    dia_vencimento: '',
    dia_fechamento: '',
    is_corporativo: false,
    is_padrao: false,
    ativo: true,
    tipo_cartao: 'credito' as 'credito' | 'debito',
    conta_fatura_id: '' as string,
    conta_fatura_nome: '' // Novo campo para armazenar o nome exibido
  })

  const cartoesFiltrados = (cartoes || []).filter(c => 
    showInactive || c.ativo
  ).filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ultimos_digitos.includes(searchTerm)
  )

  // Função para formatar valor monetário automaticamente
  const formatarValorMonetario = (valor: string): string => {
    // Remove tudo que não é dígito
    const numeros = valor.replace(/\D/g, '')
    
    if (numeros === '') return ''
    
    // Converte para número e divide por 100 para colocar casas decimais
    const valorNumerico = parseInt(numeros) / 100
    
    // Formata com R$ na frente
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valorNumerico)
  }

  const handleNewCartao = () => {
    if (!clinicaId) {
      toast.error('Clínica não encontrada')
      return
    }
    setEditingCartao(null)
    setNovoCartao({
      nome: '',
      banco: '',
      ultimos_digitos: '',
      limite: '',
      dia_vencimento: '',
      dia_fechamento: '',
      is_corporativo: false,
      is_padrao: false,
      ativo: true,
      tipo_cartao: 'credito' as const,
      conta_fatura_id: '',
      conta_fatura_nome: ''
    })
    setShowNewDialog(true)
  }

  const handleEditCartao = (cartao: any) => {
    setEditingCartao(cartao)
    setNovoCartao({
      nome: cartao.nome,
      banco: cartao.banco,
      ultimos_digitos: cartao.ultimos_digitos,
      limite: cartao.limite?.toString() || '',
      dia_vencimento: cartao.dia_vencimento?.toString() || '',
      dia_fechamento: cartao.dia_fechamento?.toString() || '',
      is_corporativo: cartao.is_corporativo,
      is_padrao: cartao.is_padrao,
      ativo: cartao.ativo,
      tipo_cartao: cartao.tipo_cartao || 'credito' as const,
      conta_fatura_id: cartao.conta_fatura_id || '',
      conta_fatura_nome: contasBancarias?.find(c => c.id === cartao.conta_fatura_id)?.nome || ''
    })
    setShowNewDialog(true)
  }

  const handleSaveCartao = () => {
    if (!clinicaId) {
      toast.error('Clínica não encontrada')
      return
    }
    if (!novoCartao.ultimos_digitos || !novoCartao.conta_fatura_id) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    // Extrair valor numérico para salvar (remove R$ e formatação)
    const limiteNumerico = parseFloat((novoCartao.limite || '').toString().replace('R$', '').replace('.', '').replace(',', '.')) || 0

    const cartaoData = {
      clinica_id: clinicaId,
      nome: novoCartao.nome || (contasBancarias?.find(c => c.id === novoCartao.conta_fatura_id) 
        ? `Cartão de ${novoCartao.tipo_cartao === 'credito' ? 'Crédito' : 'Débito'} - ${contasBancarias.find(c => c.id === novoCartao.conta_fatura_id)!.nome}`
        : ''),
      banco: novoCartao.banco,
      ultimos_digitos: novoCartao.ultimos_digitos,
      limite: novoCartao.tipo_cartao === 'credito' ? limiteNumerico : 0,
      dia_vencimento: novoCartao.tipo_cartao === 'credito' ? (novoCartao.dia_vencimento ? parseInt(novoCartao.dia_vencimento.toString()) : null) : null,
      dia_fechamento: novoCartao.tipo_cartao === 'credito' ? (novoCartao.dia_fechamento ? parseInt(novoCartao.dia_fechamento.toString()) : null) : null,
      is_corporativo: novoCartao.is_corporativo,
      is_padrao: novoCartao.is_padrao,
      ativo: true,
      tipo_cartao: novoCartao.tipo_cartao,
      conta_fatura_id: novoCartao.conta_fatura_id || null
    }

    if (editingCartao) {
      updateCartao.mutate({
        id: editingCartao.id,
        ...cartaoData
      })
    } else {
      createCartao.mutate(cartaoData as any)
    }

    setShowNewDialog(false)
    setNovoCartao({
      nome: '',
      banco: '',
      ultimos_digitos: '',
      limite: '',
      dia_vencimento: '',
      dia_fechamento: '',
      is_corporativo: false,
      is_padrao: false,
      ativo: true,
      tipo_cartao: 'credito' as const,
      conta_fatura_id: '',
      conta_fatura_nome: ''
    })
  }

  const handleDeleteCartao = (id: string) => {
    deleteCartao.mutate(id)
    setConfirmDeleteId(null)
  }

  const getBandeiraCor = (bandeiraValue: string) => {
    const bandeira = bandeiras.find(b => b.value === bandeiraValue)
    return bandeira?.cor || 'bg-gray-600'
  }

  const formatarLimite = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
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
              <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito e Débito</h1>
              <p className="text-muted-foreground">
                Configure seus cartões corporativos e pessoais para pagamentos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleNewCartao}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cartão
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cartões de Crédito</p>
                <p className="text-2xl font-bold">
                  {cartoesFiltrados.filter(c => c.ativo && c.tipo_cartao === 'credito').length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cartões de Débito</p>
                <p className="text-2xl font-bold">
                  {cartoesFiltrados.filter(c => c.ativo && c.tipo_cartao === 'debito').length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Limite Total</p>
                <p className="text-2xl font-bold">
                  {formatarLimite(cartoesFiltrados
                    .filter(c => c.ativo && c.tipo_cartao === 'credito')
                    .reduce((sum: number, cartao: any) => sum + cartao.limite, 0))}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-800">💳</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cartões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista de Cartões */}
      {cartoesFiltrados.length === 0 ? (
        <EmptyState
          type="cartoes"
          onAction={handleNewCartao}
        />
      ) : (
        <div className="grid gap-4">
          {cartoesFiltrados.map((cartao) => (
          <Card key={cartao.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getBandeiraCor(cartao.banco.toLowerCase())}`}>
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{cartao.nome}</h4>
                      {cartao.is_corporativo && (
                        <Badge variant="outline" className="text-xs">
                          Corporativo
                        </Badge>
                      )}
                      {!cartao.ativo && (
                        <Badge variant="outline" className="text-gray-500">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      **** {cartao.ultimos_digitos}
                      {cartao.tipo_cartao === 'credito' && (
                        <>
                          {' '}• Fechamento: {cartao.dia_fechamento} • Vencimento: {cartao.dia_vencimento}
                        </>
                      )}
                    </p>
                    {cartao.tipo_cartao === 'credito' ? (
                      <p className="text-sm text-muted-foreground">
                        Limite: {formatarLimite(cartao.limite)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Débito instantâneo
                      </p>
                    )}
                    {cartao.conta_fatura_id && (
                      <p className="text-sm text-muted-foreground">
                        Conta: {contasBancarias?.find(c => c.id === cartao.conta_fatura_id)?.nome || 'Não encontrada'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditCartao(cartao)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setConfirmDeleteId(cartao.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Dialog Novo/Edit Cartão */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                novoCartao.is_corporativo ? 'bg-purple-500' : 'bg-blue-500'
              }`} />
              <div>
                <DialogTitle>
                  {editingCartao ? 'Editar Cartão' : 'Novo Cartão'}
                </DialogTitle>
                <DialogDescription>
                  {editingCartao 
                    ? 'Atualize os dados do seu cartão'
                    : 'Configure um novo cartão para pagamentos'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Tipo do Cartão</Label>
                <Select 
                  value={novoCartao.tipo_cartao} 
                  onValueChange={(value: string) => {
                    const novoTipo = value as 'credito' | 'debito'
                    const contaSelecionada = contasBancarias?.find(c => c.id === novoCartao.conta_fatura_id)
                    setNovoCartao({ 
                      ...novoCartao, 
                      tipo_cartao: novoTipo,
                      nome: contaSelecionada ? `Cartão de ${novoTipo === 'credito' ? 'Crédito' : 'Débito'} - ${contaSelecionada.nome}` : '',
                      banco: contaSelecionada?.banco || '',
                      limite: '',
                      dia_vencimento: '',
                      dia_fechamento: ''
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credito">Crédito</SelectItem>
                    <SelectItem value="debito">Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Conta Bancária</Label>
                {contasBancarias && contasBancarias.length > 0 ? (
                  <Select 
                    value={novoCartao.conta_fatura_nome} 
                    onValueChange={(value) => {
                      const contaSelecionada = contasBancarias.find(c => c.nome === value)
                      setNovoCartao({ 
                        ...novoCartao, 
                        conta_fatura_id: contaSelecionada?.id || '',
                        conta_fatura_nome: value,
                        nome: contaSelecionada ? `Cartão de ${novoCartao.tipo_cartao === 'credito' ? 'Crédito' : 'Débito'} - ${contaSelecionada.nome}` : '',
                        banco: contaSelecionada?.banco || ''
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder="Selecione a conta bancária"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {contasBancarias.map((conta) => (
                        <SelectItem key={conta.id} value={conta.nome}>
                          {conta.nome} ({conta.banco})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <EmptyContasBancarias tipo="cartao" />
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Últimos 4 Dígitos</Label>
                <Input 
                  placeholder="Ex: 4532" 
                  maxLength={4}
                  value={novoCartao.ultimos_digitos}
                  onChange={(e) => setNovoCartao({ ...novoCartao, ultimos_digitos: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              {novoCartao.tipo_cartao === 'credito' && (
                <div>
                  <Label>Limite (R$)</Label>
                  <Input 
                    placeholder="R$ 0,00"
                    value={novoCartao.limite}
                    onChange={(e) => {
                      const valorFormatado = formatarValorMonetario(e.target.value)
                      setNovoCartao({ ...novoCartao, limite: valorFormatado })
                    }}
                  />
                </div>
              )}
            </div>
            {novoCartao.tipo_cartao === 'credito' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Dia de Fechamento</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={31}
                    placeholder="25"
                    value={novoCartao.dia_fechamento || ''}
                    onChange={(e) => setNovoCartao({ ...novoCartao, dia_fechamento: e.target.value })}
                    onFocus={(e) => {
                      if (!e.target.value) {
                        setNovoCartao({ ...novoCartao, dia_fechamento: '' })
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Dia de Vencimento</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={31}
                    placeholder="10"
                    value={novoCartao.dia_vencimento || ''}
                    onChange={(e) => setNovoCartao({ ...novoCartao, dia_vencimento: e.target.value })}
                    onFocus={(e) => {
                      if (!e.target.value) {
                        setNovoCartao({ ...novoCartao, dia_vencimento: '' })
                      }
                    }}
                  />
                </div>
              </div>
            )}
            {novoCartao.tipo_cartao === 'credito' && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-sm">Cartão corporativo?</Label>
                  <p className="text-xs text-muted-foreground">
                    Cartões corporativos têm tratamento fiscal diferente
                  </p>
                </div>
                <Switch
                  checked={novoCartao.is_corporativo}
                  onCheckedChange={(checked) => setNovoCartao({ ...novoCartao, is_corporativo: checked })}
                />
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Definir como cartão padrão?</Label>
                <p className="text-xs text-muted-foreground">
                  Usado automaticamente em novas transações
                </p>
              </div>
              <Switch
                checked={novoCartao.is_padrao}
                onCheckedChange={(checked) => setNovoCartao({ ...novoCartao, is_padrao: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCartao}>
              {editingCartao ? 'Atualizar' : 'Criar'} Cartão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão de cartão */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O cartão será desativado e não aparecerá mais nas listas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => confirmDeleteId && handleDeleteCartao(confirmDeleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
