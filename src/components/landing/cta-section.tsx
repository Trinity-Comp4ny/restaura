import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 h-[440px] w-[440px] rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[440px] w-[440px] rounded-full bg-purple-500/20 blur-3xl" />
      </div>
      
      <div className="container-premium relative z-10 flex flex-col items-center text-center">
        <div className="mb-8 inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-slate-200/90 backdrop-blur-sm">
          <Sparkles className="mr-2 h-4 w-4" />
          Comece sua transformação hoje
        </div>
        
        <h2 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
          <span className="text-white">Sua clínica merece o</span> <br className="hidden sm:block" />
          <span className="text-blue-500">melhor software do mercado</span>
        </h2>
        
        <p className="max-w-2xl text-xl text-slate-300 mb-10 leading-relaxed">
          Junte-se a milhares de dentistas que já modernizaram suas clínicas. 
          Teste gratuitamente por 14 dias, sem compromisso.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/cadastrar">
            <Button size="lg" className="btn-premium h-14 px-8 text-lg w-full sm:w-auto rounded-full bg-blue-500 hover:bg-blue-600 border-none text-white shadow-lg shadow-blue-500/20">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/contato">
            <Button size="lg" variant="ghost" className="h-14 px-8 text-lg w-full sm:w-auto rounded-full text-slate-200 hover:bg-white/10 hover:text-white">
              Falar com Consultor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
