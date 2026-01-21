import { Building2 } from 'lucide-react'

const PARTNERS = [
  'OdontoCare',
  'Sorriso Perfeito',
  'Dental Spa',
  'OrtoCenter',
  'ImplanteTech',
  'Clinica Vital'
]

export function SocialProof() {
  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="container-premium flex flex-col items-center gap-8 text-center">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Confiado por mais de 2.000 clínicas em todo o Brasil
        </p>
        
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
          {PARTNERS.map((partner) => (
            <div key={partner} className="flex items-center justify-center gap-2">
              <Building2 className="h-6 w-6" />
              <span className="font-semibold text-lg">{partner}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
