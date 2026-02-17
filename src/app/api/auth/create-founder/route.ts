import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, password, nome, token } = await request.json()

    if (!email || !password || !nome || !token) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Verificar se o convite é válido usando service role para bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: convite, error: conviteError } = await supabaseAdmin
      .from('convites_fundador')
      .select('*')
      .eq('token', token)
      .eq('status', 'pendente')
      .single()

    if (conviteError || !convite) {
      return NextResponse.json({ error: 'Convite inválido ou já utilizado' }, { status: 400 })
    }

    // Verificar se usuário já existe usando admin API
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users.find(user => user.email === email)
    
    if (existingUser) {
      // Se usuário existe, tentar login
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

    // Criar novo usuário sem confirmação de email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirma email
      user_metadata: {
        nome,
        invite_token: token,
        user_type: 'founder'
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError)
      return NextResponse.json({ error: 'Erro ao criar usuário: ' + authError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      userId: authData.user.id,
      userExists: false 
    })

  } catch (error) {
    console.error('Erro no endpoint:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
