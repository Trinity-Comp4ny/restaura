import { eq, desc, and, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { transacoes } from '@/lib/db/schema'
import { dbLogger } from '@/lib/logger'

export async function getTransacoes(clinicaId: string, tipo?: 'receita' | 'despesa') {
  dbLogger.info({ clinicaId, tipo }, 'Buscando transações')

  const conditions = [eq(transacoes.clinicaId, clinicaId)]
  if (tipo) {
    conditions.push(eq(transacoes.tipo, tipo))
  }

  const result = await db.query.transacoes.findMany({
    where: and(...conditions),
    with: {
      paciente: {
        columns: { id: true, nome: true },
      },
      consulta: {
        columns: { id: true },
      },
      parcelas: true,
    },
    orderBy: [desc(transacoes.criadoEm)],
  })

  dbLogger.info({ count: result.length }, 'Transações encontradas')
  return result
}

export async function getTransacao(id: string) {
  dbLogger.info({ id }, 'Buscando transação')

  return db.query.transacoes.findFirst({
    where: eq(transacoes.id, id),
    with: {
      paciente: {
        columns: { id: true, nome: true },
      },
      consulta: {
        columns: { id: true },
      },
      parcelas: true,
      metodoPagamento: true,
      cartao: true,
    },
  })
}

export async function createTransacao(
  data: typeof transacoes.$inferInsert
) {
  dbLogger.info({ tipo: data.tipo, valor: data.valorBruto }, 'Criando transação')

  const [result] = await db.insert(transacoes).values(data).returning()
  return result
}

export async function updateTransacao(
  id: string,
  data: Partial<typeof transacoes.$inferInsert>
) {
  dbLogger.info({ id }, 'Atualizando transação')

  const [result] = await db
    .update(transacoes)
    .set(data)
    .where(eq(transacoes.id, id))
    .returning()
  return result
}

export async function deleteTransacao(id: string) {
  dbLogger.info({ id }, 'Removendo transação')

  await db.delete(transacoes).where(eq(transacoes.id, id))
}

export async function getResumoFinanceiro(clinicaId: string) {
  dbLogger.info({ clinicaId }, 'Calculando resumo financeiro')

  const resumo = await db
    .select({
      tipo: transacoes.tipo,
      total: sql<number>`sum(${transacoes.valorLiquido})::numeric`,
      count: sql<number>`count(*)::int`,
    })
    .from(transacoes)
    .where(
      and(
        eq(transacoes.clinicaId, clinicaId),
        eq(transacoes.status, 'pago')
      )
    )
    .groupBy(transacoes.tipo)

  return resumo
}
