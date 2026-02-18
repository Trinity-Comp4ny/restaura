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

    if (!token || type !== 'invite') {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${Deno.env.get('APP_URL')}/login`
        }
      })
    }

    // Buscar convites de fundador pendentes
    const { data: convitesFundador, error: fundadorError } = await supabaseAdmin
      .from('convites_fundador')
      .select('token, email, status')
      .eq('status', 'pendente')

    // Buscar convites de clínica pendentes
    const { data: convitesClinica, error: clinicaError } = await supabaseAdmin
      .from('convites')
      .select('token, email, status')
      .eq('status', 'pendente')

    if (!fundadorError && convitesFundador && convitesFundador.length > 0) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${Deno.env.get('APP_URL')}/convite-fundador?token=${convitesFundador[0].token}`
        }
      })
    }

    if (!clinicaError && convitesClinica && convitesClinica.length > 0) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${Deno.env.get('APP_URL')}/convite?token=${convitesClinica[0].token}`
        }
      })
    }

    // Criar convite automático
    const { data: newConvite, error: createError } = await supabaseAdmin
      .rpc('criar_convite_fundador', {
        p_email: 'matheus_rezende0@hotmail.com'
      })

    if (createError) {
      console.error('Erro ao criar convite automático:', createError)
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${Deno.env.get('APP_URL')}/login?error=invite_auto_create_failed`
        }
      })
    }

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${Deno.env.get('APP_URL')}/convite-fundador?token=${newConvite}`
      }
    })

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
