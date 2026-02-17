'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Bell, Building, Database, DollarSign, LayoutGrid, Shield, Sparkles, User, Users as UsersIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfiguracoesPage() {
  const essentials = [
    {
      title: 'Perfil do Usuário',
      description: 'Dados pessoais, assinatura e preferências de acesso',
      href: '/configuracoes/perfil',
      icon: User,
      tone: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-100',
    },
    {
      title: 'Dados da Clínica',
      description: 'Identidade, documentos fiscais e canais de contato',
      href: '/configuracoes/clinica',
      icon: Building,
      tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
    },
    {
      title: 'Financeiro',
      description: 'Categorias, contas bancárias e métodos de pagamento',
      href: '/configuracoes/financeiro',
      icon: DollarSign,
      tone: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-100',
    },
  ]

  const operations = [
    {
      title: 'Equipe e permissões',
      description: 'Perfis de acesso, convites e papéis da equipe',
      href: '/configuracoes/equipe',
      icon: UsersIcon,
      tone: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100',
    },
    {
      title: 'Multi-clínicas',
      description: 'Redes, filiais e governança centralizada',
      href: '/configuracoes/multi-clinicas',
      icon: LayoutGrid,
      tone: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
    },
    {
      title: 'Procedimentos',
      description: 'Tabela de procedimentos, códigos e valores',
      href: '/configuracoes/procedimentos',
      icon: Sparkles,
      tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
      disabled: true,
    },
    {
      title: 'Notificações',
      description: 'Alertas automáticos, lembretes e canais',
      href: '/configuracoes/notificacoes',
      icon: Bell,
      tone: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-100',
      disabled: true,
    },
    {
      title: 'Segurança',
      description: 'Autenticação, sessões e dispositivos confiáveis',
      href: '/configuracoes/seguranca',
      icon: Shield,
      tone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100',
      disabled: true,
    },
    {
      title: 'Backup e Dados',
      description: 'Exportações, retenção e políticas de backup',
      href: '/configuracoes/backup',
      icon: Database,
      tone: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-100',
      disabled: true,
    },
  ]

  const health = [
    { label: 'Usuários ativos', value: '8', hint: 'em toda a rede', tone: 'text-emerald-600 dark:text-emerald-300' },
    { label: 'Procedimentos cadastrados', value: '24', hint: 'tabela atualizada', tone: 'text-sky-600 dark:text-sky-300' },
    { label: 'Formas de pagamento', value: '6', hint: 'cartões, pix, boletos', tone: 'text-amber-600 dark:text-amber-300' },
    { label: 'Backup automático', value: 'Ativo', hint: 'última execução há 12h', tone: 'text-teal-600 dark:text-teal-300' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="flex items-center gap-2">
            <Link href="/home">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Essenciais</h2>
                <p className="text-sm text-muted-foreground">Primeiras configurações para deixar sua clínica pronta.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {essentials.map((section, index) => (
                <Link key={index} href={section.href}>
                  <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="flex flex-row items-start gap-3">
                      <div className={`rounded-lg p-2 ${section.tone}`}>
                        <section.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Operação e governança</h2>
                <p className="text-sm text-muted-foreground">Controle fino de rede, equipe e comunicações.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {operations.map((section, index) => {
                const cardBody = (
                  <Card
                    className={`h-full transition-all ${
                      section.disabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <CardHeader className="flex flex-row items-start gap-3">
                      <div className={`rounded-lg p-2 ${section.tone}`}>
                        <section.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {section.title}
                          {section.disabled && <Badge variant="outline">Em breve</Badge>}
                        </CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                      {!section.disabled && <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />}
                    </CardHeader>
                  </Card>
                )

                if (section.disabled) {
                  return (
                    <div key={index} className="h-full">
                      {cardBody}
                    </div>
                  )
                }

                return (
                  <Link key={index} href={section.href}>
                    {cardBody}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
