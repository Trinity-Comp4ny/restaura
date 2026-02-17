/* eslint-disable */
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const steps = [
  {
    id: 'categorias',
    title: 'Definir categorias',
    description: 'Crie categorias de receita e despesa para organizar lançamentos.',
    href: '/configuracoes/financeiro/categorias',
    instructions: [
      'Na página, clique no botão “Nova Categoria”.',
      'Escolha o tipo (receita ou despesa) e informe nome.',
      'Escolha a cor, marque “Categoria padrão?” se quiser destacar, e salve.',
      'Crie pelo menos 1 categoria de receita e 1 de despesa para seguir.',
    ],
    targetSelector: '[data-onboarding="nova-categoria"]',
  },
  {
    id: 'contas',
    title: 'Adicionar contas bancárias',
    description: 'Cadastre as contas bancárias que vão receber e pagar.',
    href: '/configuracoes/financeiro/contas',
    instructions: [
      'Clique em “Nova conta”.',
      'Preencha Nome da Conta.',
      'Escolha Tipo de Conta (conta_corrente, poupanca ou caixa_fisico).',
      'Informe Banco, Agência e Conta; opcional: Saldo inicial.',
      'Marque “Definir como conta padrão?” se for a principal e salve.',
    ],
    targetSelector: '[data-onboarding="nova-conta"]',
  },
  {
    id: 'cartoes',
    title: 'Cadastrar cartões',
    description: 'Registre cartões vinculados às contas para conciliação de despesas.',
    href: '/configuracoes/financeiro/cartoes',
    instructions: [
      'Clique em “Novo cartão”.',
      'Selecione Tipo do Cartão (crédito ou débito).',
      'Escolha a Conta Bancária vinculada à fatura.',
      'Preencha Últimos 4 dígitos e Limite (R$) se for crédito.',
      'Informe Dia de Fechamento e Dia de Vencimento (para crédito).',
      'Marque se é Cartão corporativo e/ou Cartão padrão, depois salve.',
    ],
    targetSelector: '[data-onboarding="novo-cartao"]',
  },
  {
    id: 'metodos-cobranca',
    title: 'Configurar métodos de cobrança',
    description: 'Receber receitas: configure métodos de cobrança com taxas e prazo de depósito.',
    href: '/configuracoes/financeiro/metodos-cobranca',
    instructions: [
      'Clique em “Novo método”.',
      'Preencha Nome e Tipo (pix, cartao_credito, cartao_debito, dinheiro, transferencia, etc.).',
      'Informe Adquirente (se houver) e selecione Conta vinculada.',
      'Defina Taxa percentual, Taxa fixa e Prazo de depósito (dias).',
      'Opcional: marque como padrão. Salve.',
    ],
    targetSelector: '[data-onboarding="novo-metodo-cobranca"]',
  },
  {
    id: 'metodos-pagamento',
    title: 'Configurar métodos de pagamento',
    description: 'Pagar despesas: configure métodos de pagamento ligados a contas ou cartões.',
    href: '/configuracoes/financeiro/metodos-pagamento',
    instructions: [
      'Clique em “Novo método”.',
      'Escolha o Tipo (pix, transferencia, boleto, debito_automatico, cartao_credito/debito, dinheiro).',
      'Se for cartão, selecione o Cartão (a conta da fatura é vinculada automaticamente). Caso contrário, escolha a Conta vinculada.',
      'O Nome é preenchido automaticamente mas pode ser personalizado.',
      'Marque se é método padrão. Salve.',
    ],
    targetSelector: '[data-onboarding="novo-metodo-pagamento"]',
  },
  {
    id: 'lancamentos',
    title: 'Lançar primeira receita/despesa',
    description: 'Crie um lançamento com parcelas; o status é derivado quando pagar parcelas.',
    href: '/financeiro',
    instructions: [
      'Na página Financeiro, escolha a aba Receitas ou Despesas e clique em “Nova receita” ou “Nova despesa”.',
      'Para Receita: preencha Descrição, Categoria, Método de Cobrança, Valor Bruto, Data de Vencimento, Parcelas e Documento/Observações se aplicável.',
      'Para Despesa: preencha Descrição, Categoria, Método de Pagamento, Valor, Data de Vencimento, Parcelas e Observações.',
      'Salve. Depois marque parcelas como pagas; o status do lançamento muda automaticamente quando todas são pagas.',
    ],
    targetSelector: '[data-onboarding="novo-lancamento"]',
  },
]

type OnboardingState = {
  completed?: boolean
  completed_at?: string
  step?: number
}

type Props = {
  children: React.ReactNode
}

