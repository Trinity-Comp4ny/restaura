import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendFounderInviteEmail } from '@/lib/email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // TEMPORÁRIO: Removendo verificação de autenticação para testes
    // const authHeader = req.headers.get('authorization')
    // if (!authHeader) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    // }

    // const token = authHeader.replace('Bearer ', '')
    // const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    // if (authError || !user) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    // }

    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // TEMPORÁRIO: Usando dados fixos para testes
    const usuario = { nome: 'Equipe Restaura' }

    // TEMPORÁRIO: Usando RPC function em vez de insert direto
    const { data: inviteId, error: rpcError } = await supabaseAdmin
      .rpc('criar_convite_fundador', {
        p_email: email.toLowerCase()
      })

    if (rpcError) {
      console.error('Erro ao criar convite via RPC:', rpcError)
      if (rpcError.message?.includes('duplicate')) {
        return NextResponse.json({ error: 'Já existe um convite pendente para este email' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Erro ao criar convite: ' + rpcError.message }, { status: 500 })
    }

    // Buscar dados completos do convite
    const { data: convite, error: fetchError } = await supabaseAdmin
      .from('convites_fundador')
      .select('*')
      .eq('id', inviteId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar convite:', fetchError)
      return NextResponse.json({ error: 'Erro ao buscar dados do convite' }, { status: 500 })
    }

    // Enviar email com o convite
    await sendFounderInviteEmail({
      to: convite.email,
      inviterName: usuario?.nome || 'Equipe Restaura',
      inviteToken: convite.token,
    })

    return NextResponse.json({
      success: true,
      message: 'Convite de fundador criado com sucesso',
      inviteId: convite.id,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/convite-fundador?token=${convite.token}`,
      convite: convite
    })
  } catch (error: any) {
    console.error('Erro no endpoint de convite fundador:', error)
    return NextResponse.json({ error: 'Erro interno do servidor: ' + error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // TEMPORÁRIO: Removendo verificação de autenticação para testes
    // const authHeader = req.headers.get('authorization')
    // if (!authHeader) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    // }

    // const token = authHeader.replace('Bearer ', '')
    // const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    // if (authError || !user) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    // }

    const { data: convites, error } = await supabaseAdmin
      .from('convites_fundador')
      .select('id, email, status, criado_em, data_expiracao, aceito_em')
      .order('criado_em', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar convites' }, { status: 500 })
    }

    return NextResponse.json({ convites: convites ?? [] })
  } catch (error: any) {
    console.error('Erro ao listar convites fundador:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
