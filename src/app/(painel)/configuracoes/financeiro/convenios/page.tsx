'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Users, Eye, EyeOff, Search, MoreHorizontal, FileText, Percent } from 'lucide-react'

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
const mockConvenios = [
  {
    id: '1',
    nome: 'Unimed',
    cnpj: '34.397.148/0001-80',
    ans: '417832',
    telefone: '(11) 5571-1888',
    email: 'clinicas@unimed.com.br',
    plano: 'Unimed Classic',
    taxa: 10.5,
    prazoPagamento: 30,
    valorMinimoConsulta: 150.00,
    valorMaximoConsulta: 500.00,
    isPadrao: true,
    ativo: true
  },
  {
    id: '2',
    nome: 'Amil',
    cnpj: '42.539.912/0001-46',
    ans: '346.698',
    telefone: '(11) 4004-2000',
    email: 'clinicas@amil.com.br',
    plano: 'Amil Premium',
    taxa: 12.0,
    prazoPagamento: 45,
    valorMinimoConsulta: 200.00,
    valorMaximoConsulta: 600.00,
    isPadrao: false,
    ativo: true
  },
  {
    id: '3',
    nome: 'SulAmerica',
    cnpj: '33.786.595/0001-00',
    ans: '406.874',
    telefone: '(11) 3395-7000',
    email: 'clinicas@sulamerica.com.br',
    plano: 'SulAmerica One',
    taxa: 8.5,
    prazoPagamento: 60,
    valorMinimoConsulta: 120.00,
    valorMaximoConsulta: 450.00,
    isPadrao: false,
    ativo: true
  },
  {
    id: '4',
    nome: 'Bradesco Saúde',
    cnpj: '07.857.008/0001-20',
    ans: '418.269',
    telefone: '(11) 4003-3000',
    email: 'clinicas@bradesco.com.br',
    plano: 'Bradesco Empresarial',
    taxa: 11.0,
    prazoPagamento: 30,
    valorMinimoConsulta: 180.00,
    valorMaximoConsulta: 550.00,
    isPadrao: false,
    ativo: false
  }
]

const tiposPlano = [
  { value: 'basic', label: 'Básico', description: 'Cobertura essencial' },
  { value: 'standard', label: 'Standard', description: 'Cobertura intermediária' },
  { value: 'premium', label: 'Premium', description: 'Cobertura completa' },
  { value: 'empresarial', label: 'Empresarial', description: 'Planos empresariais' }
]

