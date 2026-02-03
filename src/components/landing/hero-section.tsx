import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppPreview } from '@/components/landing/app-preview'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-40 pb-20 lg:pt-48 lg:pb-28 z-0 bg-slate-900 text-white">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-24 -right-24 h-[520px] w-[520px] rounded-full bg-purple-500/25 blur-3xl" />
      </div>

      <div className="container-premium relative z-10 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200/90 backdrop-blur-sm transition-colors hover:bg-white/10">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
          <span className="font-medium">Software de gestão odontológica</span>
        </div>

        {/* Headline */}
        <h1 className="max-w-5xl text-4xl font-medium tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl mb-8 leading-[1.1]">
          <span className="text-white">Restaure</span><br className="hidden sm:block" />
          <span className="text-blue-500">a gestão de sua clínica.</span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl text-lg text-slate-300 mb-10 leading-relaxed">
          Simplifique o controle financeiro, gestão de pacientes e operação da sua clínica
          <span className="text-white font-medium"> em uma única plataforma.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
          <Link href="/cadastrar">
            <Button size="lg" className="btn-premium h-14 px-8 text-lg w-full sm:w-auto rounded-full bg-blue-500 hover:bg-blue-600 border-none text-white shadow-lg shadow-blue-500/20">
              Começar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4 justify-center">
             <Link href="#features">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg w-full sm:w-auto rounded-full text-slate-200 hover:bg-white/10 hover:text-white">
                Conheça os recursos
              </Button>
            </Link>
          </div>
        </div>


        {/* Dashboard Preview (Replica) */}
        <div className="mt-20 relative w-full max-w-6xl mx-auto">
          <AppPreview className="aspect-[16/10] md:aspect-[21/10]" />
          <div className="absolute -inset-4 bg-blue-500/20 blur-3xl -z-10 rounded-[3rem] opacity-40" />
        </div>

      </div>
    </section>
  )
}
