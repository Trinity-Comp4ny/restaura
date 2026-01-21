'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Search, ArrowLeft } from 'lucide-react'
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

// Mock data - em produção viria do banco de dados
const categoriasMock = [
  { id: '1', nome: 'Material Restaurador', description: 'Resinas, cimentos, ionômeros', productCount: 15, ativo: true },
  { id: '2', nome: 'Anestésico', description: 'Anestésicos locais e agulhas', productCount: 8, ativo: true },
  { id: '3', nome: 'Descartável', description: 'Luvas, máscaras, gorros', productCount: 23, ativo: true },
  { id: '4', nome: 'Instrumental', description: 'Brocas, espátulas, espelhos', productCount: 31, ativo: true },
  { id: '5', nome: 'Equipamento', description: 'Equipamentos e acessórios', productCount: 5, ativo: true },
  { id: '6', nome: 'Higiene', description: 'Produtos de higiene bucal', productCount: 12, ativo: true },
  { id: '7', nome: 'Ortodontia', description: 'Materiais ortodônticos', productCount: 18, ativo: true },
  { id: '8', nome: 'Endodontia', description: 'Materiais endodônticos', productCount: 9, ativo: false },
]

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState(categoriasMock)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<typeof categoriasMock[0] | null>(null)
  const [formData, setFormData] = useState({
    nome: ''
  })

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      nome: ''
    })
    setEditingCategoria(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCategoria) {
      // Editar categoria existente
      setCategorias(prev => prev.map(c => 
        c.id === editingCategoria.id 
          ? { ...c, nome: formData.nome }
          : c
      ))
    } else {
      // Criar nova categoria
      const newCategoria = {
        id: Date.now().toString(),
        nome: formData.nome,
        description: '',
        productCount: 0,
        ativo: true
      }
      setCategorias(prev => [...prev, newCategoria])
    }
    
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (categoria: typeof categoriasMock[0]) => {
    setEditingCategoria(categoria)
    setFormData({
      nome: categoria.nome
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setCategorias(prev => prev.filter(c => c.id !== id))
  }

  
  const openNewDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/estoque/novo">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
            <p className="text-muted-foreground">
              Gerencie as categorias de produtos do estoque.
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
              <DialogDescription>
                {editingCategoria 
                  ? 'Edite as informações da categoria.'
                  : 'Cadastre uma nova categoria de produtos.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Categoria *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Material Restaurador"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCategoria ? 'Salvar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      
      {/* Lista de Categorias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Categorias</CardTitle>
              <CardDescription>
                {filteredCategorias.length} categorias encontradas
              </CardDescription>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categoria..."
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell className="font-medium">{categoria.nome}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(categoria)}
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
                            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{categoria.nome}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(categoria.id)}>
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
          
          {filteredCategorias.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhuma categoria encontrada.' : 'Nenhuma categoria cadastrada.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
