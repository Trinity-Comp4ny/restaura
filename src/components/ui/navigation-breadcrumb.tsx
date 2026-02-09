'use client'

import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface BreadcrumbProps {
  items: Array<{
    label: string
    href: string
  }>
  current?: string
}

export function NavigationBreadcrumb({ items, current }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link
        href="/configuracoes"
        className={cn(
          "hover:text-foreground transition-colors",
          current === "configuracoes" && "text-foreground"
        )}
      >
        <Home className="h-4 w-4" />
        <span>Configurações</span>
      </Link>
      
      {items.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "hover:text-foreground transition-colors",
            current === item.href && "text-foreground"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export function BackButton({ href, label = "Voltar" }: { href?: string; label?: string }) {
  return (
    <Button variant="outline" asChild>
      <Link href={href || "/configuracoes"}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}
