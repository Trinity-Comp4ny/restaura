import { relations } from "drizzle-orm/relations";
import { contasPagar, clinicas, usuarios, fornecedores, contasReceber, consultas, planosConvenio, pacientes, contatosInadimplencia, cartoes, faturasCartao, contasBancarias, convites, convitesFundador, procedimentos, parcelas, transacoes, produtos, produtoLotes, movimentacoesEstoque, tiposDocumento, prontuarios, categoriasReceita, categoriasDespesa, metodosPagamento, metodosCobranca } from "./schema";

export const contasPagarRelations = relations(contasPagar, ({one}) => ({
	clinica: one(clinicas, {
		fields: [contasPagar.clinicaId],
		references: [clinicas.id]
	}),
	usuario: one(usuarios, {
		fields: [contasPagar.criadoPorId],
		references: [usuarios.id]
	}),
	fornecedore: one(fornecedores, {
		fields: [contasPagar.fornecedorId],
		references: [fornecedores.id]
	}),
}));

export const clinicasRelations = relations(clinicas, ({many}) => ({
	contasPagars: many(contasPagar),
	contasRecebers: many(contasReceber),
	contatosInadimplencias: many(contatosInadimplencia),
	convites: many(convites),
	convitesFundadors: many(convitesFundador),
	procedimentos: many(procedimentos),
	parcelas: many(parcelas),
	planosConvenios: many(planosConvenio),
	contasBancarias: many(contasBancarias),
	cartoes: many(cartoes),
	produtos: many(produtos),
	movimentacoesEstoques: many(movimentacoesEstoque),
	fornecedores: many(fornecedores),
	tiposDocumentos: many(tiposDocumento),
	usuarios: many(usuarios),
	pacientes: many(pacientes),
	consultas: many(consultas),
	prontuarios: many(prontuarios),
	categoriasReceitas: many(categoriasReceita),
	categoriasDespesas: many(categoriasDespesa),
	metodosPagamentos: many(metodosPagamento),
	metodosCobrancas: many(metodosCobranca),
	transacoes: many(transacoes),
}));

export const usuariosRelations = relations(usuarios, ({one, many}) => ({
	contasPagars: many(contasPagar),
	contasRecebers: many(contasReceber),
	contatosInadimplencias: many(contatosInadimplencia),
	convites: many(convites),
	movimentacoesEstoques: many(movimentacoesEstoque),
	usuarios: one(usuarios, {
		fields: [usuarios.authUsuarioId],
		references: [usuarios.id]
	}),
	clinica: one(clinicas, {
		fields: [usuarios.clinicaId],
		references: [clinicas.id]
	}),
	consultas: many(consultas),
	prontuarios: many(prontuarios),
	transacoes_atualizadoPorId: many(transacoes, {
		relationName: "transacoes_atualizadoPorId_usuarios_id"
	}),
	transacoes_criadoPorId: many(transacoes, {
		relationName: "transacoes_criadoPorId_usuarios_id"
	}),
}));

export const fornecedoresRelations = relations(fornecedores, ({one, many}) => ({
	contasPagars: many(contasPagar),
	clinica: one(clinicas, {
		fields: [fornecedores.clinicaId],
		references: [clinicas.id]
	}),
}));

export const contasReceberRelations = relations(contasReceber, ({one, many}) => ({
	clinica: one(clinicas, {
		fields: [contasReceber.clinicaId],
		references: [clinicas.id]
	}),
	consulta: one(consultas, {
		fields: [contasReceber.consultaId],
		references: [consultas.id]
	}),
	planosConvenio: one(planosConvenio, {
		fields: [contasReceber.convenioId],
		references: [planosConvenio.id]
	}),
	usuario: one(usuarios, {
		fields: [contasReceber.criadoPorId],
		references: [usuarios.id]
	}),
	paciente: one(pacientes, {
		fields: [contasReceber.pacienteId],
		references: [pacientes.id]
	}),
	contatosInadimplencias: many(contatosInadimplencia),
}));

export const consultasRelations = relations(consultas, ({one, many}) => ({
	contasRecebers: many(contasReceber),
	clinica: one(clinicas, {
		fields: [consultas.clinicaId],
		references: [clinicas.id]
	}),
	usuario: one(usuarios, {
		fields: [consultas.dentistaId],
		references: [usuarios.id]
	}),
	paciente: one(pacientes, {
		fields: [consultas.pacienteId],
		references: [pacientes.id]
	}),
	procedimento: one(procedimentos, {
		fields: [consultas.procedimentoId],
		references: [procedimentos.id]
	}),
	prontuarios: many(prontuarios),
	transacoes: many(transacoes),
}));

export const planosConvenioRelations = relations(planosConvenio, ({one, many}) => ({
	contasRecebers: many(contasReceber),
	clinica: one(clinicas, {
		fields: [planosConvenio.clinicaId],
		references: [clinicas.id]
	}),
}));

