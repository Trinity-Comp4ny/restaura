import Link from 'next/link'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { label: 'Recursos', href: '#features' },
  { label: 'Depoimentos', href: '#testimonials' },
  { label: 'Preços', href: '#pricing' },
  { label: 'Contato', href: '#contact' },
]

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        <div className="relative rounded-full border border-white/20 bg-white/70 backdrop-blur-xl shadow-premium px-4 py-3 sm:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-primary flex items-center justify-center text-white">
                 {/* Simple Logo Placeholder until SVG loads */}
                 <span className="font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Restaura</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastrar">
                <Button className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-6">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
