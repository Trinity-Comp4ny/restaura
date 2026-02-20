import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, to, subject, html, data } = await req.json()

    if (type === 'signup.confirmation') {
      // Usar template customizado de confirmação de email
      const templatePath = `${Deno.cwd()}/src/templates/confirm-signup.html`
      let templateHtml = ''
      
      try {
        const fileContent = await fetch(`file://${templatePath}`)
        templateHtml = await fileContent.text()
      } catch (error) {
        // Fallback para template inline se não encontrar arquivo
        templateHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirme seu cadastro - Restaura</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Space Grotesk', sans-serif; background: #0f172a; color: #f8fafc; }
                .container { max-width: 600px; margin: 40px auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
                .header { padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); }
                .brand { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
                .brand img { height: 32px; margin-right: 8px; }
                .brand span { font-size: 20px; font-weight: 600; color: #f8fafc; }
                h1 { font-size: 28px; font-weight: 600; margin-bottom: 12px; }
                .lead { color: #94a3b8; font-size: 16px; line-height: 1.5; }
                .content { padding: 40px 30px; }
                .panel { background: #0f172a; border-radius: 12px; padding: 30px; border: 1px solid #334155; }
                .cta { text-align: center; margin: 30px 0; }
                .cta a { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 500; font-size: 16px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3); }
                .cta a:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(59, 130, 246, 0.4); }
                .alert { background: #fbbf24/10; border: 1px solid #fbbf24/30; color: #fbbf24; padding: 12px; border-radius: 8px; font-size: 14px; text-align: center; margin-top: 20px; }
                .footer { padding: 20px 30px; text-align: center; background: #1e293b; border-top: 1px solid #334155; font-size: 14px; color: #64748b; }
                .footer a { color: #60a5fa; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="brand">
                        <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVFQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iMjUyLjAwMDAwMHB0IiBoZWlnaHQ9IjI2NC4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDI1Mi4wMDAwMDAgMjY0LjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgoKPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsMjY0LjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSIKZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNMCAxMzIwIGwwIC0xMzIwIDEyNjAgMCAxMjYwIDAgMCAxMzIwIDAgMTMyMCAtMTI2MCAwIC0xMjYwIDAgMAotMTMyMHogbTE5ODIgMTA1OCBjODYgLTQwIDEyNiAtNzUgMTgwIC0xNTcgNjEgLTk0IDg4IC0xNzkgOTUgLTMwOSA1IC05MCA5Ci0xMDYgMzAgLTEzMCA1NCAtNTkgNjcgLTEzMCAzNSAtMTkyIC0yMSAtNDIgLTc1IC04MCAtMTEzIC04MCAtMjggMCAtMjQgNgotMTI3IC0xNjkgLTE3IC0zMSAtNDEgLTg1IC01MiAtMTE5IC0xOSAtNjIgLTE5IC02NSAtMiAtOTAgMzAgLTQ0IDQxIC04NyAzMgotMTI3IC05IC0zOSAtNTEgLTkxIC04MSAtMTAwIC0xMSAtNCAtMjEgLTIwIC0yNSAtNDMgLTI3IC0xNTggLTkwIC0zNDQgLTE2MAotNDY4IC00NCAtODAgLTEyMCAtMTgxIC0xNTEgLTIwMSAtMzIgLTIxIC0zMSAtMjEgLTgzIDEzNyAtNzEgMjE1IC0xODcgNDE4Ci0yNzcgNDg3IGwtMzYgMjcgLTI5IC0zNCBjLTE2IC0xOSAtNDcgLTcxIC02OCAtMTE1IC00NyAtOTggLTEzNCAtMzU3IC0xNTAKLTQ0NSAtMTQgLTc5IC0yNSAtMTAwIC01MSAtMTAwIC03NSAwIC0yMDYgMTYzIC0yNzMgMzQxIC0zOSAxMDQgLTkwIDMzMSAtOTgKNDMzIC0zIDM5IC0yIDQwIDQyIDUyIDI1IDYgNTIgMTUgNjEgMTggMTQgNiAxOCAtMyAyNCAtNTEgMTAgLTgzIDQ0IC0yMzggNjcKLTMwOCAyNiAtNzYgODMgLTE5MiAxMTQgLTIyOCBsMjQgLTI5IDE1IDM2IGM4IDE5IDE1IDQwIDE1IDQ1IDAgNSAyMCA1OCA0NAoxMTggODcgMjE2IDE5MyA0MDMgMjQyIDQyNSAzMiAxNSA1OCAtNCAxMzcgLTk4IDgxIC05NiAxNDcgLTE5OCAyMjAgLTM0MSAzQotNjggNjUgLTEyMyA2OCAtMTIzIDcgMCA2MSA4NiA3OCAxMjUgNDQgOTkgODIgMjA4IDk3IDI3MSBsMTYgNzQgLTI2IDMxIGMtMTQKMTcgLTI5IDQyIC0zMiA1NSAtMTggNzAgMjkgMTU1IDk2IDE3NSBsNDAgMTIgMCA1NCAwIDU1IC03OCA3NiBjLTQyIDQyIC0xMTAKOTYgLTE0OSAxMjAgLTcxIDQzIC03MiA0MyAtOTggMjYgLTMxIC0yMCAtMTA1IC0yMyAtMTM5IC01IC0yMSAxMiAtMjkgMTAgLTY3Ci0xMiAtMTQ4IC04NCAtMzc3IC0xOTEgLTU1OSAtMjU5IC00NSAtMTcgLTY2IC0zMCAtNjggLTQzIC03IC0zNSAtNTQgLTg3IC05NgotMTA2IC0xMDAgLTQ1IC0xOTggLTQgLTI0NCAxMDQgLTE3IDQwIC0xNCA4NiA4IDEzNiAyNCA1MiAyMiA1OSAtNDAgMTY4IC0yNgo0NSAtNjAgMTE5IC03NSAxNjUgLTI1IDcyIC0yOCA5OCAtMjggMjAzIC0xIDEwNSAzIDEyOSAyNiAxOTMgODYgMjM4IDI0NSAzNTUKNDU3IDMzOSA3NyAtNyAxNDAgLTI3IDIzOSAtNzYgMTUzIC03OCAyNjAgLTEwOCA0NDEgLTEyNiBsMTI1IC0xMiAtNTkgLTI4CmMtODEgLTM4IC0xODUgLTUyIC0yODUgLTM4IC03MiAxMSAtMTEzIDI1IC0zMzEgMTE2IC0xNDIgNTkgLTI2OSAzOCAtMzYxIC02MAotODcgLTkxIC0xMjUgLTIwNSAtMTE2IC0zNDggNiAtMTA2IDI3IC0xNzAgOTcgLTMwMSA0NCAtNzkgNTUgLTk0IDc2IC05NCAzNQowIDk0IC0yNyAxMjQgLTU1IGwyNiAtMjUgNjkgMTkgYzEzMyAzNyAzNTYgMTIzIDUxOCAyMDEgNDAgMTkgNDcgMjYgNDcgNTEgMAo4MSA2MSAxMzkgMTQ1IDEzOSA0MiAwIDUyIC01IDg2IC0zOSAyMyAtMjMgMzkgLTQ4IDM5IC02MiAwIC0zMyA3IC00MSA2NSAtNzQKNjYgLTM4IDE4MiAtMTI1IDIyNCAtMTY5IGwzNSAtMzYgMzQgNjMgYzE5IDM0IDQyIDcwIDUwIDgwIDE0IDE2IDEzIDIxIC02IDU2Ci0yOCA1MCAtMzAgMTM0IC0zIDE3NCAxMCAxNiAzNSAzOSA1NSA1MyA0MSAyOCA0MyA0MCAyNiAxNTkgLTE0IDk3IC01OCAxODIKLTEyNiAyNDQgLTkyIDg0IC0xNTUgOTUgLTQ2NCA3NyAtMTgwIC0xMCAtMTg0IC00IC0zOSA1MCAxNjIgNjEgMjIzIDc0IDMyOQo3MSA3OCAtMiAxMDUgLTggMTUyIC0yOXogTTAgMCBMMjUyMCAwIEwyNTIwIDI2NDAgTDAgMjY0MCB6Ii8+CjwvZz4KPC9zdmc+Cg==" alt="Restaura" />
                        <span>Restaura</span>
                    </div>
                    <h1>Confirme seu cadastro</h1>
                    <p class="lead">Bem-vindo ao Restaura! Confirme seu email para ativar sua conta.</p>
                </div>
                <div class="content">
                    <div class="panel">
                        <p class="lead" style="text-align:center; margin-bottom:18px;">Clique no botão abaixo para confirmar seu email e começar a usar o sistema.</p>
                        <div class="cta">
                            <a href="${data?.ConfirmationURL || '#'}">Confirmar meu email</a>
                        </div>
                        <div class="alert">Este link expira em 24 horas. Se você não criou uma conta, ignore este email.</div>
                    </div>
                </div>
                <div class="footer">
                    <div>© 2026 Restaura • Gestão odontológica</div>
                    <div style="margin-top:6px; color:#64748b;">Impulsionado por <a href="https://trnty.com.br" style="color:#60a5fa; text-decoration:none;">Trinity Company</a></div>
                </div>
            </div>
        </body>
        </html>
        `
      }

      // Substituir variáveis no template
      let finalHtml = templateHtml
      if (data?.ConfirmationURL) {
        finalHtml = finalHtml.replace(/\{\{\s*\.\s*ConfirmationURL\s*\}\}/g, data.ConfirmationURL)
        finalHtml = finalHtml.replace(/\${data\?\.ConfirmationURL\s*\|\|\s*['"]#['"]}/g, data.ConfirmationURL)
      }

      // Enviar via Resend
      const { data: emailData, error } = await resend.emails.send({
        from: `${Deno.env.get('RESEND_FROM_NAME') || 'Restaura'} <${Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@restaura.com'}>`,
        to: Array.isArray(to) ? to : [to],
        subject: subject || 'Confirme seu cadastro - Restaura',
        html: finalHtml,
      })

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, data: emailData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Para outros tipos de email, usar o HTML fornecido
    const { data: emailData, error } = await resend.emails.send({
      from: `${Deno.env.get('RESEND_FROM_NAME') || 'Restaura'} <${Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@restaura.com'}>`,
      to: Array.isArray(to) ? to : [to],
      subject: subject || 'Email do Restaura',
      html: html || '',
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
