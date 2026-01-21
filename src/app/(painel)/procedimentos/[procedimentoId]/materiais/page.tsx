'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Package, Search, AlertTriangle, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Switch } from '@/components/ui/switch'

import { useProcedimento } from '@/hooks/use-procedimentos'
import { useUser } from '@/hooks/use-user'
import {
  useAddMaterialProcedimento,
  useMateriaisProcedimento,
  useProdutos,
  useRemoveMaterialProcedimento,
  useUpdateMaterialProcedimento,
} from '@/hooks/use-estoque'

export default function ProcedimentoMateriaisPage() {
  const params = useParams()
  const procedimentoId = params.procedimentoId as string

  const { data: user } = useUser()
  const { data: procedimento } = useProcedimento(procedimentoId)
  const { data: produtos = [] } = useProdutos()
  const { data: materiais = [] } = useMateriaisProcedimento(procedimentoId)
  const addMaterial = useAddMaterialProcedimento()
  const removeMaterial = useRemoveMaterialProcedimento()
  const updateMaterial = useUpdateMaterialProcedimento()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [formData, setFormData] = useState({
    quantity_default: 1,
    quantity_min: 1,
    quantity_max: 10,
    is_required: true,
    is_variable: false,
  })

  // Produtos disponíveis (que ainda não estão associados)
  const produtosDisponiveis = produtos.filter(
    p => !materiais.some(m => m.product_id === p.id)
  )

  const filteredProdutos = produtosDisponiveis.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddMaterial = async () => {
    if (!selectedProduct) return
    if (!user?.clinica_id) return

    await addMaterial.mutateAsync({
      clinica_id: user.clinica_id,
      procedimento_id: procedimentoId,
      product_id: selectedProduct,
      quantity_default: formData.quantity_default,
      quantity_min: formData.quantity_min,
      quantity_max: formData.quantity_max,
      is_required: formData.is_required,
      is_variable: formData.is_variable,
      substitute_product_id: null,
      clinical_observacoes: null,
    })

    setIsDialogOpen(false)
    resetForm()
  }

  const handleRemoveMaterial = async (id: string) => {
    await removeMaterial.mutateAsync({ id, procedureId: procedimentoId })
  }

  const handleToggleRequired = async (id: string, currentValue: boolean) => {
    await updateMaterial.mutateAsync({
      id,
      procedureId: procedimentoId,
      updates: { is_required: !currentValue },
    })
  }

  const handleToggleVariable = async (id: string, currentValue: boolean) => {
    await updateMaterial.mutateAsync({
      id,
      procedureId: procedimentoId,
      updates: { is_variable: !currentValue },
    })
  }

  const resetForm = () => {
    setSelectedProduct('')
    setSearchTerm('')
    setFormData({
      quantity_default: 1,
      quantity_min: 1,
      quantity_max: 10,
      is_required: true,
      is_variable: false,
    })
  }

  // Calcular custo estimado
  const custoEstimado = materiais.reduce((total, mat) => {
    return total + ((mat.produto?.price || 0) * mat.quantity_default)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/procedimentos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Materiais do Procedimento</h1>
            <p className="text-muted-foreground">
              Configure os materiais utilizados em <strong>{procedimento?.nome || 'Procedimento'}</strong>
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Material ao Procedimento</DialogTitle>
              <DialogDescription>
                Selecione um produto do estoque e configure as quantidades.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Busca de Produto */}
              <div className="space-y-2">
                <Label>Produto *</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                {searchTerm && filteredProdutos.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {filteredProdutos.map(produto => (
                      <div
                        key={produto.id}
                        className={`p-2 cursor-pointer hover:bg-muted flex items-center justify-between ${
                          selectedProduct === produto.id ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => {
                          setSelectedProduct(produto.id)
                          setSearchTerm(produto.nome)
                        }}
                      >
                        <div>
                          <p className="font-medium">{produto.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {produto.category} • {produto.quantity} {produto.unit} em estoque
                          </p>
                        </div>
                        {selectedProduct === produto.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {searchTerm && filteredProdutos.length === 0 && (
                  <p className="text-sm text-muted-foreground py-2">
                    Nenhum produto encontrado ou todos já estão associados.
                  </p>
                )}
              </div>

              {/* Configurações de Quantidade */}
              {selectedProduct && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="qty-default">Qtd Padrão *</Label>
                      <Input
                        id="qty-default"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.quantity_default}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          quantity_default: parseFloat(e.target.value) || 1
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qty-min">Qtd Mínima</Label>
                      <Input
                        id="qty-min"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.quantity_min}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          quantity_min: parseFloat(e.target.value) || 1
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qty-max">Qtd Máxima</Label>
                      <Input
                        id="qty-max"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.quantity_max}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          quantity_max: parseFloat(e.target.value) || 10
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Material Obrigatório</Label>
                      <p className="text-xs text-muted-foreground">
                        Bloqueia o procedimento se não houver estoque
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_required}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        is_required: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Quantidade Variável</Label>
                      <p className="text-xs text-muted-foreground">
                        Permite ajustar a quantidade durante o procedimento
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_variable}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        is_variable: checked
                      }))}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddMaterial} disabled={!selectedProduct}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Materiais Configurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{materiais.length}</p>
            <p className="text-xs text-muted-foreground">
              {materiais.filter(m => m.is_required).length} obrigatórios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Custo Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {custoEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-muted-foreground">
              Por procedimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Margem Estimada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {(((procedimento?.preco || 0) - custoEstimado)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-muted-foreground">
              {procedimento?.preco
                ? ((((procedimento.preco - custoEstimado) / procedimento.preco) * 100).toFixed(1))
                : '0.0'}% do preço
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Materiais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Materiais Associados
          </CardTitle>
          <CardDescription>
            Materiais que serão sugeridos para consumo quando este procedimento for realizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {materiais.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum material associado a este procedimento.</p>
              <p className="text-sm">Clique em "Adicionar Material" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-center">Qtd Padrão</TableHead>
                  <TableHead className="text-center">Min/Máx</TableHead>
                  <TableHead className="text-center">Obrigatório</TableHead>
                  <TableHead className="text-center">Variável</TableHead>
                  <TableHead className="text-right">Custo Unit.</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materiais.map((mat) => {
                  const produto = mat.produto
                  if (!produto) return null

                  return (
                    <TableRow key={mat.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{produto.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {produto.category} • {produto.quantity} {produto.unit} em estoque
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {mat.quantity_default} {produto.unit}
                      </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {mat.quantity_min} - {mat.quantity_max}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={mat.is_required}
                        onCheckedChange={() => handleToggleRequired(mat.id, mat.is_required)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={mat.is_variable}
                        onCheckedChange={() => handleToggleVariable(mat.id, mat.is_variable)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {produto.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover material?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Deseja remover "{produto.nome}" deste procedimento?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveMaterial(mat.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Alerta de Estoque */}
      {materiais.some(m => m.is_required && (m.produto?.quantity || 0) < m.quantity_default) && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Atenção - Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">
              Alguns materiais obrigatórios estão com estoque insuficiente:
            </p>
            <ul className="mt-2 space-y-1">
              {materiais
                .filter(m => m.is_required && (m.produto?.quantity || 0) < m.quantity_default)
                .map(m => (
                  <li key={m.id} className="text-sm text-orange-600">
                    • {m.produto?.nome || 'Material'} - Necessário: {m.quantity_default}, Disponível: {m.produto?.quantity || 0}
                  </li>
                ))
              }
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
