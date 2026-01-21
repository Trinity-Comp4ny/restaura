import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

const supabase = createClient()

// ===========================================
// TIPOS
// ===========================================

type ProdutoDb = Database['public']['Tables']['produtos']['Row']
type ProdutoLoteDb = Database['public']['Tables']['produto_lotes']['Row']
type ProcedimentoMaterialDb = Database['public']['Tables']['procedimento_materiais']['Row']

export type Produto = {
  id: string
  clinica_id: string
  nome: string
  description: string | null
  category: string | null
  brand: string | null
  model: string | null
  color_size: string | null
  unit: string
  quantity: number
  min_quantity: number
  price: number
  supplier: string | null
  location: string | null
  observacoes: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export type ProdutoLote = {
  id: string
  clinica_id: string
  product_id: string
  batch_number: string
  quantity: number
  manufacture_date: string | null
  expiry_date: string | null
  purchase_date: string | null
  purchase_price: number | null
  supplier: string | null
  observacoes: string | null
  ativo: boolean
}

export type ProcedimentoMaterial = {
  id: string
  clinica_id: string
  procedimento_id: string
  product_id: string
  quantity_default: number
  quantity_min: number
  quantity_max: number
  is_required: boolean
  is_variable: boolean
  substitute_product_id: string | null
  clinical_observacoes: string | null
  produto?: Produto
  substituto?: Produto
}

export type ConsumoMaterial = {
  id: string
  clinica_id: string
  appointment_id: string
  paciente_id: string
  product_id: string
  batch_id: string | null
  quantity: number
  unit_price: number | null
  total_price: number | null
  consumed_by: string
  observacoes: string | null
  criado_em: string
}

function mapProdutoDbToProduto(p: ProdutoDb): Produto {
  return {
    id: p.id,
    clinica_id: p.clinica_id,
    nome: p.nome,
    description: p.descricao,
    category: p.categoria,
    brand: p.marca,
    model: p.modelo,
    color_size: p.cor_tamanho,
    unit: p.unidade,
    quantity: Number(p.quantidade ?? 0),
    min_quantity: Number(p.quantidade_minima ?? 0),
    price: Number(p.preco ?? 0),
    supplier: p.fornecedor,
    location: p.localizacao,
    observacoes: p.observacoes,
    ativo: p.ativo,
    criado_em: p.criado_em,
    atualizado_em: p.atualizado_em,
  }
}

function mapProdutoLoteDbToProdutoLote(l: ProdutoLoteDb): ProdutoLote {
  return {
    id: l.id,
    clinica_id: l.clinica_id,
    product_id: l.produto_id,
    batch_number: l.numero_lote,
    quantity: Number(l.quantidade ?? 0),
    manufacture_date: l.data_fabricacao,
    expiry_date: l.data_validade,
    purchase_date: l.data_compra,
    purchase_price: l.preco_compra,
    supplier: l.fornecedor,
    observacoes: l.observacoes,
    ativo: l.ativo,
  }
}

function mapProcedimentoMaterialDbToProcedimentoMaterial(m: ProcedimentoMaterialDb): ProcedimentoMaterial {
  return {
    id: m.id,
    clinica_id: m.clinica_id,
    procedimento_id: m.procedimento_id,
    product_id: m.produto_id,
    quantity_default: Number(m.quantidade_default ?? 0),
    quantity_min: Number(m.quantidade_min ?? 0),
    quantity_max: Number(m.quantidade_max ?? 0),
    is_required: m.obrigatorio,
    is_variable: m.variavel,
    substitute_product_id: m.produto_substituto_id,
    clinical_observacoes: m.notas_clinicas,
  }
}

export type MaterialParaConsumo = {
  product_id: string
  batch_id?: string
  quantity: number
  produto: Produto
  lotes_disponiveis: ProdutoLote[]
  is_required: boolean
  is_variable: boolean
  quantity_default: number
  quantity_min: number
  quantity_max: number
  estoque_suficiente: boolean
  alertas: string[]
}

// ===========================================
// HOOKS DE PRODUTOS
// ===========================================

export function useProdutos() {
  return useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (error) throw error
      return ((data as unknown as ProdutoDb[]) || []).map(mapProdutoDbToProduto)
    },
  })
}

export function useProduto(id: string) {
  return useQuery({
    queryKey: ['produto', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return mapProdutoDbToProduto(data as unknown as ProdutoDb)
    },
    enabled: !!id,
  })
}

// ===========================================
// HOOKS DE LOTES
// ===========================================

export function useLotesProduto(productId: string) {
  return useQuery({
    queryKey: ['lotes', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produto_lotes')
        .select('*')
        .eq('produto_id', productId)
        .eq('ativo', true)
        .gt('quantidade', 0)
        .order('data_validade', { ascending: true }) // FIFO por validade

      if (error) throw error
      return ((data as unknown as ProdutoLoteDb[]) || []).map(mapProdutoLoteDbToProdutoLote)
    },
    enabled: !!productId,
  })
}

