'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, PieChart, Eye, EyeOff, Search, MoreHorizontal } from 'lucide-react'

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
const mockCentrosCusto = [
  {
    id: '1',
    nome: 'Despesas Administrativas',
    descricao: 'Custos fixos administrativos da clínica',
    tipo: 'fixo',
    responsavel: 'João Silva',
    orcamentoMensal: 15000.00,
    gastoMensal: 12500.00,
    isPadrao: true,
    ativo: true,
    cor: '#3B82F6'
  },
  {
    id: '2',
    nome: 'Marketing e Vendas',
    descricao: 'Despesas com marketing e equipe de vendas',
    tipo: 'variavel',
    responsavel: 'Maria Santos',
    orcamentoMensal: 8000.00,
    gastoMensal: 6500.00,
    isPadrao: false,
    ativo: true,
    cor: '#10B981'
  },
  {
    id: '3',
    nome: 'Investimentos',
    descricao: 'Investimentos em equipamentos e melhorias',
    tipo: 'investimento',
    responsavel: 'Carlos Oliveira',
    orcamentoMensal: 20000.00,
    gastoMensal: 18000.00,
    isPadrao: false,
    ativo: true,
    cor: '#8B5CF6'
  },
  {
    id: '4',
    nome: 'Operacional',
    descricao: 'Custos operacionais do dia a dia',
    tipo: 'variavel',
    responsavel: 'Ana Costa',
    orcamentoMensal: 12000.00,
    gastoMensal: 11000.00,
    isPadrao: false,
    ativo: false,
    cor: '#F59E0B'
  }
]

const tiposCentroCusto = [
  { value: 'fixo', label: 'Fixo', description: 'Custos recorrentes mensais' },
  { value: 'variavel', label: 'Variável', description: 'Custos que variam conforme uso' },
  { value: 'investimento', label: 'Investimento', description: 'Aplicações e melhorias' }
]

const coresPadrao = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#10B981', label: 'Verde' },
  { value: '#F59E0B', label: 'Amarelo' },
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#8B5CF6', label: 'Roxo' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6B7280', label: 'Cinza' },
  { value: '#059669', label: 'Verde Escuro' }
]

