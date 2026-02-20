import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { token, clinicaNome, userId, userName } = await req.json()

    if (!token || !clinicaNome || !userId || !userName) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // 1. Buscar convite
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

    // 3. Criar clínica
    console.log('🏥 Criando clínica com dados:', {
      nome: clinicaNome,
      email: convite.email
    })

    const { data: clinicaData, error: clinicaError } = await supabaseAdmin
      .from('clinicas')
      .insert({
        nome: clinicaNome,
        slug: clinicaNome.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        documento: null,
        telefone: null,
        email: convite.email,
        endereco: null,
        cidade: null,
        estado: null,
        cep: null,
      })
      .select()
      .single()

    console.log('📊 Resultado da criação da clínica:', { clinicaData, clinicaError })

    if (clinicaError) {
      console.error('❌ Erro ao criar clínica:', clinicaError)
      return NextResponse.json({ 
        error: 'Erro ao criar clínica: ' + clinicaError.message,
        details: clinicaError 
      }, { status: 500 })
    }

    // 4. Criar usuário admin
    const { data: usuarioData, error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_usuario_id: userId,
        clinica_id: clinicaData.id,
        email: convite.email,
        nome: userName,
        papel: 'admin',
        ativo: true,
      })
      .select()
      .single()

    if (usuarioError) {
      console.error('Erro ao criar usuário:', usuarioError)
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }

    // 5. Atualizar status do convite
    const { error: updateError } = await supabaseAdmin
      .from('convites_fundador')
      .update({
        status: 'aceito',
        clinica_criada_id: clinicaData.id,
        aceito_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })
      .eq('id', convite.id)

    if (updateError) {
      console.error('Erro ao atualizar convite:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar convite' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      clinicaId: clinicaData.id,
      usuarioId: usuarioData.id,
      message: 'Clínica criada com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao aceitar convite:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
