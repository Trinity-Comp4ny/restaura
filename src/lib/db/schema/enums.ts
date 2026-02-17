import { pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'dentista',
  'assistente',
  'recepcionista',
])

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'agendado',
  'confirmado',
  'em_andamento',
  'concluido',
  'cancelado',
  'nao_compareceu',
])

export const recordTypeEnum = pgEnum('record_type', [
  'anamnesia',
  'evolução',
  'prescrição',
  'certificado',
  'referência',
])

export const generoEnum = pgEnum('genero', ['masculino', 'feminino', 'outro'])

export const transactionTypeEnum = pgEnum('transaction_type', [
  'receita',
  'despesa',
  'transferencia',
])

export const transactionStatusEnum = pgEnum('transaction_status', [
  'pendente',
  'pago',
  'cancelado',
  'estornado',
])

export const tipoCartaoEnum = pgEnum('tipo_cartao', ['credito', 'debito'])
