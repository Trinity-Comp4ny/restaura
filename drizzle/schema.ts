import { pgTable, index, foreignKey, check, uuid, text, numeric, date, integer, timestamp, unique, pgPolicy, boolean, jsonb, pgView, bigint, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const appointmentStatus = pgEnum("appointment_status", ['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu'])
export const genero = pgEnum("genero", ['masculino', 'feminino', 'outro'])
export const recordType = pgEnum("record_type", ['anamnesia', 'evolução', 'prescrição', 'certificado', 'referência'])
export const tipoCartao = pgEnum("tipo_cartao", ['credito', 'debito'])
export const transactionStatus = pgEnum("transaction_status", ['pendente', 'pago', 'cancelado', 'estornado'])
export const transactionType = pgEnum("transaction_type", ['receita', 'despesa', 'transferencia'])
export const userRole = pgEnum("user_role", ['admin', 'dentista', 'assistente', 'recepcionista'])


export const contasPagar = pgTable("contas_pagar", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	descricao: text().notNull(),
	fornecedorId: uuid("fornecedor_id"),
	fornecedorNome: text("fornecedor_nome"),
	valorTotal: numeric("valor_total", { precision: 10, scale:  2 }).notNull(),
	valorPago: numeric("valor_pago", { precision: 10, scale:  2 }).default('0'),
	categoria: text().notNull(),
	dataEmissao: date("data_emissao").notNull(),
	dataVencimento: date("data_vencimento").notNull(),
	dataPagamento: date("data_pagamento"),
	quantidadeParcelas: integer("quantidade_parcelas").default(1),
	parcelaAtual: integer("parcela_atual").default(1),
	status: text().default('pendente').notNull(),
	tipoDocumento: text("tipo_documento"),
	numeroDocumento: text("numero_documento"),
	anexoUrl: text("anexo_url"),
	observacoes: text(),
	criadoPorId: uuid("criado_por_id"),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_contas_pagar_categoria").using("btree", table.categoria.asc().nullsLast().op("text_ops")),
	index("idx_contas_pagar_clinica").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops")),
	index("idx_contas_pagar_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_contas_pagar_vencimento").using("btree", table.dataVencimento.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "contas_pagar_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.criadoPorId],
			foreignColumns: [usuarios.id],
			name: "contas_pagar_criado_por_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.fornecedorId],
			foreignColumns: [fornecedores.id],
			name: "contas_pagar_fornecedor_id_fkey"
		}).onDelete("set null"),
	check("contas_pagar_status_check", sql`status = ANY (ARRAY['pendente'::text, 'pago'::text, 'vencido'::text, 'a_vencer'::text, 'cancelado'::text, 'renegociado'::text])`),
]);

export const contasReceber = pgTable("contas_receber", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	pacienteId: uuid("paciente_id").notNull(),
	consultaId: uuid("consulta_id"),
	planoParcelamentoId: uuid("plano_parcelamento_id"),
	parcelaId: uuid("parcela_id"),
	descricao: text().notNull(),
	valorTotal: numeric("valor_total", { precision: 10, scale:  2 }).notNull(),
	valorPago: numeric("valor_pago", { precision: 10, scale:  2 }).default('0'),
	origem: text().notNull(),
	dataEmissao: date("data_emissao").notNull(),
	dataVencimento: date("data_vencimento").notNull(),
	dataPagamento: date("data_pagamento"),
	metodoPagamento: text("metodo_pagamento"),
	formaPagamento: text("forma_pagamento"),
	convenioId: uuid("convenio_id"),
	autorizacaoConvenio: text("autorizacao_convenio"),
	status: text().default('pendente').notNull(),
	numeroDocumento: text("numero_documento"),
	anexoUrl: text("anexo_url"),
	observacoes: text(),
	criadoPorId: uuid("criado_por_id"),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_contas_receber_clinica").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops")),
	index("idx_contas_receber_paciente").using("btree", table.pacienteId.asc().nullsLast().op("uuid_ops")),
	index("idx_contas_receber_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_contas_receber_vencimento").using("btree", table.dataVencimento.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "contas_receber_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.consultaId],
			foreignColumns: [consultas.id],
			name: "contas_receber_consulta_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.convenioId],
			foreignColumns: [planosConvenio.id],
			name: "contas_receber_convenio_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.criadoPorId],
			foreignColumns: [usuarios.id],
			name: "contas_receber_criado_por_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.pacienteId],
			foreignColumns: [pacientes.id],
			name: "contas_receber_paciente_id_fkey"
		}).onDelete("cascade"),
	check("contas_receber_status_check", sql`status = ANY (ARRAY['pendente'::text, 'pago'::text, 'vencido'::text, 'a_vencer'::text, 'cancelado'::text, 'renegociado'::text])`),
]);

