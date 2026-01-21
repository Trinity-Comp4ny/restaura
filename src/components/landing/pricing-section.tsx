import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  missingFeatures?: string[]
  popular?: boolean
  ctaText?: string
}

function PricingCard({ title, price, description, features, missingFeatures = [], popular, ctaText = "Começar Agora" }: PricingCardProps) {
  return (
    <div className={cn(
      "relative flex flex-col rounded-3xl p-8 transition-all duration-300",
      popular 
        ? "bg-primary text-primary-foreground shadow-2xl scale-105 border-none z-10" 
        : "bg-background border border-border/50 hover:border-primary/20 hover:shadow-premium"
    )}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
          Mais Popular
        </div>
      )}

      <div className="mb-8">
        <h3 className={cn("text-lg font-medium", popular ? "text-primary-foreground/90" : "text-muted-foreground")}>
          {title}
        </h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">{price}</span>
          <span className={cn("text-sm", popular ? "text-primary-foreground/80" : "text-muted-foreground")}>
            /mês
          </span>
        </div>
        <p className={cn("mt-4 text-sm leading-relaxed", popular ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {description}
        </p>
      </div>

      <div className="flex-1 space-y-4 mb-8">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 text-sm">
            <div className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full",
              popular ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            )}>
              <Check className="h-3 w-3" />
            </div>
            <span>{feature}</span>
          </div>
        ))}
        {missingFeatures.map((feature) => (
          <div key={feature} className="flex items-center gap-3 text-sm text-muted-foreground/50">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
              <X className="h-3 w-3" />
            </div>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Button 
        className={cn(
          "w-full rounded-full h-12 font-semibold text-base transition-all", 
          popular 
            ? "bg-white text-primary hover:bg-white/90 shadow-lg" 
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {ctaText}
      </Button>
    </div>
  )
}

export function PricingSection() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container-premium">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Investimento simples e <span className="gradient-text-primary">transparente</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Escolha o plano ideal para o momento da sua clínica. Sem taxas escondidas, sem fidelidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          <PricingCard
            title="Individual"
            price="R$ 97"
            description="Perfeito para dentistas autônomos iniciando sua jornada digital."
            features={[
              "1 Dentista",
              "Até 500 pacientes",
              "Agenda Inteligente",
              "Prontuário Digital",
              "App Mobile (Leitura)"
            ]}
            missingFeatures={[
              "Financeiro Completo",
              "Emissão de Notas Fiscais",
              "Marketing Automatizado"
            ]}
          />

          <PricingCard
            title="Clínica"
            price="R$ 197"
            description="Tudo que uma clínica em crescimento precisa para escalar."
            popular={true}
            ctaText="Testar Grátis por 14 Dias"
            features={[
              "Até 3 Dentistas",
              "Pacientes Ilimitados",
              "Gestão Financeira Completa",
              "Emissão de Notas Fiscais",
              "App Mobile Completo",
              "Confirmação via WhatsApp",
              "Suporte Prioritário"
            ]}
          />

          <PricingCard
            title="Rede"
            price="R$ 397"
            description="Para grandes clínicas e redes que precisam de controle total."
            features={[
              "Dentistas Ilimitados",
              "Multi-unidades",
              "Relatórios Avançados BI",
              "API de Integração",
              "Gerente de Conta Dedicado",
              "Treinamento para Equipe",
              "Personalização White-label"
            ]}
          />
        </div>
      </div>
    </section>
  )
}
