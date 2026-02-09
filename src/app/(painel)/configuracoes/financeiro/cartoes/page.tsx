'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, CreditCard, Eye, EyeOff, Search, Calendar, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NavigationBreadcrumb, BackButton } from '@/components/ui/navigation-breadcrumb'

// Mock data - em produção viria do backend
const mockCartoes = [
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
    ativo: true,
    tipo: 'credito' as const
  },
  {
    id: '2',
    nome: 'Cartão Pessoal - Visa',
    banco: 'NuBank',
    ultimosDigitos: '7890',
    limite: 5000.00,
    diaVencimento: 15,
    diaFechamento: 5,
    isCorporativo: false,
    contaFatura: '2',
    isPadrao: false,
    ativo: true,
    tipo: 'credito' as const
  },
  {
    id: '3',
    nome: 'Cartão Débito Inter',
    banco: 'Banco Inter',
    ultimosDigitos: '1234',
    limite: 0,
    diaVencimento: null,
    diaFechamento: null,
    isCorporativo: false,
    contaFatura: '2',
    isPadrao: false,
    ativo: true,
    tipo: 'debito' as const
  },
  {
    id: '4',
    nome: 'Cartão Débito Santander',
    banco: 'Santander',
    ultimosDigitos: '5678',
    limite: 0,
    diaVencimento: null,
    diaFechamento: null,
    isCorporativo: false,
    contaFatura: '3',
    isPadrao: false,
    ativo: true,
    tipo: 'debito' as const
  }
]

const bandeiras = [
  { value: 'visa', label: 'Visa', cor: 'bg-blue-600' },
  { value: 'mastercard', label: 'Mastercard', cor: 'bg-orange-600' },
  { value: 'elo', label: 'Elo', cor: 'bg-purple-600' },
  { value: 'hipercard', label: 'Hipercard', cor: 'bg-red-600' },
  { value: 'amex', label: 'Amex', cor: 'bg-green-600' }
]

