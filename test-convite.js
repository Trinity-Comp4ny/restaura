// Test script para criar convite diretamente via Supabase Admin
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://gyffziviaubyqsrhiysu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZmZ6aXZpYXVieXFzcmhpeXN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY2MDk0NywiZXhwIjoyMDg0MjM2OTQ3fQ.1M6dFdlIqILUzqWi3fDbzR5m2Zni5DrPN-GwPgRkfQo'
)

async function criarConvite() {
  try {
    console.log('🔍 Criando convite para matheus.rezende@labrynth.ai...')
    
    // 1. Criar convite via RPC function
    const { data: inviteId, error: inviteError } = await supabaseAdmin
      .rpc('criar_convite_fundador', {
        p_email: 'matheus.rezende@labrynth.ai'
      })

    if (inviteError) {
      console.error('❌ Erro ao criar convite:', inviteError)
      return
    }

    console.log('✅ Convite criado com ID:', inviteId)

    // 2. Buscar dados completos do convite
    const { data: convite, error: fetchError } = await supabaseAdmin
      .from('convites_fundador')
      .select('*')
      .eq('id', inviteId)
      .single()

    if (fetchError) {
      console.error('❌ Erro ao buscar convite:', fetchError)
      return
    }

    console.log('✅ Dados do convite:', convite)
    console.log('🔗 Link do convite:', `http://localhost:3000/convite-fundador?token=${convite.token}`)
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

criarConvite()
