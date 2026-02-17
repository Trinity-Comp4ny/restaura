import { pgTable, uuid, text, boolean, timestamp, date } from 'drizzle-orm/pg-core'
import { clinicas } from './clinicas'
import { generoEnum } from './enums'

export const pacientes = pgTable('pacientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  email: text('email'),
  telefone: text('telefone'),
  dataNascimento: date('data_nascimento'),
  genero: generoEnum('genero'),
  cpf: text('cpf'),
  rg: text('rg'),
  endereco: text('endereco'),
  cidade: text('cidade'),
  estado: text('estado'),
  cep: text('cep'),
  convenioPrincipal: text('convenio_principal'),
  alergias: text('alergias'),
  observacoes: text('observacoes'),
  ativo: boolean('ativo').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})