export const contatosInadimplencia = pgTable("contatos_inadimplencia", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	pacienteId: uuid("paciente_id").notNull(),
	contaReceberId: uuid("conta_receber_id"),
	tipoContato: text("tipo_contato").notNull(),
	contatoRealizadoEm: timestamp("contato_realizado_em", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	responsavelContatoId: uuid("responsavel_contato_id"),
	statusContato: text("status_contato").notNull(),
	observacoes: text(),
	proximoContatoEm: date("proximo_contato_em"),
	proximaAcao: text("proxima_acao"),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_contatos_inadimplencia_data").using("btree", table.contatoRealizadoEm.asc().nullsLast().op("timestamptz_ops")),
	index("idx_contatos_inadimplencia_paciente").using("btree", table.pacienteId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "contatos_inadimplencia_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contaReceberId],
			foreignColumns: [contasReceber.id],
			name: "contatos_inadimplencia_conta_receber_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.pacienteId],
			foreignColumns: [pacientes.id],
			name: "contatos_inadimplencia_paciente_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.responsavelContatoId],
			foreignColumns: [usuarios.id],
			name: "contatos_inadimplencia_responsavel_contato_id_fkey"
		}).onDelete("set null"),
	check("contatos_inadimplencia_status_contato_check", sql`status_contato = ANY (ARRAY['contato_realizado'::text, 'nao_atendeu'::text, 'mensagem_deixada'::text, 'promessa_pagamento'::text, 'negociacao'::text, 'recusa'::text])`),
	check("contatos_inadimplencia_tipo_contato_check", sql`tipo_contato = ANY (ARRAY['telefone'::text, 'whatsapp'::text, 'email'::text, 'sms'::text])`),
]);

export const faturasCartao = pgTable("faturas_cartao", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	cartaoId: uuid("cartao_id").notNull(),
	contaBancariaId: uuid("conta_bancaria_id").notNull(),
	mesReferencia: date("mes_referencia").notNull(),
	dataVencimento: date("data_vencimento").notNull(),
	dataFechamento: date("data_fechamento").notNull(),
	valorAberto: numeric("valor_aberto").default('0'),
	valorPago: numeric("valor_pago").default('0'),
	status: text().default('aberta'),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_faturas_cartao_cartao_id").using("btree", table.cartaoId.asc().nullsLast().op("uuid_ops")),
	index("idx_faturas_cartao_conta_id").using("btree", table.contaBancariaId.asc().nullsLast().op("uuid_ops")),
	index("idx_faturas_cartao_mes").using("btree", table.mesReferencia.asc().nullsLast().op("date_ops")),
	index("idx_faturas_cartao_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.cartaoId],
			foreignColumns: [cartoes.id],
			name: "faturas_cartao_cartao_id_fkey"
		}),
	foreignKey({
			columns: [table.contaBancariaId],
			foreignColumns: [contasBancarias.id],
			name: "faturas_cartao_conta_bancaria_id_fkey"
		}),
	check("faturas_cartao_status_check", sql`status = ANY (ARRAY['aberta'::text, 'fechada'::text, 'paga'::text])`),
]);

export const convites = pgTable("convites", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	email: text().notNull(),
	papel: userRole().default('recepcionista'),
	token: uuid().default(sql`uuid_generate_v4()`).notNull(),
	status: text().default('pendente'),
	convidadoPorId: uuid("convidado_por_id").notNull(),
	aceitoPorId: uuid("aceito_por_id"),
	dataExpiracao: timestamp("data_expiracao", { withTimezone: true, mode: 'string' }).default(sql`(now() + '7 days'::interval)`),
	aceitoEm: timestamp("aceito_em", { withTimezone: true, mode: 'string' }),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_convites_clinica").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops")),
	index("idx_convites_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_convites_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_convites_token").using("btree", table.token.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.aceitoPorId],
			foreignColumns: [usuarios.id],
			name: "convites_aceito_por_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "convites_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.convidadoPorId],
			foreignColumns: [usuarios.id],
			name: "convites_convidado_por_id_fkey"
		}).onDelete("cascade"),
	unique("convites_clinica_id_email_status_key").on(table.clinicaId, table.email, table.status),
	unique("convites_token_key").on(table.token),
	pgPolicy("Admins verem todos os convites da clínica", { as: "permissive", for: "all", to: ["public"], using: sql`(clinica_id IN ( SELECT usuarios.clinica_id
   FROM usuarios
  WHERE ((usuarios.auth_usuario_id = auth.uid()) AND (usuarios.papel = 'admin'::user_role))))` }),
	pgPolicy("Usuários verem próprios convites", { as: "permissive", for: "select", to: ["public"] }),
	check("convites_status_check", sql`status = ANY (ARRAY['pendente'::text, 'aceito'::text, 'expirado'::text, 'cancelado'::text])`),
]);

