import { NextRequest, NextResponse } from 'next/server'
import { mockConsultasExpandidas } from '@/lib/mock-data-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const pacienteId = searchParams.get('pacienteId')
  const dentistaId = searchParams.get('dentistaId')
  const status = searchParams.get('status')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')

  let filtered = [...mockConsultasExpandidas]

  if (startDate) {
    filtered = filtered.filter((c) => c.horario_inicio >= startDate)
  }
  if (endDate) {
    filtered = filtered.filter((c) => c.horario_inicio <= endDate)
  }
  if (pacienteId) {
    filtered = filtered.filter((c) => c.paciente_id === pacienteId)
  }
  if (dentistaId) {
    filtered = filtered.filter((c) => c.dentista_id === dentistaId)
  }
  if (status) {
    filtered = filtered.filter((c) => c.status === status)
  }

  const total = filtered.length

  if (offset) {
    const off = parseInt(offset, 10)
    filtered = filtered.slice(off)
  }

  if (limit) {
    const lim = parseInt(limit, 10)
    filtered = filtered.slice(0, lim)
  }

  return NextResponse.json({
    data: filtered,
    total,
    hasMore: limit && offset ? total > parseInt(offset, 10) + parseInt(limit, 10) : false,
  })
}
