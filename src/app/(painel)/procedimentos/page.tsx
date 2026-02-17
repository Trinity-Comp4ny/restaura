'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Clock, Search, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { useUser } from '@/hooks/use-user'
import {
  useCreateProcedimento,
  useInativarProcedimento,
  useProcedimentos,
  useUpdateProcedimento,
} from '@/hooks/use-procedimentos'
import { PROCEDURE_CATEGORIES } from '@/constants/procedures'

// Mock data - em produção viria do banco de dados
const procedimentosMock: never[] = []

export default function ProcedimentosPage() {
  const { data: user } = useUser()
  const clinicaId = user?.clinica_id
  const { data: procedimentos = [] } = useProcedimentos(clinicaId)
  const createProcedimento = useCreateProcedimento()
  const updateProcedimento = useUpdateProcedimento()
  const inativarProcedimento = useInativarProcedimento()

  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProcedimento, setEditingProcedimento] = useState<{
    id: string
    nome: string
    duracao_minutos: number
    categoria: string | null
    preco: number
    descricao: string | null
  } | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    duracao_minutos: 30,
    categoria: 'Consulta',
    preco: 0,
    descricao: '',
  })

  const filteredProcedimentos = procedimentos.filter(procedimento =>
    procedimento.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      nome: '',
      duracao_minutos: 30,
      categoria: 'Consulta',
      preco: 0,
      descricao: '',
    })
    setEditingProcedimento(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.clinica_id) return
    
    if (editingProcedimento) {
      await updateProcedimento.mutateAsync({
        id: editingProcedimento.id,
        nome: formData.nome,
        duracao_minutos: formData.duracao_minutos,
        categoria: formData.categoria,
        preco: formData.preco,
        descricao: formData.descricao || null,
      })
    } else {
      await createProcedimento.mutateAsync({
        clinica_id: user.clinica_id,
        nome: formData.nome,
        duracao_minutos: formData.duracao_minutos,
        categoria: formData.categoria,
        preco: formData.preco,
        descricao: formData.descricao || null,
        ativo: true,
      })
    }
    
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (procedimento: {
    id: string
    nome: string
    duracao_minutos: number
    categoria: string | null
    preco: number
    descricao: string | null
  }) => {
    setEditingProcedimento(procedimento)
    setFormData({
      nome: procedimento.nome,
      duracao_minutos: procedimento.duracao_minutos,
      categoria: procedimento.categoria || 'Consulta',
      preco: procedimento.preco,
      descricao: procedimento.descricao || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await inativarProcedimento.mutateAsync(id)
  }

  const openNewDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/agenda/novo">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Procedimentos</h1>
            <p className="text-muted-foreground">
              Gerencie os procedimentos e tempos de duração
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Procedimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProcedimento ? 'Editar Procedimento' : 'Novo Procedimento'}
              </DialogTitle>
              <DialogDescription>
                {editingProcedimento 
                  ? 'Edite as informações do procedimento.'
                  : 'Cadastre um novo procedimento com sua duração.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Procedimento *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Limpeza, Clareamento"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="480"
                    value={formData.duracao_minutos}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        duracao_minutos: parseInt(e.target.value) || 30,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <select
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {PROCEDURE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        preco: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProcedimento ? 'Salvar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Procedimentos List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Procedimentos</CardTitle>
              <CardDescription>
                {filteredProcedimentos.length} procedimentos encontrados
              </CardDescription>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar procedimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcedimentos.map((procedimento) => (
                <TableRow key={procedimento.id}>
                  <TableCell className="font-medium">{procedimento.nome}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {procedimento.duracao_minutos}min
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/procedimentos/${procedimento.id}/materiais`}>
                        <Button variant="outline" size="sm" title="Configurar materiais">
                          <Package className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(procedimento)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir procedimento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{procedimento.nome}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(procedimento.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredProcedimentos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum procedimento encontrado.' : 'Nenhum procedimento cadastrado.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
