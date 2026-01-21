'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GENDER_OPTIONS, BRAZILIAN_STATES } from '@/constants'
import { useCreatePaciente, useUpdatePaciente } from '@/hooks/use-pacientes'
import { useUser } from '@/hooks/use-user'
import type { Database } from '@/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']

// Função para converter data DD/MM/AAAA para YYYY-MM-DD
function convertDateToISO(dateString: string): string {
  if (!dateString) return ''
  
  // Remove todos os caracteres não numéricos
  const cleanDate = dateString.replace(/\D/g, '')
  
  // Verifica se tem 8 dígitos
  if (cleanDate.length !== 8) return dateString
  
  // Converte DDMMAAAA para AAAA-MM-DD
  const day = cleanDate.slice(0, 2)
  const month = cleanDate.slice(2, 4)
  const year = cleanDate.slice(4, 8)
  
  return `${year}-${month}-${day}`
}

const pacienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone inválido'),
  data_nascimento: z.string().transform((value) => convertDateToISO(value)).optional(),
  genero: z.enum(['masculino', 'feminino', 'outro']).optional(),
  cpf: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  profissao: z.string().optional(),
  tipo_sanguineo: z.string().optional(),
  fator_rh: z.string().optional(),
  contato_emergencia: z.string().optional(),
  telefone_emergencia: z.string().optional(),
  convenio: z.string().optional(),
  carteira_convenio: z.string().optional(),
  // Histórico Médico
  alergias: z.string().optional(),
  doencas_sistemicas: z.string().optional(),
  medicamentos: z.string().optional(),
  condicoes_especiais: z.string().optional(),
  // Histórico Odontológico
  ultima_consulta_odonto: z.string().transform((value) => convertDateToISO(value)).optional(),
  tratamentos_anteriores: z.string().optional(),
  habitos: z.string().optional(),
  higiene_bucal: z.string().optional(),
  observacoes: z.string().optional(),
})

type PacienteFormData = z.infer<typeof pacienteSchema>

interface PacienteFormProps {
  paciente?: Paciente
  onSuccess?: () => void
}

