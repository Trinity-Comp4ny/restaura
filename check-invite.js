import { createClient } from './src/lib/supabase/client.js'

const supabase = createClient()

async function checkInvite() {
  const token = 'd4669179-752c-44f7-88a1-f4b0db89b82b'
  
  const { data, error } = await supabase
    .from('convites')
    .select('id, email, status, token, data_expiracao, clinicas(nome)')
    .eq('token', token)
    .single()
    
  console.log('Data:', data)
  console.log('Error:', error)
}

checkInvite()