export const pacientesRelations = relations(pacientes, ({one, many}) => ({
	contasRecebers: many(contasReceber),
	contatosInadimplencias: many(contatosInadimplencia),
	clinica: one(clinicas, {
		fields: [pacientes.clinicaId],
		references: [clinicas.id]
	}),
	consultas: many(consultas),
	prontuarios: many(prontuarios),
	transacoes: many(transacoes),
}));

export const contatosInadimplenciaRelations = relations(contatosInadimplencia, ({one}) => ({
	clinica: one(clinicas, {
		fields: [contatosInadimplencia.clinicaId],
		references: [clinicas.id]
	}),
	contasReceber: one(contasReceber, {
		fields: [contatosInadimplencia.contaReceberId],
		references: [contasReceber.id]
	}),
	paciente: one(pacientes, {
		fields: [contatosInadimplencia.pacienteId],
		references: [pacientes.id]
	}),
	usuario: one(usuarios, {
		fields: [contatosInadimplencia.responsavelContatoId],
		references: [usuarios.id]
	}),
}));

export const faturasCartaoRelations = relations(faturasCartao, ({one, many}) => ({
	cartoe: one(cartoes, {
		fields: [faturasCartao.cartaoId],
		references: [cartoes.id]
	}),
	contasBancaria: one(contasBancarias, {
		fields: [faturasCartao.contaBancariaId],
		references: [contasBancarias.id]
	}),
	parcelas: many(parcelas),
	transacoes: many(transacoes),
}));

export const cartoesRelations = relations(cartoes, ({one, many}) => ({
	faturasCartaos: many(faturasCartao),
	clinica: one(clinicas, {
		fields: [cartoes.clinicaId],
		references: [clinicas.id]
	}),
	contasBancaria: one(contasBancarias, {
		fields: [cartoes.contaFaturaId],
		references: [contasBancarias.id]
	}),
	transacoes: many(transacoes),
}));

export const contasBancariasRelations = relations(contasBancarias, ({one, many}) => ({
	faturasCartaos: many(faturasCartao),
	clinica: one(clinicas, {
		fields: [contasBancarias.clinicaId],
		references: [clinicas.id]
	}),
	cartoes: many(cartoes),
	metodosPagamentos: many(metodosPagamento),
	metodosCobrancas: many(metodosCobranca),
	transacoes_contaBancariaId: many(transacoes, {
		relationName: "transacoes_contaBancariaId_contasBancarias_id"
	}),
	transacoes_contaDestinoId: many(transacoes, {
		relationName: "transacoes_contaDestinoId_contasBancarias_id"
	}),
	transacoes_contaOrigemId: many(transacoes, {
		relationName: "transacoes_contaOrigemId_contasBancarias_id"
	}),
}));

export const convitesRelations = relations(convites, ({one}) => ({
	usuarios: one(usuarios, {
		fields: [convites.aceitoPorId],
		references: [usuarios.id]
	}),
	clinica: one(clinicas, {
		fields: [convites.clinicaId],
		references: [clinicas.id]
	}),
	usuario: one(usuarios, {
		fields: [convites.convidadoPorId],
		references: [usuarios.id]
	}),
}));

export const convitesFundadorRelations = relations(convitesFundador, ({one}) => ({
	usuarios_aceitoPorId: one(usuarios, {
		fields: [convitesFundador.aceitoPorId],
		references: [usuarios.id],
		relationName: "convitesFundador_aceitoPorId_usuarios_id"
	}),
	clinica: one(clinicas, {
		fields: [convitesFundador.clinicaCriadaId],
		references: [clinicas.id]
	}),
	usuarios_convidadoPorId: one(usuarios, {
		fields: [convitesFundador.convidadoPorId],
		references: [usuarios.id],
		relationName: "convitesFundador_convidadoPorId_usuarios_id"
	}),
}));

export const procedimentosRelations = relations(procedimentos, ({one, many}) => ({
	clinica: one(clinicas, {
		fields: [procedimentos.clinicaId],
		references: [clinicas.id]
	}),
	consultas: many(consultas),
}));

export const parcelasRelations = relations(parcelas, ({one}) => ({
	clinica: one(clinicas, {
		fields: [parcelas.clinicaId],
		references: [clinicas.id]
	}),
	faturasCartao: one(faturasCartao, {
		fields: [parcelas.faturaCartaoId],
		references: [faturasCartao.id]
	}),
	transacoe: one(transacoes, {
		fields: [parcelas.transacaoId],
		references: [transacoes.id]
	}),
}));

