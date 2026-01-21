import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -skew-y-2 transform origin-top-left scale-110" />
      
      <div className="container-premium relative z-10 flex flex-col items-center text-center">
        <div className="mb-8 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="mr-2 h-4 w-4" />
          Comece sua transformação hoje
        </div>
        
        <h2 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
          Sua clínica merece o <br className="hidden sm:block" />
          <span className="gradient-text-primary">melhor software do mercado</span>
        </h2>
        
        <p className="max-w-2xl text-xl text-muted-foreground mb-10 leading-relaxed">
          Junte-se a milhares de dentistas que já modernizaram suas clínicas. 
          Teste gratuitamente por 14 dias, sem compromisso.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/cadastrar">
            <Button size="lg" className="btn-premium h-14 px-8 text-lg w-full sm:w-auto rounded-full shadow-premium-lg">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/contato">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto rounded-full bg-background/50 backdrop-blur-sm">
              Falar com Consultor
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Não é necessário cartão de crédito • Cancelamento a qualquer momento
        </p>
      </div>
    </section>
  )
}
