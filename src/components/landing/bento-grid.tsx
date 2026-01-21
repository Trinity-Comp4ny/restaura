import { Calendar, Users, DollarSign, Shield, Smartphone, Zap, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BentoCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
  gradient?: string
  delay?: string
}

function BentoCard({ title, description, icon: Icon, className, gradient, delay }: BentoCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 p-8 transition-all duration-300 hover:shadow-premium-lg hover:border-primary/20", 
      className,
      delay && `animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards ${delay}`
    )}>
      {gradient && (
        <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100", gradient)} />
      )}
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>
        
        <h3 className="mb-2 text-xl font-bold tracking-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed flex-grow">{description}</p>
        
        <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          Saiba mais <CheckCircle2 className="ml-2 h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export function BentoGrid() {
  return (
    <section id="features" className="container-premium py-24 sm:py-32">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center mb-16">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Tudo em um <span className="gradient-text-primary">único lugar</span>
        </h2>
        <p className="max-w-2xl text-xl text-muted-foreground leading-relaxed">
          Substitua planilhas e softwares complexos por uma plataforma intuitiva que sua equipe vai amar usar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
        {/* Large Card - Agenda */}
        <BentoCard
          title="Agenda Inteligente"
          description="O coração da sua clínica. Agendamento drag-and-drop, confirmações automáticas via WhatsApp, lista de espera e bloqueios recorrentes. Nunca mais perca uma consulta."
          icon={Calendar}
          className="md:col-span-2 bg-gradient-to-br from-background to-muted/20"
          gradient="bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
        />

        {/* Tall Card - Mobile */}
        <BentoCard
          title="Acesso Mobile"
          description="Sua clínica no seu bolso. Acesse agenda, prontuários e financeiro de qualquer lugar, a qualquer hora. App nativo para iOS e Android."
          icon={Smartphone}
          className="md:row-span-2 bg-gradient-to-br from-background to-muted/20"
          gradient="bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
        />

        {/* Medium Card - Financeiro */}
        <BentoCard
          title="Controle Financeiro"
          description="Fluxo de caixa em tempo real, DRE, contas a pagar/receber e emissão de notas fiscais com um clique."
          icon={DollarSign}
          className="bg-gradient-to-br from-background to-muted/20"
          gradient="bg-gradient-to-br from-amber-500/10 to-orange-500/10"
        />

        {/* Medium Card - Prontuário */}
        <BentoCard
          title="Prontuário Digital"
          description="Histórico completo, odontograma interativo, receitas, atestados e upload de exames ilimitado."
          icon={Users}
          className="bg-gradient-to-br from-background to-muted/20"
          gradient="bg-gradient-to-br from-rose-500/10 to-pink-500/10"
        />

        {/* Wide Card - Marketing & Automação */}
        <BentoCard
          title="Marketing & Automação"
          description="Fidelize seus pacientes com campanhas automáticas de retorno, aniversário e datas comemorativas. Aumente seu faturamento sem esforço manual."
          icon={Zap}
          className="md:col-span-2 bg-gradient-to-br from-background to-muted/20"
          gradient="bg-gradient-to-br from-violet-500/10 to-purple-500/10"
        />

        {/* Small Card - Segurança */}
        <BentoCard
          title="Segurança Militar"
          description="Seus dados protegidos com criptografia de ponta a ponta e backups diários automáticos."
          icon={Shield}
          className="bg-gradient-to-br from-background to-muted/20"
          gradient="bg-gradient-to-br from-slate-500/10 to-gray-500/10"
        />
      </div>
    </section>
  )
}
