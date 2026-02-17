import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const clinicas = pgTable('clinicas', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  slug: text('slug').unique().notNull(),
  documento: text('documento'),
  telefone: text('telefone'),
  email: text('email'),
  endereco: text('endereco'),
  cidade: text('cidade'),
  estado: text('estado'),
  cep: text('cep'),
  urlLogo: text('url_logo'),
  configuracoes: jsonb('configuracoes').default({}),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})
