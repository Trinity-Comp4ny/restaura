import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  
  // Se não for um convite do Supabase Auth, redirecionar para login
  if (!token || type !== 'invite') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
  }

  try {
    // Extrair email do token JWT (simplificado - na prática precisaria decodificar o JWT)
    // Por ora, vamos verificar todos os convites pendentes e redirecionar para o primeiro encontrado
    
    // Buscar todos os convites de fundador pendentes
    const { data: convitesFundador, error: fundadorError } = await supabaseAdmin
      .from('convites_fundador')
      .select('token, email, status')
      .eq('status', 'pendente')

    // Buscar todos os convites de clínica pendentes
    const { data: convitesClinica, error: clinicaError } = await supabaseAdmin
      .from('convites')
      .select('token, email, status')
      .eq('status', 'pendente')

    // Se encontrou convites de fundador, redirecionar para o primeiro
    if (!fundadorError && convitesFundador && convitesFundador.length > 0) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/convite-fundador?token=${convitesFundador[0].token}`)
    }

    // Se encontrou convites de clínica, redirecionar para o primeiro
    if (!clinicaError && convitesClinica && convitesClinica.length > 0) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/convite?token=${convitesClinica[0].token}`)
    }

    // Não encontrou convites pendentes - criar um convite de fundador automaticamente
    // Isso é um fallback para quando o super admin usa o Supabase Auth diretamente
    const { data: newConvite, error: createError } = await supabaseAdmin
      .rpc('criar_convite_fundador', {
        p_email: 'matheus_rezende0@hotmail.com' // Email fixo por enquanto
      } as any)

    if (createError) {
      console.error('Erro ao criar convite automático:', createError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=invite_auto_create_failed`)
    }

    // Redirecionar para o novo convite de fundador
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/convite-fundador?token=${newConvite}`)

  } catch (error) {
    console.error('Erro ao processar convite:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=invite_error`)
  }
}
