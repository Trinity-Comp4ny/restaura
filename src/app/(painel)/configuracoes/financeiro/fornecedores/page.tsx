'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Briefcase, Eye, EyeOff, Search, MoreHorizontal, Phone, Mail, Building } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
import { EmptyState } from '@/components/ui/empty-state'

// Mock data - em produção viria do backend
const mockFornecedores = [
  {
    id: '1',
    nome: 'Dental Supply Brasil',
    cnpj: '12.345.678/0001-90',
    categoria: 'materiais_dentarios',
    telefone: '(11) 5555-1234',
    email: 'contato@dentalsupply.com.br',
    endereco: 'Rua das Flores, 123 - São Paulo/SP',
    contato: 'Carlos Silva',
    prazoPagamento: 30,
    condicoesPagamento: '30/60 dias',
    isPadrao: true,
    ativo: true
  },
  {
    id: '2',
    nome: 'MedTech Equipamentos',
    cnpj: '98.765.432/0001-10',
    categoria: 'equipamentos',
    telefone: '(21) 3333-5678',
    email: 'vendas@medtech.com.br',
    endereco: 'Av. Central, 456 - Rio de Janeiro/RJ',
    contato: 'Ana Costa',
    prazoPagamento: 45,
    condicoesPagamento: '45 dias',
    isPadrao: false,
    ativo: true
  },
  {
    id: '3',
    nome: 'Pharma Lab',
    cnpj: '45.678.901/0001-23',
    categoria: 'medicamentos',
    telefone: '(31) 4444-9012',
    email: 'fornecedores@pharmalab.com.br',
    endereco: 'Rua dos Medicamentos, 789 - Belo Horizonte/MG',
    contato: 'Roberto Santos',
    prazoPagamento: 60,
    condicoesPagamento: '30/60/90 dias',
    isPadrao: false,
    ativo: true
  },
  {
    id: '4',
    nome: 'Clean Solutions',
    cnpj: '67.890.123/0001-45',
    categoria: 'limpeza',
    telefone: '(41) 7777-3456',
    email: 'comercial@cleansolutions.com.br',
    endereco: 'Rua da Higiene, 321 - Curitiba/PR',
    contato: 'Maria Oliveira',
    prazoPagamento: 15,
    condicoesPagamento: '15 dias',
    isPadrao: false,
    ativo: false
  }
]

const categoriasFornecedor = [
  { value: 'materiais_dentarios', label: 'Materiais Dentários', description: 'Resinas, cimentos, etc.' },
  { value: 'equipamentos', label: 'Equipamentos', description: 'Cadeiras, raio-x, etc.' },
  { value: 'medicamentos', label: 'Medicamentos', description: 'Anestésicos, antibióticos, etc.' },
  { value: 'limpeza', label: 'Limpeza', description: 'Produtos de limpeza e esterilização' },
  { value: 'insumos', label: 'Insumos', description: 'Luvas, máscaras, etc.' },
  { value: 'servicos', label: 'Serviços', description: 'Manutenção, treinamento, etc.' }
]

