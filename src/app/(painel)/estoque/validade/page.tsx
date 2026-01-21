'use client'

import React, { useState } from 'react'
import { ArrowLeft, Search, Filter, AlertTriangle, Calendar, Package, Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'

// Mock data - em produção viria do banco de dados
const produtosValidade = [
  {
    id: '1',
    nome: 'Anestésico Lidocaína 2%',
    category: 'Anestésico',
    quantity: 8,
    unit: 'Tubo',
    price: 12.50,
    brand: 'Novocol',
    model: 'Lidocaína 2%',
    batchNumber: 'LOT2024002',
    manufactureDate: '2023-12-01',
    expiryDate: '2024-06-30',
    lastPurchaseDate: '2024-01-14',
  },
  {
    id: '2',
    nome: 'Clareador Dental',
    category: 'Estética',
    quantity: 5,
    unit: 'Kit',
    price: 120.00,
    brand: 'Opalescence',
    model: 'PF 15%',
    batchNumber: 'LOT2024004',
    manufactureDate: '2023-11-15',
    expiryDate: '2024-08-15',
    lastPurchaseDate: '2024-01-10',
  },
  {
    id: '3',
    nome: 'Sutura Cirúrgica',
    category: 'Descartável',
    quantity: 25,
    unit: 'Pacote',
    price: 45.00,
    brand: 'Ethicon',
    model: 'Vicryl 3-0',
    batchNumber: 'LOT2024006',
    manufactureDate: '2023-10-20',
    expiryDate: '2025-03-20',
    lastPurchaseDate: '2024-01-05',
  },
  {
    id: '4',
    nome: 'Resina Composta 3M',
    category: 'Material Restaurador',
    quantity: 15,
    unit: 'Unidade',
    price: 89.90,
    brand: '3M',
    model: 'Filtek Z350 XT',
    batchNumber: 'LOT2024001',
    manufactureDate: '2024-01-01',
    expiryDate: '2025-12-31',
    lastPurchaseDate: '2024-01-15',
  },
  {
    id: '5',
    nome: 'Luvas Cirúrgicas Tamanho M',
    category: 'Descartável',
    quantity: 200,
    unit: 'Caixa',
    price: 45.00,
    brand: 'MedSupply',
    model: 'Lite',
    batchNumber: 'LOT2024003',
    manufactureDate: '2024-01-10',
    expiryDate: '2026-01-10',
    lastPurchaseDate: '2024-01-12',
  },
  {
    id: '6',
    nome: 'Cimento de Ionômero',
    category: 'Material Restaurador',
    quantity: 12,
    unit: 'Unidade',
    price: 89.90,
    brand: '3M',
    model: 'Vitremer',
    batchNumber: 'LOT2024007',
    manufactureDate: '2023-09-15',
    expiryDate: '2024-03-15',
    lastPurchaseDate: '2024-01-12',
  },
]

export default function ValidadePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Função para calcular dias até vencer
  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Função para obter status da validade
  const getExpiryStatus = (expiryDate: string | null) => {
    const days = getDaysUntilExpiry(expiryDate)
    if (!expiryDate) return { status: 'no-expiry', label: 'Sem Validade', color: 'text-gray-500' }
    if (days === null || days < 0) return { status: 'expired', label: 'Vencido', color: 'text-red-600 font-semibold' }
    if (days <= 30) return { status: 'critical', label: 'Crítico', color: 'text-red-600 font-semibold' }
    if (days <= 90) return { status: 'warning', label: 'Atenção', color: 'text-yellow-600 font-semibold' }
    return { status: 'ok', label: 'OK', color: 'text-green-600' }
  }

  const filteredProducts = produtosValidade.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || produto.category === selectedCategory
    const matchesStatus = !selectedStatus || getExpiryStatus(produto.expiryDate).status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = [...new Set(produtosValidade.map(p => p.category))]
  const today = new Date()

  const expiredProducts = produtosValidade.filter(p => {
    const days = getDaysUntilExpiry(p.expiryDate)
    return days !== null && days < 0
  })

  const criticalProducts = produtosValidade.filter(p => {
    const days = getDaysUntilExpiry(p.expiryDate)
    return days !== null && days >= 0 && days <= 30
  })

  const warningProducts = produtosValidade.filter(p => {
    const days = getDaysUntilExpiry(p.expiryDate)
    return days !== null && days > 30 && days <= 90
  })

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
            <h1 className="text-3xl font-bold tracking-tight">Validade</h1>
            <p className="text-muted-foreground">
              Contpapel de validade e vencimento de produtos.
            </p>
          </div>
        </div>
        <Link href="/estoque/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <div>
              <div className="text-2xl font-bold text-red-600">{expiredProducts.length}</div>
              <p className="text-xs text-muted-foreground">Produtos vencidos</p>
            </div>
            {expiredProducts.length > 0 && (
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedStatus('expired')}
                >
                  Ver Todos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <div>
              <div className="text-2xl font-bold text-orange-600">{criticalProducts.length}</div>
              <p className="text-xs text-muted-foreground">Vencem em 30 dias</p>
            </div>
            {criticalProducts.length > 0 && (
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedStatus('critical')}
                >
                  Ver Todos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{warningProducts.length}</div>
              <p className="text-xs text-muted-foreground">Vencem em 90 dias</p>
            </div>
            {warningProducts.length > 0 && (
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedStatus('warning')}
                >
                  Ver Todos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Validade</CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {produtosValidade.filter(p => !p.expiryDate).length}
              </div>
              <p className="text-xs text-muted-foreground">Data não informada</p>
            </div>
            {produtosValidade.filter(p => !p.expiryDate).length > 0 && (
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedStatus('no-expiry')}
                >
                  Ver Todos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contpapel de Validade</CardTitle>
              <CardDescription>
                {filteredProducts.length} produtos encontrados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">Todos status</option>
                <option value="expired">Vencidos</option>
                <option value="critical">Críticos</option>
                <option value="warning">Atenção</option>
                <option value="ok">OK</option>
                <option value="no-expiry">Sem Validade</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">Todas categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div>Produto</div>
              <div>Validade</div>
              <div>Dias</div>
              <div>Estoque</div>
              <div>Status</div>
              <div className="w-10"></div>
            </div>
            <div className="divide-y">
              {filteredProducts.map((produto) => {
                const days = getDaysUntilExpiry(produto.expiryDate)
                const expiryStatus = getExpiryStatus(produto.expiryDate)
                
                return (
                  <TableRow key={produto.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <div>{produto.nome}</div>
                        <div className="text-sm text-muted-foreground">{produto.brand} • {produto.model}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm font-medium ${expiryStatus.color}`}>
                        {produto.expiryDate ? new Date(produto.expiryDate).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {days !== null ? `${days} dias` : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {produto.quantity} {produto.unit}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          expiryStatus.status === 'expired' ? 'destructive' : 
                          expiryStatus.status === 'critical' ? 'destructive' :
                          expiryStatus.status === 'warning' ? 'secondary' :
                          expiryStatus.status === 'no-expiry' ? 'outline' : 'default'
                        }
                        className={
                          expiryStatus.status === 'critical' ? 'bg-orange-500 hover:bg-orange-600' :
                          expiryStatus.status === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''
                        }
                      >
                        {expiryStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Descartar</DropdownMenuItem>
                          <DropdownMenuItem>Transferir</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </div>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
