'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error || 'Não foi possível enviar o link. Tente novamente.')
        return
      }

      toast.success('Enviamos um link de recuperação para o seu e-mail.')
    } catch {
      toast.error('Não foi possível enviar o link. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <Card className="rounded-2xl border border-white/10 bg-slate-800/40 backdrop-blur-xl shadow-2xl overflow-hidden">
      <CardHeader className="space-y-2 border-b border-white/10 bg-slate-900/40">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight text-white">Recuperar acesso</CardTitle>
          <CardDescription className="text-slate-300">
            Informe seu e-mail. Você vai receber um link para definir uma nova senha.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={isLoading}
              error={!!errors.email}
              className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full h-12 rounded-full bg-blue-500 hover:bg-blue-600 border-none text-white shadow-lg shadow-blue-500/20 font-medium" isLoading={isLoading}>
            Enviar link
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-6 border-t border-white/10">
        <p className="text-sm text-slate-400">
          Lembrou da senha?{' '}
          <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
            Voltar para login
          </Link>
        </p>
      </CardFooter>
    </Card>
    </div>
  )
}
