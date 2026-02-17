/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getLocalISODate } from '@/lib/utils'
import { AppointmentStatus } from '@/constants/appointment-status'

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  href: string
  color: string
  disabled?: boolean
}

export interface NextAppointment {
  id: string
  time: string
  patient: string
  procedure: string
  status: AppointmentStatus
  dentist: string
  telefone?: string
}

export interface HomeData {
  quickActions: QuickAction[]
  nextAppointments: NextAppointment[]
}

const supabase = createClient()

// Quick actions são estáticos - não dependem de dados do banco
const quickActions: QuickAction[] = [
  {
    id: 'novo-paciente',
    title: 'Novo Paciente',
    description: 'Cadastrar novo paciente',
    icon: 'Users',
    href: '/pacientes/novo',
    color: 'blue',
    disabled: true
  },
  {
    id: 'nova-consulta',
    title: 'Nova Consulta',
    description: 'Agendar consulta',
    icon: 'Calendar',
    href: '/agenda/novo',
    color: 'green',
    disabled: true
  },
  {
    id: 'financeiro',
    title: 'Visualizar Financeiro',
    description: 'Ver financeiro',
    icon: 'DollarSign',
    href: '/financeiro',
    color: 'yellow'
  }
]

export function useHomeDataReal(clinicaId?: string) {
  return useQuery({
    queryKey: ['home-data', clinicaId],
    queryFn: async () => {
      try {
        // Sempre retornar quick actions, independente de clinica_id
        if (!clinicaId) {
          return {
            quickActions,
            nextAppointments: []
          }
        }

        // Buscar próximas consultas do dia com timeout
        const hoje = getLocalISODate()
        
        const fetchPromise = supabase
          .from('consultas')
          .select(`
            id,
            horario_inicio,
            pacientes!inner(nome, telefone),
            procedimentos!inner(nome),
            status,
            usuarios!inner(nome)
          `)
          .eq('clinica_id', clinicaId)
          .eq('data', hoje)
          .order('horario_inicio')
          .limit(5)

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )

        const { data: consultas, error } = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]) as any

        if (error) {
          // Evita overlay de erro no cliente; apenas registra de forma branda
          console.warn('Erro ao buscar consultas:', error?.message || error)
          // Retornar dados vazios em caso de erro, mas não lançar exceção
          return {
            quickActions,
            nextAppointments: []
          }
        }

        // Se não há consultas, retornar array vazio sem erro
        if (!consultas || consultas.length === 0) {
          return {
            quickActions,
            nextAppointments: []
          }
        }

        const nextAppointments = (consultas as any[])?.map(consulta => ({
          id: consulta.id,
          time: consulta.horario_inicio?.substring(0, 5) || '',
          patient: (consulta.pacientes as any).nome,
          procedure: (consulta.procedimentos as any).nome,
          status: consulta.status as AppointmentStatus,
          dentist: (consulta.usuarios as any).nome,
          telefone: (consulta.pacientes as any).telefone
        })) || []

        return {
          quickActions,
          nextAppointments
        }
      } catch (err) {
        // Evita overlay de erro no cliente; apenas registra de forma branda
        console.warn('Erro inesperado no hook useHomeDataReal:', (err as any)?.message || err)
        // Retornar dados vazios em caso de erro
        return {
          quickActions,
          nextAppointments: []
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // Desativar retry para evitar múltiplas tentativas de erro
    throwOnError: false, // Não lançar erro para o componente
  })
}
