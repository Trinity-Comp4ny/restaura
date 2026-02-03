import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'

const FOOTER_LINKS = {
  produto: [
    { label: 'Recursos', href: '#features' },
    { label: 'Integrações', href: '#' },
    { label: 'Atualizações', href: '#' },
  ],
  empresa: [
    { label: 'Sobre Nós', href: '#' },
    { label: 'Carreiras', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contato', href: '#' },
  ],
  legal: [
    { label: 'Termos de Uso', href: '#' },
    { label: 'Privacidade', href: '#' },
    { label: 'LGPD', href: '#' },
    { label: 'Cookies', href: '#' },
  ]
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-white/5">
      <div className="container-premium">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group mb-6">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                <img src="/logos/logo.svg" alt="Restaura" className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">Restaura</span>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-8 max-w-sm font-light">
              Transformando a gestão de clínicas odontológicas com tecnologia, design e paixão. 
              Simplifique seu dia a dia e foque no que importa.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/60 hover:text-white transition-all hover:scale-110 duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-all hover:scale-110 duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-all hover:scale-110 duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-all hover:scale-110 duration-300">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-sm font-semibold mb-6 tracking-wider text-white">Produto</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.produto.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-primary-foreground transition-colors text-sm font-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-6 tracking-wider text-white">Empresa</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.empresa.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-primary-foreground transition-colors text-sm font-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-6 tracking-wider text-white">Legal</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-primary-foreground transition-colors text-sm font-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-light">
            © {new Date().getFullYear()} Restaura Tecnologia Ltda. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-light">
            <span>Impulsionado por</span>
            <a
              href="https://trnty.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-primary-foreground transition-colors font-medium"
            >
              Trinity Company
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
