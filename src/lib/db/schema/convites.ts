import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { clinicas } from './clinicas'
import { usuarios } from './usuarios'
import { userRoleEnum } from './enums'

export const convites = pgTable('convites', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  papel: userRoleEnum('papel').default('recepcionista'),
  token: uuid('token').unique().notNull().defaultRandom(),
  status: text('status').default('pendente'),
  convidadoPorId: uuid('convidado_por_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  aceitoPorId: uuid('aceito_por_id'),
  dataExpiracao: timestamp('data_expiracao', { withTimezone: true }),
  aceitoEm: timestamp('aceito_em', { withTimezone: true }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

export const convitesFundador = pgTable('convites_fundador', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  token: uuid('token').unique().notNull().defaultRandom(),
  status: text('status').default('pendente'),
  convidadoPorId: uuid('convidado_por_id'),
  aceitoPorId: uuid('aceito_por_id'),
  clinicaCriadaId: uuid('clinica_criada_id').references(() => clinicas.id, {
    onDelete: 'set null',
  }),
  dataExpiracao: timestamp('data_expiracao', { withTimezone: true }),
  aceitoEm: timestamp('aceito_em', { withTimezone: true }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})
