import { Calendar, Users, Shield, Smartphone, Zap, CheckCircle2, LayoutDashboard, DollarSign, Package, TrendingUp } from 'lucide-react'
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
      "group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-800/40 p-8 text-white transition-all duration-300 hover:border-white/20 hover:shadow-2xl", 
      className,
      delay && `animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards ${delay}`
    )}>
      {gradient && (
        <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100", gradient)} />
      )}
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-blue-300 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white shadow-lg shadow-blue-500/10">
          <Icon className="h-6 w-6" />
        </div>
        
        <h3 className="mb-2 text-xl font-bold tracking-tight">{title}</h3>
        <p className="text-slate-300 leading-relaxed flex-grow">{description}</p>
        
        <div className="mt-6 flex items-center text-sm font-medium text-blue-300 opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          Saiba mais <CheckCircle2 className="ml-2 h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export function BentoGrid() {
  return (
    <section id="features" className="relative overflow-hidden py-24 sm:py-32 scroll-mt-20 bg-slate-900 text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[520px] h-[520px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[520px] h-[520px] rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="container-premium relative z-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center mb-16 reveal-up">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-white">Tudo em um</span> <span className="text-blue-500">único lugar</span>
          </h2>
          <p className="max-w-2xl text-xl text-slate-300 leading-relaxed">
            Substitua planilhas e softwares complexos por uma plataforma intuitiva que sua equipe vai amar usar.
          </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
        {/* Large Card - Dashboard */}
        <BentoCard
          title="Dashboard Inteligente"
          description="Visão completa da sua clínica em tempo real. Métricas, performance e insights para tomada de decisão rápida e assertiva."
          icon={LayoutDashboard}
          className="md:col-span-2"
          gradient="bg-gradient-to-br from-blue-600/20 to-indigo-600/20"
        />

        {/* Tall Card - Pacientes */}
        <BentoCard
          title="Gestão de Pacientes"
          description="Prontuário digital completo, histórico de tratamentos, documentos e comunicação centralizada. Tudo sobre seus pacientes em um só lugar."
          icon={Users}
          className="md:row-span-2"
          gradient="bg-gradient-to-br from-blue-600/15 to-purple-600/15"
        />

        {/* Medium Card - Agenda */}
        <BentoCard
          title="Agenda Inteligente"
          description="Agendamento drag-and-drop, confirmações automáticas via WhatsApp, lista de espera e bloqueios recorrentes. Nunca mais perca uma consulta."
          icon={Calendar}
          className="bg-gradient-to-br from-slate-800/40 to-slate-800/20"
          gradient="bg-gradient-to-br from-purple-600/15 to-blue-600/15"
        />

        {/* Medium Card - Financeiro */}
        <BentoCard
          title="Controle Financeiro"
          description="Fluxo de caixa em tempo real, DRE, contas a pagar/receber e emissão de notas fiscais com um clique."
          icon={DollarSign}
          className="bg-gradient-to-br from-slate-800/40 to-slate-800/20"
          gradient="bg-gradient-to-br from-emerald-600/15 to-teal-600/15"
        />

        {/* Wide Card - Estoque */}
        <BentoCard
          title="Gestão de Estoque"
          description="Controle completo de materiais dentários, alertas de validade, categorização e previsão de reposição automática."
          icon={Package}
          className="md:col-span-2"
          gradient="bg-gradient-to-br from-indigo-600/20 to-purple-600/20"
        />

        {/* Small Card - Leads */}
        <BentoCard
          title="Captura de Leads"
          description="Atrai novos pacientes com funil de vendas integrado, follow-up automático e métricas de conversão."
          icon={TrendingUp}
          className="bg-gradient-to-br from-slate-800/40 to-slate-800/20"
          gradient="bg-gradient-to-br from-blue-600/10 to-purple-600/10"
        />
      </div>
      </div>
    </section>
  )
}
