import { relations } from 'drizzle-orm'
import { clinicas } from './clinicas'
import { usuarios } from './usuarios'
import { pacientes } from './pacientes'
import { procedimentos, consultas, prontuarios } from './consultas'
import {
  transacoes,
  parcelas,
  metodosPagamento,
  contasBancarias,
  cartoes,
  faturasCartao,
  contasPagar,
  contasReceber,
  planosParcelamento,
  contatosInadimplencia,
  fornecedores,
} from './financeiro'
import { produtos, produtoLotes, movimentacoesEstoque } from './estoque'
import { convites } from './convites'

// ── Clinicas ──
export const clinicasRelations = relations(clinicas, ({ many }) => ({
  usuarios: many(usuarios),
  pacientes: many(pacientes),
  consultas: many(consultas),
  transacoes: many(transacoes),
  produtos: many(produtos),
  convites: many(convites),
}))

// ── Usuarios ──
export const usuariosRelations = relations(usuarios, ({ one }) => ({
  clinica: one(clinicas, {
    fields: [usuarios.clinicaId],
    references: [clinicas.id],
  }),
}))

// ── Pacientes ──
export const pacientesRelations = relations(pacientes, ({ one, many }) => ({
  clinica: one(clinicas, {
    fields: [pacientes.clinicaId],
    references: [clinicas.id],
  }),
  consultas: many(consultas),
  transacoes: many(transacoes),
  contasReceber: many(contasReceber),
}))

// ── Procedimentos ──
export const procedimentosRelations = relations(
  procedimentos,
  ({ one, many }) => ({
    clinica: one(clinicas, {
      fields: [procedimentos.clinicaId],
      references: [clinicas.id],
    }),
    consultas: many(consultas),
  })
)

// ── Consultas ──
export const consultasRelations = relations(consultas, ({ one }) => ({
  clinica: one(clinicas, {
    fields: [consultas.clinicaId],
    references: [clinicas.id],
  }),
  paciente: one(pacientes, {
    fields: [consultas.pacienteId],
    references: [pacientes.id],
  }),
  dentista: one(usuarios, {
    fields: [consultas.dentistaId],
    references: [usuarios.id],
  }),
  procedimento: one(procedimentos, {
    fields: [consultas.procedimentoId],
    references: [procedimentos.id],
  }),
}))

// ── Prontuarios ──
export const prontuariosRelations = relations(prontuarios, ({ one }) => ({
  clinica: one(clinicas, {
    fields: [prontuarios.clinicaId],
    references: [clinicas.id],
  }),
  paciente: one(pacientes, {
    fields: [prontuarios.pacienteId],
    references: [pacientes.id],
  }),
  consulta: one(consultas, {
    fields: [prontuarios.consultaId],
    references: [consultas.id],
  }),
  criadoPor: one(usuarios, {
    fields: [prontuarios.criadoPorId],
    references: [usuarios.id],
  }),
}))

// ── Transacoes ──
export const transacoesRelations = relations(transacoes, ({ one, many }) => ({
  clinica: one(clinicas, {
    fields: [transacoes.clinicaId],
    references: [clinicas.id],
  }),
  paciente: one(pacientes, {
    fields: [transacoes.pacienteId],
    references: [pacientes.id],
  }),
  consulta: one(consultas, {
    fields: [transacoes.consultaId],
    references: [consultas.id],
  }),
  metodoPagamento: one(metodosPagamento, {
    fields: [transacoes.metodoPagamentoId],
    references: [metodosPagamento.id],
  }),
  contaOrigem: one(contasBancarias, {
    fields: [transacoes.contaOrigemId],
    references: [contasBancarias.id],
    relationName: 'contaOrigem',
  }),
  contaDestino: one(contasBancarias, {
    fields: [transacoes.contaDestinoId],
    references: [contasBancarias.id],
    relationName: 'contaDestino',
  }),
  cartao: one(cartoes, {
    fields: [transacoes.cartaoId],
    references: [cartoes.id],
  }),
  criadoPor: one(usuarios, {
    fields: [transacoes.criadoPorId],
    references: [usuarios.id],
  }),
  parcelas: many(parcelas),
}))

// ── Parcelas ──
export const parcelasRelations = relations(parcelas, ({ one }) => ({
  transacao: one(transacoes, {
    fields: [parcelas.transacaoId],
    references: [transacoes.id],
  }),
  faturaCartao: one(faturasCartao, {
    fields: [parcelas.faturaCartaoId],
    references: [faturasCartao.id],
  }),
}))

