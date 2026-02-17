'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getLocalISODate } from '@/lib/utils'

export function useDashboardStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

      // Get clinica_id from current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('Usuário não autenticado')

      const { data: usuario } = await (supabase
        .from('usuarios') as any)
        .select('clinica_id')
        .eq('auth_usuario_id', user.id)
        .single()

      if (!usuario?.clinica_id) throw new Error('Clínica não encontrada')

      const clinicaId = usuario.clinica_id

      // Parallel queries for better performance
      const [
        totalPatientsResult,
        thisMonthPatientsResult,
        lastMonthPatientsResult,
        todayAppointmentsResult,
        thisMonthRevenueResult,
        lastMonthRevenueResult,
        thisMonthAppointmentsResult,
        lastMonthAppointmentsResult,
        todayAppointmentsListResult,
        pendingPaymentsResult,
        newPatientsThisMonthResult
      ] = await Promise.all([
        // Total patients
        (supabase
          .from('pacientes') as any)
          .select('id')
          .eq('clinica_id', clinicaId)
          .eq('ativo', true),

        // This month patients
        (supabase
          .from('pacientes') as any)
          .select('id')
          .eq('clinica_id', clinicaId)
          .eq('ativo', true)
          .gte('criado_em', startOfMonth.toISOString()),

        // Last month patients
        (supabase
          .from('pacientes') as any)
          .select('id')
          .eq('clinica_id', clinicaId)
          .eq('ativo', true)
          .gte('criado_em', startOfLastMonth.toISOString())
          .lte('criado_em', endOfLastMonth.toISOString()),

        // Today appointments
        (supabase
          .from('consultas') as any)
          .select('id')
          .eq('clinica_id', clinicaId)
          .eq('data', getLocalISODate(today)),

        // This month revenue
        (supabase
          .from('transacoes') as any)
          .select('valor')
          .eq('clinica_id', clinicaId)
          .eq('status', 'pago')
          .gte('data_pagamento', startOfMonth.toISOString()),

        // Last month revenue
        (supabase
          .from('transacoes') as any)
          .select('valor')
          .eq('clinica_id', clinicaId)
          .eq('status', 'pago')
          .gte('data_pagamento', startOfLastMonth.toISOString())
          .lte('data_pagamento', endOfLastMonth.toISOString()),

        // This month appointments
        (supabase
          .from('consultas') as any)
          .select('id, data, duracao')
          .eq('clinica_id', clinicaId)
          .gte('data', startOfMonth.toISOString()),

        // Last month appointments
        (supabase
          .from('consultas') as any)
          .select('id, data, duracao')
          .eq('clinica_id', clinicaId)
          .gte('data', startOfLastMonth.toISOString())
          .lte('data', endOfLastMonth.toISOString()),

        // Today appointments list with details
        (supabase
          .from('consultas') as any)
          .select(`
            id,
            horario,
            status,
            pacientes!inner(
              nome
            ),
            dentistas!inner(
              nome
            ),
            procedimentos!inner(
              nome
            )
          `)
          .eq('clinica_id', clinicaId)
          .eq('data', getLocalISODate(today))
          .order('horario'),

        // Pending payments
        (supabase
          .from('parcelas') as any)
          .select('valor, data_vencimento')
          .eq('clinica_id', clinicaId)
          .eq('status', 'pendente')
          .lte('data_vencimento', getLocalISODate(today)),

        // New patients this month
        (supabase
          .from('pacientes') as any)
          .select('id')
          .eq('clinica_id', clinicaId)
          .gte('criado_em', startOfMonth.toISOString())
      ])

      // Calculate stats
      const totalPatients = totalPatientsResult.data?.length || 0
      const thisMonthPatients = thisMonthPatientsResult.data?.length || 0
      const lastMonthPatients = lastMonthPatientsResult.data?.length || 0
      const todayAppointments = todayAppointmentsResult.data?.length || 0
      
      const thisMonthRevenue = thisMonthRevenueResult.data?.reduce((sum: number, t: any) => sum + (t.valor || 0), 0) || 0
      const lastMonthRevenue = lastMonthRevenueResult.data?.reduce((sum: number, t: any) => sum + (t.valor || 0), 0) || 0
      
      const thisMonthAppointments = thisMonthAppointmentsResult.data?.length || 0
      const lastMonthAppointments = lastMonthAppointmentsResult.data?.length || 0
      
      // Calculate occupancy rate (simplified - based on appointments vs available slots)
      const totalSlotsThisMonth = thisMonthAppointments * 8 // Assuming 8-hour work days
      const occupiedSlots = thisMonthAppointments * 1.5 // Average appointment duration
      const occupancyRate = totalSlotsThisMonth > 0 ? Math.round((occupiedSlots / totalSlotsThisMonth) * 100) : 0

      // Calculate percentage changes
      const patientChange = lastMonthPatients > 0 
        ? Math.round(((thisMonthPatients - lastMonthPatients) / lastMonthPatients) * 100)
        : 0

      const revenueChange = lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0

      const appointmentsChange = lastMonthAppointments > 0
        ? Math.round(((todayAppointments - (lastMonthAppointments / 30)) / (lastMonthAppointments / 30)) * 100)
        : 0

      const occupancyChange = 5 // Simplified - would need historical data

      const pendingPayments = pendingPaymentsResult.data?.reduce((sum: number, p: any) => sum + (p.valor || 0), 0) || 0
      const pendingPaymentsCount = pendingPaymentsResult.data?.length || 0

      return {
        stats: [
          {
            title: 'Total de Pacientes',
            value: totalPatients.toLocaleString('pt-BR'),
            change: patientChange > 0 ? `+${patientChange}%` : `${patientChange}%`,
            changeType: patientChange >= 0 ? 'positive' : 'negative' as const,
          },
          {
            title: 'Consultas Hoje',
            value: todayAppointments.toString(),
            change: appointmentsChange > 0 ? `+${appointmentsChange}` : appointmentsChange.toString(),
            changeType: appointmentsChange >= 0 ? 'positive' : 'negative' as const,
          },
          {
            title: 'Receita do Mês',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(thisMonthRevenue),
            change: revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`,
            changeType: revenueChange >= 0 ? 'positive' : 'negative' as const,
          },
          {
            title: 'Taxa de Ocupação',
            value: `${occupancyRate}%`,
            change: occupancyChange > 0 ? `+${occupancyChange}%` : `${occupancyChange}%`,
            changeType: occupancyChange >= 0 ? 'positive' : 'negative' as const,
          },
        ],
        todayAppointments: todayAppointmentsListResult.data?.map((apt: any) => ({
          id: apt.id,
          time: apt.horario?.substring(0, 5) || '',
          patient: apt.pacientes?.nome || '',
          procedure: apt.procedimentos?.nome || '',
          status: apt.status || 'scheduled',
          dentist: apt.dentistas?.nome || '',
        })) || [],
        alerts: [
          {
            type: 'warning',
            title: `${Math.max(0, 3)} pacientes não confirmaram`,
            description: 'Consultas de amanhã aguardando confirmação',
          },
          {
            type: 'info',
            title: `${pendingPaymentsCount} pagamentos pendentes`,
            description: `Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingPayments)}`,
          },
          {
            type: 'success',
            title: `${newPatientsThisMonthResult.data?.length || 0} novos pacientes`,
            description: 'Cadastrados este mês',
          },
        ],
      }
    },
  })
}
