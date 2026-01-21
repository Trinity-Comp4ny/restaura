'use client'

import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useMockSelects } from '@/lib/api-mock-client'

const leadEditSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  source: z.string().min(1, 'Origem é obrigatória'),
  value: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.string().min(1, 'Status é obrigatório'),
})

type LeadEditFormData = z.infer<typeof leadEditSchema>

const origens = [
  'Google',
  'Facebook',
  'Instagram',
  'Marketing',
  'Indicação',
  'Telefone',
  'Presencial',
  'Site',
  'Outros',
]

const statusOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em Contato' },
  { value: 'proposta_enviada', label: 'Proposta Enviada' },
  { value: 'em_negociacao', label: 'Em Negociação' },
  { value: 'ganho', label: 'Ganho' },
  { value: 'perdido', label: 'Perdido' },
]

interface Lead {
  id: string
  nome: string
  email: string
  telefone: string
  source: string
  status: string
  value: number
  createdAt: string
  lastContact: string
  observacoes: string
}

const mockLeads: Lead[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '11999887766',
    source: 'Google',
    status: 'novo',
    value: 1500,
    createdAt: '2024-01-15',
    lastContact: '2024-01-16',
    observacoes: 'Interessado em clareamento dental',
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '11988776655',
    source: 'Indicação',
    status: 'em_contato',
    value: 800,
    createdAt: '2024-01-14',
    lastContact: '2024-01-15',
    observacoes: 'Buscando ortodontia',
  },
]

export default function EditarLeadPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string
  const { data: procedimentosData } = useMockSelects('procedimentos') as { data?: any[] }

  const lead = mockLeads.find(l => l.id === leadId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadEditFormData>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: lead ? {
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      source: lead.source,
      status: lead.status,
      value: lead.value.toString(),
      observacoes: lead.observacoes,
    } : undefined,
  })

  async function onSubmit(data: LeadEditFormData) {
    console.log('Lead atualizado:', data)
    // TODO: Implementar atualização no banco de dados
    // await updateLead(leadId, data)
    router.push(`/leads/${leadId}`)
  }

  if (!lead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lead não encontrado</h1>
            <p className="text-muted-foreground">
              O lead solicitado não existe ou foi removido.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/leads/${leadId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Lead</h1>
            <p className="text-muted-foreground">
              Atualize as informações do lead.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Lead</CardTitle>
            <CardDescription>
              Dados básicos do lead
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                {...register('nome')}
                placeholder="Ex: Maria Silva"
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Origem *</Label>
              <select
                id="source"
                {...register('source')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                {origens.map((origem) => (
                  <option key={origem} value={origem}>
                    {origem}
                  </option>
                ))}
              </select>
              {errors.source && (
                <p className="text-sm text-destructive">{errors.source.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="exemplo@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                {...register('telefone')}
                placeholder="(11) 99999-9999"
              />
              {errors.telefone && (
                <p className="text-sm text-destructive">{errors.telefone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                {...register('status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor Potencial (R$)</Label>
              <Input
                id="value"
                {...register('value')}
                placeholder="0,00"
              />
              {errors.value && (
                <p className="text-sm text-destructive">{errors.value.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                {...register('observacoes')}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Notas sobre o lead, interesses específicos, etc..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>
              Detalhes para comunicação com o lead.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Preferência de Contato</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Selecione...</option>
                  <option value="telefone">Telefone</option>
                  <option value="email">E-mail</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="any">Qualquer um</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Melhor Horário para Contato</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Selecione...</option>
                  <option value="morning">Manhã (8h-12h)</option>
                  <option value="afternoon">Tarde (12h-18h)</option>
                  <option value="evening">Noite (18h-20h)</option>
                  <option value="any">Qualquer horário</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Interesses Principais</Label>
              <div className="grid gap-2 md:grid-cols-3">
                {(procedimentosData || []).map((procedure: any) => (
                  <label key={procedure.id} className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{procedure.nome}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push(`/leads/${leadId}`)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  )
}
