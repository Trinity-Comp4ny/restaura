import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendClinicInviteEmail } from '@/lib/email'

const inviteSchema = z.object({
  email: z.string().email(),
  papel: z.enum(['admin', 'dentista', 'assistente', 'recepcionista']).default('recepcionista'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do usuário para verificar se é admin
    const { data: usuarioRaw, error: userError } = await supabase
      .from('usuarios')
      .select('clinica_id, papel, nome')
      .eq('auth_usuario_id', user.id)
      .single()

    const usuario = usuarioRaw as any
    if (userError || !usuario || usuario.papel !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem convidar' }, { status: 403 })
    }

    // Validar body da requisição
    const body = await request.json()
    const { email, papel } = inviteSchema.parse(body)

    // Criar convite usando função do banco
    const { data: inviteId, error: inviteError } = await supabase
      .rpc('criar_convite', {
        p_clinica_id: usuario.clinica_id,
        p_email: email,
        p_convidado_por_id: user.id,
        p_papel: papel
      } as any)

    if (inviteError) {
      console.error('Erro ao criar convite:', inviteError)
      return NextResponse.json({ error: 'Erro ao criar convite' }, { status: 500 })
    }

    // Buscar dados completos do convite para enviar email
    const { data: convite, error: fetchError } = await supabase
      .from('convites')
      .select(`
        id,
        token,
        email,
        papel,
        clinicas(nome),
        usuarios!convidado_por_id(nome)
      `)
      .eq('id', inviteId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar convite:', fetchError)
      return NextResponse.json({ error: 'Erro ao buscar dados do convite' }, { status: 500 })
    }

    // Enviar email com o convite
    try {
      const c = convite as any
      await sendClinicInviteEmail({
        to: c.email,
        clinicName: c.clinicas?.nome || 'Sua Clínica',
        inviterName: c.usuarios?.nome || user.email?.split('@')[0] || 'Um administrador',
        role: c.papel,
        inviteToken: c.token
      })
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError)
      // Não falhar se email falhar, apenas logar
    }

    return NextResponse.json({
      success: true,
      message: 'Convite enviado com sucesso',
      inviteId: (convite as any).id
    })

  } catch (error) {
    console.error('Erro no endpoint de convite:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do usuário
    const { data: usuarioRaw2, error: userError } = await supabase
      .from('usuarios')
      .select('clinica_id, papel')
      .eq('auth_usuario_id', user.id)
      .single()

    const usuario = usuarioRaw2 as any
    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar convites da clínica (apenas admins podem ver todos)
    let query = supabase
      .from('convites')
      .select(`
        id,
        email,
        papel,
        status,
        criado_em,
        data_expiracao,
        aceito_em,
        usuarios!convidado_por_id(nome)
      `)
      .eq('clinica_id', usuario.clinica_id)

    // Se não for admin, ver apenas próprios convites
    if (usuario.papel !== 'admin') {
      query = query.eq('email', user.email!)
    }

    const { data: convites, error: convitesError } = await query.order('criado_em', { ascending: false })

    if (convitesError) {
      console.error('Erro ao buscar convites:', convitesError)
      return NextResponse.json({ error: 'Erro ao buscar convites' }, { status: 500 })
    }

    return NextResponse.json({ convites })

  } catch (error) {
    console.error('Erro ao listar convites:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Função para enviar email (implementar com seu serviço de email preferido)
async function sendInviteEmail({
  to,
  clinicName,
  inviterName,
  role,
  inviteToken
}: {
  to: string
  clinicName: string
  inviterName: string
  role: string
  inviteToken: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/convite/${inviteToken}`
  
  // Implementar com Resend, SendGrid, ou Supabase Auth emails
  console.log('Enviando convite para:', to)
  console.log('URL do convite:', inviteUrl)
  
  // Exemplo com Supabase Auth:
  // await supabase.auth.admin.updateUser({
  //   email: to,
  //   user_metadata: {
  //     invite_token: inviteToken,
  //     invite_url: inviteUrl
  //   }
  // })
}
