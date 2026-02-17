import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  date,
} from 'drizzle-orm/pg-core'
import { clinicas } from './clinicas'
import { usuarios } from './usuarios'

export const produtos = pgTable('produtos', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  categoria: text('categoria'),
  marca: text('marca'),
  modelo: text('modelo'),
  corTamanho: text('cor_tamanho'),
  unidade: text('unidade').default('Unidade'),
  quantidade: numeric('quantidade', { precision: 10, scale: 2 }).default('0'),
  quantidadeMinima: numeric('quantidade_minima', {
    precision: 10,
    scale: 2,
  }).default('0'),
  preco: numeric('preco', { precision: 10, scale: 2 }).default('0'),
  fornecedor: text('fornecedor'),
  localizacao: text('localizacao'),
  observacoes: text('observacoes'),
  ativo: boolean('ativo').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

export const produtoLotes = pgTable('produto_lotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  produtoId: uuid('produto_id')
    .notNull()
    .references(() => produtos.id, { onDelete: 'cascade' }),
  lote: text('lote'),
  dataValidade: date('data_validade'),
  quantidade: numeric('quantidade', { precision: 10, scale: 2 }).default('0'),
  quantidadeDisponivel: numeric('quantidade_disponivel', {
    precision: 10,
    scale: 2,
  }).default('0'),
  fornecedor: text('fornecedor'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

export const movimentacoesEstoque = pgTable('movimentacoes_estoque', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  produtoId: uuid('produto_id')
    .notNull()
    .references(() => produtos.id, { onDelete: 'cascade' }),
  loteId: uuid('lote_id').references(() => produtoLotes.id, {
    onDelete: 'set null',
  }),
  tipo: text('tipo').notNull(),
  quantidade: numeric('quantidade', { precision: 10, scale: 2 }).notNull(),
  motivo: text('motivo'),
  criadoPorId: uuid('criado_por_id').references(() => usuarios.id, {
    onDelete: 'set null',
  }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
})
