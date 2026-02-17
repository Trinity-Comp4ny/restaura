import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailVariables {
  [key: string]: string | number | undefined
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  template: 'invite-clinic' | 'invite-founder'
  variables: EmailVariables
}

export async function sendEmail({ to, subject, template, variables }: SendEmailOptions) {
  try {
    // Carregar template HTML
    const templatePath = path.join(process.cwd(), 'src', 'templates', `${template}.html`)
    let html = fs.readFileSync(templatePath, 'utf8')
    
    // Substituir variáveis no template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      html = html.replace(regex, String(value || ''))
    })
    
    // Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || 'Restaura'} <${process.env.RESEND_FROM_EMAIL || 'noreply@restaura.com'}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })
    
    if (error) {
      throw error
    }
    
    return data
    
  } catch (error) {
    throw error
  }
}

// Funções específicas para cada tipo de convite
export async function sendClinicInviteEmail(options: {
  to: string
  clinicName: string
  inviterName: string
  role: string
  inviteToken: string
}) {
  return sendEmail({
    to: options.to,
    subject: `Convite para ${options.clinicName}`,
    template: 'invite-clinic',
    variables: {
      clinicName: options.clinicName,
      inviterName: options.inviterName,
      role: options.role,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/convite/${options.inviteToken}`,
      subject: `Convite para ${options.clinicName}`
    }
  })
}

export async function sendFounderInviteEmail(options: {
  to: string
  inviterName: string
  inviteToken: string
}) {
  return sendEmail({
    to: options.to,
    subject: '🎉 Seja um Fundador no Restaura!',
    template: 'invite-founder',
    variables: {
      inviterName: options.inviterName,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/convite-fundador/${options.inviteToken}`,
      subject: '🎉 Seja um Fundador no Restaura!'
    }
  })
}
