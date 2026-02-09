'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Building2, Wallet, Eye, EyeOff, Search, MoreHorizontal } from 'lucide-react'

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
const mockContas = [
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
    nome: 'Itaú Unibanco - Conta Secundária',
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
    nome: 'Caixa Físico - Principal',
    banco: '',
    agencia: '',
    conta: '',
    tipo: 'caixa_fisico',
    saldo: 1250.00,
    isPadrao: false,
    ativa: true
  },
  {
    id: '4',
    nome: 'Bradesco PJ - Conta Investimento',
    banco: 'Banco Bradesco',
    agencia: '3456-8',
    conta: '234567-1',
    tipo: 'poupanca',
    saldo: 45000.00,
    isPadrao: false,
    ativa: true
  }
]

const tiposConta = [
  { value: 'conta_corrente', label: 'Conta Corrente', description: 'Para transações diárias' },
  { value: 'poupanca', label: 'Poupança', description: 'Para economias e investimentos' },
  { value: 'caixa_fisico', label: 'Caixa Físico', description: 'Para dinheiro em espécie' }
]

export default function ContasConfigPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingConta, setEditingConta] = useState<any>(null)
  const [novaConta, setNovaConta] = useState({
    nome: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo: 'conta_corrente',
    saldo: 0,
    isPadrao: false
  })

  const contasFiltradas = mockContas.filter(c => 
    showInactive || c.ativa
  ).filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.banco.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewConta = () => {
    setEditingConta(null)
    setNovaConta({
      nome: '',
      banco: '',
      agencia: '',
      conta: '',
      tipo: 'conta_corrente',
      saldo: 0,
      isPadrao: false
    })
    setShowNewDialog(true)
  }

  const handleEditConta = (conta: any) => {
    setEditingConta(conta)
    setNovaConta({
      nome: conta.nome,
      banco: conta.banco,
      agencia: conta.agencia,
      conta: conta.conta,
      tipo: conta.tipo,
      saldo: conta.saldo,
      isPadrao: conta.isPadrao
    })
    setShowNewDialog(true)
  }

  const handleSaveConta = () => {
    // Em produção, salvar no backend
    console.log('Salvando conta:', novaConta)
    setShowNewDialog(false)
    setNovaConta({
      nome: '',
      banco: '',
      agencia: '',
      conta: '',
      tipo: 'conta_corrente',
      saldo: 0,
      isPadrao: false
    })
  }

  const handleToggleAtivo = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Toggle ativo:', id)
  }

  const handleDeleteConta = (id: string) => {
    // Em produção, deletar no backend
    console.log('Delete conta:', id)
  }

  const handleDefinirPadrao = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Definir como padrão:', id)
  }

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'conta_corrente': return Building2
      case 'poupanca': return Wallet
      case 'caixa_fisico': return Wallet
      default: return Building2
    }
  }

  const getCorByTipo = (tipo: string) => {
    switch (tipo) {
      case 'conta_corrente': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'poupanca': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'caixa_fisico': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <NavigationBreadcrumb
          items={[
            { label: 'Financeiro', href: '/configuracoes/financeiro' },
            { label: 'Contas', href: '/configuracoes/financeiro/contas' }
          ]}
          current="/configuracoes/financeiro/contas"
        />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contas Bancárias</h1>
            <p className="text-muted-foreground">
              Gerencie suas contas bancárias e caixa físico
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <span className="text-sm">Mostrar inativas</span>
            </div>
            <Button onClick={handleNewConta}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
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
                <p className="text-sm font-medium text-muted-foreground">Contas Ativas</p>
                <p className="text-2xl font-bold">
                  {contasFiltradas.filter(c => c.ativa).length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                <p className="text-2xl font-bold">
                  R$ {contasFiltradas.reduce((sum, conta) => sum + conta.saldo, 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conta Padrão</p>
                <p className="text-2xl font-bold">
                  {contasFiltradas.find(c => c.isPadrao)?.nome || 'Não definida'}
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
                <p className="text-sm font-medium text-muted-600">Contas Inativas</p>
                <p className="text-2xl font-bold text-red-600">
                  {contasFiltradas.filter(c => !c.ativa).length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">○</span>
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
            placeholder="Buscar contas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista de Contas */}
      <div className="grid gap-4">
        {contasFiltradas.map((conta) => (
          <Card key={conta.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getCorByTipo(conta.tipo)}`}>
                    {React.createElement(getIconByTipo(conta.tipo), { className: "h-5 w-5" })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{conta.nome}</h4>
                      <Badge variant="outline" className="text-xs">
                        {tiposConta.find(t => t.value === conta.tipo)?.label || conta.tipo}
                      </Badge>
                      {conta.isPadrao && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          <span className="text-xs font-bold">★</span>
                          Padrão
                        </Badge>
                      )}
                      {!conta.ativa && (
                        <Badge variant="outline" className="text-gray-500">
                          Inativa
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {conta.banco ? `${conta.banco} • ` : ''}
                      {conta.agencia && conta.conta ? `Ag: ${conta.agencia} • ` : ''}
                      {conta.conta ? `CC: ${conta.conta}` : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Saldo: R$ {conta.saldo.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditConta(conta)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleToggleAtivo(conta.id)}
                  >
                    {conta.ativa ? (
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
                      <DropdownMenuItem onClick={() => handleEditConta(conta)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleAtivo(conta.id)}>
                        {conta.ativa ? (
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
                      <DropdownMenuItem onClick={() => handleDefinirPadrao(conta.id)}>
                        <span className="mr-2 h-4 w-4">★</span>
                        {conta.isPadrao ? 'Remover Padrão' : 'Definir como Padrão'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteConta(conta.id)}
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

      {/* Dialog Nova/Edit Conta */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                novaConta.tipo === 'conta_corrente' ? 'bg-blue-500' : 
                novaConta.tipo === 'poupanca' ? 'bg-green-500' : 'bg-orange-500'
              }`} />
              <div>
                <DialogTitle>
                  {editingConta ? 'Editar Conta' : 'Nova Conta Bancária'}
                </DialogTitle>
                <DialogDescription>
                  Configure os dados da sua conta bancária ou caixa físico
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome da Conta</Label>
                <Input 
                  placeholder="Ex: Banco Inter PJ - Conta Principal" 
                  value={novaConta.nome}
                  onChange={(e) => setNovaConta({ ...novaConta, nome: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo de Conta</Label>
                <Select 
                  value={novaConta.tipo} 
                  onValueChange={(value) => setNovaConta({ ...novaConta, tipo: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposConta.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center gap-2">
                          <span>{tipo.label}</span>
                          <span className="text-xs text-muted-foreground">({tipo.description})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Banco</Label>
                <Input 
                  placeholder="Ex: Banco Inter" 
                  value={novaConta.banco}
                  onChange={(e) => setNovaConta({ ...novaConta, banco: e.target.value })}
                />
              </div>
              <div>
                <Label>Agência</Label>
                <Input 
                  placeholder="0001" 
                  value={novaConta.agencia}
                  onChange={(e) => setNovaConta({ ...novaConta, agencia: e.target.value })}
                />
              </div>
              <div>
                <Label>Conta</Label>
                <Input 
                  placeholder="12345678-9" 
                  value={novaConta.conta}
                  onChange={(e) => setNovaConta({ ...novaConta, conta: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Saldo Inicial</Label>
                <Input 
                  type="number" 
                  placeholder="0,00" 
                  step="0.01"
                  value={novaConta.saldo}
                  onChange={(e) => setNovaConta({ ...novaConta, saldo: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-sm">Definir como conta padrão?</Label>
                  <p className="text-xs text-muted-foreground">
                    Usada automaticamente em novas transações
                  </p>
                </div>
                <Switch
                  checked={novaConta.isPadrao}
                  onCheckedChange={(checked) => setNovaConta({ ...novaConta, isPadrao: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <BackButton href="/configuracoes/financeiro/contas" label="Cancelar" />
            <Button onClick={handleSaveConta}>
              {editingConta ? 'Atualizar' : 'Criar'} Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
