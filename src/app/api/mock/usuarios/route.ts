import { NextRequest, NextResponse } from 'next/server'
import { mockUsuarios } from '@/lib/mock-data-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const clinicaId = searchParams.get('clinicaId')

  let filtered = [...mockUsuarios]

  if (clinicaId) {
    filtered = filtered.filter((u) => u.clinica_id === clinicaId)
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.nome.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    )
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
  })
}
