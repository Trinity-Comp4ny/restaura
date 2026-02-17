/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type DatabaseType = Database['public']
type Clinica = DatabaseType['Tables']['clinicas']['Row']

// Define ConfiguracoesRede interface since it's not in the generated types yet
interface ConfiguracoesRede {
  id: string
  sincronizacao_automatica: boolean
  relatorios_consolidados: boolean
  backup_centralizado: boolean
  criado_em: string
  atualizado_em: string
}

interface EstatisticasRede {
  total_clinicas: number
  clinicas_ativas: number
  clinicas_inativas: number
  clinicas_planejamento: number
  total_usuarios: number
  novas_este_mes: number
  total_pacientes: number
  consultas_mes: number
  faturamento_mes: number
  taxa_ocupacao: number
}

interface ClinicaDetalhes extends Clinica {
  total_usuarios: number
  usuarios_ativos: number
  administradores: number
  dentistas: number
  assistentes: number
  recepcionistas: number
  status: string
}

// Hook para buscar estatísticas da rede
export function useEstatisticasRede() {
  return useQuery<EstatisticasRede>({
    queryKey: ['estatisticas-rede'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_estatisticas_rede')

      if (error) throw error
      return data[0]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook para buscar clínicas com detalhes
export function useClinicasDetalhes() {
  return useQuery<ClinicaDetalhes[]>({
    queryKey: ['clinicas-detalhes'],
    queryFn: async () => {
      // Query simples que deve funcionar com as políticas RLS atuais
      const { data: clinicasData, error: clinicasError } = await supabase
        .from('clinicas')
        .select('*')
        .order('criado_em', { ascending: false })

      if (clinicasError) {
        console.error('Erro ao buscar clínicas:', clinicasError)
        throw clinicasError
      }

      // Se não houver clínicas, retornar array vazio
      if (!clinicasData || clinicasData.length === 0) {
        return []
      }

      // Para cada clínica, buscar informações básicas de usuários
      const clinicasDetalhes: ClinicaDetalhes[] = await Promise.all(
        clinicasData.map(async (clinica: any) => {
          try {
            const { data: usuariosData, error: usuariosError } = await supabase
              .from('usuarios')
              .select('papel, ativo')
              .eq('clinica_id', clinica.id)

            if (usuariosError) {
              console.warn('Erro ao buscar usuários da clínica:', usuariosError)
              // Retornar dados básicos mesmo sem informações de usuários
              return {
                ...clinica,
                total_usuarios: 0,
                usuarios_ativos: 0,
                administradores: 0,
                dentistas: 0,
                assistentes: 0,
                recepcionistas: 0,
                status: clinica.status || 'ativo'
              }
            }

            const usuarios = usuariosData as any[] || []
            
            return {
              ...clinica,
              total_usuarios: usuarios.length,
              usuarios_ativos: usuarios.filter((u: any) => u.ativo).length,
              administradores: usuarios.filter((u: any) => u.papel === 'admin').length,
              dentistas: usuarios.filter((u: any) => u.papel === 'dentista').length,
              assistentes: usuarios.filter((u: any) => u.papel === 'assistente').length,
              recepcionistas: usuarios.filter((u: any) => u.papel === 'recepcionista').length,
              status: clinica.status || 'ativo'
            }
          } catch (error) {
            console.error('Erro ao processar clínica:', clinica.id, error)
            // Retornar dados básicos em caso de erro
            return {
              ...clinica,
              total_usuarios: 0,
              usuarios_ativos: 0,
              administradores: 0,
              dentistas: 0,
              assistentes: 0,
              recepcionistas: 0,
              status: clinica.status || 'ativo'
            }
          }
        })
      )

      return clinicasDetalhes
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Hook para buscar configurações da rede
export function useConfiguracoesRede() {
  return useQuery<ConfiguracoesRede>({
    queryKey: ['configuracoes-rede'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes_rede')
        .select('*')
        .single()

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Hook para criar nova clínica
export function useCreateClinica() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clinica: Omit<Clinica, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const { data, error } = await supabase
        .from('clinicas')
        .insert([clinica] as any)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicas-detalhes'] })
      queryClient.invalidateQueries({ queryKey: ['estatisticas-rede'] })
    },
  })
}

// Hook para atualizar clínica
export function useUpdateClinica() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...clinica }: (Partial<Clinica> & { id: string; status?: string })) => {
      const { data, error } = await (supabase
        .from('clinicas') as any)
        .update(clinica)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicas-detalhes'] })
      queryClient.invalidateQueries({ queryKey: ['estatisticas-rede'] })
    },
  })
}

// Hook para atualizar configurações da rede
export function useUpdateConfiguracoesRede() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (configuracoes: Partial<ConfiguracoesRede>) => {
      const { data, error } = await (supabase
        .from('configuracoes_rede') as any)
        .update(configuracoes)
        .eq('id', 1) // Assuming there's only one record
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes-rede'] })
    },
  })
}

// Hook para buscar usuários de uma clínica específica
export function useUsuariosClinica(clinicaId: string) {
  return useQuery({
    queryKey: ['usuarios-clinica', clinicaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('clinica_id', clinicaId)
        .order('criado_em', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!clinicaId,
  })
}

// Hook para buscar métricas de performance de uma clínica
export function useMetricasClinica(clinicaId: string) {
  return useQuery({
    queryKey: ['metricas-clinica', clinicaId],
    queryFn: async () => {
      // Buscar métricas da clínica específica
      const [pacientesResult, consultasResult, transacoesResult] = await Promise.all([
        supabase
          .from('pacientes')
          .select('id')
          .eq('clinica_id', clinicaId)
          .eq('ativo', true),
        supabase
          .from('consultas')
          .select('id, data_hora, status')
          .eq('clinica_id', clinicaId)
          .gte('data_hora', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase
          .from('transacoes')
          .select('valor_liquido, tipo, status, data_pagamento')
          .eq('clinica_id', clinicaId)
          .eq('status', 'pago')
          .gte('data_pagamento', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ])

      if (pacientesResult.error) throw pacientesResult.error
      if (consultasResult.error) throw consultasResult.error
      if (transacoesResult.error) throw transacoesResult.error

      const totalPacientes = pacientesResult.data?.length || 0
      const consultasMes = consultasResult.data?.length || 0
      const faturamentoMes = transacoesResult.data?.reduce((acc: number, t: any) => 
        t.tipo === 'receita' ? acc + Number(t.valor_liquido) : acc, 0) || 0

      return {
        total_pacientes: totalPacientes,
        consultas_mes: consultasMes,
        faturamento_mes: faturamentoMes,
      }
    },
    enabled: !!clinicaId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
