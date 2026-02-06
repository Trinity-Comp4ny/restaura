import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

function createDisabledClient(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[supabase] ${message}`)
  }

  return new Proxy(
    {},
    {
      get() {
        throw new Error(message)
      },
    }
  ) as unknown as SupabaseClient<Database>
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
  const missingEnv = !supabaseUrl || !supabaseKey

  if (useMockData || missingEnv) {
    const reason = useMockData
      ? 'Supabase is disabled when NEXT_PUBLIC_USE_MOCK_DATA=true'
      : 'Supabase is disabled because NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing'

    return createDisabledClient(reason)
  }

  return createBrowserClient<Database>(supabaseUrl!, supabaseKey!)
}

export const supabase = createClient()
