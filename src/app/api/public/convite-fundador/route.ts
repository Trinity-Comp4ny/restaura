import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 })
  }

  try {
    // Buscar convite usando service role (bypass RLS)
    const { data: convite, error } = await supabaseAdmin
      .from('convites_fundador')
      .select('*')
      .eq('token', token)
      .eq('status', 'pendente')
      .single()

    if (error || !convite) {
      return NextResponse.json({ error: 'Convite não encontrado ou já utilizado' }, { status: 404 })
    }

    // Verificar se não expirou
    if (new Date(convite.data_expiracao) < new Date()) {
      return NextResponse.json({ error: 'Convite expirado' }, { status: 410 })
    }

    return NextResponse.json({ convite })

  } catch (error) {
    console.error('Erro ao buscar convite:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
