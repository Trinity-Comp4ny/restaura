import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://gyffziviaubyqsrhiysu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZmZ6aXZpYXVieXFzcmhpeXN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY2MDk0NywiZXhwIjoyMDg0MjM2OTQ3fQ.1M6dFdlIqILUzqWi3fDbzR5m2Zni5DrPN-GwPgRkfQo'
)

// Tentar criar clínica de teste para ver o erro completo
console.log('🔍 Testando insert na tabela clinicas...')
const { data, error } = await supabase
  .from('clinicas')
  .insert({
    nome: 'Teste Debug',
    slug: 'teste-debug-' + Date.now(),
  })
  .select()
  .single()

console.log('Resultado:', JSON.stringify({ data, error }, null, 2))