// ── Faturas Cartão ──
export const faturasCartaoRelations = relations(
  faturasCartao,
  ({ one, many }) => ({
    cartao: one(cartoes, {
      fields: [faturasCartao.cartaoId],
      references: [cartoes.id],
    }),
    contaBancaria: one(contasBancarias, {
      fields: [faturasCartao.contaBancariaId],
      references: [contasBancarias.id],
    }),
    parcelas: many(parcelas),
  })
)

// ── Cartoes ──
export const cartoesRelations = relations(cartoes, ({ one, many }) => ({
  clinica: one(clinicas, {
    fields: [cartoes.clinicaId],
    references: [clinicas.id],
  }),
  contaFatura: one(contasBancarias, {
    fields: [cartoes.contaFaturaId],
    references: [contasBancarias.id],
  }),
  faturas: many(faturasCartao),
  transacoes: many(transacoes),
}))

// ── Produtos ──
export const produtosRelations = relations(produtos, ({ one, many }) => ({
  clinica: one(clinicas, {
    fields: [produtos.clinicaId],
    references: [clinicas.id],
  }),
  lotes: many(produtoLotes),
  movimentacoes: many(movimentacoesEstoque),
}))

// ── Produto Lotes ──
export const produtoLotesRelations = relations(produtoLotes, ({ one }) => ({
  produto: one(produtos, {
    fields: [produtoLotes.produtoId],
    references: [produtos.id],
  }),
}))

// ── Movimentações Estoque ──
export const movimentacoesEstoqueRelations = relations(
  movimentacoesEstoque,
  ({ one }) => ({
    clinica: one(clinicas, {
      fields: [movimentacoesEstoque.clinicaId],
      references: [clinicas.id],
    }),
    produto: one(produtos, {
      fields: [movimentacoesEstoque.produtoId],
      references: [produtos.id],
    }),
    lote: one(produtoLotes, {
      fields: [movimentacoesEstoque.loteId],
      references: [produtoLotes.id],
    }),
    realizadoPor: one(usuarios, {
      fields: [movimentacoesEstoque.criadoPorId],
      references: [usuarios.id],
    }),
  })
)

// ── Contas a Pagar ──
export const contasPagarRelations = relations(contasPagar, ({ one }) => ({
  clinica: one(clinicas, {
    fields: [contasPagar.clinicaId],
    references: [clinicas.id],
  }),
  fornecedor: one(fornecedores, {
    fields: [contasPagar.fornecedorId],
    references: [fornecedores.id],
  }),
}))

// ── Contas a Receber ──
export const contasReceberRelations = relations(contasReceber, ({ one }) => ({
  clinica: one(clinicas, {
    fields: [contasReceber.clinicaId],
    references: [clinicas.id],
  }),
  paciente: one(pacientes, {
    fields: [contasReceber.pacienteId],
    references: [pacientes.id],
  }),
  consulta: one(consultas, {
    fields: [contasReceber.consultaId],
    references: [consultas.id],
  }),
  planoParcelamento: one(planosParcelamento, {
    fields: [contasReceber.planoParcelamentoId],
    references: [planosParcelamento.id],
  }),
}))

// ── Contatos Inadimplência ──
export const contatosInadimplenciaRelations = relations(
  contatosInadimplencia,
  ({ one }) => ({
    clinica: one(clinicas, {
      fields: [contatosInadimplencia.clinicaId],
      references: [clinicas.id],
    }),
    paciente: one(pacientes, {
      fields: [contatosInadimplencia.pacienteId],
      references: [pacientes.id],
    }),
    contaReceber: one(contasReceber, {
      fields: [contatosInadimplencia.contaReceberId],
      references: [contasReceber.id],
    }),
    responsavelContato: one(usuarios, {
      fields: [contatosInadimplencia.responsavelContatoId],
      references: [usuarios.id],
    }),
  })
)

// ── Convites ──
export const convitesRelations = relations(convites, ({ one }) => ({
  clinica: one(clinicas, {
    fields: [convites.clinicaId],
    references: [clinicas.id],
  }),
  convidadoPor: one(usuarios, {
    fields: [convites.convidadoPorId],
    references: [usuarios.id],
  }),
}))
