import Link from 'next/link'
import { ArrowRight, Star, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/5 blur-3xl opacity-50" />
      </div>

      <div className="container-premium relative z-10 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="animate-in-up mb-8 inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-sm text-primary backdrop-blur-sm transition-colors hover:bg-primary/10">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          <span className="font-medium">A nova era da gestão odontológica</span>
        </div>

        {/* Headline */}
        <h1 className="animate-in-up max-w-5xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl mb-8 leading-[1.1]">
          Sua clínica, <br className="hidden sm:block" />
          <span className="gradient-text-primary relative inline-block">
            elevada à perfeição.
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="animate-in-up delay-100 max-w-2xl text-xl text-muted-foreground mb-10 leading-relaxed">
          O Restaura não é apenas um software. É a paz de espírito que você precisa para focar no que realmente importa: 
          <span className="text-foreground font-medium"> o sorriso do seu paciente.</span>
        </p>

        {/* CTAs */}
        <div className="animate-in-up delay-200 flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
          <Link href="/cadastrar">
            <Button size="lg" className="btn-premium h-14 px-8 text-lg w-full sm:w-auto rounded-full shadow-premium-lg">
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4 justify-center">
             <Link href="#demo">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg w-full sm:w-auto rounded-full hover:bg-muted/50">
                <PlayCircle className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Button>
            </Link>
          </div>
        </div>

        {/* Reviews */}
        <div className="animate-in-up delay-300 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=e1e4e8`} alt="User" className="h-full w-full" />
              </div>
            ))}
            <div className="h-10 w-10 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              +2k
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="flex text-amber-400">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
            </div>
            <span>Dentistas satisfeitos</span>
          </div>
        </div>

        {/* Dashboard Preview (Abstract) */}
        <div className="animate-in-up delay-500 mt-20 relative w-full max-w-6xl mx-auto">
          <div className="relative rounded-2xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5" />
            {/* UI Mockup Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-10">
                    <p className="text-muted-foreground/50 text-sm uppercase tracking-widest font-semibold mb-4">Interface do Sistema</p>
                    <div className="grid grid-cols-3 gap-4 opacity-30 blur-[1px] scale-90">
                        <div className="h-32 bg-muted rounded-lg col-span-1"></div>
                        <div className="h-32 bg-muted rounded-lg col-span-2"></div>
                        <div className="h-32 bg-muted rounded-lg col-span-3"></div>
                    </div>
                </div>
            </div>
             {/* Overlay Gradient */}
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
           {/* Glow effect behind */}
           <div className="absolute -inset-4 bg-primary/20 blur-3xl -z-10 rounded-[3rem] opacity-40" />
        </div>

      </div>
    </section>
  )
}