export default function ConveniosConfigPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingConvenio, setEditingConvenio] = useState<any>(null)
  const [novoConvenio, setNovoConvenio] = useState({
    nome: '',
    cnpj: '',
    ans: '',
    telefone: '',
    email: '',
    plano: '',
    taxa: 0,
    prazoPagamento: 30,
    valorMinimoConsulta: 0,
    valorMaximoConsulta: 0,
    isPadrao: false
  })

  const conveniosFiltrados = mockConvenios.filter(c => 
    showInactive || c.ativo
  ).filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.plano.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnpj.includes(searchTerm)
  )

  const handleNewConvenio = () => {
    setEditingConvenio(null)
    setNovoConvenio({
      nome: '',
      cnpj: '',
      ans: '',
      telefone: '',
      email: '',
      plano: '',
      taxa: 0,
      prazoPagamento: 30,
      valorMinimoConsulta: 0,
      valorMaximoConsulta: 0,
      isPadrao: false
    })
    setShowNewDialog(true)
  }

  const handleEditConvenio = (convenio: any) => {
    setEditingConvenio(convenio)
    setNovoConvenio({
      nome: convenio.nome,
      cnpj: convenio.cnpj,
      ans: convenio.ans,
      telefone: convenio.telefone,
      email: convenio.email,
      plano: convenio.plano,
      taxa: convenio.taxa,
      prazoPagamento: convenio.prazoPagamento,
      valorMinimoConsulta: convenio.valorMinimoConsulta,
      valorMaximoConsulta: convenio.valorMaximoConsulta,
      isPadrao: convenio.isPadrao
    })
    setShowNewDialog(true)
  }

  const handleSaveConvenio = () => {
    // Em produção, salvar no backend
    console.log('Salvando convênio:', novoConvenio)
    setShowNewDialog(false)
    setNovoConvenio({
      nome: '',
      cnpj: '',
      ans: '',
      telefone: '',
      email: '',
      plano: '',
      taxa: 0,
      prazoPagamento: 30,
      valorMinimoConsulta: 0,
      valorMaximoConsulta: 0,
      isPadrao: false
    })
  }

  const handleToggleAtivo = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Toggle ativo:', id)
  }

  const handleDeleteConvenio = (id: string) => {
    // Em produção, deletar no backend
    console.log('Delete convênio:', id)
  }

  const handleDefinirPadrao = (id: string) => {
    // Em produção, atualizar no backend
    console.log('Definir como padrão:', id)
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
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
        <NavigationBreadcrumb
          items={[
            { label: 'Financeiro', href: '/configuracoes/financeiro' },
            { label: 'Convênios', href: '/configuracoes/financeiro/convenios' }
          ]}
          current="/configuracoes/financeiro/convenios"
        />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Convênios Médicos</h1>
            <p className="text-muted-foreground">
              Configure planos de convênio aceitos na sua clínica
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
            <Button onClick={handleNewConvenio}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Convênio
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
                <p className="text-sm font-medium text-muted-foreground">Convênios Ativos</p>
                <p className="text-2xl font-bold">
                  {conveniosFiltrados.filter(c => c.ativo).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Média</p>
                <p className="text-2xl font-bold">
                  {(conveniosFiltrados.reduce((sum, c) => sum + c.taxa, 0) / conveniosFiltrados.length).toFixed(1)}%
                </p>
              </div>
              <Percent className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Convênio Padrão</p>
                <p className="text-2xl font-bold">
                  {conveniosFiltrados.find(c => c.isPadrao)?.nome || 'Não definido'}
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
                <p className="text-sm font-medium text-muted-600">Convênios Inativos</p>
                <p className="text-2xl font-bold text-red-600">
                  {conveniosFiltrados.filter(c => !c.ativo).length}
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
            placeholder="Buscar convênios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista de Convênios */}
      <div className="grid gap-4">
        {conveniosFiltrados.map((convenio) => (
          <Card key={convenio.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{convenio.nome}</h4>
                      <Badge variant="outline" className="text-xs">
                        {convenio.plano}
                      </Badge>
                      {convenio.isPadrao && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          <span className="text-xs font-bold text-yellow-800">★</span>
                          Padrão
                        </Badge>
                      )}
                      {!convenio.ativo && (
                        <Badge variant="outline" className="text-gray-500">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      CNPJ: {formatarCNPJ(convenio.cnpj)} • ANS: {convenio.ans}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatarTelefone(convenio.telefone)} • {convenio.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Taxa:</span>
                        <span className="text-sm font-medium">{convenio.taxa}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Prazo:</span>
                        <span className="text-sm font-medium">{convenio.prazoPagamento} dias</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Faixa:</span>
                        <span className="text-sm font-medium">
                          {formatarMoeda(convenio.valorMinimoConsulta)} - {formatarMoeda(convenio.valorMaximoConsulta)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditConvenio(convenio)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleToggleAtivo(convenio.id)}
                  >
                    {convenio.ativo ? (
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
                      <DropdownMenuItem onClick={() => handleEditConvenio(convenio)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleAtivo(convenio.id)}>
                        {convenio.ativo ? (
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
                      <DropdownMenuItem onClick={() => handleDefinirPadrao(convenio.id)}>
                        <span className="mr-2 h-4 w-4">★</span>
                        {convenio.isPadrao ? 'Remover Padrão' : 'Definir como Padrão'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteConvenio(convenio.id)}
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

      {/* Dialog Novo/Edit Convênio */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <div>
                <DialogTitle>
                  {editingConvenio ? 'Editar Convênio' : 'Novo Convênio'}
                </DialogTitle>
                <DialogDescription>
                  {editingConvenio 
                    ? 'Atualize os dados do convênio'
                    : 'Configure um novo convênio para aceitar pacientes'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome do Convênio</Label>
                <Input 
                  placeholder="Ex: Unimed" 
                  value={novoConvenio.nome}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, nome: e.target.value })}
                />
              </div>
              <div>
                <Label>Plano</Label>
                <Input 
                  placeholder="Ex: Unimed Classic" 
                  value={novoConvenio.plano}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, plano: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>CNPJ</Label>
                <Input 
                  placeholder="00.000.000/0000-00" 
                  value={novoConvenio.cnpj}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, cnpj: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div>
                <Label>ANS</Label>
                <Input 
                  placeholder="000000" 
                  value={novoConvenio.ans}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, ans: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input 
                  placeholder="(00) 0000-0000" 
                  value={novoConvenio.telefone}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, telefone: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                placeholder="clinicas@convenio.com.br" 
                value={novoConvenio.email}
                onChange={(e) => setNovoConvenio({ ...novoConvenio, email: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Taxa (%)</Label>
                <Input 
                  type="number" 
                  placeholder="10.5" 
                  step="0.1"
                  min="0"
                  max="100"
                  value={novoConvenio.taxa}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, taxa: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Prazo Pagamento (dias)</Label>
                <Input 
                  type="number" 
                  placeholder="30" 
                  min="1"
                  max="365"
                  value={novoConvenio.prazoPagamento}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, prazoPagamento: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div>
                <Label>Tipo de Plano</Label>
                <Select 
                  value={novoConvenio.plano} 
                  onValueChange={(value) => setNovoConvenio({ ...novoConvenio, plano: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposPlano.map((tipo) => (
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
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Valor Mínimo Consulta (R$)</Label>
                <Input 
                  type="number" 
                  placeholder="150,00" 
                  step="10"
                  min="0"
                  value={novoConvenio.valorMinimoConsulta}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, valorMinimoConsulta: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Valor Máximo Consulta (R$)</Label>
                <Input 
                  type="number" 
                  placeholder="500,00" 
                  step="10"
                  min="0"
                  value={novoConvenio.valorMaximoConsulta}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, valorMaximoConsulta: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Definir como convênio padrão?</Label>
                <p className="text-xs text-muted-foreground">
                  Usado automaticamente em novas consultas
                </p>
              </div>
              <Switch
                checked={novoConvenio.isPadrao}
                onCheckedChange={(checked) => setNovoConvenio({ ...novoConvenio, isPadrao: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <BackButton href="/configuracoes/financeiro/convenios" label="Cancelar" />
            <Button onClick={handleSaveConvenio}>
              {editingConvenio ? 'Atualizar' : 'Criar'} Convênio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
