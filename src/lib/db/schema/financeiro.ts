import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  date,
  jsonb,
} from 'drizzle-orm/pg-core'
import { clinicas } from './clinicas'
import { pacientes } from './pacientes'
import { usuarios } from './usuarios'
import { consultas } from './consultas'
import {
  transactionTypeEnum,
  transactionStatusEnum,
  tipoCartaoEnum,
} from './enums'

// Métodos de pagamento configurados
export const metodosPagamento = pgTable('metodos_pagamento', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  tipo: text('tipo').notNull(),
  taxasPercentual: numeric('taxas_percentual', { precision: 5, scale: 2 }).default('0'),
  taxasFixa: numeric('taxas_fixa', { precision: 10, scale: 2 }).default('0'),
  prazoDeposito: integer('prazo_deposito').default(0),
  adquirente: text('adquirente'),
  contaVinculadaId: uuid('conta_vinculada_id'),
  isPadrao: boolean('is_padrao').default(false),
  ativo: boolean('ativo').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

// Contas bancárias
export const contasBancarias = pgTable('contas_bancarias', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  banco: text('banco'),
  agencia: text('agencia'),
  conta: text('conta'),
  tipo: text('tipo').notNull(),
  saldo: numeric('saldo', { precision: 15, scale: 2 }).default('0'),
  isPadrao: boolean('is_padrao').default(false),
  ativa: boolean('ativa').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

// Cartões de crédito e débito
export const cartoes = pgTable('cartoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  banco: text('banco').notNull(),
  ultimosDigitos: text('ultimos_digitos').notNull(),
  tipoCartao: tipoCartaoEnum('tipo_cartao').notNull().default('credito'),
  limite: numeric('limite', { precision: 10, scale: 2 }).default('0'),
  diaVencimento: integer('dia_vencimento'),
  diaFechamento: integer('dia_fechamento'),
  isCorporativo: boolean('is_corporativo').default(false),
  contaFaturaId: uuid('conta_fatura_id').references(() => contasBancarias.id, {
    onDelete: 'set null',
  }),
  isPadrao: boolean('is_padrao').default(false),
  ativo: boolean('ativo').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

// Categorias de Receita
export const categoriasReceita = pgTable('categorias_receita', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  cor: text('cor').default('#3b82f6'),
  isPadrao: boolean('is_padrao').default(false),
  ativa: boolean('ativa').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

// Categorias de Despesa
export const categoriasDespesa = pgTable('categorias_despesa', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  cor: text('cor').default('#ef4444'),
  isPadrao: boolean('is_padrao').default(false),
  ativa: boolean('ativa').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

// Categorias financeiras (tabela unificada da migration 004)
export const categoriasFinanceiras = pgTable('categorias_financeiras', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  cor: text('cor').default('#3b82f6'),
  tipo: text('tipo').notNull(),
  isPadrao: boolean('is_padrao').default(false),
  ativa: boolean('ativa').default(true),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

// Planos de Convênio
export const planosConvenio = pgTable('planos_convenio', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  operadora: text('operadora').notNull(),
  codigo: text('codigo'),
  descricao: text('descricao'),
  taxaDesconto: numeric('taxa_desconto', { precision: 5, scale: 2 }).default('0'),
  prazoPagamento: integer('prazo_pagamento').default(30),
  ativo: boolean('ativo').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

// Fornecedores
export const fornecedores = pgTable('fornecedores', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nomeFantasia: text('nome_fantasia').notNull(),
  razaoSocial: text('razao_social'),
  cnpj: text('cnpj'),
  telefone: text('telefone'),
  email: text('email'),
  endereco: text('endereco'),
  categoriaFornecedor: text('categoria_fornecedor'),
  condicoesPagamento: text('condicoes_pagamento'),
  isPadrao: boolean('is_padrao').default(false),
  ativo: boolean('ativo').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

// Tipos de Documento
export const tiposDocumento = pgTable('tipos_documento', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  modelo: text('modelo'),
  exigeNumero: boolean('exige_numero').default(true),
  ativo: boolean('ativo').default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

// Transações (tabela principal financeira)
export const transacoes = pgTable('transacoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  tipo: transactionTypeEnum('tipo').notNull(),
  descricao: text('descricao').notNull(),
  valorBruto: numeric('valor_bruto', { precision: 10, scale: 2 }).notNull(),
  valorLiquido: numeric('valor_liquido', { precision: 10, scale: 2 }).notNull(),
  valorTaxas: numeric('valor_taxas', { precision: 10, scale: 2 }).default('0'),
  pacienteId: uuid('paciente_id').references(() => pacientes.id, {
    onDelete: 'set null',
  }),
  consultaId: uuid('consulta_id').references(() => consultas.id, {
    onDelete: 'set null',
  }),
  fornecedor: text('fornecedor'),
  planoId: text('plano_id'),
  autorizacaoId: text('autorizacao_id'),
  categoria: text('categoria').notNull(),
  metodoPagamentoId: uuid('metodo_pagamento_id').references(
    () => metodosPagamento.id,
    { onDelete: 'set null' }
  ),
  contaOrigemId: uuid('conta_origem_id').references(() => contasBancarias.id, {
    onDelete: 'set null',
  }),
  contaDestinoId: uuid('conta_destino_id').references(
    () => contasBancarias.id,
    { onDelete: 'set null' }
  ),
  cartaoId: uuid('cartao_id').references(() => cartoes.id, {
    onDelete: 'set null',
  }),
  metodoCobrancaId: uuid('metodo_cobranca_id'),
  contaBancariaId: uuid('conta_bancaria_id').references(
    () => contasBancarias.id
  ),
  faturaCartaoId: uuid('fatura_cartao_id'),
  dataCompra: date('data_compra'),
  dataEmissao: date('data_emissao'),
  dataVencimento: date('data_vencimento'),
  dataPagamento: date('data_pagamento'),
  dataCreditoPrevista: date('data_credito_prevista'),
  totalParcelas: integer('total_parcelas').default(1),
  parcelaAtual: integer('parcela_atual').default(1),
  valorParcela: numeric('valor_parcela', { precision: 10, scale: 2 }),
  dataPrimeiraParcela: date('data_primeira_parcela'),
  status: transactionStatusEnum('status').default('pendente'),
  origemReceita: text('origem_receita'),
  tipoDocumento: text('tipo_documento'),
  numeroDocumento: text('numero_documento'),
  dadosConvenio: jsonb('dados_convenio').default({}),
  observacoes: text('observacoes'),
  anexos: text('anexos').array(),
  criadoPorId: uuid('criado_por_id').references(() => usuarios.id, {
    onDelete: 'set null',
  }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
  atualizadoPorId: uuid('atualizado_por_id').references(() => usuarios.id, {
    onDelete: 'set null',
  }),
})

// Faturas de cartão
export const faturasCartao = pgTable('faturas_cartao', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartaoId: uuid('cartao_id')
    .notNull()
    .references(() => cartoes.id),
  contaBancariaId: uuid('conta_bancaria_id')
    .notNull()
    .references(() => contasBancarias.id),
  mesReferencia: date('mes_referencia').notNull(),
  dataVencimento: date('data_vencimento').notNull(),
  dataFechamento: date('data_fechamento').notNull(),
  valorAberto: numeric('valor_aberto').default('0'),
  valorPago: numeric('valor_pago').default('0'),
  status: text('status').default('aberta'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

// Parcelas (da migration 005)
export const parcelas = pgTable('parcelas', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  transacaoId: uuid('transacao_id')
    .notNull()
    .references(() => transacoes.id, { onDelete: 'cascade' }),
  numeroParcela: integer('numero_parcela').notNull(),
  totalParcelas: integer('total_parcelas').notNull(),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  dataVencimento: date('data_vencimento').notNull(),
  dataPagamento: date('data_pagamento'),
  dataCreditoPrevista: date('data_credito_prevista'),
  status: text('status').notNull().default('pendente'),
  faturaCartaoId: uuid('fatura_cartao_id').references(() => faturasCartao.id, {
    onDelete: 'set null',
  }),
  observacoes: text('observacoes'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

// Planos de Parcelamento (da migration 003)
export const planosParcelamento = pgTable('planos_parcelamento', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  pacienteId: uuid('paciente_id').references(() => pacientes.id, {
    onDelete: 'cascade',
  }),
  consultaId: uuid('consulta_id').references(() => consultas.id, {
    onDelete: 'set null',
  }),
  descricao: text('descricao').notNull(),
  valorTotal: numeric('valor_total', { precision: 10, scale: 2 }).notNull(),
  valorEntrada: numeric('valor_entrada', { precision: 10, scale: 2 }).default('0'),
  quantidadeParcelas: integer('quantidade_parcelas').notNull().default(1),
  valorParcela: numeric('valor_parcela', { precision: 10, scale: 2 }).notNull(),
  dataInicio: date('data_inicio').notNull(),
  dataPrimeiraParcela: date('data_primeira_parcela').notNull(),
  intervaloDias: integer('intervalo_dias').default(30),
  status: text('status').notNull().default('ativo'),
  observacoes: text('observacoes'),
  criadoPorId: uuid('criado_por_id').references(() => usuarios.id, {
    onDelete: 'set null',
  }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

// Contas a Pagar
export const contasPagar = pgTable('contas_pagar', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  descricao: text('descricao').notNull(),
  fornecedorId: uuid('fornecedor_id').references(() => fornecedores.id, {
    onDelete: 'set null',
  }),
  fornecedorNome: text('fornecedor_nome'),
  valorTotal: numeric('valor_total', { precision: 10, scale: 2 }).notNull(),
  valorPago: numeric('valor_pago', { precision: 10, scale: 2 }).default('0'),
  categoria: text('categoria').notNull(),
  dataEmissao: date('data_emissao').notNull(),
  dataVencimento: date('data_vencimento').notNull(),
  dataPagamento: date('data_pagamento'),
  quantidadeParcelas: integer('quantidade_parcelas').default(1),
  parcelaAtual: integer('parcela_atual').default(1),
  status: text('status').notNull().default('pendente'),
  tipoDocumento: text('tipo_documento'),
  numeroDocumento: text('numero_documento'),
  anexoUrl: text('anexo_url'),
  observacoes: text('observacoes'),
  criadoPorId: uuid('criado_por_id').references(() => usuarios.id, {
    onDelete: 'set null',
  }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

// Contas a Receber
export const contasReceber = pgTable('contas_receber', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  pacienteId: uuid('paciente_id')
    .notNull()
    .references(() => pacientes.id, { onDelete: 'cascade' }),
  consultaId: uuid('consulta_id').references(() => consultas.id, {
    onDelete: 'set null',
  }),
  planoParcelamentoId: uuid('plano_parcelamento_id').references(
    () => planosParcelamento.id,
    { onDelete: 'set null' }
  ),
  descricao: text('descricao').notNull(),
  valorTotal: numeric('valor_total', { precision: 10, scale: 2 }).notNull(),
  valorPago: numeric('valor_pago', { precision: 10, scale: 2 }).default('0'),
  origem: text('origem').notNull(),
  dataEmissao: date('data_emissao').notNull(),
  dataVencimento: date('data_vencimento').notNull(),
  dataPagamento: date('data_pagamento'),
  metodoPagamento: text('metodo_pagamento'),
  formaPagamento: text('forma_pagamento'),
  convenioId: uuid('convenio_id').references(() => planosConvenio.id, {
    onDelete: 'set null',
  }),
  autorizacaoConvenio: text('autorizacao_convenio'),
  status: text('status').notNull().default('pendente'),
  numeroDocumento: text('numero_documento'),
  anexoUrl: text('anexo_url'),
  observacoes: text('observacoes'),
  criadoPorId: uuid('criado_por_id').references(() => usuarios.id, {
    onDelete: 'set null',
  }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

// Contatos de Inadimplência
export const contatosInadimplencia = pgTable('contatos_inadimplencia', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicaId: uuid('clinica_id')
    .notNull()
    .references(() => clinicas.id, { onDelete: 'cascade' }),
  pacienteId: uuid('paciente_id')
    .notNull()
    .references(() => pacientes.id, { onDelete: 'cascade' }),
  contaReceberId: uuid('conta_receber_id').references(() => contasReceber.id, {
    onDelete: 'set null',
  }),
  tipoContato: text('tipo_contato').notNull(),
  contatoRealizadoEm: timestamp('contato_realizado_em', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  responsavelContatoId: uuid('responsavel_contato_id').references(
    () => usuarios.id,
    { onDelete: 'set null' }
  ),
  statusContato: text('status_contato').notNull(),
  observacoes: text('observacoes'),
  proximoContatoEm: date('proximo_contato_em'),
  proximaAcao: text('proxima_acao'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})
