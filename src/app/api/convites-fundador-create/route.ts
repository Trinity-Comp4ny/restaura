import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, password, nome, token } = await req.json()

    if (!email || !password || !nome || !token) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // 1. Validar convite
    const { data: convite, error: conviteError } = await supabaseAdmin
      .from('convites_fundador')
      .select('*')
      .eq('token', token)
      .eq('status', 'pendente')
      .single()

    if (conviteError || !convite) {
      return NextResponse.json({ error: 'Convite inválido ou já utilizado' }, { status: 400 })
    }

    // 2. Verificar expiração
    if (new Date(convite.data_expiracao) < new Date()) {
      return NextResponse.json({ error: 'Convite expirado' }, { status: 400 })
    }

    // 3. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        invite_token: token,
        user_type: 'founder'
      }
    })

    if (authError) {
      // Se usuário já existe, tentar fazer login
      if (authError.message.includes('already registered')) {
        const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) {
          return NextResponse.json({ error: 'Usuário já existe com senha diferente' }, { status: 400 })
        }

        return NextResponse.json({ 
          success: true, 
          userId: signInData.user.id,
          userExists: true 
        })
      }

      console.error('Erro ao criar usuário:', authError)
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      userId: authData.user.id,
      userExists: false 
    })

  } catch (error: any) {
    console.error('Erro no endpoint:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
