import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { readFile } from "https://deno.land/std@0.168.0/fs/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, confirmation_url } = await req.json()

    if (!email || !confirmation_url) {
      return new Response(
        JSON.stringify({ error: 'Email e URL de confirmação são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Read the email template
    const templatePath = new URL('../../src/templates/confirm-signup.html', import.meta.url).pathname
    const templateContent = await readFile(templatePath, { encoding: 'utf8' })

    // Replace template variables
    const htmlContent = templateContent
      .replace(/{{ .ConfirmationURL }}/g, confirmation_url)

    // In a real implementation, you would send this email using a service like:
    // - Resend (recommended for Supabase)
    // - SendGrid
    // - AWS SES
    // - Or your own SMTP server
    
    // For now, we'll just return the HTML content
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Template de email gerado com sucesso',
        html: htmlContent 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing email template:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
