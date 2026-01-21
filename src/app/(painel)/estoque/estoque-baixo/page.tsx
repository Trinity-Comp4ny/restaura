'use client'

import React, { useState } from 'react'
import { ArrowLeft, Search, Filter, AlertTriangle, Package, Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'

// Mock data - em produção viria do banco de dados
const produtosBaixoEstoque = [
  {
    id: '1',
    nome: 'Anestésico Lidocaína 2%',
    category: 'Anestésico',
    quantity: 8,
    minQuantity: 15,
    unit: 'Tubo',
    price: 12.50,
    supplier: 'PharmaDent',
    brand: 'Novocol',
    model: 'Lidocaína 2%',
    batchNumber: 'LOT2024002',
    expiryDate: '2024-06-30',
    lastPurchaseDate: '2024-01-14',
  },
  {
    id: '2',
    nome: 'Clareador Dental',
    category: 'Estética',
    quantity: 5,
    minQuantity: 10,
    unit: 'Kit',
    price: 120.00,
    supplier: 'Dental Supply',
    brand: 'Opalescence',
    model: 'PF 15%',
    batchNumber: 'LOT2024004',
    expiryDate: '2024-08-15',
    lastPurchaseDate: '2024-01-10',
  },
  {
    id: '3',
    nome: 'Broca Diamantada',
    category: 'Instrumental',
    quantity: 18,
    minQuantity: 20,
    unit: 'Unidade',
    price: 35.50,
    supplier: 'Dental Supply',
    brand: 'KG Sorensen',
    model: '3215',
    batchNumber: 'LOT2024005',
    expiryDate: null,
    lastPurchaseDate: '2024-01-08',
  },
  {
    id: '4',
    nome: 'Sutura Cirúrgica',
    category: 'Descartável',
    quantity: 25,
    minQuantity: 50,
    unit: 'Pacote',
    price: 45.00,
    supplier: 'MedSupply',
    brand: 'Ethicon',
    model: 'Vicryl 3-0',
    batchNumber: 'LOT2024006',
    expiryDate: '2025-03-20',
    lastPurchaseDate: '2024-01-05',
  },
  {
    id: '5',
    nome: 'Cimento de Ionômero',
    category: 'Material Restaurador',
    quantity: 12,
    minQuantity: 20,
    unit: 'Unidade',
    price: 89.90,
    supplier: 'Dental Supply',
    brand: '3M',
    model: 'Vitremer',
    batchNumber: 'LOT2024007',
    expiryDate: '2024-12-31',
    lastPurchaseDate: '2024-01-12',
  },
]

export default function EstoqueBaixoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const filteredProducts = produtosBaixoEstoque.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || produto.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(produtosBaixoEstoque.map(p => p.category))]

  const calculateDeficit = (quantity: number, minQuantity: number) => {
    return minQuantity - quantity
  }

  const calculateTotalValue = (quantity: number, price: number) => {
    return quantity * price
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
            <h1 className="text-3xl font-bold tracking-tight">Estoque Baixo</h1>
            <p className="text-muted-foreground">
              Produtos que precisam de reposição urgente.
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{produtosBaixoEstoque.length}</div>
            <p className="text-xs text-muted-foreground">Produtos com estoque baixo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Déficit Total</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {produtosBaixoEstoque.reduce((total, p) => total + calculateDeficit(p.quantity, p.minQuantity), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Unidades faltantes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor para Reposição</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(produtosBaixoEstoque.reduce((total, p) => total + (calculateDeficit(p.quantity, p.minQuantity) * (p.price || 0)), 0))}
            </div>
            <p className="text-xs text-muted-foreground">Investimento necessário</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos com Estoque Baixo</CardTitle>
              <CardDescription>
                {filteredProducts.length} produtos encontrados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div>Produto</div>
              <div>Estoque Atual</div>
              <div>Estoque Mínimo</div>
              <div>Déficit</div>
              <div>Valor Unit.</div>
              <div>Valor Total</div>
              <div className="w-10"></div>
            </div>
            <div className="divide-y">
              {filteredProducts.map((produto) => (
                <TableRow key={produto.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div>
                      <div>{produto.nome}</div>
                      <div className="text-sm text-muted-foreground">{produto.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-orange-600">
                      {produto.quantity} {produto.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {produto.minQuantity} {produto.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-red-600">
                      -{calculateDeficit(produto.quantity, produto.minQuantity)} {produto.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {produto.price ? formatCurrency(produto.price) : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {produto.price ? formatCurrency(calculateTotalValue(produto.quantity, produto.price)) : 'N/A'}
                    </div>
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
                        <DropdownMenuItem>Repor Estoque</DropdownMenuItem>
                        <DropdownMenuItem>Gerar Pedido</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </div>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
