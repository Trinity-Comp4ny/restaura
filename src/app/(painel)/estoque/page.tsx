'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Package, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useMockEstoque } from '@/lib/api-mock-client'

// Componente leve para status do produto
function ProductStatusBadge({ product }: { product: any }) {
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
  
  const isLowStock = product.quantity <= product.minQuantity
  const isExpired = product.expiryDate && new Date(product.expiryDate) < today
  const isExpiringSoon = product.expiryDate && new Date(product.expiryDate) <= thirtyDaysFromNow && new Date(product.expiryDate) >= today
  const isEmpty = product.quantity === 0

  let status = 'Ok'
  let color = 'bg-green-500'

  if (isEmpty || isExpired) {
    status = isEmpty ? 'Vazio' : 'Vencido'
    color = 'bg-red-500'
  } else if (isExpiringSoon) {
    status = 'Vencendo'
    color = 'bg-yellow-500'
  } else if (isLowStock) {
    status = 'Baixo'
    color = 'bg-orange-500'
  }

  return (
    <Badge
      variant={isEmpty || isExpired ? 'destructive' : isExpiringSoon ? 'secondary' : 'success'}
      className={
        isEmpty || isExpired ? 'bg-red-500 hover:bg-red-600' :
        isExpiringSoon ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
        isLowStock ? 'bg-orange-500 hover:bg-orange-600' : ''
      }
    >
      {status}
    </Badge>
  )
}

// Componente para card de produto
function ProductCard({ product }: { product: any }) {
  const router = useRouter()
  const getDaysUntilExpiry = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return null
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryColor = (expiryDate: string | null | undefined) => {
    const days = getDaysUntilExpiry(expiryDate)
    if (!expiryDate) return 'text-gray-500'
    if (days === null || days < 0) return 'text-red-600 font-semibold'
    if (days <= 30) return 'text-orange-600 font-semibold'
    if (days <= 90) return 'text-yellow-600'
    return 'text-green-600'
  }

  const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate)

  return (
    <Link
      href={`/estoque/${product.id}`}
      className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer"
    >
      <div>
        <div className="font-medium">{product.nome}</div>
        <div className="text-sm text-muted-foreground">{product.brand} • {product.model}</div>
      </div>
      <div>
        <div className="text-sm font-medium">{product.quantity} {product.unit}</div>
        <div className="text-xs text-muted-foreground">
          Mín: {product.minQuantity} {product.unit}
        </div>
      </div>
      <div>
        <div className={`text-sm font-medium ${getExpiryColor(product.expiryDate)}`}>
          {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'N/A'}
        </div>
        {product.expiryDate && (
          <div className="text-xs text-muted-foreground">
            {daysUntilExpiry} dias
          </div>
        )}
      </div>
      <div>
        <ProductStatusBadge product={product} />
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/estoque/${product.id}`)}>
              Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/estoque/${product.id}?edit=true`)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Adicionar estoque', product.id)}>
              Adicionar Estoque
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Registrar saída', product.id)}>
              Registrar Saída
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                if (confirm(`⚠️ Tem certeza que deseja excluir "${product.nome}"?`)) {
                  console.log('Excluir produto', product.id)
                }
              }}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  )
}

// Componentes para cards de estatísticas
function StatsCards({ products }: { products: any[] }) {
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
  
  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity)
  const expiringSoonProducts = products.filter(p => {
    if (!p.expiryDate) return false
    const expiryDate = new Date(p.expiryDate)
    return expiryDate <= thirtyDaysFromNow && expiryDate >= today
  })
  const expiredProducts = products.filter(p => {
    if (!p.expiryDate) return false
    return new Date(p.expiryDate) < today
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{products.length}</div>
          <p className="text-xs text-muted-foreground">Cadastrados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
          <p className="text-xs text-muted-foreground">Precisa reposição</p>
          {lowStockProducts.length > 0 && (
            <div className="mt-3">
              <Link href="/estoque/estoque-baixo">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Todos
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencendo em 30 dias</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{expiringSoonProducts.length}</div>
          <p className="text-xs text-muted-foreground">Próximos do vencimento</p>
          {(expiringSoonProducts.length > 0 || expiredProducts.length > 0) && (
            <div className="mt-3">
              <Link href="/estoque/validade">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Todos
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(products.reduce((total, p) => total + (p.price || 0) * p.quantity, 0))}</div>
          <p className="text-xs text-muted-foreground">Valor em estoque</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EstoquePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')

  // Usar hook otimizado que busca via API route (server-side mock)
  const { data: estoqueData, isLoading } = useMockEstoque({
    search,
    category,
    status,
  }) as { data?: { data: any[] }, isLoading: boolean }

  const products = estoqueData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie os materiais e produtos da clínica.
          </p>
        </div>
        <Link href="/estoque/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-3 w-16 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <CardDescription>
                <Skeleton className="h-4 w-48" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <StatsCards products={products} />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Produtos</CardTitle>
                  <CardDescription>
                    Gerencie os itens do seu estoque.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar produto..."
                      className="pl-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
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
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b bg-muted/50 px-6 py-3 text-sm font-medium text-muted-foreground">
                  <div>Produto</div>
                  <div>Estoque</div>
                  <div>Validade</div>
                  <div>Status</div>
                  <div className="w-10"></div>
                </div>
                <div className="divide-y">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
