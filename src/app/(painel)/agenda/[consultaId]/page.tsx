'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Edit,
  FileText,
  XCircle,
  ChevronDown,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency, formatDate, formatPhone, getInitials } from '@/lib/utils'
import {
  APPOINTMENT_STATUS_CONFIG,
  APPOINTMENT_STATUS,
  AppointmentStatus,
} from '@/constants/appointment-status'
import { EditarConsultaDialog } from '@/components/forms/editar-consulta-dialog'
import { RemarcarConsultaDialog } from '@/components/forms/remarcar-consulta-dialog'
import { CancelarConsultaDialog } from '@/components/forms/cancelar-consulta-dialog'
import { usePacientes } from '@/hooks/use-pacientes'
import { useDentistas } from '@/hooks/use-dentistas'
import { useProcedimentos } from '@/hooks/use-procedimentos'
import { useConsumoConsulta } from '@/hooks/use-consumo-consulta'
import { useMateriaisParaConsumo } from '@/hooks/use-estoque'
import { MaterialConfirmationModal } from '@/components/estoque/MaterialConfirmationModal'

// Mock data - em produção viria do banco de dados
const mockPatient = {
  nome: 'Maria Silva',
  avatar: null,
  telefone: '(11) 98765-4321',
  id: 'paciente-maria',
  email: 'maria.silva@email.com',
  cpf: '123.456.789-00',
  birthDate: new Date('1985-03-15'),
  address: 'Rua das Flores, 123, São Paulo - SP',
  emergencyContact: 'João Silva - (11) 98876-5432',
}

const mockAppointments = [
  {
    id: 'today-1',
    time: '08:00',
    endTime: '08:30',
    title: 'Maria Silva',
    description: 'Limpeza e profilaxia',
    patient: mockPatient,
    dentist: 'Dra. Paula',
    procedure: 'Limpeza',
    status: APPOINTMENT_STATUS.CONFIRMADO,
    color: '#3b82f6',
    date: new Date(),
    observacoes: 'Paciente refere sensibilidade em dentes anteriores. Usar gel fluoreado.',
    price: 150.0,
    insurance: 'Unimed',
    // Campos adicionais para os diálogos
    horario_inicio: new Date().toISOString(),
    horario_fim: new Date(Date.now() + 30 * 60000).toISOString(),
    paciente_id: 'paciente-maria',
    dentista_id: '1',
    procedimento_id: '1',
    type: 'nova_consulta',
    previousAppointments: [
      {
        id: 'prev-1',
        date: new Date('2025-12-15'),
        procedure: 'Limpeza',
        dentist: 'Dra. Paula',
        status: 'concluido',
        patient: mockPatient,
        observacoes: 'Paciente com boa higiene oral, sem necessidade de intervenções adicionais.',
        price: 150.0,
      },
      {
        id: 'prev-2',
        date: new Date('2025-09-20'),
        procedure: 'Avaliação',
        dentist: 'Dra. Paula',
        status: 'concluido',
        patient: mockPatient,
        observacoes: 'Primeira consulta do paciente. Avaliação geral e planejamento do tratamento.',
        price: 200.0,
      },
    ],
  },
] as const

