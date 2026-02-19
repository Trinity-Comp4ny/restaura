'use client'

import { useState, useMemo, Fragment } from 'react'
import {
  Search, Filter, Plus, Clock, CheckCircle,
  AlertCircle, DollarSign, ArrowUpRight, Eye, X, Loader2,
  ChevronDown, ChevronUp, ChevronsUpDown, Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { addDaysToISODate, diffDaysFromToday, formatCurrency, formatDate, getLocalISODate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal } from 'lucide-react'
import { useTransacoes, useCreateTransacao, useUpdateTransacao } from '@/hooks/use-transacoes'
import { useMarcarParcelaPaga } from '@/hooks/use-parcelas'
import { useCategoriasReceita } from '@/hooks/use-categorias-financeiras'
import { useMetodosCobranca } from '@/hooks/use-metodos-cobranca'
import { useUser, useClinica } from '@/hooks/use-user'
import { usePacientes } from '@/hooks/use-pacientes'
import { EmptyDropdown } from '@/components/ui/empty-dropdown'
import { toast } from 'sonner'

interface ReceitasTabProps {
  periodo: string
  customRange?: { startDate: string; endDate: string }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pago: { label: 'Pago', color: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900' },
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-900' },
  vencido: { label: 'Vencido', color: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-900' },
  vence_hoje: { label: 'Vence Hoje', color: 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-900' },
  em_andamento: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-900' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-900' },
  estornado: { label: 'Estornado', color: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-900' },
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

export function ReceitasTab({ periodo, customRange }: ReceitasTabProps) {
  const supabaseClient = createClient()
  const { data: user } = useUser()
  const { data: clinica } = useClinica()
  const clinicaId = user?.clinica_id

  const { data: receitas, isLoading } = useTransacoes(clinicaId, 'receita')
  const { data: categoriasReceita, isLoading: categoriasLoading } = useCategoriasReceita(clinicaId)
  const { data: metodosPagamento, isLoading: metodosLoading } = useMetodosCobranca(clinicaId)
  const { data: pacientes } = usePacientes(clinicaId)
  
  const createTransacao = useCreateTransacao()
  const updateTransacao = useUpdateTransacao()
  const marcarParcelaPaga = useMarcarParcelaPaga()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [categoriaFilter, setCategoriaFilter] = useState('Todas')
  const [metodoFilter, setMetodoFilter] = useState('Todos')
  const [showFilters, setShowFilters] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingReceitaId, setEditingReceitaId] = useState<string | null>(null)
  const [selectedReceita, setSelectedReceita] = useState<any>(null)
  const [sortBy, setSortBy] = useState<'data' | 'descricao' | 'categoria' | 'metodo' | 'status' | 'valor'>('data')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Form state for new receita
  const [formDescricao, setFormDescricao] = useState('')
  const [formCategoria, setFormCategoria] = useState('')
  const [formValorBruto, setFormValorBruto] = useState('')
  const [formValorTaxas, setFormValorTaxas] = useState('')
  const [formValorLiquido, setFormValorLiquido] = useState('')
  const [formMetodo, setFormMetodo] = useState('')
  const [formPaciente, setFormPaciente] = useState('')
  const [formOrigemReceita, setFormOrigemReceita] = useState('')
  const [formTipoDocumento, setFormTipoDocumento] = useState('')
  const [formNumeroDocumento, setFormNumeroDocumento] = useState('')
  
  // Datas relevantes para receitas
  const [formDataVencimento, setFormDataVencimento] = useState('')
  const [formDataCreditoPrevista, setFormDataCreditoPrevista] = useState('')
  
  // Parcelamento
  const [formTotalParcelas, setFormTotalParcelas] = useState('1')
  
  const [formObservacoes, setFormObservacoes] = useState('')

  const categoriaLabel = useMemo(() => {
    if (categoriaFilter === 'Todas') return 'Todas'
    return categoriasReceita?.find((c: any) => `${c.id}` === categoriaFilter)?.nome || 'Categoria'
  }, [categoriaFilter, categoriasReceita])

  const metodoLabel = useMemo(() => {
    if (metodoFilter === 'Todos') return 'Todos'
    return metodosPagamento?.find((m: any) => `${m.id}` === metodoFilter)?.nome || 'Método'
  }, [metodoFilter, metodosPagamento])

  const statusLabelText = useMemo(() => {
    if (statusFilter === 'todos') return 'Todos'
    return statusConfig[statusFilter]?.label || 'Status'
  }, [statusFilter])

  const resetForm = () => {
    setFormDescricao('')
    setFormCategoria('')
    setFormValorBruto('')
    setFormValorTaxas('')
    setFormValorLiquido('')
    setFormMetodo('')
    setFormPaciente('')
    setFormOrigemReceita('')
    setFormTipoDocumento('')
    setFormNumeroDocumento('')
    setFormDataVencimento('')
    setFormDataCreditoPrevista('')
    setFormTotalParcelas('1')
    setFormObservacoes('')
  }

  const handleNewReceitaOpenChange = (open: boolean) => {
    setShowNewDialog(open)
    if (!open) {
      resetForm()
      setEditingReceitaId(null)
    }
  }

  const startEditReceita = (receita: any) => {
    if (!receita) return
    setEditingReceitaId(receita.id)
    setFormDescricao(receita.descricao || '')
    setFormCategoria(categoriasReceita?.find((c: any) => c.id === receita.categoria)?.nome || '')
    setFormValorBruto(receita.valor_bruto?.toString() || '')
    setFormValorTaxas(receita.valor_taxas?.toString() || '')
    setFormValorLiquido(receita.valor_liquido?.toString() || '')
    setFormMetodo(metodosPagamento?.find((m: any) => m.id === receita.metodo_cobranca_id)?.nome || '')
    setFormPaciente(receita.paciente_id || '')
    setFormOrigemReceita(receita.origem_receita || '')
    setFormTipoDocumento(receita.tipo_documento || '')
    setFormNumeroDocumento(receita.numero_documento || '')
    setFormDataVencimento(receita.data_vencimento || '')
    setFormDataCreditoPrevista(receita.data_credito_prevista || '')
    setFormTotalParcelas((receita.total_parcelas || 1).toString())
    setFormObservacoes(receita.observacoes || '')
    setShowNewDialog(true)
    setSelectedReceita(null)
  }

  // Função para formatar valor monetário automaticamente
  const formatarValorMonetario = (valor: string): string => {
    // Remove tudo que não é dígito
    const numeros = valor.replace(/\D/g, '')
    
    if (numeros === '') return ''
    
    // Converte para número e divide por 100 para colocar casas decimais
    const valorNumerico = parseInt(numeros) / 100
    
    // Formata com R$ na frente
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valorNumerico)
  }

  const handleMetodoChange = (metodoNome: string) => {
    setFormMetodo(metodoNome)
    
    // Se não houver valor bruto, não faz cálculo
    if (!formValorBruto) return
    
    const valorBruto = parseFloat(formValorBruto) || 0
    if (valorBruto <= 0) return
    
    // Encontrar o método selecionado pelo nome para calcular taxas
    const metodoSelecionado = metodosPagamento?.find(m => m.nome === metodoNome)
    
    if (metodoSelecionado) {
      // Calcular taxas: percentual + fixa
      const taxaPercentual = valorBruto * (metodoSelecionado.taxas_percentual / 100)
      const taxaFixa = metodoSelecionado.taxas_fixa || 0
      const totalTaxas = taxaPercentual + taxaFixa
      
      // Atualizar campos
      setFormValorTaxas(totalTaxas.toFixed(2))
      setFormValorLiquido((valorBruto - totalTaxas).toFixed(2))
      
      // Calcular previsão de crédito baseada na Data de Vencimento + prazo do método
      if (formDataVencimento) {
        setFormDataCreditoPrevista(addDaysToISODate(formDataVencimento, metodoSelecionado.prazo_deposito))
      } else {
        // Se não houver data de vencimento, usa a data de hoje + prazo
        setFormDataCreditoPrevista(addDaysToISODate(getLocalISODate(), metodoSelecionado.prazo_deposito))
      }
    } else {
      // Se não houver método selecionado, zera as taxas
      setFormValorTaxas('0')
      setFormValorLiquido(valorBruto.toFixed(2))
      setFormDataCreditoPrevista('')
    }
  }

  const handleSubmitReceita = async () => {
    if (!clinicaId) {
      toast.error('Clínica não encontrada')
      return
    }

    if (!formDescricao || !formCategoria || !formValorBruto || !formMetodo || !formDataVencimento || !formTotalParcelas) {
      toast.error('Preencha os campos obrigatórios: Descrição, Categoria, Valor Bruto, Método de Cobrança, Data de Vencimento e Total de Parcelas')
      return
    }

    const valorNumerico = parseFloat(formValorBruto.replace('R$', '').replace('.', '').replace(',', '.')) || 0
    const valorTaxas = parseFloat(formValorTaxas)
    const valorLiquido = parseFloat(formValorLiquido)

    if (valorNumerico <= 0 || isNaN(valorNumerico) || isNaN(valorTaxas) || isNaN(valorLiquido)) {
      toast.error('Valores financeiros inválidos')
      return
    }

    // Encontrar o ID do método pelo nome
    const metodoSelecionado = formMetodo ? metodosPagamento?.find(m => m.nome === formMetodo) : null
    
    // Encontrar o ID da categoria pelo nome
    const categoriaSelecionada = formCategoria ? categoriasReceita?.find(c => c.nome === formCategoria) : null

    const payload = {
      clinica_id: clinicaId,
      tipo: 'receita',
      categoria: categoriaSelecionada?.id || null,
      descricao: formDescricao,
      valor_bruto: valorNumerico,
      valor_liquido: valorLiquido,
      valor_taxas: valorTaxas,
      metodo_cobranca_id: metodoSelecionado?.id || null, // Referência para metodos_cobranca
      cartao_id: metodoSelecionado?.cartao_id || null, // Se tiver cartão vinculado
      status: editingReceitaId ? undefined : 'pendente', // Na edição mantém status existente
      data_vencimento: formDataVencimento || null,
      data_pagamento: editingReceitaId ? undefined : null, // Criação sempre null
      paciente_id: formPaciente || null,
      origem_receita: formOrigemReceita || null,
      tipo_documento: formTipoDocumento || null,
      numero_documento: formNumeroDocumento || null,
      data_credito_prevista: formDataCreditoPrevista || null,
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

      const { data: existentes } = await (supabaseClient as any)
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
          data_credito_prevista: formDataCreditoPrevista || dataVencimento,
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
      if (editingReceitaId && variables?.id) {
        await atualizarParcelas(variables.id)
      }
      handleNewReceitaOpenChange(false)
    }

    if (editingReceitaId) {
      updateTransacao.mutate({ id: editingReceitaId, ...payload }, { onSuccess })
    } else {
      createTransacao.mutate(payload, {
        onSuccess: () => {
          handleNewReceitaOpenChange(false)
        }
      })
    }
  }


  // Estado para controlar quais receitas estão expandidas
  const [receitasExpandidas, setReceitasExpandidas] = useState<Set<string>>(new Set())

  const toggleReceitaExpandida = (chave: string) => {
    const novoSet = new Set(receitasExpandidas)
    if (novoSet.has(chave)) {
      novoSet.delete(chave)
    } else {
      novoSet.add(chave)
    }
    setReceitasExpandidas(novoSet)
  }

  const items = receitas ?? []

  // Cada transação já vem com parcelas[] do Supabase join
  // Ordenar por data de criação (mais recente primeiro)
  const sortedReceitas = useMemo(() => {
    return [...items].sort((a: any, b: any) => {
      const dataA = a.data_primeira_parcela || a.criado_em
      const dataB = b.data_primeira_parcela || b.criado_em
      return new Date(dataB).getTime() - new Date(dataA).getTime()
    })
  }, [items])

  // Calcular status efetivo SEMPRE baseado nas parcelas (usar status_calculado)
  const getStatusEfetivo = (receita: any): string => {
    const parcelas = receita.parcelas || []
    
    // Se não há parcelas, usar status da transação como fallback
    if (parcelas.length === 0) return receita.status || 'pendente'
    
    const todasPagas = parcelas.every((p: any) => p.data_pagamento !== null)
    const todasCanceladas = parcelas.every((p: any) => p.status === 'cancelado')
    
    if (todasPagas) return 'pago'
    if (todasCanceladas) return 'cancelado'
    
    // Verificar se há alguma parcela vencida usando status_calculado
    const haVencidas = parcelas.some((p: any) => p.status_calculado === 'vencido')
    const haVenceHoje = parcelas.some((p: any) => p.status_calculado === 'vence_hoje')
    
    if (haVencidas) return 'vencido'
    if (haVenceHoje) return 'vence_hoje'
    
    return 'pendente'
  }

  // Aplicar filtros
  const filtered = useMemo(() => {
    return sortedReceitas.filter((receita: any) => {
      const nomeCategoria = categoriasReceita?.find((c: any) => c.id === receita.categoria)?.nome || ''
      const nomeMetodo = receita.metodo_cobranca_id ? metodosPagamento?.find((m: any) => m.id === receita.metodo_cobranca_id)?.nome || '-' : '-'
      const statusEfetivo = getStatusEfetivo(receita)
      
      const matchSearch = fuzzyIncludes(receita.descricao || '', searchTerm) ||
        fuzzyIncludes(nomeCategoria, searchTerm)
      const matchStatus = statusFilter === 'todos' || statusEfetivo === statusFilter
      const matchCategoria = categoriaFilter === 'Todas' || `${receita.categoria}` === categoriaFilter
      const matchMetodo = metodoFilter === 'Todos' || `${receita.metodo_cobranca_id}` === metodoFilter
      
      return matchSearch && matchStatus && matchCategoria && matchMetodo
    })
  }, [sortedReceitas, categoriasReceita, metodosPagamento, searchTerm, statusFilter, categoriaFilter, metodoFilter])

  const sortedFiltered = useMemo(() => {
    const getComparable = (receita: any) => {
      const parcelas = (receita.parcelas || []).sort((a: any, b: any) => a.numero_parcela - b.numero_parcela)
      const dataExibicao = receita.data_vencimento || receita.criado_em
      const nomeCategoria = categoriasReceita?.find((c: any) => c.id === receita.categoria)?.nome || receita.categoria || ''
      const nomeMetodo = receita.metodo_cobranca_id ? metodosPagamento?.find((m: any) => m.id === receita.metodo_cobranca_id)?.nome || '' : ''
      const statusEfetivo = getStatusEfetivo(receita)
      const valor = receita.valor_liquido ?? receita.valor_bruto ?? 0
      return { dataExibicao, nomeCategoria, nomeMetodo, statusEfetivo, valor, parcelas }
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
  }, [filtered, categoriasReceita, metodosPagamento, sortBy, sortDirection])

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection(column === 'data' ? 'desc' : 'asc')
    }
  }

  // KPIs baseados nas parcelas reais (usar status_calculado)
  const totalPago = useMemo(() => {
    return filtered.reduce((sum: number, r: any) => {
      const parcelas = r.parcelas || []
      return sum + parcelas.filter((p: any) => p.data_pagamento !== null).reduce((s: number, p: any) => s + (p.valor || 0), 0)
    }, 0)
  }, [filtered])

  const totalPendente = useMemo(() => {
    return filtered.reduce((sum: number, r: any) => {
      const parcelas = r.parcelas || []
      return sum + parcelas.filter((p: any) => p.data_pagamento === null && (p.status_calculado === 'pendente' || p.status_calculado === 'vencido' || p.status_calculado === 'vence_hoje')).reduce((s: number, p: any) => s + (p.valor || 0), 0)
    }, 0)
  }, [filtered])

  // Total de taxas pagas (diferença entre bruto e líquido das parcelas já pagas)
  const totalTaxasPagas = useMemo(() => {
    return filtered.reduce((sum: number, r: any) => {
      const parcelas = r.parcelas || []
      const parcelasPagas = parcelas.filter((p: any) => p.data_pagamento !== null)
      
      if (parcelasPagas.length === 0) return sum
      
      // Calcular taxas proporcionais das parcelas pagas
      const valorLiquidoPago = parcelasPagas.reduce((s: number, p: any) => s + (p.valor || 0), 0)
      const valorBrutoTransacao = r.valor_bruto || 0
      const valorLiquidoTransacao = r.valor_liquido || 0
      
      if (valorLiquidoTransacao > 0) {
        const proporcaoPago = valorLiquidoPago / valorLiquidoTransacao
        const taxasTransacao = valorBrutoTransacao - valorLiquidoTransacao
        return sum + (taxasTransacao * proporcaoPago)
      }
      
      return sum
    }, 0)
  }, [filtered])

  // Total em atraso (valor líquido de parcelas vencidas não pagas)
  const totalEmAtraso = useMemo(() => {
    const hoje = getLocalISODate()
    return filtered.reduce((sum: number, r: any) => {
      const parcelas = r.parcelas || []
      const parcelasEmAtraso = parcelas.filter((p: any) => 
        p.data_vencimento < hoje && 
        p.data_pagamento === null && 
        p.status !== 'cancelado'
      )
      return sum + parcelasEmAtraso.reduce((s: number, p: any) => s + (p.valor || 0), 0)
    }, 0)
  }, [filtered])

  // Total líquido (apenas parcelas pagas)
  const totalLiquido = useMemo(() => {
    return filtered.reduce((sum: number, r: any) => {
      const parcelas = r.parcelas || []
      return sum + parcelas.filter((p: any) => p.data_pagamento !== null).reduce((s: number, p: any) => s + (p.valor || 0), 0)
    }, 0)
  }, [filtered])

  const hasActiveFilters = categoriaFilter !== 'Todas' || metodoFilter !== 'Todos' || statusFilter !== 'todos'
  const activeFilterCount = (statusFilter !== 'todos' ? 1 : 0) + (categoriaFilter !== 'Todas' ? 1 : 0) + (metodoFilter !== 'Todos' ? 1 : 0)

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
      <div className="grid gap-4 md:grid-cols-4">
                <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Líquido</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalLiquido)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">A Receber</p>
              <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalPendente)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <Filter className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taxas Pagas</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(totalTaxasPagas)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Em Atraso</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalEmAtraso)}</p>
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
                <Plus className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-col md:flex-row gap-3 pt-2 border-t">
              <div className="flex-1 space-y-1 md:max-w-[10rem]">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <span className="truncate text-sm text-foreground">{statusLabelText}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="pago">Pagos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                    <SelectItem value="estornado">Estornados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1 md:max-w-[12rem]">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger className="w-full">
                    <span className="truncate text-sm text-foreground">{categoriaLabel}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    {categoriasReceita?.map((c: any) => (
                      <SelectItem key={c.id} value={`${c.id}`}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1 md:max-w-[12rem]">
                <Label className="text-xs text-muted-foreground">Método</Label>
                <Select value={metodoFilter} onValueChange={setMetodoFilter}>
                  <SelectTrigger className="w-full">
                    <span className="truncate text-sm text-foreground">{metodoLabel}</span>
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
              {sortedFiltered.map((receitaRaw: any) => {
                const receita = receitaRaw as any
                const parcelas = (receita.parcelas || []).sort((a: any, b: any) => a.numero_parcela - b.numero_parcela)
                const statusEfetivo = getStatusEfetivo(receita)
                const config = statusConfig[statusEfetivo] || statusConfig.pendente
                const nomeCategoria = categoriasReceita?.find((c: any) => c.id === receita.categoria)?.nome || receita.categoria
                const nomeMetodo = receita.metodo_cobranca_id ? metodosPagamento?.find((m: any) => m.id === receita.metodo_cobranca_id)?.nome || '-' : '-'
                
                // Data de exibição: usar data_vencimento da transação como base
                const primeiraParcela = parcelas[0]
                const dataExibicao = receita.data_vencimento || receita.criado_em
                
                // Calcular totais das parcelas (sempre usar valor original da parcela, não valor_corrigido)
                const valorPago = parcelas.filter((p: any) => p.data_pagamento !== null).reduce((s: number, p: any) => {
                  // Sempre usar valor original da parcela para consistência
                  return s + (p.valor || 0)
                }, 0)
                const valorTotal = receita.valor_liquido || receita.valor_bruto || 0
                const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0
                
                // Valor da parcela individual (sempre calcular com valor líquido para consistência)
                const valorParcela = valorTotal / (receita.total_parcelas || 1)
                
                // Controle de expansão
                const chaveReceita = receita.id
                const estaExpandida = receitasExpandidas.has(chaveReceita)
                const temParcelas = parcelas.length > 1
                
                return (
                  <Fragment key={receita.id}>
                    {/* Linha principal da receita */}
                    <TableRow className="cursor-pointer" onClick={() => setSelectedReceita(receita)}>
                      <TableCell className="whitespace-nowrap text-sm">{formatDate(dataExibicao)}</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{receita.descricao}</p>
                        {parcelas.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {parcelas.length}x de {formatCurrency(valorParcela)}
                            {valorPago > 0 && (
                              <span className="ml-2">
                                ({percentualPago.toFixed(1)}% pago)
                              </span>
                            )}
                          </p>
                        )}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{nomeCategoria}</Badge></TableCell>
                      <TableCell className="text-sm">{nomeMetodo}</TableCell>
                      <TableCell><Badge className={config.color}>{config.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="text-right">
                          <div className="font-semibold text-green-600">+{formatCurrency(receita.valor_liquido || 0)}</div>
                          {receita.valor_bruto !== receita.valor_liquido && (
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(receita.valor_bruto || 0)} bruto
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/* Sempre mostrar a setinha se houver parcelas */}
                          {parcelas.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); toggleReceitaExpandida(chaveReceita) }}
                              className="h-8 w-8 p-0"
                            >
                              {estaExpandida ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Dropdown de parcelas expandido */}
                    {estaExpandida && parcelas.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div className="bg-muted/30 border-t">
                            {/* Resumo do parcelamento */}
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
                                  <p className="text-xs text-muted-foreground">
                                    {percentualPago.toFixed(1)}% pago
                                  </p>
                                </div>
                              </div>
                              {/* Barra de progresso */}
                              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full transition-all"
                                  style={{ width: `${Math.min(percentualPago, 100)}%` }}
                                />
                              </div>
                            </div>
                            
                            {/* Lista de parcelas */}
                            <div className="divide-y">
                              {parcelas.map((parcela: any) => {
                                const configParcela = statusConfig[parcela.status_calculado || parcela.status] || statusConfig.pendente
                                const temCorrecao = (parcela.valor_multa > 0 || parcela.valor_juros > 0 || parcela.valor_desconto > 0)
                                const diasAtraso = parcela.dias_atraso || 0
                                
                                // Verificar se está vencida (data anterior a hoje e não paga)
                                const hoje = getLocalISODate()
                                const estaVencida = !parcela.data_pagamento && parcela.data_vencimento < hoje
                                
                                return (
                                  <div key={parcela.id} className={`flex justify-between items-center p-3 hover:bg-muted/40 ${estaVencida ? 'bg-red-50/50 border-l-4 border-red-300' : ''}`}>
                                    <div className="flex items-center gap-3">
                                      <Badge variant={parcela.data_pagamento ? 'default' : 'secondary'} className="text-xs min-w-[40px] justify-center">
                                        {parcela.numero_parcela}/{parcelas.length}
                                      </Badge>
                                      <div>
                                        <p className="text-sm font-medium">
                                          Vence em {formatDate(parcela.data_vencimento)}
                                        </p>
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
                                        {parcela.status_calculado === 'vence_hoje' && (
                                          <p className="text-xs text-orange-600 font-medium">Vence hoje!</p>
                                        )}
                                        {parcela.status_calculado === 'vencido' && !parcela.data_pagamento && (
                                          <p className="text-xs text-red-600 font-medium">Vencida há {diffDaysFromToday(parcela.data_vencimento)} dias</p>
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
                                      <Badge className={configParcela.color} variant="outline">
                                        {configParcela.label}
                                      </Badge>
                                      {!parcela.data_pagamento && (parcela.status_calculado === 'pendente' || parcela.status_calculado === 'vencido' || parcela.status_calculado === 'vence_hoje') && (
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
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Nenhuma receita encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Detalhes */}
      <Dialog open={!!selectedReceita} onOpenChange={() => setSelectedReceita(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Receita</DialogTitle>
          </DialogHeader>
          {selectedReceita && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label className="text-muted-foreground">Descrição</Label><p className="font-medium">{selectedReceita.descricao}</p></div>
                <div><Label className="text-muted-foreground">Valor Bruto</Label><p className="font-medium text-green-600">{formatCurrency(selectedReceita.valor_bruto)}</p></div>
                <div><Label className="text-muted-foreground">Categoria</Label><p className="font-medium">{categoriasReceita?.find((c: any) => c.id === selectedReceita.categoria)?.nome || selectedReceita.categoria}</p></div>
                <div><Label className="text-muted-foreground">Método</Label><p className="font-medium">{selectedReceita.metodo_cobranca_id ? metodosPagamento?.find((m: any) => m.id === selectedReceita.metodo_cobranca_id)?.nome || '-' : '-'}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><p className="font-medium">{statusConfig[getStatusEfetivo(selectedReceita)]?.label}</p></div>
                <div><Label className="text-muted-foreground">Vencimento</Label><p className="font-medium">{selectedReceita.data_vencimento ? formatDate(selectedReceita.data_vencimento) : '-'}</p></div>
                <div><Label className="text-muted-foreground">Pago em</Label><p className="font-medium">{selectedReceita.data_pagamento ? formatDate(selectedReceita.data_pagamento) : 'Não realizado'}</p></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedReceita(null)}>Fechar</Button>
                <Button onClick={() => startEditReceita(selectedReceita)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Receita / Editar */}
      <Dialog open={showNewDialog} onOpenChange={handleNewReceitaOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReceitaId ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
            <DialogDescription>
              {editingReceitaId ? 'Atualize as informações desta receita.' : 'Registre uma nova entrada financeira'}
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
                    placeholder="Ex: Tratamento canal"
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Select value={formPaciente} onValueChange={setFormPaciente}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {pacientes && pacientes.length > 0 ? (
                        pacientes.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))
                      ) : (
                        <EmptyDropdown type="paciente" disablePacienteButton />
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={formCategoria} onValueChange={setFormCategoria}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categoriasReceita && categoriasReceita.length > 0 ? (
                        categoriasReceita.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
                        ))
                      ) : (
                        <EmptyDropdown type="categoria" />
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Origem da Receita</Label>
                  <Select value={formOrigemReceita} onValueChange={setFormOrigemReceita}>
                    <SelectTrigger className="capitalize"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Particular">Particular</SelectItem>
                      <SelectItem value="Convênio">Convênio</SelectItem>
                      <SelectItem value="Reembolso">Reembolso</SelectItem>
                      <SelectItem value="Parceria">Parceria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Método de Cobrança *</Label>
                  <Select value={formMetodo} onValueChange={handleMetodoChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
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
              </div>
            </div>

            {/* Valores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Valores</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Valor Bruto (R$) *</Label>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={formValorBruto}
                    onChange={(e) => {
                      const valorFormatado = formatarValorMonetario(e.target.value)
                      setFormValorBruto(valorFormatado)
                      
                      // Extrair valor numérico para cálculos (remove R$ e formatação)
                      const valorNumerico = parseFloat(valorFormatado.replace('R$', '').replace('.', '').replace(',', '.')) || 0
                      
                      // Auto calcular líquido se houver método selecionado
                      if (valorNumerico > 0 && formMetodo) {
                        // Recalcular taxas baseado no método já selecionado
                        const metodoSelecionado = metodosPagamento?.find(m => m.nome === formMetodo)
                        if (metodoSelecionado) {
                          const taxaPercentual = valorNumerico * (metodoSelecionado.taxas_percentual / 100)
                          const taxaFixa = metodoSelecionado.taxas_fixa || 0
                          const totalTaxas = taxaPercentual + taxaFixa
                          setFormValorTaxas(totalTaxas.toFixed(2))
                          setFormValorLiquido((valorNumerico - totalTaxas).toFixed(2))
                          
                          // Recalcular previsão de crédito
                          if (formDataVencimento) {
                            setFormDataCreditoPrevista(addDaysToISODate(formDataVencimento, metodoSelecionado.prazo_deposito))
                          } else {
                            setFormDataCreditoPrevista(addDaysToISODate(getLocalISODate(), metodoSelecionado.prazo_deposito))
                          }
                        }
                      } else if (valorNumerico > 0) {
                        // Se não houver método selecionado, zera as taxas
                        setFormValorTaxas('0')
                        setFormValorLiquido(valorNumerico.toFixed(2))
                        setFormDataCreditoPrevista('')
                      } else {
                        // Se valor for 0 ou vazio, zera tudo
                        setFormValorTaxas('0')
                        setFormValorLiquido('0')
                        setFormDataCreditoPrevista('')
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Taxas (R$)</Label>
                  <div className="px-3 py-2 bg-gray-100 text-gray-700 min-h-[42px] flex items-center text-sm rounded-md">
                    {formValorTaxas ? parseFloat(formValorTaxas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Valor Líquido (R$)</Label>
                  <div className="px-3 py-2 bg-gray-100 text-gray-700 min-h-[42px] flex items-center text-sm rounded-md">
                    {formValorLiquido ? parseFloat(formValorLiquido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                  </div>
                </div>
              </div>
            </div>

            {/* Datas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Datas</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Data de Vencimento *</Label>
                  <Input
                    type="date"
                    value={formDataVencimento}
                    onChange={(e) => {
                      setFormDataVencimento(e.target.value)
                      // Recalcular previsão de crédito se houver método selecionado
                      if (formMetodo) {
                        const metodoSelecionado = metodosPagamento?.find(m => m.nome === formMetodo)
                        if (metodoSelecionado && e.target.value) {
                          setFormDataCreditoPrevista(addDaysToISODate(e.target.value, metodoSelecionado.prazo_deposito))
                        }
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Previsão de Crédito</Label>
                  <div className="px-3 py-2 bg-gray-100 text-gray-700 min-h-[42px] flex items-center text-sm rounded-md">
                    {formDataCreditoPrevista ? formatDate(formDataCreditoPrevista) : 'Selecionar método de pagamento'}
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
                  <div className="px-3 py-2 bg-gray-100 text-gray-700 min-h-[42px] flex items-center text-sm rounded-md">
                    {(() => {
                      const totalParcelas = parseInt(formTotalParcelas) || 1
                      const valorLiquido = parseFloat(formValorLiquido) || 0
                      const valorParcela = valorLiquido / totalParcelas
                      return valorParcela > 0 
                        ? valorParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'R$ 0,00'
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documentos</h3>
              <div className="grid gap-4 md:grid-cols-1">
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select value={formTipoDocumento} onValueChange={setFormTipoDocumento}>
                    <SelectTrigger className="capitalize"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Recibo">Recibo</SelectItem>
                      <SelectItem value="Contrato">Contrato</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="NF-e">NF-e</SelectItem>
                    </SelectContent>
                  </Select>
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
            <Button variant="outline" onClick={() => handleNewReceitaOpenChange(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmitReceita}
              disabled={createTransacao.isPending || updateTransacao.isPending}
            >
              {(createTransacao.isPending || updateTransacao.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingReceitaId ? 'Salvar alterações' : 'Registrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