export default function CartoesConfigPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingCartao, setEditingCartao] = useState<any>(null)
  const [novoCartao, setNovoCartao] = useState({
    nome: '',
    banco: '',
    ultimosDigitos: '',
    limite: 0,
    diaVencimento: 10,
    diaFechamento: 25,
    isCorporativo: false,
    isPadrao: false,
    ativo: true,
    tipo: 'credito' as 'credito' | 'debito'
  })

  const cartoesFiltrados = mockCartoes.filter(c => 
    showInactive || c.ativo
  ).filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ultimosDigitos.includes(searchTerm)
  )

  const handleNewCartao = () => {
    setEditingCartao(null)
    setNovoCartao({
      nome: '',
      banco: '',
      ultimosDigitos: '',
      limite: 0,
      diaVencimento: 10,
      diaFechamento: 25,
      isCorporativo: false,
      isPadrao: false,
      ativo: true,
      tipo: 'credito' as const
    })
    setShowNewDialog(true)
  }

  const handleEditCartao = (cartao: any) => {
    setEditingCartao(cartao)
    setNovoCartao({
      nome: cartao.nome,
      banco: cartao.banco,
      ultimosDigitos: cartao.ultimosDigitos,
      limite: cartao.limite,
      diaVencimento: cartao.diaVencimento,
      diaFechamento: cartao.diaFechamento,
      isCorporativo: cartao.isCorporativo,
      isPadrao: cartao.isPadrao,
      ativo: cartao.ativo,
      tipo: cartao.tipo || 'credito' as const
    })
    setShowNewDialog(true)
  }

  const handleSaveCartao = () => {
    // Em produção, salvar no backend
    console.log('Salvando cartão:', novoCartao)
    setShowNewDialog(false)
    setNovoCartao({
      nome: '',
      banco: '',
      ultimosDigitos: '',
      limite: 0,
      diaVencimento: 10,
      diaFechamento: 25,
      isCorporativo: false,
      isPadrao: false,
      ativo: true,
      tipo: 'credito' as const
    })
  }

  const handleToggleAtivo = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Toggle ativo:', id)
  }

  const handleDeleteCartao = (id: string) => {
    // Em produção, deletar no backend
    console.log('Delete cartão:', id)
  }

  const handleDefinirPadrao = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Definir como padrão:', id)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <NavigationBreadcrumb
          items={[
            { label: 'Financeiro', href: '/configuracoes/financeiro' },
            { label: 'Cartões', href: '/configuracoes/financeiro/cartoes' }
          ]}
          current="/configuracoes/financeiro/cartoes"
        />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito e Débito</h1>
            <p className="text-muted-foreground">
              Configure seus cartões corporativos e pessoais para pagamentos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <span className="text-sm">Mostrar inativos</span>
            </div>
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
                  {cartoesFiltrados.filter(c => c.ativo && c.tipo === 'credito').length}
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
                  {cartoesFiltrados.filter(c => c.ativo && c.tipo === 'debito').length}
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
                    .filter(c => c.ativo && c.tipo === 'credito')
                    .reduce((sum: number, cartao: any) => sum + cartao.limite, 0))}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-800">💳</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-600">Cartão Padrão</p>
                <p className="text-2xl font-bold">
                  {cartoesFiltrados.find((c: any) => c.isPadrao)?.nome || 'Não definido'}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-800">★</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cartões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista de Cartões */}
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
                      <Badge variant="outline" className="text-xs">
                        {cartao.banco}
                      </Badge>
                      <Badge 
                        variant={cartao.tipo === 'credito' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {cartao.tipo === 'credito' ? 'Crédito' : 'Débito'}
                      </Badge>
                      {cartao.isCorporativo && (
                        <Badge variant="outline" className="text-xs">
                          Corporativo
                        </Badge>
                      )}
                      {cartao.isPadrao && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          <span className="text-xs font-bold text-yellow-800">★</span>
                          Padrão
                        </Badge>
                      )}
                      {!cartao.ativo && (
                        <Badge variant="outline" className="text-gray-500">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      **** {cartao.ultimosDigitos}
                      {cartao.tipo === 'credito' && (
                        <>
                          {' '}• Vencimento: {cartao.diaVencimento} • Fechamento: {cartao.diaFechamento}
                        </>
                      )}
                    </p>
                    {cartao.tipo === 'credito' ? (
                      <p className="text-sm text-muted-foreground">
                        Limite: {formatarLimite(cartao.limite)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Débito instantâneo
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
                    onClick={() => handleToggleAtivo(cartao.id)}
                  >
                    {cartao.ativo ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCartao(cartao)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleAtivo(cartao.id)}>
                        {cartao.ativo ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDefinirPadrao(cartao.id)}>
                        <span className="mr-2 h-4 w-4">★</span>
                        {cartao.isPadrao ? 'Remover Padrão' : 'Definir como Padrão'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCartao(cartao.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Novo/Edit Cartão */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                novoCartao.isCorporativo ? 'bg-purple-500' : 'bg-blue-500'
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
                <Label>Nome do Cartão</Label>
                <Input 
                  placeholder="Ex: Cartão Corporativo Inter" 
                  value={novoCartao.nome}
                  onChange={(e) => setNovoCartao({ ...novoCartao, nome: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo do Cartão</Label>
                <Select 
                  value={novoCartao.tipo} 
                  onValueChange={(value: string) => setNovoCartao({ ...novoCartao, tipo: value as 'credito' | 'debito' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="debito">Cartão de Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {novoCartao.tipo === 'credito' && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-sm">Cartão corporativo?</Label>
                  <p className="text-xs text-muted-foreground">
                    Cartões corporativos têm tratamento fiscal diferente
                  </p>
                </div>
                <Switch
                  checked={novoCartao.isCorporativo}
                  onCheckedChange={(checked) => setNovoCartao({ ...novoCartao, isCorporativo: checked })}
                />
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Banco</Label>
                <Input 
                  placeholder="Ex: Banco Inter" 
                  value={novoCartao.banco}
                  onChange={(e) => setNovoCartao({ ...novoCartao, banco: e.target.value })}
                />
              </div>
              <div>
                <Label>Últimos 4 Dígitos</Label>
                <Input 
                  placeholder="Ex: 4532" 
                  maxLength={4}
                  value={novoCartao.ultimosDigitos}
                  onChange={(e) => setNovoCartao({ ...novoCartao, ultimosDigitos: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              {novoCartao.tipo === 'credito' && (
                <div>
                  <Label>Limite (R$)</Label>
                  <Input 
                    type="number" 
                    placeholder="0,00" 
                    step="100"
                    value={novoCartao.limite}
                    onChange={(e) => setNovoCartao({ ...novoCartao, limite: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>
            {novoCartao.tipo === 'credito' && (
              <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Dia de Vencimento</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={31}
                  placeholder="10"
                  value={novoCartao.diaVencimento}
                  onChange={(e) => setNovoCartao({ ...novoCartao, diaVencimento: parseInt(e.target.value) || 10 })}
                />
              </div>
              <div>
                <Label>Dia de Fechamento</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={31}
                  placeholder="25"
                  value={novoCartao.diaFechamento}
                  onChange={(e) => setNovoCartao({ ...novoCartao, diaFechamento: parseInt(e.target.value) || 25 })}
                />
              </div>
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
                checked={novoCartao.isPadrao}
                onCheckedChange={(checked) => setNovoCartao({ ...novoCartao, isPadrao: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <BackButton href="/configuracoes/financeiro/cartoes" label="Cancelar" />
            <Button onClick={handleSaveCartao}>
              {editingCartao ? 'Atualizar' : 'Criar'} Cartão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
