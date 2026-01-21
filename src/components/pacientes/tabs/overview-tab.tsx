'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Calendar, Phone, Mail, MapPin, User, FileText, Heart, Smile, Clock, Stethoscope, CreditCard, AlertTriangle, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatPhone, formatDate, formatTime } from '@/lib/utils'
import { useMockPacientes } from '@/lib/api-mock-client'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/constants'

interface OverviewTabProps {
  pacienteId: string
}

export function OverviewTab({ pacienteId }: OverviewTabProps) {
  const router = useRouter()
  const { data: mockData } = useMockPacientes() as { data?: { data: any[] } }
  const paciente = mockData?.data?.find((p: any) => p.id === pacienteId)

  if (!paciente) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Paciente não encontrado</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Paciente não encontrado ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calcular idade
  const calcularIdade = (birthDate: string) => {
    const hoje = new Date()
    const nascimento = new Date(birthDate)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade
  }

  return (
    <div className="space-y-6">
      {/* Header da aba */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visão Geral</h1>
          <p className="text-muted-foreground">Informações completas do paciente</p>
        </div>
      </div>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
              <p className="font-medium">{paciente.nome}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">E-mail</label>
              <p className="font-medium">{paciente.email || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
              <p className="font-medium">{paciente.telefone ? formatPhone(paciente.telefone) : 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
              <p className="font-medium">{paciente.data_nascimento ? formatDate(paciente.data_nascimento) : 'Não informada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Idade</label>
              <p className="font-medium">{paciente.data_nascimento ? `${calcularIdade(paciente.data_nascimento)} anos` : 'Não informada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gênero</label>
              <p className="font-medium">{paciente.genero || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">CPF</label>
              <p className="font-medium">{paciente.cpf || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo Sanguíneo</label>
              <p className="font-medium">{paciente.tipo_sanguineo ? `${paciente.tipo_sanguineo}${paciente.fator_rh ? ` ${paciente.fator_rh}` : ''}` : 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Profissão</label>
              <p className="font-medium">{paciente.profissao || 'Não informada'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Logradouro</label>
              <p className="font-medium">{paciente.endereco || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cidade</label>
              <p className="font-medium">{paciente.cidade || 'Não informada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <p className="font-medium">{paciente.estado || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">CEP</label>
              <p className="font-medium">{paciente.cep || 'Não informado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato de Emergência e Convênio */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5" />
              Contato de Emergência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="font-medium">{paciente.contato_emergencia || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                <p className="font-medium">{paciente.telefone_emergencia ? formatPhone(paciente.telefone_emergencia) : 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Convênio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome do Convênio</label>
                <p className="font-medium">{paciente.convenio || 'Particular'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Número da Carteirinha</label>
                <p className="font-medium">{paciente.carteira_convenio || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico Médico */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-red-700">
            <Heart className="h-5 w-5" />
            Histórico Médico
          </CardTitle>
          <CardDescription>Informações médicas importantes para o tratamento odontológico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Alergias</label>
              <p className="font-medium text-red-600">{paciente.alergias || 'Nenhuma'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Doenças Sistêmicas</label>
              <p className="font-medium text-red-600">{paciente.doencas_sistemicas || 'Nenhuma'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Medicamentos em Uso</label>
              <p className="font-medium text-red-600">{paciente.medicamentos || 'Nenhum'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Condições Especiais</label>
              <p className="font-medium text-red-600">{paciente.condicoes_especiais || 'Nenhuma'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico Odontológico */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
            <Smile className="h-5 w-5" />
            Histórico Odontológico
          </CardTitle>
          <CardDescription>Informações específicas do tratamento odontológico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última Visita ao Dentista</label>
              <p className="font-medium">{paciente.ultima_consulta_odonto ? formatDate(paciente.ultima_consulta_odonto) : 'Não informada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Higiene Bucal</label>
              <p className="font-medium">{paciente.higiene_bucal || 'Não informada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tratamentos Anteriores</label>
              <p className="font-medium">{paciente.tratamentos_anteriores || 'Nenhum'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Hábitos</label>
              <p className="font-medium">{paciente.habitos || 'Não informados'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {paciente.observacoes && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <FileText className="h-5 w-5" />
              Observações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="whitespace-pre-wrap text-sm">{paciente.observacoes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
