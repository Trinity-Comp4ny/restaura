/**
 * Utilitários para conversão de períodos em filtros de data
 */

import { getLocalISODate } from '@/lib/utils'

export const PERIODO_LABELS: Record<string, string> = {
  hoje: 'Hoje',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  semana_atual: 'Semana Atual',
  mes_atual: 'Mês Atual',
  mes_anterior: 'Mês Anterior',
  trimestre: 'Trimestre',
  semestre: 'Semestre',
  ano: 'Ano',
  personalizado: 'Personalizado',
}

export function formatPeriodoLabel(periodo: string): string {
  if (PERIODO_LABELS[periodo]) return PERIODO_LABELS[periodo]
  return periodo
    .replace(/_/g, ' ')
    .replace(/^\w|\s\w/g, (c) => c.toUpperCase())
}

export interface DateFilter {
  startDate: string
  endDate: string
}

export interface CustomRange {
  startDate?: string
  endDate?: string
}

/**
 * Converte um período em um filtro de data
 */
export function getDateFilterForPeriod(periodo: string, customRange?: CustomRange): DateFilter {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  
  switch (periodo) {
    case 'hoje': {
      const todayStr = getLocalISODate(today)
      return {
        startDate: todayStr,
        endDate: todayStr
      }
    }
    
    case '7d': {
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(today.getDate() - 7)
      return {
        startDate: getLocalISODate(sevenDaysAgo),
        endDate: getLocalISODate(today)
      }
    }

    case 'semana_atual': {
      const start = new Date(today)
      const day = start.getDay()
      const diff = day === 0 ? 6 : day - 1 // semana começando na segunda
      start.setDate(start.getDate() - diff)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return {
        startDate: getLocalISODate(start),
        endDate: getLocalISODate(end)
      }
    }
    
    case '30d': {
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)
      return {
        startDate: getLocalISODate(thirtyDaysAgo),
        endDate: getLocalISODate(today)
      }
    }
    
    case 'mes_atual': {
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
      return {
        startDate: getLocalISODate(firstDayOfMonth),
        endDate: getLocalISODate(lastDayOfMonth)
      }
    }
    
    case 'mes_anterior': {
      const lastMonth = new Date(currentYear, currentMonth - 1, 1)
      const lastDayOfLastMonth = new Date(currentYear, currentMonth, 0)
      return {
        startDate: getLocalISODate(lastMonth),
        endDate: getLocalISODate(lastDayOfLastMonth)
      }
    }
    
    case 'trimestre': {
      const currentQuarter = Math.floor(currentMonth / 3)
      const firstDayOfQuarter = new Date(currentYear, currentQuarter * 3, 1)
      const lastDayOfQuarter = new Date(currentYear, (currentQuarter + 1) * 3, 0)
      return {
        startDate: getLocalISODate(firstDayOfQuarter),
        endDate: getLocalISODate(lastDayOfQuarter)
      }
    }
    
    case 'ano': {
      const firstDayOfYear = new Date(currentYear, 0, 1)
      const lastDayOfYear = new Date(currentYear, 11, 31)
      return {
        startDate: getLocalISODate(firstDayOfYear),
        endDate: getLocalISODate(lastDayOfYear)
      }
    }

    case 'personalizado': {
      const start = customRange?.startDate || getLocalISODate(today)
      const end = customRange?.endDate || start
      return {
        startDate: start,
        endDate: end,
      }
    }
    
    default:
      // Padrão: mês atual
      return getDateFilterForPeriod('mes_atual')
  }
}

/**
 * Verifica se uma data está dentro do filtro de período
 */
export function isDateInPeriod(dateString: string, periodo: string, customRange?: CustomRange): boolean {
  const { startDate, endDate } = getDateFilterForPeriod(periodo, customRange)
  return dateString >= startDate && dateString <= endDate
}

/**
 * Filtra um array de objetos baseado em um campo de data e período
 */
export function filterByPeriod<T, K extends keyof T>(
  items: T[],
  dateField: K,
  periodo: string,
  customRange?: CustomRange
): T[] {
  const { startDate, endDate } = getDateFilterForPeriod(periodo, customRange)
  
  return items.filter(item => {
    const dateValue = item[dateField]
    if (!dateValue) return false
    
    return String(dateValue) >= startDate && String(dateValue) <= endDate
  })
}
