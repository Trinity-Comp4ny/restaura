import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPasswordResetEmail } from '@/lib/email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectTo = `${appUrl}/reset-password`

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.toLowerCase(),
      options: {
        redirectTo,
      },
    })

    if (error) {
      console.error('Erro ao gerar link de recuperação:', error)
      return NextResponse.json({ success: true })
    }

    if (data?.properties?.action_link) {
      await sendPasswordResetEmail({
        to: email.toLowerCase(),
        resetUrl: data.properties.action_link,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no endpoint de reset de senha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
