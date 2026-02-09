'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Target, TrendingUp, TrendingDown,
  Search, Filter, MoreHorizontal, Eye, EyeOff
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NavigationBreadcrumb, BackButton } from '@/components/ui/navigation-breadcrumb'

// Mock data - em produção viria do backend
const mockCategoriasReceita = [
  {
    id: '1',
    nome: 'Procedimentos Gerais',
    descricao: 'Consultas e procedimentos básicos',
    cor: '#3b82f6',
    isPadrao: true,
    ativa: true,
    criadoEm: '2024-01-01',
    totalTransacoes: 45,
    valorTotal: 15420.50
  },
  {
    id: '2',
    nome: 'Ortodontia',
    descricao: 'Tratamentos ortodônticos',
    cor: '#10b981',
    isPadrao: true,
    ativa: true,
    criadoEm: '2024-01-01',
    totalTransacoes: 32,
    valorTotal: 28900.00
  },
  {
    id: '3',
    nome: 'Implantes',
    descricao: 'Procedimentos de implantação',
    cor: '#f59e0b',
    isPadrao: true,
    ativa: true,
    criadoEm: '2024-01-15',
    totalTransacoes: 12,
    valorTotal: 45000.00
  }
]

const mockCategoriasDespesa = [
  {
    id: '1',
    nome: 'Materiais',
    descricao: 'Materiais odontológicos e insumos',
    cor: '#ef4444',
    isPadrao: true,
    ativa: true,
    criadoEm: '2024-01-01',
    totalTransacoes: 28,
    valorTotal: 8750.30
  },
  {
    id: '2',
    nome: 'Pessoal',
    descricao: 'Salários e benefícios',
    cor: '#8b5cf6',
    isPadrao: true,
    ativa: true,
    criadoEm: '2024-01-01',
    totalTransacoes: 12,
    valorTotal: 15000.00
  },
  {
    id: '3',
    nome: 'Aluguel',
    descricao: 'Aluguel do consultório',
    cor: '#ec4899',
    isPadrao: false,
    ativa: true,
    criadoEm: '2024-01-10',
    totalTransacoes: 12,
    valorTotal: 36000.00
  }
]

