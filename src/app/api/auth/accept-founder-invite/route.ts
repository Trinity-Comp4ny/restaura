import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const { token, clinicaNome, userId, userName } = await request.json()

    if (!token || !clinicaNome || !userId || !userName) {
      return NextResponse.json({ error: 'Token, nome da clínica, ID do usuário e nome são obrigatórios' }, { status: 400 })
    }

    const supabase = createClient()
    console.log('🔍 Buscando convite com token:', token)

    // 1. Buscar convite
    const { data: convite, error: conviteError } = await supabase
      .from('convites_fundador')
      .select('*')
      .eq('token', token)
      .eq('status', 'pendente')
      .single()

    console.log('📦 Convite encontrado:', convite)
    console.log('❌ Erro convite:', conviteError)

    if (conviteError || !convite) {
      console.log('❌ Convite inválido ou não encontrado')
      return NextResponse.json({ error: 'Convite inválido ou já utilizado' }, { status: 400 })
    }

    // 2. Verificar expiração
    if (new Date((convite as any).data_expiracao as string) < new Date()) {
      console.log('❌ Convite expirado')
      return NextResponse.json({ error: 'Convite expirado' }, { status: 400 })
    }

    console.log('✅ Criando clínica:', clinicaNome)

    // 3. Criar clínica
    const { data: clinicaData, error: clinicaError } = await supabase
      .from('clinicas')
      .insert({
        nome: clinicaNome,
        slug: clinicaNome.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        documento: null,
        telefone: null,
        email: (convite as any).email,
        endereco: null,
        cidade: null,
        estado: null,
        cep: null,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      } as any)
      .select()
      .single()

    if (clinicaError) {
      console.error('❌ Erro ao criar clínica:', clinicaError)
      return NextResponse.json({ error: 'Erro ao criar clínica: ' + clinicaError.message }, { status: 500 })
    }

    console.log('✅ Clínica criada:', clinicaData)

    // 4. Criar usuário admin
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        auth_usuario_id: userId,
        clinica_id: (clinicaData as any).id,
        email: (convite as any).email,
        nome: userName,
        papel: 'admin',
        ativo: true,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      } as any)

    if (usuarioError) {
      console.error('❌ Erro ao criar usuário:', usuarioError)
      return NextResponse.json({ error: 'Erro ao criar usuário: ' + usuarioError.message }, { status: 500 })
    }

    console.log('✅ Usuário criado com sucesso')

    // 5. Atualizar status do convite
    const { error: updateError } = await (supabase
      .from('convites_fundador') as any)
      .update({
        status: 'aceito',
        clinica_criada_id: (clinicaData as any).id,
        aceito_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })
      .eq('id', (convite as any).id)

    if (updateError) {
      console.error('Erro ao atualizar convite:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar convite' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      clinicaId: (clinicaData as any).id,
      usuarioId: (usuarioData as any).id,
      message: 'Clínica criada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao aceitar convite:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