export default function FornecedoresConfigPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<any>(null)
  const [novoFornecedor, setNovoFornecedor] = useState({
    nome: '',
    cnpj: '',
    categoria: '',
    telefone: '',
    email: '',
    endereco: '',
    contato: '',
    prazoPagamento: 30,
    condicoesPagamento: '30 dias',
    isPadrao: false
  })

  const fornecedoresFiltrados = mockFornecedores.filter(f => 
    showInactive || f.ativo
  ).filter(f =>
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cnpj.includes(searchTerm) ||
    f.contato.toLowerCase().includes(searchTerm)
  )

  const handleNewFornecedor = () => {
    setEditingFornecedor(null)
    setNovoFornecedor({
      nome: '',
      cnpj: '',
      categoria: '',
      telefone: '',
      email: '',
      endereco: '',
      contato: '',
      prazoPagamento: 30,
      condicoesPagamento: '30 dias',
      isPadrao: false
    })
    setShowNewDialog(true)
  }

  const handleEditFornecedor = (fornecedor: any) => {
    setEditingFornecedor(fornecedor)
    setNovoFornecedor({
      nome: fornecedor.nome,
      cnpj: fornecedor.cnpj,
      categoria: fornecedor.categoria,
      telefone: fornecedor.telefone,
      email: fornecedor.email,
      endereco: fornecedor.endereco,
      contato: fornecedor.contato,
      prazoPagamento: fornecedor.prazoPagamento,
      condicoesPagamento: fornecedor.condicoesPagamento,
      isPadrao: fornecedor.isPadrao
    })
    setShowNewDialog(true)
  }

  const handleSaveFornecedor = () => {
    // Em produção, salvar no backend
    console.log('Salvando fornecedor:', novoFornecedor)
    setShowNewDialog(false)
    setNovoFornecedor({
      nome: '',
      cnpj: '',
      categoria: '',
      telefone: '',
      email: '',
      endereco: '',
      contato: '',
      prazoPagamento: 30,
      condicoesPagamento: '30 dias',
      isPadrao: false
    })
  }

  const handleToggleAtivo = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Toggle ativo:', id)
  }

  const handleDeleteFornecedor = (id: string) => {
    // Em produção, deletar no backend
    console.log('Delete fornecedor:', id)
  }

  const handleDefinirPadrao = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Definir como padrão:', id)
  }

  const getCorByCategoria = (categoria: string) => {
    switch (categoria) {
      case 'materiais_dentarios': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'equipamentos': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'medicamentos': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'limpeza': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'insumos': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
      case 'servicos': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  const formatarTelefone = (telefone: string) => {
    return telefone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
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
              <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
              <p className="text-muted-foreground">
                Cadastre e gerencie seus fornecedores de produtos e serviços
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleNewFornecedor}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
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
                <p className="text-sm font-medium text-muted-foreground">Fornecedores Ativos</p>
                <p className="text-2xl font-bold">
                  {fornecedoresFiltrados.filter(f => f.ativo).length}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold">
                  {new Set(fornecedoresFiltrados.map(f => f.categoria)).size}
                </p>
              </div>
              <Building className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fornecedor Padrão</p>
                <p className="text-2xl font-bold">
                  {fornecedoresFiltrados.find(f => f.isPadrao)?.nome || 'Não definido'}
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
                <p className="text-sm font-medium text-muted-600">Fornecedores Inativos</p>
                <p className="text-2xl font-bold text-red-600">
                  {fornecedoresFiltrados.filter(f => !f.ativo).length}
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
            placeholder="Buscar fornecedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista de Fornecedores */}
      {fornecedoresFiltrados.length === 0 ? (
        <EmptyState
          type="fornecedores"
          onAction={handleNewFornecedor}
        />
      ) : (
        <div className="grid gap-4">
          {fornecedoresFiltrados.map((fornecedor) => (
          <Card key={fornecedor.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getCorByCategoria(fornecedor.categoria)}`}>
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{fornecedor.nome}</h4>
                      <Badge variant="outline" className="text-xs">
                        {categoriasFornecedor.find(c => c.value === fornecedor.categoria)?.label || fornecedor.categoria}
                      </Badge>
                      {fornecedor.isPadrao && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          <span className="text-xs font-bold text-yellow-800">★</span>
                          Padrão
                        </Badge>
                      )}
                      {!fornecedor.ativo && (
                        <Badge variant="outline" className="text-gray-500">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      CNPJ: {formatarCNPJ(fornecedor.cnpj)} • Contato: {fornecedor.contato}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatarTelefone(fornecedor.telefone)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {fornecedor.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Prazo:</span>
                        <span className="text-sm font-medium">{fornecedor.prazoPagamento} dias</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Condições:</span>
                        <span className="text-sm font-medium">{fornecedor.condicoesPagamento}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditFornecedor(fornecedor)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleToggleAtivo(fornecedor.id)}
                  >
                    {fornecedor.ativo ? (
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
                      <DropdownMenuItem onClick={() => handleEditFornecedor(fornecedor)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleAtivo(fornecedor.id)}>
                        {fornecedor.ativo ? (
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
                      <DropdownMenuItem onClick={() => handleDefinirPadrao(fornecedor.id)}>
                        <span className="mr-2 h-4 w-4">★</span>
                        {fornecedor.isPadrao ? 'Remover Padrão' : 'Definir como Padrão'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteFornecedor(fornecedor.id)}
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
      )}

      {/* Dialog Novo/Edit Fornecedor */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <div>
                <DialogTitle>
                  {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </DialogTitle>
                <DialogDescription>
                  {editingFornecedor 
                    ? 'Atualize os dados do fornecedor'
                    : 'Cadastre um novo fornecedor para sua clínica'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome do Fornecedor</Label>
                <Input 
                  placeholder="Ex: Dental Supply Brasil" 
                  value={novoFornecedor.nome}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })}
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select 
                  value={novoFornecedor.categoria} 
                  onValueChange={(value) => setNovoFornecedor({ ...novoFornecedor, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasFornecedor.map((categoria) => (
                      <SelectItem key={categoria.value} value={categoria.value}>
                        <div className="flex flex-col">
                          <span>{categoria.label}</span>
                          <span className="text-xs text-muted-foreground">{categoria.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>CNPJ</Label>
                <Input 
                  placeholder="00.000.000/0000-00" 
                  value={novoFornecedor.cnpj}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, cnpj: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div>
                <Label>Nome do Contato</Label>
                <Input 
                  placeholder="Nome do responsável" 
                  value={novoFornecedor.contato}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, contato: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Telefone</Label>
                <Input 
                  placeholder="(00) 0000-0000" 
                  value={novoFornecedor.telefone}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, telefone: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  placeholder="contato@fornecedor.com.br" 
                  value={novoFornecedor.email}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Endereço</Label>
              <Input 
                placeholder="Rua, número - Cidade/UF" 
                value={novoFornecedor.endereco}
                onChange={(e) => setNovoFornecedor({ ...novoFornecedor, endereco: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Prazo Pagamento (dias)</Label>
                <Input 
                  type="number" 
                  placeholder="30" 
                  min="1"
                  max="365"
                  value={novoFornecedor.prazoPagamento}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, prazoPagamento: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div>
                <Label>Condições de Pagamento</Label>
                <Input 
                  placeholder="Ex: 30/60 dias" 
                  value={novoFornecedor.condicoesPagamento}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, condicoesPagamento: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Definir como fornecedor padrão?</Label>
                <p className="text-xs text-muted-foreground">
                  Usado automaticamente em novas compras
                </p>
              </div>
              <Switch
                checked={novoFornecedor.isPadrao}
                onCheckedChange={(checked) => setNovoFornecedor({ ...novoFornecedor, isPadrao: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFornecedor}>
              {editingFornecedor ? 'Atualizar' : 'Criar'} Fornecedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
