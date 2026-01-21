'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/hooks/use-user'
import Link from 'next/link'

const produtoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().optional(),
  quantity: z.string().min(1, 'Quantidade é obrigatória'),
  min_quantity: z.string().min(1, 'Quantidade mínima é obrigatória'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  price: z.string().optional(),
  supplier: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color_size: z.string().optional(),
  batch_number: z.string().optional(),
  manufacture_date: z.string().optional(),
  expiry_date: z.string().optional(),
  last_purchase_date: z.string().optional(),
})

type ProdutoFormData = z.infer<typeof produtoSchema>

const categorias = [
  'Material Restaurador',
  'Anestésico',
  'Descartável',
  'Instrumental',
  'Equipamento',
  'Higiene',
  'Outros',
]

const unidades = [
  'Unidade',
  'Caixa',
  'Frasco',
  'Tubo',
  'Kit',
  'Pacote',
  'Par',
]

export default function NovoProdutoPage() {
  const router = useRouter()
  useUser()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
  })

  async function onSubmit(_data: ProdutoFormData) {
    // Implementar criação do produto
    router.push('/estoque')
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
            <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
            <p className="text-muted-foreground">
              Cadastre um novo item no estoque.
            </p>
          </div>
        </div>
        <Link 
          href="/estoque/categorias" 
          className="text-sm text-primary hover:underline"
        >
          Gerenciar categorias
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>
              Preencha os dados básicos do produto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primeira linha - 2 colunas */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Ex: Resina Composta 3M"
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <select
                  id="category"
                  {...register('category')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Demais linhas - 3 colunas */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Descrição detalhada do produto..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade Atual *</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...register('quantity')}
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_quantity">Quantidade Mínima *</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  {...register('min_quantity')}
                  placeholder="0"
                />
                {errors.min_quantity && (
                  <p className="text-sm text-destructive">{errors.min_quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unidade *</Label>
                <select
                  id="unit"
                  {...register('unit')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {unidades.map((unidade) => (
                    <option key={unidade} value={unidade}>
                      {unidade}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-sm text-destructive">{errors.unit.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço Unitário (R$)</Label>
                <Input
                  id="price"
                  {...register('price')}
                  placeholder="0,00"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  {...register('supplier')}
                  placeholder="Ex: Dental Supply"
                />
                {errors.supplier && (
                  <p className="text-sm text-destructive">{errors.supplier.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca/Fabricante</Label>
                <Input
                  id="brand"
                  {...register('brand')}
                  placeholder="Ex: 3M, Ivoclar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  {...register('model')}
                  placeholder="Ex: Filtek Z350 XT"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color_size">Cor/Tamanho</Label>
                <Input
                  id="color_size"
                  {...register('color_size')}
                  placeholder="Ex: A2, Pequeno, Azul"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch_number">Lote</Label>
                <Input
                  id="batch_number"
                  {...register('batch_number')}
                  placeholder="Ex: LOT2024001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacture_date">Data de Fabricação</Label>
                <Input
                  id="manufacture_date"
                  type="date"
                  {...register('manufacture_date')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">Data de Validade</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  {...register('expiry_date')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_purchase_date">Data da Compra</Label>
                <Input
                  id="last_purchase_date"
                  type="date"
                  {...register('last_purchase_date')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Cadastrar Produto'}
          </Button>
        </div>
      </form>
    </div>
  )
}
