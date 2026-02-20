import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Para debug, vamos permitir sem autenticação temporariamente
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    console.log('🔍 Iniciando criação de convite...')

    if (req.method === 'POST') {
      const { email } = await req.json()
      console.log('📧 Email recebido:', email)

      if (!email || typeof email !== 'string') {
        console.log('❌ Email inválido')
        return new Response(
          JSON.stringify({ error: 'Email inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Criar convite de fundador
      console.log('📡 Chamando RPC criar_convite_fundador...')
      const { data: inviteId, error: inviteError } = await supabaseAdmin
        .rpc('criar_convite_fundador', {
          p_email: email.toLowerCase()
        })

      if (inviteError) {
        console.error('❌ Erro ao criar convite:', inviteError)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar convite: ' + inviteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Convite criado com ID:', inviteId)

      // Buscar dados completos do convite
      console.log('🔍 Buscando dados completos do convite...')
      const { data: convite, error: fetchError } = await supabaseAdmin
        .from('convites_fundador')
        .select('*')
        .eq('id', inviteId)
        .single()

      if (fetchError) {
        console.error('❌ Erro ao buscar convite:', fetchError)
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar dados do convite: ' + fetchError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Dados do convite:', convite)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Convite de fundador criado com sucesso',
          inviteId: convite.id,
          inviteUrl: `${Deno.env.get('APP_URL') || 'http://localhost:3000'}/convite-fundador?token=${convite.token}`,
          convite: convite
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Buscar todos os convites de fundador
      console.log('📋 Listando todos os convites...')
      const { data: convites, error: convitesError } = await supabaseAdmin
        .from('convites_fundador')
        .select(`
          *,
          clinicas(nome)
        `)
        .order('criado_em', { ascending: false })

      if (convitesError) {
        console.error('❌ Erro ao buscar convites:', convitesError)
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar convites: ' + convitesError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Convites encontrados:', convites?.length || 0)

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
    console.error('❌ Erro no endpoint:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
