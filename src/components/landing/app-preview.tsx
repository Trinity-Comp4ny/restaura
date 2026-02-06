 'use client'

import { useMemo, useState } from 'react'
import {
  BarChart3,
  Calendar,
  DollarSign,
  LayoutDashboard,
  Package,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type StatCardProps = {
  title: string
  value: string
  trend: string
  trendVariant?: 'default' | 'success'
}

function StatCard({ title, value, trend, trendVariant = 'default' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <Badge variant={trendVariant === 'success' ? 'default' : 'secondary'} className="shrink-0 bg-slate-100 text-slate-700 border-slate-200">
          {trend}
        </Badge>
      </div>
    </div>
  )
}

type AppPage = 'dashboard' | 'pacientes' | 'agenda' | 'financeiro' | 'estoque' | 'leads'

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate text-slate-900">{title}</p>
        {subtitle ? <p className="mt-1 text-xs text-slate-600 truncate">{subtitle}</p> : null}
      </div>
      <Badge variant="secondary" className="shrink-0 bg-slate-100 text-slate-700 border-slate-200">
        Visual
      </Badge>
    </div>
  )
}

function DashboardPage() {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Consultas hoje" value="12" trend="+8%" trendVariant="success" />
        <StatCard title="Receita (mês)" value="R$ 48.320" trend="+12%" trendVariant="success" />
        <StatCard title="Faltas (7d)" value="3" trend="-2" trendVariant="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Agenda de hoje</p>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">Seg, 10:30</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { time: '09:00', name: 'Ana Lima', proc: 'Limpeza', status: 'Confirmada' },
              { time: '10:00', name: 'Bruno Souza', proc: 'Canal', status: 'Em atendimento' },
              { time: '11:30', name: 'Carla Mendes', proc: 'Avaliação', status: 'Aguardando' },
            ].map((row) => (
              <div
                key={row.time}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant="secondary" className="shrink-0 bg-slate-100 text-slate-700 border-slate-200">
                    {row.time}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate text-slate-900">{row.name}</p>
                    <p className="text-[11px] text-slate-600 truncate">{row.proc}</p>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 border-slate-200 text-slate-700">
                  {row.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Atalhos</p>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">Ações</Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Novo paciente', icon: Users },
              { label: 'Agendar', icon: Calendar },
              { label: 'Receber', icon: DollarSign },
              { label: 'Estoque', icon: Package },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3">
                <item.icon className="h-4 w-4 text-blue-600" />
                <p className="mt-2 text-xs font-medium text-slate-900">{item.label}</p>
                <p className="mt-1 text-[11px] text-slate-600">Rápido</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PacientesPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <PageHeader title="Pacientes" subtitle="Lista e histórico (apenas visual)" />
      <div className="mt-4 space-y-3">
        {[
          { name: 'Ana Lima', phone: '(11) 99999-1111', last: '15/01', status: 'Ativo' },
          { name: 'Bruno Souza', phone: '(11) 99999-2222', last: '02/01', status: 'Ativo' },
          { name: 'Carla Mendes', phone: '(11) 99999-3333', last: '28/12', status: 'Em retorno' },
          { name: 'Diego Rocha', phone: '(11) 99999-4444', last: '20/12', status: 'Inativo' },
        ].map((p) => (
          <div
            key={p.phone}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium truncate text-slate-900">{p.name}</p>
              <p className="text-[11px] text-slate-600 truncate">{p.phone}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">Última: {p.last}</Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-700">
                {p.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgendaPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <PageHeader title="Agenda" subtitle="Visão diária (apenas visual)" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { time: '08:00', label: 'Bloqueio', meta: 'Reunião' },
            { time: '09:00', label: 'Ana Lima', meta: 'Limpeza' },
            { time: '10:00', label: 'Bruno Souza', meta: 'Canal' },
            { time: '11:30', label: 'Carla Mendes', meta: 'Avaliação' },
            { time: '14:00', label: 'Encaixe', meta: 'Urgência' },
            { time: '16:00', label: 'Retorno', meta: 'Orçamento' },
          ].map((slot) => (
            <div key={slot.time} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">{slot.time}</Badge>
                <Badge variant="outline" className="border-slate-200 text-slate-700">
                  {slot.meta}
                </Badge>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-900 truncate">{slot.label}</p>
              <div className="mt-3 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full w-2/3 bg-blue-500/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <PageHeader title="Resumo" subtitle="Indicadores do dia" />
        <div className="mt-4 grid gap-3">
          <StatCard title="Confirmadas" value="9" trend="+2" trendVariant="success" />
          <StatCard title="Aguardando" value="2" trend="0" trendVariant="default" />
          <StatCard title="Encaixes" value="1" trend="+1" trendVariant="success" />
        </div>
      </div>
    </div>
  )
}

function FinanceiroPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <PageHeader title="Financeiro" subtitle="Fluxo e recebimentos (apenas visual)" />
        <div className="mt-4 grid gap-3">
          <StatCard title="Entradas (mês)" value="R$ 58.200" trend="+10%" trendVariant="success" />
          <StatCard title="Saídas (mês)" value="R$ 14.880" trend="-3%" trendVariant="default" />
          <StatCard title="A receber" value="R$ 6.430" trend="+R$ 980" trendVariant="success" />
        </div>
      </div>
      <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <PageHeader title="Últimas transações" subtitle="Resumo de lançamentos" />
        <div className="mt-4 space-y-3">
          {[
            { label: 'Consulta - Ana Lima', amount: '+ R$ 180', tag: 'Cartão' },
            { label: 'Material - Fornecedor', amount: '- R$ 920', tag: 'Boleto' },
            { label: 'Retorno - Bruno Souza', amount: '+ R$ 120', tag: 'Pix' },
            { label: 'Aluguel', amount: '- R$ 2.400', tag: 'Recorrente' },
          ].map((t, idx) => (
            <div
              key={`${t.label}-${idx}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium truncate text-slate-900">{t.label}</p>
                <p className="text-[11px] text-slate-600 truncate">{t.tag}</p>
              </div>
              <Badge
                variant="outline"
                className={
                  t.amount.trim().startsWith('+')
                    ? 'border-emerald-500/40 text-emerald-700'
                    : 'border-rose-500/40 text-rose-700'
                }
              >
                {t.amount}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EstoquePage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <PageHeader title="Estoque" subtitle="Itens e alertas (apenas visual)" />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { name: 'Luvas P', level: 'Baixo', qty: '12 cx' },
          { name: 'Resina A2', level: 'Ok', qty: '6 un' },
          { name: 'Anestésico', level: 'Crítico', qty: '1 cx' },
          { name: 'Fio dental', level: 'Ok', qty: '24 un' },
          { name: 'Brocas', level: 'Baixo', qty: '3 kits' },
          { name: 'Máscaras', level: 'Ok', qty: '10 cx' },
        ].map((i) => (
          <div key={i.name} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-900 truncate">{i.name}</p>
              <Badge
                variant="outline"
                className={
                  i.level === 'Crítico'
                    ? 'border-rose-500/40 text-rose-700'
                    : i.level === 'Baixo'
                      ? 'border-amber-500/40 text-amber-700'
                      : 'border-slate-200 text-slate-700'
                }
              >
                {i.level}
              </Badge>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 truncate">Em mãos: {i.qty}</p>
            <div className="mt-3 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={
                  i.level === 'Crítico'
                    ? 'h-full w-1/6 bg-rose-500/70'
                    : i.level === 'Baixo'
                      ? 'h-full w-1/3 bg-amber-500/70'
                      : 'h-full w-4/5 bg-emerald-500/60'
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LeadsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <PageHeader title="Leads" subtitle="Pipeline (apenas visual)" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              title: 'Novo',
              items: ['Marina (Clareamento)', 'Lucas (Avaliação)'],
            },
            {
              title: 'Em contato',
              items: ['João (Implante)', 'Paula (Orçamento)'],
            },
            {
              title: 'Agendado',
              items: ['Rafaela (Retorno)'],
            },
          ].map((col) => (
            <div key={col.title} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-900">{col.title}</p>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">{col.items.length}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {col.items.map((it) => (
                  <div key={it} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2">
                    <p className="text-[11px] text-slate-700 truncate">{it}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <PageHeader title="Indicadores" subtitle="Conversão e ROI" />
        <div className="mt-4 grid gap-3">
          <StatCard title="Leads (30d)" value="84" trend="+14" trendVariant="success" />
          <StatCard title="Conversão" value="18%" trend="+2pp" trendVariant="success" />
          <StatCard title="Custo/Lead" value="R$ 9,40" trend="-R$ 0,80" trendVariant="default" />
        </div>
      </div>
    </div>
  )
}

export function AppPreview({ className }: { className?: string }) {
  const menuItems = useMemo(
    () =>
      [
        { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pacientes' as const, label: 'Pacientes', icon: Users },
        { id: 'agenda' as const, label: 'Agenda', icon: Calendar },
        { id: 'financeiro' as const, label: 'Financeiro', icon: DollarSign },
        { id: 'estoque' as const, label: 'Estoque', icon: Package },
        { id: 'leads' as const, label: 'Leads', icon: TrendingUp },
      ] satisfies Array<{ id: AppPage; label: string; icon: React.ComponentType<{ className?: string }> }>,
    []
  )

  const [activePage, setActivePage] = useState<AppPage>('dashboard')

  const activeLabel = menuItems.find((i) => i.id === activePage)?.label ?? 'Dashboard'

  return (
    <div
      className={cn(
        'relative rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden',
        className
      )}
      aria-label="Prévia da interface do sistema"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-overlay" />

      <div className="relative flex h-full w-full">
        {/* Sidebar replica */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/10 bg-slate-950/40">
          <div className="flex h-14 items-center gap-2 px-4">
            <div className="h-8 w-8 overflow-hidden flex items-center justify-center">
              <img src="/logos/logo.svg" alt="Restaura" className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Restaura</span>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left',
                  activePage === item.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-white/80 hover:bg-white/5'
                )}
                aria-current={activePage === item.id ? 'page' : undefined}
              >
                <item.icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-blue-500/30" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">Dr. Silva</p>
                <p className="text-[11px] text-white/60 truncate">Premium</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main replica */}
        <div className="flex min-w-0 flex-1 flex-col min-h-0">
          <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-slate-950/20 px-4">
            <div className="flex items-center gap-3">
              <div className="md:hidden text-xs font-semibold text-white">{activeLabel}</div>
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <Search className="h-4 w-4 text-white/60" />
                <span className="text-xs text-white/60">Buscar paciente, consulta...</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-lg border border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-muted/10 p-4">
            {activePage === 'dashboard' ? <DashboardPage /> : null}
            {activePage === 'pacientes' ? <PacientesPage /> : null}
            {activePage === 'agenda' ? <AgendaPage /> : null}
            {activePage === 'financeiro' ? <FinanceiroPage /> : null}
            {activePage === 'estoque' ? <EstoquePage /> : null}
            {activePage === 'leads' ? <LeadsPage /> : null}
          </div>

          <div className="md:hidden border-t border-white/10 bg-slate-950/20 px-2 py-2">
            <div className="grid grid-cols-6 gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[10px] font-medium transition-colors',
                    activePage === item.id ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/5'
                  )}
                  aria-current={activePage === item.id ? 'page' : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="truncate max-w-[60px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
    </div>
  )
}
