export const APPOINTMENT_STATUS = {
  AGENDADO: 'agendado',
  CONFIRMADO: 'confirmado',
  ESPERANDO: 'esperando',
  CHAMADO: 'chamado',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDO: 'concluido',
  PAUSADO: 'pausado',
  CANCELADO_PACIENTE: 'cancelado_paciente',
  CANCELADO_CLINICA: 'cancelado_clinica',
  NAO_COMPARECEU: 'nao_compareceu',
  REMARCADO: 'remarcado',
} as const

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [APPOINTMENT_STATUS.AGENDADO]: 'Agendado',
  [APPOINTMENT_STATUS.CONFIRMADO]: 'Confirmado',
  [APPOINTMENT_STATUS.ESPERANDO]: 'Esperando',
  [APPOINTMENT_STATUS.CHAMADO]: 'Chamado',
  [APPOINTMENT_STATUS.EM_ANDAMENTO]: 'Em Andamento',
  [APPOINTMENT_STATUS.CONCLUIDO]: 'Concluido',
  [APPOINTMENT_STATUS.PAUSADO]: 'Pausado',
  [APPOINTMENT_STATUS.CANCELADO_PACIENTE]: 'Cancelado pelo Paciente',
  [APPOINTMENT_STATUS.CANCELADO_CLINICA]: 'Cancelado pela Clínica',
  [APPOINTMENT_STATUS.NAO_COMPARECEU]: 'Não Compareceu',
  [APPOINTMENT_STATUS.REMARCADO]: 'Remarcado',
}

export const APPOINTMENT_STATUS_CONFIG: Record<AppointmentStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive'
  bgColor: string
  textColor: string
}> = {
  [APPOINTMENT_STATUS.AGENDADO]: {
    label: 'Agendado',
    variant: 'default',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  [APPOINTMENT_STATUS.CONFIRMADO]: {
    label: 'Confirmado',
    variant: 'default',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  [APPOINTMENT_STATUS.ESPERANDO]: {
    label: 'Esperando',
    variant: 'default',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  [APPOINTMENT_STATUS.CHAMADO]: {
    label: 'Chamado',
    variant: 'default',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  [APPOINTMENT_STATUS.EM_ANDAMENTO]: {
    label: 'Em Andamento',
    variant: 'default',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  [APPOINTMENT_STATUS.CONCLUIDO]: {
    label: 'Concluido',
    variant: 'default',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  [APPOINTMENT_STATUS.PAUSADO]: {
    label: 'Pausado',
    variant: 'destructive',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  [APPOINTMENT_STATUS.CANCELADO_PACIENTE]: {
    label: 'Cancelado pelo Paciente',
    variant: 'destructive',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  [APPOINTMENT_STATUS.CANCELADO_CLINICA]: {
    label: 'Cancelado pela Clínica',
    variant: 'destructive',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  [APPOINTMENT_STATUS.NAO_COMPARECEU]: {
    label: 'Não Compareceu',
    variant: 'destructive',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  [APPOINTMENT_STATUS.REMARCADO]: {
    label: 'Remarcado',
    variant: 'destructive',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
}

export const APPOINTMENT_STATUS_FLOW: Record<AppointmentStatus, AppointmentStatus[]> = {
  [APPOINTMENT_STATUS.AGENDADO]: [
    APPOINTMENT_STATUS.CONFIRMADO,
    APPOINTMENT_STATUS.CANCELADO_PACIENTE,
    APPOINTMENT_STATUS.CANCELADO_CLINICA
  ],
  [APPOINTMENT_STATUS.CONFIRMADO]: [
    APPOINTMENT_STATUS.ESPERANDO,
    APPOINTMENT_STATUS.CANCELADO_PACIENTE,
    APPOINTMENT_STATUS.REMARCADO,
    APPOINTMENT_STATUS.NAO_COMPARECEU
  ],
  [APPOINTMENT_STATUS.ESPERANDO]: [
    APPOINTMENT_STATUS.CHAMADO,
    APPOINTMENT_STATUS.CANCELADO_PACIENTE
  ],
  [APPOINTMENT_STATUS.CHAMADO]: [
    APPOINTMENT_STATUS.EM_ANDAMENTO,
    APPOINTMENT_STATUS.NAO_COMPARECEU
  ],
  [APPOINTMENT_STATUS.EM_ANDAMENTO]: [
    APPOINTMENT_STATUS.CONCLUIDO,
    APPOINTMENT_STATUS.PAUSADO
  ],
  [APPOINTMENT_STATUS.PAUSADO]: [
    APPOINTMENT_STATUS.EM_ANDAMENTO,
    APPOINTMENT_STATUS.CONCLUIDO
  ],
  [APPOINTMENT_STATUS.CONCLUIDO]: [],
  [APPOINTMENT_STATUS.CANCELADO_PACIENTE]: [],
  [APPOINTMENT_STATUS.CANCELADO_CLINICA]: [],
  [APPOINTMENT_STATUS.NAO_COMPARECEU]: [],
  [APPOINTMENT_STATUS.REMARCADO]: [],
}