export const convitesFundador = pgTable("convites_fundador", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	email: text().notNull(),
	token: uuid().default(sql`uuid_generate_v4()`).notNull(),
	status: text().default('pendente'),
	convidadoPorId: uuid("convidado_por_id"),
	aceitoPorId: uuid("aceito_por_id"),
	clinicaCriadaId: uuid("clinica_criada_id"),
	dataExpiracao: timestamp("data_expiracao", { withTimezone: true, mode: 'string' }).default(sql`(now() + '14 days'::interval)`),
	aceitoEm: timestamp("aceito_em", { withTimezone: true, mode: 'string' }),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_convites_fundador_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_convites_fundador_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_convites_fundador_token").using("btree", table.token.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.aceitoPorId],
			foreignColumns: [usuarios.id],
			name: "convites_fundador_aceito_por_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.clinicaCriadaId],
			foreignColumns: [clinicas.id],
			name: "convites_fundador_clinica_criada_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.convidadoPorId],
			foreignColumns: [usuarios.id],
			name: "convites_fundador_convidado_por_id_fkey"
		}).onDelete("set null"),
	unique("convites_fundador_email_key").on(table.email),
	unique("convites_fundador_token_key").on(table.token),
	pgPolicy("Admins sistema gerenciam convites fundador", { as: "permissive", for: "all", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM auth.usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.email)::text = ANY (ARRAY['admin@restaura.com'::text, 'suporte@restaura.com'::text])))))` }),
	pgPolicy("Usuários verem próprios convites fundador", { as: "permissive", for: "select", to: ["public"] }),
	check("convites_fundador_status_check", sql`status = ANY (ARRAY['pendente'::text, 'aceito'::text, 'expirado'::text, 'cancelado'::text])`),
]);

export const procedimentos = pgTable("procedimentos", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	descricao: text(),
	categoria: text(),
	duracaoMinutos: integer("duracao_minutos").default(30),
	valorPadrao: numeric("valor_padrao", { precision: 10, scale:  2 }),
	cor: text().default('#3b82f6'),
	ativo: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "procedimentos_clinica_id_fkey"
		}).onDelete("cascade"),
]);

export const parcelas = pgTable("parcelas", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	transacaoId: uuid("transacao_id").notNull(),
	numeroParcela: integer("numero_parcela").notNull(),
	totalParcelas: integer("total_parcelas").notNull(),
	valor: numeric({ precision: 10, scale:  2 }).notNull(),
	dataVencimento: date("data_vencimento").notNull(),
	dataPagamento: date("data_pagamento"),
	dataCreditoPrevista: date("data_credito_prevista"),
	status: text().default('pendente').notNull(),
	faturaCartaoId: uuid("fatura_cartao_id"),
	observacoes: text(),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	valorMulta: numeric("valor_multa", { precision: 10, scale:  2 }).default('0'),
	valorJuros: numeric("valor_juros", { precision: 10, scale:  2 }).default('0'),
	valorDesconto: numeric("valor_desconto", { precision: 10, scale:  2 }).default('0'),
	valorCorrigido: numeric("valor_corrigido", { precision: 10, scale:  2 }).default('0'),
	diasAtraso: integer("dias_atraso").default(0),
	statusCalculado: text("status_calculado").default('pendente'),
}, (table) => [
	index("idx_parcelas_clinica").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops")),
	index("idx_parcelas_fatura").using("btree", table.faturaCartaoId.asc().nullsLast().op("uuid_ops")).where(sql`(fatura_cartao_id IS NOT NULL)`),
	index("idx_parcelas_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_parcelas_transacao").using("btree", table.transacaoId.asc().nullsLast().op("uuid_ops")),
	index("idx_parcelas_transacao_numero").using("btree", table.transacaoId.asc().nullsLast().op("int4_ops"), table.numeroParcela.asc().nullsLast().op("uuid_ops")),
	index("idx_parcelas_vencimento").using("btree", table.dataVencimento.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "parcelas_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.faturaCartaoId],
			foreignColumns: [faturasCartao.id],
			name: "parcelas_fatura_cartao_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.transacaoId],
			foreignColumns: [transacoes.id],
			name: "parcelas_transacao_id_fkey"
		}).onDelete("cascade"),
	check("parcelas_status_check", sql`status = ANY (ARRAY['pendente'::text, 'pago'::text, 'vencido'::text, 'cancelado'::text])`),
]);

export const planosConvenio = pgTable("planos_convenio", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	operadora: text().notNull(),
	codigo: text(),
	descricao: text(),
	taxaDesconto: numeric("taxa_desconto", { precision: 5, scale:  2 }).default('0'),
	prazoPagamento: integer("prazo_pagamento").default(30),
	ativo: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "planos_convenio_clinica_id_fkey"
		}).onDelete("cascade"),
	unique("planos_convenio_clinica_id_nome_operadora_key").on(table.clinicaId, table.nome, table.operadora),
]);

export const contasBancarias = pgTable("contas_bancarias", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	banco: text(),
	agencia: text(),
	conta: text(),
	tipo: text().notNull(),
	saldo: numeric({ precision: 15, scale:  2 }).default('0'),
	isPadrao: boolean("is_padrao").default(false),
	ativa: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "contas_bancarias_clinica_id_fkey"
		}).onDelete("cascade"),
]);

export const cartoes = pgTable("cartoes", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	banco: text().notNull(),
	ultimosDigitos: text("ultimos_digitos").notNull(),
	tipoCartao: tipoCartao("tipo_cartao").default('credito').notNull(),
	limite: numeric({ precision: 10, scale:  2 }).default('0'),
	diaVencimento: integer("dia_vencimento"),
	diaFechamento: integer("dia_fechamento"),
	isCorporativo: boolean("is_corporativo").default(false),
	contaFaturaId: uuid("conta_fatura_id"),
	isPadrao: boolean("is_padrao").default(false),
	ativo: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_cartoes_tipo").using("btree", table.tipoCartao.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "cartoes_credito_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contaFaturaId],
			foreignColumns: [contasBancarias.id],
			name: "cartoes_credito_conta_fatura_id_fkey"
		}).onDelete("set null"),
	pgPolicy("Gerenciar cartoes da própria clínica", { as: "permissive", for: "all", to: ["public"], using: sql`(clinica_id IN ( SELECT clinicas.id
   FROM clinicas
  WHERE (clinicas.id IN ( SELECT usuarios.clinica_id
           FROM usuarios
          WHERE (usuarios.auth_usuario_id = auth.uid())))))` }),
	pgPolicy("Ver cartoes da própria clínica", { as: "permissive", for: "all", to: ["public"] }),
]);

export const produtos = pgTable("produtos", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	descricao: text(),
	categoria: text(),
	marca: text(),
	modelo: text(),
	corTamanho: text("cor_tamanho"),
	unidade: text().default('Unidade'),
	quantidade: numeric({ precision: 10, scale:  2 }).default('0'),
	quantidadeMinima: numeric("quantidade_minima", { precision: 10, scale:  2 }).default('0'),
	preco: numeric({ precision: 10, scale:  2 }).default('0'),
	fornecedor: text(),
	localizacao: text(),
	observacoes: text(),
	ativo: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_produtos_clinica").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "produtos_clinica_id_fkey"
		}).onDelete("cascade"),
]);

export const produtoLotes = pgTable("produto_lotes", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	produtoId: uuid("produto_id").notNull(),
	lote: text(),
	dataValidade: date("data_validade"),
	quantidade: numeric({ precision: 10, scale:  2 }).default('0'),
	quantidadeDisponivel: numeric("quantidade_disponivel", { precision: 10, scale:  2 }).default('0'),
	fornecedor: text(),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.produtoId],
			foreignColumns: [produtos.id],
			name: "produto_lotes_produto_id_fkey"
		}).onDelete("cascade"),
]);

export const movimentacoesEstoque = pgTable("movimentacoes_estoque", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	produtoId: uuid("produto_id").notNull(),
	loteId: uuid("lote_id"),
	tipo: text().notNull(),
	quantidade: numeric({ precision: 10, scale:  2 }).notNull(),
	motivo: text(),
	criadoPorId: uuid("criado_por_id"),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_movimentacoes_estoque_clinica").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops")),
	index("idx_movimentacoes_estoque_produto").using("btree", table.produtoId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "movimentacoes_estoque_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.criadoPorId],
			foreignColumns: [usuarios.id],
			name: "movimentacoes_estoque_criado_por_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.loteId],
			foreignColumns: [produtoLotes.id],
			name: "movimentacoes_estoque_lote_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.produtoId],
			foreignColumns: [produtos.id],
			name: "movimentacoes_estoque_produto_id_fkey"
		}).onDelete("cascade"),
]);

export const fornecedores = pgTable("fornecedores", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nomeFantasia: text("nome_fantasia").notNull(),
	razaoSocial: text("razao_social"),
	cnpj: text(),
	telefone: text(),
	email: text(),
	endereco: text(),
	categoriaFornecedor: text("categoria_fornecedor"),
	condicoesPagamento: text("condicoes_pagamento"),
	isPadrao: boolean("is_padrao").default(false),
	ativo: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "fornecedores_clinica_id_fkey"
		}).onDelete("cascade"),
	unique("fornecedores_clinica_id_nome_fantasia_key").on(table.clinicaId, table.nomeFantasia),
	pgPolicy("Ver fornecedores da própria clínica", { as: "permissive", for: "all", to: ["public"], using: sql`(clinica_id IN ( SELECT clinicas.id
   FROM clinicas
  WHERE (clinicas.id IN ( SELECT usuarios.clinica_id
           FROM usuarios
          WHERE (usuarios.auth_usuario_id = auth.uid())))))` }),
]);

export const tiposDocumento = pgTable("tipos_documento", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	descricao: text(),
	modelo: text(),
	exigeNumero: boolean("exige_numero").default(true),
	ativo: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "tipos_documento_clinica_id_fkey"
		}).onDelete("cascade"),
	unique("tipos_documento_clinica_id_nome_key").on(table.clinicaId, table.nome),
]);

export const clinicas = pgTable("clinicas", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	nome: text().notNull(),
	slug: text().notNull(),
	documento: text(),
	telefone: text(),
	email: text(),
	endereco: text(),
	cidade: text(),
	estado: text(),
	cep: text(),
	urlLogo: text("url_logo"),
	configuracoes: jsonb().default({}),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("clinicas_slug_key").on(table.slug),
]);

export const usuarios = pgTable("usuarios", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	authUsuarioId: uuid("auth_usuario_id").notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	email: text().notNull(),
	nome: text().notNull(),
	papel: userRole().default('recepcionista'),
	telefone: text(),
	cro: text(),
	especialidade: text(),
	ativo: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_usuarios_clinica").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "usuarios_clinica_id_fkey"
		}).onDelete("cascade"),
	unique("usuarios_auth_usuario_id_key").on(table.authUsuarioId),
]);

export const pacientes = pgTable("pacientes", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	email: text(),
	telefone: text(),
	dataNascimento: date("data_nascimento"),
	genero: genero(),
	cpf: text(),
	rg: text(),
	endereco: text(),
	cidade: text(),
	estado: text(),
	cep: text(),
	convenioPrincipal: text("convenio_principal"),
	alergias: text(),
	observacoes: text(),
	ativo: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_pacientes_clinica").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "pacientes_clinica_id_fkey"
		}).onDelete("cascade"),
]);

export const consultas = pgTable("consultas", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	pacienteId: uuid("paciente_id").notNull(),
	dentistaId: uuid("dentista_id").notNull(),
	procedimentoId: uuid("procedimento_id"),
	dataHora: timestamp("data_hora", { withTimezone: true, mode: 'string' }).notNull(),
	duracaoMinutos: integer("duracao_minutos").default(30),
	status: appointmentStatus().default('agendado'),
	observacoes: text(),
	valor: numeric({ precision: 10, scale:  2 }),
	pago: boolean().default(false),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_consultas_clinica").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops")),
	index("idx_consultas_data_hora").using("btree", table.dataHora.asc().nullsLast().op("timestamptz_ops")),
	index("idx_consultas_dentista").using("btree", table.dentistaId.asc().nullsLast().op("uuid_ops")),
	index("idx_consultas_paciente").using("btree", table.pacienteId.asc().nullsLast().op("uuid_ops")),
	index("idx_consultas_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "consultas_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dentistaId],
			foreignColumns: [usuarios.id],
			name: "consultas_dentista_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.pacienteId],
			foreignColumns: [pacientes.id],
			name: "consultas_paciente_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.procedimentoId],
			foreignColumns: [procedimentos.id],
			name: "consultas_procedimento_id_fkey"
		}).onDelete("set null"),
]);

export const prontuarios = pgTable("prontuarios", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	pacienteId: uuid("paciente_id").notNull(),
	consultaId: uuid("consulta_id"),
	tipo: recordType().notNull(),
	conteudo: jsonb().notNull(),
	criadoPorId: uuid("criado_por_id"),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "prontuarios_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.consultaId],
			foreignColumns: [consultas.id],
			name: "prontuarios_consulta_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.criadoPorId],
			foreignColumns: [usuarios.id],
			name: "prontuarios_criado_por_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.pacienteId],
			foreignColumns: [pacientes.id],
			name: "prontuarios_paciente_id_fkey"
		}).onDelete("cascade"),
]);

export const categoriasReceita = pgTable("categorias_receita", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	descricao: text(),
	cor: text().default('#3b82f6'),
	isPadrao: boolean("is_padrao").default(false),
	ativa: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "categorias_receita_clinica_id_fkey"
		}).onDelete("cascade"),
	unique("categorias_receita_clinica_id_nome_key").on(table.clinicaId, table.nome),
	pgPolicy("Ver categorias da própria clínica", { as: "permissive", for: "all", to: ["public"], using: sql`(clinica_id IN ( SELECT clinicas.id
   FROM clinicas
  WHERE (clinicas.id IN ( SELECT usuarios.clinica_id
           FROM usuarios
          WHERE (usuarios.auth_usuario_id = auth.uid())))))` }),
]);

export const categoriasDespesa = pgTable("categorias_despesa", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	descricao: text(),
	cor: text().default('#ef4444'),
	isPadrao: boolean("is_padrao").default(false),
	ativa: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "categorias_despesa_clinica_id_fkey"
		}).onDelete("cascade"),
	unique("categorias_despesa_clinica_id_nome_key").on(table.clinicaId, table.nome),
]);

export const metodosPagamento = pgTable("metodos_pagamento", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	tipo: text().notNull(),
	taxasPercentual: numeric("taxas_percentual", { precision: 5, scale:  2 }).default('0'),
	taxasFixa: numeric("taxas_fixa", { precision: 10, scale:  2 }).default('0'),
	prazoDeposito: integer("prazo_deposito").default(0),
	adquirente: text(),
	isPadrao: boolean("is_padrao").default(false),
	ativo: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	contaVinculadaId: uuid("conta_vinculada_id"),
}, (table) => [
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "metodos_pagamento_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contaVinculadaId],
			foreignColumns: [contasBancarias.id],
			name: "metodos_pagamento_conta_vinculada_id_fkey"
		}).onDelete("set null"),
]);

export const metodosCobranca = pgTable("metodos_cobranca", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	nome: text().notNull(),
	tipo: text().notNull(),
	taxasPercentual: numeric("taxas_percentual", { precision: 5, scale:  2 }).default('0'),
	taxasFixa: numeric("taxas_fixa", { precision: 10, scale:  2 }).default('0'),
	prazoDeposito: integer("prazo_deposito").default(0),
	adquirente: text(),
	contaVinculadaId: uuid("conta_vinculada_id"),
	isPadrao: boolean("is_padrao").default(false),
	ativo: boolean().default(true),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_metodos_cobranca_ativos").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops"), table.ativo.asc().nullsLast().op("bool_ops")),
	index("idx_metodos_cobranca_clinica").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops")),
	index("idx_metodos_cobranca_padrao").using("btree", table.clinicaId.asc().nullsLast().op("bool_ops"), table.isPadrao.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "metodos_cobranca_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contaVinculadaId],
			foreignColumns: [contasBancarias.id],
			name: "metodos_cobranca_conta_vinculada_id_fkey"
		}).onDelete("set null"),
]);

export const transacoes = pgTable("transacoes", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicaId: uuid("clinica_id").notNull(),
	tipo: transactionType().notNull(),
	descricao: text().notNull(),
	valorBruto: numeric("valor_bruto", { precision: 10, scale:  2 }).notNull(),
	valorLiquido: numeric("valor_liquido", { precision: 10, scale:  2 }).notNull(),
	valorTaxas: numeric("valor_taxas", { precision: 10, scale:  2 }).default('0'),
	pacienteId: uuid("paciente_id"),
	consultaId: uuid("consulta_id"),
	fornecedor: text(),
	planoId: text("plano_id"),
	autorizacaoId: text("autorizacao_id"),
	categoria: text().notNull(),
	metodoPagamentoId: uuid("metodo_pagamento_id"),
	contaOrigemId: uuid("conta_origem_id"),
	contaDestinoId: uuid("conta_destino_id"),
	cartaoId: uuid("cartao_id"),
	dataCompra: date("data_compra"),
	dataEmissao: date("data_emissao"),
	dataVencimento: date("data_vencimento"),
	dataPagamento: date("data_pagamento"),
	dataCreditoPrevista: date("data_credito_prevista"),
	totalParcelas: integer("total_parcelas").default(1),
	parcelaAtual: integer("parcela_atual").default(1),
	valorParcela: numeric("valor_parcela", { precision: 10, scale:  2 }),
	dataPrimeiraParcela: date("data_primeira_parcela"),
	status: transactionStatus().default('pendente'),
	origemReceita: text("origem_receita"),
	centroCusto: text("centro_custo"),
	tipoDocumento: text("tipo_documento"),
	numeroDocumento: text("numero_documento"),
	dadosConvenio: jsonb("dados_convenio").default({}),
	observacoes: text(),
	anexos: text().array(),
	criadoPorId: uuid("criado_por_id"),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }).defaultNow(),
	atualizadoPorId: uuid("atualizado_por_id"),
	metodoCobrancaId: uuid("metodo_cobranca_id"),
	contaBancariaId: uuid("conta_bancaria_id"),
	faturaCartaoId: uuid("fatura_cartao_id"),
}, (table) => [
	index("idx_transacoes_cartao").using("btree", table.cartaoId.asc().nullsLast().op("uuid_ops")).where(sql`(cartao_id IS NOT NULL)`),
	index("idx_transacoes_clinica_tipo").using("btree", table.clinicaId.asc().nullsLast().op("uuid_ops"), table.tipo.asc().nullsLast().op("enum_ops")),
	index("idx_transacoes_data_pagamento").using("btree", table.dataPagamento.asc().nullsLast().op("date_ops")).where(sql`(data_pagamento IS NOT NULL)`),
	index("idx_transacoes_data_vencimento").using("btree", table.dataVencimento.asc().nullsLast().op("date_ops")).where(sql`(data_vencimento IS NOT NULL)`),
	index("idx_transacoes_metodo").using("btree", table.metodoPagamentoId.asc().nullsLast().op("uuid_ops")).where(sql`(metodo_pagamento_id IS NOT NULL)`),
	index("idx_transacoes_paciente").using("btree", table.pacienteId.asc().nullsLast().op("uuid_ops")).where(sql`(paciente_id IS NOT NULL)`),
	index("idx_transacoes_parcelas").using("btree", table.totalParcelas.asc().nullsLast().op("int4_ops")).where(sql`(total_parcelas > 1)`),
	index("idx_transacoes_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.atualizadoPorId],
			foreignColumns: [usuarios.id],
			name: "transacoes_atualizado_por_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.cartaoId],
			foreignColumns: [cartoes.id],
			name: "transacoes_cartao_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.clinicaId],
			foreignColumns: [clinicas.id],
			name: "transacoes_clinica_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.consultaId],
			foreignColumns: [consultas.id],
			name: "transacoes_consulta_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.contaBancariaId],
			foreignColumns: [contasBancarias.id],
			name: "transacoes_conta_bancaria_id_fkey"
		}),
	foreignKey({
			columns: [table.contaDestinoId],
			foreignColumns: [contasBancarias.id],
			name: "transacoes_conta_destino_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.contaOrigemId],
			foreignColumns: [contasBancarias.id],
			name: "transacoes_conta_origem_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.criadoPorId],
			foreignColumns: [usuarios.id],
			name: "transacoes_criado_por_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.faturaCartaoId],
			foreignColumns: [faturasCartao.id],
			name: "transacoes_fatura_cartao_id_fkey"
		}),
	foreignKey({
			columns: [table.metodoCobrancaId],
			foreignColumns: [metodosCobranca.id],
			name: "transacoes_metodo_cobranca_id_fkey"
		}),
	foreignKey({
			columns: [table.metodoPagamentoId],
			foreignColumns: [metodosPagamento.id],
			name: "transacoes_metodo_pagamento_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.pacienteId],
			foreignColumns: [pacientes.id],
			name: "transacoes_paciente_id_fkey"
		}).onDelete("set null"),
]);
export const vwFluxoCaixaClinicas = pgView("vw_fluxo_caixa_clinicas", {	id: uuid(),
	clinicaNome: text("clinica_nome"),
	entradasPeriodo: numeric("entradas_periodo"),
	saidasPeriodo: numeric("saidas_periodo"),
	saldoAtual: integer("saldo_atual"),
	totalAReceber: numeric("total_a_receber"),
	totalAPagar: numeric("total_a_pagar"),
	totalInadimplencia: numeric("total_inadimplencia"),
}).as(sql`SELECT id, nome AS clinica_nome, ( SELECT COALESCE(sum(cr.valor_pago), 0::numeric) AS "coalesce" FROM contas_receber cr WHERE cr.clinica_id = c.id AND cr.status = 'pago'::text AND cr.data_pagamento IS NOT NULL) AS entradas_periodo, ( SELECT COALESCE(sum(cp.valor_pago), 0::numeric) AS "coalesce" FROM contas_pagar cp WHERE cp.clinica_id = c.id AND cp.status = 'pago'::text AND cp.data_pagamento IS NOT NULL) AS saidas_periodo, 0 AS saldo_atual, ( SELECT COALESCE(sum(cr.valor_total - cr.valor_pago), 0::numeric) AS "coalesce" FROM contas_receber cr WHERE cr.clinica_id = c.id AND (cr.status = ANY (ARRAY['pendente'::text, 'a_vencer'::text, 'vencido'::text]))) AS total_a_receber, ( SELECT COALESCE(sum(cp.valor_total - cp.valor_pago), 0::numeric) AS "coalesce" FROM contas_pagar cp WHERE cp.clinica_id = c.id AND (cp.status = ANY (ARRAY['pendente'::text, 'a_vencer'::text, 'vencido'::text]))) AS total_a_pagar, ( SELECT COALESCE(sum(cr.valor_total - cr.valor_pago), 0::numeric) AS "coalesce" FROM contas_receber cr WHERE cr.clinica_id = c.id AND cr.status = 'vencido'::text) AS total_inadimplencia FROM clinicas c`);

export const vwInadimplenciaPacientes = pgView("vw_inadimplencia_pacientes", {	pacienteId: uuid("paciente_id"),
	pacienteNome: text("paciente_nome"),
	telefone: text(),
	email: text(),
	totalDevido: numeric("total_devido"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parcelasVencidas: bigint("parcelas_vencidas", { mode: "number" }),
	diasAtraso: integer("dias_atraso"),
	ultimoPagamento: date("ultimo_pagamento"),
	faixaAtraso: text("faixa_atraso"),
	clinicaId: uuid("clinica_id"),
}).as(sql`SELECT p.id AS paciente_id, p.nome AS paciente_nome, p.telefone, p.email, COALESCE(sum(cr.valor_total - cr.valor_pago), 0::numeric) AS total_devido, count(cr.id) AS parcelas_vencidas, CURRENT_DATE - min(cr.data_vencimento) AS dias_atraso, max(cr.data_pagamento) AS ultimo_pagamento, CASE WHEN (CURRENT_DATE - min(cr.data_vencimento)) <= 30 THEN '1-30'::text WHEN (CURRENT_DATE - min(cr.data_vencimento)) <= 60 THEN '31-60'::text WHEN (CURRENT_DATE - min(cr.data_vencimento)) <= 90 THEN '61-90'::text ELSE '90+'::text END AS faixa_atraso, cr.clinica_id FROM pacientes p JOIN contas_receber cr ON p.id = cr.paciente_id WHERE cr.status = 'vencido'::text AND cr.valor_total > cr.valor_pago GROUP BY p.id, p.nome, p.telefone, p.email, cr.clinica_id`);

export const vwParcelasResumo = pgView("vw_parcelas_resumo", {	transacaoId: uuid("transacao_id"),
	clinicaId: uuid("clinica_id"),
	descricao: text(),
	valorBruto: numeric("valor_bruto", { precision: 10, scale:  2 }),
	tipo: transactionType(),
	totalParcelas: integer("total_parcelas"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parcelasGeradas: bigint("parcelas_geradas", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parcelasPagas: bigint("parcelas_pagas", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parcelasPendentes: bigint("parcelas_pendentes", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parcelasVencidas: bigint("parcelas_vencidas", { mode: "number" }),
	valorPago: numeric("valor_pago"),
	valorPendente: numeric("valor_pendente"),
	proximaDataVencimento: date("proxima_data_vencimento"),
}).as(sql`SELECT t.id AS transacao_id, t.clinica_id, t.descricao, t.valor_bruto, t.tipo, t.total_parcelas, count(p.id) AS parcelas_geradas, count(p.id) FILTER (WHERE p.status = 'pago'::text) AS parcelas_pagas, count(p.id) FILTER (WHERE p.status = 'pendente'::text) AS parcelas_pendentes, count(p.id) FILTER (WHERE p.status = 'vencido'::text) AS parcelas_vencidas, COALESCE(sum(p.valor) FILTER (WHERE p.status = 'pago'::text), 0::numeric) AS valor_pago, COALESCE(sum(p.valor) FILTER (WHERE p.status = ANY (ARRAY['pendente'::text, 'vencido'::text])), 0::numeric) AS valor_pendente, min(p.data_vencimento) FILTER (WHERE p.status = ANY (ARRAY['pendente'::text, 'vencido'::text])) AS proxima_data_vencimento FROM transacoes t LEFT JOIN parcelas p ON p.transacao_id = t.id GROUP BY t.id, t.clinica_id, t.descricao, t.valor_bruto, t.tipo, t.total_parcelas`);

export const vwReceitas = pgView("vw_receitas", {	id: uuid(),
	clinicaId: uuid("clinica_id"),
	tipo: transactionType(),
	descricao: text(),
	valorBruto: numeric("valor_bruto", { precision: 10, scale:  2 }),
	valorLiquido: numeric("valor_liquido", { precision: 10, scale:  2 }),
	valorTaxas: numeric("valor_taxas", { precision: 10, scale:  2 }),
	pacienteId: uuid("paciente_id"),
	consultaId: uuid("consulta_id"),
	fornecedor: text(),
	planoId: text("plano_id"),
	autorizacaoId: text("autorizacao_id"),
	categoria: text(),
	metodoPagamentoId: uuid("metodo_pagamento_id"),
	contaOrigemId: uuid("conta_origem_id"),
	contaDestinoId: uuid("conta_destino_id"),
	cartaoId: uuid("cartao_id"),
	dataCompra: date("data_compra"),
	dataEmissao: date("data_emissao"),
	dataVencimento: date("data_vencimento"),
	dataPagamento: date("data_pagamento"),
	dataCreditoPrevista: date("data_credito_prevista"),
	totalParcelas: integer("total_parcelas"),
	parcelaAtual: integer("parcela_atual"),
	valorParcela: numeric("valor_parcela", { precision: 10, scale:  2 }),
	dataPrimeiraParcela: date("data_primeira_parcela"),
	status: transactionStatus(),
	origemReceita: text("origem_receita"),
	centroCusto: text("centro_custo"),
	tipoDocumento: text("tipo_documento"),
	numeroDocumento: text("numero_documento"),
	dadosConvenio: jsonb("dados_convenio"),
	observacoes: text(),
	anexos: text(),
	criadoPorId: uuid("criado_por_id"),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }),
	atualizadoPorId: uuid("atualizado_por_id"),
	categoriaNome: text("categoria_nome"),
	categoriaCor: text("categoria_cor"),
	planoConvenioNome: text("plano_convenio_nome"),
}).as(sql`SELECT t.id, t.clinica_id, t.tipo, t.descricao, t.valor_bruto, t.valor_liquido, t.valor_taxas, t.paciente_id, t.consulta_id, t.fornecedor, t.plano_id, t.autorizacao_id, t.categoria, t.metodo_pagamento_id, t.conta_origem_id, t.conta_destino_id, t.cartao_id, t.data_compra, t.data_emissao, t.data_vencimento, t.data_pagamento, t.data_credito_prevista, t.total_parcelas, t.parcela_atual, t.valor_parcela, t.data_primeira_parcela, t.status, t.origem_receita, t.centro_custo, t.tipo_documento, t.numero_documento, t.dados_convenio, t.observacoes, t.anexos, t.criado_por_id, t.criado_em, t.atualizado_em, t.atualizado_por_id, cr.nome AS categoria_nome, cr.cor AS categoria_cor, pc.nome AS plano_convenio_nome FROM transacoes t LEFT JOIN categorias_receita cr ON t.categoria = cr.nome AND cr.clinica_id = t.clinica_id LEFT JOIN planos_convenio pc ON t.plano_id = pc.nome AND pc.clinica_id = t.clinica_id WHERE t.tipo = 'receita'::transaction_type ORDER BY t.data_emissao DESC, t.criado_em DESC`);

export const vwDespesas = pgView("vw_despesas", {	id: uuid(),
	clinicaId: uuid("clinica_id"),
	tipo: transactionType(),
	descricao: text(),
	valorBruto: numeric("valor_bruto", { precision: 10, scale:  2 }),
	valorLiquido: numeric("valor_liquido", { precision: 10, scale:  2 }),
	valorTaxas: numeric("valor_taxas", { precision: 10, scale:  2 }),
	pacienteId: uuid("paciente_id"),
	consultaId: uuid("consulta_id"),
	fornecedor: text(),
	planoId: text("plano_id"),
	autorizacaoId: text("autorizacao_id"),
	categoria: text(),
	metodoPagamentoId: uuid("metodo_pagamento_id"),
	contaOrigemId: uuid("conta_origem_id"),
	contaDestinoId: uuid("conta_destino_id"),
	cartaoId: uuid("cartao_id"),
	dataCompra: date("data_compra"),
	dataEmissao: date("data_emissao"),
	dataVencimento: date("data_vencimento"),
	dataPagamento: date("data_pagamento"),
	dataCreditoPrevista: date("data_credito_prevista"),
	totalParcelas: integer("total_parcelas"),
	parcelaAtual: integer("parcela_atual"),
	valorParcela: numeric("valor_parcela", { precision: 10, scale:  2 }),
	dataPrimeiraParcela: date("data_primeira_parcela"),
	status: transactionStatus(),
	origemReceita: text("origem_receita"),
	centroCusto: text("centro_custo"),
	tipoDocumento: text("tipo_documento"),
	numeroDocumento: text("numero_documento"),
	dadosConvenio: jsonb("dados_convenio"),
	observacoes: text(),
	anexos: text(),
	criadoPorId: uuid("criado_por_id"),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }),
	atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: 'string' }),
	atualizadoPorId: uuid("atualizado_por_id"),
	categoriaNome: text("categoria_nome"),
	categoriaCor: text("categoria_cor"),
	centroCustoNome: text("centro_custo_nome"),
	centroCustoTipo: text("centro_custo_tipo"),
	fornecedorNome: text("fornecedor_nome"),
	tipoDocumentoNome: text("tipo_documento_nome"),
}).as(sql`SELECT t.id, t.clinica_id, t.tipo, t.descricao, t.valor_bruto, t.valor_liquido, t.valor_taxas, t.paciente_id, t.consulta_id, t.fornecedor, t.plano_id, t.autorizacao_id, t.categoria, t.metodo_pagamento_id, t.conta_origem_id, t.conta_destino_id, t.cartao_id, t.data_compra, t.data_emissao, t.data_vencimento, t.data_pagamento, t.data_credito_prevista, t.total_parcelas, t.parcela_atual, t.valor_parcela, t.data_primeira_parcela, t.status, t.origem_receita, t.centro_custo, t.tipo_documento, t.numero_documento, t.dados_convenio, t.observacoes, t.anexos, t.criado_por_id, t.criado_em, t.atualizado_em, t.atualizado_por_id, cd.nome AS categoria_nome, cd.cor AS categoria_cor, cc.nome AS centro_custo_nome, cc.tipo AS centro_custo_tipo, f.nome_fantasia AS fornecedor_nome, td.nome AS tipo_documento_nome FROM transacoes t LEFT JOIN categorias_despesa cd ON t.categoria = cd.nome AND cd.clinica_id = t.clinica_id LEFT JOIN centros_custo cc ON t.centro_custo = cc.nome AND cc.clinica_id = t.clinica_id LEFT JOIN fornecedores f ON t.fornecedor = f.nome_fantasia AND f.clinica_id = t.clinica_id LEFT JOIN tipos_documento td ON t.tipo_documento = td.nome AND td.clinica_id = t.clinica_id WHERE t.tipo = 'despesa'::transaction_type ORDER BY t.data_emissao DESC, t.criado_em DESC`);

export const vwFluxoCaixa = pgView("vw_fluxo_caixa", {	tipo: transactionType(),
	fluxo: numeric(),
	dataPagamento: date("data_pagamento"),
	categoria: text(),
	metodoPagamentoId: uuid("metodo_pagamento_id"),
	status: transactionStatus(),
	descricao: text(),
}).as(sql`SELECT tipo, CASE WHEN tipo = 'receita'::transaction_type THEN valor_liquido ELSE - valor_liquido END AS fluxo, data_pagamento, categoria, metodo_pagamento_id, status, descricao FROM transacoes WHERE data_pagamento IS NOT NULL ORDER BY data_pagamento DESC`);