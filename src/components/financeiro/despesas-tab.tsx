'use client'

import { useState, useMemo, Fragment } from 'react'
import {
  Plus, Search, Eye, CheckCircle, Clock, AlertCircle,
  MoreHorizontal, ArrowDownRight, Filter, X, DollarSign, Trash2, Edit, Loader2,
  ChevronDown, ChevronUp, ChevronsUpDown, CreditCard, Building2, Info, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { addDaysToISODate, formatDate, formatCurrency, getLocalISODate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useTransacoes, useCreateTransacao, useUpdateTransacao, useDeleteTransacao } from '@/hooks/use-transacoes'
import { useMarcarParcelaPaga } from '@/hooks/use-parcelas'
import { useCategoriasDespesa } from '@/hooks/use-categorias-financeiras'
import { useMetodosPagamento } from '@/hooks/use-metodos-pagamento'
import { useCartoes } from '@/hooks/use-cartoes'
import { useContasBancarias } from '@/hooks/use-contas-bancarias'
import { useUser, useClinica } from '@/hooks/use-user'
import { EmptyDropdown } from '@/components/ui/empty-dropdown'
import { toast } from 'sonner'

interface DespesasTabProps {
  periodo: string
  customRange?: { startDate: string; endDate: string }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pago: { label: 'Pago', color: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900' },
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-900' },
  vencido: { label: 'Vencido', color: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-900' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-900' },
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

const levenshteinDistance = (a: string, b: string) => {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  return matrix[a.length][b.length]
}

const fuzzyIncludes = (text: string, query: string) => {
  if (!query.trim()) return true

  const tokens = normalizeText(query).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return true

  const normalizedText = normalizeText(text)
  const words = normalizedText.split(/\s+/)

  return tokens.every((token) => {
    if (normalizedText.includes(token)) return true

    const maxDistance = Math.max(1, Math.floor(token.length / 3))
    return words.some((word) => levenshteinDistance(word, token) <= maxDistance)
  })
}

const addMonthsToISODate = (isoDate: string, months: number) => {
  const date = new Date(isoDate)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}

export function DespesasTab({ periodo, customRange }: DespesasTabProps) {
  const supabaseClient = createClient()
  const { data: user } = useUser()
  const { data: clinica } = useClinica()
  const clinicaId = user?.clinica_id

  const { data: despesas, isLoading } = useTransacoes(clinicaId, 'despesa')
  const { data: categoriasDespesa, isLoading: categoriasLoading } = useCategoriasDespesa(clinicaId)
  const { data: metodosPagamento, isLoading: metodosLoading } = useMetodosPagamento(clinicaId)
  const { data: cartoes } = useCartoes(clinicaId)
  const { data: contasBancarias } = useContasBancarias()
  
  const createTransacao = useCreateTransacao()
  const updateTransacao = useUpdateTransacao()
  const deleteTransacao = useDeleteTransacao()
  const marcarParcelaPaga = useMarcarParcelaPaga()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [categoriaFilter, setCategoriaFilter] = useState('Todas')
  const [metodoFilter, setMetodoFilter] = useState('Todos')
  const [showFilters, setShowFilters] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingDespesaId, setEditingDespesaId] = useState<string | null>(null)
  const [selectedDespesa, setSelectedDespesa] = useState<any>(null)
  const [sortBy, setSortBy] = useState<'data' | 'descricao' | 'categoria' | 'metodo' | 'status' | 'valor'>('data')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Estado para controlar quais despesas estão expandidas
  const [despesasExpandidas, setDespesasExpandidas] = useState<Set<string>>(new Set())

  const toggleDespesaExpandida = (chave: string) => {
    const novoSet = new Set(despesasExpandidas)
    if (novoSet.has(chave)) {
      novoSet.delete(chave)
    } else {
      novoSet.add(chave)
    }
    setDespesasExpandidas(novoSet)
  }

  // Form state for new despesa
  const [formDescricao, setFormDescricao] = useState('')
  const [formCategoria, setFormCategoria] = useState('')
  const [formValorBruto, setFormValorBruto] = useState('')
  const [formValorTaxas, setFormValorTaxas] = useState('')
  const [formValorLiquido, setFormValorLiquido] = useState('')
  const [formMetodo, setFormMetodo] = useState('')
  const [formCartao, setFormCartao] = useState('')
  const [formDataVencimento, setFormDataVencimento] = useState('')
  const [formTotalParcelas, setFormTotalParcelas] = useState('1')
  const [formDataDebitoPrevisto, setFormDataDebitoPrevisto] = useState('')
  const [formFornecedor, setFormFornecedor] = useState('')
  const [formObservacoes, setFormObservacoes] = useState('')

  const categoriaLabel = useMemo(() => {
    if (formCategoria === '') return 'Categoria'
    return categoriasDespesa?.find((c: any) => `${c.id}` === formCategoria)?.nome || 'Categoria'
  }, [formCategoria, categoriasDespesa])

  const metodoLabel = useMemo(() => {
    if (formMetodo === '') return 'Método'
    return metodosPagamento?.find((m: any) => `${m.id}` === formMetodo)?.nome || 'Método'
  }, [formMetodo, metodosPagamento])

  // Tipo do método selecionado (para lógica condicional)
  const metodoSelecionadoObj = useMemo(() => {
    if (!formMetodo || !metodosPagamento) return null
    return metodosPagamento.find((m: any) => m.nome === formMetodo) || null
  }, [formMetodo, metodosPagamento])

  // Tipos de método de pagamento (text livre no banco)
  const isPix = metodoSelecionadoObj?.tipo?.toLowerCase() === 'pix'
  const isDinheiro = metodoSelecionadoObj?.tipo?.toLowerCase() === 'dinheiro'
  const isTransferencia = metodoSelecionadoObj?.tipo?.toLowerCase() === 'transferencia'
  const isBoleto = metodoSelecionadoObj?.tipo?.toLowerCase() === 'boleto'
  const isDebitoAutomatico = metodoSelecionadoObj?.tipo?.toLowerCase() === 'debito_automatico'
  const isCartaoCredito = metodoSelecionadoObj?.tipo?.toLowerCase() === 'cartao_credito'
  const isCartaoDebito = metodoSelecionadoObj?.tipo?.toLowerCase() === 'cartao_debito'
  const isDebitoImediato = isPix || isDinheiro || isTransferencia || isDebitoAutomatico

  const resetForm = () => {
    setFormDescricao('')
    setFormCategoria('')
    setFormValorBruto('')
    setFormValorTaxas('')
    setFormValorLiquido('')
    setFormMetodo('')
    setFormCartao('')
    setFormDataVencimento('')
    setFormTotalParcelas('1')
    setFormDataDebitoPrevisto('')
    setFormFornecedor('')
    setFormObservacoes('')
  }

  const handleNewDespesaOpenChange = (open: boolean) => {
    setShowNewDialog(open)
    if (!open) {
      resetForm()
      setEditingDespesaId(null)
    }
  }

  const startEditDespesa = (despesa: any) => {
    if (!despesa) return
    setEditingDespesaId(despesa.id)
    setFormDescricao(despesa.descricao || '')
    setFormCategoria(categoriasDespesa?.find((c: any) => c.id === despesa.categoria)?.nome || '')
    setFormValorBruto(despesa.valor_bruto?.toString() || '')
    setFormValorTaxas(despesa.valor_taxas?.toString() || '')
    setFormValorLiquido(despesa.valor_liquido?.toString() || '')
    setFormMetodo(metodosPagamento?.find((m: any) => m.id === despesa.metodo_pagamento_id)?.nome || '')
    setFormCartao(despesa.cartao_id || '')
    setFormDataVencimento(despesa.data_vencimento || '')
    setFormTotalParcelas((despesa.total_parcelas || 1).toString())
    setFormDataDebitoPrevisto(despesa.data_debito_previsto || '')
    setFormFornecedor(despesa.fornecedor || '')
    setFormObservacoes(despesa.observacoes || '')
    setShowNewDialog(true)
    setSelectedDespesa(null)
  }

  // Função para formatar valor monetário automaticamente
  const formatarValorMonetario = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '')
    if (numeros === '') return ''
    const valorNumerico = parseInt(numeros) / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valorNumerico)
  }

  // Recalcular taxas baseado no método e valor bruto
  // DESPESA: valor_liquido = valor_bruto + taxas (clínica paga MAIS)
  const recalcularTaxas = (valorBruto: number, metodoNome?: string) => {
    const metodo = metodoNome 
      ? metodosPagamento?.find((m: any) => m.nome === metodoNome)
      : metodoSelecionadoObj
    
    if (metodo && valorBruto > 0) {
      const taxaPercentual = valorBruto * (metodo.taxas_percentual / 100)
      const taxaFixa = metodo.taxas_fixa || 0
      const totalTaxas = taxaPercentual + taxaFixa
      setFormValorTaxas(totalTaxas.toFixed(2))
      setFormValorLiquido((valorBruto + totalTaxas).toFixed(2))
    } else {
      setFormValorTaxas('0')
      setFormValorLiquido(valorBruto > 0 ? valorBruto.toFixed(2) : '0')
    }
  }

  // Função para calcular previsão de débito baseada no tipo de método
  const calcularPrevisaoDebito = (dataVencimento: string, metodoObj: any, cartaoObj?: any) => {
    if (!dataVencimento || !metodoObj) return ''
    
    // Se for cartão de crédito, usar lógica de fechamento/vencimento da fatura
    if (metodoObj.tipo === 'cartao_credito' && cartaoObj) {
      // Extrair dia diretamente da string para evitar problemas de fuso horário
      const diaSelecionado = parseInt(dataVencimento.split('-')[2])
      const mesSelecionado = parseInt(dataVencimento.split('-')[1]) - 1 // JS usa 0-11 para meses
      const anoSelecionado = parseInt(dataVencimento.split('-')[0])
      
      const diaFechamento = parseInt(cartaoObj.dia_fechamento)
      const diaVencimento = parseInt(cartaoObj.dia_vencimento)
      
      if (diaFechamento && diaVencimento && !isNaN(diaFechamento) && !isNaN(diaVencimento)) {
        // Se a data de vencimento for MENOR ou IGUAL ao dia de fechamento, vence no mesmo mês
        // Se for MAIOR que o dia de fechamento, vence no mês seguinte
        if (diaSelecionado <= diaFechamento) {
          return `${anoSelecionado}-${String(mesSelecionado + 1).padStart(2, '0')}-${String(diaVencimento).padStart(2, '0')}`
        } else {
          // Se for depois do fechamento, vence no mês seguinte
          return `${anoSelecionado}-${String(mesSelecionado + 2).padStart(2, '0')}-${String(diaVencimento).padStart(2, '0')}`
        }
      }
    }
    
    // Para outros métodos (PIX, transferência, etc.) ou cartão de débito, usa o prazo do método
    return addDaysToISODate(dataVencimento, metodoObj.prazo_deposito || 0)
  }

  const handleMetodoChange = (metodoNome: string) => {
    setFormMetodo(metodoNome)
    
    // Se for método de cartão, usar automaticamente o cartão vinculado
    const metodoObj = metodosPagamento?.find((m: any) => m.nome === metodoNome)
    let cartaoObj = null
    
    if (metodoObj && metodoObj.cartao_id) {
      setFormCartao(metodoObj.cartao_id)
      cartaoObj = cartoes?.find((c: any) => c.id === metodoObj.cartao_id)
    } else {
      setFormCartao('') // Limpar cartão se não tiver vinculado
    }
    
    // Recalcular previsão de débito se houver data de vencimento
    if (metodoObj && formDataVencimento) {
      const previsao = calcularPrevisaoDebito(formDataVencimento, metodoObj, cartaoObj)
      setFormDataDebitoPrevisto(previsao)
    } else {
      setFormDataDebitoPrevisto('')
    }
    
    if (!formValorBruto) return
    const valorBruto = parseFloat(formValorBruto.replace('R$', '').replace('.', '').replace(',', '.')) || 0
    if (valorBruto <= 0) return

    recalcularTaxas(valorBruto, metodoNome)
  }

  const handleSubmitDespesa = async () => {
    if (!clinicaId) {
      toast.error('Clínica não encontrada')
      return
    }

    if (!formDescricao || !formCategoria || !formValorBruto || !formMetodo || !formDataVencimento || !formTotalParcelas) {
      toast.error('Preencha os campos obrigatórios: Descrição, Categoria, Valor Bruto, Método, Data de Vencimento e Total de Parcelas')
      return
    }

    // Validar seleção de cartão para métodos de cartão (só se não tiver cartão vinculado ao método)
    if ((isCartaoCredito || isCartaoDebito) && (!formCartao || formCartao === 'nenhum') && !metodoSelecionadoObj?.cartao_id) {
      toast.error(`É obrigatório selecionar um cartão ${isCartaoCredito ? 'de crédito' : 'de débito'} para este método de pagamento`)
      return
    }

    const valorNumerico = parseFloat(formValorBruto.replace('R$', '').replace('.', '').replace(',', '.')) || 0
    const valorTaxas = parseFloat(formValorTaxas) || 0
    const valorLiquido = parseFloat(formValorLiquido) || valorNumerico

    if (valorNumerico <= 0 || isNaN(valorNumerico)) {
      toast.error('Valor inválido')
      return
    }

    const categoriaSelecionada = formCategoria ? categoriasDespesa?.find((c: any) => c.nome === formCategoria) : null

    // Determinar cartão e conta bancária baseado no tipo de método
    const cartaoSelecionado = formCartao ? cartoes?.find((c: any) => c.id === formCartao) : null
    const contaBancariaId = metodoSelecionadoObj?.conta_vinculada_id || null

    const payload = {
      clinica_id: clinicaId,
      tipo: 'despesa',
      categoria: categoriaSelecionada?.id || null,
      descricao: formDescricao,
      valor_bruto: valorNumerico,
      valor_liquido: valorLiquido,
      valor_taxas: valorTaxas,
      metodo_pagamento_id: metodoSelecionadoObj?.id || null,
      cartao_id: cartaoSelecionado?.id || null,
      conta_bancaria_id: contaBancariaId,
      status: editingDespesaId ? undefined : 'pendente',
      data_vencimento: formDataVencimento || null,
      data_pagamento: editingDespesaId ? undefined : null,
      fornecedor: formFornecedor || null,
      total_parcelas: parseInt(formTotalParcelas) || 1,
      parcela_atual: 1,
      valor_parcela: valorLiquido / (parseInt(formTotalParcelas) || 1),
      data_primeira_parcela: formDataVencimento || null,
      observacoes: formObservacoes || null,
      criado_por_id: user?.id || null,
    } as any

    const atualizarParcelas = async (transacaoId: string) => {
      const totalParcelas = parseInt(formTotalParcelas) || 1
      const valorParcelaCalculado = valorLiquido / totalParcelas
      const primeiraData = formDataVencimento || getLocalISODate()

      const { data: existentes } = await supabaseClient
        .from('parcelas')
        .select('id, numero_parcela, data_pagamento')
        .eq('transacao_id', transacaoId)
        .order('numero_parcela')

      const existentesArr = (existentes as any[]) || []
      const updates: Promise<any>[] = []

      for (let i = 0; i < totalParcelas; i++) {
        const dataVencimento = addMonthsToISODate(primeiraData, i)
        const existente = existentesArr[i]
        const payloadParcela = {
          numero_parcela: i + 1,
          total_parcelas: totalParcelas,
          valor: valorParcelaCalculado,
          data_vencimento: dataVencimento,
          data_credito_prevista: dataVencimento,
        } as any

        if (existente) {
          updates.push(
            (supabaseClient as any)
              .from('parcelas')
              .update(payloadParcela)
              .eq('id', existente.id)
              .select() as unknown as Promise<any>
          )
        } else {
          updates.push(
            (supabaseClient as any)
              .from('parcelas')
              .insert({
                clinica_id: clinicaId,
                transacao_id: transacaoId,
                ...payloadParcela,
              } as any)
              .select() as unknown as Promise<any>
          )
        }
      }

      if (existentesArr.length > totalParcelas) {
        const extras = existentesArr.slice(totalParcelas)
        for (const parcela of extras) {
          if (!parcela.data_pagamento) {
            updates.push(
              (supabaseClient as any)
                .from('parcelas')
                .delete()
                .eq('id', parcela.id)
                .select() as unknown as Promise<any>
            )
          }
        }
      }

      await Promise.all(updates)
    }

    const onSuccess = async (_data: any, variables?: any) => {
      if (editingDespesaId && variables?.id) {
        await atualizarParcelas(variables.id)
      }
      handleNewDespesaOpenChange(false)
    }

    if (editingDespesaId) {
      updateTransacao.mutate({ id: editingDespesaId, ...payload }, { onSuccess })
    } else {
      createTransacao.mutate(payload, {
        onSuccess: () => handleNewDespesaOpenChange(false)
      })
    }
  }

  const handleExcluir = (id: string) => {
    deleteTransacao.mutate(id)
  }

  const items = despesas ?? []

  // Cada transação já vem com parcelas[] do Supabase join
  const sortedDespesas = useMemo(() => {
    return [...items].sort((a: any, b: any) => {
      const dataA = a.data_primeira_parcela || a.criado_em
      const dataB = b.data_primeira_parcela || b.criado_em
      return new Date(dataB).getTime() - new Date(dataA).getTime()
    })
  }, [items])

  // Calcular status efetivo baseado nas parcelas
  const getStatusEfetivo = (despesa: any): string => {
    const parcelas = despesa.parcelas || []
    if (parcelas.length === 0) return despesa.status || 'pendente'
    
    const todasPagas = parcelas.every((p: any) => p.data_pagamento !== null)
    const todasCanceladas = parcelas.every((p: any) => p.status === 'cancelado')
    
    if (todasPagas) return 'pago'
    if (todasCanceladas) return 'cancelado'
    
    // Verifica se há parcelas vencidas ou que vencem hoje
    const hoje = new Date().toISOString().split('T')[0]
    const haVencidas = parcelas.some((p: any) => 
      p.data_vencimento < hoje && 
      p.data_pagamento === null && 
      p.status !== 'cancelado'
    )
    const haVenceHoje = parcelas.some((p: any) => 
      p.data_vencimento === hoje && 
      p.data_pagamento === null && 
      p.status !== 'cancelado'
    )
    
    if (haVencidas) return 'vencido'
    if (haVenceHoje) return 'vence_hoje'
    
    return 'pendente'
  }

  // Aplicar filtros
  const filtered = useMemo(() => {
    return sortedDespesas.filter((despesa: any) => {
      const nomeCategoria = categoriasDespesa?.find((c: any) => c.id === despesa.categoria)?.nome || ''
      const statusEfetivo = getStatusEfetivo(despesa)

      const matchSearch = fuzzyIncludes(despesa.descricao || '', searchTerm) ||
        fuzzyIncludes(nomeCategoria, searchTerm)
      const matchStatus = statusFilter === 'todos' || statusEfetivo === statusFilter
      const matchCategoria = categoriaFilter === 'Todas' || `${despesa.categoria}` === categoriaFilter
      const matchMetodo = metodoFilter === 'Todos' || `${despesa.metodo_pagamento_id}` === metodoFilter

      return matchSearch && matchStatus && matchCategoria && matchMetodo
    })
  }, [sortedDespesas, categoriasDespesa, metodosPagamento, searchTerm, statusFilter, categoriaFilter, metodoFilter])

  const sortedFiltered = useMemo(() => {
    const getComparable = (despesa: any) => {
      const dataExibicao = despesa.data_vencimento || despesa.criado_em
      const nomeCategoria = categoriasDespesa?.find((c: any) => c.id === despesa.categoria)?.nome || despesa.categoria || ''
      const nomeMetodo = despesa.metodo_pagamento_id ? metodosPagamento?.find((m: any) => m.id === despesa.metodo_pagamento_id)?.nome || '' : ''
      const statusEfetivo = getStatusEfetivo(despesa)
      const valor = despesa.valor_bruto ?? 0
      return { dataExibicao, nomeCategoria, nomeMetodo, statusEfetivo, valor }
    }

    const compare = (a: any, b: any) => {
      const ca = getComparable(a)
      const cb = getComparable(b)
      let result = 0
      switch (sortBy) {
        case 'data':
          result = new Date(ca.dataExibicao).getTime() - new Date(cb.dataExibicao).getTime()
          break
        case 'descricao':
          result = (a.descricao || '').localeCompare(b.descricao || '')
          break
        case 'categoria':
          result = (ca.nomeCategoria || '').localeCompare(cb.nomeCategoria || '')
          break
        case 'metodo':
          result = (ca.nomeMetodo || '').localeCompare(cb.nomeMetodo || '')
          break
        case 'status':
          result = (ca.statusEfetivo || '').localeCompare(cb.statusEfetivo || '')
          break
        case 'valor':
          result = (ca.valor || 0) - (cb.valor || 0)
          break
        default:
          result = 0
      }
      return sortDirection === 'asc' ? result : -result
    }

    return [...filtered].sort(compare)
  }, [filtered, categoriasDespesa, metodosPagamento, sortBy, sortDirection])

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection(column === 'data' ? 'desc' : 'asc')
    }
  }

  // KPIs baseados nas parcelas reais
  const totalPago = useMemo(() => {
    return filtered.reduce((sum: number, d: any) => {
      const parcelas = d.parcelas || []
      return sum + parcelas.filter((p: any) => p.data_pagamento !== null).reduce((s: number, p: any) => s + (p.valor || 0), 0)
    }, 0)
  }, [filtered])

  const totalPendente = useMemo(() => {
    return filtered.reduce((sum: number, d: any) => {
      const parcelas = d.parcelas || []
      return sum + parcelas.filter((p: any) => p.data_pagamento === null && (p.status === 'pendente' || p.status === 'vencido')).reduce((s: number, p: any) => s + (p.valor || 0), 0)
    }, 0)
  }, [filtered])

  const totalGeral = filtered.reduce((s: number, d: any) => s + ((d as any).valor_bruto || 0), 0)

  const hasActiveFilters = categoriaFilter !== 'Todas' || metodoFilter !== 'Todos' || statusFilter !== 'todos'
  const activeFilterCount = (statusFilter !== 'todos' ? 1 : 0) + (categoriaFilter !== 'Todas' ? 1 : 0) + (metodoFilter !== 'Todos' ? 1 : 0)

  const filterCategoriaLabel = useMemo(() => {
    if (categoriaFilter === 'Todas') return 'Todas'
    return categoriasDespesa?.find((c: any) => `${c.id}` === categoriaFilter)?.nome || 'Categoria'
  }, [categoriaFilter, categoriasDespesa])

  const filterMetodoLabel = useMemo(() => {
    if (metodoFilter === 'Todos') return 'Todos'
    return metodosPagamento?.find((m: any) => `${m.id}` === metodoFilter)?.nome || 'Método'
  }, [metodoFilter, metodosPagamento])

  const statusLabel = useMemo(() => {
    if (statusFilter === 'todos') return 'Todos'
    return statusConfig[statusFilter]?.label || 'Status'
  }, [statusFilter])

  const clearFilters = () => {
    setCategoriaFilter('Todas')
    setMetodoFilter('Todos')
    setStatusFilter('todos')
    setSearchTerm('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pago</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalPago)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalPendente)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Geral</p>
              <p className="text-lg font-bold">{formatCurrency(totalGeral)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por descrição ou categoria..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />Nova Despesa
              </Button>
            </div>
          </div>
          {showFilters && (
            <div className="flex flex-col md:flex-row gap-3 pt-2 border-t">
              <div className="flex-1 space-y-1 md:max-w-[10rem]">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <span className="truncate text-sm text-foreground">{statusLabel}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="pago">Pagos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1 md:max-w-[12rem]">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger className="w-full">
                    <span className="truncate text-sm text-foreground">{filterCategoriaLabel}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    {categoriasDespesa?.map((c: any) => (
                      <SelectItem key={c.id} value={`${c.id}`}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1 md:max-w-[12rem]">
                <Label className="text-xs text-muted-foreground">Método</Label>
                <Select value={metodoFilter} onValueChange={setMetodoFilter}>
                  <SelectTrigger className="w-full">
                    <span className="truncate text-sm text-foreground">{filterMetodoLabel}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    {metodosPagamento?.map((m: any) => (
                      <SelectItem key={m.id} value={`${m.id}`}>{m.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="self-center md:self-end md:ml-auto"
                >
                  <X className="mr-1 h-3 w-3" />
                  Limpar
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('data')}>
                  <div className="flex items-center gap-1">
                    Data
                    {sortBy === 'data'
                      ? (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
                      : <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('descricao')}>
                  <div className="flex items-center gap-1">
                    Descrição
                    {sortBy === 'descricao'
                      ? (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
                      : <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('categoria')}>
                  <div className="flex items-center gap-1">
                    Categoria
                    {sortBy === 'categoria'
                      ? (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
                      : <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('metodo')}>
                  <div className="flex items-center gap-1">
                    Método
                    {sortBy === 'metodo'
                      ? (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
                      : <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('status')}>
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === 'status'
                      ? (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
                      : <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('valor')}>
                  <div className="flex items-center justify-end gap-1">
                    Valor
                    {sortBy === 'valor'
                      ? (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
                      : <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFiltered.map((despesaRaw: any) => {
                const despesa = despesaRaw as any
                const parcelas = (despesa.parcelas || []).sort((a: any, b: any) => a.numero_parcela - b.numero_parcela)
                const statusEfetivo = getStatusEfetivo(despesa)
                const config = statusConfig[statusEfetivo] || statusConfig.pendente
                const nomeCategoria = categoriasDespesa?.find((c: any) => c.id === despesa.categoria)?.nome || despesa.categoria
                const nomeMetodo = despesa.metodo_pagamento_id ? metodosPagamento?.find((m: any) => m.id === despesa.metodo_pagamento_id)?.nome || '-' : '-'

                // Data de exibição
                const primeiraParcela = parcelas[0]
                const dataExibicao = primeiraParcela?.data_vencimento || despesa.data_primeira_parcela || despesa.data_vencimento || despesa.criado_em

                // Calcular totais das parcelas
                const valorPago = parcelas.filter((p: any) => p.data_pagamento !== null).reduce((s: number, p: any) => s + (p.valor || 0), 0)
                const valorTotal = despesa.valor_bruto || 0
                const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0
                const valorParcela = primeiraParcela?.valor || (valorTotal / (despesa.total_parcelas || 1))

                // Controle de expansão
                const chaveDespesa = despesa.id
                const estaExpandida = despesasExpandidas.has(chaveDespesa)
                const temParcelas = parcelas.length > 0

                return (
                  <Fragment key={despesa.id}>
                    <TableRow className="cursor-pointer" onClick={() => setSelectedDespesa(despesa)}>
                      <TableCell className="whitespace-nowrap text-sm">{formatDate(dataExibicao)}</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{despesa.descricao}</p>
                        {temParcelas && (
                          <p className="text-xs text-muted-foreground">
                            {parcelas.length}x de {formatCurrency(valorParcela)}
                            {valorPago > 0 && (
                              <span className="ml-2">({percentualPago.toFixed(1)}% pago)</span>
                            )}
                          </p>
                        )}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{nomeCategoria}</Badge></TableCell>
                      <TableCell className="text-sm">{nomeMetodo}</TableCell>
                      <TableCell><Badge className={config.color}>{config.label}</Badge></TableCell>
                      <TableCell className="text-right font-semibold text-red-600">-{formatCurrency(valorTotal)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {temParcelas ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); toggleDespesaExpandida(chaveDespesa) }}
                              className="h-8 w-8 p-0"
                            >
                              {estaExpandida ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedDespesa(despesa)}><Eye className="mr-2 h-4 w-4" />Ver Detalhes</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => startEditDespesa(despesa)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                {parcelas.length === 1 && parcelas[0].status !== 'pago' && (
                                  <DropdownMenuItem onClick={() => marcarParcelaPaga.mutate({ parcelaId: parcelas[0].id })}>
                                    <CheckCircle className="mr-2 h-4 w-4" />Marcar como Pago
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleExcluir(despesa.id)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Dropdown de parcelas expandido */}
                    {estaExpandida && temParcelas && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div className="bg-muted/30 border-t">
                            <div className="p-4 border-b bg-muted/50">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium text-sm">Detalhes do Parcelamento</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {parcelas.length} parcelas de {formatCurrency(valorParcela)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    {formatCurrency(valorPago)} / {formatCurrency(valorTotal)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{percentualPago.toFixed(1)}% pago</p>
                                </div>
                              </div>
                              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(percentualPago, 100)}%` }} />
                              </div>
                            </div>
                            <div className="divide-y">
                              {parcelas.map((parcela: any) => {
                                const hoje = getLocalISODate()
                                const estaPaga = !!parcela.data_pagamento
                                let statusParcela = parcela.status_calculado || parcela.status || 'pendente'

                                if (!estaPaga) {
                                  if (parcela.data_vencimento < hoje) {
                                    statusParcela = 'vencido'
                                  } else if (parcela.data_vencimento === hoje) {
                                    statusParcela = 'vence_hoje'
                                  }
                                } else {
                                  statusParcela = 'pago'
                                }

                                const configParcela = statusConfig[statusParcela] || statusConfig.pendente
                                const temCorrecao = (parcela.valor_multa > 0 || parcela.valor_juros > 0 || parcela.valor_desconto > 0)
                                const diasAtraso = parcela.dias_atraso || 0
                
                                // Verificar se está vencida (data anterior a hoje e não paga)
                                const estaVencida = statusParcela === 'vencido'
                
                                return (
                                  <div key={parcela.id} className={`flex justify-between items-center p-3 hover:bg-muted/40 ${estaVencida ? 'bg-red-50/50 border-l-4 border-red-300' : ''}`}>
                                    <div className="flex items-center gap-3">
                                      <Badge variant={statusParcela === 'pago' ? 'default' : 'secondary'} className="text-xs min-w-[40px] justify-center">
                                        {parcela.numero_parcela}/{parcelas.length}
                                      </Badge>
                                      <div>
                                        <p className="text-sm font-medium">Vence em {formatDate(parcela.data_vencimento)}</p>
                                        {parcela.data_pagamento && (
                                          <div className="flex items-center gap-2">
                                            <p className="text-xs text-green-600">Pago em {formatDate(parcela.data_pagamento)}</p>
                                            {diasAtraso > 0 && (
                                              <Badge variant="destructive" className="text-xs px-1 py-0 text-white">
                                                {diasAtraso}d atraso
                                              </Badge>
                                            )}
                                            {diasAtraso < 0 && (
                                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                                {Math.abs(diasAtraso)}d adiantado
                                              </Badge>
                                            )}
                                          </div>
                                        )}
                                        {!parcela.data_pagamento && statusParcela === 'vencido' && (
                                          <p className="text-xs text-red-600">Vencida</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <span className="font-medium text-sm">
                                          {formatCurrency(parcela.valor)}
                                        </span>
                                        {temCorrecao && (
                                          <div className="text-xs text-muted-foreground">
                                            {parcela.valor_multa > 0 && <span>+{formatCurrency(parcela.valor_multa)} multa </span>}
                                            {parcela.valor_juros > 0 && <span>+{formatCurrency(parcela.valor_juros)} juros </span>}
                                            {parcela.valor_desconto > 0 && <span>-{formatCurrency(parcela.valor_desconto)} desc</span>}
                                            {parcela.valor_corrigido && parcela.valor_corrigido !== parcela.valor && (
                                              <span>= {formatCurrency(parcela.valor_corrigido)} total</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <Badge className={configParcela.color} variant="outline">{configParcela.label}</Badge>
                                      {(statusParcela === 'pendente' || statusParcela === 'vencido' || statusParcela === 'vence_hoje') && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-xs"
                                          disabled={marcarParcelaPaga.isPending}
                                          onClick={() => marcarParcelaPaga.mutate({ parcelaId: parcela.id })}
                                        >
                                          <CheckCircle className="mr-1 h-3 w-3" />Pagar
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Nenhuma despesa encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Detalhes */}
      <Dialog open={!!selectedDespesa} onOpenChange={() => setSelectedDespesa(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes da Despesa</DialogTitle></DialogHeader>
          {selectedDespesa && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label className="text-muted-foreground">Descrição</Label><p className="font-medium">{selectedDespesa.descricao}</p></div>
                <div><Label className="text-muted-foreground">Valor Bruto</Label><p className="font-medium text-red-600">-{formatCurrency(selectedDespesa.valor_bruto)}</p></div>
                <div><Label className="text-muted-foreground">Categoria</Label><p className="font-medium">{categoriasDespesa?.find((c: any) => c.id === selectedDespesa.categoria)?.nome || selectedDespesa.categoria}</p></div>
                <div><Label className="text-muted-foreground">Método</Label><p className="font-medium">{selectedDespesa.metodo_pagamento_id ? metodosPagamento?.find((m: any) => m.id === selectedDespesa.metodo_pagamento_id)?.nome || '-' : '-'}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><p className="font-medium">{statusConfig[getStatusEfetivo(selectedDespesa)]?.label}</p></div>
                <div><Label className="text-muted-foreground">Vencimento</Label><p className="font-medium">{selectedDespesa.data_vencimento ? formatDate(selectedDespesa.data_vencimento) : '-'}</p></div>
                <div><Label className="text-muted-foreground">Pago em</Label><p className="font-medium">{selectedDespesa.data_pagamento ? formatDate(selectedDespesa.data_pagamento) : 'Não realizado'}</p></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDespesa(null)}>Fechar</Button>
                <Button onClick={() => startEditDespesa(selectedDespesa)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Despesa / Editar */}
      <Dialog open={showNewDialog} onOpenChange={handleNewDespesaOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDespesaId ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
            <DialogDescription>
              {editingDespesaId ? 'Atualize os dados desta despesa. Status continua derivado das parcelas.' : 'Registre uma nova saída financeira. O status será controlado automaticamente pelas parcelas.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Dados Principais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Principais</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Descrição *</Label>
                  <Input
                    placeholder="Ex: Aluguel do consultório"
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={formCategoria} onValueChange={setFormCategoria}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categoriasDespesa && categoriasDespesa.length > 0 ? (
                        categoriasDespesa.map((c: any) => (
                          <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                        ))
                      ) : (
                        <EmptyDropdown type="categoria" tipo="despesa" />
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Método de Pagamento *</Label>
                  <Select value={formMetodo} onValueChange={handleMetodoChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {metodosPagamento && metodosPagamento.length > 0 ? (
                        metodosPagamento.map((m: any) => (
                          <SelectItem key={m.id} value={m.nome}>{m.nome}</SelectItem>
                        ))
                      ) : (
                        <EmptyDropdown type="metodo" />
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Input
                    placeholder="Nome do fornecedor"
                    value={formFornecedor}
                    onChange={(e) => setFormFornecedor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Cartão de Crédito/Débito (obrigatório para métodos de cartão) */}
            {(isCartaoCredito || isCartaoDebito) && (
              <div className="space-y-4">
                {/* Se o método já tem cartão vinculado, mostrar informações */}
                {metodoSelecionadoObj?.cartao_id ? (() => {
                  const cartaoVinculado = cartoes?.find((c: any) => c.id === metodoSelecionadoObj.cartao_id)
                  const contaVinculada = contasBancarias?.find((c: any) => c.id === cartaoVinculado?.conta_fatura_id)
                  return cartaoVinculado ? (
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Label>Cartão</Label>
                        <div className="px-3 py-2 bg-gray-100 text-gray-700 min-h-[42px] flex items-center justify-between text-sm rounded-md">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{cartaoVinculado.nome}</div>
                              <div className="text-xs text-gray-600">
                                •••• {cartaoVinculado.ultimos_digitos} {cartaoVinculado.banco && `(${cartaoVinculado.banco})`}
                              </div>
                            </div>
                          </div>
                          {(cartaoVinculado.dia_vencimento || cartaoVinculado.dia_fechamento) && (
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Fech: {cartaoVinculado.dia_fechamento || '--'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Venc: {cartaoVinculado.dia_vencimento || '--'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {contaVinculada && (
                        <div className="space-y-2">
                          <Label>Conta Bancária</Label>
                          <div className="px-3 py-2 bg-gray-100 text-gray-700 min-h-[42px] flex items-center text-sm rounded-md">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <div>
                                <div>{contaVinculada.nome}</div>
                                {(contaVinculada.agencia || contaVinculada.conta) && (
                                  <div className="text-xs text-gray-600">
                                    {contaVinculada.agencia && `Agência: ${contaVinculada.agencia}`}
                                    {contaVinculada.agencia && contaVinculada.conta && ' • '}
                                    {contaVinculada.conta && `Conta: ${contaVinculada.conta}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null
                })() : (
                  /* Se não tem cartão vinculado, mostrar seleção */
                  <div className="grid gap-4 md:grid-cols-1">
                    <div className="space-y-2">
                      <Label>Selecione o cartão *</Label>
                      <Select 
                        value={formCartao} 
                        onValueChange={setFormCartao}
                      >
                        <SelectTrigger className={formCartao ? '' : 'border-red-300'}>
                          <SelectValue placeholder="Escolha um cartão..." />
                        </SelectTrigger>
                        <SelectContent>
                        {cartoes && cartoes.filter((c: any) => c.ativo && 
                          (isCartaoCredito ? c.tipo_cartao === 'credito' : c.tipo_cartao === 'debito')
                        ).length > 0 ? (
                          cartoes
                            .filter((c: any) => c.ativo && 
                              (isCartaoCredito ? c.tipo_cartao === 'credito' : c.tipo_cartao === 'debito')
                            )
                            .map((c: any) => (
                              <SelectItem key={c.id} value={c.id}>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  <span>{c.nome} •••• {c.ultimos_digitos}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {c.banco}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Nenhum cartão {isCartaoCredito ? 'de crédito' : 'de débito'} ativo encontrado
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {formCartao && formCartao !== 'nenhum' && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {isCartaoCredito 
                            ? 'Compra será lançada na fatura do cartão selecionado'
                            : 'Débito será efetuado diretamente na conta vinculada ao cartão'
                          }
                        </p>
                        {(() => {
                          const cartao = cartoes?.find((c: any) => c.id === formCartao)
                          return cartao && (
                            <p className="text-xs text-muted-foreground">
                              Fechamento: dia {cartao.dia_fechamento || 'N/A'} | 
                              Vencimento: dia {cartao.dia_vencimento || 'N/A'}
                            </p>
                          )
                        })()}
                      </div>
                    )}
                    {!formCartao && (
                      <p className="text-xs text-red-600">
                        É necessário selecionar um cartão para registrar esta despesa
                      </p>
                    )}
                  </div>
                  </div>
                )}
              </div>
            )}

            {/* Cartão opcional para outros métodos (controle interno) */}
            {metodoSelecionadoObj && 
             !isCartaoCredito && 
             !isCartaoDebito &&
             cartoes && cartoes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Controle Interno
                </h3>
                <div className="grid gap-4 md:grid-cols-1">
                  <div className="space-y-2">
                    <Label>Vincular a um cartão (opcional)</Label>
                    <Select value={formCartao} onValueChange={setFormCartao}>
                      <SelectTrigger><SelectValue placeholder="Nenhum — pagamento direto" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhum">Nenhum — pagamento direto</SelectItem>
                        {cartoes.filter((c: any) => c.ativo).map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>{c.nome} •••• {c.ultimos_digitos}</span>
                              <Badge variant="outline" className="text-xs">
                                {c.banco}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formCartao && formCartao !== 'nenhum' && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Referência apenas para controle interno — pagamento será efetuado via {metodoSelecionadoObj.nome}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Valores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Valores</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={formValorBruto}
                    onChange={(e) => {
                      const valorFormatado = formatarValorMonetario(e.target.value)
                      setFormValorBruto(valorFormatado)
                      const valorNumerico = parseFloat(valorFormatado.replace('R$', '').replace('.', '').replace(',', '.')) || 0
                      // Para despesas, o valor líquido é igual ao valor bruto (sem taxas)
                      setFormValorLiquido(valorNumerico > 0 ? valorFormatado : '0')
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Datas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Datas</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Data de Vencimento *</Label>
                  <Input
                    type="date"
                    value={formDataVencimento}
                    onChange={(e) => {
                      setFormDataVencimento(e.target.value)
                      // Recalcular previsão de débito se houver método selecionado
                      if (formMetodo) {
                        const metodoSelecionado = metodosPagamento?.find(m => m.nome === formMetodo)
                        let cartaoSelecionado = null
                        if (metodoSelecionado?.cartao_id) {
                          cartaoSelecionado = cartoes?.find((c: any) => c.id === metodoSelecionado.cartao_id)
                        }
                        if (metodoSelecionado && e.target.value) {
                          const previsao = calcularPrevisaoDebito(e.target.value, metodoSelecionado, cartaoSelecionado)
                          setFormDataDebitoPrevisto(previsao)
                        }
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Previsão de Débito</Label>
                  <div className="px-3 py-2 bg-gray-100 text-gray-700 min-h-[42px] flex items-center text-sm rounded-md">
                    {formDataDebitoPrevisto ? formatDate(formDataDebitoPrevisto) : 'Selecionar método de pagamento'}
                  </div>
                </div>
              </div>
            </div>

            {/* Parcelamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Parcelamento</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Total de Parcelas *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formTotalParcelas}
                    onChange={(e) => setFormTotalParcelas(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor da Parcela (R$)</Label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-h-[42px] flex items-center text-sm rounded-md">
                    {(() => {
                      const totalParcelas = parseInt(formTotalParcelas) || 1
                      // Converter valor formatado para número
                      const valorNumerico = parseFloat(formValorLiquido.replace('R$', '').replace('.', '').replace(',', '.')) || 0
                      const valorParc = valorNumerico / totalParcelas
                      return valorParc > 0
                        ? valorParc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'R$ 0,00'
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações adicionais..."
                rows={3}
                value={formObservacoes}
                onChange={(e) => setFormObservacoes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleNewDespesaOpenChange(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmitDespesa}
              disabled={createTransacao.isPending || updateTransacao.isPending}
            >
              {(createTransacao.isPending || updateTransacao.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingDespesaId ? 'Salvar alterações' : 'Registrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
