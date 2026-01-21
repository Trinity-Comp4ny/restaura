'use client'

import { useState, useEffect } from 'react'

import { AppointmentStatus, APPOINTMENT_STATUS } from '@/constants/appointment-status'

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  href: string
  color: string
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

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulando busca de dados - depois substituir com chamada real à API
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        
        // Dados mockados - substituir com dados reais do Supabase
        const mockData: HomeData = {
          quickActions: [
            {
              id: '1',
              title: 'Novo Paciente',
              description: 'Cadastrar novo paciente',
              icon: 'Users',
              href: '/pacientes/novo',
              color: 'blue'
            },
            {
              id: '2',
              title: 'Nova Consulta',
              description: 'Agendar consulta',
              icon: 'Calendar',
              href: '/agenda/novo',
              color: 'green'
            },
            {
              id: '3',
              title: 'Visualizar Financeiro',
              description: 'Ver financeiro',
              icon: 'DollarSign',
              href: '/financeiro',
              color: 'yellow'
            }
          ],
          nextAppointments: [
            {
              id: '1',
              time: '08:00',
              patient: 'Maria Silva',
              procedure: 'Limpeza',
              status: APPOINTMENT_STATUS.CONFIRMADO,
              dentist: 'Dr. João',
              telefone: '(11) 98765-4321'
            },
            {
              id: '2',
              time: '09:00',
              patient: 'Carlos Santos',
              procedure: 'Restauração',
              status: APPOINTMENT_STATUS.EM_ANDAMENTO,
              dentist: 'Dr. João',
              telefone: '(11) 97654-3210'
            },
            {
              id: '3',
              time: '10:30',
              patient: 'Ana Oliveira',
              procedure: 'Ortodontia',
              status: APPOINTMENT_STATUS.ESPERANDO,
              dentist: 'Dra. Paula',
              telefone: '(11) 91234-5678'
            },
            {
              id: '4',
              time: '14:00',
              patient: 'Pedro Costa',
              procedure: 'Clareamento',
              status: APPOINTMENT_STATUS.CONCLUIDO,
              dentist: 'Dra. Paula',
              telefone: '(11) 99876-5432'
            }
          ]
        }

        setData(mockData)
      } catch (err) {
        setError('Erro ao carregar dados da Home')
        console.error('Error fetching home data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  return { data, loading, error }
}
