import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'
import { formatCurrency, formatDate } from '@/lib/utils'

// Interface para dados de transações
interface TransacaoRelatorio {
  id: string
  descricao: string
  paciente_nome?: string
  categoria: string
  valor_bruto: number
  valor_liquido: number
  valor_taxas: number
  status: string
  data_vencimento: string
  data_pagamento: string | null
  metodo_cobranca_nome?: string
  metodo_pagamento_nome?: string
  criado_em: string
}

// Interface para dados consolidados
export interface RelatorioConsolidado {
  receitas: TransacaoRelatorio[]
  despesas: TransacaoRelatorio[]
  totais: {
    total_receitas: number
    total_despesas: number
    saldo_liquido: number
    total_taxas: number
  }
}

// Configuração de colunas para PDF/CSV
const colunasRelatorio = [
  { header: 'Data', dataKey: 'data_vencimento' },
  { header: 'Descrição', dataKey: 'descricao' },
  { header: 'Paciente', dataKey: 'paciente_nome' },
  { header: 'Categoria', dataKey: 'categoria' },
  { header: 'Valor Bruto', dataKey: 'valor_bruto' },
  { header: 'Valor Líquido', dataKey: 'valor_liquido' },
  { header: 'Taxas', dataKey: 'valor_taxas' },
  { header: 'Status', dataKey: 'status' },
  { header: 'Método', dataKey: 'metodo_cobranca_nome' },
]

const colunasConsolidado = [
  { header: 'Tipo', dataKey: 'tipo' },
  { header: 'Data', dataKey: 'data_vencimento' },
  { header: 'Descrição', dataKey: 'descricao' },
  { header: 'Paciente', dataKey: 'paciente_nome' },
  { header: 'Categoria', dataKey: 'categoria' },
  { header: 'Valor Bruto', dataKey: 'valor_bruto' },
  { header: 'Valor Líquido', dataKey: 'valor_liquido' },
  { header: 'Taxas', dataKey: 'valor_taxas' },
  { header: 'Status', dataKey: 'status' },
]

// Função para gerar PDF de receitas
export function exportarReceitasPDF(receitas: TransacaoRelatorio[], periodo: string) {
  const doc = new jsPDF()
  
  // Título
  doc.setFontSize(18)
  doc.text('Relatório de Receitas', 14, 20)
  doc.setFontSize(12)
  doc.text(`Período: ${periodo}`, 14, 30)
  doc.text(`Total de Receitas: ${receitas.length}`, 14, 36)
  
  // Totais
  const totalBruto = receitas.reduce((sum, r) => sum + r.valor_bruto, 0)
  const totalLiquido = receitas.reduce((sum, r) => sum + r.valor_liquido, 0)
  const totalTaxas = receitas.reduce((sum, r) => sum + r.valor_taxas, 0)
  
  doc.setFontSize(10)
  doc.text(`Valor Bruto Total: ${formatCurrency(totalBruto)}`, 14, 44)
  doc.text(`Valor Líquido Total: ${formatCurrency(totalLiquido)}`, 14, 50)
  doc.text(`Total em Taxas: ${formatCurrency(totalTaxas)}`, 14, 56)
  
  // Tabela
  const dadosTabela = receitas.map(receita => ({
    ...receita,
    valor_bruto: formatCurrency(receita.valor_bruto),
    valor_liquido: formatCurrency(receita.valor_liquido),
    valor_taxas: formatCurrency(receita.valor_taxas),
    data_vencimento: formatDate(receita.data_vencimento),
    paciente_nome: receita.paciente_nome || 'N/A',
    metodo_cobranca_nome: receita.metodo_cobranca_nome || 'N/A',
  }))
  
  autoTable(doc, {
    head: [colunasRelatorio.map(col => col.header)],
    body: dadosTabela.map(item => colunasRelatorio.map(col => `${item[col.dataKey as keyof typeof item] ?? ''}`)),
    startY: 64,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  })
  
  // Salvar
  const dataAtual = new Date().toISOString().split('T')[0]
  doc.save(`relatorio-receitas-${dataAtual}.pdf`)
}