export function OnboardingGate({ children }: Props) {
  const { data: user } = useUser()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [saving, setSaving] = useState(false)

  const persistLocal = (data: Partial<OnboardingState>) => {
    if (typeof window === 'undefined') return
    const current = (JSON.parse(localStorage.getItem('onboarding_progress') || '{}') as OnboardingState) || {}
    const next = { ...current, ...data }
    localStorage.setItem('onboarding_progress', JSON.stringify(next))
  }

  const highlightCurrent = () => {
    const selector = steps[stepIndex]?.targetSelector
    if (!selector) return
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) return
    el.classList.add('onboarding-highlight')
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Detect first access / unfinished onboarding
  useEffect(() => {
    const stored = (typeof window !== 'undefined'
      ? (JSON.parse(localStorage.getItem('onboarding_progress') || '{}') as OnboardingState)
      : {}) || {}
    const isCompleted = stored.completed
    if (!isCompleted) {
      setOpen(true)
      setStepIndex(stored.step && stored.step < steps.length ? stored.step : 0)
    }
  }, [user])

  // Spotlight target for current step
  useEffect(() => {
    const timeout = setTimeout(() => {
      highlightCurrent()
    }, 120)
    return () => {
      clearTimeout(timeout)
      const selector = steps[stepIndex]?.targetSelector
      if (!selector) return
      const el = document.querySelector(selector) as HTMLElement | null
      if (!el) return
      el.classList.remove('onboarding-highlight')
    }
  }, [stepIndex])

  // Apply highlight when onboarding opens (first render of step 1)
  useEffect(() => {
    if (!open) return
    const timeout = setTimeout(() => {
      highlightCurrent()
    }, 120)
    return () => clearTimeout(timeout)
  }, [open])

  const handlePersist = async () => {
    // Persistência desativada por solicitação: manter apenas estado local
    setSaving(false)
  }

  const handleNext = async () => {
    const nextStep = Math.min(stepIndex + 1, steps.length - 1)
    setStepIndex(nextStep)
    persistLocal({ step: nextStep })
    await handlePersist()
  }

  const handlePrev = () => setStepIndex((idx) => Math.max(idx - 1, 0))

  const handleSkip = async () => {
    setOpen(false)
    persistLocal({ completed: true, completed_at: new Date().toISOString(), step: stepIndex })
    await handlePersist()
  }

  const handleFinish = async () => {
    setOpen(false)
    persistLocal({ completed: true, completed_at: new Date().toISOString(), step: steps.length - 1 })
    await handlePersist()
  }

  if (!open) return <>{children}</>

  const current = steps[stepIndex]

  return (
    <div className="relative">
      {children}

      {/* Panel */}
      <div className="fixed right-4 bottom-4 left-auto z-[60] w-[420px] max-w-[90vw] md:right-6 md:bottom-6 md:w-[520px]">
        <Card className="shadow-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Badge variant="secondary">Onboarding</Badge>
                <CardTitle className="text-lg">Passo {stepIndex + 1} de {steps.length}</CardTitle>
                {stepIndex === 0 && <p className="text-sm text-muted-foreground">Bem-vindo! Vamos guiar você pelo setup inicial.</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={handleSkip} disabled={saving}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-base font-semibold leading-tight">{current.title}</p>
              <p className="text-sm text-muted-foreground leading-snug">{current.description}</p>
            </div>
            <Button
              variant="link"
              className="px-0 text-primary"
              onClick={() => {
                persistLocal({ step: stepIndex })
                router.push(current.href)
              }}
            >
              Ir para página
            </Button>
            <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground space-y-1">
              {current.instructions?.map((line, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-primary font-semibold">{idx + 1}.</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {steps.map((step, idx) => (
                <span
                  key={step.id}
                  className={`h-1.5 w-8 rounded-full transition ${idx <= stepIndex ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={stepIndex === 0 || saving}>
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              {stepIndex < steps.length - 1 ? (
                <Button size="sm" onClick={handleNext} disabled={saving}>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleFinish} disabled={saving}>
                  Concluir
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 50 !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.5), 0 0 0 8px rgba(37, 99, 235, 0.2);
          border-radius: 12px;
          animation: onboardingPulse 1.4s ease-in-out infinite;
        }
        @keyframes onboardingPulse {
          0% { box-shadow: 0 0 0 3px rgba(37,99,235,0.55), 0 0 0 8px rgba(37,99,235,0.18); }
          50% { box-shadow: 0 0 0 5px rgba(37,99,235,0.65), 0 0 0 12px rgba(37,99,235,0.24); }
          100% { box-shadow: 0 0 0 3px rgba(37,99,235,0.55), 0 0 0 8px rgba(37,99,235,0.18); }
        }
      `}</style>
    </div>
  )
}
