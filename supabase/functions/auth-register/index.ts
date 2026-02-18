import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, password, clinicName } = await req.json()

    if (!name || !email || !password || !clinicName) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, clinic_name: clinicName },
    })

    if (signUpError) {
      if (signUpError.message.includes('already')) {
        return new Response(
          JSON.stringify({ error: 'Este e-mail já está cadastrado' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ error: signUpError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      })
      .select()
      .single()

    if (clinicaError) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar clínica: ' + clinicaError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Create usuario
    const { error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_usuario_id: authUserId,
        clinica_id: clinica.id,
        email,
        nome: name,
        papel: 'admin',
        ativo: true,
      })

    if (usuarioError) {
      await supabaseAdmin.from('clinicas').delete().eq('id', clinica.id)
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário: ' + usuarioError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        message: 'Conta criada com sucesso!',
        user: { id: authUserId, email },
        clinica: { id: clinica.id, nome: clinica.nome, slug: clinica.slug },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
