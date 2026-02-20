import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://gyffziviaubyqsrhiysu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZmZ6aXZpYXVieXFzcmhpeXN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY2MDk0NywiZXhwIjoyMDg0MjM2OTQ3fQ.1M6dFdlIqILUzqWi3fDbzR5m2Zni5DrPN-GwPgRkfQo'
)

// Listar triggers na tabela clinicas
const { data, error } = await supabase
  .from('information_schema.triggers')
  .select('trigger_name, event_object_table, action_statement')
  .eq('event_object_table', 'clinicas')

console.log('Triggers:', JSON.stringify(data, null, 2))
console.log('Error:', error)
