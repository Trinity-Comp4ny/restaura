'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, DollarSign, Calendar, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateTransacao } from '@/hooks/use-transacoes'
import { useUser } from '@/hooks/use-user'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

const transacaoSchema = z.object({
  type: z.enum(['receita', 'despesa']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  payment_method: z.string().optional(),
  due_date: z.string().optional(),
  paciente_id: z.string().optional(),
})

type TransacaoFormData = z.infer<typeof transacaoSchema>

const categoriasReceita = [
  'Consulta',
  'Tratamento',
  'Procedimento',
  'Produto',
  'Outros',
]

const categoriasDespesa = [
  'Material',
  'Aluguel',
  'Salários',
  'Marketing',
  'Serviços',
  'Impostos',
  'Outros',
]

const metodosPagamento = [
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'PIX',
  'Transferência Bancária',
  'Cheque',
  'Convênio',
]

export default function NovaTransacaoPage() {
  const router = useRouter()
  const { data: user } = useUser()
  const createTransacao = useCreateTransacao()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransacaoFormData>({
    resolver: zodResolver(transacaoSchema),
  })

  const tipoTransacao = watch('type')

  async function onSubmit(data: TransacaoFormData) {
    if (!user?.clinica_id) return

    const transacaoData = {
      ...data,
      clinica_id: user.clinica_id,
      amount: parseFloat(data.amount.replace(/[^\d.,]/g, '').replace(',', '.')),
      paciente_id: data.paciente_id || null,
      payment_method: data.payment_method || null,
      due_date: data.due_date || null,
    }

    await createTransacao.mutateAsync(transacaoData)
    router.push('/financeiro/transacoes')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/financeiro/transacoes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Transação</h1>
          <p className="text-muted-foreground">
            Registre uma receita ou despesa.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Transação</CardTitle>
            <CardDescription>
              Preencha os dados básicos da movimentação.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <select
                id="type"
                {...register('type')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
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
                {(tipoTransacao === 'receita' ? categoriasReceita : categoriasDespesa).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Ex: Consulta ortodontia - Maria Silva"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                {...register('amount')}
                placeholder="0,00"
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <select
                id="payment_method"
                {...register('payment_method')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                {metodosPagamento.map((metodo) => (
                  <option key={metodo} value={metodo}>
                    {metodo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
              />
            </div>

            {tipoTransacao === 'receita' && (
              <div className="space-y-2">
                <Label htmlFor="paciente_id">Paciente</Label>
                <select
                  id="paciente_id"
                  {...register('paciente_id')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {/* Aqui viria a lista de pacientes do Supabase */}
                  <option value="1">Maria Silva</option>
                  <option value="2">Carlos Santos</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Cadastrar Transação'}
          </Button>
        </div>
      </form>
    </div>
  )
}
