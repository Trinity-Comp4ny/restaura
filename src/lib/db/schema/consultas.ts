import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core'
import { clinicas } from './clinicas'
import { pacientes } from './pacientes'
import { usuarios } from './usuarios'
import { appointmentStatusEnum, recordTypeEnum } from './enums'
import { jsonb } from 'drizzle-orm/pg-core'

export const procedimentos = pgTable('procedimentos', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  categoria: text('categoria'),
  duracaoMinutos: integer('duracao_minutos').default(30),
  valorPadrao: numeric('valor_padrao', { precision: 10, scale: 2 }),
  cor: text('cor').default('#3b82f6'),
  ativo: boolean('ativo').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

export const consultas = pgTable('consultas', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  pacienteId: uuid('paciente_id')
    .notNull()
    .references(() => pacientes.id, { onDelete: 'cascade' }),
  dentistaId: uuid('dentista_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  procedimentoId: uuid('procedimento_id').references(() => procedimentos.id, {
    onDelete: 'set null',
  }),
  dataHora: timestamp('data_hora', { withTimezone: true }).notNull(),
  duracaoMinutos: integer('duracao_minutos').default(30),
  status: appointmentStatusEnum('status').default('agendado'),
  observacoes: text('observacoes'),
  valor: numeric('valor', { precision: 10, scale: 2 }),
  pago: boolean('pago').default(false),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

export const prontuarios = pgTable('prontuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  pacienteId: uuid('paciente_id')
    .notNull()
    .references(() => pacientes.id, { onDelete: 'cascade' }),
  consultaId: uuid('consulta_id').references(() => consultas.id, {
    onDelete: 'cascade',
  }),
  tipo: recordTypeEnum('tipo').notNull(),
  conteudo: jsonb('conteudo').notNull(),
  criadoPorId: uuid('criado_por_id').references(() => usuarios.id, {
    onDelete: 'set null',
  }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})