// Função para gerar PDF de despesas
export function exportarDespesasPDF(despesas: TransacaoRelatorio[], periodo: string) {
  const doc = new jsPDF()
  
  // Título
  doc.setFontSize(18)
  doc.text('Relatório de Despesas', 14, 20)
  doc.setFontSize(12)
  doc.text(`Período: ${periodo}`, 14, 30)
  doc.text(`Total de Despesas: ${despesas.length}`, 14, 36)
  
  // Totais
  const totalBruto = despesas.reduce((sum, d) => sum + d.valor_bruto, 0)
  const totalLiquido = despesas.reduce((sum, d) => sum + d.valor_liquido, 0)
  
  doc.setFontSize(10)
  doc.text(`Valor Bruto Total: ${formatCurrency(totalBruto)}`, 14, 44)
  doc.text(`Valor Líquido Total: ${formatCurrency(totalLiquido)}`, 14, 50)
  
  // Tabela
  const dadosTabela = despesas.map(despesa => ({
    ...despesa,
    valor_bruto: formatCurrency(despesa.valor_bruto),
    valor_liquido: formatCurrency(despesa.valor_liquido),
    valor_taxas: formatCurrency(despesa.valor_taxas),
    data_vencimento: formatDate(despesa.data_vencimento),
    paciente_nome: despesa.paciente_nome || 'N/A',
    metodo_pagamento_nome: despesa.metodo_pagamento_nome || 'N/A',
  }))
  
  autoTable(doc, {
    head: [colunasRelatorio.map(col => col.header)],
    body: dadosTabela.map(item => colunasRelatorio.map(col => `${item[col.dataKey as keyof typeof item] ?? ''}`)),
    startY: 56,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [239, 68, 68] },
  })
  
  // Salvar
  const dataAtual = new Date().toISOString().split('T')[0]
  doc.save(`relatorio-despesas-${dataAtual}.pdf`)
}

// Função para gerar PDF consolidado
export function exportarConsolidadoPDF(dados: RelatorioConsolidado, periodo: string) {
  const doc = new jsPDF()
  
  // Título
  doc.setFontSize(18)
  doc.text('Relatório Financeiro Consolidado', 14, 20)
  doc.setFontSize(12)
  doc.text(`Período: ${periodo}`, 14, 30)
  
  // Resumo
  doc.setFontSize(14)
  doc.text('Resumo Financeiro', 14, 40)
  doc.setFontSize(10)
  doc.text(`Total Receitas: ${formatCurrency(dados.totais.total_receitas)}`, 14, 48)
  doc.text(`Total Despesas: ${formatCurrency(dados.totais.total_despesas)}`, 14, 54)
  doc.text(`Saldo Líquido: ${formatCurrency(dados.totais.saldo_liquido)}`, 14, 60)
  doc.text(`Total em Taxas: ${formatCurrency(dados.totais.total_taxas)}`, 14, 66)
  
  // Dados consolidados
  const dadosConsolidados = [
    ...dados.receitas.map(r => ({ ...r, tipo: 'Receita' })),
    ...dados.despesas.map(d => ({ ...d, tipo: 'Despesa' }))
  ].sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())
  
  const dadosTabela = dadosConsolidados.map(item => ({
    ...item,
    valor_bruto: formatCurrency(item.valor_bruto),
    valor_liquido: formatCurrency(item.valor_liquido),
    valor_taxas: formatCurrency(item.valor_taxas),
    data_vencimento: formatDate(item.data_vencimento),
    paciente_nome: item.paciente_nome || 'N/A',
    metodo_cobranca_nome: item.metodo_cobranca_nome || item.metodo_pagamento_nome || 'N/A',
  }))
  
  autoTable(doc, {
    head: [colunasConsolidado.map(col => col.header)],
    body: dadosTabela.map(item => colunasConsolidado.map(col => `${item[col.dataKey as keyof typeof item] ?? ''}`)),
    startY: 74,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  })
  
  // Salvar
  const dataAtual = new Date().toISOString().split('T')[0]
  doc.save(`relatorio-consolidado-${dataAtual}.pdf`)
}