export function PacienteForm({ paciente, onSuccess }: PacienteFormProps) {
  const { data: user } = useUser()
  const createPaciente = useCreatePaciente()
  const updatePaciente = useUpdatePaciente()

  // Função para converter data YYYY-MM-DD para DD/MM/AAAA
function convertDateToDisplay(dateString: string | null): string {
  if (!dateString) return ''
  
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: paciente ? {
      nome: paciente.nome,
      email: paciente.email || '',
      telefone: paciente.telefone || '',
      data_nascimento: convertDateToDisplay(paciente.data_nascimento),
      genero: paciente.genero || undefined,
      cpf: paciente.cpf || '',
      endereco: paciente.endereco || '',
      cidade: paciente.cidade || '',
      estado: paciente.estado || '',
      cep: paciente.cep || '',
      profissao: paciente.profissao || '',
      tipo_sanguineo: paciente.tipo_sanguineo || '',
      fator_rh: paciente.fator_rh || '',
      contato_emergencia: paciente.contato_emergencia || '',
      telefone_emergencia: paciente.telefone_emergencia || '',
      convenio: paciente.convenio || '',
      carteira_convenio: paciente.carteira_convenio || '',
      alergias: paciente.alergias || '',
      doencas_sistemicas: paciente.doencas_sistemicas || '',
      medicamentos: paciente.medicamentos || '',
      condicoes_especiais: paciente.condicoes_especiais || '',
      ultima_consulta_odonto: convertDateToDisplay(paciente.ultima_consulta_odonto),
      tratamentos_anteriores: paciente.tratamentos_anteriores || '',
      habitos: paciente.habitos || '',
      higiene_bucal: paciente.higiene_bucal || '',
      observacoes: paciente.observacoes || '',
    } : {},
  })

  async function onSubmit(data: PacienteFormData) {
    if (!user?.clinica_id) return

    const pacienteData = {
      ...data,
      clinica_id: user.clinica_id,
      email: data.email || null,
      data_nascimento: data.data_nascimento || null,
      genero: data.genero || null,
    }

    if (paciente?.id) {
      await updatePaciente.mutateAsync({ id: paciente.id, ...pacienteData })
    } else {
      await createPaciente.mutateAsync(pacienteData)
    }

    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input id="nome" {...register('nome')} />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input id="telefone" {...register('telefone')} placeholder="(11) 99999-9999" />
            {errors.telefone && (
              <p className="text-sm text-destructive">{errors.telefone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input 
              id="data_nascimento" 
              {...register('data_nascimento')} 
              placeholder="DD/MM/AAAA"
              maxLength={10}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2);
                }
                if (value.length >= 5) {
                  value = value.slice(0, 5) + '/' + value.slice(5, 9);
                }
                e.target.value = value;
                register('data_nascimento').onChange(e);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genero">Gênero</Label>
            <select
              id="genero"
              {...register('genero')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione...</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_sanguineo">Tipo Sanguíneo</Label>
            <select
              id="tipo_sanguineo"
              {...register('tipo_sanguineo')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profissao">Profissão</Label>
            <Input id="profissao" {...register('profissao')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Logradouro</Label>
            <Input id="address" {...register('endereco')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" {...register('cidade')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <select
              id="state"
              {...register('estado')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione...</option>
              {BRAZILIAN_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP</Label>
            <Input id="zip_code" {...register('cep')} placeholder="00000-000" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato de Emergência</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contato_emergencia">Nome</Label>
            <Input id="contato_emergencia" {...register('contato_emergencia')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone_emergencia">Telefone</Label>
            <Input id="telefone_emergencia" {...register('telefone_emergencia')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Convênio</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="convenio">Nome do Convênio</Label>
            <Input id="convenio" {...register('convenio')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="convenio_number">Número da Carteirinha</Label>
            <Input
              id="convenio_number"
              {...register('carteira_convenio')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Médico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="alergias">Alergias</Label>
            <textarea
              id="alergias"
              {...register('alergias')}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Medicamentos, materiais dentários, alimentos, etc."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="doencas_sistemicas">Doenças Sistêmicas</Label>
            <textarea
              id="doencas_sistemicas"
              {...register('doencas_sistemicas')}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Diabetes, hipertensão, problemas cardíacos, etc."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
            <textarea
              id="medicamentos"
              {...register('medicamentos')}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Liste todos os medicamentos de uso contínuo"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="condicoes_especiais">Condições Especiais</Label>
            <textarea
              id="condicoes_especiais"
              {...register('condicoes_especiais')}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Gravidez, lactação, deficiências, etc."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Odontológico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ultima_consulta_odonto">Última Visita ao Dentista</Label>
            <Input 
              id="ultima_consulta_odonto" 
              {...register('ultima_consulta_odonto')} 
              placeholder="DD/MM/AAAA"
              maxLength={10}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2);
                }
                if (value.length >= 5) {
                  value = value.slice(0, 5) + '/' + value.slice(5, 9);
                }
                e.target.value = value;
                register('ultima_consulta_odonto').onChange(e);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="higiene_bucal">Higiene Bucal</Label>
            <select
              id="higiene_bucal"
              {...register('higiene_bucal')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione...</option>
              <option value="Excelente">Excelente</option>
              <option value="Boa">Boa</option>
              <option value="Regular">Regular</option>
              <option value="Ruim">Ruim</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tratamentos_anteriores">Tratamentos Anteriores</Label>
            <textarea
              id="tratamentos_anteriores"
              {...register('tratamentos_anteriores')}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Ortodontia, implantes, tratamentos de canal, etc."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="habits">Hábitos</Label>
            <textarea
              id="habits"
              {...register('habitos')}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Fumo, álcool, bruxismo, roer unhas, etc."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Anotações Gerais</Label>
            <textarea
              id="observacoes"
              {...register('observacoes')}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : paciente ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  )
}
