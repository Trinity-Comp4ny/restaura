import { NextRequest, NextResponse } from 'next/server'
import { mockConsultasExpandidas } from '@/lib/mock-data-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pacienteIds = searchParams.get('pacienteIds')?.split(',').filter(Boolean)

  let filtered = [...mockConsultasExpandidas]

  if (pacienteIds && pacienteIds.length > 0) {
    filtered = filtered.filter((c) => pacienteIds.includes(c.paciente_id))
  }

  // Agrupar por paciente e pegar apenas a última visita de cada
  const ultimasVisitas: Record<string, any> = {}
  filtered
    .filter((c) => c.status === 'concluido')
    .sort((a, b) => new Date(b.horario_inicio).getTime() - new Date(a.horario_inicio).getTime())
    .forEach((visita) => {
      if (!ultimasVisitas[visita.paciente_id]) {
        ultimasVisitas[visita.paciente_id] = {
          paciente_id: visita.paciente_id,
          horario_inicio: visita.horario_inicio,
          dentist_nome: visita.usuarios?.nome || 'Não informado',
          procedure_nome: visita.procedimentos?.nome || 'Consulta',
        }
      }
    })

  return NextResponse.json(ultimasVisitas)
}
