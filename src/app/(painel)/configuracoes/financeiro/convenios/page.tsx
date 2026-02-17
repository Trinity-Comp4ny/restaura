'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Users, Eye, EyeOff, Search, MoreHorizontal, FileText, Percent } from 'lucide-react'
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
import { useConvenios, useCreateConvenio, useUpdateConvenio, useDeleteConvenio } from '@/hooks/use-convenios'
import { useUser } from '@/hooks/use-user'
import { EmptyState } from '@/components/ui/empty-state'

const tiposPlano = [
  { value: 'basic', label: 'Básico', description: 'Cobertura essencial' },
  { value: 'standard', label: 'Standard', description: 'Cobertura intermediária' },
  { value: 'premium', label: 'Premium', description: 'Cobertura completa' },
  { value: 'empresarial', label: 'Empresarial', description: 'Planos empresariais' }
]

export default function ConveniosConfigPage() {
  const { data: user } = useUser()
  const { data: convenios = [], isLoading } = useConvenios()
  const router = useRouter()
  const createConvenio = useCreateConvenio()
  const updateConvenio = useUpdateConvenio()
  const deleteConvenio = useDeleteConvenio()
  
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
    prazo_pagamento: 30,
    valor_minimo_consulta: 0,
    valor_maximo_consulta: 0,
    is_padrao: false,
    clinica_id: user?.clinica_id || ''
  })

  if (isLoading) {
    return <div>Carregando...</div>
  }

  const conveniosFiltrados = convenios.filter((c: any) => 
    showInactive || c.ativo
  ).filter((c: any) =>
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
      prazo_pagamento: 30,
      valor_minimo_consulta: 0,
      valor_maximo_consulta: 0,
      is_padrao: false,
      clinica_id: user?.clinica_id || ''
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
      prazo_pagamento: convenio.prazo_pagamento,
      valor_minimo_consulta: convenio.valor_minimo_consulta,
      valor_maximo_consulta: convenio.valor_maximo_consulta,
      is_padrao: convenio.is_padrao,
      clinica_id: user?.clinica_id || ''
    })
    setShowNewDialog(true)
  }

  const handleSaveConvenio = () => {
    if (editingConvenio) {
      updateConvenio.mutate({ id: editingConvenio.id, ...novoConvenio })
    } else {
      createConvenio.mutate({ ...novoConvenio, ativo: true })
    }
    setShowNewDialog(false)
    setNovoConvenio({
      nome: '',
      cnpj: '',
      ans: '',
      telefone: '',
      email: '',
      plano: '',
      taxa: 0,
      prazo_pagamento: 30,
      valor_minimo_consulta: 0,
      valor_maximo_consulta: 0,
      is_padrao: false,
      clinica_id: user?.clinica_id || ''
    })
  }

  const handleToggleAtivo = (id: string) => {
    // Find the convenio and toggle its active status
    const convenio = convenios.find((c: any) => c.id === id)
    if (convenio) {
      updateConvenio.mutate({ id, ativo: !convenio.ativo })
    }
  }

  const handleDeleteConvenio = (id: string) => {
    deleteConvenio.mutate(id)
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
              <h1 className="text-3xl font-bold tracking-tight">Convênios Médicos</h1>
              <p className="text-muted-foreground">
                Configure planos de convênio aceitos na sua clínica
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                  {(conveniosFiltrados.reduce((sum, c) => sum + (c.taxa || 0), 0) / conveniosFiltrados.length).toFixed(1)}%
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
                  {conveniosFiltrados.find(c => c.is_padrao)?.nome || 'Não definido'}
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
      {conveniosFiltrados.length === 0 ? (
        <EmptyState
          type="cartoes"
          title="Nenhum convênio cadastrado"
          description="Cadastre convênios para gerenciar atendimentos particulares"
          buttonText="Novo Convênio"
          onAction={handleNewConvenio}
        />
      ) : (
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
                        {convenio.plano || ''}
                      </Badge>
                      {convenio.is_padrao && (
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
                      CNPJ: {formatarCNPJ(convenio.cnpj || '')} • ANS: {convenio.ans || ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatarTelefone(convenio.telefone || '')} • {convenio.email || ''}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Taxa:</span>
                        <span className="text-sm font-medium">{convenio.taxa}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Prazo:</span>
                        <span className="text-sm font-medium">{convenio.prazo_pagamento} dias</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Faixa:</span>
                        <span className="text-sm font-medium">
                          {formatarMoeda(convenio.valor_minimo_consulta || 0)} - {formatarMoeda(convenio.valor_maximo_consulta || 0)}
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
                        {convenio.is_padrao ? 'Remover Padrão' : 'Definir como Padrão'}
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
      )}

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
                  value={novoConvenio.prazo_pagamento}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, prazo_pagamento: parseInt(e.target.value) || 30 })}
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
                  value={novoConvenio.valor_minimo_consulta}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, valor_minimo_consulta: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Valor Máximo Consulta (R$)</Label>
                <Input 
                  type="number" 
                  placeholder="500,00" 
                  step="10"
                  min="0"
                  value={novoConvenio.valor_maximo_consulta}
                  onChange={(e) => setNovoConvenio({ ...novoConvenio, valor_maximo_consulta: parseFloat(e.target.value) || 0 })}
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
                checked={novoConvenio.is_padrao}
                onCheckedChange={(checked) => setNovoConvenio({ ...novoConvenio, is_padrao: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConvenio}>
              {editingConvenio ? 'Atualizar' : 'Criar'} Convênio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