// ===========================================
// HOOKS DE MATERIAIS POR PROCEDIMENTO
// ===========================================

export function useMateriaisProcedimento(procedureId: string) {
  return useQuery({
    queryKey: ['materiais-procedimento', procedureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('procedimento_materiais')
        .select(`
          *,
          produto:produtos!procedimento_materiais_produto_id_fkey(*),
          substituto:produtos!procedimento_materiais_produto_substituto_id_fkey(*)
        `)
        .eq('procedimento_id', procedureId)

      if (error) throw error
      return ((data as unknown as Array<ProcedimentoMaterialDb & { produto?: ProdutoDb; substituto?: ProdutoDb }>) || []).map((row) => {
        const base = mapProcedimentoMaterialDbToProcedimentoMaterial(row)
        return {
          ...base,
          produto: row.produto ? mapProdutoDbToProduto(row.produto) : undefined,
          substituto: row.substituto ? mapProdutoDbToProduto(row.substituto) : undefined,
        }
      })
    },
    enabled: !!procedureId,
  })
}

export function useAddMaterialProcedimento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (material: Omit<ProcedimentoMaterial, 'id' | 'produto' | 'substituto'>) => {
      const payload: Database['public']['Tables']['procedimento_materiais']['Insert'] = {
        clinica_id: material.clinica_id,
        procedimento_id: material.procedimento_id,
        produto_id: material.product_id,
        quantidade_default: material.quantity_default,
        quantidade_min: material.quantity_min,
        quantidade_max: material.quantity_max,
        obrigatorio: material.is_required,
        variavel: material.is_variable,
        produto_substituto_id: material.substitute_product_id,
        notas_clinicas: material.clinical_observacoes,
      }

      const { data, error } = await (supabase
        .from('procedimento_materiais') as unknown as { insert: (v: unknown) => any })
        .insert(payload)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materiais-procedimento', variables.procedimento_id] })
      toast.success('Material associado ao procedimento!')
    },
    onError: (error) => {
      toast.error('Erro ao associar material')
      console.error(error)
    },
  })
}

export function useRemoveMaterialProcedimento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, procedureId }: { id: string; procedureId: string }) => {
      const { error } = await supabase
        .from('procedimento_materiais')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materiais-procedimento', variables.procedureId] })
      toast.success('Material removido do procedimento!')
    },
    onError: (error) => {
      toast.error('Erro ao remover material')
      console.error(error)
    },
  })
}

export function useUpdateMaterialProcedimento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      procedureId,
      updates,
    }: {
      id: string
      procedureId: string
      updates: Partial<Omit<ProcedimentoMaterial, 'id' | 'clinica_id' | 'procedimento_id' | 'produto' | 'substituto'>>
    }) => {
      const payload: Database['public']['Tables']['procedimento_materiais']['Update'] = {
        produto_id: updates.product_id,
        quantidade_default: updates.quantity_default,
        quantidade_min: updates.quantity_min,
        quantidade_max: updates.quantity_max,
        obrigatorio: updates.is_required,
        variavel: updates.is_variable,
        produto_substituto_id: updates.substitute_product_id,
        notas_clinicas: updates.clinical_observacoes,
      }

      const { data, error } = await (supabase
        .from('procedimento_materiais') as any)
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materiais-procedimento', variables.procedureId] })
      toast.success('Material atualizado!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar material')
      console.error(error)
    },
  })
}

// ===========================================
// HOOKS DE CONSUMO
// ===========================================