// Função para gerar CSV de receitas
export function exportarReceitasCSV(receitas: TransacaoRelatorio[]) {
  const dadosCSV = receitas.map(receita => ({
    'Data Vencimento': formatDate(receita.data_vencimento),
    'Descrição': receita.descricao,
    'Paciente': receita.paciente_nome || 'N/A',
    'Categoria': receita.categoria,
    'Valor Bruto': receita.valor_bruto,
    'Valor Líquido': receita.valor_liquido,
    'Taxas': receita.valor_taxas,
    'Status': receita.status,
    'Método Cobrança': receita.metodo_cobranca_nome || 'N/A',
    'Data Pagamento': receita.data_pagamento ? formatDate(receita.data_pagamento) : 'N/A',
    'ID': receita.id,
  }))
  
  const csv = Papa.unparse(dadosCSV)
  downloadCSV(csv, `receitas-${new Date().toISOString().split('T')[0]}.csv`)
}

// Função para gerar CSV de despesas
export function exportarDespesasCSV(despesas: TransacaoRelatorio[]) {
  const dadosCSV = despesas.map(despesa => ({
    'Data Vencimento': formatDate(despesa.data_vencimento),
    'Descrição': despesa.descricao,
    'Paciente': despesa.paciente_nome || 'N/A',
    'Categoria': despesa.categoria,
    'Valor Bruto': despesa.valor_bruto,
    'Valor Líquido': despesa.valor_liquido,
    'Taxas': despesa.valor_taxas,
    'Status': despesa.status,
    'Método Pagamento': despesa.metodo_pagamento_nome || 'N/A',
    'Data Pagamento': despesa.data_pagamento ? formatDate(despesa.data_pagamento) : 'N/A',
    'ID': despesa.id,
  }))
  
  const csv = Papa.unparse(dadosCSV)
  downloadCSV(csv, `despesas-${new Date().toISOString().split('T')[0]}.csv`)
}

// Função para gerar CSV consolidado
export function exportarConsolidadoCSV(dados: RelatorioConsolidado) {
  const dadosConsolidados = [
    ...dados.receitas.map(r => ({ ...r, tipo: 'Receita' })),
    ...dados.despesas.map(d => ({ ...d, tipo: 'Despesa' }))
  ].sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())
  
  const dadosCSV = dadosConsolidados.map(item => ({
    'Tipo': item.tipo,
    'Data Vencimento': formatDate(item.data_vencimento),
    'Descrição': item.descricao,
    'Paciente': item.paciente_nome || 'N/A',
    'Categoria': item.categoria,
    'Valor Bruto': item.valor_bruto,
    'Valor Líquido': item.valor_liquido,
    'Taxas': item.valor_taxas,
    'Status': item.status,
    'Método': item.metodo_cobranca_nome || item.metodo_pagamento_nome || 'N/A',
    'Data Pagamento': item.data_pagamento ? formatDate(item.data_pagamento) : 'N/A',
    'ID': item.id,
  }))
  
  const csv = Papa.unparse(dadosCSV)
  downloadCSV(csv, `consolidado-${new Date().toISOString().split('T')[0]}.csv`)
}

// Função auxiliar para download de CSV
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Função para preparar dados das transações para exportação
type TransacaoBase = {
  id: string
  descricao: string
  pacientes?: { nome?: string | null } | null
  categorias?: { nome?: string | null } | null
  categoria?: string | null
  valor_bruto?: number | null
  valor_liquido?: number | null
  valor_taxas?: number | null
  status?: string | null
  data_vencimento?: string | null
  data_pagamento?: string | null
  metodos_cobranca?: { nome?: string | null } | null
  metodos_pagamento?: { nome?: string | null } | null
  criado_em?: string | null
}

export function prepararDadosParaExportacao(
  transacoes: TransacaoBase[],
  _tipo: 'receita' | 'despesa'
): TransacaoRelatorio[] {
  return transacoes.map(transacao => ({
    id: transacao.id,
    descricao: transacao.descricao,
    paciente_nome: transacao.pacientes?.nome ?? undefined,
    categoria: transacao.categorias?.nome || transacao.categoria || 'N/A',
    valor_bruto: transacao.valor_bruto || 0,
    valor_liquido: transacao.valor_liquido || 0,
    valor_taxas: transacao.valor_taxas || 0,
    status: transacao.status || 'N/A',
    data_vencimento: transacao.data_vencimento || 'N/A',
    data_pagamento: transacao.data_pagamento || null,
    metodo_cobranca_nome: transacao.metodos_cobranca?.nome || undefined,
    metodo_pagamento_nome: transacao.metodos_pagamento?.nome || undefined,
    criado_em: transacao.criado_em || 'N/A',
  }))
}
