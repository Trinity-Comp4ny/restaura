import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: Request) {
  try {
    const { name, email, password, clinicName } = await request.json()

    if (!name || !email || !password || !clinicName) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, clinic_name: clinicName },
    })

    if (signUpError) {
      if (signUpError.message.includes('already')) {
        return NextResponse.json(
          { error: 'Este e-mail já está cadastrado' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    const authUserId = authData.user.id

    // 2. Create clinica
    const slug = generateSlug(clinicName) + '-' + Date.now().toString(36)
    const { data: clinica, error: clinicaError } = await supabaseAdmin
      .from('clinicas')
      .insert({
        nome: clinicName,
        slug,
        email,
      } as any)
      .select()
      .single()

    if (clinicaError) {
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      return NextResponse.json(
        { error: 'Erro ao criar clínica: ' + clinicaError.message },
        { status: 500 }
      )
    }

    // 3. Create usuario linked to clinica and auth user
    const { error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_usuario_id: authUserId,
        clinica_id: (clinica as any).id,
        email,
        nome: name,
        papel: 'admin',
        ativo: true,
      } as any)

    if (usuarioError) {
      // Rollback: delete clinica and auth user
      await supabaseAdmin.from('clinicas').delete().eq('id', (clinica as any).id)
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      return NextResponse.json(
        { error: 'Erro ao criar usuário: ' + usuarioError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Conta criada com sucesso!',
      user: { id: authUserId, email },
      clinica: { id: (clinica as any).id, nome: (clinica as any).nome, slug: (clinica as any).slug },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
