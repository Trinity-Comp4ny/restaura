import type { Metadata } from 'next'

import { Providers } from '@/components/providers'
import '@/styles/globals.css'
import { spaceGrotesk, inter, jetbrains } from '@/styles/fonts'
import { viewport } from '@/styles/viewport'

export const metadata: Metadata = {
  title: {
    default: 'Restaura',
    template: 'Restaura | %s',
  },
  description:
    'Sistema de gestão odontológica profissional. Gerencie sua clínica com eficiência.',
  keywords: ['odontologia', 'gestão', 'clínica', 'dentista', 'agenda', 'pacientes'],
  authors: [{ name: 'Restaura' }],
  creator: 'Restaura',
  icons: {
    icon: 'logos/logo.svg',
    shortcut: 'logos/logo.svg',
    apple: 'logos/logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable} min-h-screen bg-background font-grotesk antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
