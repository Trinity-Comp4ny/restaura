'use client'

import Link from 'next/link'
import { useState, type MouseEvent } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const NAV_LINKS = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Sobre', href: '#sobre' },
]

export function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  function scrollToTop(e: MouseEvent) {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-[100] bg-blue-500 text-white text-[10px] sm:text-xs py-2 border-b border-white/10 shadow-sm">
        <div className="container-premium flex justify-end">
          <span className="opacity-80 font-light tracking-wide">Impulsionado por </span>
          <a
            href="https://trnty.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:text-blue-300 transition-colors ml-1"
          >
            Trinity Company
          </a>
        </div>
      </div>

      <header className="fixed top-[32px] inset-x-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 py-4 shadow-sm transition-all duration-300 text-white">
        <div className="container-premium flex items-center justify-between">
          <Link href="#" onClick={scrollToTop} className="flex items-center space-x-2 group">
            <div className="relative h-9 w-9 overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
              <Image src="/logos/logo.svg" alt="Restaura" className="h-7 w-7" width={28} height={28} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Restaura</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-normal text-slate-200/80 transition-all duration-300 hover:text-blue-300 hover:-translate-y-0.5"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login">
              <Button className="px-6 py-2.5 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 duration-200 font-medium text-xs bg-blue-500 hover:bg-blue-600 border-none text-white">
                Acessar Sistema
              </Button>
            </Link>
          </nav>

          <button
            type="button"
            className="md:hidden p-2 text-slate-200/80"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/90 backdrop-blur-xl">
            <div className="container-premium py-6 flex flex-col gap-4 text-center">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-slate-200/80"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/login" onClick={() => setIsMobileOpen(false)} className="text-lg font-medium text-blue-300">
                Entrar
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
