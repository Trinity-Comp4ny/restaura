import { CalendarCheck2, Check, ClipboardCheck, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmotionalSection() {
  return (
    <section id="sobre" className="relative py-24 lg:py-32 overflow-hidden bg-slate-900 text-white scroll-mt-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[520px] h-[520px] rounded-full bg-blue-500/20 blur-3xl" />
      </div>
      
      <div className="container-premium relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 reveal-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Recupere a</span> <span className="text-blue-500">paixão</span> pela odontologia
            </h2>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Você não estudou anos para ser um administrador de planilhas. 
              O Restaura devolve o seu tempo para que você possa se dedicar ao que realmente importa: 
              cuidar dos seus pacientes e transformar sorrisos.
            </p>
            
            <div className="space-y-4">
              {[
                'Interface desenhada para reduzir o cansaço visual',
                'Fluxos de trabalho otimizados para velocidade',
                'Suporte que entende do seu negócio',
                'Atualizações constantes baseadas no seu feedback'
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>

            <Button className="btn-premium bg-blue-500 text-white hover:bg-blue-600 border-none shadow-lg shadow-blue-500/20 text-lg px-8 h-12 rounded-full mt-4">
              Conheça nossa filosofia
            </Button>
          </div>

          <div className="relative reveal-up">
             <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
               {/* Abstract representation of "Peace" or "Organization" */}
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-overlay" />
               <div className="absolute inset-0 flex items-center justify-center p-8">
                 <div className="w-full max-w-md text-center">
                   <h3 className="text-2xl font-medium text-white/90 mb-2">Simplicidade Radical</h3>
                   <p className="text-white/60 mb-8">Menos cliques. Mais resultados.</p>

                   <div className="group relative">
                     <div className="absolute left-8 right-8 top-7 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                     <div className="absolute left-8 right-8 top-7 h-px bg-gradient-to-r from-blue-500/10 via-purple-500/25 to-blue-500/10 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

                     <div className="grid grid-cols-3 gap-4">
                       <div className="relative">
                         <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg shadow-blue-500/10 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-white/20">
                           <UserRound className="h-6 w-6 text-blue-300" />
                         </div>
                         <div className="mt-3 text-sm font-semibold text-white/90">Paciente</div>
                       </div>

                       <div className="relative">
                         <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 backdrop-blur-sm shadow-lg shadow-blue-500/15 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-blue-500/35">
                           <CalendarCheck2 className="h-6 w-6 text-blue-200" />
                         </div>
                         <div className="mt-3 text-sm font-semibold text-white/90">Agenda</div>
                       </div>

                       <div className="relative">
                         <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg shadow-purple-500/10 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-white/20">
                           <ClipboardCheck className="h-6 w-6 text-purple-200" />
                         </div>
                         <div className="mt-3 text-sm font-semibold text-white/90">Concluído</div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             
             {/* Decorative element */}
             <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl -z-10 opacity-50 blur-xl" />
             <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full -z-10 opacity-50 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
