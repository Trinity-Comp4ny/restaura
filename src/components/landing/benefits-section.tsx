import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmotionalSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-900 text-white">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>
      
      <div className="container-premium relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Recupere a <span className="text-blue-400">paixão</span> pela odontologia
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

          <div className="relative">
             <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
               {/* Abstract representation of "Peace" or "Organization" */}
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-overlay" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-center p-8">
                   <h3 className="text-2xl font-medium text-white/90 mb-2">Simplicidade Radical</h3>
                   <p className="text-white/60">Menos cliques. Mais resultados.</p>
                 </div>
               </div>
               
               {/* Floating elements animation */}
               <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-blue-500/30 rounded-full blur-2xl animate-pulse" />
               <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl animate-pulse delay-1000" />
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
