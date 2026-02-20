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
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const type = url.searchParams.get('type')
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convite de fundador
    if (type === 'fundador') {
      const { data: convite, error } = await supabaseAdmin
        .from('convites_fundador')
        .select('id, token, email, status, data_expiracao')
        .eq('token', token)
        .eq('status', 'pendente')
        .single()

      if (error || !convite) {
        return new Response(
          JSON.stringify({ error: 'Convite não encontrado ou já utilizado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (new Date(convite.data_expiracao) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Convite expirado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ valid: true, email: convite.email, type: 'fundador' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convite de clínica (equipe)
    const { data: convite, error } = await supabaseAdmin
      .from('convites')
      .select('id, token, email, papel, status, data_expiracao, clinicas(nome)')
      .eq('token', token)
      .eq('status', 'pendente')
      .single()

    if (error || !convite) {
      return new Response(
        JSON.stringify({ error: 'Convite não encontrado ou já utilizado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new Date((convite as any).data_expiracao) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Convite expirado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ valid: true, email: (convite as any).email, papel: (convite as any).papel, type: 'clinica' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao processar convite:', error)
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${Deno.env.get('APP_URL')}/login?error=invite_error`
      }
    })
  }
})
