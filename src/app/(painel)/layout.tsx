import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar/sidebar'
import { OnboardingGate } from '@/components/onboarding/onboarding-gate'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="mx-auto max-w-7xl">
            <OnboardingGate>{children}</OnboardingGate>
          </div>
        </main>
      </div>
    </div>
  )
}
