import { pgTable, uuid, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { clinicas } from './clinicas'
import { userRoleEnum } from './enums'

export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  authUsuarioId: uuid('auth_usuario_id').unique().notNull(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  nome: text('nome').notNull(),
  papel: userRoleEnum('papel').default('recepcionista'),
  telefone: text('telefone'),
  urlAvatar: text('url_avatar'),
  especialidade: text('especialidade'),
  cro: text('cro'),
  ativo: boolean('ativo').default(true),
  configuracoes: jsonb('configuracoes').default({}),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})
