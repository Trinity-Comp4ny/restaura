import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendClinicInviteEmail } from '@/lib/email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { email, papel = 'recepcionista' } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, clinica_id, papel, nome')
      .eq('auth_usuario_id', user.id)
      .single()

    if (userError || !usuario || usuario.papel !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem convidar' }, { status: 403 })
    }

    const { data: clinica, error: clinicaError } = await supabaseAdmin
      .from('clinicas')
      .select('nome')
      .eq('id', usuario.clinica_id)
      .single()

    if (clinicaError || !clinica) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })
    }

    const { data: inviteId, error: inviteError } = await supabaseAdmin.rpc('criar_convite', {
      p_clinica_id: usuario.clinica_id,
      p_email: email.toLowerCase(),
      p_convidado_por_id: usuario.id, // Use usuarios.id instead of auth.users.id
      p_papel: papel,
    } as any)

    if (inviteError) {
      console.error('Erro ao criar convite:', inviteError)
      if ((inviteError as any)?.code === '23505') {
        return NextResponse.json({ error: 'Já existe um convite pendente para este email' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Erro ao criar convite' }, { status: 500 })
    }

    const { data: convite, error: fetchError } = await supabaseAdmin
      .from('convites')
      .select('id, token, email, papel')
      .eq('id', inviteId)
      .single()

    if (fetchError || !convite) {
      return NextResponse.json({ error: 'Erro ao buscar dados do convite' }, { status: 500 })
    }

    await sendClinicInviteEmail({
      to: convite.email,
      clinicName: clinica.nome,
      inviterName: usuario.nome || 'Administrador',
      role: convite.papel,
      inviteToken: convite.token,
    })

    return NextResponse.json({
      success: true,
      message: 'Convite enviado com sucesso',
      inviteId: convite.id,
    })
  } catch (error) {
    console.error('Erro no endpoint de convite:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { conviteId } = await req.json()

    if (!conviteId) {
      return NextResponse.json({ error: 'ID do convite inválido' }, { status: 400 })
    }

    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, clinica_id, papel, nome')
      .eq('auth_usuario_id', user.id)
      .single()

    if (userError || !usuario || usuario.papel !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem reenviar convites' }, { status: 403 })
    }

    const { data: clinica } = await supabaseAdmin
      .from('clinicas')
      .select('nome')
      .eq('id', usuario.clinica_id)
      .single()

    const { data: convite, error: conviteError } = await supabaseAdmin
      .from('convites')
      .select('id, token, email, papel, clinica_id')
      .eq('id', conviteId)
      .eq('clinica_id', usuario.clinica_id)
      .eq('status', 'pendente')
      .single()

    if (conviteError || !convite) {
      return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })
    }

    await sendClinicInviteEmail({
      to: convite.email,
      clinicName: clinica?.nome || 'Clínica',
      inviterName: usuario.nome || 'Administrador',
      role: convite.papel,
      inviteToken: convite.token,
    })

    return NextResponse.json({ success: true, message: 'Convite reenviado com sucesso' })
  } catch (error) {
    console.error('Erro ao reenviar convite:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