export default function CategoriasConfigPage() {
  const [activeTab, setActiveTab] = useState('receitas')
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<any>(null)
  const [novaCategoria, setNovaCategoria] = useState({
    nome: '',
    descricao: '',
    cor: '#3b82f6',
    isPadrao: false
  })

  const categoriasReceita = mockCategoriasReceita.filter(c => 
    showInactive || c.ativa
  ).filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categoriasDespesa = mockCategoriasDespesa.filter(c => 
    showInactive || c.ativa
  ).filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewCategoria = (tipo: 'receita' | 'despesa') => {
    setEditingCategoria(null)
    setNovaCategoria({
      nome: '',
      descricao: '',
      cor: tipo === 'receita' ? '#3b82f6' : '#ef4444',
      isPadrao: false
    })
    setShowNewDialog(true)
  }

  const handleEditCategoria = (categoria: any) => {
    setEditingCategoria(categoria)
    setNovaCategoria({
      nome: categoria.nome,
      descricao: categoria.descricao,
      cor: categoria.cor,
      isPadrao: categoria.isPadrao
    })
    setShowNewDialog(true)
  }

  const handleSaveCategoria = () => {
    // Em produção, salvar no backend
    console.log('Salvando categoria:', novaCategoria)
    setShowNewDialog(false)
    setNovaCategoria({ nome: '', descricao: '', cor: '#3b82f6', isPadrao: false })
  }

  const handleToggleAtivo = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Toggle ativo:', id)
  }

  const handleDeleteCategoria = (id: string) => {
    // Em produção, deletar no backend
    console.log('Delete categoria:', id)
  }

  const coresPadrao = [
    { value: '#3b82f6', label: 'Azul', class: 'bg-blue-500' },
    { value: '#ef4444', label: 'Vermelho', class: 'bg-red-500' },
    { value: '#10b981', label: 'Verde', class: 'bg-green-500' },
    { value: '#f59e0b', label: 'Amarelo', class: 'bg-yellow-500' },
    { value: '#8b5cf6', label: 'Roxo', class: 'bg-purple-500' },
    { value: '#ec4899', label: 'Rosa', class: 'bg-pink-500' },
    { value: '#14b8a6', label: 'Ciano', class: 'bg-cyan-500' },
    { value: '#f97316', label: 'Laranja', class: 'bg-orange-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <NavigationBreadcrumb
          items={[
            { label: 'Financeiro', href: '/configuracoes/financeiro' },
            { label: 'Categorias', href: '/configuracoes/financeiro/categorias' }
          ]}
          current="/configuracoes/financeiro/categorias"
        />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorias Financeiras</h1>
            <p className="text-muted-foreground">
              Organize suas receitas e despesas por categorias personalizadas
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
            <Button onClick={() => handleNewCategoria(activeTab as 'receita' | 'despesa')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
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
                <p className="text-sm font-medium text-muted-foreground">Categorias Ativas</p>
                <p className="text-2xl font-bold">
                  {categoriasReceita.filter(c => c.ativa).length + categoriasDespesa.filter(c => c.ativa).length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorias Receita</p>
                <p className="text-2xl font-bold">{categoriasReceita.filter(c => c.ativa).length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorias Despesa</p>
                <p className="text-2xl font-bold">{categoriasDespesa.filter(c => c.ativa).length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorias Padrão</p>
                <p className="text-2xl font-bold">
                  {categoriasReceita.filter(c => c.isPadrao && c.ativa).length + 
                   categoriasDespesa.filter(c => c.isPadrao && c.ativa).length}
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
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receitas">Categorias de Receita</TabsTrigger>
          <TabsTrigger value="despesas">Categorias de Despesa</TabsTrigger>
        </TabsList>

        {/* Categorias de Receita */}
        <TabsContent value="receitas" className="space-y-4">
          <div className="grid gap-4">
            {categoriasReceita.map((categoria) => (
              <Card key={categoria.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{categoria.nome}</h4>
                          {categoria.isPadrao && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              Padrão
                            </Badge>
                          )}
                          {!categoria.ativa && (
                            <Badge variant="outline" className="text-gray-500">
                              Inativa
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{categoria.descricao}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{categoria.totalTransacoes} transações</span>
                          <span>•</span>
                          <span>R$ {categoria.valorTotal.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategoria(categoria)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleAtivo(categoria.id)}
                      >
                        {categoria.ativa ? (
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
                          <DropdownMenuItem onClick={() => handleEditCategoria(categoria)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleAtivo(categoria.id)}>
                            {categoria.ativa ? (
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
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCategoria(categoria.id)}
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
        </TabsContent>

        {/* Categorias de Despesa */}
        <TabsContent value="despesas" className="space-y-4">
          <div className="grid gap-4">
            {categoriasDespesa.map((categoria) => (
              <Card key={categoria.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{categoria.nome}</h4>
                          {categoria.isPadrao && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              Padrão
                            </Badge>
                          )}
                          {!categoria.ativa && (
                            <Badge variant="outline" className="text-gray-500">
                              Inativa
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{categoria.descricao}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{categoria.totalTransacoes} transações</span>
                          <span>•</span>
                          <span>R$ {categoria.valorTotal.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategoria(categoria)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleAtivo(categoria.id)}
                      >
                        {categoria.ativa ? (
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
                          <DropdownMenuItem onClick={() => handleEditCategoria(categoria)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleAtivo(categoria.id)}>
                            {categoria.ativa ? (
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
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCategoria(categoria.id)}
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
        </TabsContent>
      </Tabs>

      {/* Dialog Nova/Edit Categoria */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                activeTab === 'receitas' ? 'bg-blue-500' : 'bg-red-500'
              }`} />
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {editingCategoria 
                    ? `Editar ${activeTab === 'receitas' ? 'Categoria de Receita' : 'Categoria de Despesa'}`
                    : `Nova ${activeTab === 'receitas' ? 'Categoria de Receita' : 'Categoria de Despesa'}`
                  }
                </DialogTitle>
                <DialogDescription>
                  {activeTab === 'receitas' 
                    ? 'Configure uma categoria para organizar suas receitas'
                    : 'Configure uma categoria para organizar suas despesas'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Categoria</Label>
              <Input
                placeholder={activeTab === 'receitas' ? 'Ex: Procedimentos Gerais' : 'Ex: Materiais'}
                value={novaCategoria.nome}
                onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                placeholder={activeTab === 'receitas' 
                  ? 'Descreva o tipo de receitas nesta categoria' 
                  : 'Descreva o tipo de despesas nesta categoria'
                }
                value={novaCategoria.descricao}
                onChange={(e) => setNovaCategoria({ ...novaCategoria, descricao: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="grid grid-cols-8 gap-2">
                {coresPadrao.map((cor) => (
                  <button
                    key={cor.value}
                    type="button"
                    onClick={() => setNovaCategoria({ ...novaCategoria, cor: cor.value })}
                    className={`w-full h-8 rounded-md border-2 ${
                      novaCategoria.cor === cor.value ? 'border-gray-900' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: cor.value }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Categoria padrão?</Label>
                <p className="text-xs text-muted-foreground">
                  Categorias padrão aparecem primeiro na lista
                </p>
              </div>
              <Switch
                checked={novaCategoria.isPadrao}
                onCheckedChange={(checked) => setNovaCategoria({ ...novaCategoria, isPadrao: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <BackButton href="/configuracoes/financeiro/categorias" label="Cancelar" />
            <Button onClick={handleSaveCategoria}>
              {editingCategoria 
                ? `Atualizar ${activeTab === 'receitas' ? 'Receita' : 'Despesa'}`
                : `Criar ${activeTab === 'receitas' ? 'Receita' : 'Despesa'}`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
