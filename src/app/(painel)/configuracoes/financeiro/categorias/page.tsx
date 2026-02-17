'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Target, TrendingUp, TrendingDown,
  Search, Filter, Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCategoriasReceita, useCategoriasDespesa, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from '@/hooks/use-categorias-financeiras'
import { useUser, useClinica } from '@/hooks/use-user'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/empty-state'

export default function CategoriasConfigPage() {
  const { data: user } = useUser()
  const { data: clinica } = useClinica()
  const router = useRouter()
  const clinicaId = user?.clinica_id

  const { data: categoriasReceita, isLoading: isLoadingReceita } = useCategoriasReceita(clinicaId)
  const { data: categoriasDespesa, isLoading: isLoadingDespesa } = useCategoriasDespesa(clinicaId)
  const createCategoria = useCreateCategoria()
  const updateCategoria = useUpdateCategoria()
  const deleteCategoria = useDeleteCategoria()

  const [activeTab, setActiveTab] = useState('receitas')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<any>(null)
  const [categoriaTipo, setCategoriaTipo] = useState<'receita' | 'despesa'>('receita')
  const [novaCategoria, setNovaCategoria] = useState({
    nome: '',
    descricao: '',
    cor: '#3b82f6',
    is_padrao: false
  })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const categoriasReceitaFiltradas = (categoriasReceita || []).filter(c => 
    c.ativa
  ).filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categoriasDespesaFiltradas = (categoriasDespesa || []).filter(c => 
    c.ativa
  ).filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewCategoria = (tipo?: 'receita' | 'despesa') => {
    console.log('🔍 handleNewCategoria chamado - clinicaId:', clinicaId)
    console.log('🔍 User data:', user)
    
    if (!clinicaId) {
      console.error('❌ clinicaId não encontrado - User:', user)
      toast.error('Erro: Usuário não vinculado a uma clínica. Por favor, faça login novamente.')
      return
    }
    const tipoSelecionado = tipo || (activeTab === 'despesas' ? 'despesa' : 'receita')

    setCategoriaTipo(tipoSelecionado)
    setEditingCategoria(null)
    setNovaCategoria({
      nome: '',
      descricao: '',
      cor: tipoSelecionado === 'receita' ? '#3b82f6' : '#ef4444',
      is_padrao: false
    })
    setShowNewDialog(true)
  }

  const handleEditCategoria = (categoria: any) => {
    setCategoriaTipo(categoria.tipo)
    setEditingCategoria(categoria)
    setNovaCategoria({
      nome: categoria.nome,
      descricao: categoria.descricao || '',
      cor: categoria.cor,
      is_padrao: categoria.is_padrao
    })
    setShowNewDialog(true)
  }

  const handleSaveCategoria = () => {
    console.log('🔍 handleSaveCategoria chamado - clinicaId:', clinicaId)
    
    if (!clinicaId) {
      console.error('❌ clinicaId não encontrado ao salvar categoria')
      toast.error('Erro: Usuário não vinculado a uma clínica. Por favor, faça login novamente.')
      return
    }
    if (!novaCategoria.nome) {
      toast.error('Preencha o nome da categoria')
      return
    }

    const categoriaData = {
      clinica_id: clinicaId,
      nome: novaCategoria.nome,
      descricao: novaCategoria.descricao,
      cor: novaCategoria.cor,
      tipo: categoriaTipo,
      is_padrao: novaCategoria.is_padrao,
      ativa: true
    }

    if (editingCategoria) {
      updateCategoria.mutate({
        id: editingCategoria.id,
        ...categoriaData
      })
    } else {
      createCategoria.mutate(categoriaData as any)
    }

    setShowNewDialog(false)
    setNovaCategoria({ nome: '', descricao: '', cor: '#3b82f6', is_padrao: false })
  }

  const handleDeleteCategoria = (id: string) => {
    deleteCategoria.mutate(id)
    setConfirmDeleteId(null)
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

  if (isLoadingReceita || isLoadingDespesa) {
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
              <h1 className="text-3xl font-bold tracking-tight">Categorias Financeiras</h1>
              <p className="text-muted-foreground">
                Organize suas receitas e despesas por categorias personalizadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleNewCategoria()}
              variant="default"
              data-onboarding="nova-categoria"
            >
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
                  {categoriasReceitaFiltradas.filter(c => c.ativa).length + categoriasDespesaFiltradas.filter(c => c.ativa).length}
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
                <p className="text-2xl font-bold">{categoriasReceitaFiltradas.filter(c => c.ativa).length}</p>
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
                <p className="text-2xl font-bold">{categoriasDespesaFiltradas.filter(c => c.ativa).length}</p>
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
                  {categoriasReceitaFiltradas.filter(c => c.is_padrao && c.ativa).length + 
                   categoriasDespesaFiltradas.filter(c => c.is_padrao && c.ativa).length}
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
          {categoriasReceitaFiltradas.length === 0 ? (
            <EmptyState
              type="cartoes"
              title="Nenhuma categoria de receita cadastrada"
              description="Organize suas receitas por categorias personalizadas"
              buttonText="Nova Categoria"
              onAction={() => handleNewCategoria('receita')}
            />
          ) : (
            <div className="grid gap-4">
              {categoriasReceitaFiltradas.map((categoria) => (
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
                          {categoria.is_padrao && (
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
                          <span>Criada em: {categoria.criado_em ? new Date(categoria.criado_em).toLocaleDateString('pt-BR') : '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategoria(categoria)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setConfirmDeleteId(categoria.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Categorias de Despesa */}
        <TabsContent value="despesas" className="space-y-4">
          {categoriasDespesaFiltradas.length === 0 ? (
            <EmptyState
              type="cartoes"
              title="Nenhuma categoria de despesa cadastrada"
              description="Organize suas despesas por categorias personalizadas"
              buttonText="Nova Categoria"
              onAction={() => handleNewCategoria('despesa')}
            />
          ) : (
            <div className="grid gap-4">
              {categoriasDespesaFiltradas.map((categoria) => (
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
                          {categoria.is_padrao && (
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
                          <span>Criada em: {categoria.criado_em ? new Date(categoria.criado_em).toLocaleDateString('pt-BR') : '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategoria(categoria)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setConfirmDeleteId(categoria.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Nova/Edit Categoria */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                categoriaTipo === 'receita' ? 'bg-blue-500' : 'bg-red-500'
              }`} />
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {editingCategoria 
                    ? `Editar ${categoriaTipo === 'receita' ? 'Categoria de Receita' : 'Categoria de Despesa'}`
                    : `Nova ${categoriaTipo === 'receita' ? 'Categoria de Receita' : 'Categoria de Despesa'}`
                  }
                </DialogTitle>
                <DialogDescription>
                  {categoriaTipo === 'receita' 
                    ? 'Configure uma categoria para organizar suas receitas'
                    : 'Configure uma categoria para organizar suas despesas'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Categoria</Label>
              <Select value={categoriaTipo} onValueChange={(value) => {
                const tipo = value as 'receita' | 'despesa'
                setCategoriaTipo(tipo)
                setNovaCategoria({
                  ...novaCategoria,
                  cor: tipo === 'receita' ? '#3b82f6' : '#ef4444'
                })
              }}>
                <SelectTrigger className="capitalize">
                  <SelectValue placeholder="Tipo de categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome da Categoria</Label>
              <Input
                placeholder={categoriaTipo === 'receita' ? 'Ex: Procedimentos Gerais' : 'Ex: Materiais'}
                value={novaCategoria.nome}
                onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
              />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea
                placeholder={categoriaTipo === 'receita' 
                  ? 'Descreva o tipo de receitas nesta categoria (opcional)' 
                  : 'Descreva o tipo de despesas nesta categoria (opcional)'
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
                checked={novaCategoria.is_padrao}
                onCheckedChange={(checked) => setNovaCategoria({ ...novaCategoria, is_padrao: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategoria}>
              {editingCategoria 
                ? `Atualizar ${categoriaTipo === 'receita' ? 'Receita' : 'Despesa'}`
                : `Criar ${categoriaTipo === 'receita' ? 'Receita' : 'Despesa'}`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A categoria será desativada e não aparecerá mais nas listas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => confirmDeleteId && handleDeleteCategoria(confirmDeleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
