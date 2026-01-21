'use client'

import { useState } from 'react'
import { ArrowLeft, Edit, Plus, Minus, Trash2, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { formatCurrency } from '@/lib/utils'
import { useMockSelects } from '@/lib/api-mock-client'

// Mock de dados do produto (leve, só para exemplo)
const mockProduto = {
  id: '1',
  nome: 'Resina Composta 3M',
  category: 'Material Restaurador',
  quantity: 15,
  minQuantity: 10,
  unit: 'Unidade',
  price: 89.90,
  supplier: 'Dental Supply',
  brand: '3M',
  model: 'Filtek Z350 XT',
  colorSize: 'A2',
  batchNumber: 'LOT2024001',
  manufactureDate: '2024-01-01',
  expiryDate: '2025-12-31',
  lastPurchaseDate: '2024-01-15',
  description: 'Resina composta fotopolimerizável de alta qualidade para restaurações estéticas.',
  location: 'Armário A - Prateleira 2',
  observacoes: 'Manter em local seco e fresco. Proteger da luz solar direta.',
}

// Mock de dados de consumo (leve)
const consumoMensal = [
  { mes: 'Jan', saida: 12, entrada: 20 },
  { mes: 'Fev', saida: 8, entrada: 15 },
  { mes: 'Mar', saida: 15, entrada: 10 },
  { mes: 'Abr', saida: 6, entrada: 25 },
  { mes: 'Mai', saida: 10, entrada: 18 },
  { mes: 'Jun', saida: 9, entrada: 12 },
]

// Mock de lotes do produto (leve)
const mockLotes = [
  { id: 'LOT2024001', quantity: 10, expiryDate: '2025-12-31', manufactureDate: '2024-01-01' },
  { id: 'LOT2024002', quantity: 5, expiryDate: '2026-03-15', manufactureDate: '2024-03-01' },
  { id: 'LOT2024003', quantity: 8, expiryDate: '2025-08-20', manufactureDate: '2023-08-20' },
]

// Mock de movimentações (leve)
const mockMovimentacoes = [
  {
    id: '1',
    type: 'entrada',
    quantity: 10,
    date: '2024-01-15',
    reason: 'Compra mensal',
    user: 'João Silva',
    batchNumber: 'LOT2024001',
  },
  {
    id: '2',
    type: 'saida',
    quantity: 2,
    date: '2024-01-18',
    reason: 'Restauração dentária',
    user: 'Maria Santos',
    patient: 'João Pedro',
  },
  {
    id: '3',
    type: 'saida',
    quantity: 1,
    date: '2024-01-20',
    reason: 'Restauração dentária',
    user: 'Carlos Oliveira',
    patient: 'Ana Maria',
  },
]

export default function ProdutoDetalhePage() {
  const params = useParams()
  const produtoId = params.produtoId as string
  void produtoId
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(mockProduto)
  const [saidaQuantity, setSaidaQuantity] = useState('')
  const [saidaPatient, setSaidaPatient] = useState('')
  const [saidaProcedure, setSaidaProcedure] = useState('')
  const [saidaDentist, setSaidaDentist] = useState('')
  const [saidaDate, setSaidaDate] = useState('')
  const [saidaBatchNumber, setSaidaBatchNumber] = useState('')
  const [saidaSector, setSaidaSector] = useState('')
  const [saidaNotes, setSaidaNotes] = useState('')
  const [filterType, setFilterType] = useState('todos')
  const [addQuantity, setAddQuantity] = useState('')
  const [addBatchNumber, setAddBatchNumber] = useState('')
  const [addPurchaseDate, setAddPurchaseDate] = useState('')
  const [addSupplier, setAddSupplier] = useState('')
  const [addPrice, setAddPrice] = useState('')
  const [addExpiryDate, setAddExpiryDate] = useState('')
  const [addManufactureDate, setAddManufactureDate] = useState('')

  // Buscar selects via API (leve)
  const { data: mockPacientes } = useMockSelects('pacientes')
  const { data: mockDentistas } = useMockSelects('dentistas')
  const { data: mockProcedimentos } = useMockSelects('procedimentos')
  const { data: setores } = useMockSelects('setores')

  // Função para calcular dias até vencer
  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Função para filtrar movimentações
  const filteredMovimentacoes = mockMovimentacoes.filter(mov => {
    if (filterType === 'todos') return true
    return mov.type === filterType
  })

  // Função para obter status do estoque
  const getStockStatus = () => {
    if (formData.quantity === 0) return { label: 'Vazio', color: 'bg-red-500' }
    if (formData.quantity <= formData.minQuantity) return { label: 'Baixo', color: 'bg-orange-500' }
    return { label: 'Ok', color: 'bg-green-500' }
  }

  // Função para obter status da validade
  const getExpiryStatus = () => {
    const days = getDaysUntilExpiry(formData.expiryDate)
    if (!formData.expiryDate) return { label: 'Sem Validade', color: 'bg-gray-500' }
    if (days === null || days < 0) return { label: 'Vencido', color: 'bg-red-500' }
    if (days <= 30) return { label: 'Vencendo', color: 'bg-yellow-500' }
    if (days <= 90) return { label: 'Atenção', color: 'bg-orange-500' }
    return { label: 'Ok', color: 'bg-green-500' }
  }

  const stockStatus = getStockStatus()
  const expiryStatus = getExpiryStatus()

  const handleSave = () => {
    // Aqui viria a lógica para salvar no banco
    setIsEditing(false)
  }

  const handleEditar = () => {
    if (isEditing) {
      // Se está editando, cancela a edição
      setIsEditing(false)
    } else {
      // Se não está editando, inicia a edição
      setIsEditing(true)
      // Scroll para o início do formulário
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSaida = () => {
    const quantity = parseInt(saidaQuantity)
    if (!quantity || quantity <= 0) {
      alert('Por favor, informe uma quantidade válida')
      return
    }
    if (!saidaBatchNumber) {
      alert('Por favor, selecione um lote')
      return
    }
    
    // Verificar quantidade disponível no lote selecionado
    const selectedLote = mockLotes.find(l => l.id === saidaBatchNumber)
    if (!selectedLote || quantity > selectedLote.quantity) {
      alert(`Quantidade indisponível no lote ${saidaBatchNumber}. Disponível: ${selectedLote?.quantity || 0} ${formData.unit}`)
      return
    }
    
    // Verificar se produto está vencido
    const daysUntilExpiry = getDaysUntilExpiry(formData.expiryDate)
    if (daysUntilExpiry !== null && daysUntilExpiry < 0) {
      if (!confirm('⚠️ Este produto está vencido. Deseja mesmo assim registrar a saída?')) {
        return
      }
    }
    
    // Atualizar quantidade total e do lote
    const newQuantity = formData.quantity - quantity
    setFormData({...formData, quantity: newQuantity})
    // Em produção, atualizaria os lotes no banco também
    
    // Limpar formulário
    setSaidaQuantity('')
    setSaidaPatient('')
    setSaidaProcedure('')
    setSaidaDentist('')
    setSaidaDate('')
    setSaidaBatchNumber('')
    setSaidaSector('')
    setSaidaNotes('')
    
    // Feedback
    alert(`✅ Saída registrada: ${quantity} ${formData.unit} do lote ${saidaBatchNumber}`)
  }

  const handleAdicionar = () => {
    const quantity = parseInt(addQuantity)
    if (!quantity || quantity <= 0) {
      alert('Por favor, informe uma quantidade válida')
      return
    }
    
    // Atualizar quantidade
    const newQuantity = formData.quantity + quantity
    setFormData({...formData, quantity: newQuantity})
    
    // Atualizar outros campos se informados
    const updates: Record<string, unknown> = { quantity: newQuantity }
    if (addBatchNumber.trim()) updates.batchNumber = addBatchNumber
    if (addManufactureDate) updates.manufactureDate = addManufactureDate
    if (addExpiryDate) updates.expiryDate = addExpiryDate
    if (addPurchaseDate) updates.lastPurchaseDate = addPurchaseDate
    if (addSupplier.trim()) updates.supplier = addSupplier
    if (addPrice) updates.price = parseFloat(addPrice)
    
    setFormData({...formData, ...updates})
    
    // Limpar formulário
    setAddQuantity('')
    setAddBatchNumber('')
    setAddManufactureDate('')
    setAddExpiryDate('')
    setAddPurchaseDate('')
    setAddSupplier('')
    setAddPrice('')
    
    // Feedback
    alert(`✅ Entrada registrada: ${quantity} ${formData.unit}`)
  }

  const handleExcluir = () => {
    if (confirm(`⚠️ Tem certeza que deseja excluir "${formData.nome}"?`)) {
      alert('✅ Produto excluído com sucesso')
      // Redirecionar para lista de estoque
      window.location.href = '/estoque'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/estoque">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produto</h1>
            <p className="text-muted-foreground">
              Detalhes e gerenciamento do produto.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleEditar} variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
          
          <div className="flex items-center gap-2">
            {/* Modal de Adicionar Estoque */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Estoque</DialogTitle>
                <DialogDescription>
                  Registre a entrada de produtos no estoque.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Produto</Label>
                  <p className="font-medium">{formData.nome}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="addQuantity">Quantidade *</Label>
                    <Input
                      id="addQuantity"
                      type="number"
                      placeholder="Quantidade a adicionar"
                      value={addQuantity}
                      onChange={(e) => setAddQuantity(e.target.value)}
                      min="1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Estoque atual: {formData.quantity} {formData.unit}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="addBatchNumber">Número do Lote</Label>
                    <Input
                      id="addBatchNumber"
                      placeholder="Número do lote"
                      value={addBatchNumber}
                      onChange={(e) => setAddBatchNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addManufactureDate">Data de Fabricação</Label>
                    <Input
                      id="addManufactureDate"
                      type="date"
                      value={addManufactureDate}
                      onChange={(e) => setAddManufactureDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addExpiryDate">Data de Validade</Label>
                    <Input
                      id="addExpiryDate"
                      type="date"
                      value={addExpiryDate}
                      onChange={(e) => setAddExpiryDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addPurchaseDate">Data da Compra</Label>
                    <Input
                      id="addPurchaseDate"
                      type="date"
                      value={addPurchaseDate}
                      onChange={(e) => setAddPurchaseDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addSupplier">Fornecedor</Label>
                    <Input
                      id="addSupplier"
                      placeholder="Ex: Dental Supply"
                      value={addSupplier}
                      onChange={(e) => setAddSupplier(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addPrice">Preço Unitário (R$)</Label>
                    <Input
                      id="addPrice"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={addPrice}
                      onChange={(e) => setAddPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAdicionar} className="bg-green-600 hover:bg-green-700">
                  Adicionar Estoque
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

            {/* Modal de Registrar Saída */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" size="sm">
                  <Minus className="mr-2 h-4 w-4" />
                  Retirar
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Saída</DialogTitle>
                <DialogDescription>
                  Registre a retirada de produtos do estoque.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Produto</Label>
                  <p className="font-medium">{formData.nome}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="saidaQuantity">Quantidade *</Label>
                    <Input
                      id="saidaQuantity"
                      type="number"
                      placeholder="Quantidade a retirar"
                      value={saidaQuantity}
                      onChange={(e) => setSaidaQuantity(e.target.value)}
                      max={formData.quantity}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Estoque atual: {formData.quantity} {formData.unit}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="saidaBatchNumber">Lote *</Label>
                    <select
                      id="saidaBatchNumber"
                      value={saidaBatchNumber}
                      onChange={(e) => setSaidaBatchNumber(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione um lote...</option>
                      {mockLotes.map((lote) => (
                        <option key={lote.id} value={lote.id}>
                          {lote.id} - {lote.quantity} {formData.unit} - Validade: {new Date(lote.expiryDate).toLocaleDateString('pt-BR')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="saidaPatient">Paciente</Label>
                    <select
                      id="saidaPatient"
                      value={saidaPatient}
                      onChange={(e) => setSaidaPatient(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione um paciente...</option>
                      {(mockPacientes as any[])?.map((paciente) => (
                        <option key={paciente.id} value={paciente.id}>
                          {paciente.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="saidaProcedure">Procedimento</Label>
                    <select
                      id="saidaProcedure"
                      value={saidaProcedure}
                      onChange={(e) => setSaidaProcedure(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione um procedimento...</option>
                      {(mockProcedimentos as any[])?.map((proc) => (
                        <option key={proc.id} value={proc.id}>
                          {proc.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="saidaDentist">Dentista/Profissional</Label>
                    <select
                      id="saidaDentist"
                      value={saidaDentist}
                      onChange={(e) => setSaidaDentist(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione um profissional...</option>
                      {(mockDentistas as any[])?.map((dentista) => (
                        <option key={dentista.id} value={dentista.id}>
                          {dentista.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="saidaDate">Data da Saída</Label>
                    <Input
                      id="saidaDate"
                      type="date"
                      value={saidaDate}
                      onChange={(e) => setSaidaDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="saidaSector">Setor/Local</Label>
                    <select
                      id="saidaSector"
                      value={saidaSector}
                      onChange={(e) => setSaidaSector(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione um setor...</option>
                      {(setores as string[])?.map((setor) => (
                        <option key={setor} value={setor}>
                          {setor}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="saidaNotes">Observações</Label>
                    <textarea
                      id="saidaNotes"
                      value={saidaNotes}
                      onChange={(e) => setSaidaNotes(e.target.value)}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Observações adicionais sobre a saída..."
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSaida} className="bg-red-600 hover:bg-red-700">
                  Registrar Saída
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

            {/* Modal de Confirmação de Exclusão */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o produto "{formData.nome}"? 
                  Esta ação não pode ser desfeita e todos os dados históricos serão perdidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleExcluir} className="bg-red-600 hover:bg-red-700">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Fornecedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="colorSize">Cor/Tamanho</Label>
                    <Input
                      id="colorSize"
                      value={formData.colorSize}
                      onChange={(e) => setFormData({...formData, colorSize: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastPurchaseDate">Data da Compra</Label>
                    <Input
                      id="lastPurchaseDate"
                      type="date"
                      value={formData.lastPurchaseDate}
                      onChange={(e) => setFormData({...formData, lastPurchaseDate: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Nome do Produto</Label>
                    <p className="text-lg font-semibold">{formData.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                    <p>{formData.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Marca/Modelo</Label>
                    <p>{formData.brand} • {formData.model}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fornecedor</Label>
                    <p>{formData.supplier}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Localização</Label>
                    <p>{formData.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cor/Tamanho</Label>
                    <p>{formData.colorSize || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Data da Compra</Label>
                    <p>{formData.lastPurchaseDate ? new Date(formData.lastPurchaseDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                    <p>{formData.description}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                    <p>{formData.observacoes}</p>
                  </div>
                </div>
              )}
              
              {isEditing && (
                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Consumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Consumo Mensal
              </CardTitle>
              <CardDescription>
                Histórico de entradas e saídas dos últimos 6 meses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {consumoMensal.reduce((total, item) => total + item.entrada, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Entradas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {consumoMensal.reduce((total, item) => total + item.saida, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Saídas</div>
                  </div>
                </div>
                
                {/* Gráfico de barras simplificado */}
                <div className="space-y-2">
                  {consumoMensal.map((item, index) => {
                    const maxValue = Math.max(...consumoMensal.map(m => Math.max(m.entrada, m.saida)))
                    const entradaHeight = (item.entrada / maxValue) * 100
                    const saidaHeight = (item.saida / maxValue) * 100
                    
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-12 text-sm font-medium">{item.mes}</div>
                        <div className="flex-1 flex gap-2 items-end h-8">
                          <div className="flex-1 relative">
                            <div 
                              className="bg-green-500 rounded-sm transition-all duration-300"
                              style={{ height: `${entradaHeight}%` }}
                              title={`Entrada: ${item.entrada}`}
                            />
                          </div>
                          <div className="flex-1 relative">
                            <div 
                              className="bg-red-500 rounded-sm transition-all duration-300"
                              style={{ height: `${saidaHeight}%` }}
                              title={`Saída: ${item.saida}`}
                            />
                          </div>
                        </div>
                        <div className="w-16 text-xs text-right">
                          <div className="text-green-600">+{item.entrada}</div>
                          <div className="text-red-600">-{item.saida}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estoque</span>
                <Badge className={stockStatus.color}>
                  {stockStatus.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Validade</span>
                <Badge className={expiryStatus.color}>
                  {expiryStatus.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quantidade</span>
                <span className="font-medium">{formData.quantity} {formData.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mínimo</span>
                <span className="font-medium">{formData.minQuantity} {formData.unit}</span>
              </div>
            </CardContent>
          </Card>

          {/* Movimentações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Movimentações</CardTitle>
              <CardDescription>
                Últimas movimentações do produto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMovimentacoes.slice(0, 5).map((mov) => (
                  <div key={mov.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        mov.type === 'entrada' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium">
                          {mov.type === 'entrada' ? 'Entrada' : 'Saída'}: {mov.quantity} {formData.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(mov.date).toLocaleDateString('pt-BR')} • {mov.user}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