export function useMateriaisParaConsumo(procedureId: string) {
  return useQuery({
    queryKey: ['materiais-para-consumo', procedureId],
    queryFn: async () => {
      // Buscar materiais do procedimento
      const { data: materiais, error: matError } = await (supabase
        .from('procedimento_materiais') as any)
        .select(`
          *,
          produto:produtos!procedimento_materiais_produto_id_fkey(*)
        `)
        .eq('procedimento_id', procedureId)

      if (matError) throw matError

      // Para cada material, buscar lotes disponíveis
      const materiaisComLotes: MaterialParaConsumo[] = await Promise.all(
        ((materiais || []) as any[]).map(async (mat: any) => {
          const { data: lotes } = await (supabase
            .from('produto_lotes') as any)
            .select('*')
            .eq('produto_id', mat.produto_id)
            .eq('ativo', true)
            .gt('quantidade', 0)
            .order('data_validade', { ascending: true })

          const produto = mapProdutoDbToProduto(mat.produto as ProdutoDb)
          const lotesDisponiveis = ((lotes || []) as ProdutoLoteDb[]).map(mapProdutoLoteDbToProdutoLote)
          const estoqueTotal = produto?.quantity || 0
          const alertas: string[] = []

          // Verificar estoque
          if (estoqueTotal < Number(mat.quantidade_default || 0)) {
            alertas.push(`Estoque insuficiente (disponível: ${estoqueTotal})`)
          } else if (estoqueTotal <= (produto?.min_quantity || 0)) {
            alertas.push('Estoque baixo - considere repor')
          }

          // Verificar validade dos lotes
          const hoje = new Date()
          lotesDisponiveis.forEach(lote => {
            if (lote.expiry_date) {
              const validade = new Date(lote.expiry_date)
              const diasParaVencer = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
              
              if (diasParaVencer < 0) {
                alertas.push(`Lote ${lote.batch_number} vencido!`)
              } else if (diasParaVencer <= 30) {
                alertas.push(`Lote ${lote.batch_number} vence em ${diasParaVencer} dias`)
              }
            }
          })

          return {
            product_id: mat.produto_id,
            quantity: Number(mat.quantidade_default || 0),
            produto,
            lotes_disponiveis: lotesDisponiveis,
            is_required: Boolean(mat.obrigatorio),
            is_variable: Boolean(mat.variavel),
            quantity_default: Number(mat.quantidade_default || 0),
            quantity_min: Number(mat.quantidade_min || 0),
            quantity_max: Number(mat.quantidade_max || 0),
            estoque_suficiente: estoqueTotal >= Number(mat.quantidade_default || 0),
            alertas,
          }
        })
      )

      return materiaisComLotes
    },
    enabled: !!procedureId,
  })
}

export function useRegistrarConsumo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (consumos: Omit<ConsumoMaterial, 'id' | 'criado_em'>[]) => {
      const { data, error } = await (supabase
        .from('consumo_materiais') as any)
        .insert(consumos)
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      queryClient.invalidateQueries({ queryKey: ['lotes'] })
      queryClient.invalidateQueries({ queryKey: ['materiais-para-consumo'] })
      toast.success('Materiais registrados com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao registrar consumo de materiais')
      console.error(error)
    },
  })
}

// ===========================================
// HOOKS DE VALIDAÇÃO
// ===========================================

export function useValidarEstoqueProcedimento(procedureId: string) {
  return useQuery({
    queryKey: ['validar-estoque', procedureId],
    queryFn: async () => {
      const { data: materiais, error } = await (supabase
        .from('procedimento_materiais') as any)
        .select(`
          *,
          produto:produtos!procedimento_materiais_produto_id_fkey(*)
        `)
        .eq('procedimento_id', procedureId)

      if (error) throw error

      const resultado = {
        podeRealizar: true,
        materiaisFaltando: [] as string[],
        materiaisEstoqueBaixo: [] as string[],
        materiaisVencidos: [] as string[],
      }

      for (const mat of (materiais || []) as any[]) {
        const produto = mapProdutoDbToProduto(mat.produto as ProdutoDb)
        
        if (!produto) continue

        // Verificar disponibilidade
        if (mat.obrigatorio && produto.quantity < Number(mat.quantidade_default || 0)) {
          resultado.podeRealizar = false
          resultado.materiaisFaltando.push(produto.nome)
        }

        // Verificar estoque baixo
        if (produto.quantity <= produto.min_quantity) {
          resultado.materiaisEstoqueBaixo.push(produto.nome)
        }
      }

      // Verificar lotes vencidos
      const { data: lotesVencidos } = await (supabase
        .from('produto_lotes') as any)
        .select('*, produto:produtos!produto_lotes_produto_id_fkey(nome)')
        .lt('data_validade', new Date().toISOString().split('T')[0])
        .gt('quantidade', 0)

      if (lotesVencidos) {
        resultado.materiaisVencidos = (lotesVencidos as any[]).map(
          (l: any) => `${l.produto?.nome} (Lote: ${l.numero_lote})`
        )
      }

      return resultado
    },
    enabled: !!procedureId,
  })
}

// ===========================================
// HOOKS DE HISTÓRICO
// ===========================================

export function useHistoricoConsumo(appointmentId: string) {
  return useQuery({
    queryKey: ['historico-consumo', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consumo_materiais')
        .select(`
          *,
          produto:produtos!consumo_materiais_produto_id_fkey(*),
          lote:produto_lotes!consumo_materiais_lote_id_fkey(*),
          usuario:usuarios!consumo_materiais_consumido_por_id_fkey(nome)
        `)
        .eq('consulta_id', appointmentId)
        .order('criado_em', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!appointmentId,
  })
}

export function useCustoConsulta(appointmentId: string) {
  return useQuery({
    queryKey: ['custo-consulta', appointmentId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('consumo_materiais') as any)
        .select('quantidade, preco_unitario, preco_total')
        .eq('consulta_id', appointmentId)

      if (error) throw error

      const custoTotal = ((data || []) as any[]).reduce((total: number, item: any) => {
        return total + (item.preco_total || 0)
      }, 0)

      return {
        itens: data?.length || 0,
        custoTotal,
      }
    },
    enabled: !!appointmentId,
  })
}
