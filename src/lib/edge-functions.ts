/**
 * Helper para chamadas às Edge Functions do Supabase
 * Substitui as antigas rotas /api/* do Next.js
 */

const EDGE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1'

export const edgeFunctions = {
  inviteHandler: `${EDGE_FUNCTIONS_URL}/invite-handler`,
  authRegister: `${EDGE_FUNCTIONS_URL}/auth-register`,
  authCreateFounder: `${EDGE_FUNCTIONS_URL}/auth-create-founder`,
  authAcceptFounderInvite: `${EDGE_FUNCTIONS_URL}/auth-accept-founder-invite`,
  adminConvitesFundador: `${EDGE_FUNCTIONS_URL}/admin-convites-fundador`,
  convites: `${EDGE_FUNCTIONS_URL}/convites`,
}

/**
 * Helper para fazer requisições autenticadas às Edge Functions
 */
export async function callEdgeFunction(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
