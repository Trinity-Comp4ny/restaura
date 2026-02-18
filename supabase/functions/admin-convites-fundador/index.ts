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
      const { email } = await req.json()

      if (!email || typeof email !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Email inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Criar convite de fundador
      const { data: inviteId, error: inviteError } = await supabaseAdmin
        .rpc('criar_convite_fundador', {
          p_email: email.toLowerCase()
        })

      if (inviteError) {
        console.error('Erro ao criar convite de fundador:', inviteError)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar convite' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Buscar dados completos do convite
      const { data: convite, error: fetchError } = await supabaseAdmin
        .from('convites_fundador')
        .select('*')
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
          message: 'Convite de fundador enviado com sucesso',
          inviteId: convite.id,
          inviteUrl: `${Deno.env.get('APP_URL')}/convite-fundador/${convite.token}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Buscar todos os convites de fundador
      const { data: convites, error: convitesError } = await supabaseAdmin
        .from('convites_fundador')
        .select(`
          *,
          clinicas(nome)
        `)
        .order('criado_em', { ascending: false })

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
    console.error('Erro no endpoint de convite fundador:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
