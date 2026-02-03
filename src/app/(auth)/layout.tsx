import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="pointer-events-none absolute inset-0 texture-grid opacity-70" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full items-stretch">
        <Link href="/" className="absolute left-4 top-4 flex items-center gap-2 sm:left-6 sm:top-6">
          <Image src="/logos/logo.svg" alt="Restaura" className="h-8 w-8" width={32} height={32} />
          <span className="text-base font-semibold tracking-tight sm:text-lg">Restaura</span>
        </Link>

        <div className="grid w-full grid-cols-1 md:grid-cols-2">
          <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-primary px-10 py-12 text-primary-foreground md:flex lg:px-14">
            <div className="pointer-events-none absolute inset-0 opacity-100 [background-image:radial-gradient(circle,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30" />
            <div className="relative space-y-5">
              <p className="text-sm font-medium tracking-wide text-primary-foreground/80">Gestão odontológica moderna</p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                Seu painel da clínica,
                <span className="block text-primary-foreground/90">do jeito certo.</span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-primary-foreground/80">
                Acesse sua conta para gerenciar agenda, pacientes, procedimentos e estoque com um fluxo simples e profissional.
              </p>
            </div>

            <div className="relative grid max-w-md gap-3">
              <div className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm font-medium">Acesso rápido</p>
                <p className="mt-1 text-sm text-primary-foreground/80">Entre e continue exatamente de onde parou.</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm font-medium">Interface premium</p>
                <p className="mt-1 text-sm text-primary-foreground/80">Design consistente com a landing e foco em usabilidade.</p>
              </div>
            </div>
          </div>

          <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
