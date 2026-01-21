import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'

const FOOTER_LINKS = {
  produto: [
    { label: 'Recursos', href: '#features' },
    { label: 'Preços', href: '#pricing' },
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
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="container-premium">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">R</div>
              <span className="text-xl font-bold text-slate-900">Restaura</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm">
              Transformando a gestão de clínicas odontológicas com tecnologia, design e paixão. 
              Simplifique seu dia a dia e foque no que importa.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-6">Produto</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.produto.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-6">Empresa</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.empresa.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-6">Legal</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Restaura Tecnologia Ltda. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Todos os sistemas operacionais
          </div>
        </div>
      </div>
    </footer>
  )
}
