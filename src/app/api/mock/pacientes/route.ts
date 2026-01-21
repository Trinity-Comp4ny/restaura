import { NextRequest, NextResponse } from 'next/server'
import { mockPacientes } from '@/lib/mock-data-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  const search = searchParams.get('search')

  let filtered = [...mockPacientes]

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.telefone?.includes(q)
    )
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
