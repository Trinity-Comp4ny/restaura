import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Cliente simples para chamar as API routes de mocks
async function fetchMock<T>(url: string, options?: RequestInit): Promise<T> {
  const baseUrl = window.location.origin
  const res = await fetch(`${baseUrl}/api/mock${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`Erro ao buscar dados: ${res.statusText}`)
  }
  return res.json()
}

// Hook para pacientes (paginado e com busca)
export function useMockPacientes(options?: {
  search?: string
  limit?: number
  offset?: number
}) {
  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (options?.search) params.set('search', options.search)
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))
    return params.toString()
  }, [options?.search, options?.limit, options?.offset])

  return useQuery({
    queryKey: ['mock-pacientes', query],
    queryFn: () => fetchMock(`/pacientes?${query}`),
    staleTime: 1000 * 30, // 30s
  })
}

// Hook para consultas (com filtros)
export function useMockConsultas(options?: {
  startDate?: string
  endDate?: string
  pacienteId?: string
  dentistaId?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (options?.startDate) params.set('startDate', options.startDate)
    if (options?.endDate) params.set('endDate', options.endDate)
    if (options?.pacienteId) params.set('pacienteId', options.pacienteId)
    if (options?.dentistaId) params.set('dentistaId', options.dentistaId)
    if (options?.status) params.set('status', options.status)
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))
    return params.toString()
  }, [options?.startDate, options?.endDate, options?.pacienteId, options?.dentistaId, options?.status, options?.limit, options?.offset])

  return useQuery({
    queryKey: ['mock-consultas', query],
    queryFn: () => fetchMock(`/consultas?${query}`),
    staleTime: 1000 * 30,
  })
}

// Hook para últimas visitas (agora via API)
export function useMockUltimasVisitas(pacienteIds: string[]) {
  const query = useMemo(() => {
    if (!pacienteIds.length) return ''
    return `pacienteIds=${pacienteIds.join(',')}`
  }, [pacienteIds])

  return useQuery({
    queryKey: ['mock-ultimas-visitas', query],
    queryFn: () => fetchMock(`/ultimas-visitas?${query}`),
    enabled: pacienteIds.length > 0,
    staleTime: 1000 * 30,
  })
}

// Hook para tratamentos
export function useMockTratamentos(options?: {
  pacienteId?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (options?.pacienteId) params.set('pacienteId', options.pacienteId)
    if (options?.status) params.set('status', options.status)
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))
    return params.toString()
  }, [options?.pacienteId, options?.status, options?.limit, options?.offset])

  return useQuery({
    queryKey: ['mock-tratamentos', query],
    queryFn: () => fetchMock(`/tratamentos?${query}`),
    staleTime: 1000 * 30,
  })
}

// Hook para estoque
export function useMockEstoque(options?: {
  search?: string
  category?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (options?.search) params.set('search', options.search)
    if (options?.category) params.set('category', options.category)
    if (options?.status) params.set('status', options.status)
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))
    return params.toString()
  }, [options?.search, options?.category, options?.status, options?.limit, options?.offset])

  return useQuery({
    queryKey: ['mock-estoque', query],
    queryFn: () => fetchMock(`/estoque?${query}`),
    staleTime: 1000 * 30,
  })
}

// Hook para equipe (usuários da clínica)
export function useMockEquipe(options?: { search?: string }) {
  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (options?.search) params.set('search', options.search)
    return params.toString()
  }, [options?.search])

  return useQuery({
    queryKey: ['mock-equipe', query],
    queryFn: () => fetchMock<{ data: unknown[]; total: number }>(`/usuarios?${query}`),
    staleTime: 1000 * 30,
  })
}

// Hook para selects (pacientes, dentistas, procedimentos, setores)
export function useMockSelects(type: 'pacientes' | 'dentistas' | 'procedimentos' | 'setores') {
  return useQuery({
    queryKey: ['mock-selects', type],
    queryFn: () => fetchMock(`/selects?type=${type}`),
    staleTime: 1000 * 60 * 5, // 5min
  })
}
