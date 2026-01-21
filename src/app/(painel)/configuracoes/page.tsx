'use client'

import Link from 'next/link'
import { User, Building, Users as UsersIcon, Calendar, CreditCard, Bell, Shield, Database } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ConfiguracoesPage() {
  const configuracoesSections = [
    {
      title: 'Perfil do Usuário',
      description: 'Gerencie suas informações pessoais e preferências',
      href: '/configuracoes/perfil',
      icon: User,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Dados da Clínica',
      description: 'Atualize informações da clínica e configurações gerais',
      href: '/configuracoes/clinica',
      icon: Building,
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Multi-clínicas',
      description: 'Gerencie múltiplas clínicas da rede',
      href: '/configuracoes/multi-clinicas',
      icon: Building,
      color: 'bg-indigo-100 text-indigo-800',
    },
    {
      title: 'Equipe',
      description: 'Gerencie usuários e permissões da equipe',
      href: '/configuracoes/equipe',
      icon: UsersIcon,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'Procedimentos',
      description: 'Cadastre e gerencie procedimentos e valores',
      href: '/configuracoes/procedimentos',
      icon: Calendar,
      color: 'bg-orange-100 text-orange-800',
    },
    {
      title: 'Formas de Pagamento',
      description: 'Configure métodos de pagamento aceitos',
      href: '/configuracoes/pagamentos',
      icon: CreditCard,
      color: 'bg-pink-100 text-pink-800',
    },
    {
      title: 'Notificações',
      description: 'Configure alertas e lembretes automáticos',
      href: '/configuracoes/notificacoes',
      icon: Bell,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      title: 'Segurança',
      description: 'Gerencie senhas e autenticação',
      href: '/configuracoes/seguranca',
      icon: Shield,
      color: 'bg-red-100 text-red-800',
    },
    {
      title: 'Backup e Dados',
      description: 'Gerencie backup e exportação de dados',
      href: '/configuracoes/backup',
      icon: Database,
      color: 'bg-gray-100 text-gray-800',
    },
  ]

  const quickStats = [
    { label: 'Usuários Ativos', value: '8', change: '+2' },
    { label: 'Procedimentos', value: '24', change: '+4' },
    { label: 'Formas Pagamento', value: '6', change: '0' },
    { label: 'Backup Automático', value: 'Ativo', change: '' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema e da clínica.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                {stat.change && (
                  <Badge variant="outline" className="text-xs">
                    {stat.change}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {configuracoesSections.map((section, index) => (
          <Link key={index} href={section.href}>
            <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.color}`}>
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Rápidas</CardTitle>
          <CardDescription>
            Ações frequentes e atalhos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Modo Escuro</h4>
              <p className="text-sm text-muted-foreground">
                Alterne entre tema claro e escuro
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configurar
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Idioma</h4>
              <p className="text-sm text-muted-foreground">
                Português (Brasil)
              </p>
            </div>
            <Button variant="outline" size="sm">
              Alterar
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Fuso Horário</h4>
              <p className="text-sm text-muted-foreground">
                America/Sao_Paulo (UTC-3)
              </p>
            </div>
            <Button variant="outline" size="sm">
              Ajustar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Detalhes técnicos sobre a instalação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium">Versão do Sistema</h4>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div>
              <h4 className="font-medium">Última Atualização</h4>
              <p className="text-sm text-muted-foreground">15/01/2024</p>
            </div>
            <div>
              <h4 className="font-medium">Ambiente</h4>
              <p className="text-sm text-muted-foreground">Produção</p>
            </div>
            <div>
              <h4 className="font-medium">Licença</h4>
              <p className="text-sm text-muted-foreground">Profissional</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
