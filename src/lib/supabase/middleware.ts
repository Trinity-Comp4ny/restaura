import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/forgot-password') || request.nextUrl.pathname.startsWith('/reset-password')
  const isCadastroPage = request.nextUrl.pathname.startsWith('/cadastrar')
  const isPublicPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/test-clinicas')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isInvitePage = request.nextUrl.pathname.startsWith('/convite')
  const isFounderInvitePage = request.nextUrl.pathname.startsWith('/convite-fundador')
  const isSetupPage = request.nextUrl.pathname.startsWith('/setup-clinica')

  // Verificar se é um convite do Supabase Auth (URL com #access_token)
  const hash = request.nextUrl.hash
  if (hash && hash.includes('type=invite')) {
    const url = request.nextUrl.clone()
    url.pathname = '/api/auth/invite-handler'
    url.search = request.nextUrl.search
    return NextResponse.redirect(url)
  }

  // Se não tem usuário e não está em página pública/auth/api/convite
  if (!user && !isAuthPage && !isPublicPage && !isApiRoute && !isInvitePage && !isFounderInvitePage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Bloquear acesso direto a páginas de cadastro - apenas via convite
  if (!isInvitePage && !isFounderInvitePage && isCadastroPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Se tem usuário e está em página de auth
  if (user && isAuthPage) {
    // Verificar se usuário já está em alguma clínica
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('clinica_id')
      .eq('auth_usuario_id', user.id)
      .maybeSingle()

    if (usuarioError) {
      return supabaseResponse
    }

    if (usuario?.clinica_id) {
      // Usuário já vinculado a clínica, redirecionar para painel
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    } else {
      // Usuário autenticado mas sem clínica - redirecionar para setup
      const url = request.nextUrl.clone()
      url.pathname = '/setup-clinica'
      return NextResponse.redirect(url)
    }
  }

  // Usuário autenticado mas sem clínica não deve acessar o painel
  if (user && !isAuthPage && !isPublicPage && !isApiRoute && !isInvitePage && !isFounderInvitePage) {
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('clinica_id')
      .eq('auth_usuario_id', user.id)
      .maybeSingle()

    if (usuarioError) {
      return supabaseResponse
    }

    if (!usuario?.clinica_id && !isSetupPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/setup-clinica'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