export const transacoesRelations = relations(transacoes, ({one, many}) => ({
	parcelas: many(parcelas),
	usuario_atualizadoPorId: one(usuarios, {
		fields: [transacoes.atualizadoPorId],
		references: [usuarios.id],
		relationName: "transacoes_atualizadoPorId_usuarios_id"
	}),
	cartoe: one(cartoes, {
		fields: [transacoes.cartaoId],
		references: [cartoes.id]
	}),
	clinica: one(clinicas, {
		fields: [transacoes.clinicaId],
		references: [clinicas.id]
	}),
	consulta: one(consultas, {
		fields: [transacoes.consultaId],
		references: [consultas.id]
	}),
	contasBancaria_contaBancariaId: one(contasBancarias, {
		fields: [transacoes.contaBancariaId],
		references: [contasBancarias.id],
		relationName: "transacoes_contaBancariaId_contasBancarias_id"
	}),
	contasBancaria_contaDestinoId: one(contasBancarias, {
		fields: [transacoes.contaDestinoId],
		references: [contasBancarias.id],
		relationName: "transacoes_contaDestinoId_contasBancarias_id"
	}),
	contasBancaria_contaOrigemId: one(contasBancarias, {
		fields: [transacoes.contaOrigemId],
		references: [contasBancarias.id],
		relationName: "transacoes_contaOrigemId_contasBancarias_id"
	}),
	usuario_criadoPorId: one(usuarios, {
		fields: [transacoes.criadoPorId],
		references: [usuarios.id],
		relationName: "transacoes_criadoPorId_usuarios_id"
	}),
	faturasCartao: one(faturasCartao, {
		fields: [transacoes.faturaCartaoId],
		references: [faturasCartao.id]
	}),
	metodosCobranca: one(metodosCobranca, {
		fields: [transacoes.metodoCobrancaId],
		references: [metodosCobranca.id]
	}),
	metodosPagamento: one(metodosPagamento, {
		fields: [transacoes.metodoPagamentoId],
		references: [metodosPagamento.id]
	}),
	paciente: one(pacientes, {
		fields: [transacoes.pacienteId],
		references: [pacientes.id]
	}),
}));

export const produtosRelations = relations(produtos, ({one, many}) => ({
	clinica: one(clinicas, {
		fields: [produtos.clinicaId],
		references: [clinicas.id]
	}),
	produtoLotes: many(produtoLotes),
	movimentacoesEstoques: many(movimentacoesEstoque),
}));

export const produtoLotesRelations = relations(produtoLotes, ({one, many}) => ({
	produto: one(produtos, {
		fields: [produtoLotes.produtoId],
		references: [produtos.id]
	}),
	movimentacoesEstoques: many(movimentacoesEstoque),
}));

export const movimentacoesEstoqueRelations = relations(movimentacoesEstoque, ({one}) => ({
	clinica: one(clinicas, {
		fields: [movimentacoesEstoque.clinicaId],
		references: [clinicas.id]
	}),
	usuario: one(usuarios, {
		fields: [movimentacoesEstoque.criadoPorId],
		references: [usuarios.id]
	}),
	produtoLote: one(produtoLotes, {
		fields: [movimentacoesEstoque.loteId],
		references: [produtoLotes.id]
	}),
	produto: one(produtos, {
		fields: [movimentacoesEstoque.produtoId],
		references: [produtos.id]
	}),
}));

export const tiposDocumentoRelations = relations(tiposDocumento, ({one}) => ({
	clinica: one(clinicas, {
		fields: [tiposDocumento.clinicaId],
		references: [clinicas.id]
	}),
}));

export const prontuariosRelations = relations(prontuarios, ({one}) => ({
	clinica: one(clinicas, {
		fields: [prontuarios.clinicaId],
		references: [clinicas.id]
	}),
	consulta: one(consultas, {
		fields: [prontuarios.consultaId],
		references: [consultas.id]
	}),
	usuario: one(usuarios, {
		fields: [prontuarios.criadoPorId],
		references: [usuarios.id]
	}),
	paciente: one(pacientes, {
		fields: [prontuarios.pacienteId],
		references: [pacientes.id]
	}),
}));

export const categoriasReceitaRelations = relations(categoriasReceita, ({one}) => ({
	clinica: one(clinicas, {
		fields: [categoriasReceita.clinicaId],
		references: [clinicas.id]
	}),
}));

export const categoriasDespesaRelations = relations(categoriasDespesa, ({one}) => ({
	clinica: one(clinicas, {
		fields: [categoriasDespesa.clinicaId],
		references: [clinicas.id]
	}),
}));

export const metodosPagamentoRelations = relations(metodosPagamento, ({one, many}) => ({
	clinica: one(clinicas, {
		fields: [metodosPagamento.clinicaId],
		references: [clinicas.id]
	}),
	contasBancaria: one(contasBancarias, {
		fields: [metodosPagamento.contaVinculadaId],
		references: [contasBancarias.id]
	}),
	transacoes: many(transacoes),
}));

export const metodosCobrancaRelations = relations(metodosCobranca, ({one, many}) => ({
	clinica: one(clinicas, {
		fields: [metodosCobranca.clinicaId],
		references: [clinicas.id]
	}),
	contasBancaria: one(contasBancarias, {
		fields: [metodosCobranca.contaVinculadaId],
		references: [contasBancarias.id]
	}),
	transacoes: many(transacoes),
}));