export default function DetalheConsultaPage() {
  const params = useParams()
  const router = useRouter()
  const consultaId = params.consultaId as string

  const [appointment] = useState(mockAppointments.find((apt) => apt.id === consultaId))
  const [isEditing, setIsEditing] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const {
    isModalOpen,
    setIsModalOpen,
    pendingStatusChange,
    iniciarMudancaStatus,
    confirmarConsumoEStatus,
    pularConsumo,
    isLoading: isConsumoLoading,
  } = useConsumoConsulta()

  const { data: materiaisParaConsumo = [] } = useMateriaisParaConsumo(
    pendingStatusChange?.procedureId || ''
  )

  const { data: pacientes = [] } = usePacientes()
  const { data: dentistas = [] } = useDentistas()
  const { data: procedimentos = [] } = useProcedimentos()

  if (!appointment) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Consulta não encontrada</h1>
          <p className="text-muted-foreground mb-4">A consulta que você está procurando não existe.</p>
          <Link href="/agenda">
            <Button>Voltar para Agenda</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    if (newStatus === 'em_andamento' && appointment) {
      iniciarMudancaStatus({
        appointmentId: consultaId,
        newStatus,
        procedureId: appointment.procedimento_id || '',
        procedureName: appointment.procedure,
        patientName: appointment.patient.nome,
      })
    } else {
      // TODO: Implementar atualização do status no banco de dados
    }
  }

  const handleConfirmMateriais = (materiaisSelecionados: unknown[]) => {
    if (!appointment) return

    confirmarConsumoEStatus(
      materiaisSelecionados as unknown as {
        product_id: string
        batch_id: string | null
        quantity: number
        incluir: boolean
      }[],
      'clinic-id', // TODO: pegar do contexto
      appointment.paciente_id,
      'user-id' // TODO: pegar do usuário logado
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalhes da Consulta</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informações da Consulta
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar consulta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsRescheduling(true)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Reagendar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsCancelling(true)} className="text-red-600">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar consulta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data</label>
                  <p className="font-medium">{formatDate(appointment.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Horário</label>
                  <p className="font-medium">
                    {appointment.time} - {appointment.endTime}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Procedimento</label>
                  <p className="font-medium">{appointment.procedure}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dentista</label>
                  <p className="font-medium">{appointment.dentist}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Convênio</label>
                  <p className="font-medium">{appointment.insurance}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valor</label>
                  <p className="font-medium">{formatCurrency(appointment.price)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p className="mt-1">{appointment.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Observações</label>
                <p className="mt-1 text-sm bg-muted/50 p-3 rounded-lg">{appointment.observacoes}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Histórico de Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointment.previousAppointments.map((prev) => (
                  <Link
                    key={prev.id}
                    href={`/agenda/${prev.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <p className="font-medium hover:text-primary transition-colors">{prev.procedure}</p>
                        <p className="text-muted-foreground">{formatDate(prev.date)}</p>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        prev.status === 'concluido'
                          ? 'bg-green-100 text-green-800'
                          : prev.status === 'cancelado_paciente' || prev.status === 'cancelado_clinica'
                            ? 'bg-red-100 text-red-800'
                            : prev.status === 'nao_compareceu'
                              ? 'bg-red-100 text-red-800'
                              : prev.status === 'remarcado'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {prev.status === 'concluido'
                        ? 'Concluído'
                        : prev.status === 'cancelado_paciente'
                          ? 'Cancelado pelo Paciente'
                          : prev.status === 'cancelado_clinica'
                            ? 'Cancelado pela Clínica'
                            : prev.status === 'nao_compareceu'
                              ? 'Não Compareceu'
                              : prev.status === 'remarcado'
                                ? 'Remarcado'
                                : prev.status}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status da Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start ${APPOINTMENT_STATUS_CONFIG[appointment.status]?.bgColor} ${APPOINTMENT_STATUS_CONFIG[appointment.status]?.textColor}`}
                  >
                    <span className="ml-2">{APPOINTMENT_STATUS_CONFIG[appointment.status]?.label}</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  {Object.entries(APPOINTMENT_STATUS_CONFIG).map(([statusKey, statusConfig]) => {
                    const statusKeyTyped = statusKey as typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]
                    const currentStatusKey = appointment.status as typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]
                    const isSelected = statusKeyTyped === currentStatusKey

                    return (
                      <DropdownMenuItem
                        key={statusKey}
                        onClick={() => handleStatusChange(statusKeyTyped)}
                        className={`flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? `${statusConfig.bgColor} ${statusConfig.textColor} font-medium`
                            : `${statusConfig.bgColor} ${statusConfig.textColor} opacity-50 hover:opacity-70`
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-current' : 'bg-transparent border-current border'
                          }`}
                        />
                        {statusConfig.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(appointment.patient.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link
                    href={`/pacientes/${appointment.patient.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {appointment.patient.nome}
                  </Link>
                  <p className="text-sm text-muted-foreground">{appointment.patient.email}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{formatPhone(appointment.patient.telefone)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">CPF:</span> {appointment.patient.cpf}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Nascimento:</span> {formatDate(appointment.patient.birthDate)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditarConsultaDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        consulta={appointment as unknown}
        pacientes={pacientes}
        dentistas={dentistas}
        procedimentos={procedimentos}
      />

      <RemarcarConsultaDialog
        open={isRescheduling}
        onOpenChange={setIsRescheduling}
        consulta={appointment as unknown}
        procedimentos={procedimentos}
      />

      <CancelarConsultaDialog
        open={isCancelling}
        onOpenChange={setIsCancelling}
        consulta={appointment as unknown}
      />

      <MaterialConfirmationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        materiais={materiaisParaConsumo}
        onConfirm={handleConfirmMateriais}
        onSkip={pularConsumo}
        isLoading={isConsumoLoading}
        procedimentoNome={pendingStatusChange?.procedureName || ''}
        pacienteNome={pendingStatusChange?.patientName || ''}
      />
    </div>
  )
}
