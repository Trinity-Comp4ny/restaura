import { NextRequest, NextResponse } from 'next/server'
import { mockTratamentos } from '@/lib/mock-data-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pacienteId = searchParams.get('pacienteId')
  const status = searchParams.get('status')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')

  let filtered = [...(mockTratamentos as any[])]

  if (pacienteId) {
    filtered = filtered.filter((t) => String(t.paciente_id) === String(pacienteId))
  }
  if (status) {
    filtered = filtered.filter((t) => t.status === status)
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
