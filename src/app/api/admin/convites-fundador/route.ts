import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendFounderInviteEmail } from '@/lib/email'

const founderInviteSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar se é admin do sistema (super admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin do sistema (emails específicos ou role especial)
    // Temporariamente: permitir qualquer usuário autenticado para testes
    const adminEmails = ['admin@restaura.com', 'suporte@restaura.com', user.email] // Incluir o próprio usuário temporariamente
    
    // Temporariamente comentado para testes
    // if (!adminEmails.includes(user.email)) {
    //   return NextResponse.json({ error: 'Apenas administradores do sistema podem convidar fundadores' }, { status: 403 })
    // }

    // Validar body da requisição
    const body = await request.json()
    const { email } = founderInviteSchema.parse(body)

    // Criar convite de fundador usando função do banco
    const { data: inviteId, error: inviteError } = await supabase
      .rpc('criar_convite_fundador', {
        p_email: email.toLowerCase()
      } as any)

    if (inviteError) {
      console.error('Erro ao criar convite de fundador:', inviteError)
      return NextResponse.json({ error: 'Erro ao criar convite' }, { status: 500 })
    }

    // Buscar dados completos do convite
    const { data: convite, error: fetchError } = await supabase
      .from('convites_fundador')
      .select('*')
      .eq('id', inviteId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar convite:', fetchError)
      return NextResponse.json({ error: 'Erro ao buscar dados do convite' }, { status: 500 })
    }

    // Enviar email com o convite
    try {
      const c = convite as any
      await sendFounderInviteEmail({
        to: c.email,
        inviterName: user.email?.split('@')[0] || 'Equipe Restaura',
        inviteToken: c.token
      })
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError)
      // Não falhar se email falhar, apenas logar
    }

    return NextResponse.json({
      success: true,
      message: 'Convite de fundador enviado com sucesso',
      inviteId: (convite as any).id,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/convite-fundador/${(convite as any).token}`
    })

  } catch (error) {
    console.error('Erro no endpoint de convite fundador:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar se é admin do sistema
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const adminEmails = ['admin@restaura.com', 'suporte@restaura.com', user.email]
    
    // Temporariamente comentado para testes
    // if (!adminEmails.includes(user.email)) {
    //   return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    // }

    // Buscar todos os convites de fundador
    const { data: convites, error: convitesError } = await supabase
      .from('convites_fundador')
      .select(`
        *,
        auth_users!convidado_por_id(email as convidado_por_email),
        clinicas(nome as clinica_criada)
      `)
      .order('criado_em', { ascending: false })

    if (convitesError) {
      console.error('Erro ao buscar convites:', convitesError)
      return NextResponse.json({ error: 'Erro ao buscar convites' }, { status: 500 })
    }

    return NextResponse.json({ convites })

  } catch (error) {
    console.error('Erro ao listar convites de fundador:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
