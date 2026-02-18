import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, clinicaNome, userId, userName } = await req.json()

    if (!token || !clinicaNome || !userId || !userName) {
      return new Response(
        JSON.stringify({ error: 'Token, nome da clínica, ID do usuário e nome são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Buscar convite
    const { data: convite, error: conviteError } = await supabase
      .from('convites_fundador')
      .select('*')
      .eq('token', token)
      .eq('status', 'pendente')
      .single()

    if (conviteError || !convite) {
      return new Response(
        JSON.stringify({ error: 'Convite inválido ou já utilizado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Verificar expiração
    if (new Date(convite.data_expiracao) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Convite expirado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Criar clínica
    const { data: clinicaData, error: clinicaError } = await supabase
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
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })
      .select()
      .single()

    if (clinicaError) {
      console.error('Erro ao criar clínica:', clinicaError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar clínica: ' + clinicaError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Criar usuário admin
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        auth_usuario_id: userId,
        clinica_id: clinicaData.id,
        email: convite.email,
        nome: userName,
        papel: 'admin',
        ativo: true,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })

    if (usuarioError) {
      console.error('Erro ao criar usuário:', usuarioError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário: ' + usuarioError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Atualizar status do convite
    const { error: updateError } = await supabase
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
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar convite' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        clinicaId: clinicaData.id,
        usuarioId: usuarioData,
        message: 'Clínica criada com sucesso'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao aceitar convite:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
