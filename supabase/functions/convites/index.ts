import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { email, papel = 'recepcionista' } = await req.json()

      if (!email || typeof email !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Email inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Buscar dados do usuário
      const { data: usuario, error: userError } = await supabaseClient
        .from('usuarios')
        .select('clinica_id, papel, nome')
        .eq('auth_usuario_id', user.id)
        .single()

      if (userError || !usuario || usuario.papel !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Apenas administradores podem convidar' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Criar convite
      const { data: inviteId, error: inviteError } = await supabaseAdmin
        .rpc('criar_convite', {
          p_clinica_id: usuario.clinica_id,
          p_email: email,
          p_convidado_por_id: user.id,
          p_papel: papel
        })

      if (inviteError) {
        console.error('Erro ao criar convite:', inviteError)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar convite' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Buscar dados completos do convite
      const { data: convite, error: fetchError } = await supabaseAdmin
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
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar dados do convite' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Convite enviado com sucesso',
          inviteId: convite.id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Buscar dados do usuário
      const { data: usuario, error: userError } = await supabaseClient
        .from('usuarios')
        .select('clinica_id, papel')
        .eq('auth_usuario_id', user.id)
        .single()

      if (userError || !usuario) {
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Buscar convites da clínica
      let query = supabaseClient
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
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar convites' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ convites }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro no endpoint de convite:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
