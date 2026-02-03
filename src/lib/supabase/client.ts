import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export function createClient() {
  // Check if mock data mode is enabled
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return new Proxy(
      {},
      {
        get() {
          throw new Error('Supabase is disabled when NEXT_PUBLIC_USE_MOCK_DATA=true')
        },
      }
    ) as unknown as SupabaseClient<Database>
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

export const supabase = createClient()