export default function CentrosCustoConfigPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingCentro, setEditingCentro] = useState<any>(null)
  const [novoCentro, setNovoCentro] = useState({
    nome: '',
    descricao: '',
    tipo: 'fixo',
    responsavel: '',
    orcamentoMensal: 0,
    isPadrao: false,
    cor: '#3B82F6'
  })

  const centrosFiltrados = mockCentrosCusto.filter(c => 
    showInactive || c.ativo
  ).filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewCentro = () => {
    setEditingCentro(null)
    setNovoCentro({
      nome: '',
      descricao: '',
      tipo: 'fixo',
      responsavel: '',
      orcamentoMensal: 0,
      isPadrao: false,
      cor: '#3B82F6'
    })
    setShowNewDialog(true)
  }

  const handleEditCentro = (centro: any) => {
    setEditingCentro(centro)
    setNovoCentro({
      nome: centro.nome,
      descricao: centro.descricao,
      tipo: centro.tipo,
      responsavel: centro.responsavel,
      orcamentoMensal: centro.orcamentoMensal,
      isPadrao: centro.isPadrao,
      cor: centro.cor || '#3B82F6'
    })
    setShowNewDialog(true)
  }

  const handleSaveCentro = () => {
    // Em produção, salvar no backend
    console.log('Salvando centro de custo:', novoCentro)
    setShowNewDialog(false)
    setNovoCentro({
      nome: '',
      descricao: '',
      tipo: 'fixo',
      responsavel: '',
      orcamentoMensal: 0,
      isPadrao: false,
      cor: '#3B82F6'
    })
  }

  const handleToggleAtivo = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Toggle ativo:', id)
  }

  const handleDeleteCentro = (id: string) => {
    // Em produção, deletar no backend
    console.log('Delete centro:', id)
  }

  const handleDefinirPadrao = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Definir como padrão:', id)
  }

  const getCorByTipo = (tipo: string) => {
    switch (tipo) {
      case 'fixo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'variavel': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'investimento': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
  }

  const calcularPercentualGasto = (orcamento: number, gasto: number) => {
    if (orcamento === 0) return 0
    return Math.round((gasto / orcamento) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <NavigationBreadcrumb
          items={[
            { label: 'Financeiro', href: '/configuracoes/financeiro' },
            { label: 'Centros de Custo', href: '/configuracoes/financeiro/centros-custo' }
          ]}
          current="/configuracoes/financeiro/centros-custo"
        />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Centros de Custo</h1>
            <p className="text-muted-foreground">
              Organize e controle os custos da sua clínica por categorias
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
            <Button onClick={handleNewCentro}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Centro
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
                <p className="text-sm font-medium text-muted-foreground">Centros Ativos</p>
                <p className="text-2xl font-bold">
                  {centrosFiltrados.filter(c => c.ativo).length}
                </p>
              </div>
              <PieChart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orçamento Total</p>
                <p className="text-2xl font-bold">
                  {formatarMoeda(centrosFiltrados.reduce((sum, c) => sum + c.orcamentoMensal, 0))}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs font-bold text-green-800">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gasto Total</p>
                <p className="text-2xl font-bold">
                  {formatarMoeda(centrosFiltrados.reduce((sum, c) => sum + c.gastoMensal, 0))}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-800">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-600">Centro Padrão</p>
                <p className="text-2xl font-bold">
                  {centrosFiltrados.find(c => c.isPadrao)?.nome || 'Não definido'}
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
            placeholder="Buscar centros de custo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista de Centros */}
      <div className="grid gap-4">
        {centrosFiltrados.map((centro) => (
          <Card key={centro.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: centro.cor || '#3B82F6' }}
                  >
                    <PieChart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{centro.nome}</h4>
                      <Badge variant="outline" className="text-xs">
                        {tiposCentroCusto.find(t => t.value === centro.tipo)?.label || centro.tipo}
                      </Badge>
                      {centro.isPadrao && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          <span className="text-xs font-bold text-yellow-800">★</span>
                          Padrão
                        </Badge>
                      )}
                      {!centro.ativo && (
                        <Badge variant="outline" className="text-gray-500">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {centro.descricao}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Responsável: {centro.responsavel}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Orçamento:</span>
                        <span className="text-sm font-medium">{formatarMoeda(centro.orcamentoMensal)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Gasto:</span>
                        <span className="text-sm font-medium">{formatarMoeda(centro.gastoMensal)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              calcularPercentualGasto(centro.orcamentoMensal, centro.gastoMensal) > 90 
                                ? 'bg-red-500' 
                                : calcularPercentualGasto(centro.orcamentoMensal, centro.gastoMensal) > 70 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ 
                              width: `${Math.min(calcularPercentualGasto(centro.orcamentoMensal, centro.gastoMensal), 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {calcularPercentualGasto(centro.orcamentoMensal, centro.gastoMensal)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditCentro(centro)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleToggleAtivo(centro.id)}
                  >
                    {centro.ativo ? (
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
                      <DropdownMenuItem onClick={() => handleEditCentro(centro)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleAtivo(centro.id)}>
                        {centro.ativo ? (
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
                      <DropdownMenuItem onClick={() => handleDefinirPadrao(centro.id)}>
                        <span className="mr-2 h-4 w-4">★</span>
                        {centro.isPadrao ? 'Remover Padrão' : 'Definir como Padrão'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCentro(centro.id)}
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

      {/* Dialog Novo/Edit Centro */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                novoCentro.tipo === 'fixo' ? 'bg-blue-500' : 
                novoCentro.tipo === 'variavel' ? 'bg-green-500' : 'bg-purple-500'
              }`} />
              <div>
                <DialogTitle>
                  {editingCentro ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
                </DialogTitle>
                <DialogDescription>
                  {editingCentro 
                    ? 'Atualize os dados do centro de custo'
                    : 'Configure um novo centro para organizar suas despesas'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Centro</Label>
              <Input 
                placeholder="Ex: Despesas Administrativas" 
                value={novoCentro.nome}
                onChange={(e) => setNovoCentro({ ...novoCentro, nome: e.target.value })}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input 
                placeholder="Descreva o tipo de despesas deste centro" 
                value={novoCentro.descricao}
                onChange={(e) => setNovoCentro({ ...novoCentro, descricao: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Tipo de Centro</Label>
                <Select 
                  value={novoCentro.tipo} 
                  onValueChange={(value) => setNovoCentro({ ...novoCentro, tipo: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCentroCusto.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex flex-col">
                          <span>{tipo.label}</span>
                          <span className="text-xs text-muted-foreground">{tipo.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Responsável</Label>
                <Input 
                  placeholder="Nome do responsável" 
                  value={novoCentro.responsavel}
                  onChange={(e) => setNovoCentro({ ...novoCentro, responsavel: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Orçamento Mensal (R$)</Label>
              <Input 
                type="number" 
                placeholder="0,00" 
                step="100"
                value={novoCentro.orcamentoMensal}
                onChange={(e) => setNovoCentro({ ...novoCentro, orcamentoMensal: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="grid grid-cols-8 gap-2">
                {coresPadrao.map((cor) => (
                  <button
                    key={cor.value}
                    type="button"
                    onClick={() => setNovoCentro({ ...novoCentro, cor: cor.value })}
                    className={`w-full h-8 rounded-md border-2 ${
                      novoCentro.cor === cor.value ? 'border-gray-900' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: cor.value }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Definir como centro padrão?</Label>
                <p className="text-xs text-muted-foreground">
                  Usado automaticamente em novas despesas
                </p>
              </div>
              <Switch
                checked={novoCentro.isPadrao}
                onCheckedChange={(checked) => setNovoCentro({ ...novoCentro, isPadrao: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <BackButton href="/configuracoes/financeiro/centros-custo" label="Cancelar" />
            <Button onClick={handleSaveCentro}>
              {editingCentro ? 'Atualizar' : 'Criar'} Centro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
